from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.database import get_db
from backend.models import Incident, Device
from backend.schemas import IncidentRead, IncidentAcknowledge, IncidentResolve

router = APIRouter(prefix="/api/v1/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentRead])
async def list_incidents(
    status: Optional[str] = Query(None), # OPEN, ACKNOWLEDGED, RESOLVED
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Incident)
        .options(
            selectinload(Incident.device).selectinload(Device.building),
            selectinload(Incident.device).selectinload(Device.room)
        )
        .order_by(desc(Incident.started_at))
        .limit(limit)
    )
    if status:
        stmt = stmt.where(Incident.status == status)
        
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/{incident_id}/acknowledge", response_model=IncidentRead)
async def acknowledge_incident(incident_id: int, payload: IncidentAcknowledge, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Incident)
        .options(
            selectinload(Incident.device).selectinload(Device.building),
            selectinload(Incident.device).selectinload(Device.room)
        )
        .where(Incident.id == incident_id)
    )
    res = await db.execute(stmt)
    incident = res.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    incident.status = "ACKNOWLEDGED"
    incident.acknowledged_at = datetime.utcnow()
    incident.acknowledged_by = payload.acknowledged_by
    await db.commit()
    return incident

@router.post("/{incident_id}/resolve", response_model=IncidentRead)
async def resolve_incident(incident_id: int, payload: IncidentResolve, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Incident)
        .options(
            selectinload(Incident.device).selectinload(Device.building),
            selectinload(Incident.device).selectinload(Device.room)
        )
        .where(Incident.id == incident_id)
    )
    res = await db.execute(stmt)
    incident = res.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    incident.status = "RESOLVED"
    incident.resolved_at = datetime.utcnow()
    incident.resolution_note = payload.resolution_note
    await db.commit()
    return incident
