# 🎓 Campus Equipment & Infrastructure Monitoring System (UniPulse)
### Open-Source University Equipment & Infrastructure Health Monitoring System
### ระบบตรวจสอบสถานะและตรวจวัดการทำงานของอุปกรณ์ในมหาวิทยาลัย (โอเพนซอร์ส)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-brightgreen.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)

---

## 🌟 จุดเด่นและภาพรวมโครงการ (Overview)

**UniPulse (Campus Equipment & Infrastructure Monitoring System)** คือระบบมอนิเตอร์และตรวจวัดความพร้อมในการใช้งานของอุปกรณ์เครือข่ายและโครงสร้างพื้นฐานในมหาวิทยาลัยแบบรวมศูนย์ ออกแบบมาเพื่อดูแลสวิตช์เครือข่าย (Network Switch), จุดกระจายสัญญาณไวไฟ (WiFi Access Point), โปรเจกเตอร์, เซิร์ฟเวอร์ และอุปกรณ์ประจำอาคาร โดยมีจุดเด่นสำคัญ:

- 🗺️ **ผังแผนที่แม่บทมหาวิทยาลัยแบบโต้ตอบ (Interactive Campus Map)**: แสดงผังแม่บทมหาวิทยาลัยราชภัฏบุรีรัมย์พร้อมหมุดพิกัดอาคาร 1–23 แบบเรียลไทม์ คลิกที่หมายเลขอาคารบนแผนที่เพื่อดูรายการอุปกรณ์และสถานะ `UP / DOWN` ได้ทันที หากมีอุปกรณ์ขัดข้องจะขึ้นสัญลักษณ์เครื่องหมาย **`!`** สีแดงกระพริบเตือนบนหมายเลขอาคารในผัง
- 🌓 **ระบบสลับโหมดสว่างและโหมดมืด (Light & Dark Mode Switcher)**: รองรับทั้ง **โหมดสว่าง (Light Mode)** สีขาวสบายตาเป็นค่าเริ่มต้น และ **โหมดมืด (Dark Mode)** สีม่วงหลวง (BRU Royal Purple & Gold) พร้อมปุ่มสลับโหมดลอยตัวทรงกลม (`🌙 / ☀️`) ที่มุมขวาล่าง และจดจำสถานะผ่าน `localStorage`
- 🧭 **แถบนำทางสองระดับแบบจัดกึ่งกลาง (2-Tier Centered Navigation Bar)**: จัดระเบียบส่วนหัวเว็บ (Header) เป็น 2 ระดับอย่างสมดุล แถวบนสำหรับตราสัญลักษณ์ มรภ.บุรีรัมย์ และสถานะ SLA ส่วนแถวล่างจัดวางแท็บเมนูหลัก 5 หมวดไว้ **กึ่งกลางหน้าจอ 100%** พร้อมเว้นพื้นที่ซ้าย-ขวาสำหรับฟังก์ชันในอนาคต
- 🏢 **ระบบโครงสร้างอาคารอัตโนมัติ (Building 1–23 Auto-Seeding)**: ปรับลดความซับซ้อนให้จัดการอุปกรณ์ระดับ **อาคาร (อาคาร 1 ถึง 23)** ได้โดยตรง พร้อมกลไกสร้างข้อมูลอาคารเริ่มต้นให้อัตโนมัติเมื่อเปิดระบบบนเครื่องใหม่ (ย้ายเครื่องแล้วข้อมูลอาคารไม่หาย)
- 📊 **กราฟวิเคราะห์ความเสถียรและ Latency ย้อนหลัง (Performance & Latency Graph)**: พล็อตกราฟเส้นและพื้นที่ (SVG Area Chart) แบบเรียลไทม์ พร้อมแถบ Availability Timeline มาร์กจุดที่สัญญาณดับ (Outage Drop) สีแดงให้เห็นทันที
- ⏱️ **ตรวจสอบประวัติการดับย้อนหลัง (Downtime History & Uptime)**: บันทึกวันและเวลาที่ดับ (Started), เวลาที่กู้คืน (Recovered), รวมระยะเวลาดับ (Downtime Duration) และระยะเวลาเปิดทำงานต่อเนื่อง (Uptime) อย่างแม่นยำตามเวลาไทย (GMT+7)
- 🏷️ **ระบบจัดการเลขครุภัณฑ์และยี่ห้อ (Hardware Asset Tracking)**: รองรับการบันทึกเลขครุภัณฑ์, ยี่ห้อ (Cisco, Aruba, Ruijie, TP-Link ฯลฯ), รุ่น และส่งออกรายงาน CSV
- 📡 **ระบบตรวจสอบ SNMP แบบคู่ขนาน (Dual SNMP v2c & SNMP v3 USM)**: รองรับทั้ง **SNMP v2c** (Community String สำหรับอุปกรณ์ทั่วไป/รุ่นเก่า) และ **SNMP v3** (User-based Security Model ตามมาตรฐาน RFC 3414) ที่มีระบบยืนยันตัวตน (SHA-1/MD5) และเข้ารหัสข้อมูลแพ็กเก็ตแบบ End-to-End ด้วย **AES-128** ป้องกันการดักจับรหัสผ่าน (Packet Sniffing) บนสาย LAN ได้อย่างสมบูรณ์
- 📖 **คู่มือการใช้งานระบบในตัว (Built-in User Manual)**: มีปุ่มเปิดคู่มือการใช้งานที่ Footer ด้านล่างสุด แสดงคำแนะนำการใช้งานอย่างละเอียดใน 4 หมวดหลัก (ภาพรวม, ผังอาคาร, อุปกรณ์, เหตุการณ์) ล็อกขนาดหน้าต่างคงที่พร้อมรองรับการเลื่อนอ่านด้วยลูกกลิ้งเมาส์
- ⚡ **เสถียรบน Windows & Linux พร้อมตัวจำลอง (Cross-Platform Engine & Simulator)**: ระบบ Ping ทำงานผ่าน Background Thread Pool ที่เข้ากันได้กับ Windows ทุกรุ่น ทุกภาษา (ไม่ติดปัญหา Event Loop บน Windows) พร้อมสคริปต์ `mock_devices.py` และ `mock_switch.py` (รองรับทั้ง SNMP v2c และ v3) สำหรับทดสอบ
- 🛡️ **ระบบความปลอดภัยและการจำกัดวง IP (IP Whitelisting & SSRF Protection)**: ตรวจสอบและอนุญาตเฉพาะ IP ในวงเครือข่ายของมหาวิทยาลัย (เช่น `10.153.0.0/16`) บล็อก Public IP ภายนอกเพื่อป้องกันช่องโหว่ SSRF พร้อมแยกโหมดอุปกรณ์จำลอง (`127.0.0.1`) ไว้อย่างชัดเจน
- 📲 **แจ้งเตือนทันทีผ่าน Telegram Bot**: แจ้งเตือนเข้ากลุ่มช่างเทคนิคทันทีเมื่ออุปกรณ์ดับ (OFFLINE) และแจ้งเมื่อกู้คืนกลับมา (RECOVERED) แบบ Asynchronous ไม่ทำให้ระบบหน่วง

