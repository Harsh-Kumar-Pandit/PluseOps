from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationListResponse, NotificationResponse
from app.schemas.auth import NotificationPreferencesResponse, UpdatePreferencesRequest, UserResponse

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)


@router.get("/preferences", response_model=NotificationPreferencesResponse)
def get_notification_preferences(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.patch("/preferences", response_model=UserResponse)
def update_notification_preferences(
    data: UpdatePreferencesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.email_notifications_enabled is not None:
        current_user.email_notifications_enabled = data.email_notifications_enabled
    if data.down_alerts_enabled is not None:
        current_user.down_alerts_enabled = data.down_alerts_enabled
    if data.recovery_alerts_enabled is not None:
        current_user.recovery_alerts_enabled = data.recovery_alerts_enabled

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("", response_model=NotificationListResponse)
@router.get("/", response_model=NotificationListResponse)
def get_notifications(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    unread_only: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if unread_only:
        query = query.filter(Notification.is_read == False)

    total = query.count()

    unread_count = (
        db.query(func.count(Notification.id))
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
        .scalar()
        or 0
    )

    items = (
        query.order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "items": items,
        "total": total,
        "unread_count": unread_count,
    }


@router.post("/read-all")
def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({"is_read": True}, synchronize_session=False)

    db.commit()
    return {"message": "All notifications marked as read"}


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    notification.is_read = True
    db.commit()
    db.refresh(notification)

    return notification


@router.delete("/clear-all")
def clear_all_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).delete(synchronize_session=False)

    db.commit()
    return {"message": "All notifications cleared"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    db.delete(notification)
    db.commit()

    return {"message": "Notification deleted", "id": notification_id}
