import logging
import os
import time
import uuid
from datetime import datetime, timedelta

import httpx
import redis
from sqlalchemy import delete
from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.health_check import HealthCheck
from app.models.incident import Incident
from app.models.monitor import Monitor
from app.models.notification import Notification

logger = logging.getLogger(__name__)
RETENTION_DAYS = 31

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")


def get_redis_client():
    try:
        r = redis.Redis.from_url(REDIS_URL)
        r.ping()
        return r
    except Exception as e:
        logger.warning(f"Could not connect to Redis at {REDIS_URL}: {e}")
        return None


@celery_app.task
def cleanup_old_health_checks():
    cutoff = datetime.utcnow() - timedelta(days=RETENTION_DAYS)
    db = SessionLocal()

    try:
        result = db.execute(
            delete(HealthCheck).where(
                HealthCheck.checked_at < cutoff
            )
        )
        deleted_count = result.rowcount or 0
        db.commit()

        return {
            "deleted_health_checks": deleted_count,
            "retention_days": RETENTION_DAYS,
            "cutoff": cutoff.isoformat(),
        }
    except Exception as exc:
        db.rollback()
        logger.error(f"Error in cleanup_old_health_checks: {exc}", exc_info=True)
        raise
    finally:
        db.close()


@celery_app.task
def check_monitor(monitor_id: int, lock_token: str | None = None):
    start_time_dt = datetime.utcnow()
    lock_key = f"pulseops:pending_check:{monitor_id}"
    redis_client = get_redis_client()

    logger.info(
        f"Starting check_monitor for monitor_id={monitor_id} "
        f"at {start_time_dt.isoformat()} (lock_token={lock_token})"
    )

    db = SessionLocal()

    try:
        monitor = db.get(Monitor, monitor_id)

        if not monitor:
            logger.warning(f"Check skipped for monitor_id={monitor_id}: monitor not found in DB.")
            return f"Monitor {monitor_id} not found"

        if not monitor.is_active or monitor.status == "PAUSED":
            logger.info(f"Check skipped for monitor_id={monitor_id}: monitor is inactive or paused.")
            return f"Monitor {monitor_id} is inactive or paused"

        start_time = time.perf_counter()

        max_attempts = 3
        retry_delay = 1

        response = None
        last_error = None

        # -----------------------------
        # REQUEST + RETRY
        # -----------------------------
        for attempt in range(max_attempts):
            try:
                response = httpx.request(
                    method=monitor.method,
                    url=monitor.url,
                    timeout=monitor.timeout,
                )

                if response.status_code >= 500:
                    last_error = f"Server returned {response.status_code}"
                    if attempt < max_attempts - 1:
                        time.sleep(retry_delay)
                        continue

                break

            except httpx.TimeoutException as exc:
                last_error = f"Timeout: {str(exc)}"
                if attempt < max_attempts - 1:
                    time.sleep(retry_delay)
                    continue
                break

            except httpx.ConnectError as exc:
                last_error = f"Connection error: {str(exc)}"
                if attempt < max_attempts - 1:
                    time.sleep(retry_delay)
                    continue
                break

            except httpx.RequestError as exc:
                last_error = f"Request error: {str(exc)}"
                if attempt < max_attempts - 1:
                    time.sleep(retry_delay)
                    continue
                break

        response_time = int((time.perf_counter() - start_time) * 1000)

        # -----------------------------
        # DETERMINE CHECK RESULT
        # -----------------------------
        if response is not None:
            if response.status_code == monitor.expected_status:
                monitor.consecutive_failures = 0
                monitor.consecutive_successes += 1

                if response_time > monitor.degraded_threshold:
                    status = "DEGRADED"
                    error = f"Response time {response_time}ms exceeded threshold"
                    monitor.status = "DEGRADED"
                else:
                    status = "UP"
                    error = None

                    if monitor.status == "DOWN":
                        if monitor.consecutive_successes >= monitor.recovery_threshold:
                            monitor.status = "UP"

                            incident = (
                                db.query(Incident)
                                .filter(
                                    Incident.monitor_id == monitor.id,
                                    Incident.status == "OPEN",
                                )
                                .order_by(Incident.started_at.desc())
                                .first()
                            )

                            if incident:
                                now = datetime.utcnow()
                                incident.status = "RESOLVED"
                                incident.resolved_at = now
                                incident.duration = int((now - incident.started_at).total_seconds())

                                notif = Notification(
                                    user_id=monitor.user_id,
                                    monitor_id=monitor.id,
                                    incident_id=incident.id,
                                    type="RECOVERY",
                                    title=f"Monitor Recovery: {monitor.name}",
                                    message=f"Monitor '{monitor.name}' recovered to UP after {incident.duration}s downtime.",
                                    created_at=now,
                                )
                                db.add(notif)
                                db.flush()
                                try:
                                    send_email_notification_task.delay(notif.id)
                                except Exception as e_task:
                                    logger.warning(f"Could not queue email task for Notification #{notif.id}: {e_task}")

                    elif monitor.status in ("PENDING", "DEGRADED"):
                        monitor.status = "UP"
            else:
                status = "DOWN"
                error = f"Expected {monitor.expected_status}, got {response.status_code}"
                monitor.consecutive_failures += 1
                monitor.consecutive_successes = 0

                if monitor.consecutive_failures >= monitor.failure_threshold:
                    monitor.status = "DOWN"
                    incident = (
                        db.query(Incident)
                        .filter(
                            Incident.monitor_id == monitor.id,
                            Incident.status == "OPEN",
                        )
                        .first()
                    )
                    if not incident:
                        now = datetime.utcnow()
                        incident = Incident(
                            monitor_id=monitor.id,
                            status="OPEN",
                            reason=error,
                            started_at=now,
                        )
                        db.add(incident)
                        db.flush()  # Flush to populate incident.id

                        notif = Notification(
                            user_id=monitor.user_id,
                            monitor_id=monitor.id,
                            incident_id=incident.id,
                            type="DOWN",
                            title=f"Monitor Failure: {monitor.name}",
                            message=f"Monitor '{monitor.name}' is DOWN. {error[:200]}",
                            created_at=now,
                        )
                        db.add(notif)
                        db.flush()
                        try:
                            send_email_notification_task.delay(notif.id)
                        except Exception as e_task:
                            logger.warning(f"Could not queue email task for Notification #{notif.id}: {e_task}")
        else:
            status = "DOWN"
            error = last_error or "Request failed"
            monitor.consecutive_failures += 1
            monitor.consecutive_successes = 0

            if monitor.consecutive_failures >= monitor.failure_threshold:
                monitor.status = "DOWN"
                incident = (
                    db.query(Incident)
                    .filter(
                        Incident.monitor_id == monitor.id,
                        Incident.status == "OPEN",
                    )
                    .first()
                )
                if not incident:
                    now = datetime.utcnow()
                    incident = Incident(
                        monitor_id=monitor.id,
                        status="OPEN",
                        reason=error[:500],
                        started_at=now,
                    )
                    db.add(incident)
                    db.flush()

                    notif = Notification(
                        user_id=monitor.user_id,
                        monitor_id=monitor.id,
                        incident_id=incident.id,
                        type="DOWN",
                        title=f"Monitor Failure: {monitor.name}",
                        message=f"Monitor '{monitor.name}' is DOWN. {error[:200]}",
                        created_at=now,
                    )
                    db.add(notif)
                    db.flush()
                    try:
                        send_email_notification_task.delay(notif.id)
                    except Exception as e_task:
                        logger.warning(f"Could not queue email task for Notification #{notif.id}: {e_task}")

        # -----------------------------
        # STORE HEALTH CHECK & UPDATE LAST_CHECKED_AT
        # -----------------------------
        now_check_time = datetime.utcnow()
        health_check = HealthCheck(
            monitor_id=monitor.id,
            status=status,
            status_code=response.status_code if response is not None else None,
            response_time=response_time,
            error=error,
            checked_at=now_check_time,
        )

        db.add(health_check)
        # Update last_checked_at only AFTER actual HTTP check completed!
        monitor.last_checked_at = now_check_time

        db.commit()

        end_time_dt = datetime.utcnow()
        logger.info(
            f"Finished check_monitor for monitor_id={monitor.id} | "
            f"status={status} | status_code={health_check.status_code} | "
            f"latency={response_time}ms | started_at={start_time_dt.isoformat()} | "
            f"completed_at={end_time_dt.isoformat()}"
        )

        return {
            "monitor_id": monitor.id,
            "status": health_check.status,
            "status_code": health_check.status_code,
            "response_time": health_check.response_time,
            "consecutive_failures": monitor.consecutive_failures,
            "consecutive_successes": monitor.consecutive_successes,
            "monitor_status": monitor.status,
            "checked_at": now_check_time.isoformat(),
        }

    except Exception as exc:
        db.rollback()
        logger.error(f"Error executing check_monitor for monitor_id={monitor_id}: {exc}", exc_info=True)
        raise
    finally:
        db.close()
        # Safely release ONLY the lock owned by this specific task execution token
        if redis_client and lock_token:
            try:
                val = redis_client.get(lock_key)
                if val and val.decode("utf-8") == lock_token:
                    redis_client.delete(lock_key)
                    logger.debug(f"Released lock_key={lock_key} for lock_token={lock_token}")
            except Exception as r_err:
                logger.warning(f"Error releasing lock for monitor_id={monitor_id}: {r_err}")