---

## 🏗️ สถาปัตยกรรมระบบ (Architecture)

```mermaid
flowchart TD
    subgraph Campus["มหาวิทยาลัย & อาคาร 1–23 (Campus Infrastructure)"]
        SW["⚡ สวิตช์เครือข่าย (Core/Distribution Switch)<br>• ICMP Ping • SNMP v2c / v3 USM (Port 161)"]
        AP["📶 อุปกรณ์ไวไฟ (Access Point)<br>• ICMP Ping • SNMP / TCP Port"]
        SRV["🖥️ เซิร์ฟเวอร์ & คอมพิวเตอร์แล็บ<br>• Agent Telemetry Push (CPU/RAM/Disk)"]
    end

    subgraph CoreSystem["UniPulse Core System"]
        Engine["Monitoring Engine (Asynchronous Loop)<br>• Thread-Safe Ping (Win/Linux) • SNMP v2c/v3 (AES/SHA) • TCP/HTTP/PJLink<br>• Uptime & Incident Tracker"]
        DB[("SQLite / PostgreSQL<br>Auto-Seed Buildings 1–23")]
        API["FastAPI REST Backend (Async SQLAlchemy)<br>• /api/v1/devices<br>• /api/v1/locations<br>• /api/v1/incidents<br>• /api/v1/stats"]
        WebUI["React 19 + Tailwind CSS v4 Dashboard<br>• Interactive Campus Map (! Alert Pins)<br>• Performance Latency Graph<br>• Live Matrix & Incident Resolve"]
    end

    subgraph Alerts["ระบบแจ้งเตือน (Notifications)"]
        TelegramBot["Telegram Bot API<br>(กลุ่มช่างเทคนิค & ผู้ดูแลระบบ)"]
    end

    Campus -->|Health Check / Telemetry| Engine
    Engine --> DB
    DB --> API
    API --> WebUI
    Engine -->|Async Offline/Recovery Alert| Alerts
```

---

## 🚀 ฟีเจอร์หลัก (Key Features)

### 1. ผังแผนที่แม่บทมหาวิทยาลัยแบบโต้ตอบ (Interactive Campus Map & Grid)
- **Interactive Master Plan:** ใช้ภาพผังแม่บทจริง (`campus-map.jpg`) ทำงานแบบ Local 100% ไม่ง้ออินเทอร์เน็ตภายนอกหรือ Google Maps API (ใช้งานในวง Intranet/LAN ปิดได้เสถียร)
- **คลิกเพื่อตรวจสอบอุปกรณ์ (Click-to-Inspect):** กดที่หมายเลขอาคาร `1–23` บนผัง ระบบจะเลื่อนไปยังรายละเอียดของอาคารนั้นทันที พร้อมแสดงสุขภาพสัญญาณ (Signal SLA %), ความหน่วงเฉลี่ย และรายการอุปกรณ์ทั้งหมดพร้อมป้าย **`UP (ออนไลน์)`** / **`DOWN (ขาดการเชื่อมต่อ)`**
- **แจ้งเตือนด้วยเครื่องหมาย `!` บนผัง:** หากอุปกรณ์ในอาคารใดเกิดสถานะ **`DOWN`** ระบบจะแสดงเครื่องหมาย **`!`** สีแดงกระพริบเตือนบนหมายเลขอาคารนั้นในผังทันที (และแสดงจุดสีเขียวเมื่อออนไลน์ครบทุกตัว)
- **ซูมและดูตัวอย่างข้อมูล:** มีปุ่มซูมเข้า-ออก-รีเซ็ตขนาด และ Hover Tooltip แสดงจำนวนอุปกรณ์กับสถานะเมื่อนำเมาส์ไปชี้
- **สลับมุมมองได้อิสระ:** เลือกสลับระหว่างมุมมอง **"ผังแผนที่ (Campus Map)"** และ **"ตารางรายชื่ออาคาร (Grid)"** ได้ทันที

