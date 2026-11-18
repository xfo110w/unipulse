import React, { useState } from 'react';
import { 
  Building2, AlertTriangle, 
  Tv, Monitor, Server, Wifi, Network, X, Activity,
  Zap, TrendingUp, Stethoscope, Edit3, RefreshCw, Map, LayoutGrid
} from 'lucide-react';
import { Building, Device } from '../types';
import { api } from '../api';
import { CampusMap } from './CampusMap';

interface CampusViewProps {
  buildings: Building[];
  devices: Device[];
  onCheckDevice: (id: number) => void;
  onSelectDevice: (device: Device) => void;
  onEditDevice?: (device: Device) => void;
  onRefresh?: () => void;
}

export const CampusView: React.FC<CampusViewProps> = ({
  buildings,
  devices,
  onCheckDevice,
  onSelectDevice,
  onEditDevice,
  onRefresh,
}) => {
  const sortedBuildings = [...buildings].sort((a, b) => {
    const numA = parseInt(a.code, 10) || parseInt(a.name.replace(/\D/g, ''), 10) || a.id;
    const numB = parseInt(b.code, 10) || parseInt(b.name.replace(/\D/g, ''), 10) || b.id;
    return numA - numB;
  });

  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(
    sortedBuildings.length > 0 ? sortedBuildings[0].id : null
  );
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [checkingIds, setCheckingIds] = useState<number[]>([]);

  const selectedBuilding = sortedBuildings.find((b) => b.id === selectedBuildingId) || (sortedBuildings.length > 0 ? sortedBuildings[0] : null);

  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'NETWORK_SWITCH': return <Network className="h-4 w-4 text-emerald-400" />;
      case 'ACCESS_POINT': return <Wifi className="h-4 w-4 text-sky-400" />;
      case 'PROJECTOR': return <Tv className="h-4 w-4 text-sky-400" />;
      case 'PC_LAB': return <Monitor className="h-4 w-4 text-indigo-400" />;
      default: return <Server className="h-4 w-4 text-slate-400" />;
    }
  };

  const handleManualCheck = async (id: number) => {
    setCheckingIds((prev) => [...prev, id]);
    try {
      await onCheckDevice(id);
    } finally {
      setCheckingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  // Building Stats calculation
  const bDevices = selectedBuilding ? devices.filter((d) => d.building_id === selectedBuilding.id) : [];
  const bOnline = bDevices.filter((d) => d.status === 'ONLINE');
  const bOffline = bDevices.filter((d) => d.status === 'OFFLINE');
  const bHealthPct = bDevices.length > 0 ? Math.round((bOnline.length / bDevices.length) * 100) : 100;

  const validLatencies = bOnline
    .filter((d) => d.response_time_ms !== null && d.response_time_ms !== undefined)
    .map((d) => d.response_time_ms as number);
  const avgLatency = validLatencies.length > 0
    ? (validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length).toFixed(1)
    : null;

  const switchCount = bDevices.filter((d) => d.category === 'NETWORK_SWITCH').length;
  const apCount = bDevices.filter((d) => d.category === 'ACCESS_POINT').length;

  // Render a compact device row
  const renderDeviceRow = (d: Device) => {
    const isChecking = checkingIds.includes(d.id);
    const isDown = d.status === 'OFFLINE';

    return (
      <div
        key={d.id}
        className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
          isDown 
            ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-500/30' 
            : 'bg-white border-slate-200/90 hover:border-purple-300 shadow-xs dark:bg-slate-900/70 dark:border-slate-800/80 dark:hover:border-slate-700'
        }`}
      >
        <div 
          className="flex items-center space-x-2.5 truncate mr-2 cursor-pointer flex-1"
          onClick={() => onSelectDevice(d)}
          title="คลิกเพื่อดูผลวิเคราะห์และกราฟ"
        >
          <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800 dark:bg-[#251747] dark:text-purple-200 shrink-0">
            {getDeviceIcon(d.category)}
          </div>
          <div className="truncate">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-900 dark:text-white font-semibold text-xs truncate hover:text-purple-700 dark:hover:text-amber-300">
                {d.name}
              </span>
              {d.brand && (
                <span className="text-slate-500 dark:text-slate-400 text-[10px] hidden sm:inline">
                  ({d.brand})
                </span>
              )}
              {d.asset_number && (
                <span className="font-mono text-purple-800 bg-purple-100 border border-purple-200 dark:text-amber-400 dark:bg-amber-500/10 px-1.5 py-0.2 rounded text-[10px] hidden md:inline">
                  {d.asset_number}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center space-x-2">
              <span>{d.ip_address}</span>
              {d.is_simulation && (
                <span className="text-[10px] font-sans px-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                  จำลอง
                </span>
              )}
              <span>•</span>
              <span className="text-slate-600 dark:text-slate-300">{d.check_type}</span>
              {d.response_time_ms && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{d.response_time_ms}ms</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right action & status controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex items-center space-x-1.5 ${
              d.status === 'ONLINE'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                : d.status === 'WARNING'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
                : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 animate-pulse ring-1 ring-rose-500/40'
            }`}
          >
            {d.status === 'OFFLINE' ? (
              <>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span>DOWN (ขาดการเชื่อมต่อ)</span>
              </>
            ) : d.status === 'ONLINE' ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>UP (ออนไลน์)</span>
              </>
            ) : (
              <span>{d.status}</span>
            )}
          </span>

          {onEditDevice && (
            <button
              onClick={() => onEditDevice(d)}
              className="p-1 rounded-md text-slate-400 hover:text-purple-700 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="แก้ไขข้อมูลอุปกรณ์"
            >
              <Edit3 className="h-3 w-3" />
            </button>
          )}

          <button
            onClick={() => onSelectDevice(d)}
            className="px-2 py-1 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-white dark:text-slate-300 dark:border-slate-700 transition flex items-center space-x-1 cursor-pointer"
            title="ดูกราฟและวิเคราะห์ปัญหา"
          >
            <TrendingUp className="h-3 w-3 text-purple-700 dark:text-sky-400" />
            <span className="hidden sm:inline">กราฟ</span>
          </button>

          <button
            onClick={() => handleManualCheck(d.id)}
            disabled={isChecking}
            className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center space-x-1 cursor-pointer border ${
              isChecking
                ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-900/60 dark:text-amber-300 dark:border-amber-400/40 cursor-not-allowed'
                : 'bg-purple-50 hover:bg-purple-700 hover:text-white text-purple-800 border-purple-200 dark:bg-[#241747] dark:hover:bg-purple-700 dark:hover:text-white dark:text-purple-200 dark:border-purple-800/60'
            }`}
            title="ทดสอบ Ping ทันที"
          >
            <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin text-indigo-300' : 'text-emerald-400'}`} />
            <span>{isChecking ? 'Ping...' : 'Ping'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Building - BRU Themed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
            <Building2 className="h-6 w-6 text-purple-700 dark:text-amber-400" />
            <span>ผังอาคารและจุดติดตั้งอุปกรณ์ — มหาวิทยาลัยราชภัฏบุรีรัมย์</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-purple-200/70 mt-1">
            วิทยาเขตหลัก มรภ.บุรีรัมย์ — ตรวจสอบสถานะและคุณภาพสัญญาณเครือข่าย อาคาร 1 ถึง {buildings.length} (รวมหอประชุม, BRU DOME)
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          {/* View mode toggle: Map vs Grid */}
          <div className="bg-slate-100 border border-slate-200 dark:bg-[#150e28] dark:border-purple-900/50 rounded-xl p-1 flex items-center space-x-1 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-purple-700 text-white shadow-xs dark:bg-gradient-to-r dark:from-purple-800 dark:to-purple-700 dark:text-amber-200 dark:border-amber-400/40 dark:shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-purple-300/70 dark:hover:text-white'
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              <span>ผังแผนที่ มรภ.บุรีรัมย์</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-purple-700 text-white shadow-xs dark:bg-gradient-to-r dark:from-purple-800 dark:to-purple-700 dark:text-amber-200 dark:border-amber-400/40 dark:shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-purple-300/70 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>รายชื่ออาคาร 1-23</span>
            </button>
          </div>
        </div>
      </div>

      {buildings.length === 0 ? (
        <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Building2 className="h-12 w-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">กำลังโหลดข้อมูลผังอาคาร 1–23...</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            หากข้อมูลไม่แสดง กรุณารีเฟรชหน้าจอ หรือตรวจสอบการเชื่อมต่อกับเซิร์ฟเวอร์
          </p>
        </div>
      ) : (
        <>
          {/* Interactive Campus Map View */}
          {viewMode === 'map' && (
            <CampusMap
              buildings={sortedBuildings}
              devices={devices}
              selectedBuildingId={selectedBuilding?.id || null}
              onSelectBuilding={(id) => {
                setSelectedBuildingId(id);
                setTimeout(() => {
                  const el = document.getElementById('building-details-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 50);
              }}
            />
          )}

          {/* Quick Building Selector: Grid of อาคาร 1 ถึง 23 */}
          {viewMode === 'grid' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs dark:bg-slate-900/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-300 flex items-center space-x-1.5">
                  <Building2 className="h-4 w-4 text-purple-700 dark:text-amber-400" />
                  <span>เลือกอาคารสำหรับตรวจดูสถานะสัญญาณ (อาคาร 1 ถึง {buildings.length}):</span>
                </span>
                <span className="text-[11px] text-slate-400">คลิกเลือกอาคารเพื่อดูรายละเอียดสัญญาณ</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {sortedBuildings.map((b) => {
                  const isSelected = selectedBuilding?.id === b.id;
                  const devList = devices.filter((d) => d.building_id === b.id);
                  const hasOffline = devList.some((d) => d.status === 'OFFLINE');

                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBuildingId(b.id)}
                      className={`relative p-2 rounded-xl border text-xs font-medium transition cursor-pointer flex flex-col items-center justify-center text-center ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-700 to-purple-800 border-purple-600 text-amber-200 shadow-md ring-2 ring-purple-400/40 dark:from-purple-800 dark:to-purple-900 dark:text-amber-300 dark:border-amber-400/50'
                          : hasOffline
                          ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-900/40'
                          : devList.length > 0
                          ? 'bg-slate-50 border-slate-200/90 text-slate-700 hover:border-purple-300 hover:bg-purple-50/40 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-purple-950/60 dark:hover:border-purple-600/50'
                          : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold">{b.name}</span>
                        {hasOffline ? (
                          <span className="flex h-2 w-2 relative" title="มีอุปกรณ์ดับ">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                        ) : devList.length > 0 ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" title="อุปกรณ์ออนไลน์" />
                        ) : null}
                      </div>

                      <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                        {devList.length > 0 ? `${devList.length} เครื่อง` : 'ยังไม่มีอุปกรณ์'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Building Details & Full Signal Report */}
          {selectedBuilding && (
            <div id="building-details-section" className="space-y-5 scroll-mt-6">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-5 shadow-xs dark:bg-[#150e28] dark:border-purple-900/50">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700/50 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedBuilding.name}</h2>
                      <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full dark:bg-slate-800 dark:text-slate-400 font-mono">
                        Code: {selectedBuilding.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {selectedBuilding.description || 'ภาพรวมระบบสัญญาณเครือข่ายและอุปกรณ์ประจำอาคาร'}
                    </p>
                  </div>
                </div>

                {/* Building Signal Health Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                  {/* Health & Signal SLA */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 dark:bg-slate-900/80 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>สุขภาพสัญญาณ (Signal SLA)</span>
                      <Activity className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div className="mt-1.5 flex items-baseline space-x-2">
                      <span className={`text-2xl font-bold ${bHealthPct === 100 ? 'text-emerald-600 dark:text-emerald-400' : bHealthPct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {bHealthPct}%
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        ({bOnline.length}/{bDevices.length} ออนไลน์)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all ${bHealthPct === 100 ? 'bg-emerald-500' : bHealthPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${bHealthPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Average Latency */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 dark:bg-slate-900/80 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>ความหน่วงเฉลี่ย (Avg Latency)</span>
                      <Zap className="h-4 w-4 text-amber-500 dark:text-sky-400" />
                    </div>
                    <div className="mt-1.5 flex items-baseline space-x-1.5">
                      <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                        {avgLatency ? `${avgLatency}` : '—'}
                      </span>
                      <span className="text-xs text-purple-700 dark:text-sky-400 font-medium">{avgLatency ? 'ms' : 'ไม่มีข้อมูล'}</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {avgLatency ? 'ความเร็วตอบสนองปกติ' : 'ยังไม่มีผลตรวจสด'}
                    </div>
                  </div>

                  {/* Devices Breakdown */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 dark:bg-slate-900/80 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>อุปกรณ์เครือข่าย</span>
                      <Network className="h-4 w-4 text-purple-700 dark:text-indigo-400" />
                    </div>
                    <div className="mt-1.5 flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">{bDevices.length}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">เครื่อง</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                      <span>สวิตช์: {switchCount}</span>
                      <span>•</span>
                      <span>WiFi AP: {apCount}</span>
                    </div>
                  </div>

                  {/* Connection Status */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 dark:bg-slate-900/80 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>สถานะการเชื่อมต่อ</span>
                      <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="mt-1.5 flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{bOnline.length}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">ออนไลน์</span>
                      {bOffline.length > 0 && (
                        <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">({bOffline.length} ดับ)</span>
                      )}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {bOffline.length > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">⚠️ ขัดข้อง {bOffline.length} จุด</span>
                      ) : bDevices.length > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ สัญญาณเชื่อมต่อครบทุกจุด</span>
                      ) : (
                        <span>ยังไม่มีอุปกรณ์ในอาคารนี้</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Critical Alert within this Building if any offline */}
                {bOffline.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center space-x-2.5">
                      <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 animate-pulse" />
                      <div>
                        <strong className="text-rose-100 text-sm">
                          ตรวจพบสัญญาณขาดหาย {bOffline.length} จุดใน{selectedBuilding.name}!
                        </strong>
                        <div className="text-slate-300 mt-0.5">
                          {bOffline.map(d => `${d.name} (${d.ip_address})`).join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {bOffline[0] && (
                        <button
                          onClick={() => onSelectDevice(bOffline[0])}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition cursor-pointer flex items-center space-x-1.5 shadow"
                        >
                          <Stethoscope className="h-3.5 w-3.5" />
                          <span>วิเคราะห์สาเหตุ & วิธีแก้</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Devices in this Building */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs dark:bg-slate-900/80 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Network className="h-5 w-5 text-purple-700 dark:text-indigo-400" />
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        อุปกรณ์ประจำ{selectedBuilding.name} ({bDevices.length} เครื่อง)
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {bOnline.length} ออนไลน์ • {bOffline.length} ออฟไลน์
                    </span>
                  </div>

                  {bDevices.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/80">
                      <Server className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        ยังไม่มีอุปกรณ์ที่ลงทะเบียนใน{selectedBuilding.name}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        คุณสามารถกดปุ่ม "+ เพิ่มอุปกรณ์ใหม่" ในหน้าภาพรวมหรือหน้ารายการอุปกรณ์ แล้วเลือกอาคารนี้ได้ทันที
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {bDevices.map((d) => renderDeviceRow(d))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
