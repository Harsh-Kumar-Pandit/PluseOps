from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class HealthCheck(Base):
    __tablename__ = "health_checks"

    __table_args__ = (
        Index(
            "ix_health_checks_monitor_checked_at",
            "monitor_id",
            "checked_at",
        ),
    )   

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    monitor_id: Mapped[int] = mapped_column(
        ForeignKey("monitors.id"),
        nullable=False,
        index=True
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    status_code: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    response_time: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    error: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    checked_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    monitor = relationship(
        "Monitor",
        back_populates="health_checks"
    )