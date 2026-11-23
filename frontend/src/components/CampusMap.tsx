import React, { useState, useRef } from 'react';
import { 
  AlertTriangle, CheckCircle2, ZoomIn, ZoomOut, RotateCcw, 
  MapPin, Eye, Info, Sparkles, Globe, LayoutGrid
} from 'lucide-react';
import { Building, Device } from '../types';

interface CampusMapProps {
  buildings: Building[];
  devices: Device[];
  selectedBuildingId: number | null;
  onSelectBuilding: (buildingId: number) => void;
  onSwitchToGoogleMap?: () => void;
  onSwitchToGrid?: () => void;
}

// Coordinates (Percentage X%, Y% calibrated precisely to map image Width:651, Height:629)
export const BUILDING_COORDINATES: Record<number, { x: number; y: number; label?: string }> = {
  1:  { x: 47.5, y: 76.5, label: 'อาคาร 1' },
  2:  { x: 49.7, y: 72.2, label: 'อาคาร 2' },
  3:  { x: 59.4, y: 69.9, label: 'อาคาร 3' },
  4:  { x: 34.0, y: 76.9, label: 'อาคาร 4' },
  5:  { x: 60.0, y: 77.2, label: 'อาคาร 5' },
  6:  { x: 50.8, y: 51.6, label: 'อาคาร 6' },
  7:  { x: 59.6, y: 16.6, label: 'อาคาร 7' },
  8:  { x: 21.1, y: 57.1, label: 'อาคาร 8' },
  9:  { x: 72.5, y: 51.1, label: 'อาคาร 9' },
  10: { x: 48.2, y: 85.8, label: 'อาคาร 10' },
  11: { x: 73.2, y: 59.9, label: 'อาคาร 11' },
  12: { x: 24.1, y: 71.7, label: 'อาคาร 12' },
  13: { x: 21.6, y: 42.1, label: 'อาคาร 13' },
  14: { x: 13.5, y: 40.8, label: 'อาคาร 14' },
  15: { x: 91.0, y: 55.4, label: 'อาคาร 15' },
  16: { x: 19.7, y: 49.5, label: 'อาคาร 16' },
  // Landmarks / University facilities
  17: { x: 63.5, y: 53.8, label: 'อาคาร 17 (หอประชุม)' },
  18: { x: 61.5, y: 60.5, label: 'อาคาร 18 (ศูนย์อาหาร 1)' },
  19: { x: 17.5, y: 44.5, label: 'อาคาร 19 (ศูนย์อาหาร 2)' },
  20: { x: 87.5, y: 78.5, label: 'อาคาร 20 (สนามกีฬา)' },
  21: { x: 37.0, y: 87.5, label: 'อาคาร 21 (เวทีราชภัฏภิรมย์)' },
  22: { x: 47.5, y: 21.0, label: 'อาคาร 22 (สระประปา)' },
  23: { x: 86.0, y: 57.5, label: 'อาคาร 23 (BRU DOME)' },
};