### 2. โครงสร้างอาคารอัตโนมัติ & การจัดการครุภัณฑ์ (Auto-Seed Buildings 1–23 & Assets)
- ออกแบบให้ระบุตำแหน่งอุปกรณ์ผูกกับ **อาคาร 1 ถึง 23** โดยตรง สะดวกและลดขั้นตอน (ตัดชั้นข้อมูลห้องที่ไม่จำเป็นออก)
- **ทำไมก่อนหน้านี้ย้ายเครื่องแล้ว "อาคาร" หาย?**
  - ระบบใช้ฐานข้อมูล SQLite (`unipulse.db`) และมีการตั้งค่าใน `.gitignore` (`*.db`, `*.sqlite3`, `data/`) ไม่ให้ส่งไฟล์ฐานข้อมูลขึ้น GitHub ทำให้เมื่อ `git clone` ไปรันบนเครื่องใหม่ ระบบจะสร้างฐานข้อมูลว่างขึ้นมาใหม่ รายชื่ออาคารที่เคยเพิ่มไว้จึงหายไป
- **สิ่งที่แก้ไขให้แล้ว (Auto-Seeding):**
  - เพิ่มฟังก์ชัน `ensure_default_buildings` ใน `backend/init_defaults.py` (ทำงานอัตโนมัติใน `lifespan` ของ `backend/main.py`) หากเปิดระบบด้วยฐานข้อมูลว่าง ระบบจะสร้าง **อาคาร 1–23** ให้ทันทีโดยอัตโนมัติ
- รองรับข้อมูลเลขครุภัณฑ์, ยี่ห้อ, รุ่น, ปุ่ม **แก้ไขข้อมูล (Edit)** และ **Export CSV**

> [!IMPORTANT]
> **ข้อควรทราบและสิ่งที่ต้องทำเมื่อย้ายเครื่อง / ใช้งานบนเซิร์ฟเวอร์จริง (Production Guide):**
> - **ขอบเขตของ Auto-Seeding:** กลไกนี้ช่วยสร้างเฉพาะ **รายชื่ออาคาร 1–23 ตั้งต้น** เท่านั้น ข้อมูลอุปกรณ์ (Devices), ประวัติการดับ (Incidents) และ Log ที่คุณเพิ่มเองบนเครื่องหนึ่งจะอยู่ในไฟล์ `unipulse.db` ของเครื่องนั้น ไม่ได้ตามมาทาง GitHub
> - **กรณีย้ายเครื่องทดสอบ (Local ➔ Local):** หากต้องการให้ *ข้อมูลอุปกรณ์และประวัติทั้งหมด* ตามไปเครื่องใหม่ด้วย ต้องคัดลอกไฟล์ `unipulse.db` (และ `.env`) จากเครื่องเดิมมาวางในโฟลเดอร์รูทของเครื่องใหม่
> - **กรณีติดตั้งบนเซิร์ฟเวอร์จริง (Production Server — แนะนำ):**
>   1. **ติดตั้งที่ Server กลางเครื่องเดียว:** ให้ทีมงาน/ผู้ดูแลเข้าใช้งานผ่าน `http://<IP-ของเซิร์ฟเวอร์>:8000` แทนการรันแยกคนละเครื่อง เพื่อให้ทุกคนดูข้อมูลชุดเดียวกัน
>   2. **เก็บฐานข้อมูลแบบถาวร (Persistent Data):** หากใช้งานผ่าน **Docker** ([`docker-compose.yml`](docker-compose.yml)) ระบบจะผูก Volume `./data:/app/data` เก็บไฟล์ `unipulse.db` ไว้นอก Container (`DATABASE_URL=sqlite+aiosqlite:////app/data/unipulse.db`) เพื่อไม่ให้ข้อมูลหายเมื่อ Rebuild หรืออัปเดตโค้ด
>   3. **ใช้ฐานข้อมูลกลาง PostgreSQL (สำหรับใช้งานจริง/หลายแอดมิน):** แนะนำเปลี่ยนค่า `DATABASE_URL` ใน `.env` ไปชี้ที่ PostgreSQL Server กลาง (เช่น `postgresql+asyncpg://user:pass@host:5432/unipulsedb` โดยติดตั้ง `asyncpg` เพิ่มเติม) และตั้งเวลาสำรองฐานข้อมูล (Backup) อย่างสม่ำเสมอ

