import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Globe, ExternalLink, MapPin, Layers, ZoomIn, ZoomOut, 
  RotateCcw, Compass, ShieldCheck, Info, Check, Trash2, 
  AlertTriangle, CheckCircle2, Crosshair, ChevronDown, Search, X, Map as MapIcon,
  Hand
} from 'lucide-react';
import { Building, Device, BuildingPin } from '../types';
import { api } from '../api';

interface GoogleCampusMapProps {
  buildings: Building[];
  devices: Device[];
  selectedBuildingId: number | null;
  onSelectBuilding: (buildingId: number) => void;
  onSwitchToBlueprint?: () => void;
}

const LOCAL_STORAGE_KEY = 'bru_google_building_pins_geo_v1';

// BRU Campus Perimeter Boundary (Calibrated accurately to user's yellow line around BRU Campus)
export const BRU_CAMPUS_POLYGON_GEO: Array<{ lat: number; lng: number }> = [
  // ทิศเหนือ: แนวถนนจิระ (จากประตู 4 ฝั่งตะวันตก มุ่งหน้าไปทิศตะวันออก)
  { lat: 14.99130, lng: 103.09564 }, // มุมตะวันตกเฉียงเหนือ ประตู 4
  { lat: 14.99155, lng: 103.09660 }, // แนวถนนจิระ
  { lat: 14.99173, lng: 103.09740 }, // ถนนจิระ ประตู 3
  { lat: 14.99188, lng: 103.09804 }, // ถนนจิระ ประตู 1 (หน้า มรภ.)
  { lat: 14.99217, lng: 103.09912 }, // ถนนจิระ ช่วงกลาง
  { lat: 14.99244, lng: 103.10032 }, // ถนนจิระ ฝั่งตะวันออก
  { lat: 14.99287, lng: 103.10195 }, // ถนนจิระ หัวมุมตะวันออกเฉียงเหนือ
  { lat: 14.99290, lng: 103.10229 }, // จุดตัดถนนจิระและถนนเลี่ยงเมือง

  // ทิศตะวันออก: เลียบถนนเลี่ยงเมือง (จากแยกถนนจิระ ผ่านประตู 6 ลงมาทางทิศใต้)
  { lat: 14.99244, lng: 103.10259 }, // ทางเลี้ยวเข้าถนนเลี่ยงเมือง
  { lat: 14.99173, lng: 103.10300 }, // ประตู 6 ถนนเลี่ยงเมือง
  { lat: 14.99051, lng: 103.10360 }, // เลียบด้านหลังหอประชุม BRU DOME
  { lat: 14.98920, lng: 103.10409 }, // ด้านข้างอาคาร 15
  { lat: 14.98831, lng: 103.10429 }, // แนวรั้วทิศตะวันออก
  { lat: 14.98722, lng: 103.10435 }, // มุมตะวันออกเฉียงใต้ ใกล้วงเวียน ร.1

  // ทิศใต้: เลียบทางหลวง 218 / ถนนเลี่ยงเมือง (จากวงเวียน ร.1 ไปทางทิศตะวันตก)
  { lat: 14.98697, lng: 103.10354 }, // ทางโค้งเข้าถนน 218
  { lat: 14.98659, lng: 103.10281 }, // ใต้สระน้ำประปา มรภ.
  { lat: 14.98624, lng: 103.10141 }, // ใต้แนวสระน้ำประปา
  { lat: 14.98599, lng: 103.10040 }, // ด้านหน้าฝั่งตรงข้าม Suki Desu Bakery
  { lat: 14.98558, lng: 103.09914 }, // ด้านหน้าแนวรั้วทิศใต้
  { lat: 14.98531, lng: 103.09753 }, // แนวรั้วทิศใต้
  { lat: 14.98529, lng: 103.09712 }, // มุมตะวันตกเฉียงใต้สุด

  // ทิศตะวันตก: เลียบแนวกำแพงรั้วหลังหอพักและสนามกีฬากลับขึ้นไปทิศเหนือ (ไม่ล้ำไป ร.พ.ช.)
  { lat: 14.98579, lng: 103.09691 }, // แนวกำแพงตะวันตกช่วงล่าง
  { lat: 14.98666, lng: 103.09675 }, // แนวกำแพงหลังหอพัก
  { lat: 14.98730, lng: 103.09656 }, // แนวกำแพงตะวันตก
  { lat: 14.98792, lng: 103.09643 }, // แนวกำแพงหลังอัฒจันทร์สนามกีฬา
  { lat: 14.98902, lng: 103.09613 }, // แนวกำแพงหลังอัฒจันทร์สนามกีฬา
  { lat: 14.98964, lng: 103.09594 }, // แนวรั้วสนามกีฬาด้านทิศเหนือ
  { lat: 14.99039, lng: 103.09579 }, // แนวรั้วเชื่อมกลับสู่ประตู 4
];

