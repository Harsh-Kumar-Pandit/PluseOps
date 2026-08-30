from app.schemas.monitor import MonitorUpdate
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.monitor import Monitor
from app.models.user import User
from app.schemas.monitor import MonitorCreate, MonitorResponse


router = APIRouter(
    prefix="/api/monitors",
    tags=["Monitors"],
)


@router.post(
    "",
    response_model=MonitorResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_monitor(
    data: MonitorCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    monitor = Monitor(
        user_id=current_user.id,
        name=data.name,
        url=str(data.url),
        method=data.method,
        interval=data.interval,
        timeout=data.timeout,
        expected_status=data.expected_status,
        failure_threshold=data.failure_threshold
    )

    db.add(monitor)
    db.commit()
    db.refresh(monitor)

    return monitor


@router.get(
    "",
    response_model=list[MonitorResponse],
)
def get_monitors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    monitors = db.scalars(
        select(Monitor)
        .where(Monitor.user_id == current_user.id)
        .order_by(Monitor.created_at.desc())
    ).all()

    return monitors

@router.get(
    "/{monitor_id}",
    response_model=MonitorResponse,
)
def get_monitor(
    monitor_id: int,
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

    return monitor

@router.patch(
    "/{monitor_id}",
    response_model=MonitorResponse,
)
def update_monitor(
    monitor_id: int,
    data: MonitorUpdate,
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

    updates = data.model_dump(exclude_unset=True)

    if "url" in updates:
        updates["url"] = str(updates["url"])

    for field, value in updates.items():
        setattr(monitor, field, value)

    db.commit()
    db.refresh(monitor)

    return monitor

@router.delete(
    "/{monitor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_monitor(
    monitor_id: int,
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

    db.delete(monitor)
    db.commit()

@router.post(
    "/{monitor_id}/pause",
    response_model=MonitorResponse,
)
def pause_monitor(
    monitor_id: int,
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

    monitor.is_active = False
    monitor.status = "PAUSED"

    db.commit()
    db.refresh(monitor)

    return monitor

@router.post(
    "/{monitor_id}/resume",
    response_model=MonitorResponse,
)
def resume_monitor(
    monitor_id: int,
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

    monitor.is_active = True
    monitor.status = "PENDING"

    db.commit()
    db.refresh(monitor)

    return monitor