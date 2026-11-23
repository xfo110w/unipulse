from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.database import Base

class Building(Base):
    __tablename__ = "buildings"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    rooms: Mapped[List["Room"]] = relationship("Room", back_populates="building", cascade="all, delete-orphan")
    devices: Mapped[List["Device"]] = relationship("Device", back_populates="building")

class Room(Base):
    __tablename__ = "rooms"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    building_id: Mapped[int] = mapped_column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    floor: Mapped[int] = mapped_column(Integer, default=1)
    type: Mapped[str] = mapped_column(String(50), default="CLASSROOM") # CLASSROOM, COMPUTER_LAB, SERVER_ROOM, AUDITORIUM, MEETING_ROOM
    responsible_person: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    responsible_contact: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    building: Mapped["Building"] = relationship("Building", back_populates="rooms")
    devices: Mapped[List["Device"]] = relationship("Device", back_populates="room")

class Device(Base):
    __tablename__ = "devices"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), default="NETWORK_SWITCH") # NETWORK_SWITCH, ACCESS_POINT, OTHER
    
    # Asset & Hardware Information (เลขครุภัณฑ์ และ ยี่ห้อ/รุ่น)
    asset_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    brand: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    model_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    building_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("buildings.id", ondelete="SET NULL"), nullable=True)
    room_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True)
    
    ip_address: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    port: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mac_address: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    
    check_type: Mapped[str] = mapped_column(String(30), default="PING") # PING, SNMP, PORT, HTTP, PJLINK, AGENT
    check_interval: Mapped[int] = mapped_column(Integer, default=30) # seconds
    
    snmp_community: Mapped[Optional[str]] = mapped_column(String(50), default="public", nullable=True)
    snmp_version: Mapped[Optional[str]] = mapped_column(String(10), default="v2c", nullable=True) # v2c, v3
    snmp_username: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    snmp_security_level: Mapped[Optional[str]] = mapped_column(String(20), default="authPriv", nullable=True) # noAuthNoPriv, authNoPriv, authPriv
    snmp_auth_protocol: Mapped[Optional[str]] = mapped_column(String(10), default="SHA", nullable=True) # SHA, MD5
    snmp_auth_key: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    snmp_priv_protocol: Mapped[Optional[str]] = mapped_column(String(10), default="AES", nullable=True) # AES, DES
    snmp_priv_key: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    http_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    http_expected_code: Mapped[int] = mapped_column(Integer, default=200)
    
    status: Mapped[str] = mapped_column(String(20), default="UNKNOWN") # ONLINE, OFFLINE, WARNING, MAINTENANCE, UNKNOWN
    online_since: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True) # เริ่มออนไลน์เมื่อใด สำหรับคำนวณ Uptime
    uptime_str: Mapped[Optional[str]] = mapped_column(String(100), nullable=True) # ข้อความ Uptime เช่น "14 วัน 5 ชม."
    last_seen: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    response_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    consecutive_failures: Mapped[int] = mapped_column(Integer, default=0)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_simulation: Mapped[bool] = mapped_column(Boolean, default=False) # True หากเป็นอุปกรณ์จำลอง (mock_switch / mock_devices)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    telemetry_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # JSON format for CPU/RAM/Disk or AV state
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    building: Mapped[Optional["Building"]] = relationship("Building", back_populates="devices")
    room: Mapped[Optional["Room"]] = relationship("Room", back_populates="devices")
    health_logs: Mapped[List["HealthLog"]] = relationship("HealthLog", back_populates="device", cascade="all, delete-orphan")
    incidents: Mapped[List["Incident"]] = relationship("Incident", back_populates="device", cascade="all, delete-orphan")

class HealthLog(Base):
    __tablename__ = "health_logs"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    device_id: Mapped[int] = mapped_column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False) # ONLINE, OFFLINE, WARNING
    response_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    message: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    
    device: Mapped["Device"] = relationship("Device", back_populates="health_logs")

class Incident(Base):
    __tablename__ = "incidents"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    device_id: Mapped[int] = mapped_column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="OPEN") # OPEN, ACKNOWLEDGED, RESOLVED
    severity: Mapped[str] = mapped_column(String(20), default="CRITICAL") # CRITICAL, WARNING, INFO
    
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    acknowledged_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    resolution_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    device: Mapped["Device"] = relationship("Device", back_populates="incidents")

class SystemSetting(Base):
    __tablename__ = "system_settings"
    
    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BuildingPin(Base):
    __tablename__ = "building_pins"
    
    building_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
