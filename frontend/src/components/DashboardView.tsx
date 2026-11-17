import React from 'react';
import { 
  CheckCircle2, XCircle, AlertTriangle, 
  Wrench, ShieldCheck, ArrowUpRight, 
  Tv, Monitor, Network, Wifi, Server, Volume2, BatteryCharging, Cpu, Plus, RefreshCw, History, TrendingUp, Edit3,
  Stethoscope, MapPin, Zap, Building2
} from 'lucide-react';
import { DashboardStats, Device, Incident } from '../types';
import { formatThaiTime } from '../utils/date';

interface DashboardViewProps {
  stats: DashboardStats | null;
  devices: Device[];
  incidents: Incident[];
  checkingIds?: number[];
  onOpenAddModal: () => void;
  onNavigateTab: (tab: string) => void;
  onCheckDevice: (id: number) => void;
  onViewLogs?: (device: Device) => void;
  onEditDevice?: (device: Device) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  devices,
  incidents,
  checkingIds,
  onOpenAddModal,
  onNavigateTab,
  onCheckDevice,
  onViewLogs,
  onEditDevice,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PROJECTOR': return <Tv className="h-5 w-5 text-sky-400" />;
      case 'PC_LAB': return <Monitor className="h-5 w-5 text-indigo-400" />;
      case 'NETWORK_SWITCH': return <Network className="h-5 w-5 text-emerald-400" />;
      case 'ACCESS_POINT': return <Wifi className="h-5 w-5 text-teal-400" />;
      case 'SERVER': return <Server className="h-5 w-5 text-purple-400" />;
      case 'AUDIO_DSP': return <Volume2 className="h-5 w-5 text-amber-400" />;
      case 'UPS': return <BatteryCharging className="h-5 w-5 text-lime-400" />;
      case 'IOT_SENSOR': return <Cpu className="h-5 w-5 text-orange-400" />;
      default: return <Server className="h-5 w-5 text-slate-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'PROJECTOR': return 'โปรเจกเตอร์ & จอสัมผัส';
      case 'PC_LAB': return 'คอมพิวเตอร์แล็บ (Workstations)';
      case 'NETWORK_SWITCH': return 'สวิตช์ & เครือข่ายแกนหลัก';
      case 'ACCESS_POINT': return 'WiFi Access Point';
      case 'SERVER': return 'เซิร์ฟเวอร์ & Data Center';
      case 'AUDIO_DSP': return 'เครื่องเสียงห้องบรรยาย (AV DSP)';
      case 'UPS': return 'เครื่องสำรองไฟ (UPS)';
      case 'IOT_SENSOR': return 'เซนเซอร์สภาพแวดล้อม IoT';
      default: return category;
    }
  };

  const openIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const offlineDevices = devices.filter(d => d.status === 'OFFLINE');

  return (
    <div className="space-y-6">
      {/* Welcome Banner - BRU Royal Purple & Gold Identity */}
      <div className="bg-gradient-to-r from-purple-50/90 via-white to-amber-50/50 border border-purple-200/80 shadow-xs dark:bg-gradient-to-r dark:from-[#2a0845] dark:via-[#1b0b2e] dark:to-[#110822] dark:border-purple-500/30 dark:shadow-xl dark:shadow-purple-950/30 rounded-2xl p-6 relative overflow-hidden transition-colors">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-purple-600/5 dark:bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <img 
              src="/bru-logo.png" 
              alt="BRU Emblem" 
              className="h-16 w-auto hidden sm:block drop-shadow-lg object-contain shrink-0" 
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs bg-amber-100/90 text-amber-900 border border-amber-300/80 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/35 font-semibold px-2.5 py-0.5 rounded-full">
                  มหาวิทยาลัยราชภัฏบุรีรัมย์ • Buriram Rajabhat University
                </span>
                <span className="text-xs text-purple-800/80 dark:text-purple-300/70 font-mono">• เฝ้าระวังอัตโนมัติ 24/7</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
                ระบบเฝ้าระวังและตรวจวัดสถานะโครงสร้างพื้นฐานดิจิทัล (BRU UniPulse)
              </h1>
              <p className="text-xs md:text-sm text-slate-600 dark:text-purple-200/80 mt-1 max-w-2xl">
                ศูนย์คอมพิวเตอร์และเทคโนโลยีสารสนเทศ — ตรวจสอบการเชื่อมต่อสวิตช์เครือข่าย WiFi Access Point และระบบดิจิทัลประจำอาคาร 1 ถึง 23 แบบรวมศูนย์
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 self-start md:self-auto">
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-800 hover:to-purple-900 text-amber-200 border border-purple-900/40 font-medium px-4 py-2.5 rounded-xl shadow-md shadow-purple-900/15 hover:shadow-lg transition text-sm cursor-pointer dark:bg-gradient-to-r dark:from-purple-700 dark:to-purple-600 dark:hover:from-purple-600 dark:hover:to-purple-500 dark:border-amber-400/40 dark:shadow-purple-950/50"
            >
              <Plus className="h-4 w-4 text-amber-300" />
              <span>เพิ่มอุปกรณ์ใหม่</span>
            </button>
            <button
              onClick={() => onNavigateTab('devices')}
              className="flex items-center space-x-2 bg-white hover:bg-purple-50/60 text-purple-900 border border-purple-200/90 font-medium px-4 py-2.5 rounded-xl shadow-2xs hover:border-purple-300 transition text-sm cursor-pointer dark:bg-[#1b1233] dark:hover:bg-[#261947] dark:text-purple-200 dark:border-purple-800/60"
            >
              <span>ดูตารางอุปกรณ์</span>
              <ArrowUpRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Issues / Offline Devices Alert Banner (ดูอะไรมีปัญหาตรงไหน & ดูสาเหตุ) */}
      {(offlineDevices.length > 0 || openIncidents.length > 0) && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4.5 text-rose-900 space-y-3 shadow-xs dark:bg-rose-950/25 dark:border-rose-500/40 dark:text-rose-200 dark:shadow-lg dark:shadow-rose-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200 dark:border-rose-500/20 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h2 className="font-bold text-rose-900 dark:text-rose-200 text-base">
                  ⚠️ จุดที่พบปัญหาในขณะนี้: มี {offlineDevices.length || openIncidents.length} อุปกรณ์สัญญาณขาดหาย
                </h2>
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
                  ระบบไม่ได้รับการตอบสนองจาก IP ปลายทาง กรุณาตรวจสอบวง Subnet/VLAN, การบล็อก ICMP หรือเปิดดูสาเหตุวิเคราะห์ด้านล่าง
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('incidents')}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              ประวัติเหตุการณ์ทั้งหมด ({openIncidents.length})
            </button>
          </div>

          {/* List of broken devices showing EXACTLY what and where */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {offlineDevices.map((dev) => (
              <div 
                key={dev.id} 
                className="bg-white border border-rose-200/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs dark:bg-slate-900/90 dark:border-rose-500/30"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{dev.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/30">
                      DOWN
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                    <Building2 className="h-3.5 w-3.5 text-purple-600 dark:text-indigo-400 shrink-0" />
                    <span className="text-indigo-700 dark:text-sky-300 font-semibold">{dev.building?.name || 'ไม่ระบุอาคาร'}</span>
                    {dev.room && (
                      <>
                        <span>•</span>
                        <span className="text-amber-700 dark:text-amber-300 font-medium">ชั้น {dev.room.floor}</span>
                        <span>•</span>
                        <span className="text-slate-600 dark:text-slate-300">{dev.room.name}</span>
                      </>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    IP: {dev.ip_address} • ตรวจสอบด้วย {dev.check_type}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {onViewLogs && (
                    <button
                      onClick={() => onViewLogs(dev)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-600/30 dark:hover:bg-rose-600 dark:text-rose-200 dark:hover:text-white dark:border-rose-500/50 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-2xs"
                      title="วิเคราะห์ว่าทำไมเชื่อมต่อไม่ได้ พร้อมวิธีแก้ไข"
                    >
                      <Stethoscope className="h-3.5 w-3.5" />
                      <span>ดูสาเหตุ & วิธีแก้</span>
                    </button>
                  )}

                  <button
                    onClick={() => onCheckDevice(dev.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-indigo-600 dark:text-slate-300 dark:hover:text-white dark:border-slate-700 transition cursor-pointer"
                    title="ทดสอบ Ping ซ้ำ"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards - BRU Themed */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Devices */}
        <div className="bg-white border border-slate-200/90 dark:bg-[#150f28]/90 dark:border-purple-900/50 rounded-2xl p-4 shadow-xs dark:shadow-md dark:shadow-purple-950/20 hover:border-purple-300 dark:hover:border-purple-700/60 transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-purple-200/70">
            <span className="text-xs font-medium">อุปกรณ์ทั้งหมด</span>
            <Server className="h-4 w-4 text-purple-700 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stats?.total_devices ?? 0}</span>
            <span className="text-xs text-slate-400 dark:text-purple-300/60">เครื่อง</span>
          </div>
          <div className="mt-2 text-xs text-purple-800 dark:text-purple-300/80 flex items-center space-x-1">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            <span>เฝ้าระวัง 24/7 (BRU)</span>
          </div>
        </div>

        {/* Online Devices */}
        <div className="bg-white border border-emerald-200 dark:bg-[#150f28]/90 dark:border-emerald-500/25 rounded-2xl p-4 shadow-xs dark:shadow-md dark:shadow-purple-950/20 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-medium">พร้อมใช้งาน (Online)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{stats?.online_count ?? 0}</span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-500/80 font-mono">({stats?.system_health_percentage ?? 0}%)</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600/90 dark:text-emerald-400/80">
            เชื่อมต่อปกติ ตอบสนองเร็ว
          </div>
        </div>

        {/* Offline Devices */}
        <div className="bg-white border border-rose-200 dark:bg-[#150f28]/90 dark:border-rose-500/25 rounded-2xl p-4 shadow-xs dark:shadow-md dark:shadow-purple-950/20 hover:border-rose-400 dark:hover:border-rose-500/50 transition">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-medium">ขัดข้อง (Offline)</span>
            <XCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">{stats?.offline_count ?? 0}</span>
            <span className="text-xs text-rose-500 dark:text-rose-400/80">เครื่อง</span>
          </div>
          <div className="mt-2 text-xs text-rose-600/90 dark:text-rose-400/80">
            {(stats?.offline_count || 0) > 0 ? 'ส่งแจ้งเตือน Telegram แล้ว' : 'ไม่มีอุปกรณ์ขัดข้อง'}
          </div>
        </div>

        {/* Warnings */}
        <div className="bg-white border border-amber-200 dark:bg-[#150f28]/90 dark:border-amber-500/25 rounded-2xl p-4 shadow-xs dark:shadow-md dark:shadow-purple-950/20 hover:border-amber-400 dark:hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-medium">เตือนล่วงหน้า (Warning)</span>
            <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">{stats?.warning_count ?? 0}</span>
            <span className="text-xs text-amber-600/80 dark:text-amber-400/80">เครื่อง</span>
          </div>
          <div className="mt-2 text-xs text-amber-600/90 dark:text-amber-400/80">
            Latency สูง หรือใกล้ขีดจำกัด
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white border border-slate-200/90 dark:bg-[#150f28]/90 dark:border-purple-900/50 rounded-2xl p-4 shadow-xs dark:shadow-md dark:shadow-purple-950/20 hover:border-purple-300 dark:hover:border-purple-700/60 transition col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-purple-200/70">
            <span className="text-xs font-medium">ปิดปรับปรุง</span>
            <Wrench className="h-4 w-4 text-slate-400 dark:text-purple-300" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-700 dark:text-purple-200 tracking-tight">{stats?.maintenance_count ?? 0}</span>
            <span className="text-xs text-slate-400 dark:text-purple-300/60">เครื่อง</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-purple-300/60">
            พักการตรวจจับชั่วคราว
          </div>
        </div>
      </div>

      {/* Main Grid: Category Overview & Classroom Quick Watch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Breakdown */}
        <div className="bg-white border border-slate-200/90 dark:bg-[#140e26]/90 dark:border-purple-900/50 rounded-2xl p-5 shadow-xs dark:shadow-lg lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white text-base">ประเภทอุปกรณ์ในระบบ</h2>
            <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 dark:text-amber-400/80 dark:bg-amber-400/10 dark:border-amber-400/20 px-2 py-0.5 rounded-full font-mono font-medium">{stats?.categories.length ?? 0} หมวดหมู่</span>
          </div>

          <div className="space-y-3">
            {stats?.categories.map((cat) => {
              const pct = cat.total > 0 ? Math.round((cat.online / cat.total) * 100) : 0;
              return (
                <div
                  key={cat.category}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 dark:bg-[#1a1233]/80 dark:border-purple-900/40 dark:hover:border-purple-700/60 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800 dark:bg-[#241747] dark:text-purple-200">
                        {getCategoryIcon(cat.category)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-white">{getCategoryLabel(cat.category)}</div>
                        <div className="text-[11px] text-slate-500 dark:text-purple-300/70">
                          {cat.online}/{cat.total} ออนไลน์ ({pct}%)
                        </div>
                      </div>
                    </div>
                    {cat.offline > 0 ? (
                      <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                        {cat.offline} ดับ
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                        100% OK
                      </span>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-[#0d0918] rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        pct === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : pct >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Classroom & Essential Equipment Quick-View */}
        <div className="bg-white border border-slate-200/90 dark:bg-[#140e26]/90 dark:border-purple-900/50 rounded-2xl p-5 shadow-xs dark:shadow-lg lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white text-base">อุปกรณ์ประจำอาคาร & จุดสำคัญ (Live Matrix)</h2>
              <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-0.5">กดปุ่ม Ping เพื่อทดสอบสถานะเครือข่ายแบบเรียลไทม์</p>
            </div>
            <button
              onClick={() => onNavigateTab('devices')}
              className="text-xs text-purple-700 hover:text-purple-900 dark:text-amber-400 dark:hover:text-amber-300 font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>ดูทั้งหมด ({devices.length})</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {devices.slice(0, 8).map((device) => {
              const isOnline = device.status === 'ONLINE';
              const isWarning = device.status === 'WARNING';
              const isOffline = device.status === 'OFFLINE';

              return (
                <div
                  key={device.id}
                  className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 flex flex-col justify-between hover:border-purple-300 hover:bg-white hover:shadow-xs dark:bg-[#191133]/90 dark:border-purple-900/40 dark:hover:bg-[#231747] dark:hover:border-purple-600/50 dark:hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-800 dark:bg-[#251747] dark:text-purple-200 mt-0.5">
                        {getCategoryIcon(device.category)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span 
                            onClick={() => onViewLogs && onViewLogs(device)}
                            className="text-sm font-semibold text-slate-900 dark:text-white leading-tight hover:text-purple-700 dark:hover:text-amber-300 cursor-pointer transition"
                            title="คลิกเพื่อดูประวัติและกราฟย้อนหลัง"
                          >
                            {device.name}
                          </span>
                          {onEditDevice && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditDevice(device);
                              }}
                              title="แก้ไขข้อมูลอุปกรณ์ (Edit)"
                              className="p-1 rounded-md text-slate-400 hover:text-purple-700 dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-[#251747] transition cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        {(device.brand || device.asset_number) && (
                          <div className="text-[11px] text-slate-600 dark:text-purple-200/80 mt-0.5 flex items-center space-x-2">
                            {device.brand && <span className="font-medium text-slate-700 dark:text-slate-300">{device.brand}</span>}
                            {device.asset_number && (
                              <span className="font-mono text-purple-800 bg-purple-100 border border-purple-200 dark:text-amber-300 dark:bg-amber-400/15 dark:border-amber-400/30 px-1.5 py-0.2 rounded text-[10px]">
                                {device.asset_number}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-slate-500 dark:text-purple-300/70 mt-0.5 flex items-center space-x-1">
                          <Building2 className="h-3 w-3 text-purple-600 dark:text-amber-400 shrink-0" />
                          <span className="text-slate-700 dark:text-purple-200">{device.building?.name || 'ไม่ระบุอาคาร'}</span>
                          {device.room && (
                            <>
                              <span>•</span>
                              <span className="text-purple-800 dark:text-amber-300 font-semibold">ชั้น {device.room.floor}</span>
                              <span>•</span>
                              <span>{device.room.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status pill */}
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                        isOnline
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                          : isWarning
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                          : isOffline
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30 animate-pulse'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-purple-950 dark:text-slate-300 dark:border-purple-800'
                      }`}
                    >
                      {isOnline ? 'UP (ออนไลน์)' : isOffline ? 'DOWN (ดับ)' : device.status}
                    </span>
                  </div>

                  {/* Warning strip if offline */}
                  {isOffline && (
                    <div className="mt-2.5 py-1 px-2 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/25 flex items-center justify-between text-[11px]">
                      <span className="text-rose-700 dark:text-rose-300 flex items-center space-x-1 truncate mr-2">
                        <AlertTriangle className="h-3 w-3 text-rose-500 dark:text-rose-400 shrink-0" />
                        <span className="truncate">สัญญาณขาดหาย ({device.check_type})</span>
                      </span>
                      {onViewLogs && (
                        <button
                          onClick={() => onViewLogs(device)}
                          className="text-rose-700 dark:text-rose-200 hover:underline font-semibold text-[10px] shrink-0 cursor-pointer"
                        >
                          🩺 ดูสาเหตุ & แก้
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-purple-900/40 flex items-center justify-between text-xs text-slate-500 dark:text-purple-300/70">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-slate-700 dark:text-purple-200">{device.ip_address}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-[#251747] px-1.5 py-0.5 rounded dark:text-amber-300/80 font-mono border border-slate-200 dark:border-purple-800/40">
                        {device.check_type}
                      </span>
                      {device.response_time_ms && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold">
                          {device.response_time_ms}ms
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {onViewLogs && (
                        <button
                          onClick={() => onViewLogs(device)}
                          title="ดูกราฟวิเคราะห์และประวัติย้อนหลัง"
                          className="px-2 py-1 rounded-md text-[11px] font-medium transition flex items-center space-x-1 cursor-pointer bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 dark:bg-[#241747] dark:hover:bg-purple-800 dark:hover:text-white dark:text-purple-200 dark:border-purple-800/60"
                        >
                          <TrendingUp className="h-3 w-3 text-purple-600 dark:text-amber-400" />
                          <span>กราฟ</span>
                        </button>
                      )}
                      {(() => {
                        const isChecking = checkingIds?.includes(device.id);
                        return (
                          <button
                            onClick={() => onCheckDevice(device.id)}
                            disabled={isChecking}
                            title="ทดสอบส่งคำสั่งตรวจจับสถานะทันที"
                            className={`px-2 py-1 rounded-md text-[11px] font-medium transition flex items-center space-x-1 cursor-pointer border ${
                              isChecking
                                ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-900/60 dark:text-amber-300 dark:border-amber-400/40 cursor-not-allowed'
                                : 'bg-purple-50 hover:bg-purple-700 hover:text-white text-purple-800 border-purple-200 dark:bg-[#241747] dark:hover:bg-gradient-to-r dark:hover:from-purple-700 dark:hover:to-purple-600 dark:hover:text-amber-200 dark:text-purple-200 dark:border-purple-800/60'
                            }`}
                          >
                            <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin text-purple-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-400'}`} />
                            <span>{isChecking ? 'Ping...' : 'Ping'}</span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
