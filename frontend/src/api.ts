import type { DashboardStats, Device, Building, Room, Incident, HealthLog, BuildingPin } from './types';

const BASE_URL = '/api/v1';

export const api = {
  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${BASE_URL}/stats/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Devices
  async getDevices(params?: { category?: string; status?: string; search?: string; building_id?: number; room_id?: number }): Promise<Device[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.building_id) query.append('building_id', params.building_id.toString());
    if (params?.room_id) query.append('room_id', params.room_id.toString());

    const res = await fetch(`${BASE_URL}/devices?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch devices');
    return res.json();
  },

  async getDevice(id: number): Promise<Device> {
    const res = await fetch(`${BASE_URL}/devices/${id}`);
    if (!res.ok) throw new Error('Failed to fetch device');
    return res.json();
  },

  async createDevice(device: Partial<Device>): Promise<Device> {
    const res = await fetch(`${BASE_URL}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(device),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'ไม่สามารถบันทึกอุปกรณ์ได้');
    }
    return res.json();
  },

  async updateDevice(id: number, device: Partial<Device>): Promise<Device> {
    const res = await fetch(`${BASE_URL}/devices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(device),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'ไม่สามารถอัปเดตอุปกรณ์ได้');
    }
    return res.json();
  },

  async deleteDevice(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/devices/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete device');
  },

  async checkDeviceNow(id: number): Promise<{ status: string; response_time_ms: number; message: string }> {
    const res = await fetch(`${BASE_URL}/devices/${id}/check`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger check');
    return res.json();
  },

  async getDeviceLogs(id: number, limit = 50): Promise<HealthLog[]> {
    const res = await fetch(`${BASE_URL}/devices/${id}/logs?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch device logs');
    return res.json();
  },

  async getDeviceIncidents(id: number): Promise<Incident[]> {
    const res = await fetch(`${BASE_URL}/devices/${id}/incidents`);
    if (!res.ok) throw new Error('Failed to fetch device incidents');
    return res.json();
  },

  // Locations
  async getBuildings(): Promise<Building[]> {
    const res = await fetch(`${BASE_URL}/locations/buildings`);
    if (!res.ok) throw new Error('Failed to fetch buildings');
    return res.json();
  },

  async createBuilding(data: { name: string; code: string; description?: string }): Promise<Building> {
    const res = await fetch(`${BASE_URL}/locations/buildings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create building');
    }
    return res.json();
  },

  async deleteBuilding(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/locations/buildings/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete building');
  },

  async getRooms(building_id?: number): Promise<Room[]> {
    const query = building_id ? `?building_id=${building_id}` : '';
    const res = await fetch(`${BASE_URL}/locations/rooms${query}`);
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return res.json();
  },

  async createRoom(data: { building_id: number; name: string; floor: number; type?: string; responsible_person?: string; responsible_contact?: string }): Promise<Room> {
    const res = await fetch(`${BASE_URL}/locations/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create room');
    }
    return res.json();
  },

  async deleteRoom(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/locations/rooms/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete room');
  },

  // Incidents
  async getIncidents(status?: string): Promise<Incident[]> {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${BASE_URL}/incidents${query}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async acknowledgeIncident(id: number, acknowledged_by: string): Promise<Incident> {
    const res = await fetch(`${BASE_URL}/incidents/${id}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledged_by }),
    });
    if (!res.ok) throw new Error('Failed to acknowledge incident');
    return res.json();
  },

  async resolveIncident(id: number, resolution_note: string): Promise<Incident> {
    const res = await fetch(`${BASE_URL}/incidents/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution_note }),
    });
    if (!res.ok) throw new Error('Failed to resolve incident');
    return res.json();
  },

  // Settings
  async getNotificationSettings(): Promise<{
    channel: string;
    telegram_configured: boolean;
    telegram_chat_id: string;
    telegram_bot_token_masked: string;
    config_source: string;
  }> {
    const res = await fetch(`${BASE_URL}/settings/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notification settings');
    return res.json();
  },

  async testNotification(): Promise<{ status: string; message: string }> {
    const res = await fetch(`${BASE_URL}/settings/test-notification`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Test notification failed');
    return data;
  },

  // Building Pins (Google Maps custom pinning)
  async getBuildingPins(): Promise<BuildingPin[]> {
    const res = await fetch(`${BASE_URL}/locations/building-pins`);
    if (!res.ok) throw new Error('Failed to fetch building pins');
    return res.json();
  },

  async saveBuildingPin(pin: { building_id: number; lat: number; lng: number }): Promise<BuildingPin> {
    const res = await fetch(`${BASE_URL}/locations/building-pins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pin),
    });
    if (!res.ok) throw new Error('Failed to save building pin');
    return res.json();
  },

  async deleteBuildingPin(buildingId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/locations/building-pins/${buildingId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete building pin');
  },

  // BRU SSO Authentication
  async login(username: string, password: string): Promise<{ success: boolean; message: string; username: string; token?: string; data?: any }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้หรือรหัสผ่าน');
    }
    return data;
  }
};
