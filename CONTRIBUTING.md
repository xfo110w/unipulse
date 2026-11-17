# คู่มือการมีส่วนร่วมพัฒนา (Contributing to UniPulse)

ยินดีต้อนรับสู่งานพัฒนาโครงการ **UniPulse** ซึ่งเป็นระบบตรวจวัดอุปกรณ์และโครงสร้างพื้นฐานสำหรับมหาวิทยาลัยในรูปแบบ Open Source (MIT License)

## ข้อกำหนดและแนวทางการร่วมพัฒนา (Guidelines)

### 1. การเตรียมสภาพแวดล้อมเพื่อการพัฒนา (Development Setup)

#### ข้อกำหนดเบื้องต้น
- Python 3.10 ขึ้นไป
- Node.js 18 ขึ้นไป และ npm

#### ขั้นตอนการรันแบบ Development Mode
1. **Clone repository**:
   ```bash
   git clone https://github.com/your-org/unipulse.git
   cd unipulse
   ```

2. **ติดตั้งและรัน Backend**:
   ```bash
   pip install -r backend/requirements.txt
   python -m backend.seed_data   # สร้างฐานข้อมูลทดสอบ
   python -m uvicorn backend.main:app --reload --port 8000
   ```

3. **ติดตั้งและรัน Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   เว็บจะรันอยู่ที่ `http://localhost:5173` โดยจะ proxy คำขอ API ไปยัง `http://localhost:8000`

### 2. โครงสร้างโปรเจกต์ (Project Structure)
- `backend/` : FastAPI API server, SQLAlchemy ORM models, Background monitor (APScheduler), LINE & webhook dispatchers
- `frontend/` : React + TypeScript + Tailwind CSS UI Dashboard
- `agent/` : สคริปต์ตรวจวัดเครื่องลูกข่าย (Lab PC / IoT Edge Device)
- `Dockerfile` & `docker-compose.yml` : สำหรับการ deploy สภาพแวดล้อมโปรดักชัน

### 3. มาตรฐานการเขียนโค้ด (Coding Standards)
- **Backend**: ปฏิบัติตาม PEP 8, ใช้ Type Hints ใน Python, ใช้ Pydantic schemas สำหรับ Data Validation
- **Frontend**: เขียน TypeScript แบบ Strict, Component แยกโฟลเดอร์ให้ชัดเจน, ใช้ Lucide Icons
- **Git Commit**: ใช้ Conventional Commits เช่น `feat: add snmp v3 support`, `fix: handle ping timeout gracefully`

### 4. การส่ง Pull Request
1. Fork repository ไปยังบัญชีของคุณ
2. สร้าง feature branch (`git checkout -b feature/amazing-feature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'feat: add amazing feature'`)
4. Push ไปยัง branch (`git push origin feature/amazing-feature`)
5. เปิด Pull Request พร้อมคำอธิบาย
