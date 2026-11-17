import React, { useState } from 'react';
import { 
  Search, Plus, Download, RefreshCw, Trash2, Edit3, 
  Network, Wifi, Server, Tag, MapPin, TrendingUp, Building2
} from 'lucide-react';
import { Device, Building } from '../types';

interface DevicesViewProps {
  devices: Device[];
  buildings: Building[];
  checkingIds?: number[];
  onOpenAddModal: () => void;
  onEditDevice: (device: Device) => void;
  onDeleteDevice: (id: number) => void;
  onCheckDevice: (id: number) => void;
  onViewLogs: (device: Device) => void;
}

export const DevicesView: React.FC<DevicesViewProps> = ({
  devices,
  buildings,
  checkingIds,
  onOpenAddModal,
  onEditDevice,
  onDeleteDevice,
  onCheckDevice,
  onViewLogs,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('ALL');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'NETWORK_SWITCH': return <Network className="h-4 w-4 text-emerald-400" />;
      case 'ACCESS_POINT': return <Wifi className="h-4 w-4 text-sky-400" />;
      case 'SERVER': return <Server className="h-4 w-4 text-purple-400" />;
      default: return <Server className="h-4 w-4 text-slate-400" />;
    }
  };

  // Filter devices
  const filteredDevices = devices.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.ip_address.toLowerCase().includes(search.toLowerCase()) ||
      (d.asset_number && d.asset_number.toLowerCase().includes(search.toLowerCase())) ||
      (d.brand && d.brand.toLowerCase().includes(search.toLowerCase())) ||
      (d.model_name && d.model_name.toLowerCase().includes(search.toLowerCase())) ||
      (d.building?.name && d.building.name.toLowerCase().includes(search.toLowerCase())) ||
      (d.room?.name && d.room.name.toLowerCase().includes(search.toLowerCase())) ||
      (d.description && d.description.toLowerCase().includes(search.toLowerCase()));

    const matchCategory = selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchStatus = selectedStatus === 'ALL' || d.status === selectedStatus;
    const matchBuilding = selectedBuilding === 'ALL' || d.building_id?.toString() === selectedBuilding;

    return matchSearch && matchCategory && matchStatus && matchBuilding;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID,Device Name,Category,Asset Number,Brand,Model,Building,IP Address,Port,Check Type,Status,Uptime,Latency (ms),Last Seen'];
    const rows = filteredDevices.map((d) => [
      d.id,
      `"${d.name.replace(/"/g, '""')}"`,
      d.category,
      `"${d.asset_number || ''}"`,
      `"${d.brand || ''}"`,
      `"${d.model_name || ''}"`,
      `"${d.building?.name || ''}"`,
      d.ip_address,
      d.port || '',
      d.check_type,
      d.status === 'ONLINE' ? 'UP' : d.status === 'OFFLINE' ? 'DOWN' : d.status,
      `"${d.uptime_str || ''}"`,
      d.response_time_ms || '',
      d.last_seen || '',
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_devices_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions - BRU Themed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
            <Network className="h-6 w-6 text-purple-700 dark:text-amber-400" />
            <span>ระบบตรวจสอบสถานะอุปกรณ์และเครือข่าย — มหาวิทยาลัยราชภัฏบุรีรัมย์</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-purple-200/70 mt-1">
            ศูนย์คอมพิวเตอร์และเทคโนโลยีสารสนเทศ มรภ.บุรีรัมย์ — สวิตช์เครือข่าย, WiFi Access Point, และเซิร์ฟเวอร์ ประจำอาคาร 1–23
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 dark:bg-[#17102e] dark:hover:bg-[#251947] dark:text-purple-200 dark:border-purple-900/60 px-3.5 py-2 rounded-xl text-sm font-medium transition cursor-pointer shadow-xs"
          >
            <Download className="h-4 w-4 text-purple-700 dark:text-amber-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-800 text-amber-200 border border-purple-600 px-4 py-2 rounded-xl text-sm font-medium transition shadow-md dark:shadow-purple-950/40 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-amber-300" />
            <span>เพิ่มอุปกรณ์ (Add Device)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col md:flex-row gap-3 shadow-xs dark:bg-[#140e26]/90 dark:border-purple-900/50">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 dark:text-purple-300/60 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่ออุปกรณ์, เลขครุภัณฑ์, ยี่ห้อ, IP, หรืออาคาร มรภ.บุรีรัมย์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 dark:bg-[#0f091d] dark:border-purple-900/60 dark:text-white dark:placeholder-purple-300/40 dark:focus:border-amber-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-purple-600 dark:bg-[#0f091d] dark:border-purple-900/60 dark:text-purple-200 dark:focus:border-amber-400 font-medium"
          >
            <option value="ALL">📦 อุปกรณ์ทั้งหมด ({devices.length})</option>
            <option value="NETWORK_SWITCH">⚡ สวิตช์เครือข่าย (Network Switches)</option>
            <option value="ACCESS_POINT">📶 อุปกรณ์ไวไฟ (Access Points)</option>
            <option value="SERVER">🖥️ เซิร์ฟเวอร์ (Servers)</option>
          </select>

          {/* Building Filter */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-purple-600 dark:bg-[#0f091d] dark:border-purple-900/60 dark:text-purple-200 dark:focus:border-amber-400"
          >
            <option value="ALL">ทุกอาคาร (มรภ.บุรีรัมย์)</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id.toString()}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-purple-600 dark:bg-[#0f091d] dark:border-purple-900/60 dark:text-purple-200 dark:focus:border-amber-400 font-medium"
          >
            <option value="ALL">ทุกสถานะ (All Status)</option>
            <option value="ONLINE">🟢 UP (ออนไลน์)</option>
            <option value="OFFLINE">🔴 DOWN (ดับ/ออฟไลน์)</option>
            <option value="WARNING">🟡 WARNING (เตือน)</option>
          </select>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs dark:bg-[#140e26]/90 dark:border-purple-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-purple-200/90">
            <thead className="bg-slate-50 text-xs text-slate-600 uppercase tracking-wider border-b border-slate-200 dark:bg-[#1a1133] dark:text-purple-300 dark:border-purple-900/60">
              <tr>
                <th className="px-5 py-3.5">อุปกรณ์ / เลขครุภัณฑ์ / ยี่ห้อ</th>
                <th className="px-4 py-3.5">ตำแหน่งที่ตั้ง (อาคาร)</th>
                <th className="px-4 py-3.5">IP Address / พอร์ต</th>
                <th className="px-4 py-3.5">วิธีตรวจ (Check)</th>
                <th className="px-4 py-3.5">สถานะ (Status)</th>
                <th className="px-4 py-3.5">Uptime (เปิดมานาน)</th>
                <th className="px-4 py-3.5">Latency</th>
                <th className="px-4 py-3.5 text-right">การจัดการ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400 dark:text-slate-500">
                    ไม่พบข้อมูลอุปกรณ์ตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => {
                  const isOnline = device.status === 'ONLINE';
                  const isWarning = device.status === 'WARNING';
                  const isOffline = device.status === 'OFFLINE';

                  return (
                    <tr
                      key={device.id}
                      className="hover:bg-purple-50/40 dark:hover:bg-slate-800/40 transition duration-150"
                    >
                      {/* Name & Hardware Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 dark:bg-slate-900 dark:border-slate-700/50 dark:text-purple-300 mt-0.5">
                            {getCategoryIcon(device.category)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                              <span>{device.name}</span>
                            </div>
                            
                            {/* Brand & Model */}
                            {(device.brand || device.model_name) && (
                              <div className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-0.5">
                                <span>{device.brand}</span>
                                {device.model_name && <span className="text-slate-400"> • {device.model_name}</span>}
                              </div>
                            )}

                            {/* Asset Tag */}
                            {device.asset_number ? (
                              <div className="inline-flex items-center space-x-1 mt-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                                <Tag className="h-3 w-3" />
                                <span>{device.asset_number}</span>
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">ไม่มีเลขครุภัณฑ์</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Location: Building */}
                      <td className="px-4 py-4 text-xs">
                        <div className="font-medium text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
                          <Building2 className="h-3.5 w-3.5 text-purple-700 dark:text-indigo-400 shrink-0" />
                          <span>{device.building?.name || '— (ไม่ระบุอาคาร)'}</span>
                        </div>
                      </td>

                      {/* IP & Port */}
                      <td className="px-4 py-4 text-xs font-mono">
                        <div className="text-slate-800 dark:text-slate-200 font-semibold">{device.ip_address}</div>
                        {device.port && <div className="text-slate-400 text-[11px]">Port: {device.port}</div>}
                      </td>

                      {/* Check Type */}
                      <td className="px-4 py-4">
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                          device.check_type === 'SNMP'
                            ? 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-500/20 dark:border-sky-500/40 dark:text-sky-300'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300'
                        }`}>
                          {device.check_type === 'SNMP' ? 'SNMP v2c' : device.check_type}
                        </span>
                        {device.check_type === 'SNMP' && device.snmp_community && (
                          <div className="text-[10px] text-sky-600 dark:text-sky-400 font-mono mt-0.5">comm: {device.snmp_community}</div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">ตรวจทุก {device.check_interval}วิ</div>
                      </td>

                      {/* Status: UP / DOWN */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                            isOnline
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                              : isWarning
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                              : isOffline
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30 animate-pulse'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isOnline ? 'bg-emerald-500' : isOffline ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{isOnline ? 'UP (ออนไลน์)' : isOffline ? 'DOWN (ดับ)' : device.status}</span>
                        </span>
                      </td>

                      {/* Uptime */}
                      <td className="px-4 py-4 text-xs font-mono">
                        {isOnline ? (
                          <div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {device.uptime_str || 'ออนไลน์'}
                            </div>
                            <div className="text-[10px] text-slate-400">เปิดต่อเนื่อง</div>
                          </div>
                        ) : (
                          <div className="text-rose-600 dark:text-rose-400 font-semibold">
                            — ดับอยู่ (Down)
                          </div>
                        )}
                      </td>

                      {/* Latency */}
                      <td className="px-4 py-4 text-xs font-mono">
                        {device.response_time_ms ? (
                          <span className={device.response_time_ms > 150 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                            {device.response_time_ms} ms
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Ping Check Button */}
                          {(() => {
                            const isChecking = checkingIds?.includes(device.id);
                            return (
                              <button
                                onClick={() => onCheckDevice(device.id)}
                                disabled={isChecking}
                                title="ตรวจสอบสถานะทันที (Check Now)"
                                className={`p-1.5 rounded-lg transition cursor-pointer border ${
                                  isChecking
                                    ? 'bg-purple-100 text-purple-900 border-purple-300 cursor-not-allowed'
                                    : 'bg-slate-100 hover:bg-purple-700 hover:text-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:hover:bg-purple-700 dark:text-slate-300 dark:hover:text-white dark:border-slate-700'
                                }`}
                              >
                                <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                              </button>
                            );
                          })()}

                          {/* Logs / History / Graph Button */}
                          <button
                            onClick={() => onViewLogs(device)}
                            title="ดูกราฟและประวัติสถานะย้อนหลัง (Performance Graph & Logs)"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white dark:border-slate-700 transition cursor-pointer"
                          >
                            <TrendingUp className="h-3.5 w-3.5 text-purple-700 dark:text-sky-400" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => onEditDevice(device)}
                            title="แก้ไขข้อมูล (Edit)"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white dark:border-slate-700 transition cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => onDeleteDevice(device.id)}
                            title="ลบอุปกรณ์ (Delete)"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 dark:bg-slate-800 dark:hover:bg-rose-600/30 dark:text-slate-400 dark:hover:text-rose-300 dark:border-slate-700 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
