import asyncio
import json
from datetime import datetime, timedelta
from backend.database import AsyncSessionLocal, Base, engine
from backend.models import Building, Device, HealthLog, Incident

async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        # 1. Buildings (อาคาร 1 ถึง 23)
        b_lh1 = Building(name="อาคาร 1 (อาคารเรียนรวม 1)", code="1", description="อาคารบรรยายรวมและห้องเรียนอัจฉริยะ")
        b_eng = Building(name="อาคาร 2 (วิศวกรรมศาสตร์)", code="2", description="คณะวิศวกรรมศาสตร์และห้องแล็บคอมพิวเตอร์")
        b_lib = Building(name="อาคาร 3 (หอสมุดกลาง)", code="3", description="ศูนย์การเรียนรู้ Co-working Space และห้องค้นคว้า")
        
        all_buildings = [b_lh1, b_eng, b_lib]
        for i in range(4, 24):
            all_buildings.append(
                Building(
                    name=f"อาคาร {i}",
                    code=str(i),
                    description=f"อาคารเรียนและปฏิบัติการ {i} ประจำมหาวิทยาลัย"
                )
            )
        session.add_all(all_buildings)
        await session.flush()
        
        now = datetime.utcnow()
        
        # 2. Devices (Focused on NETWORK_SWITCH and ACCESS_POINT with Asset Number & Brand)
        devices_data = [
            # Switches
            Device(
                name="Core Switch อาคารเรียนรวม (MDF-LH1)",
                category="NETWORK_SWITCH",
                asset_number="ศทส.-66-0012/สวท",
                brand="Cisco",
                model_name="Catalyst 3850-48P",
                building_id=b_lh1.id,
                ip_address="127.0.0.1",
                is_simulation=True,
                port=161,
                check_type="SNMP",
                check_interval=30,
                snmp_community="public",
                status="ONLINE",
                online_since=now - timedelta(days=24, hours=14, minutes=22),
                uptime_str="24d 14h 22m",
                response_time_ms=1.2,
                last_seen=now,
                telemetry_data=json.dumps({"uptime_seconds": 2125340, "uptime_formatted": "24d 14h 22m 20s"}),
                description="Core Switch 10G/48-port PoE+ เชื่อมโยงทุกชั้นในอาคารเรียนรวม 1 (เชื่อมกับ mock_switch.py 127.0.0.1)"
            ),
            Device(
                name="Distribution Switch ชุมสายชั้น 2 (LH1-FL2)",
                category="NETWORK_SWITCH",
                asset_number="ศทส.-67-0105/สวท",
                brand="Ruijie",
                model_name="RG-NBS3200-24GT",
                building_id=b_lh1.id,
                ip_address="10.10.2.1",
                port=161,
                check_type="SNMP",
                check_interval=30,
                snmp_community="public",
                status="ONLINE",
                online_since=now - timedelta(days=12, hours=6, minutes=15),
                uptime_str="12d 6h 15m",
                response_time_ms=3.4,
                last_seen=now,
                telemetry_data=json.dumps({"uptime_seconds": 1059300, "uptime_formatted": "12d 6h 15m 00s"}),
                description="สวิตช์กระจายสัญญาณชั้น 2 คุมห้องเรียน Smart Classroom 201-208"
            ),
            Device(
                name="Access Switch ชั้น 3 (LH1-FL3)",
                category="NETWORK_SWITCH",
                asset_number="ศทส.-67-0189/สวท",
                brand="Aruba",
                model_name="CX 6100 24G",
                building_id=b_lh1.id,
                ip_address="10.10.3.1",
                port=161,
                check_type="SNMP",
                check_interval=30,
                snmp_community="public",
                status="ONLINE",
                online_since=now - timedelta(days=5, hours=2, minutes=45),
                uptime_str="5d 2h 45m",
                response_time_ms=4.1,
                last_seen=now,
                telemetry_data=json.dumps({"uptime_seconds": 441900, "uptime_formatted": "5d 2h 45m 00s"}),
                description="สวิตช์กระจายสาย LAN ประจำห้องบรรยายชั้น 3"
            ),
            Device(
                name="Lab Switch 48-Port (ENG-LAB401)",
                category="NETWORK_SWITCH",
                asset_number="วศ.-66-0045/ตึก4",
                brand="Cisco",
                model_name="Catalyst 2960-X 48TS",
                building_id=b_eng.id,
                ip_address="10.20.4.1",
                port=161,
                check_type="SNMP",
                check_interval=30,
                snmp_community="public",
                status="OFFLINE",
                online_since=None,
                uptime_str=None,
                response_time_ms=None,
                consecutive_failures=3,
                last_seen=now - timedelta(minutes=45),
                description="สวิตช์ประจำโต๊ะนักศึกษา Lab 401 (ขณะนี้ไม่ตอบสนอง - สาย Uplink ขาดหรือปิดสวิตช์)"
            ),
            Device(
                name="PoE Switch หอสมุดกลาง (LIB-1F-SW)",
                category="NETWORK_SWITCH",
                asset_number="สมด.-67-0021/หอสมุด",
                brand="TP-Link",
                model_name="SG3428MP Omada",
                building_id=b_lib.id,
                ip_address="10.30.1.1",
                port=161,
                check_type="SNMP",
                check_interval=30,
                snmp_community="public",
                status="ONLINE",
                online_since=now - timedelta(days=30, hours=18, minutes=10),
                uptime_str="30d 18h 10m",
                response_time_ms=2.8,
                last_seen=now,
                telemetry_data=json.dumps({"uptime_seconds": 2657400, "uptime_formatted": "30d 18h 10m 00s"}),
                description="จ่ายไฟ PoE ให้อุปกรณ์ Access Point และกล้อง CCTV หอสมุด"
            ),
            # WiFi Access Points
            Device(
                name="WiFi AP ห้องบรรยาย 101 (LH1-AP-101)",
                category="ACCESS_POINT",
                asset_number="ศทส.-67-0301/สวท",
                brand="Aruba",
                model_name="AP-515 Campus AP",
                building_id=b_lh1.id,
                ip_address="127.0.0.1",
                is_simulation=True,
                check_type="PING",
                check_interval=30,
                status="ONLINE",
                online_since=now - timedelta(days=18, hours=9, minutes=30),
                uptime_str="18d 9h 30m",
                response_time_ms=1.2,
                last_seen=now,
                description="WiFi 6 Dual-Radio รองรับนิสิตในห้องบรรยาย 200 คน (Ping 127.0.0.1 Local Loopback)"
            ),
            Device(
                name="WiFi AP Smart Classroom 205 (LH1-AP-205)",
                category="ACCESS_POINT",
                asset_number="ศทส.-67-0302/สวท",
                brand="Cisco",
                model_name="Catalyst 9115AX",
                building_id=b_lh1.id,
                ip_address="10.10.2.10",
                check_type="PING",
                check_interval=30,
                status="ONLINE",
                online_since=now - timedelta(days=12, hours=6, minutes=10),
                uptime_str="12d 6h 10m",
                response_time_ms=6.8,
                last_seen=now,
                description="WiFi 6 ความเร็วสูงสำหรับห้องเรียน Smart Classroom"
            ),
            Device(
                name="WiFi AP ห้องสัมมนา 304 (LH1-AP-304)",
                category="ACCESS_POINT",
                asset_number="ศทส.-67-0308/สวท",
                brand="Ruijie",
                model_name="RG-RAP2260(H)",
                building_id=b_lh1.id,
                ip_address="10.10.3.10",
                check_type="PING",
                check_interval=30,
                status="ONLINE",
                online_since=now - timedelta(days=5, hours=2, minutes=40),
                uptime_str="5d 2h 40m",
                response_time_ms=7.1,
                last_seen=now,
                description="WiFi Access Point ประจำห้องสัมมนาชั้น 3"
            ),
            Device(
                name="WiFi AP Lab IoT & AI (ENG-AP-402)",
                category="ACCESS_POINT",
                asset_number="วศ.-67-0112/ตึก4",
                brand="Huawei",
                model_name="AirEngine 5761-11",
                building_id=b_eng.id,
                ip_address="10.20.4.15",
                check_type="PING",
                check_interval=30,
                status="ONLINE",
                online_since=now - timedelta(days=8, hours=14, minutes=5),
                uptime_str="8d 14h 05m",
                response_time_ms=4.9,
                last_seen=now,
                description="WiFi รองรับอุปกรณ์ IoT บอร์ดทดลอง และแล็ปท็อปนักศึกษา"
            ),
            Device(
                name="WiFi AP Co-Working Space (LIB-AP-01)",
                category="ACCESS_POINT",
                asset_number="สมด.-66-0155/หอสมุด",
                brand="Aruba",
                model_name="AP-535 High-Density",
                building_id=b_lib.id,
                ip_address="10.30.1.15",
                check_type="PING",
                check_interval=30,
                status="ONLINE",
                online_since=now - timedelta(days=45, hours=11, minutes=50),
                uptime_str="45d 11h 50m",
                response_time_ms=3.8,
                last_seen=now,
                description="WiFi ความจุสูง รองรับนิสิตเชื่อมต่อพร้อมกัน 300+ อุปกรณ์"
            ),
            Device(
                name="WiFi AP โซนอ่านหนังสือ ชั้น 2 (LIB-AP-02)",
                category="ACCESS_POINT",
                asset_number="สมด.-66-0156/หอสมุด",
                brand="Aruba",
                model_name="AP-515 Campus AP",
                building_id=b_lib.id,
                ip_address="10.30.2.15",
                check_type="PING",
                check_interval=30,
                status="ONLINE",
                online_since=now - timedelta(days=45, hours=11, minutes=50),
                uptime_str="45d 11h 50m",
                response_time_ms=4.2,
                last_seen=now,
                description="WiFi สำหรับโซนอ่านหนังสือและค้นคว้าวิทยานิพนธ์"
            )
        ]
        
        session.add_all(devices_data)
        await session.flush()
        
        # 4. Incidents (Downtime History - บันทึกประวัติการดับย้อนหลัง)
        offline_switch = devices_data[3] # Cisco 2960-X Lab 401
        sw_fl3 = devices_data[2]         # Aruba CX 6100 (เคยดับเมื่อ 5 วันก่อน)
        ap_205 = devices_data[6]         # Cisco AP 205 (เคยดับเมื่อ 12 วันก่อน)
        
        inc_active = Incident(
            device_id=offline_switch.id,
            title=f"อุปกรณ์ {offline_switch.name} ดับ/ไม่ตอบสนอง (SNMP Timeout)",
            status="OPEN",
            severity="CRITICAL",
            started_at=now - timedelta(minutes=45)
        )
        
        inc_resolved_1 = Incident(
            device_id=sw_fl3.id,
            title=f"อุปกรณ์ {sw_fl3.name} ไฟตก/ไม่ตอบสนอง",
            status="RESOLVED",
            severity="WARNING",
            started_at=now - timedelta(days=5, hours=3, minutes=10),
            acknowledged_at=now - timedelta(days=5, hours=3, minutes=0),
            acknowledged_by="นายประสิทธิ์ ช่างเครือข่าย",
            resolved_at=now - timedelta(days=5, hours=2, minutes=45),
            resolution_note="ช่างไฟเข้าตรวจสอบตู้เบรกเกอร์ชั้น 3 สับสวิตช์ไฟหลักกลับขึ้นมา สวิตช์รีบูตและกู้คืนสถานะออนไลน์แล้ว (รวมเวลาดับ 25 นาที)"
        )
        
        inc_resolved_2 = Incident(
            device_id=ap_205.id,
            title=f"อุปกรณ์ {ap_205.name} สายสัญญาณหลุด (Ping Timeout)",
            status="RESOLVED",
            severity="CRITICAL",
            started_at=now - timedelta(days=12, hours=6, minutes=25),
            acknowledged_at=now - timedelta(days=12, hours=6, minutes=20),
            acknowledged_by="นายประสิทธิ์ ช่างเครือข่าย",
            resolved_at=now - timedelta(days=12, hours=6, minutes=10),
            resolution_note="เข้าตรวจสอบพบสาย Patch Cord พอร์ต PoE ขยับหลวม ได้เสียบล็อคหัว RJ45 ใหม่และทดสอบสัญญาณกลับมาปกติ (รวมเวลาดับ 15 นาที)"
        )

        session.add_all([inc_active, inc_resolved_1, inc_resolved_2])
        
        # 5. Add initial health logs
        for d in devices_data:
            for i in range(5):
                log_time = now - timedelta(minutes=i * 2)
                l_status = d.status
                latency = d.response_time_ms if l_status != "OFFLINE" else None
                msg = f"Check OK ({latency:.1f}ms)" if l_status != "OFFLINE" else "SNMP/Ping Request Timed Out"
                session.add(HealthLog(
                    device_id=d.id,
                    status=l_status,
                    response_time_ms=latency,
                    message=msg,
                    timestamp=log_time
                ))
                
        await session.commit()
        print("Successfully seeded campus switch and wifi network demo data!")

if __name__ == "__main__":
    asyncio.run(seed_database())