### 3. กราฟวิเคราะห์ประสิทธิภาพ (Performance & Latency Graph)
- กราฟเส้นและพื้นที่ไล่เฉดสี (SVG Area Chart) แสดงค่า Latency (ms) ย้อนหลัง
- **Outage Drop Marker:** แสดงจุดสีแดงเรืองแสงตรงตำแหน่งเวลาที่อุปกรณ์ดับ
- **Availability Strips:** แถบ Timeline บล็อกสีเขียว (ปกติ), สีเหลือง (หน่วง >150ms), สีแดง (ดับ) พร้อม Hover Tooltip แสดงวัน เวลา และข้อความผลตรวจ
- เลือกดูข้อมูลย้อนหลังได้ 20, 50 หรือ 100 รอบล่าสุด พร้อมคำนวณ Uptime %, Avg Latency, Min/Peak Latency และจำนวนครั้งที่สัญญาณหลุด

### 4. บันทึกประวัติการดับและกู้คืน (Downtime & Incidents)
- บันทึก Incident อัตโนมัติเมื่ออุปกรณ์ขาดการเชื่อมต่อครบเกณฑ์ที่กำหนด
- คำนวณระยะเวลาที่ดับรวม (Downtime Duration) และแสดงผลตามเวลาไทย (GMT+7)
- กู้คืนและปิดเคส (**RESOLVED**) ให้อัตโนมัติเมื่ออุปกรณ์กลับมาตอบสนองปกติ พร้อมรองรับการกด **รับเรื่อง (Acknowledge)** และบันทึกหมายเหตุการแก้ไข

### 5. รองรับโปรโตคอลตรวจจับหลากหลาย (Multi-Protocol Checks)
- **ICMP Ping:** ใช้ Thread Pool (`asyncio.to_thread`) รองรับทั้ง Windows (ภาษาไทย/อังกฤษ) และ Linux โดยไม่เกิดปัญหา Event Loop
- **SNMP Dual Protocol (v2c & v3 USM):**
  - **SNMP v2c:** ดึงค่า `sysUpTime` (OID `1.3.6.1.2.1.1.3.0`) ด้วย Community String สำหรับสวิตช์และ AP ทั่วไป
  - **SNMP v3 (USM - RFC 3414):** มาตรฐานความปลอดภัยระดับองค์กร รองรับการยืนยันตัวตนด้วย Username + Hash (`SHA-1` / `MD5`) และการเข้ารหัสลับแพ็กเก็ตแบบ End-to-End ด้วย `AES-128` ป้องกันการดักฟังข้อมูลและขโมยรหัสผ่านบนสาย LAN (รองรับทั้งระดับ `authPriv`, `authNoPriv`, `noAuthNoPriv`)
- **TCP Port / HTTP / HTTPS / PJLink:** ตรวจสอบพอร์ตเว็บ (80/443), SSH (22), เว็บพอร์ทัล และโปรเจกเตอร์เครือข่าย (พอร์ต 4352)
- **Agent Telemetry:** รับค่า CPU / RAM / Disk จากสคริปต์ `agent/lab_pc_agent.py` สำหรับเครื่อง PC ห้องแล็บ

### 6. ระบบสลับโหมดสว่างและโหมดมืด (Dual-Theme: Light & Dark Mode)
- **ค่าเริ่มต้นเป็นโหมดสว่าง (Clean Light Mode):** ปรับโทนสีพื้นหลังหลักเป็นสีขาวสะอาดตา (`bg-slate-50 / bg-white`) คอนทราสต์ตัวอักษรอ่านง่าย เหมาะสำหรับการใช้งานในเวลากลางวันและห้องทำงานทั่วไป
- **โหมดมืดสีม่วงหลวง มรภ.บุรีรัมย์ (BRU Royal Purple Dark Mode):** ถ่ายทอดเอกลักษณ์สีม่วง–ทองของมหาวิทยาลัยราชภัฏบุรีรัมย์อย่างโดดเด่น สบายตาเมื่อมอนิเตอร์บนจอขนาดใหญ่ในศูนย์คอมพิวเตอร์
- **ปุ่มเปลี่ยนโหมดลอยตัว (Floating Toggle Button):** ปุ่มกลมมินิมอลมุมขวาล่าง (`🌙 / ☀️`) เปลี่ยนโหมดได้ในคลิกเดียวจากทุกหน้า
- **จดจำสถานะผ่าน LocalStorage:** ระบบจะบันทึกโหมดที่ผู้ใช้เลือกไว้โดยอัตโนมัติ เปิดเว็บใหม่ก็ยังคงเป็นโหมดเดิม
- **ปรับแต่งสีครอบคลุม 100% (Full Theme Adaptation):** ปรับจูนทั้ง Welcome Banner, แผนที่ผังแม่บท, กราฟ Latency, ตารางอุปกรณ์, ป้ายกำกับสถานะ, กล่องสรุปสถิติ, เมนูตั้งค่า และ Popup Modal ทั้งหมด

### 7. แถบนำทางสองระดับแบบจัดกึ่งกลาง (2-Tier Centered Navigation Bar)
- **Tier 1 (Header หลัก):** แสดงตรามหาวิทยาลัยราชภัฏบุรีรัมย์ ชื่อระบบ BRU UniPulse, ป้าย SLA รวม, ปุ่มรีเฟรช และลิงก์ไปยังเว็บไซต์มหาวิทยาลัย
- **Tier 2 (เมนูนำทาง):** จัดเมนูนำทางทั้ง 5 ส่วน (`ภาพรวม`, `ผังอาคาร`, `อุปกรณ์`, `เหตุการณ์`, `ตั้งค่า & Telegram`) ให้อยู่ **กึ่งกลางหน้าจออย่างสมบูรณ์แบบ** พร้อมคงระยะห่างซ้าย-ขวาอย่างสวยงาม ไม่ทับซ้อนกับตราสัญลักษณ์หรือปุ่มระบบ

