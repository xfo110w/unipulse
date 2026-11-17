import React, { useEffect, useState } from 'react';
import { 
  X, Activity, RefreshCw, CheckCircle2, XCircle, AlertTriangle, 
  Clock, Tag, MapPin, ShieldAlert, Check, TrendingUp, Edit3,
  Stethoscope, HelpCircle, CheckSquare, Wrench, Terminal, ShieldCheck, Building2
} from 'lucide-react';
import { Device, HealthLog, Incident } from '../types';
import { api } from '../api';
import { formatThaiDateTime, formatDuration } from '../utils/date';
import { DeviceGraph } from './DeviceGraph';
import { analyzeDeviceIssue } from '../utils/diagnostics';

interface DeviceLogsModalProps {
  device: Device | null;
  onClose: () => void;
  onCheckDevice: (id: number) => void;
  onEditDevice?: (device: Device) => void;
}

export const DeviceLogsModal: React.FC<DeviceLogsModalProps> = ({
  device,
  onClose,
  onCheckDevice,
  onEditDevice,
}) => {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeTab, setActiveTab] = useState<'GRAPH' | 'DIAGNOSIS' | 'DOWNTIME' | 'LOGS'>(
    device?.status === 'OFFLINE' ? 'DIAGNOSIS' : 'GRAPH'
  );
  const [logLimit, setLogLimit] = useState<number>(50);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (device) {
      loadData(device.id, logLimit);
      if (device.status === 'OFFLINE') {
        setActiveTab('DIAGNOSIS');
      }
    }
  }, [device, logLimit]);

  const loadData = async (id: number, limit = logLimit) => {
    setLoading(true);
    try {
      const [logsData, incsData] = await Promise.all([
        api.getDeviceLogs(id, limit),
        api.getDeviceIncidents(id)
      ]);
      setLogs(logsData);
      setIncidents(incsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheck = () => {
    if (!device) return;
    onCheckDevice(device.id);
    setTimeout(() => {
      loadData(device.id, logLimit);
    }, 1500);
  };

  if (!device) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#140e28] border border-slate-200 dark:border-purple-900/60 rounded-2xl max-w-4xl w-full p-6 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-purple-900/60 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{device.name}</h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  device.status === 'ONLINE'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : device.status === 'WARNING'
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 animate-pulse'
                }`}
              >
                {device.status === 'ONLINE' ? 'UP (ออนไลน์)' : device.status === 'OFFLINE' ? 'DOWN (ดับ)' : device.status}
              </span>
            </div>

            {/* Hardware & Location Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              {/* Asset Tag */}
              {device.asset_number && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-400/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-400/30 font-mono">
                  <Tag className="h-3 w-3" />
                  <span>เลขครุภัณฑ์: {device.asset_number}</span>
                </span>
              )}

              {/* Brand & Model */}
              {(device.brand || device.model_name) && (
                <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-[#1f163d] text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60">
                  ยี่ห้อ: {device.brand} {device.model_name && `• ${device.model_name}`}
                </span>
              )}

              {/* Location: Building */}
              {device.building?.name && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-950 dark:text-amber-300 border border-purple-200 dark:border-amber-400/30">
                  <Building2 className="h-3 w-3" />
                  <span>
                    {device.building.name}
                    {device.room?.name && ` • ${device.room.name}`}
                  </span>
                </span>
              )}

              {/* IP Address */}
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1f163d] text-slate-700 dark:text-purple-200 font-mono">
                IP: {device.ip_address}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onEditDevice && (
              <button
                onClick={() => onEditDevice(device)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-amber-600/30 dark:text-slate-300 dark:hover:text-amber-300 dark:border-slate-700 transition cursor-pointer flex items-center space-x-1.5 text-xs font-medium"
                title="แก้ไขข้อมูลและตั้งค่าอุปกรณ์ (Edit Device)"
              >
                <Edit3 className="h-3.5 w-3.5 text-purple-700 dark:text-amber-400" />
                <span>แก้ไขอุปกรณ์</span>
              </button>
            )}
            <button
              onClick={handleManualCheck}
              className={`p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 border border-slate-300 dark:border-transparent dark:bg-slate-800 dark:hover:bg-purple-600 dark:text-slate-300 dark:hover:text-white transition cursor-pointer ${loading ? 'animate-spin' : ''}`}
              title="ตรวจสอบสถานะทันที (Ping Now)"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Uptime Summary Banner */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 mt-4 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              ระยะเวลาที่เปิดทำงานต่อเนื่อง (Uptime):{' '}
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                {device.uptime_str || (device.status === 'ONLINE' ? 'ออนไลน์' : 'ดับอยู่')}
              </strong>
            </span>
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            ตรวจจับแบบ: <strong className="text-purple-700 dark:text-sky-300">{device.check_type}</strong> (ทุก {device.check_interval} วินาที)
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 mt-4 pb-2">
          {/* TAB 1: GRAPH */}
          <button
            onClick={() => setActiveTab('GRAPH')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'GRAPH'
                ? 'bg-purple-700 text-amber-200 border border-amber-400/40 shadow-sm'
                : 'text-slate-600 hover:text-purple-800 hover:bg-purple-50 dark:text-purple-300/70 dark:hover:text-white dark:hover:bg-purple-900/40'
            }`}
          >
            <TrendingUp className="h-4 w-4 text-amber-400" />
            <span>กราฟวิเคราะห์ (Graph)</span>
          </button>

          {/* TAB 2: DIAGNOSIS */}
          <button
            onClick={() => setActiveTab('DIAGNOSIS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'DIAGNOSIS'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : device.status === 'OFFLINE'
                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 animate-pulse'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Stethoscope className="h-4 w-4" />
            <span>วิเคราะห์ปัญหา {device.status === 'OFFLINE' ? '(พบข้อผิดพลาด)' : ''}</span>
          </button>

          {/* TAB 3: DOWNTIME HISTORY */}
          <button
            onClick={() => setActiveTab('DOWNTIME')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'DOWNTIME'
                ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>ประวัติการดับ ({incidents.length})</span>
          </button>

          {/* TAB 4: HEALTH LOGS */}
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'LOGS'
                ? 'bg-purple-700 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>ตารางผลตรวจ (Logs)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-4 py-4 pr-1 flex-1">
          {/* TAB 1: GRAPH VIEW */}
          {activeTab === 'GRAPH' && (
            <DeviceGraph
              logs={logs}
              incidents={incidents}
              checkType={device.check_type}
              limit={logLimit}
              onLimitChange={(newLimit) => setLogLimit(newLimit)}
              onCheckDevice={handleManualCheck}
            />
          )}

          {/* TAB 2: DIAGNOSIS VIEW */}
          {activeTab === 'DIAGNOSIS' && (() => {
            const diag = analyzeDeviceIssue(device, logs[0]);
            const isOffline = device.status === 'OFFLINE';
            return (
              <div className="space-y-4">
                {/* Status Diagnosis Banner */}
                <div className={`p-4 rounded-xl border ${
                  isOffline
                    ? 'bg-rose-50 border-rose-300 dark:bg-rose-950/20 dark:border-rose-500/40'
                    : 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-500/30'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2.5 rounded-xl ${
                        isOffline ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                      }`}>
                        {isOffline ? <AlertTriangle className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            isOffline
                              ? 'bg-rose-200 text-rose-800 dark:bg-rose-500/30 dark:text-rose-300 border border-rose-300 dark:border-rose-500/50'
                              : 'bg-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                          }`}>
                            {isOffline ? '⚠️ ไม่สามารถเชื่อมต่อกับ IP นี้ได้' : '✓ สถานะการเชื่อมต่อปกติ'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">IP: {device.ip_address}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">ตรวจจับแบบ: {device.check_type}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">{diag.title}</h3>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-mono bg-slate-100 dark:bg-slate-900/80 px-2.5 py-1 rounded-md inline-block border border-slate-200 dark:border-slate-800">
                          Log: {diag.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Root Cause Analysis (ทำไมเชื่อมต่อกับของจริงไม่ได้) */}
                <div className="bg-slate-50 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-3">
                    <HelpCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    <span>ทำไมถึงเชื่อมต่อกับอุปกรณ์จริงไม่ได้? (Root Cause Analysis)</span>
                  </h4>
                  <div className="space-y-2">
                    {diag.causes.map((cause, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                        <span className="text-rose-500 font-bold shrink-0">•</span>
                        <span>{cause}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable Recommendations (วิธีแก้ปัญหาทีละขั้นตอน) */}
                <div className="bg-slate-50 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-3">
                    <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>แนวทางการแก้ไขและข้อแนะนำ (Troubleshooting Checklist)</span>
                  </h4>
                  <div className="space-y-2">
                    {diag.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-200 bg-emerald-50 dark:bg-emerald-950/15 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CLI Command for manual test */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
                    <Terminal className="h-4 w-4 text-purple-400" />
                    <span>คำสั่งสำหรับทดสอบด้วยตนเองผ่าน Terminal / PowerShell:</span>
                  </div>
                  <div className="bg-slate-950 px-3 py-2 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800 select-all">
                    {device.check_type === 'PORT' 
                      ? `Test-NetConnection -ComputerName ${device.ip_address} -Port ${device.port || 80}`
                      : `ping ${device.ip_address} -t`
                    }
                  </div>
                </div>

                {/* Quick Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    💡 สวิตช์/AP มหาวิทยาลัยส่วนใหญ่ถูกตั้งค่าความปลอดภัยไว้ หากเชื่อมต่อไม่ได้ ให้ลองเปลี่ยนวิธีตรวจเป็น PING
                  </div>
                  <div className="flex items-center space-x-2">
                    {onEditDevice && (
                      <button
                        onClick={() => onEditDevice(device)}
                        className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>แก้ไขวิธีตรวจจับ / ข้อมูลอุปกรณ์</span>
                      </button>
                    )}
                    <button
                      onClick={handleManualCheck}
                      disabled={loading}
                      className="px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>ทดสอบ Ping ใหม่อีกครั้ง</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
          {/* TAB 1: DOWNTIME HISTORY */}
          {activeTab === 'DOWNTIME' && (
            <div className="space-y-3">
              {incidents.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2 opacity-80" />
                  <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">ไม่พบประวัติการดับ (100% Up-time)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    อุปกรณ์นี้ทำงานได้อย่างราบรื่น ไม่เคยเกิดเหตุการณ์สัญญาณขาดหาย
                  </div>
                </div>
              ) : (
                incidents.map((inc) => {
                  const isResolved = inc.status === 'RESOLVED';
                  return (
                    <div
                      key={inc.id}
                      className={`p-4 rounded-xl border transition ${
                        isResolved
                          ? 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/70'
                          : 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-500/40 animate-pulse'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isResolved
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                                  : 'bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
                              }`}
                            >
                              {isResolved ? '✓ กู้คืนแล้ว (RESOLVED)' : '⚠️ กำลังดับอยู่ (CRITICAL)'}
                            </span>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{inc.title}</h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">🔴 ดับเมื่อ (Started):</span>
                              <span className="font-mono text-slate-800 dark:text-slate-200">{formatThaiDateTime(inc.started_at)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">🟢 กู้คืนได้เมื่อ (Recovered):</span>
                              <span className="font-mono text-slate-800 dark:text-slate-200">
                                {isResolved ? formatThaiDateTime(inc.resolved_at) : 'ยังไม่กู้คืน'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">⏱️ รวมเวลาดับ (Downtime):</span>
                              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                {formatDuration(inc.started_at, inc.resolved_at)}
                              </span>
                            </div>
                          </div>

                          {inc.resolution_note && (
                            <div className="mt-2 text-xs bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 rounded-lg p-2 text-emerald-800 dark:text-emerald-300">
                              <strong>หมายเหตุการแก้ไข:</strong> {inc.resolution_note}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: HEALTH LOGS */}
          {activeTab === 'LOGS' && (
            <div>
              {logs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  กำลังโหลดหรือยังไม่มีประวัติการตรวจสอบ...
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5">วัน - เวลา</th>
                        <th className="px-4 py-2.5">สถานะ</th>
                        <th className="px-4 py-2.5">Latency</th>
                        <th className="px-4 py-2.5">ข้อความ (Message)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                            {formatThaiDateTime(log.timestamp)}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === 'ONLINE'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                                  : log.status === 'WARNING'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400'
                              }`}
                            >
                              {log.status === 'ONLINE' ? 'UP' : log.status === 'OFFLINE' ? 'DOWN' : log.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono">
                            {log.response_time_ms ? `${log.response_time_ms.toFixed(1)} ms` : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                            {log.message || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
