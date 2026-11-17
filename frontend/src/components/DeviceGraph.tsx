import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Activity, AlertTriangle, 
  Clock, ShieldCheck, Zap, WifiOff
} from 'lucide-react';
import { HealthLog, Incident } from '../types';
import { formatThaiDateTime, formatThaiTime, formatDuration } from '../utils/date';

interface DeviceGraphProps {
  logs: HealthLog[];
  incidents: Incident[];
  checkType?: string;
  limit: number;
  onLimitChange: (limit: number) => void;
  onCheckDevice?: () => void;
}

export const DeviceGraph: React.FC<DeviceGraphProps> = ({
  logs,
  incidents,
  checkType: _checkType = 'PING',
  limit,
  onLimitChange,
  onCheckDevice,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Chronological logs (oldest to newest for plotting left-to-right)
  const chronLogs = useMemo(() => {
    return [...logs].reverse();
  }, [logs]);

  // Calculations for summary stats
  const stats = useMemo(() => {
    if (chronLogs.length === 0) {
      return {
        total: 0,
        onlineCount: 0,
        offlineCount: 0,
        warningCount: 0,
        uptimePct: 100,
        avgLatency: 0,
        minLatency: 0,
        maxLatency: 0,
      };
    }

    let onlineCount = 0;
    let offlineCount = 0;
    let warningCount = 0;
    let latencySum = 0;
    let minLat = Infinity;
    let maxLat = 0;

    for (const log of chronLogs) {
      if (log.status === 'ONLINE') {
        onlineCount++;
        const lat = log.response_time_ms || 0;
        latencySum += lat;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lat > 100) warningCount++;
      } else if (log.status === 'WARNING') {
        warningCount++;
      } else if (log.status === 'OFFLINE') {
        offlineCount++;
      }
    }

    const uptimePct = chronLogs.length > 0 
      ? Number((((chronLogs.length - offlineCount) / chronLogs.length) * 100).toFixed(1))
      : 100;

    const avgLatency = onlineCount > 0 ? Number((latencySum / onlineCount).toFixed(1)) : 0;
    const finalMin = minLat === Infinity ? 0 : Number(minLat.toFixed(1));
    const finalMax = Number(maxLat.toFixed(1));

    return {
      total: chronLogs.length,
      onlineCount,
      offlineCount,
      warningCount,
      uptimePct,
      avgLatency,
      minLatency: finalMin,
      maxLatency: finalMax,
    };
  }, [chronLogs]);

  // Dimensions for SVG Plot
  const viewBoxWidth = 720;
  const viewBoxHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const plotWidth = viewBoxWidth - paddingLeft - paddingRight;
  const plotHeight = viewBoxHeight - paddingTop - paddingBottom;

  // Calculate Y-axis Scale
  const yMax = useMemo(() => {
    const peak = stats.maxLatency;
    if (peak <= 5) return 10;
    if (peak <= 15) return 20;
    if (peak <= 40) return 50;
    if (peak <= 80) return 100;
    return Math.ceil((peak * 1.2) / 25) * 25;
  }, [stats.maxLatency]);

  // Calculate SVG Points
  const dataPoints = useMemo(() => {
    if (chronLogs.length === 0) return [];
    const count = chronLogs.length;

    return chronLogs.map((log, i) => {
      const x = count === 1 
        ? paddingLeft + plotWidth / 2 
        : paddingLeft + (i / (count - 1)) * plotWidth;

      let y = paddingTop + plotHeight;
      if (log.status === 'ONLINE' || log.status === 'WARNING') {
        const lat = Math.min(yMax, Math.max(0, log.response_time_ms || 0));
        y = paddingTop + plotHeight - (lat / yMax) * plotHeight;
      }

      return {
        x,
        y,
        log,
        index: i,
        isOffline: log.status === 'OFFLINE',
        isWarning: (log.response_time_ms || 0) > 100 || log.status === 'WARNING',
      };
    });
  }, [chronLogs, plotWidth, plotHeight, yMax]);

  // Construct SVG Paths
  const { linePath, areaPath } = useMemo(() => {
    if (dataPoints.length === 0) return { linePath: '', areaPath: '' };
    if (dataPoints.length === 1) {
      const p = dataPoints[0];
      return {
        linePath: `M ${p.x - 10},${p.y} L ${p.x + 10},${p.y}`,
        areaPath: `M ${p.x - 10},${paddingTop + plotHeight} L ${p.x - 10},${p.y} L ${p.x + 10},${p.y} L ${p.x + 10},${paddingTop + plotHeight} Z`,
      };
    }

    const pointsStr = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ');
    const firstX = dataPoints[0].x.toFixed(1);
    const lastX = dataPoints[dataPoints.length - 1].x.toFixed(1);
    const baseline = (paddingTop + plotHeight).toFixed(1);

    return {
      linePath: `M ${pointsStr}`,
      areaPath: `M ${firstX},${baseline} L ${pointsStr} L ${lastX},${baseline} Z`,
    };
  }, [dataPoints, paddingTop, plotHeight]);

  // Mouse Move on Chart to track Hovered point
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dataPoints.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * viewBoxWidth;

    // Find closest point
    let closestIndex = 0;
    let closestDist = Infinity;
    for (let i = 0; i < dataPoints.length; i++) {
      const dist = Math.abs(dataPoints[i].x - mouseX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    }
    setHoveredIndex(closestIndex);
  };

  const hoveredPoint = hoveredIndex !== null && dataPoints[hoveredIndex] ? dataPoints[hoveredIndex] : null;

  return (
    <div className="space-y-4">
      {/* Top Filter and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">กราฟวิเคราะห์ความเสถียร (Latency & Availability)</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">แสดงรอบย้อนหลัง:</span>
          <div className="inline-flex rounded-lg bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700/60 shadow-xs">
            {[20, 50, 100].map((num) => (
              <button
                key={num}
                onClick={() => onLimitChange(num)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  limit === num 
                    ? 'bg-purple-700 text-white font-bold' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {num} รอบ
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Availability / SLA */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>ความพร้อมใช้งาน (Uptime)</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className={`text-xl font-bold font-mono ${stats.uptimePct >= 99 ? 'text-emerald-600 dark:text-emerald-400' : stats.uptimePct >= 95 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {stats.uptimePct}%
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {stats.onlineCount}/{stats.total} รอบที่ตรวจ
          </div>
        </div>

        {/* Average Latency */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>ความเร็วเฉลี่ย (Avg Ping)</span>
            <Zap className="h-3.5 w-3.5 text-purple-600 dark:text-indigo-400" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-xl font-bold font-mono text-purple-700 dark:text-indigo-300">
              {stats.avgLatency}
            </span>
            <span className="text-xs text-purple-600 dark:text-indigo-400">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {stats.avgLatency <= 5 ? 'เร็วมาก (Very Fast)' : stats.avgLatency <= 30 ? 'เสถียรปกติ' : 'หน่วงเล็กน้อย'}
          </div>
        </div>

        {/* Min / Max Peak */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>ต่ำสุด / สูงสุด (Min/Peak)</span>
            <Activity className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              {stats.minLatency}
            </span>
            <span className="text-xs text-slate-400">/</span>
            <span className={`text-base font-bold font-mono ${stats.maxLatency > 100 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {stats.maxLatency}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            ช่วงแกว่งของสัญญาณ
          </div>
        </div>

        {/* Outages / Drops */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>สัญญาณขาดหาย (Drops)</span>
            <WifiOff className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className={`text-xl font-bold font-mono ${stats.offlineCount === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {stats.offlineCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">ครั้ง</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {stats.offlineCount === 0 ? 'สัญญาณไม่เคยขาด' : 'พบจังหวะสัญญาณหลุด'}
          </div>
        </div>
      </div>

      {/* Main SVG Area Chart */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden">
        {dataPoints.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Activity className="h-8 w-8 text-slate-600 mx-auto animate-pulse" />
            <div className="text-sm font-semibold text-slate-400">ยังไม่มีข้อมูลบันทึกสัญญาณสำหรับอุปกรณ์นี้</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              ระบบกำลังรอรอบตรวจจับอัตโนมัติ หรือคุณสามารถกดปุ่ม "Ping Now" เพื่อเริ่มวาดกราฟรอบแรกได้ทันที
            </p>
            {onCheckDevice && (
              <button
                onClick={onCheckDevice}
                className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                ยิงตรวจสอบสัญญาณเดี๋ยวนี้ (Ping Now)
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* SVG Plot */}
            <div className="relative">
              <svg
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                className="w-full h-48 sm:h-56 select-none cursor-crosshair overflow-visible"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <defs>
                  {/* Area gradient for online curve */}
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Red glow for offline drops */}
                  <filter id="glowDrop" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Y-Axis Gridlines & Labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                  const val = Math.round(yMax * pct);
                  const yPos = paddingTop + plotHeight - pct * plotHeight;
                  return (
                    <g key={pct}>
                      <line
                        x1={paddingLeft}
                        y1={yPos}
                        x2={paddingLeft + plotWidth}
                        y2={yPos}
                        stroke="#1e293b"
                        strokeDasharray={pct === 0 ? undefined : "3 3"}
                        strokeWidth="1"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={yPos + 3.5}
                        textAnchor="end"
                        fontSize="10"
                        className="fill-slate-500 font-mono"
                      >
                        {val}ms
                      </text>
                    </g>
                  );
                })}

                {/* Area Gradient Fill */}
                <path d={areaPath} fill="url(#areaGradient)" />

                {/* Main Stroke Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {dataPoints.map((pt, idx) => {
                  if (pt.isOffline) {
                    return (
                      <g key={idx}>
                        {/* Red pulsating circle for offline outage */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="6"
                          fill="#f43f5e"
                          filter="url(#glowDrop)"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="3"
                          fill="#ffffff"
                        />
                      </g>
                    );
                  }

                  // Normal point (render dot if sparse or hovered)
                  const isHovered = hoveredIndex === idx;
                  if (dataPoints.length <= 35 || isHovered) {
                    return (
                      <circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 5 : 2.5}
                        fill={isHovered ? "#38bdf8" : "#10b981"}
                        stroke={isHovered ? "#ffffff" : "#0f172a"}
                        strokeWidth={isHovered ? 2 : 1}
                        className="transition-all"
                      />
                    );
                  }
                  return null;
                })}

                {/* Hover Cursor Vertical Line */}
                {hoveredPoint && (
                  <line
                    x1={hoveredPoint.x}
                    y1={paddingTop}
                    x2={hoveredPoint.x}
                    y2={paddingTop + plotHeight}
                    stroke="#818cf8"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                  />
                )}

                {/* X-Axis Time Ticks */}
                {dataPoints.length > 1 && (
                  <>
                    <text
                      x={paddingLeft}
                      y={viewBoxHeight - 8}
                      textAnchor="start"
                      fontSize="10"
                      className="fill-slate-400 font-mono"
                    >
                      {formatThaiTime(dataPoints[0].log.timestamp)}
                    </text>
                    <text
                      x={paddingLeft + plotWidth / 2}
                      y={viewBoxHeight - 8}
                      textAnchor="middle"
                      fontSize="10"
                      className="fill-slate-400 font-mono"
                    >
                      {formatThaiTime(dataPoints[Math.floor(dataPoints.length / 2)].log.timestamp)}
                    </text>
                    <text
                      x={paddingLeft + plotWidth}
                      y={viewBoxHeight - 8}
                      textAnchor="end"
                      fontSize="10"
                      className="fill-slate-400 font-mono"
                    >
                      {formatThaiTime(dataPoints[dataPoints.length - 1].log.timestamp)} (ล่าสุด)
                    </text>
                  </>
                )}
              </svg>

              {/* Floating Tooltip Box */}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none z-20 bg-slate-900/95 border border-slate-700/80 shadow-2xl rounded-xl p-2.5 text-xs text-white max-w-xs transition-all duration-75 backdrop-blur-xs"
                  style={{
                    left: `${Math.min(75, Math.max(15, (hoveredPoint.x / viewBoxWidth) * 100))}%`,
                    top: '10px',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1 mb-1.5">
                    <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>{formatThaiDateTime(hoveredPoint.log.timestamp)}</span>
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                        hoveredPoint.isOffline
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {hoveredPoint.isOffline ? '🔴 DOWN (ดับ)' : '🟢 UP (ออนไลน์)'}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className="text-slate-400 text-[11px]">ความเร็ว (Latency):</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {hoveredPoint.isOffline ? 'ไม่ตอบสนอง (Timeout)' : `${hoveredPoint.log.response_time_ms?.toFixed(1)} ms`}
                    </span>
                  </div>

                  {hoveredPoint.log.message && (
                    <div className="text-[10px] text-slate-400 mt-1 truncate">
                      {hoveredPoint.log.message}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Availability Strip / Uptime Timeline Blocks */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span className="flex items-center space-x-1">
                  <span>แถบความต่อเนื่องของสัญญาณ ({chronLogs.length} รอบล่าสุด)</span>
                </span>
                <span className="text-emerald-400 font-mono font-medium">
                  {stats.uptimePct}% ความพร้อมใช้งาน
                </span>
              </div>

              {/* Contiguous Pill Bars */}
              <div className="flex items-center gap-1 w-full h-3">
                {chronLogs.map((log, idx) => {
                  const isOff = log.status === 'OFFLINE';
                  const isWarn = (log.response_time_ms || 0) > 100 || log.status === 'WARNING';
                  const isHover = hoveredIndex === idx;

                  return (
                    <div
                      key={log.id || idx}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      title={`${formatThaiTime(log.timestamp)} - ${isOff ? 'OFFLINE (ดับ)' : `${log.response_time_ms}ms`}`}
                      className={`flex-1 h-full rounded-xs transition-all cursor-pointer ${
                        isOff
                          ? 'bg-rose-500 hover:bg-rose-400 animate-pulse scale-y-125'
                          : isWarn
                          ? 'bg-amber-500 hover:bg-amber-400'
                          : 'bg-emerald-500 hover:bg-emerald-400'
                      } ${isHover ? 'ring-2 ring-white scale-y-130 z-10' : 'opacity-85 hover:opacity-100'}`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                <span>← {chronLogs.length > 0 ? formatThaiTime(chronLogs[0].timestamp) : ''} (อดีต)</span>
                <span className="flex items-center space-x-3">
                  <span className="inline-flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>ปกติ</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>หน่วง (&gt;100ms)</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>ดับ (Offline)</span>
                  </span>
                </span>
                <span>ล่าสุด ({chronLogs.length > 0 ? formatThaiTime(chronLogs[chronLogs.length - 1].timestamp) : ''}) →</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Correlated Incidents in this period */}
      {incidents.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
          <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
            <span>เหตุการณ์ดับที่บันทึกได้ ({incidents.length} รายการ)</span>
          </div>
          <div className="space-y-1.5">
            {incidents.slice(0, 3).map((inc) => (
              <div 
                key={inc.id}
                className="text-xs flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className={`h-2 w-2 rounded-full ${inc.status === 'RESOLVED' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500 dark:bg-rose-400 animate-ping'}`} />
                  <span className="text-slate-800 dark:text-slate-300 font-medium truncate">{inc.title}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono shrink-0">
                  ดับไป: <strong className="text-amber-600 dark:text-amber-400">{formatDuration(inc.started_at, inc.resolved_at)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