### 8. ระบบความปลอดภัยและการจำกัดวง IP เครือข่าย (IP Whitelisting & SSRF Protection)
- **ตรวจสอบวง Subnet อัตโนมัติ (Automated Subnet Verification):** Backend มีโมดูล `backend/security.py` คอยตรวจสอบ IP Address ก่อนบันทึกลงระบบ โดยอนุญาตเฉพาะวงเครือข่ายภายในของมหาวิทยาลัย (เช่น `10.153.0.0/16` วง มรภ.บุรีรัมย์ หรือวง Private Subnet ที่กำหนดใน `ALLOWED_SUBNETS`)
- **ป้องกันช่องโหว่ SSRF (Server-Side Request Forgery):** บล็อกการกรอก Public IP ภายนอก (เช่น `8.8.8.8`), Link-Local IP (`169.254.x.x`) และ Multicast เพื่อป้องกันผู้ไม่หวังดีใช้ระบบเป็นฐานสแกนหรือโจมตีเป้าหมายภายนอก
- **รองรับโหมดจำลองสำหรับทดสอบ (Simulator / Mock Device Mode):** มีช่องตัวเลือก **`[✓] ใช้อุปกรณ์จำลองสำหรับทดสอบ`** ในหน้าต่างเพิ่มอุปกรณ์ เพื่ออนุญาตให้ใช้งาน IP Loopback `127.0.0.1` ร่วมกับ `mock_switch.py` และ `mock_devices.py` ได้อย่างปลอดภัย พร้อมติดป้ายกำกับ **`🧪 จำลอง`** ให้เห็นชัดเจนในหน้ารายการอุปกรณ์และผังอาคาร

### 9. ระบบคู่มือการใช้งานในตัว (Built-in User Manual)
- มีปุ่ม **"คู่มือการใช้งานระบบ"** ในแถบ Footer ด้านล่างสุดถัดจากเว็บไซต์หลักมหาวิทยาลัย จัดวางสไตล์มินิมอลเรียบเนียน ไร้กรอบรบกวนสายตา
- รวบรวมคำแนะนำการใช้งานอย่างละเอียดครอบคลุม 4 หมวดหลัก:
  1. **ภาพรวม (Dashboard):** การอ่านค่าสถานะ SLA สุขภาพระบบ ปริมาณอุปกรณ์ UP/DOWN และระบบ Auto Refresh 15 วินาที
  2. **ผังอาคาร (Campus Map):** การใช้งานแผนที่แม่บท 23 อาคาร ความหมายของสีอาคาร และการตรวจเช็คอุปกรณ์ประจำอาคาร
  3. **อุปกรณ์ (Devices):** วิธีการลงทะเบียนอุปกรณ์, การเลือกประเภทตรวจจับ (Ping, SNMP v2c, SNMP v3) และระบบความปลอดภัย IP
  4. **เหตุการณ์ (Incidents):** วงจรชีวิตของ Incident เมื่ออุปกรณ์ดับ การรับเรื่อง (Acknowledge) และการบันทึกผลกู้คืน
- ล็อกขนาดหน้าต่างคงที่ ไม่เด้งขยายตามปริมาณข้อความ พร้อมรองรับการเลื่อนอ่านด้วยลูกกลิ้งเมาส์ (Mouse Wheel) ได้อย่างลื่นไหล

---

## 📝 บันทึกการปรับปรุงล่าสุด (Changelog)

### เวอร์ชันอัปเดตล่าสุด (18 พฤศจิกายน 2569)
- 📡 **เพิ่มระบบตรวจสอบ SNMP v3 (USM - RFC 3414) คู่ขนานกับ SNMP v2c:**
  - ยกระดับความปลอดภัยจากการส่งรหัส Community String แบบ Plaintext ใน v2c เป็นระบบ User-based Security Model (USM) ใน v3
  - รองรับ 3 Security Levels: `authPriv` (ยืนยันตัวตน + เข้ารหัสข้อมูลแพ็กเก็ตด้วย AES-128 แนะนำสูงสุด), `authNoPriv`, `noAuthNoPriv`
  - ทำงานผ่านระบบ Asynchronous RFC 3414 Engine Discovery ตรวจสอบ EngineID และดึงค่า Uptime โดยตรง
  - จัดระเบียบหน้าต่างลงทะเบียนอุปกรณ์ให้มีปุ่มสลับแท็บ v2c / v3 และจัดช่องกรอกแบบ 2 คอลัมน์สมมาตรสวยงาม ไม่ตกบรรทัด
  - อัปเดตสคริปต์ `mock_switch.py` ให้จำลองการตอบสนองได้ทั้ง SNMP v2c และ SNMP v3
