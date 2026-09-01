from datetime import datetime
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
)

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

class Monitor(Base):
    __tablename__ = "monitors"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    url: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    method: Mapped[str] = mapped_column(
        String(10),
        default="GET",
        nullable=False
    )

    interval: Mapped[int] = mapped_column(
        Integer,
        default=60,
        nullable=False
    )

    timeout: Mapped[int] = mapped_column(
        Integer,
        default=10,
        nullable=False
    )

    expected_status: Mapped[int] = mapped_column(
        Integer,
        default=200,
        nullable=False
    )

    failure_threshold: Mapped[int] = mapped_column(
        Integer,
        default=2,
        nullable=False
    )

    consecutive_failures: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    consecutive_successes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    recovery_threshold: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=2
    )

    degraded_threshold: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=2000
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="PENDING",
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    last_checked_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="monitors"
    )

    health_checks = relationship(
        "HealthCheck",
        back_populates="monitor",
        cascade="all, delete-orphan"
    )

    incidents = relationship(
        "Incident",
        back_populates="monitor",
        cascade="all, delete-orphan"
    )

