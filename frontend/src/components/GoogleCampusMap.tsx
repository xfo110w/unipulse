import React, { useState } from 'react';
import { 
  Globe, ExternalLink, MapPin, Layers, ZoomIn, ZoomOut, 
  RotateCcw, Compass, ArrowRight, ShieldCheck, Info, LayoutGrid, Map
} from 'lucide-react';

interface GoogleCampusMapProps {
  onSwitchToBlueprint?: () => void;
  onSwitchToGrid?: () => void;
}

export const GoogleCampusMap: React.FC<GoogleCampusMapProps> = ({
  onSwitchToBlueprint,
  onSwitchToGrid,
}) => {
  // Map Type: 'hybrid' (satellite + roads/labels) vs 'roadmap' (vector standard map)
  const [mapType, setMapType] = useState<'hybrid' | 'roadmap'>('hybrid');
  // Zoom Level: 17 fits BRU campus tightly as requested
  const [zoomLevel, setZoomLevel] = useState<number>(17);

  // BRU coordinates from user:
  // Lat: 14.9908457, Lng: 103.1024334 (Center ~14.98896, 103.0983505)
  const bruLat = 14.9908457;
  const bruLng = 103.1024334;
  const fullGoogleMapsUrl = 'https://www.google.com/maps/place/%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%A5%E0%B8%B1%E0%B8%A2%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%A0%E0%B8%B1%E0%B8%8F%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B1%E0%B8%A1%E0%B8%A2%E0%B9%8C/@14.98896,103.0983505,17.47z/data=!4m6!3m5!1s0x311995c5e2b147a3:0xf0469d0a80731b0!8m2!3d14.9908457!4d103.1024334!16s%2Fm%2F0cr2df0';

  // Construct iframe source for Google Maps
  // t=h for hybrid (satellite + labels), t=m for standard roadmap
  const mapSrc = `https://maps.google.com/maps?q=${bruLat},${bruLng}+(${encodeURIComponent('มหาวิทยาลัยราชภัฏบุรีรัมย์')})&t=${mapType === 'hybrid' ? 'h' : 'm'}&z=${zoomLevel}&hl=th&output=embed`;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs dark:bg-[#120c24]/90 dark:border-purple-900/50 dark:shadow-xl dark:shadow-purple-950/20 flex flex-col transition-colors duration-200">
      {/* Header & Controls Toolbar */}
      <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 dark:bg-[#160e2b]/95 dark:border-purple-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-500/30 shrink-0">
            <Globe className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Google Maps — มหาวิทยาลัยราชภัฏบุรีรัมย์</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                Live Embed
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-purple-200/70 truncate">
              พิกัด 14.9908457, 103.1024334 • แผนที่และภาพถ่ายดาวเทียมจริงครอบคลุมพื้นที่มหาวิทยาลัย
            </p>
          </div>
        </div>

        {/* Map Type Switcher & Action Controls - Aligned Right */}
        <div className="ml-auto flex items-center justify-end space-x-2 flex-wrap gap-2">
          {/* Layer switcher: Hybrid vs Roadmap */}
          <div className="flex items-center bg-white border border-slate-200 text-slate-700 shadow-xs dark:bg-[#1a1233] dark:border-purple-900/60 dark:text-purple-200 rounded-xl p-0.5 text-xs shrink-0">
            <button
              onClick={() => setMapType('hybrid')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1 ${
                mapType === 'hybrid'
                  ? 'bg-purple-700 text-white dark:bg-purple-800 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-purple-300/80 dark:hover:text-white'
              }`}
              title="ภาพถ่ายดาวเทียมพร้อมชื่อสถานที่"
            >
              <Layers className="h-3 w-3" />
              <span>ดาวเทียม</span>
            </button>
            <button
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1 ${
                mapType === 'roadmap'
                  ? 'bg-purple-700 text-white dark:bg-purple-800 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-purple-300/80 dark:hover:text-white'
              }`}
              title="แผนที่ถนนและผังเมือง"
            >
              <Compass className="h-3 w-3" />
              <span>แผนที่</span>
            </button>
          </div>

          {/* Quick Building Selector: Grid Button */}
          {onSwitchToGrid && (
            <button
              onClick={onSwitchToGrid}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs dark:bg-[#1a1233] dark:hover:bg-purple-900/60 dark:text-purple-200 dark:border-purple-900/60 transition cursor-pointer shrink-0"
              title="ดูตารางรายชื่ออาคาร 1 ถึง 23"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-purple-600 dark:text-amber-400" />
              <span>รายชื่ออาคาร 1-23</span>
            </button>
          )}

          {/* Quick jump to custom blueprint map */}
          {onSwitchToBlueprint && (
            <button
              onClick={onSwitchToBlueprint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-700 text-white hover:bg-purple-800 shadow-xs dark:bg-purple-800 dark:hover:bg-purple-700 dark:text-amber-300 dark:border dark:border-amber-400/40 transition cursor-pointer shrink-0"
              title="สลับไปดูผังพิมพ์เขียวเพื่อดูตำแหน่งอุปกรณ์และสถานะเครือข่าย"
            >
              <Map className="h-3.5 w-3.5" />
              <span>ผังแม่บทพิมพ์เขียว</span>
            </button>
          )}

          {/* Open full Google Maps link */}
          <a
            href={fullGoogleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-purple-950/60 dark:hover:bg-purple-900/70 dark:text-purple-200 dark:border-purple-800 transition cursor-pointer shrink-0"
            title="เปิดพิกัดนี้บน Google Maps ในแท็บใหม่"
          >
            <span>เปิด Google Maps เต็มจอ</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Google Maps Embed Iframe Viewport */}
      <div className="relative w-full h-[520px] sm:h-[620px] bg-slate-900 overflow-hidden">
        {/* Floating Zoom Controls at Top-Left (Yellow Circle) */}
        <div className="absolute top-3 left-3 z-20 flex items-center bg-white/95 dark:bg-[#160e2b]/95 backdrop-blur-md border border-slate-200 dark:border-purple-900/70 text-slate-700 dark:text-purple-200 rounded-xl p-0.5 shadow-lg">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 1, 20))}
            className="p-1.5 text-slate-600 hover:text-purple-900 hover:bg-slate-100 dark:text-purple-200 dark:hover:text-amber-300 dark:hover:bg-purple-900/50 rounded-lg transition cursor-pointer"
            title="ซูมเข้า (+)"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(17)}
            className="px-2 py-1 text-[11px] font-mono font-semibold text-slate-600 hover:text-purple-900 dark:text-purple-300/80 dark:hover:text-amber-300 transition cursor-pointer"
            title="รีเซ็ตซูมครอบคลุมทั้งมหาลัย (z=17)"
          >
            z:{zoomLevel}
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 1, 14))}
            className="p-1.5 text-slate-600 hover:text-purple-900 hover:bg-slate-100 dark:text-purple-200 dark:hover:text-amber-300 dark:hover:bg-purple-900/50 rounded-lg transition cursor-pointer"
            title="ซูมออก (-)"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { setZoomLevel(17); setMapType('hybrid'); }}
            className="p-1.5 text-slate-400 hover:text-purple-900 hover:bg-slate-100 dark:text-purple-400 dark:hover:text-amber-300 dark:hover:bg-purple-900/50 rounded-lg transition cursor-pointer ml-0.5 border-l border-slate-200 dark:border-purple-900/60"
            title="รีเซ็ตเป็นมุมมองมหาวิทยาลัยราชภัฏบุรีรัมย์"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
        <iframe
          key={`${mapType}-${zoomLevel}`}
          title="แผนที่มหาวิทยาลัยราชภัฏบุรีรัมย์ Google Maps"
          src={mapSrc}
          className="w-full h-full border-0 select-none"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Floating Campus Badge */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:flex items-center space-x-2 bg-slate-900/85 backdrop-blur-md border border-purple-500/30 text-white px-3 py-2 rounded-xl shadow-lg">
          <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
          <div className="text-left text-xs">
            <div className="font-bold text-white flex items-center space-x-1.5">
              <span>มหาวิทยาลัยราชภัฏบุรีรัมย์ (BRU)</span>
              <span className="text-[10px] text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded font-mono">
                14.9908°N, 103.1024°E
              </span>
            </div>
            <div className="text-[11px] text-purple-200/80">
              ถ.จิระ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000
            </div>
          </div>
        </div>
      </div>

      {/* Info & Landmark Guidance Footer */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-200 dark:bg-[#160e2b]/95 dark:border-purple-900/50 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start space-x-2 text-slate-600 dark:text-purple-200/80">
            <Info className="h-4 w-4 text-purple-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-white">
                หมายเหตุการแสดงผล:
              </span>{' '}
              โหมดนี้แสดงภาพถ่ายสภาพแวดล้อมจริงและอาคารผ่าน Google Maps โดยครอบคลุมพื้นที่มหาวิทยาลัยราชภัฏบุรีรัมย์ หากต้องการดูหมุดตรวจจับสถานะอุปกรณ์เครือข่าย (UP/DOWN) และสวิตช์ประจำอาคาร สามารถกดปุ่ม{' '}
              <button
                onClick={onSwitchToBlueprint}
                className="font-bold text-purple-700 hover:text-purple-900 dark:text-amber-300 dark:hover:text-amber-200 underline cursor-pointer"
              >
                "ผังแม่บทพิมพ์เขียว"
              </button>{' '}
              ที่แถบด้านบน
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-purple-300/70 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>พิกัดวิทยาเขตหลัก มรภ.บุรีรัมย์</span>
          </div>
        </div>

        {/* Quick Landmarks Chips */}
        <div className="pt-2 border-t border-slate-200/80 dark:border-purple-900/30 flex items-center gap-2 flex-wrap text-[11px]">
          <span className="font-semibold text-slate-700 dark:text-purple-300">จุดสำคัญในวิทยาเขต:</span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 dark:bg-purple-950/40 dark:border-purple-800/60 dark:text-purple-200">
            🏢 อาคาร 1–23 (อาคารเรียนและคณะต่างๆ)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 dark:bg-purple-950/40 dark:border-purple-800/60 dark:text-purple-200">
            🏛️ หอประชุมวิชชาอัตศาสตร์ (อาคาร 17)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 dark:bg-purple-950/40 dark:border-purple-800/60 dark:text-purple-200">
            🏟️ BRU DOME (อาคาร 23)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 dark:bg-purple-950/40 dark:border-purple-800/60 dark:text-purple-200">
            ⚽ สนามกีฬากลาง มรภ.บุรีรัมย์ (อาคาร 20)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 dark:bg-purple-950/40 dark:border-purple-800/60 dark:text-purple-200">
            🍲 ศูนย์อาหาร 1 & 2 (อาคาร 18, 19)
          </span>
        </div>
      </div>
    </div>
  );
};