- 📖 **เพิ่มระบบคู่มือการใช้งาน (User Manual Modal) ที่ Footer ด้านล่างสุด:**
  - เพิ่มปุ่มลิงก์ "คู่มือการใช้งานระบบ" สไตล์เรียบเนียน ไร้กรอบ ข้าง "เว็บไซต์หลัก bru.ac.th"
  - รวบรวมวิธีใช้งาน 4 หมวดหมู่สำคัญ (ภาพรวม, ผังอาคาร, อุปกรณ์, เหตุการณ์)
  - ล็อกความสูงหน้าต่างคงที่ ไม่เด้งขยายตามเนื้อหา พร้อมเปิดให้ใช้ลูกกลิ้งเมาส์เลื่อนอ่านได้ลื่นไหล
- 🏢 **ตรึงโครงสร้างอาคาร 1–23 ถาวร (Fixed Campus Buildings):**
  - นำปุ่มลบอาคาร (Trash) และปุ่มเพิ่มอาคารออก เพื่อคงจำนวนอาคารตามผังแม่บทมหาวิทยาลัยจริง 23 อาคาร (รวมหอประชุม BRU DOME)
- 🐛 **แก้ไข Z-Index ของ Tooltip ในผังแผนที่:**
  - ปรับปรุง Layer ให้การ์ด Tooltip ลอยอยู่เหนือหมุดตัวเลขอุปกรณ์อย่างถูกต้อง ไม่โดนตัวเลขทับ
- 🛡️ **ยกระดับความปลอดภัยเครือข่ายและการจำกัดวง IP (IP Whitelisting & SSRF Protection):**
  - เพิ่มระบบตรวจสอบ IP Address ใน `backend/security.py` อนุญาตเฉพาะวงเครือข่ายมหาวิทยาลัย (`10.153.0.0/16` และ Private Subnet)
  - บล็อก Public IP ภายนอก และ IP ต้องห้าม เพื่อป้องกันช่องโหว่ SSRF และการสแกนระบบ
  - เพิ่มช่องเลือก **"🧪 ใช้อุปกรณ์จำลองสำหรับทดสอบ (Simulator / Mock Device)"** ในหน้าต่างลงทะเบียนอุปกรณ์ รองรับการทดสอบด้วย `mock_switch.py` และ `mock_devices.py` บน `127.0.0.1`
  - เพิ่มป้ายกำกับสถานะ **`🧪 จำลอง`** ในหน้ารายการอุปกรณ์และหน้าผังอาคาร
- 🎨 **แก้ไขสี Hover ใน Dark Mode:**
  - แก้ไขปุ่มตัวกรองสถานะในหน้าบันทึกเหตุการณ์ (Incidents) ไม่ให้กลืนเป็นสีขาวเมื่อนำเมาส์ไปชี้ในโหมดมืด
  - ปรับปรุงสี Hover บนการ์ดอุปกรณ์ในหน้าแดชบอร์ดและปุ่มเลือกอาคารให้คมชัด
- 🔒 **ปรับปรุงความปลอดภัย `.env.example`:**
  - ลบ Token และ Chat ID ตัวจริงออกจากไฟล์ตัวอย่าง ป้องกันข้อมูลรั่วไหลบน GitHub

### เวอร์ชัน (16 พฤศจิกายน 2569)
- ✨ **เพิ่มระบบ Light / Dark Mode**:
  - กำหนดโหมดสว่าง (Light Mode) สีขาวสะอาดตาเป็นค่าเริ่มต้น
  - เพิ่มปุ่มสลับโหมดกลมลอยตัวมุมขวาล่าง (`fixed bottom-5 right-5`)
  - ปรับ Welcome Banner บน Dashboard ให้เป็นสีสว่างพร้อมเฉดสีม่วง-ทองอ่อนในโหมดสว่าง และสีม่วงเข้มในโหมดมืด
  - ปรับแต่งหน้าผังอาคาร (Campus View), ตารางอุปกรณ์ (Devices), บันทึกเหตุการณ์ (Incidents), หน้าระบบตั้งค่า (Settings) และ Modal ทุกจุดให้รองรับทั้งสองโหมดอย่างไร้รอยต่อ
- 🎨 **ปรับโครงสร้าง Navbar เป็น 2 ระดับ (2-Tier Header)**:
  - แยกแถวแสดงตรามหาวิทยาลัยและสถานะ SLA (แถวบน) ออกจากแถบเมนูนำทาง (แถวล่าง)
  - จัดแถบเมนู 5 หมวดหลักให้อยู่กึ่งกลางหน้าจออย่างสมดุล สวยงาม และเว้นพื้นที่สำหรับฟังก์ชันเพิ่มเติม
- 🧹 **ปรับปรุงความเข้ากันได้ของ CSS**:
  - ตรวจสอบและแทนที่คลาส Tailwind CSS v4 ที่ไม่เป็นมาตรฐาน เพื่อให้แสดงผลได้ถูกต้องและสม่ำเสมอบนเบราว์เซอร์ทุกตัว (Chrome, Edge, Firefox, Safari)

---

## ⚡ เริ่มต้นใช้งาน (Quick Start)

### ข้อกำหนดเบื้องต้น (Prerequisites)
- **Python 3.10+** (แนะนำ 3.12+)
- **Node.js 18+** (สำหรับการ Build Frontend)

### 1. ติดตั้งไลบรารี Backend
```bash
pip install -r backend/requirements.txt
```