// Web Mercator projection formulas (EPSG:3857) - used by Google Maps & Leaflet
function latLngToWorldPixel(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const scale = 256 * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const clampedSin = Math.max(-0.9999, Math.min(0.9999, sinLat));
  const y = (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function worldPixelToLatLng(x: number, y: number, zoom: number): { lat: number; lng: number } {
  const scale = 256 * Math.pow(2, zoom);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - 2 * Math.PI * (y / scale);
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
}

// Ray-Casting algorithm to verify if (lat, lng) falls within BRU Campus Perimeter (from user's calibrated boundary)
export function isPointInCampus(lat: number, lng: number): boolean {
  let inside = false;
  for (let i = 0, j = BRU_CAMPUS_POLYGON_GEO.length - 1; i < BRU_CAMPUS_POLYGON_GEO.length; j = i++) {
    const xi = BRU_CAMPUS_POLYGON_GEO[i].lng, yi = BRU_CAMPUS_POLYGON_GEO[i].lat;
    const xj = BRU_CAMPUS_POLYGON_GEO[j].lng, yj = BRU_CAMPUS_POLYGON_GEO[j].lat;
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export const GoogleCampusMap: React.FC<GoogleCampusMapProps> = ({
  buildings,
  devices,
  selectedBuildingId,
  onSelectBuilding,
  onSwitchToBlueprint,
}) => {
  // Map Type: 'hybrid' (satellite + labels) vs 'roadmap' (vector standard map)
  const [mapType, setMapType] = useState<'hybrid' | 'roadmap'>('hybrid');
  // Zoom level: default 17 covers BRU campus nicely (range 15 to 19)
  const [zoomLevel, setZoomLevel] = useState<number>(17);

  // BRU coordinates center: 14.98910, 103.10000 (centered on campus)
  const defaultCenter = { lat: 14.98910, lng: 103.10000 };
  const [center, setCenter] = useState<{ lat: number; lng: number }>(defaultCenter);

  // Dimensions of map container
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const mapViewportRef = useRef<HTMLDivElement>(null);

  // Custom Pinning Mode
  const [isPinningMode, setIsPinningMode] = useState<boolean>(false);
  const [targetBuildingId, setTargetBuildingId] = useState<number>(
    buildings.length > 0 ? buildings[0].id : 1
  );
  // Pins stored as real geographical coordinates: { [buildingId]: { lat: number; lng: number } }
  const [pins, setPins] = useState<Record<number, { lat: number; lng: number }>>({});
  const [searchBuildingQuery, setSearchBuildingQuery] = useState<string>('');
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, duration = 3500) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, duration);
  }, []);

  const [activePopupBuildingId, setActivePopupBuildingId] = useState<number | null>(null);

  // Interactive Panning State
  const [isDraggingMap, setIsDraggingMap] = useState<boolean>(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startWorldX: number; startWorldY: number } | null>(null);
  const hasMovedRef = useRef<boolean>(false);

  // Dragging individual pin state
  const [draggingPinBuildingId, setDraggingPinBuildingId] = useState<number | null>(null);

  const fullGoogleMapsUrl = 'https://www.google.com/maps/place/%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%A5%E0%B8%B1%E0%B8%A2%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%A0%E0%B8%B1%E0%B8%8F%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B1%E0%B8%A1%E0%B8%A2%E0%B9%8C/@14.98896,103.0983505,17.47z/data=!4m6!3m5!1s0x311995c5e2b147a3:0xf0469d0a80731b0!8m2!3d14.9908457!4d103.1024334!16s%2Fm%2F0cr2df0';

  // Measure container size
  useEffect(() => {
    const updateSize = () => {
      if (mapViewportRef.current) {
        setContainerSize({
          width: mapViewportRef.current.clientWidth || 800,
          height: mapViewportRef.current.clientHeight || 600,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Load custom pins from localStorage and server API
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          setPins(parsed);
        }
      }
    } catch {
      // ignore
    }

    api.getBuildingPins()
      .then((serverPins: BuildingPin[]) => {
        if (serverPins && Array.isArray(serverPins)) {
          setPins(prev => {
            const next = { ...prev };
            serverPins.forEach(p => {
              if (p.lat && p.lng) {
                next[p.building_id] = { lat: p.lat, lng: p.lng };
              }
            });
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
            } catch {
              // ignore
            }
            return next;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Save pin helper (Constraint: Only allow pinning inside BRU campus!)
  const handleSavePin = useCallback((bId: number, lat: number, lng: number) => {
    if (!isPointInCampus(lat, lng)) {
      showToast('⚠️ ไม่สามารถปักนอกเขตได้ — กรุณาปักหมุดภายในเขต มรภ.บุรีรัมย์ เท่านั้น', 4000);
      return false;
    }

    const updated = { ...pins, [bId]: { lat, lng } };
    setPins(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    const b = buildings.find(x => x.id === bId);
    showToast(`ปักตำแหน่ง ${b ? b.name : `อาคาร ${bId}`} สำเร็จ`, 2500);

    // Save to API in background
    api.saveBuildingPin({ building_id: bId, lat, lng }).catch(() => {});
    return true;
  }, [pins, buildings, showToast]);

  const handleDeletePin = (bId: number) => {
    const updated = { ...pins };
    delete updated[bId];
    setPins(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    const b = buildings.find(x => x.id === bId);
    showToast(`ลบหมุด ${b ? b.name : `อาคาร ${bId}`} เรียบร้อย`, 2500);

    api.deleteBuildingPin(bId).catch(() => {});
    if (activePopupBuildingId === bId) setActivePopupBuildingId(null);
  };

  const handleClearAllPins = () => {
    if (window.confirm('คุณต้องการล้างหมุดอาคารทั้งหมดบนแผนที่ Google Maps ใช่หรือไม่?')) {
      setPins({});
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // ignore
      }
      showToast('ล้างหมุดทั้งหมดเรียบร้อยแล้ว', 2500);
      setActivePopupBuildingId(null);
    }
  };

  // World pixel coordinates of current center
  const centerWorld = latLngToWorldPixel(center.lat, center.lng, zoomLevel);

  // Compute visible tile ranges
  const minWorldX = centerWorld.x - containerSize.width / 2;
  const maxWorldX = centerWorld.x + containerSize.width / 2;
  const minWorldY = centerWorld.y - containerSize.height / 2;
  const maxWorldY = centerWorld.y + containerSize.height / 2;

  const minTileX = Math.floor(minWorldX / 256);
  const maxTileX = Math.floor(maxWorldX / 256);
  const minTileY = Math.floor(minWorldY / 256);
  const maxTileY = Math.floor(maxWorldY / 256);

  // Generate tiles array
  const tiles: Array<{ x: number; y: number; left: number; top: number; url: string; key: string }> = [];
  const tileMode = mapType === 'roadmap' ? 'm' : 'y';

  for (let tx = minTileX; tx <= maxTileX; tx++) {
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      const tileLeft = tx * 256 - centerWorld.x + containerSize.width / 2;
      const tileTop = ty * 256 - centerWorld.y + containerSize.height / 2;
      const sub = Math.abs((tx + ty) % 4);
      const url = `https://mt${sub}.google.com/vt/lyrs=${tileMode}&x=${tx}&y=${ty}&z=${zoomLevel}`;
      tiles.push({ x: tx, y: ty, left: tileLeft, top: tileTop, url, key: `${tx}-${ty}-${zoomLevel}-${mapType}` });
    }
  }

  // Panning with Mouse Drag
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag with left mouse button
    if (e.button !== 0) return;
    setIsDraggingMap(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startWorldX: centerWorld.x,
      startWorldY: centerWorld.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingMap || !dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;

    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      hasMovedRef.current = true;
    }

    const newWorldX = dragStartRef.current.startWorldX - dx;
    const newWorldY = dragStartRef.current.startWorldY - dy;
    const newCenter = worldPixelToLatLng(newWorldX, newWorldY, zoomLevel);

    // Limit pan bounds to comfortable viewing around BRU campus perimeter
    const minPanLat = 14.9820;
    const maxPanLat = 14.9950;
    const minPanLng = 103.0920;
    const maxPanLng = 103.1075;

    const clampedLat = Math.max(minPanLat, Math.min(maxPanLat, newCenter.lat));
    const clampedLng = Math.max(minPanLng, Math.min(maxPanLng, newCenter.lng));

    setCenter({ lat: clampedLat, lng: clampedLng });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingMap(false);

    if (dragStartRef.current) {
      const dx = Math.abs(e.clientX - dragStartRef.current.clientX);
      const dy = Math.abs(e.clientY - dragStartRef.current.clientY);
      const isClick = !hasMovedRef.current || (dx < 7 && dy < 7);

      // If mouse clicked (didn't drag) and Pin Mode is active: Place a pin!
      if (isClick && isPinningMode && !draggingPinBuildingId) {
        if (mapViewportRef.current) {
          const rect = mapViewportRef.current.getBoundingClientRect();
          const clickScreenX = e.clientX - rect.left;
          const clickScreenY = e.clientY - rect.top;

          // Compute exact world coordinates using actual rect dimensions
          const clickWorldX = centerWorld.x - rect.width / 2 + clickScreenX;
          const clickWorldY = centerWorld.y - rect.height / 2 + clickScreenY;
          const geo = worldPixelToLatLng(clickWorldX, clickWorldY, zoomLevel);

          handleSavePin(targetBuildingId, geo.lat, geo.lng);
        }
      }
    }

    dragStartRef.current = null;
  };

  const minZoom = 15;
  const maxZoom = 20;

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel(prev => Math.min(prev + 1, maxZoom));
    } else if (e.deltaY > 0) {
      setZoomLevel(prev => Math.max(prev - 1, minZoom));
    }
  };

  // Zoom button handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 1, maxZoom));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 1, minZoom));
  const handleResetZoom = () => {
    setCenter(defaultCenter);
    setZoomLevel(17);
  };

  // Dragging individual pin listener
  useEffect(() => {
    if (!draggingPinBuildingId) return;

    const onWindowMove = (e: MouseEvent) => {
      if (!mapViewportRef.current) return;
      const rect = mapViewportRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      const worldX = centerWorld.x - containerSize.width / 2 + screenX;
      const worldY = centerWorld.y - containerSize.height / 2 + screenY;
      const geo = worldPixelToLatLng(worldX, worldY, zoomLevel);

      handleSavePin(draggingPinBuildingId, geo.lat, geo.lng);
    };

    const onWindowUp = () => {
      setDraggingPinBuildingId(null);
    };

    window.addEventListener('mousemove', onWindowMove);
    window.addEventListener('mouseup', onWindowUp);

    return () => {
      window.removeEventListener('mousemove', onWindowMove);
      window.removeEventListener('mouseup', onWindowUp);
    };
  }, [draggingPinBuildingId, centerWorld, containerSize, zoomLevel, handleSavePin]);

  const currentTargetBuilding = buildings.find(b => b.id === targetBuildingId);
  const currentTargetPin = pins[targetBuildingId];
  const pinnedCount = Object.keys(pins).length;

  // Filtered buildings for selector dropdown
  const filteredBuildings = buildings.filter(b => {
    if (!searchBuildingQuery.trim()) return true;
    const q = searchBuildingQuery.toLowerCase().trim();
    const num = String(parseInt(b.code, 10) || parseInt(b.name.replace(/\D/g, ''), 10) || b.id);
    return b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || num.includes(q) || (b.description || '').toLowerCase().includes(q);
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs dark:bg-[#120c24]/90 dark:border-purple-900/50 dark:shadow-xl dark:shadow-purple-950/20 flex flex-col transition-colors duration-200 select-none">
      {/* Header & Controls Toolbar */}
      <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 dark:bg-[#160e2b]/95 dark:border-purple-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-500/30 shrink-0">
            <Globe className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 flex-wrap">
              <span>Google Maps — มหาวิทยาลัยราชภัฏบุรีรัมย์</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                {isPinningMode ? 'กำลังปักเลขอาคาร' : `ปักแล้ว ${pinnedCount} อาคาร`}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-purple-200/70 truncate">
              {isPinningMode 
                ? 'คลิกค้างแล้วลากเพื่อเลื่อนหาตำแหน่งตึก • คลิกบนหลังคาตึกเพื่อปักเลขอาคาร (เฉพาะในเขต มรภ.)'
                : 'แผนที่ดาวเทียมเลื่อนและซูมได้อิสระ • คลิกที่ตัวเลขอาคารเพื่อตรวจดูอุปกรณ์'}
            </p>
          </div>
        </div>

        {/* Action Controls - Aligned Right */}
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

          {/* NEW FEATURE BUTTON: Custom Pinning Feature (Replaces "รายชื่ออาคาร 1-23" on this toolbar) */}
          <button
            onClick={() => {
              setIsPinningMode(!isPinningMode);
              setActivePopupBuildingId(null);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer shrink-0 ${
              isPinningMode
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold ring-2 ring-amber-400 shadow-amber-500/30'
                : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 dark:bg-[#1a1233] dark:hover:bg-purple-900/60 dark:text-amber-300 dark:border-purple-800/80'
            }`}
            title="เปิด/ปิด โหมดปักเลขอาคารบนแผนที่ Google Maps"
          >
            {isPinningMode ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>เสร็จสิ้นการปักหมุด</span>
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5 text-purple-600 dark:text-amber-400" />
                <span>ปักเลขอาคาร</span>
              </>
            )}
          </button>

          {/* Quick jump to custom blueprint map */}
          {onSwitchToBlueprint && (
            <button
              onClick={onSwitchToBlueprint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-700 text-white hover:bg-purple-800 shadow-xs dark:bg-purple-800 dark:hover:bg-purple-700 dark:text-amber-300 dark:border dark:border-amber-400/40 transition cursor-pointer shrink-0"
              title="สลับไปดูผังแม่บทพิมพ์เขียว"
            >
              <MapIcon className="h-3.5 w-3.5" />
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

      {/* PINNING CONTROL BAR: Shown when Pin Mode is Active */}
      {isPinningMode && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-purple-900/95 via-[#1e1338]/95 to-purple-950/95 border-b border-amber-500/40 text-white flex flex-wrap items-center justify-between gap-3 text-xs z-30 shadow-md">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <span className="font-bold text-amber-300 flex items-center space-x-1">
              <Crosshair className="h-4 w-4 text-amber-400 animate-spin" />
              <span>เลือกอาคารที่จะปัก:</span>
            </span>

            {/* Searchable Dropdown for 1-110 Buildings */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="flex items-center justify-between min-w-[240px] px-3 py-1.5 rounded-xl bg-slate-900/90 border border-purple-500/50 hover:border-amber-400 text-white font-medium text-xs transition cursor-pointer"
              >
                <span className="truncate mr-2">
                  {currentTargetBuilding ? currentTargetBuilding.name : 'เลือกอาคาร...'}
                </span>
                <span className="flex items-center space-x-1.5 shrink-0">
                  {currentTargetPin ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-sans">
                      ปักแล้ว
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-sans">
                      ยังไม่ปัก
                    </span>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </span>
              </button>

              {/* Dropdown Menu */}
              {isSelectorOpen && (
                <div className="absolute top-full left-0 mt-1 w-80 max-h-72 bg-slate-900 border border-purple-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col">
                  <div className="p-2 border-b border-purple-900/60 bg-slate-950 flex items-center space-x-2">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchBuildingQuery}
                      onChange={(e) => setSearchBuildingQuery(e.target.value)}
                      placeholder="พิมพ์ค้นหาชื่อ หรือ เลขอาคาร..."
                      className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                      autoFocus
                    />
                    {searchBuildingQuery && (
                      <button onClick={() => setSearchBuildingQuery('')} className="text-slate-400 hover:text-white">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1 divide-y divide-purple-950/40">
                    {filteredBuildings.map(b => {
                      const isPinned = !!pins[b.id];
                      const isCurrent = targetBuildingId === b.id;
                      const num = parseInt(b.code, 10) || parseInt(b.name.replace(/\D/g, ''), 10) || b.id;

                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setTargetBuildingId(b.id);
                            setIsSelectorOpen(false);
                            // Pan to pin if already exists
                            if (pins[b.id]) {
                              setCenter({ lat: pins[b.id].lat, lng: pins[b.id].lng });
                            }
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition cursor-pointer ${
                            isCurrent
                              ? 'bg-purple-800/80 text-amber-300 font-bold'
                              : 'hover:bg-purple-950/60 text-slate-200'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <span className="font-mono text-purple-300 mr-1.5">#{num}</span>
                            <span>{b.name}</span>
                          </div>
                          {isPinned ? (
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded shrink-0">
                              ✓ ปักแล้ว
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 shrink-0">
                              ยังไม่ปัก
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Instruction Tag */}
            <span className="text-[11px] text-purple-200/90 hidden sm:inline flex items-center space-x-1">
              <Hand className="h-3.5 w-3.5 text-amber-300" />
              <span>คลิกลากเพื่อเลื่อนหาตำแหน่ง • คลิกบนหลังคาตึกเพื่อวางหมุด</span>
            </span>
          </div>

          {/* Current Pin Actions */}
          <div className="flex items-center space-x-2">
            {currentTargetPin && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCenter({ lat: currentTargetPin.lat, lng: currentTargetPin.lng });
                    setZoomLevel(18);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs transition cursor-pointer"
                  title="เลื่อนแผนที่ไปที่ตำแหน่งหมุดนี้"
                >
                  เลื่อนไปที่หมุด
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePin(targetBuildingId)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-xs transition cursor-pointer"
                  title="ลบหมุดของอาคารนี้"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>ลบหมุด</span>
                </button>
              </>
            )}

            {pinnedCount > 0 && (
              <button
                type="button"
                onClick={handleClearAllPins}
                className="px-2 py-1 rounded-lg text-slate-400 hover:text-rose-300 text-[11px] transition cursor-pointer"
                title="ล้างหมุดทั้งหมดบนแผนที่"
              >
                ล้างทั้งหมด
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notification Toast - Fixed at Top of Screen (Always Visible across all Zoom & Scroll positions) */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none select-none">
          <div className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-2xl flex items-center space-x-2.5 animate-bounce border backdrop-blur-md ${
            toastMessage.includes('⚠️')
              ? 'bg-rose-950/95 border-rose-500 text-rose-200 ring-4 ring-rose-500/40 shadow-rose-950/60'
              : 'bg-slate-900/95 border-amber-400 text-amber-300 ring-4 ring-amber-400/20 shadow-purple-950/60'
          }`}>
            {toastMessage.includes('⚠️') ? (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 animate-pulse" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Map Viewport Area (Interactive Slippy Map with Google Satellite Tiles) */}
      <div 
        ref={mapViewportRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full h-[520px] sm:h-[620px] bg-slate-950 overflow-hidden ${
          isDraggingMap 
            ? 'cursor-grabbing' 
            : isPinningMode 
            ? 'cursor-crosshair' 
            : 'cursor-grab'
        }`}
      >
        {/* Floating Zoom Controls at Top-Left */}
        <div 
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute top-3 left-3 z-30 flex items-center bg-white/95 dark:bg-[#160e2b]/95 backdrop-blur-md border border-slate-200 dark:border-purple-900/70 text-slate-700 dark:text-purple-200 rounded-xl p-0.5 shadow-lg"
        >
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-600 hover:text-purple-900 hover:bg-slate-100 dark:text-purple-200 dark:hover:text-amber-300 dark:hover:bg-purple-900/50 rounded-lg transition cursor-pointer"
            title="ซูมเข้า (+)"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-[11px] font-mono font-semibold text-slate-600 hover:text-purple-900 dark:text-purple-300/80 dark:hover:text-amber-300 transition cursor-pointer"
            title="รีเซ็ตซูมครอบคลุมทั้งมหาลัย (z=17)"
          >
            z:{zoomLevel}
          </button>
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
            title="รีเซ็ตเป็นมุมมองศูนย์กลาง มรภ.บุรีรัมย์"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Live Pannable Google Satellite Tiles Grid */}
        <div className="absolute inset-0 pointer-events-none">
          {tiles.map(tile => (
            <img
              key={tile.key}
              src={tile.url}
              alt=""
              draggable={false}
              className="absolute w-[256px] h-[256px] select-none block"
              style={{
                left: `${tile.left}px`,
                top: `${tile.top}px`,
              }}
            />
          ))}
        </div>

        {/* Overlaid Custom Pinned Buildings (Glued directly to Geo Coordinates as you Pan and Zoom) */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {Object.entries(pins).map(([bIdStr, pos]) => {
            const bId = parseInt(bIdStr, 10);
            const b = buildings.find(x => x.id === bId);
            if (!b) return null;

            // Project geo coordinate (pos.lat, pos.lng) to screen pixel
            const pinWorld = latLngToWorldPixel(pos.lat, pos.lng, zoomLevel);
            const screenX = pinWorld.x - centerWorld.x + containerSize.width / 2;
            const screenY = pinWorld.y - centerWorld.y + containerSize.height / 2;

            // Don't render if outside viewport by large margin
            if (screenX < -60 || screenX > containerSize.width + 60 || screenY < -60 || screenY > containerSize.height + 60) {
              return null;
            }

            const num = parseInt(b.code, 10) || parseInt(b.name.replace(/\D/g, ''), 10) || b.id;
            const bDevices = devices.filter(d => d.building_id === b.id);
            const hasOffline = bDevices.some(d => d.status === 'OFFLINE');
            const hasOnline = bDevices.some(d => d.status === 'ONLINE');
            const isSelected = selectedBuildingId === b.id;
            const isCurrentTarget = isPinningMode && targetBuildingId === b.id;
            const isPopupOpen = activePopupBuildingId === b.id;

            return (
              <div
                key={b.id}
                style={{
                  position: 'absolute',
                  left: `${screenX}px`,
                  top: `${screenY}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`transition-transform duration-100 ${
                  isPopupOpen || isCurrentTarget ? 'z-50' : isSelected ? 'z-40' : hasOffline ? 'z-30' : 'z-20'
                }`}
              >
                {/* Building Number Pin Badge */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (isPinningMode) {
                      setDraggingPinBuildingId(b.id);
                      setTargetBuildingId(b.id);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPinningMode) {
                      setTargetBuildingId(b.id);
                    } else {
                      onSelectBuilding(b.id);
                      setActivePopupBuildingId(isPopupOpen ? null : b.id);
                    }
                  }}
                  className={`relative flex items-center justify-center font-mono font-black transition-all cursor-pointer pointer-events-auto select-none ${
                    isCurrentTarget
                      ? 'h-8 w-8 rounded-full bg-amber-500 text-slate-950 text-xs ring-4 ring-white shadow-2xl scale-125'
                      : isSelected
                      ? 'h-8 w-8 rounded-full bg-gradient-to-tr from-purple-700 via-purple-600 to-amber-500 text-white text-xs ring-3 ring-amber-400 shadow-xl scale-110'
                      : hasOffline
                      ? 'h-7 w-7 rounded-full bg-rose-600 text-white text-[11px] ring-2 ring-white shadow-lg animate-pulse'
                      : hasOnline
                      ? 'h-7 w-7 rounded-full bg-emerald-600 text-white text-[11px] ring-2 ring-emerald-300 shadow-md'
                      : 'h-6 w-6 rounded-full bg-purple-900/90 hover:bg-purple-800 text-purple-100 text-[10px] border border-purple-400/60 shadow-md'
                  }`}
                  title={isPinningMode ? `อาคาร #${num} (คลิกลากเพื่อปรับตำแหน่ง)` : `อาคาร #${num} ${b.name}`}
                >
                  {num}

                  {/* Red offline warning dot */}
                  {hasOffline && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600 border border-white text-[7px] text-white font-bold items-center justify-center">!</span>
                    </span>
                  )}

                  {/* Device count pill */}
                  {bDevices.length > 0 && !hasOffline && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[8px] font-sans font-bold px-1 rounded-full border border-white">
                      {bDevices.length}
                    </span>
                  )}
                </button>

                {/* Inspect Popup Card (When clicked in normal mode) */}
                {isPopupOpen && !isPinningMode && (
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900/95 backdrop-blur-md border border-purple-500/50 rounded-2xl p-3 text-white shadow-2xl pointer-events-auto z-50 text-xs"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="bg-purple-700 text-white px-1.5 py-0.2 rounded font-mono font-bold text-[10px]">
                          #{num}
                        </span>
                        <span className="font-bold text-white text-xs leading-tight">
                          {b.name}
                        </span>
                      </div>
                      <button
                        onClick={() => setActivePopupBuildingId(null)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    <p className="text-[11px] text-purple-200/80 mb-2 line-clamp-2">
                      {b.description || 'ไม่มีคำอธิบาย'}
                    </p>

                    {/* Status badge */}
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-purple-900/60 mb-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">สถานะอุปกรณ์:</span>
                        {hasOffline ? (
                          <span className="font-bold text-rose-400 flex items-center space-x-1">
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                            <span>มีปัญหา (DOWN)</span>
                          </span>
                        ) : hasOnline ? (
                          <span className="font-bold text-emerald-400 flex items-center space-x-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            <span>ปกติ ({bDevices.length} เครื่อง)</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">ยังไม่มีอุปกรณ์</span>
                        )}
                      </div>

                      {/* Device names mini list */}
                      {bDevices.slice(0, 2).map(d => (
                        <div key={d.id} className="text-[10px] text-slate-300 truncate flex items-center justify-between">
                          <span className="truncate">{d.name}</span>
                          <span className={d.status === 'OFFLINE' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                            {d.status === 'OFFLINE' ? 'DOWN' : 'UP'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        onSelectBuilding(b.id);
                        setActivePopupBuildingId(null);
                        setTimeout(() => {
                          const el = document.getElementById('building-details-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 50);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-amber-200 font-bold text-xs transition cursor-pointer text-center"
                    >
                      🔍 ตรวจดูอุปกรณ์และจัดการสัญญาณ
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State Banner if no pins placed yet */}
        {pinnedCount === 0 && !isPinningMode && (
          <div 
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-slate-900/90 backdrop-blur-md border border-purple-500/40 text-white p-5 rounded-2xl shadow-2xl max-w-sm text-center space-y-3 pointer-events-auto"
          >
            <div className="p-3 bg-purple-900/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-amber-300">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">ยังไม่มีการปักหมุดอาคารบนแผนที่</h4>
              <p className="text-xs text-slate-400 mt-1">
                คลิกลากแผนที่เพื่อเลื่อนหาอาคาร จากนั้นกดปุ่ม "ปักเลขอาคาร" เพื่อเริ่มวางหมุด
              </p>
            </div>
            <button
              onClick={() => setIsPinningMode(true)}
              className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700 text-amber-200 text-xs font-bold shadow-md cursor-pointer transition flex items-center justify-center space-x-1.5"
            >
              <Crosshair className="h-4 w-4" />
              <span>เริ่มปักเลขอาคารตอนนี้</span>
            </button>
          </div>
        )}

        {/* Floating Campus Badge */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center space-x-2 bg-slate-900/85 backdrop-blur-md border border-purple-500/30 text-white px-3 py-2 rounded-xl shadow-lg">
          <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
          <div className="text-left text-xs">
            <div className="font-bold text-white flex items-center space-x-1.5">
              <span>มหาวิทยาลัยราชภัฏบุรีรัมย์ (BRU)</span>
              <span className="text-[10px] text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded font-mono">
                {pinnedCount} หมุดอาคาร
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
                วิธีใช้งานแผนที่และปักเลขอาคาร:
              </span>{' '}
              คลิกค้างแล้วลากเพื่อเลื่อนดูอาคารต่างๆ ทั่ววิทยาเขต มรภ.บุรีรัมย์ และหมุนล้อเมาส์เพื่อซูมเข้า/ออก เมื่อต้องการวางหมุด กดปุ่ม <span className="font-bold text-purple-700 dark:text-amber-300">"ปักเลขอาคาร"</span> แล้วคลิกตรงหลังคาตึกที่ต้องการได้ทันที
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-purple-300/70 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>เลื่อนและซูมได้อย่างอิสระ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
