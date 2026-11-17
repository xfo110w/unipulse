# UniPulse Client Agent (สคริปต์ตรวจวัดเครื่องลูกข่าย)

สคริปต์นี้ใช้สำหรับติดตั้งลงในคอมพิวเตอร์ห้องแล็บ (Computer Lab Workstations), เครื่องอาจารย์ผู้สอน, หรืออุปกรณ์ IoT (เช่น Raspberry Pi) ภายในมหาวิทยาลัย เพื่อส่งสถานะการทำงาน (Heartbeat) และทรัพยากรระบบ (CPU, RAM, Disk, Uptime) กลับมายังเซิร์ฟเวอร์ UniPulse แบบเรียลไทม์

## คุณสมบัติ (Features)
- 🚀 **Zero Heavy Dependencies**: ใช้ไลบรารีมาตรฐานของ Python ได้ทันที หรือติดตั้ง `psutil` เพื่อความแม่นยำสูงสุด
- ⏱️ **ส่ง Heartbeat สม่ำเสมอ**: กำหนดความถี่ได้ตามต้องการ (ค่าเริ่มต้นทุก 30 วินาที)
- 🖥️ **รองรับทั้ง Windows และ Linux**: รันได้ทั้งบน Windows 10/11 ในห้องแล็บ หรือ Ubuntu Server

## วิธีการใช้งาน (Usage)

### 1. ลงทะเบียนอุปกรณ์ในหน้าเว็บ UniPulse
1. ไปที่เมนู **Devices (จัดการอุปกรณ์)** -> คลิก **Add Device (เพิ่มอุปกรณ์)**
2. เลือก Check Type เป็น **`AGENT`**
3. จดจำเลข **ID** ของอุปกรณ์ เช่น ID `#6`

### 2. รันสคริปต์บนเครื่องคอมพิวเตอร์
```bash
# ติดตั้ง psutil เสริม (แนะนำ)
pip install psutil

# สั่งรันเชื่อมต่อกับ UniPulse Server
python lab_pc_agent.py --server http://<IP_เครื่อง_SERVER>:8000 --device-id 6 --interval 30
```

### 3. ตั้งให้รันอัตโนมัติเมื่อเปิดเครื่อง (Auto-start)
- **Windows**: นำ shortcut ของคำสั่งไปวางในโฟลเดอร์ Startup (`shell:startup`) หรือตั้งผ่าน **Windows Task Scheduler**
- **Linux**: สร้างไฟล์ systemd service ใน `/etc/systemd/system/unipulse-agent.service`
