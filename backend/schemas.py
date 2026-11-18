from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field, ConfigDict

# Building Schemas
class BuildingBase(BaseModel):
    name: str = Field(..., example="อาคารเรียนรวม 1 (Lecture Hall 1)")
    code: str = Field(..., example="LH1")
    description: Optional[str] = None

class BuildingCreate(BuildingBase):
    pass

class RoomRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    building_id: int
    name: str
    floor: int
    type: str
    responsible_person: Optional[str] = None
    responsible_contact: Optional[str] = None
    created_at: datetime

class BuildingRead(BuildingBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    rooms: List[RoomRead] = []

# Room Schemas
class RoomBase(BaseModel):
    building_id: int
    name: str = Field(..., example="ห้อง 301")
    floor: int = 1
    type: str = "CLASSROOM"
    responsible_person: Optional[str] = None
    responsible_contact: Optional[str] = None

class RoomCreate(RoomBase):
    pass

# Device Schemas
class DeviceBase(BaseModel):
    name: str = Field(..., example="Cisco Catalyst 2960-X (Floor 2)")
    category: str = Field("NETWORK_SWITCH", example="NETWORK_SWITCH") # NETWORK_SWITCH, ACCESS_POINT, OTHER
    asset_number: Optional[str] = Field(None, example="ศทส.-67-0042")
    brand: Optional[str] = Field(None, example="Cisco")
    model_name: Optional[str] = Field(None, example="Catalyst 2960-X")
    building_id: Optional[int] = None
    room_id: Optional[int] = None
    ip_address: str = Field(..., example="192.168.1.101")
    port: Optional[int] = Field(None, example=161)
    mac_address: Optional[str] = None
    check_type: str = Field("SNMP", example="SNMP") # PING, SNMP, PORT, HTTP, PJLINK, AGENT
    check_interval: int = Field(30, ge=5, le=3600)
    snmp_community: Optional[str] = "public"
    snmp_version: Optional[str] = "v2c"
    http_path: Optional[str] = None
    http_expected_code: int = 200
    is_active: bool = True
    is_simulation: bool = Field(False, example=False)
    description: Optional[str] = None

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    asset_number: Optional[str] = None
    brand: Optional[str] = None
    model_name: Optional[str] = None
    building_id: Optional[int] = None
    room_id: Optional[int] = None
    ip_address: Optional[str] = None
    port: Optional[int] = None
    mac_address: Optional[str] = None
    check_type: Optional[str] = None
    check_interval: Optional[int] = None
    snmp_community: Optional[str] = None
    snmp_version: Optional[str] = None
    http_path: Optional[str] = None
    http_expected_code: Optional[int] = None
    is_active: Optional[bool] = None
    is_simulation: Optional[bool] = None
    status: Optional[str] = None
    description: Optional[str] = None

class DeviceRead(DeviceBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    online_since: Optional[datetime] = None
    uptime_str: Optional[str] = None
    last_seen: Optional[datetime] = None
    response_time_ms: Optional[float] = None
    consecutive_failures: int
    telemetry_data: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    building: Optional[BuildingBase] = None
    room: Optional[RoomRead] = None

class HealthLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    device_id: int
    status: str
    response_time_ms: Optional[float] = None
    message: Optional[str] = None
    timestamp: datetime

class IncidentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    device_id: int
    title: str
    status: str
    severity: str
    started_at: datetime
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolution_note: Optional[str] = None
    device: Optional[DeviceRead] = None

class IncidentAcknowledge(BaseModel):
    acknowledged_by: str = Field(..., example="สมชาย ช่างเทคนิค")

class IncidentResolve(BaseModel):
    resolution_note: str = Field(..., example="แก้ไขสาย LAN หลุด และรีสตาร์ทสวิตช์แล้ว")

# Telemetry Push from Lab PC or IoT Device Agent
class TelemetryPush(BaseModel):
    cpu_percent: Optional[float] = None
    memory_percent: Optional[float] = None
    disk_percent: Optional[float] = None
    temperature_c: Optional[float] = None
    uptime_seconds: Optional[int] = None
    extra: Optional[Dict[str, Any]] = None

# Dashboard Stats
class CategoryCount(BaseModel):
    category: str
    total: int
    online: int
    offline: int

class DashboardStats(BaseModel):
    total_devices: int
    online_count: int
    offline_count: int
    warning_count: int
    maintenance_count: int
    system_health_percentage: float
    open_incidents_count: int
    categories: List[CategoryCount] = []

class SystemSettingSchema(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class SystemSettingUpdate(BaseModel):
    value: str
