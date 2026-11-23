import React from 'react';
import { MapPin, Info, Globe, Sparkles } from 'lucide-react';
import { Building, Device } from '../types';

interface CampusMapProps {
  buildings: Building[];
  devices?: Device[];
  selectedBuildingId: number | null;
  onSelectBuilding?: (buildingId: number) => void;
  onSwitchToGoogleMap?: () => void;
  onSwitchToGrid?: () => void;
}

// Coordinates (Kept for reference when inserting new master map)
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
  selectedBuildingId,
  onSwitchToGoogleMap,
}) => {
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
                กำลังจัดทำผังใหม่
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-purple-200/70">
              อยู่ระหว่างจัดทำผังแม่บทฉบับปรับปรุงใหม่ — สามารถสลับไปใช้งาน Google Maps เพื่อดูตำแหน่งและสถานะอุปกรณ์ได้
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-2">
          {onSwitchToGoogleMap && (
            <button
              onClick={onSwitchToGoogleMap}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-500/30 transition cursor-pointer shadow-xs"
              title="สลับไปดูแผนที่ Google Maps สภาพแวดล้อมจริง"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ดู Google Maps</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Viewport Area - Blank clean state while user is creating new map */}
      <div 
        className="relative w-full overflow-hidden bg-slate-50/70 dark:bg-slate-950/60 flex flex-col items-center justify-center p-8 select-none min-h-[460px] max-h-[640px] transition-colors duration-200"
      >
        <div className="max-w-md w-full mx-auto text-center p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-purple-900/60 bg-white/70 dark:bg-[#160e2b]/50 backdrop-blur-xs shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-amber-300 flex items-center justify-center shadow-inner">
            <Sparkles className="h-8 w-8 stroke-[1.5]" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-white mb-2">
            กำลังจัดทำผังแม่บทฉบับใหม่
          </h4>
          <p className="text-xs text-slate-500 dark:text-purple-200/70 leading-relaxed mb-6">
            พื้นที่แสดงผังแม่บทจำลองมหาวิทยาลัยราชภัฏบุรีรัมย์ (เคลียร์พื้นที่เรียบร้อยแล้ว) เมื่อทำแผนที่เสร็จแล้วสามารถนำไฟล์ภาพมาใส่เพื่อปักตำแหน่งได้ทันที
          </p>
          {onSwitchToGoogleMap && (
            <button
              onClick={onSwitchToGoogleMap}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-md shadow-purple-900/20 transition cursor-pointer"
            >
              <Globe className="h-4 w-4" />
              <span>เปิดดูบน Google Maps (พร้อมใช้งาน)</span>
            </button>
          )}
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
              'สามารถเลือกอาคารจากปุ่ม "รายชื่ออาคาร" ด้านบนเพื่อดูรายละเอียดและอุปกรณ์'
            )}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-purple-300/70">
          ผังแม่บทอยู่ระหว่างการจัดทำ
        </span>
      </div>
    </div>
  );
};
