from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.incident import Incident
from app.models.monitor import Monitor
from app.models.user import User


router = APIRouter(
    prefix="/api/incidents",
    tags=["Incidents"],
)


@router.get("/")
def get_incidents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    incidents = (
        db.query(Incident)
        .join(Monitor, Incident.monitor_id == Monitor.id)
        .filter(Monitor.user_id == current_user.id)
        .order_by(Incident.started_at.desc())
        .all()
    )

    return incidents


@router.get("/{incident_id}")
def get_incident(
    incident_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    incident = (
        db.query(Incident)
        .join(Monitor, Incident.monitor_id == Monitor.id)
        .filter(
            Incident.id == incident_id,
            Monitor.user_id == current_user.id,
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return incident