from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.health_check import HealthCheck
from app.models.monitor import Monitor
from app.models.user import User


router = APIRouter(
    prefix="/api/monitors",
    tags=["Health Checks"],
)


@router.get("/{monitor_id}/health")
def get_health_history(
    monitor_id: int,
    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    monitor = db.scalar(
        select(Monitor).where(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id,
        )
    )

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found",
        )

    total = db.scalar(
        select(func.count(HealthCheck.id))
        .where(HealthCheck.monitor_id == monitor_id)
    ) or 0

    health_checks = db.scalars(
        select(HealthCheck)
        .where(
            HealthCheck.monitor_id == monitor_id
        )
        .order_by(
            HealthCheck.checked_at.desc()
        )
        .limit(limit)
        .offset(offset)
    ).all()

    return {
        "items": health_checks,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/{monitor_id}/stats")
def get_monitor_stats(
    monitor_id: int,
    days: int = Query(
        default=30,
        ge=1,
        le=30,
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    monitor = db.scalar(
        select(Monitor).where(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id,
        )
    )

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found",
        )

    # Only calculate statistics for the requested period.
    since = datetime.utcnow() - timedelta(days=days)

    base_filter = (
        HealthCheck.monitor_id == monitor_id,
        HealthCheck.checked_at >= since,
    )

    # -----------------------------
    # TOTAL CHECKS
    # -----------------------------
    total_checks = db.scalar(
        select(func.count(HealthCheck.id))
        .where(*base_filter)
    ) or 0

    # -----------------------------
    # SUCCESSFUL CHECKS
    # -----------------------------
    successful_checks = db.scalar(
        select(func.count(HealthCheck.id))
        .where(
            *base_filter,
            HealthCheck.status == "UP",
        )
    ) or 0

    # -----------------------------
    # FAILED CHECKS
    # -----------------------------
    failed_checks = db.scalar(
        select(func.count(HealthCheck.id))
        .where(
            *base_filter,
            HealthCheck.status == "DOWN",
        )
    ) or 0

    # -----------------------------
    # DEGRADED CHECKS
    # -----------------------------
    degraded_checks = db.scalar(
        select(func.count(HealthCheck.id))
        .where(
            *base_filter,
            HealthCheck.status == "DEGRADED",
        )
    ) or 0

    # -----------------------------
    # RESPONSE TIME
    # -----------------------------
    average_response_time = db.scalar(
        select(func.avg(HealthCheck.response_time))
        .where(
            *base_filter,
            HealthCheck.response_time.is_not(None),
        )
    )

    max_response_time = db.scalar(
        select(func.max(HealthCheck.response_time))
        .where(
            *base_filter,
            HealthCheck.response_time.is_not(None),
        )
    )

    # -----------------------------
    # UPTIME
    # -----------------------------
    uptime_percentage = (
        (successful_checks / total_checks) * 100
        if total_checks > 0
        else 0
    )

    return {
        "monitor_id": monitor_id,
        "period_days": days,
        "uptime_percentage": round(
            uptime_percentage,
            2,
        ),
        "total_checks": total_checks,
        "successful_checks": successful_checks,
        "failed_checks": failed_checks,
        "degraded_checks": degraded_checks,
        "average_response_time": (
            round(
                float(average_response_time),
                2,
            )
            if average_response_time is not None
            else 0
        ),
        "max_response_time": max_response_time or 0,
    }