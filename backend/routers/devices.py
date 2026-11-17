import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.database import get_db
from backend.models import Device, HealthLog, Building, Room, Incident
from backend.schemas import (
    DeviceCreate, DeviceUpdate, DeviceRead, HealthLogRead, TelemetryPush, IncidentRead
)
from backend.monitor.scheduler import process_device_check

router = APIRouter(prefix="/api/v1/devices", tags=["Devices"])

@router.get("", response_model=List[DeviceRead])
async def list_devices(
    building_id: Optional[int] = Query(None),
    room_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Device)
        .options(selectinload(Device.building), selectinload(Device.room))
        .order_by(Device.id.desc())
    )
    if building_id:
        stmt = stmt.where(Device.building_id == building_id)
    if room_id:
        stmt = stmt.where(Device.room_id == room_id)
    if category:
        stmt = stmt.where(Device.category == category)
    if status:
        stmt = stmt.where(Device.status == status)
    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(
            (Device.name.ilike(search_pattern)) | 
            (Device.ip_address.ilike(search_pattern)) |
            (Device.asset_number.ilike(search_pattern)) |
            (Device.brand.ilike(search_pattern)) |
            (Device.model_name.ilike(search_pattern)) |
            (Device.description.ilike(search_pattern))
        )
        
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=DeviceRead, status_code=status.HTTP_201_CREATED)
async def create_device(payload: DeviceCreate, db: AsyncSession = Depends(get_db)):
    device = Device(**payload.model_dump())
    db.add(device)
    await db.commit()
    await db.refresh(device)
    
    # Reload with relations
    stmt = select(Device).options(selectinload(Device.building), selectinload(Device.room)).where(Device.id == device.id)
    res = await db.execute(stmt)
    created = res.scalar_one()
    
    # Trigger initial check asynchronously in background
    import asyncio
    asyncio.create_task(process_device_check(created.id))
    return created

@router.get("/{device_id}", response_model=DeviceRead)
async def get_device(device_id: int, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Device)
        .options(selectinload(Device.building), selectinload(Device.room))
        .where(Device.id == device_id)
    )
    result = await db.execute(stmt)
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.put("/{device_id}", response_model=DeviceRead)
async def update_device(device_id: int, payload: DeviceUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(Device).where(Device.id == device_id)
    result = await db.execute(stmt)
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(device, key, value)
        
    device.updated_at = datetime.utcnow()
    await db.commit()
    
    # Reload with relations
    stmt = select(Device).options(selectinload(Device.building), selectinload(Device.room)).where(Device.id == device.id)
    res = await db.execute(stmt)
    return res.scalar_one()

@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(device_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Device).where(Device.id == device_id)
    result = await db.execute(stmt)
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    await db.delete(device)
    await db.commit()
    return None

@router.post("/{device_id}/check")
async def trigger_manual_check(device_id: int):
    """Triggers an immediate health check on this specific device."""
    res = await process_device_check(device_id)
    if not res:
        raise HTTPException(status_code=404, detail="Device not found")
        
    return {
        "message": "Check executed successfully",
        "status": res["status"],
        "response_time_ms": res["response_time_ms"],
        "last_seen": res["last_seen"],
        "uptime_str": res.get("uptime_str")
    }

@router.post("/{device_id}/telemetry")
async def push_telemetry(device_id: int, telemetry: TelemetryPush, db: AsyncSession = Depends(get_db)):
    """API for PC Lab or IoT Agents to report CPU, RAM, Disk, Temperature, and heartbeat."""
    stmt = select(Device).where(Device.id == device_id)
    result = await db.execute(stmt)
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    now = datetime.utcnow()
    device.status = "ONLINE"
    device.last_seen = now
    device.consecutive_failures = 0
    device.telemetry_data = json.dumps(telemetry.model_dump())
    device.response_time_ms = 1.0 # agent is directly connected
    
    # Record health log
    log = HealthLog(
        device_id=device.id,
        status="ONLINE",
        response_time_ms=1.0,
        message=f"Agent Telemetry: CPU {telemetry.cpu_percent or 0}%, RAM {telemetry.memory_percent or 0}%",
        timestamp=now
    )
    db.add(log)
    await db.commit()
    return {"status": "ok", "message": "Telemetry received"}

@router.get("/{device_id}/logs", response_model=List[HealthLogRead])
async def get_device_logs(device_id: int, limit: int = Query(50, le=200), db: AsyncSession = Depends(get_db)):
    stmt = (
        select(HealthLog)
        .where(HealthLog.device_id == device_id)
        .order_by(desc(HealthLog.timestamp))
        .limit(limit)
    )
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/{device_id}/incidents", response_model=List[IncidentRead])
async def get_device_incidents(device_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch downtime incidents specifically for this device."""
    stmt = (
        select(Incident)
        .options(
            selectinload(Incident.device).selectinload(Device.building),
            selectinload(Incident.device).selectinload(Device.room)
        )
        .where(Incident.device_id == device_id)
        .order_by(desc(Incident.started_at))
    )
    res = await db.execute(stmt)
    return res.scalars().all()