export const CampusMap: React.FC<CampusMapProps> = ({
  buildings,
  devices,
  selectedBuildingId,
  onSelectBuilding,
  onSwitchToGoogleMap,
  onSwitchToGrid,
}) => {
  const [zoom, setZoom] = useState(1);
  const [hoveredBuildingId, setHoveredBuildingId] = useState<number | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.8));
  const handleResetZoom = () => setZoom(1);

  // Helper to extract building number
  const getBuildingNumber = (b: Building): number => {
    return parseInt(b.code, 10) || parseInt(b.name.replace(/\D/g, ''), 10) || b.id;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs dark:bg-[#120c24]/90 dark:border-purple-900/50 dark:shadow-xl dark:shadow-purple-950/20 flex flex-col transition-colors duration-200">
      {/* Map Header & Toolbar */}
      <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 dark:bg-[#160e2b]/95 dark:border-purple-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/50 dark:text-amber-300 dark:border-amber-400/30">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>ผังแม่บทมหาวิทยาลัยราชภัฏบุรีรัมย์ (BRU Master Campus Map)</span>
              <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-200 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/30 px-2 py-0.5 rounded-full font-semibold">
                BRU Live Status
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-purple-200/70">
              คลิกที่หมายเลขอาคาร 1–23 บนผัง มรภ.บุรีรัมย์ เพื่อตรวจดูสถานะสัญญาณและสวิตช์เครือข่าย
            </p>
          </div>
        </div>

        {/* Legend & Zoom Controls */}
        <div className="flex items-center space-x-2">
          {/* Status Legend */}
          <div className="hidden sm:flex items-center space-x-3 text-xs bg-white border border-slate-200 text-slate-700 shadow-xs dark:bg-[#1a1233] dark:border-purple-900/60 dark:text-purple-200/80 px-3 py-1.5 rounded-xl">
            <div className="flex items-center space-x-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white ring-1 ring-white animate-pulse">
                !
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">DOWN (มีปัญหา)</span>
            </div>
            <span className="text-slate-300 dark:text-purple-900">•</span>
            <div className="flex items-center space-x-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-400/40"></span>
              <span className="text-emerald-700 dark:text-emerald-400">UP (ปกติ)</span>
            </div>
            <span className="text-slate-300 dark:text-purple-900">•</span>
            <div className="flex items-center space-x-1">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-purple-700"></span>
              <span className="text-slate-500 dark:text-purple-300/70">ยังไม่มีอุปกรณ์</span>
            </div>
          </div>

          {/* Quick Building Selector: Grid Button (Replacing Zoom Buttons on toolbar - Red Circle) */}
          {onSwitchToGrid && (
            <button
              onClick={onSwitchToGrid}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs dark:bg-[#1a1233] dark:hover:bg-purple-900/60 dark:text-purple-200 dark:border-purple-900/60 transition cursor-pointer"
              title="ดูตารางรายชื่ออาคาร 1 ถึง 23"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-purple-600 dark:text-amber-400" />
              <span>รายชื่ออาคาร 1-23</span>
            </button>
          )}

          {onSwitchToGoogleMap && (
            <button
              onClick={onSwitchToGoogleMap}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-500/30 transition cursor-pointer"
              title="สลับไปดูแผนที่ Google Maps สภาพแวดล้อมจริง"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">ดู Google Maps</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Viewport Area */}
      <div 
        ref={mapContainerRef}
        className="relative w-full overflow-auto bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-3 select-none min-h-[420px] max-h-[640px] transition-colors duration-200"
      >
        {/* Floating Zoom Controls at Top-Left (Yellow Circle) */}
        <div className="absolute top-3 left-3 z-20 flex items-center bg-white/95 dark:bg-[#160e2b]/95 backdrop-blur-md border border-slate-200 dark:border-purple-900/70 text-slate-700 dark:text-purple-200 rounded-xl p-0.5 shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-600 hover:text-purple-900 hover:bg-slate-100 dark:text-purple-200 dark:hover:text-amber-300 dark:hover:bg-purple-900/50 rounded-lg transition cursor-pointer"
            title="ซูมเข้า (+)"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-purple-300/80 px-1.5">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-600 hover:text-purple-900 hover:bg-slate-100 dark:text-purple-200 dark:hover:text-amber-300 dark:hover:bg-purple-900/50 rounded-lg transition cursor-pointer"
            title="ซูมออก (-)"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 text-slate-400 hover:text-purple-900 hover:bg-slate-100 dark:text-purple-400 dark:hover:text-amber-300 dark:hover:bg-purple-900/50 rounded-lg transition cursor-pointer ml-0.5 border-l border-slate-200 dark:border-purple-900/60"
            title="รีเซ็ตขนาด (100%)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
        <div 
          className="relative transition-transform duration-200 ease-out origin-center inline-block max-w-full"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Campus Map Image */}
          <img
            src="/campus-map.jpg"
            alt="ผังแม่บทมหาวิทยาลัยราชภัฏบุรีรัมย์"
            className="w-full max-w-[850px] h-auto object-contain rounded-xl shadow-2xl block border border-slate-800/60"
            draggable={false}
          />

          {/* Markers overlaid on each building number */}
          {buildings.map((b) => {
            const num = getBuildingNumber(b);
            const coord = BUILDING_COORDINATES[num];
            if (!coord) return null;

            const isSelected = selectedBuildingId === b.id;
            const bDevices = devices.filter((d) => d.building_id === b.id);
            const hasOffline = bDevices.some((d) => d.status === 'OFFLINE');
            const hasOnline = bDevices.some((d) => d.status === 'ONLINE');
            const isHovered = hoveredBuildingId === b.id;

            return (
              <div
                key={b.id}
                style={{
                  position: 'absolute',
                  left: `${coord.x}%`,
                  top: `${coord.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={isHovered ? 'z-50' : isSelected ? 'z-30' : hasOffline ? 'z-20' : 'z-10'}
              >
                {/* Clickable Compact Building Marker (Non-overlapping) */}
                <button
                  type="button"
                  onClick={() => onSelectBuilding(b.id)}
                  onMouseEnter={() => setHoveredBuildingId(b.id)}
                  onMouseLeave={() => setHoveredBuildingId(null)}
                  className={`group relative flex items-center justify-center font-mono transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'h-6 w-6 rounded-full bg-gradient-to-tr from-purple-700 via-purple-600 to-amber-500 text-white text-xs font-black ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-[#0e091c] shadow-lg shadow-purple-500/80 scale-110'
                      : hasOffline
                      ? 'h-6 w-6 rounded-full bg-rose-600 text-white text-xs font-bold border-2 border-white shadow-md shadow-rose-600/50 hover:border-rose-400'
                      : bDevices.length > 0
                      ? 'h-6 w-6 rounded-full bg-white text-emerald-700 dark:bg-[#181033]/90 dark:text-emerald-300 text-xs font-bold border-1.5 border-emerald-500 shadow-xs hover:border-emerald-600'
                      : 'h-6 w-6 rounded-full bg-white/95 text-slate-700 border border-slate-300 dark:bg-[#160f2d]/80 dark:text-purple-300 text-[11px] font-medium dark:border-purple-800/80 hover:bg-purple-50 hover:text-purple-900 dark:hover:bg-purple-900/50 dark:hover:text-amber-300 shadow-xs'
                  }`}
                  title={`${b.name} (คลิกเพื่อดูอุปกรณ์)`}
                >
                  {/* Building Number */}
                  <span>{num}</span>

                  {/* 🚨 EXCLAMATION MARK BADGE FOR DOWN STATUS */}
                  {hasOffline && (
                    <span 
                      className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-md shadow-rose-600/70 ring-1.5 ring-white animate-bounce pointer-events-none"
                      title="ตรวจพบอุปกรณ์ DOWN (มีปัญหา)!"
                    >
                      !
                    </span>
                  )}

                  {/* 🟢 Online Pulsing Dot (When all devices UP) */}
                  {!hasOffline && hasOnline && !isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 pointer-events-none">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </button>

                {/* Floating Tooltip Card on Hover */}
                {isHovered && (
                  <div className={`absolute left-1/2 -translate-x-1/2 ${coord.y < 28 ? 'top-full mt-2' : 'bottom-full mb-2'} z-50 pointer-events-none w-52 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-2xl text-left text-xs animate-in fade-in zoom-in-95 duration-150`}>
                    <div className="font-bold text-white flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                      <span>{b.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">#{num}</span>
                    </div>

                    {bDevices.length === 0 ? (
                      <p className="text-[11px] text-slate-400">ยังไม่มีอุปกรณ์ลงทะเบียน</p>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300">อุปกรณ์ทั้งหมด:</span>
                          <span className="font-bold text-white">{bDevices.length} เครื่อง</span>
                        </div>

                        {hasOffline ? (
                          <div className="flex items-center space-x-1 text-rose-400 font-bold text-[11px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            <span>ขัดข้อง (DOWN) {bDevices.filter((d) => d.status === 'OFFLINE').length} เครื่อง!</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-emerald-400 text-[11px]">
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                            <span>อุปกรณ์ออนไลน์ปกติ (UP)</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-1.5 pt-1 border-t border-slate-800/80 text-[10px] text-indigo-300 flex items-center justify-center">
                      คลิกเพื่อดูรายละเอียดอุปกรณ์ ↓
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Status Bar under Map */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 dark:bg-slate-950/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
        <div className="flex items-center space-x-2">
          <Info className="h-3.5 w-3.5 text-purple-700 dark:text-indigo-400" />
          <span>
            {selectedBuildingId ? (
              <>
                กำลังแสดงข้อมูล: <strong className="text-slate-900 dark:text-white">อาคาร {buildings.find(b => b.id === selectedBuildingId)?.name || selectedBuildingId}</strong>
              </>
            ) : (
              'คลิกที่หมายเลขอาคารบนแผนที่เพื่อดูข้อมูลอุปกรณ์'
            )}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">
          * หากมีอุปกรณ์ขัดข้อง สัญลักษณ์ <strong className="text-rose-600 dark:text-rose-400">!</strong> สีแดงจะกระพริบเตือนบนผังทันที
        </span>
      </div>
    </div>
  );
};
