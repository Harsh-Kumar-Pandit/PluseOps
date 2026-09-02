from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    monitor_id: Mapped[int | None] = mapped_column(
        ForeignKey("monitors.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    incident_id: Mapped[int | None] = mapped_column(
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    email_status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING",
        nullable=False
    )

    email_sent_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    email_error: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    user = relationship("User", backref="notifications")
    monitor = relationship("Monitor")
    incident = relationship("Incident")