@celery_app.task
def check_all_monitors():
    db = SessionLocal()
    now = datetime.utcnow()

    try:
        monitors = (
            db.query(Monitor)
            .filter(
                Monitor.is_active == True,
                Monitor.status != "PAUSED",
            )
            .all()
        )

        redis_client = get_redis_client()

        logger.debug(f"check_all_monitors running at {now.isoformat()} | active_monitors_count={len(monitors)}")

        for monitor in monitors:
            last_checked = monitor.last_checked_at
            interval = monitor.interval or 60

            if last_checked is None:
                should_check = True
                due_reason = "never checked before"
            else:
                next_check = last_checked + timedelta(seconds=interval)
                should_check = now >= next_check
                due_reason = f"due (last_completed={last_checked.isoformat()}, interval={interval}s)"

            if should_check:
                lock_key = f"pulseops:pending_check:{monitor.id}"
                lock_token = str(uuid.uuid4())

                if not redis_client:
                    logger.warning(
                        f"Skipping check scheduling for monitor_id={monitor.id}: "
                        f"Redis is unavailable to acquire lock."
                    )
                    continue

                try:
                    ttl_seconds = max(interval * 2, monitor.timeout * 3, 120)
                    acquired = redis_client.set(lock_key, lock_token, nx=True, ex=ttl_seconds)

                    if acquired:
                        check_monitor.delay(monitor.id, lock_token)
                        logger.info(
                            f"Scheduled task check_monitor for monitor_id={monitor.id} | "
                            f"interval={interval}s | last_completed_check={last_checked.isoformat() if last_checked else 'None'} | "
                            f"reason={due_reason}"
                        )
                    else:
                        logger.info(
                            f"Duplicate task prevented for monitor_id={monitor.id} | "
                            f"interval={interval}s | last_completed_check={last_checked.isoformat() if last_checked else 'None'} | "
                            f"reason=task already queued or in progress (Redis lock active)"
                        )
                except Exception as r_err:
                    logger.warning(
                        f"Redis error when trying to lock monitor_id={monitor.id}: {r_err}. "
                        f"Skipping task enqueue for this tick."
                    )
            else:
                next_expected = last_checked + timedelta(seconds=interval)
                logger.debug(
                    f"Monitor monitor_id={monitor.id} not due yet | "
                    f"interval={interval}s | last_completed_check={last_checked.isoformat()} | "
                    f"next_expected={next_expected.isoformat()}"
                )

    except Exception as exc:
        db.rollback()
        logger.error(f"Error in check_all_monitors: {exc}", exc_info=True)
        raise
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)
def send_email_notification_task(self, notification_id: int):
    """
    Celery task that sends an alert email asynchronously for a specific notification.
    Ensures idempotency: if email_status is already 'SENT', skips sending.
    """
    db = SessionLocal()
    try:
        notif = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notif:
            logger.warning(f"send_email_notification_task: Notification #{notification_id} not found.")
            return {"status": "not_found"}

        # Idempotency check: duplicate email protection
        if notif.email_status == "SENT":
            logger.info(f"send_email_notification_task: Email for Notification #{notification_id} already SENT. Skipping duplicate.")
            return {"status": "already_sent"}

        user = notif.user
        if not user or not user.email:
            notif.email_status = "SKIPPED"
            notif.email_error = "User email missing"
            db.commit()
            return {"status": "user_email_missing"}

        # Check user master notification preference
        if hasattr(user, "email_notifications_enabled") and not user.email_notifications_enabled:
            notif.email_status = "SKIPPED"
            notif.email_error = "Email notifications disabled by master user preference"
            db.commit()
            return {"status": "disabled_by_user"}

        # Check granular event alert preferences
        if notif.type == "DOWN" and hasattr(user, "down_alerts_enabled") and not user.down_alerts_enabled:
            notif.email_status = "SKIPPED"
            notif.email_error = "DOWN email alerts disabled by user preference"
            db.commit()
            return {"status": "down_alerts_disabled"}

        if notif.type == "RECOVERY" and hasattr(user, "recovery_alerts_enabled") and not user.recovery_alerts_enabled:
            notif.email_status = "SKIPPED"
            notif.email_error = "RECOVERY email alerts disabled by user preference"
            db.commit()
            return {"status": "recovery_alerts_disabled"}

        # Check SMTP configuration
        from app.services.email import (
            is_smtp_configured,
            send_notification_email,
            build_down_email,
            build_recovery_email,
        )

        if not is_smtp_configured():
            notif.email_status = "NOT_CONFIGURED"
            notif.email_error = "SMTP credentials missing in environment"
            db.commit()
            logger.info(f"send_email_notification_task: SMTP not configured. Marked Notification #{notification_id} as NOT_CONFIGURED.")
            return {"status": "smtp_not_configured"}

        monitor = notif.monitor
        incident = notif.incident

        monitor_name = monitor.name if monitor else "Unknown Monitor"
        monitor_url = monitor.url if monitor else "N/A"

        if notif.type == "DOWN":
            reason = incident.reason if incident else notif.message
            started_at = incident.started_at if incident else notif.created_at
            incident_id = incident.id if incident else "N/A"
            subject, text, html = build_down_email(
                monitor_name=monitor_name,
                monitor_url=monitor_url,
                reason=reason,
                incident_id=incident_id,
                started_at=started_at,
            )
        elif notif.type == "RECOVERY":
            incident_id = incident.id if incident else "N/A"
            started_at = incident.started_at if incident else notif.created_at
            resolved_at = incident.resolved_at if (incident and incident.resolved_at) else datetime.utcnow()
            duration = incident.duration if incident else None
            subject, text, html = build_recovery_email(
                monitor_name=monitor_name,
                monitor_url=monitor_url,
                incident_id=incident_id,
                started_at=started_at,
                resolved_at=resolved_at,
                duration_seconds=duration,
            )
        else:
            subject = f"[PulseOps] {notif.title}"
            text = f"{notif.title}\n\n{notif.message}"
            html = f"<h2>{notif.title}</h2><p>{notif.message}</p>"

        # Dispatch email
        res = send_notification_email(
            to_email=user.email,
            subject=subject,
            text_content=text,
            html_content=html,
        )

        if res["success"]:
            notif.email_status = "SENT"
            notif.email_sent_at = datetime.utcnow()
            notif.email_error = None
        else:
            notif.email_status = "FAILED"
            notif.email_error = res["error"]

        db.commit()
        return {"status": notif.email_status, "error": notif.email_error}

    except Exception as err:
        logger.error(f"Error in send_email_notification_task for Notification #{notification_id}: {err}")
        db.rollback()
        raise err
    finally:
        db.close()