### 2. ตั้งค่าไฟล์สภาพแวดล้อม (`.env`)
คัดลอกไฟล์ `.env.example` เป็น `.env`:
```powershell
copy .env.example .env
```
*(หากต้องการใช้งานการแจ้งเตือน Telegram ให้ระบุ `TELEGRAM_BOT_TOKEN` และ `TELEGRAM_CHAT_ID` ในไฟล์ `.env` หรือตั้งค่าผ่านหน้าเว็บ)*

### 3. ติดตั้งและ Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### 4. เริ่มต้นเซิร์ฟเวอร์ UniPulse
```powershell
python -m uvicorn backend.main:app --port 8000 --reload
```
เปิดเบราว์เซอร์ไปที่: **`http://localhost:8000`** *(ระบบจะสร้างฐานข้อมูลและอาคาร 1–23 ให้อัตโนมัติในการรันครั้งแรก)*

### คำสั่งจัดการฐานข้อมูลเพิ่มเติม (Database Utilities)
- **เติมอาคาร 1–23 ในฐานข้อมูลเดิม:** `python seed_buildings.py`
- **ล้างฐานข้อมูลให้สะอาด (คงอาคาร 1–23):** `python reset_db.py`
- **นำเข้าข้อมูลตัวอย่างสำหรับสาธิต (Demo Devices & Logs):** `python -m backend.seed_data`

---

## 🧪 การทดสอบระบบ (Testing & Simulation)

### การทดสอบที่ 1: เชื่อมต่ออุปกรณ์จริงด้วย IP ในเครือข่าย
1. คลิกปุ่ม **"+ เพิ่มอุปกรณ์ใหม่"** บนหน้าเว็บ
2. กรอกชื่ออุปกรณ์ และ IP จริงในเครือข่าย (เช่น `10.153.0.10`) และเลือก **อาคาร** ที่ตั้งอยู่
3. เลือกวิธีตรวจสอบเป็น **`PING`** (ค่าเริ่มต้น)
4. กด **"บันทึกอุปกรณ์"** แล้วกดปุ่ม **"Ping"** ที่รายการอุปกรณ์ หรือดูที่เมนู **ผังอาคาร (Campus)**
5. ระบบจะแสดงสถานะ **`UP (ออนไลน์)`** สีเขียวพร้อมค่า Ping (ms) จริงทันที

---

### การทดสอบที่ 2: จำลองสวิตช์ด้วย SNMP v2c (`mock_switch.py`)
สคริปต์จำลองสวิตช์ที่รับคำสั่ง SNMP v2c บน `127.0.0.1` พอร์ต UDP 161:
1. เปิด PowerShell อีกหน้าต่าง แล้วรันคำสั่ง:
   ```powershell
   python mock_switch.py
   ```
2. เพิ่มอุปกรณ์ในเว็บโดยตั้งค่า IP เป็น `127.0.0.1`, วิธีตรวจ **`SNMP`**, พอร์ต `161`, Community `public`
3. หากกด `Ctrl + C` เพื่อปิด `mock_switch.py` สถานะจะเปลี่ยนเป็น **DOWN**, เปิด Incident และแจ้งเตือนเข้า Telegram ทันที และจะกู้คืนเป็น **ONLINE** อัตโนมัติเมื่อเปิดสคริปต์ใหม่

---

### การทดสอบที่ 3: จำลอง Switch & WiFi AP พร้อมทดสอบป้าย `!` บนแผนที่ (`mock_devices.py`)
สคริปต์ Interactive CLI Simulator สำหรับทดสอบสลับสถานะอุปกรณ์สองตัวพร้อมกัน:

1. **เพิ่มอุปกรณ์ทดสอบทั้ง 2 ตัวในหน้าเว็บ** (แนะนำให้เลือกอยู่ **อาคารเดียวกัน** เพื่อทดสอบบนผังแผนที่):
   - **ตัวที่ 1 (Switch):** ประเภท `NETWORK_SWITCH`, IP `127.0.0.1`, วิธีตรวจ **`SNMP`**, พอร์ต **`161`**, Community `public`
   - **ตัวที่ 2 (WiFi AP):** ประเภท `ACCESS_POINT`, IP `127.0.0.1`, วิธีตรวจ **`SNMP`**, พอร์ต **`162`**, Community `public`
2. **เปิด PowerShell รันคำสั่งจำลอง:**
   ```powershell
   python mock_devices.py
   ```
3. **กดปุ่มคีย์ลัดบนคีย์บอร์ดในหน้าต่างโปรแกรมจำลอง:**
   - กด **`[1]`** : สลับสถานะ Switch (พอร์ต `161`) ระหว่าง **ONLINE <-> OFFLINE**
   - กด **`[2]`** : สลับสถานะ WiFi AP (พอร์ต `162`) ระหว่าง **ONLINE <-> OFFLINE**
   - กด **`[3]`** : จำลอง Switch ไฟกระชาก/รีบูต (รีเซ็ต Uptime กลับเป็น `0s`)
   - กด **`[4]`** : จำลอง WiFi AP ไฟกระชาก/รีบูต (รีเซ็ต Uptime กลับเป็น `0s`)
   - กด **`[s]`** : แสดงสรุปสถานะปัจจุบันของอุปกรณ์จำลอง
   - กด **`[q]`** : ออกจากโปรแกรมจำลอง
