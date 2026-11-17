import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select, update, desc
from sqlalchemy.orm import selectinload

from backend.database import AsyncSessionLocal
from backend.models import Device, HealthLog, Incident, Building, Room
from backend.monitor.checker import check_device_health
from backend.alerts.telegram_notify import dispatch_device_alert
from backend.config import settings

logger = logging.getLogger("unipulse.scheduler")
scheduler = AsyncIOScheduler()

# Semaphore to control concurrency
CONCURRENCY_LIMIT = 30
semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)

async def process_device_check(device_id: int):
    async with semaphore:
        async with AsyncSessionLocal() as session:
            # Query device with relationships
            stmt = (
                select(Device)
                .options(selectinload(Device.building), selectinload(Device.room))
                .where(Device.id == device_id, Device.is_active == True)
            )
            result = await session.execute(stmt)
            device = result.scalar_one_or_none()
            if not device or device.status == "MAINTENANCE":
                return

            prev_status = device.status
            is_online, latency, msg, is_warning, telemetry = await check_device_health(device)
            now = datetime.utcnow()
            
            # Format location string for notifications
            b_name = device.building.name if device.building else "ไม่ระบุอาคาร"
            r_name = device.room.name if device.room else "ไม่ระบุห้อง"
            location_str = f"{b_name} - {r_name}"

            if is_online:
                new_status = "WARNING" if is_warning else "ONLINE"
                device.status = new_status
                device.last_seen = now
                device.response_time_ms = latency
                device.consecutive_failures = 0

                # Track Online Since & Uptime String
                if not device.online_since or prev_status == "OFFLINE":
                    device.online_since = now

                if telemetry:
                    import json
                    device.telemetry_data = json.dumps(telemetry)
                    if "uptime_formatted" in telemetry:
                        device.uptime_str = telemetry["uptime_formatted"]

                if not device.uptime_str and device.online_since:
                    duration = max(0, (now - device.online_since).total_seconds())
                    days = int(duration // 86400)
                    hours = int((duration % 86400) // 3600)
                    mins = int((duration % 3600) // 60)
                    secs = int(duration % 60)
                    if days > 0:
                        device.uptime_str = f"{days}d {hours}h {mins}m"
                    elif hours > 0:
                        device.uptime_str = f"{hours}h {mins}m {secs}s"
                    else:
                        device.uptime_str = f"{mins}m {secs}s"

                # If device was previously OFFLINE, handle recovery!
                if prev_status == "OFFLINE":
                    logger.info(f"Device {device.name} RECOVERED!")
                    # Find all open/acknowledged incidents for this device
                    inc_stmt = (
                        select(Incident)
                        .where(Incident.device_id == device.id, Incident.status.in_(["OPEN", "ACKNOWLEDGED"]))
                        .order_by(desc(Incident.started_at))
                    )
                    inc_res = await session.execute(inc_stmt)
                    open_incidents = inc_res.scalars().all()
                    latest_incident_id = None
                    if open_incidents:
                        latest_incident_id = open_incidents[0].id
                        for inc in open_incidents:
                            inc.status = "RESOLVED"
                            inc.resolved_at = now
                            inc.resolution_note = "ระบบตรวจพบการตอบสนองตามปกติ (Auto-recovered)"

                    # Send recovery alert asynchronously in background (doesn't block response)
                    asyncio.create_task(dispatch_device_alert(
                        event_type="RECOVERED",
                        device_name=device.name,
                        ip_address=device.ip_address,
                        location_str=location_str,
                        category=device.category,
                        reason=f"ออนไลน์ปกติ Latency: {latency:.1f}ms",
                        incident_id=latest_incident_id
                    ))
            else:
                device.consecutive_failures += 1
                if device.consecutive_failures >= settings.ALERT_CONSECUTIVE_FAILURES:
                    device.status = "OFFLINE"
                    device.response_time_ms = None
                    device.uptime_str = None
                    device.online_since = None

                    # If transitioning to OFFLINE, trigger incident & alert
                    if prev_status != "OFFLINE":
                        logger.warning(f"Device {device.name} is now OFFLINE!")
                        
                        # Prevent duplicate open incidents for the same device
                        existing_inc_stmt = (
                            select(Incident)
                            .where(Incident.device_id == device.id, Incident.status.in_(["OPEN", "ACKNOWLEDGED"]))
                        )
                        existing_res = await session.execute(existing_inc_stmt)
                        existing_inc = existing_res.scalars().first()
                        
                        inc_id = None
                        if not existing_inc:
                            new_incident = Incident(
                                device_id=device.id,
                                title=f"อุปกรณ์ {device.name} ไม่ตอบสนอง ({device.check_type})",
                                status="OPEN",
                                severity="CRITICAL",
                                started_at=now
                            )
                            session.add(new_incident)
                            await session.flush() # get ID
                            inc_id = new_incident.id
                        else:
                            inc_id = existing_inc.id

                        # Send alert asynchronously in background
                        asyncio.create_task(dispatch_device_alert(
                            event_type="OFFLINE",
                            device_name=device.name,
                            ip_address=device.ip_address,
                            location_str=location_str,
                            category=device.category,
                            reason=msg,
                            incident_id=inc_id
                        ))

            # Record HealthLog
            log_entry = HealthLog(
                device_id=device.id,
                status=device.status,
                response_time_ms=latency,
                message=msg,
                timestamp=now
            )
            session.add(log_entry)
            await session.commit()

            return {
                "id": device.id,
                "status": device.status,
                "response_time_ms": device.response_time_ms,
                "last_seen": device.last_seen,
                "uptime_str": device.uptime_str,
                "message": msg
            }

async def run_monitoring_cycle():
    """
    Main job called periodically by APScheduler.
    """
    try:
        async with AsyncSessionLocal() as session:
            stmt = select(Device.id).where(Device.is_active == True)
            res = await session.execute(stmt)
            device_ids = res.scalars().all()
            
        if not device_ids:
            return

        tasks = [process_device_check(d_id) for d_id in device_ids]
        await asyncio.gather(*tasks, return_exceptions=True)

        # Cleanup old logs (keep last 7 days)
        cutoff = datetime.utcnow() - timedelta(days=7)
        async with AsyncSessionLocal() as session:
            from sqlalchemy import delete
            del_stmt = delete(HealthLog).where(HealthLog.timestamp < cutoff)
            await session.execute(del_stmt)
            await session.commit()

    except Exception as e:
        logger.error(f"Error during monitoring cycle: {e}")

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            run_monitoring_cycle,
            "interval",
            seconds=settings.DEFAULT_CHECK_INTERVAL,
            id="device_monitoring_job",
            replace_existing=True
        )
        scheduler.start()
        logger.info(f"Campus Equipment & Infrastructure Monitoring scheduler started. Cycle: {settings.DEFAULT_CHECK_INTERVAL}s")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Campus Equipment & Infrastructure Monitoring scheduler stopped.")
