from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String
)

from sqlalchemy.orm import (Mapped, mapped_column, relationship)

from app.core.database import Base

class Incident(Base):
    __tablename__ = "incidents"

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
        default="OPEN",
        nullable=False
    )

    reason: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    duration: Mapped[int | None] = mapped_column(
        nullable=True
    )

    monitor = relationship(
        "Monitor",
        back_populates="incidents"
    )