4. **สังเกตผลบนผังแผนที่:** ไปที่เมนู **ผังอาคาร (Campus)** แล้วกด `[1]` เพื่อปิด Switch -> บนหมายเลขอาคารนั้นในผังแผนที่จะขึ้นสัญลักษณ์ **`!`** สีแดงกระพริบเตือน และเมื่อคลิกที่เลขอาคารจะเห็นอุปกรณ์ตัวนั้นขึ้น **`DOWN (ขาดการเชื่อมต่อ)`** ทันที!

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
unipulse/
├── agent/
│   ├── lab_pc_agent.py          # Script สำหรับส่ง Telemetry (CPU/RAM/Disk) จากเครื่องแล็บ
│   └── README.md
├── backend/
│   ├── main.py                  # FastAPI entrypoint, Lifespan auto-seeding & SPA serving
│   ├── config.py                # Environment configuration & defaults
│   ├── database.py              # SQLAlchemy async engine & session
│   ├── models.py                # Building, Room, Device, HealthLog, Incident models
│   ├── schemas.py               # Pydantic v2 schemas
│   ├── init_defaults.py         # Auto-seed อาคาร 1–23 เมื่อเริ่มต้นระบบด้วยฐานข้อมูลว่าง
│   ├── seed_data.py             # Seed demo university buildings, devices & incidents
│   ├── requirements.txt
│   ├── monitor/
│   │   ├── checker.py           # Thread-safe Ping, SNMP v2c, TCP Port, HTTP, PJLink checkers
│   │   └── scheduler.py         # Background periodic loop, uptime & recovery handling
│   ├── alerts/
│   │   └── telegram_notify.py   # Asynchronous Telegram Bot notification dispatcher
│   └── routers/
│       ├── devices.py           # Device CRUD, manual ping, telemetry, logs & incidents
│       ├── locations.py         # Campus buildings management
│       ├── incidents.py         # Incident acknowledge & resolution
│       ├── stats.py             # Dashboard statistics & SLA analytics
│       └── settings.py          # System settings & test alerts
├── frontend/
│   ├── public/
│   │   └── campus-map.jpg       # รูปภาพผังแม่บทมหาวิทยาลัยราชภัฏบุรีรัมย์
│   ├── src/
│   │   ├── components/
│   │   │   ├── CampusMap.tsx        # Interactive Campus Map พร้อมหมุดอาคาร 1–23 & ป้ายเตือน !
│   │   │   ├── CampusView.tsx       # หน้าผังอาคาร (สลับ Map / Grid) และสรุปรายอาคาร
│   │   │   ├── DashboardView.tsx    # Live matrix, KPI cards & quick ping check
│   │   │   ├── DevicesView.tsx      # ตารางจัดการอุปกรณ์ ค้นหา กรอง และ Export CSV
│   │   │   ├── DeviceModal.tsx      # ฟอร์มเพิ่ม/แก้ไขข้อมูลอุปกรณ์
│   │   │   ├── DeviceGraph.tsx      # Interactive SVG Performance & Latency Area Chart
│   │   │   ├── DeviceLogsModal.tsx  # หน้าต่างดูกราฟ ประวัติ Downtime และ Log สด
│   │   │   ├── IncidentsView.tsx    # จัดการเหตุการณ์ขัดข้องและบันทึกผลแก้ไข
│   │   │   ├── Navbar.tsx           # แถบนำทางหลักและตัวแจ้งเตือนสถานะ
│   │   │   ├── SettingsView.tsx     # ตั้งค่าเวลาตรวจสอบและเชื่อมต่อ Telegram Bot
│   │   │   └── UserManualModal.tsx  # หน้าต่างคู่มือการใช้งานระบบ (4 หมวดหมู่หลัก)
│   │   ├── utils/
│   │   │   └── date.ts          # จัดรูปแบบวันเวลาไทย (GMT+7) และคำนวณระยะเวลา
│   │   ├── api.ts               # Frontend API client
│   │   ├── types.ts             # TypeScript interfaces
│   │   └── App.tsx              # Main application layout & polling
│   └── package.json
├── mock_devices.py              # Interactive Switch (161) & WiFi AP (162) CLI simulator
├── mock_switch.py               # Dedicated SNMP Switch simulator (supports v2c & v3, Port 161)
├── seed_buildings.py            # สคริปต์เพิ่มอาคาร 1–23 เข้าฐานข้อมูลที่มีอยู่
├── reset_db.py                  # สคริปต์ล้างฐานข้อมูลและสร้างอาคาร 1–23 เริ่มต้น
├── docker-compose.yml           # Production Docker deployment
├── Dockerfile                   # Multi-stage production container build
├── .env.example                 # Example environment file
└── LICENSE                      # MIT License
```

---

## 📜 ใบอนุญาต (License)

โครงการนี้เผยแพร่ภายใต้ใบอนุญาต **[MIT License](LICENSE)** — คุณสามารถนำไปใช้งาน แก้ไข หรือต่อยอดในสถาบันการศึกษาของคุณได้อย่างอิสระโดยไม่มีค่าใช้จ่าย
