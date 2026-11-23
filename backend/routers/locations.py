from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.database import get_db
from backend.models import Building, Room, BuildingPin
from backend.schemas import (
    BuildingCreate, BuildingRead, RoomCreate, RoomRead,
    BuildingPinCreate, BuildingPinRead
)

router = APIRouter(prefix="/api/v1/locations", tags=["Locations"])

@router.get("/buildings", response_model=List[BuildingRead])
async def list_buildings(db: AsyncSession = Depends(get_db)):
    stmt = select(Building).options(selectinload(Building.rooms)).order_by(Building.id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/buildings", response_model=BuildingRead, status_code=status.HTTP_201_CREATED)
async def create_building(payload: BuildingCreate, db: AsyncSession = Depends(get_db)):
    # Check duplicate code
    stmt = select(Building).where(Building.code == payload.code)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Building code already exists")
        
    building = Building(**payload.model_dump())
    db.add(building)
    await db.commit()
    
    stmt = select(Building).options(selectinload(Building.rooms)).where(Building.id == building.id)
    res = await db.execute(stmt)
    return res.scalar_one()

@router.delete("/buildings/{building_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_building(building_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Building).where(Building.id == building_id)
    building = (await db.execute(stmt)).scalar_one_or_none()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    await db.delete(building)
    await db.commit()
    return None

@router.get("/rooms", response_model=List[RoomRead])
async def list_rooms(building_id: int = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Room).order_by(Room.floor, Room.name)
    if building_id:
        stmt = stmt.where(Room.building_id == building_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/rooms", response_model=RoomRead, status_code=status.HTTP_201_CREATED)
async def create_room(payload: RoomCreate, db: AsyncSession = Depends(get_db)):
    # Verify building exists
    b_stmt = select(Building).where(Building.id == payload.building_id)
    building = (await db.execute(b_stmt)).scalar_one_or_none()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
        
    room = Room(**payload.model_dump())
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room

@router.delete("/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(room_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Room).where(Room.id == room_id)
    room = (await db.execute(stmt)).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    await db.delete(room)
    await db.commit()
    return None

# ==========================================
# Building Pins API (Custom Pinning for Google Maps)
# ==========================================
@router.get("/building-pins", response_model=List[BuildingPinRead])
async def list_building_pins(db: AsyncSession = Depends(get_db)):
    """Returns all custom pinned building coordinates for Google Maps"""
    stmt = select(BuildingPin).order_by(BuildingPin.building_id)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/building-pins", response_model=BuildingPinRead)
async def set_building_pin(payload: BuildingPinCreate, db: AsyncSession = Depends(get_db)):
    """Saves or updates custom pinned coordinate for a building"""
    stmt = select(BuildingPin).where(BuildingPin.building_id == payload.building_id)
    pin = (await db.execute(stmt)).scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if pin:
        pin.lat = payload.lat
        pin.lng = payload.lng
        pin.updated_at = now
    else:
        pin = BuildingPin(
            building_id=payload.building_id,
            lat=payload.lat,
            lng=payload.lng,
            updated_at=now
        )
        db.add(pin)
    await db.commit()
    await db.refresh(pin)
    return pin

@router.delete("/building-pins/{building_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_building_pin(building_id: int, db: AsyncSession = Depends(get_db)):
    """Deletes custom pinned coordinate for a building"""
    stmt = select(BuildingPin).where(BuildingPin.building_id == building_id)
    pin = (await db.execute(stmt)).scalar_one_or_none()
    if pin:
        await db.delete(pin)
        await db.commit()
    return None
