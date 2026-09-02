from datetime import datetime
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    monitor_id: int | None = None
    incident_id: int | None = None
    type: str
    title: str
    message: str
    is_read: bool
    email_status: str = "PENDING"
    email_sent_at: datetime | None = None
    email_error: str | None = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class NotificationListResponse(BaseModel):
    items: list[NotificationResponse]
    total: int
    unread_count: int
