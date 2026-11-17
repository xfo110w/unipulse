import React, { useState, useEffect } from 'react';
import { X, Server, Building2, Globe, Settings2 } from 'lucide-react';
import { Device, Building } from '../types';

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deviceData: Partial<Device>) => void;
  device?: Device | null;
  buildings: Building[];
}

export const DeviceModal: React.FC<DeviceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  device,
  buildings,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('NETWORK_SWITCH');
  const [assetNumber, setAssetNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [modelName, setModelName] = useState('');
  const [buildingId, setBuildingId] = useState<number | undefined>(undefined);
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState<number | undefined>(undefined);
  const [checkType, setCheckType] = useState<'PING' | 'SNMP' | 'PORT' | 'HTTP' | 'PJLINK' | 'AGENT'>('PING');
  const [snmpCommunity, setSnmpCommunity] = useState('public');
  const [checkInterval, setCheckInterval] = useState(30);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('ONLINE');

  const prevIsOpenRef = React.useRef(false);
  const prevDeviceIdRef = React.useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      return;
    }

    const justOpened = !prevIsOpenRef.current;
    const deviceChanged = device?.id !== prevDeviceIdRef.current;
    prevIsOpenRef.current = true;
    prevDeviceIdRef.current = device?.id;

    // Only reset/initialize form when opening the modal or switching device being edited
    if (justOpened || deviceChanged) {
      if (device) {
        setName(device.name);
        setCategory(device.category || 'NETWORK_SWITCH');
        setAssetNumber(device.asset_number || '');
        setBrand(device.brand || '');
        setModelName(device.model_name || '');
        setBuildingId(device.building_id);
        setIpAddress(device.ip_address);
        setPort(device.port);
        setCheckType(device.check_type);
        setSnmpCommunity(device.snmp_community || 'public');
        setCheckInterval(device.check_interval || 30);
        setDescription(device.description || '');
        setStatus(device.status);
      } else {
        setName('');
        setCategory('NETWORK_SWITCH');
        setAssetNumber('');
        setBrand('');
        setModelName('');
        setBuildingId(buildings.length > 0 ? buildings[0].id : undefined);
        setIpAddress('');
        setPort(undefined);
        setCheckType('PING');
        setSnmpCommunity('public');
        setCheckInterval(30);
        setDescription('');
        setStatus('ONLINE');
      }
    }
  }, [isOpen, device]);

  if (!isOpen) return null;

  const sortedBuildings = [...buildings].sort((a, b) => {
    const numA = parseInt(a.code, 10) || parseInt(a.name.replace(/\D/g, ''), 10) || a.id;
    const numB = parseInt(b.code, 10) || parseInt(b.name.replace(/\D/g, ''), 10) || b.id;
    return numA - numB;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      name,
      category,
      asset_number: assetNumber.trim() || undefined,
      brand: brand.trim() || undefined,
      model_name: modelName.trim() || undefined,
      building_id: buildingId,
      room_id: undefined,
      ip_address: ipAddress,
      port: checkType === 'SNMP' && !port ? 161 : (port ? Number(port) : undefined),
      check_type: checkType,
      check_interval: Number(checkInterval),
      snmp_community: checkType === 'SNMP' ? snmpCommunity : undefined,
      snmp_version: checkType === 'SNMP' ? 'v2c' : undefined,
      description,
      status: status as any,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#140e26] border border-slate-200 dark:border-purple-900/60 rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-purple-900/60">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Server className="h-5 w-5 text-purple-600 dark:text-amber-400" />
            <span>{device ? 'แก้ไขข้อมูลอุปกรณ์ (มรภ.บุรีรัมย์)' : 'ลงทะเบียนอุปกรณ์ใหม่ — มรภ.บุรีรัมย์'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-purple-300 dark:hover:text-white dark:hover:bg-purple-900/50 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Device Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่ออุปกรณ์ (Device Name) *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น Core Switch ชุมสาย MDF หรือ WiFi AP ห้อง 205"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 dark:focus:border-amber-400"
            />
          </div>

          {/* Asset Number, Brand, Model */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                🏷️ เลขครุภัณฑ์ (Asset No.)
              </label>
              <input
                type="text"
                placeholder="เช่น ศทส.-67-0042"
                value={assetNumber}
                onChange={(e) => setAssetNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ยี่ห้อ (Brand / Vendor)
              </label>
              <input
                type="text"
                placeholder="เช่น Cisco, Aruba, Ruijie"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 dark:focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                รุ่น (Model)
              </label>
              <input
                type="text"
                placeholder="เช่น Catalyst 2960-X, AP-515"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 dark:focus:border-amber-400"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                หมวดหมู่อุปกรณ์ (Category) *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 dark:focus:border-amber-400 font-medium"
              >
                <option value="NETWORK_SWITCH">⚡ สวิตช์เครือข่าย (Network Switch / Router)</option>
                <option value="ACCESS_POINT">📶 อุปกรณ์กระจายสัญญาณไวไฟ (WiFi Access Point)</option>
                <option value="SERVER">🖥️ เซิร์ฟเวอร์ (Server / Data Center)</option>
                <option value="OTHER">📦 อุปกรณ์อื่นๆ (Other)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                สถานะตั้งต้น (Initial Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 dark:focus:border-amber-400"
              >
                <option value="ONLINE">ONLINE (เปิดใช้งาน)</option>
                <option value="MAINTENANCE">MAINTENANCE (พักตรวจชั่วคราว)</option>
              </select>
            </div>
          </div>

          {/* Building Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
              <Building2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>อาคารที่ติดตั้ง (Building)</span>
            </label>
            <select
              value={buildingId || ''}
              onChange={(e) => setBuildingId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 dark:focus:border-amber-400"
            >
              <option value="">-- ไม่ระบุอาคาร (Unassigned) --</option>
              {sortedBuildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* IP Address & Port */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                IP Address หรือ Hostname *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น 192.168.1.50 หรือ projector.lh1.ac.th"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-600 dark:focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Port (ตัวเลือกเสริม)
              </label>
              <input
                type="number"
                placeholder="เช่น 4352, 80"
                value={port || ''}
                onChange={(e) => setPort(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-600 dark:focus:border-amber-400"
              />
            </div>
          </div>

          {/* Check Type & Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                วิธีการตรวจจับสถานะ (Check Type) *
              </label>
              <select
                value={checkType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setCheckType(val);
                  if (val === 'SNMP' && !port) setPort(161);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 dark:focus:border-amber-400"
              >
                <option value="PING">ICMP Ping (ตรวจว่าเปิด/ดับ ด้วยความเร็วสูง)</option>
                <option value="SNMP">SNMP v2c Check (สำหรับ Switch/Router/AP พอร์ต 161 ดึง Uptime)</option>
                <option value="PJLINK">PJLink Protocol (มาตรฐานโปรเจกเตอร์ Epson/Panasonic พอร์ต 4352)</option>
                <option value="PORT">TCP Port Check (ตรวจสอบว่าเปิดพอร์ตหรือไม่)</option>
                <option value="HTTP">HTTP/HTTPS Endpoint Check (เว็บเซิร์ฟเวอร์/API)</option>
                <option value="AGENT">Agent Telemetry Heartbeat (ใช้สคริปต์ส่งค่า CPU/RAM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ความถี่ในการตรวจสอบ (วินาที)
              </label>
              <input
                type="number"
                min="10"
                max="3600"
                value={checkInterval}
                onChange={(e) => setCheckInterval(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 dark:focus:border-amber-400"
              />
            </div>
          </div>

          {/* SNMP Settings (Shown if SNMP is selected) */}
          {checkType === 'SNMP' && (
            <div className="bg-sky-50 dark:bg-slate-800/60 border border-sky-200 dark:border-sky-500/30 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center space-x-2 text-sky-700 dark:text-sky-400 font-semibold text-xs">
                <span>📡 การตั้งค่า SNMP v2c (Network Switch Monitoring)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SNMP Community String
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น public หรือ monitor_read"
                    value={snmpCommunity}
                    onChange={(e) => setSnmpCommunity(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SNMP Port (UDP)
                  </label>
                  <input
                    type="number"
                    value={port || 161}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                💡 ระบบจะส่งคำสั่ง SNMP GET ไปยัง OID <code className="text-sky-600 dark:text-sky-300 font-bold">1.3.6.1.2.1.1.3.0 (sysUpTime)</code> เพื่อยืนยันว่าสวิตช์ทำงานอยู่และดึงระยะเวลาเปิดเครื่อง
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              คำอธิบาย / รหัสครุภัณฑ์ / วันหมดประกัน (Description)
            </label>
            <textarea
              rows={2}
              placeholder="เช่น หมายเลขครุภัณฑ์: คพ.66-0042, วันหมดประกัน: ม.ค. 2028, ผู้ดูแล: นายสมชาย"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 dark:focus:border-amber-400"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-purple-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-[#1b1233] dark:hover:bg-[#281a4b] dark:text-purple-200 text-sm dark:border-purple-900/50 transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-amber-200 border border-amber-400/50 text-sm font-semibold shadow-md dark:shadow-purple-950/40 transition cursor-pointer"
            >
              {device ? 'บันทึกการแก้ไข' : 'ลงทะเบียนอุปกรณ์'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
