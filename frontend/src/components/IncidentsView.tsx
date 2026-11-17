import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Check, UserCheck, Timer } from 'lucide-react';
import { Incident } from '../types';
import { formatThaiDateTime, formatThaiTime, formatDuration } from '../utils/date';

interface IncidentsViewProps {
  incidents: Incident[];
  onAcknowledge: (id: number, name: string) => void;
  onResolve: (id: number, note: string) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onAcknowledge,
  onResolve,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [ackModalId, setAckModalId] = useState<number | null>(null);
  const [techName, setTechName] = useState('');

  const [resolveModalId, setResolveModalId] = useState<number | null>(null);
  const [resolveNote, setResolveNote] = useState('');

  const filtered = incidents.filter((inc) => {
    if (filter === 'OPEN') return inc.status === 'OPEN' || inc.status === 'ACKNOWLEDGED';
    if (filter === 'RESOLVED') return inc.status === 'RESOLVED';
    return true;
  });

  const handleAcknowledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ackModalId && techName.trim()) {
      onAcknowledge(ackModalId, techName.trim());
      setAckModalId(null);
      setTechName('');
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolveModalId && resolveNote.trim()) {
      onResolve(resolveModalId, resolveNote.trim());
      setResolveModalId(null);
      setResolveNote('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title - BRU Themed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
            <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-amber-400" />
            <span>บันทึกเหตุการณ์ขัดข้องและการแจ้งเตือน — มหาวิทยาลัยราชภัฏบุรีรัมย์</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-purple-200/70 mt-1">
            ศูนย์คอมพิวเตอร์และเทคโนโลยีสารสนเทศ มรภ.บุรีรัมย์ — บันทึกประวัติอุปกรณ์ขัดข้อง การรับเรื่อง และการแก้ไขตามเกณฑ์ SLA
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex space-x-1.5 bg-slate-100 dark:bg-[#150e28] p-1 rounded-xl border border-slate-200 dark:border-purple-900/60 shadow-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filter === 'ALL'
                ? 'bg-purple-700 text-amber-200 border border-purple-600 dark:bg-purple-800 dark:text-amber-200 dark:border-amber-400/40 shadow-xs'
                : 'text-slate-600 hover:text-purple-900 hover:bg-white dark:text-purple-300/70 dark:hover:text-amber-200 dark:hover:bg-purple-900/50'
            }`}
          >
            ทั้งหมด ({incidents.length})
          </button>
          <button
            onClick={() => setFilter('OPEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filter === 'OPEN'
                ? 'bg-rose-600 text-white shadow-xs dark:bg-rose-600 dark:text-white dark:border dark:border-rose-400/40'
                : 'text-slate-600 hover:text-rose-600 hover:bg-white dark:text-purple-300/70 dark:hover:text-rose-300 dark:hover:bg-rose-950/60'
            }`}
          >
            ยังไม่เสร็จ ({incidents.filter((i) => i.status !== 'RESOLVED').length})
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filter === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-xs dark:bg-emerald-600 dark:text-white dark:border dark:border-emerald-400/40'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-white dark:text-purple-300/70 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/60'
            }`}
          >
            แก้ไขแล้ว ({incidents.filter((i) => i.status === 'RESOLVED').length})
          </button>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs dark:bg-slate-800/40 dark:border-slate-800">
            <CheckCircle className="h-12 w-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">ไม่มีเหตุการณ์ขัดข้องค้างอยู่</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ระบบและอุปกรณ์ทั้งหมดทำงานตามปกติ ไม่มีข้อผิดพลาดที่ต้องดำเนินการ
            </p>
          </div>
        ) : (
          filtered.map((inc) => {
            const isOpen = inc.status === 'OPEN';
            const isAck = inc.status === 'ACKNOWLEDGED';
            const isResolved = inc.status === 'RESOLVED';

            return (
              <div
                key={inc.id}
                className={`border rounded-2xl p-5 transition shadow-xs ${
                  isOpen
                    ? 'bg-rose-50/60 border-rose-200 dark:bg-rose-950/20 dark:border-rose-500/30'
                    : isAck
                    ? 'bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-500/30'
                    : 'bg-white border-slate-200 dark:bg-slate-900/60 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-slate-400 font-bold">#{inc.id}</span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                          inc.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
                            : 'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                          isOpen
                            ? 'bg-rose-600 text-white animate-pulse'
                            : isAck
                            ? 'bg-amber-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {inc.status}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-1 font-mono">
                        <Clock className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                        <span>เริ่มดับเมื่อ: <strong>{formatThaiDateTime(inc.started_at)}</strong></span>
                      </span>
                      {isResolved && inc.resolved_at && (
                        <span className="text-xs text-amber-800 dark:text-amber-400 flex items-center space-x-1 font-mono bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/20">
                          <Timer className="h-3 w-3" />
                          <span>ดับไป: {formatDuration(inc.started_at, inc.resolved_at)}</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{inc.title}</h2>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                      <span>อุปกรณ์: <strong className="text-slate-800 dark:text-slate-300">{inc.device?.name || 'Device'}</strong></span>
                      <span>•</span>
                      <span>สถานที่: {inc.device?.building?.name || 'ไม่ระบุอาคาร'}</span>
                      <span>•</span>
                      <span className="font-mono">IP: {inc.device?.ip_address}</span>
                    </div>

                    {/* Resolution / Ack info */}
                    {inc.acknowledged_by && (
                      <div className="text-xs text-amber-700 dark:text-amber-300/90 flex items-center space-x-1 pt-1">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>รับเรื่องโดย: <strong>{inc.acknowledged_by}</strong> ({formatThaiTime(inc.acknowledged_at)})</span>
                      </div>
                    )}
                    {inc.resolution_note && (
                      <div className="text-xs text-emerald-800 dark:text-emerald-300/90 flex items-start space-x-1 pt-1 bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                        <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <div>
                          <strong>ผลการแก้ไข:</strong> {inc.resolution_note}
                          <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5 font-mono">
                            กู้คืนสำเร็จเมื่อ: {formatThaiDateTime(inc.resolved_at)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {isOpen && (
                      <button
                        onClick={() => setAckModalId(inc.id)}
                        className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow cursor-pointer"
                      >
                        รับเรื่อง (Acknowledge)
                      </button>
                    )}
                    {!isResolved && (
                      <button
                        onClick={() => setResolveModalId(inc.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow cursor-pointer"
                      >
                        บันทึกการแก้ไข (Resolve)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Acknowledge Modal */}
      {ackModalId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">รับเรื่องปัญหา (Acknowledge Incident #{ackModalId})</h3>
            <p className="text-xs text-slate-400 mb-4">
              ระบุชื่อเจ้าหน้าที่หรือช่างเทคนิคที่รับผิดชอบเข้าตรวจสอบอุปกรณ์
            </p>
            <form onSubmit={handleAcknowledgeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ชื่อเจ้าหน้าที่ผู้รับเรื่อง
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายสมชาย (ช่างโสตฯ อาคาร 1)"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAckModalId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold"
                >
                  ยืนยันการรับเรื่อง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModalId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">บันทึกการแก้ไขปัญหา (#{resolveModalId})</h3>
            <p className="text-xs text-slate-400 mb-4">
              ระบุสาเหตุและวิธีแก้ไขปัญหา เพื่อเก็บเป็นฐานข้อมูลความรู้ (Knowledge Base)
            </p>
            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  รายละเอียดการแก้ไข (Resolution Note)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="เช่น ตรวจพบสาย LAN หลุด ได้ทำการเสียบสายใหม่และทดสอบ Ping พบการตอบสนองปกติ"
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
                >
                  บันทึกและปิดเคส
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
