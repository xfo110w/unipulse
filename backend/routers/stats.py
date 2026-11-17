from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models import Device, Incident
from backend.schemas import DashboardStats, CategoryCount

router = APIRouter(prefix="/api/v1/stats", tags=["Statistics"])

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # Device query
    stmt = select(Device).where(Device.is_active == True)
    res = await db.execute(stmt)
    devices = res.scalars().all()
    
    total = len(devices)
    online = sum(1 for d in devices if d.status == "ONLINE")
    offline = sum(1 for d in devices if d.status == "OFFLINE")
    warning = sum(1 for d in devices if d.status == "WARNING")
    maintenance = sum(1 for d in devices if d.status == "MAINTENANCE")
    
    # Calculate health %
    active_monitored = total - maintenance
    health_pct = round((online / active_monitored * 100), 1) if active_monitored > 0 else 100.0
    
    # Open incidents
    inc_stmt = select(func.count(Incident.id)).where(Incident.status.in_(["OPEN", "ACKNOWLEDGED"]))
    open_incidents = (await db.execute(inc_stmt)).scalar() or 0
    
    # Group by category
    category_map = {}
    for d in devices:
        cat = d.category or "OTHER"
        if cat not in category_map:
            category_map[cat] = {"total": 0, "online": 0, "offline": 0}
        category_map[cat]["total"] += 1
        if d.status == "ONLINE":
            category_map[cat]["online"] += 1
        elif d.status == "OFFLINE":
            category_map[cat]["offline"] += 1
            
    cat_list = [
        CategoryCount(
            category=k,
            total=v["total"],
            online=v["online"],
            offline=v["offline"]
        )
        for k, v in category_map.items()
    ]
    
    return DashboardStats(
        total_devices=total,
        online_count=online,
        offline_count=offline,
        warning_count=warning,
        maintenance_count=maintenance,
        system_health_percentage=health_pct,
        open_incidents_count=open_incidents,
        categories=cat_list
    )
