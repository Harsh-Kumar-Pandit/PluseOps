import time
from datetime import datetime, timedelta

import httpx
from sqlalchemy import delete
from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.monitor import Monitor
from app.models.health_check import HealthCheck
from app.models.incident import Incident

RETENTION_DAYS = 31


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

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


@celery_app.task
def check_monitor(monitor_id: int):
    db = SessionLocal()

    try:
        monitor = db.get(Monitor, monitor_id)

        if not monitor:
            return f"Monitor {monitor_id} not found"

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
                    last_error = (
                        f"Server returned {response.status_code}"
                    )

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

        response_time = int(
            (time.perf_counter() - start_time) * 1000
        )

        # -----------------------------
        # DETERMINE CHECK RESULT
        # -----------------------------
        if response is not None:

            if response.status_code == monitor.expected_status:

                # Successful response
                monitor.consecutive_failures = 0
                monitor.consecutive_successes += 1

                # Slow but successful
                if response_time > monitor.degraded_threshold:
                    status = "DEGRADED"
                    error = (
                        f"Response time {response_time}ms "
                        f"exceeded threshold"
                    )
                    monitor.status = "DEGRADED"

                else:
                    status = "UP"
                    error = None

                    # Recovery logic
                    if monitor.status == "DOWN":

                        if (
                            monitor.consecutive_successes
                            >= monitor.recovery_threshold
                        ):
                            monitor.status = "UP"

                            incident = (
                                db.query(Incident)
                                .filter(
                                    Incident.monitor_id == monitor.id,
                                    Incident.status == "OPEN",
                                )
                                .order_by(
                                    Incident.started_at.desc()
                                )
                                .first()
                            )

                            if incident:
                                now = datetime.utcnow()

                                incident.status = "RESOLVED"
                                incident.resolved_at = now
                                incident.duration = int(
                                    (
                                        now
                                        - incident.started_at
                                    ).total_seconds()
                                )

                    elif monitor.status in ("PENDING", "DEGRADED"):
                        monitor.status = "UP"

            else:

                # Failed HTTP status
                status = "DOWN"

                error = (
                    f"Expected {monitor.expected_status}, "
                    f"got {response.status_code}"
                )

                monitor.consecutive_failures += 1
                monitor.consecutive_successes = 0

                if (
                    monitor.consecutive_failures
                    >= monitor.failure_threshold
                ):
                    monitor.status = "DOWN"

                    # Check whether an incident already exists
                    incident = (
                        db.query(Incident)
                        .filter(
                            Incident.monitor_id == monitor.id,
                            Incident.status == "OPEN",
                        )
                        .first()
                    )

                    # Create only one OPEN incident
                    if not incident:
                        incident = Incident(
                            monitor_id=monitor.id,
                            status="OPEN",
                            reason=error,
                            started_at=datetime.utcnow(),
                        )

                        db.add(incident)

        else:

            # Connection / timeout / request failure
            status = "DOWN"
            error = last_error or "Request failed"

            monitor.consecutive_failures += 1
            monitor.consecutive_successes = 0

            if (
                monitor.consecutive_failures
                >= monitor.failure_threshold
            ):
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
                    incident = Incident(
                        monitor_id=monitor.id,
                        status="OPEN",
                        reason=error[:500],
                        started_at=datetime.utcnow(),
                    )

                    db.add(incident)

        # -----------------------------
        # STORE HEALTH CHECK
        # -----------------------------
        health_check = HealthCheck(
            monitor_id=monitor.id,
            status=status,
            status_code=(
                response.status_code
                if response is not None
                else None
            ),
            response_time=response_time,
            error=error,
        )

        db.add(health_check)
        db.commit()

        return {
            "monitor_id": monitor.id,
            "status": health_check.status,
            "status_code": health_check.status_code,
            "response_time": health_check.response_time,
            "consecutive_failures": monitor.consecutive_failures,
            "consecutive_successes": monitor.consecutive_successes,
            "monitor_status": monitor.status,
        }

    finally:
        db.close()


@celery_app.task
def check_all_monitors():
    db = SessionLocal()

    try:
        monitors = (
            db.query(Monitor)
            .filter(Monitor.is_active == True)
            .all()
        )

        now = datetime.utcnow()

        for monitor in monitors:

            if monitor.last_checked_at is None:
                should_check = True

            else:
                next_check = (
                    monitor.last_checked_at
                    + timedelta(seconds=monitor.interval)
                )

                should_check = now >= next_check

            if should_check:
                monitor.last_checked_at = now
                check_monitor.delay(monitor.id)

        db.commit()

    finally:
        db.close()