export interface Room {
  id: number;
  building_id: number;
  name: string;
  floor: number;
  type: string;
  responsible_person?: string;
  responsible_contact?: string;
  created_at: string;
}

export interface Building {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  rooms: Room[];
}

export interface Device {
  id: number;
  name: string;
  category: string;
  asset_number?: string;
  brand?: string;
  model_name?: string;
  building_id?: number;
  room_id?: number;
  ip_address: string;
  port?: number;
  mac_address?: string;
  check_type: 'PING' | 'SNMP' | 'PORT' | 'HTTP' | 'PJLINK' | 'AGENT';
  check_interval: number;
  snmp_community?: string;
  snmp_version?: string;
  http_path?: string;
  http_expected_code: number;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'MAINTENANCE' | 'UNKNOWN';
  online_since?: string;
  uptime_str?: string;
  last_seen?: string;
  response_time_ms?: number;
  consecutive_failures: number;
  is_active: boolean;
  description?: string;
  telemetry_data?: string;
  created_at: string;
  updated_at: string;
  building?: { name: string; code: string };
  room?: Room;
}

export interface HealthLog {
  id: number;
  device_id: number;
  status: string;
  response_time_ms?: number;
  message?: string;
  timestamp: string;
}

export interface Incident {
  id: number;
  device_id: number;
  title: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  started_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolution_note?: string;
  device?: Device;
}

export interface CategoryCount {
  category: string;
  total: number;
  online: number;
  offline: number;
}

export interface DashboardStats {
  total_devices: number;
  online_count: number;
  offline_count: number;
  warning_count: number;
  maintenance_count: number;
  system_health_percentage: number;
  open_incidents_count: number;
  categories: CategoryCount[];
}
