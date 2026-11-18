import React, { useState } from 'react';
import { 
  BookOpen, LayoutDashboard, MapPin, Server, AlertTriangle, 
  CheckCircle2, X, ShieldCheck, Zap, Clock, Info, Check
} from 'lucide-react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ManualTab = 'dashboard' | 'campus' | 'devices' | 'incidents';

export const UserManualModal: React.FC<UserManualModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ManualTab>('dashboard');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-[#120c24] border border-slate-200 dark:border-purple-900/60 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-purple-800 to-purple-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-300/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center space-x-2">
                <span>คู่มือการใช้งานระบบ — มหาวิทยาลัยราชภัฏบุรีรัมย์</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-mono">
                  BRU UniPulse Guide
                </span>
              </h2>
              <p className="text-xs text-purple-200/80 mt-0.5">
                ศูนย์คอมพิวเตอร์และเทคโนโลยีสารสนเทศ — คำแนะนำขั้นตอนการใช้งานระบบ 4 หมวดหมู่หลัก
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-purple-700/60 transition cursor-pointer"
            title="ปิดหน้าต่างคู่มือ"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs (4 Sections Only) */}
        <div className="flex items-center overflow-x-auto bg-slate-100 dark:bg-[#160e2b] px-4 py-2 border-b border-slate-200 dark:border-purple-900/50 space-x-2 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-purple-700 text-amber-200 border border-purple-600 dark:bg-purple-800 dark:text-amber-200 dark:border-amber-400/40 shadow-xs'
                : 'text-slate-600 hover:text-purple-900 hover:bg-white dark:text-purple-300/70 dark:hover:text-amber-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>1. ภาพรวม (Dashboard)</span>
          </button>

          <button
            onClick={() => setActiveTab('campus')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'campus'
                ? 'bg-purple-700 text-amber-200 border border-purple-600 dark:bg-purple-800 dark:text-amber-200 dark:border-amber-400/40 shadow-xs'
                : 'text-slate-600 hover:text-purple-900 hover:bg-white dark:text-purple-300/70 dark:hover:text-amber-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>2. ผังอาคาร (Campus Map)</span>
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'devices'
                ? 'bg-purple-700 text-amber-200 border border-purple-600 dark:bg-purple-800 dark:text-amber-200 dark:border-amber-400/40 shadow-xs'
                : 'text-slate-600 hover:text-purple-900 hover:bg-white dark:text-purple-300/70 dark:hover:text-amber-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            <span>3. อุปกรณ์ (Devices)</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'incidents'
                ? 'bg-purple-700 text-amber-200 border border-purple-600 dark:bg-purple-800 dark:text-amber-200 dark:border-amber-400/40 shadow-xs'
                : 'text-slate-600 hover:text-purple-900 hover:bg-white dark:text-purple-300/70 dark:hover:text-amber-200 dark:hover:bg-purple-900/40'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>4. เหตุการณ์ (Incidents)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 rounded-xl p-4">
                <h3 className="font-bold text-purple-900 dark:text-amber-300 text-base flex items-center space-x-2">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>หมวดที่ 1: ภาพรวมระบบ (Dashboard Overview)</span>
                </h3>
                <p className="text-xs text-purple-800/80 dark:text-purple-300/80 mt-1">
                  ศูนย์กลางติดตามสถานะสุขภาพเครือข่ายและสถิติภาพรวมของมหาวิทยาลัยราชภัฏบุรีรัมย์แบบเรียลไทม์
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 text-xs sm:text-sm">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>1. กล่องสรุปสถิติ & สุขภาพรวม (SLA %)</span>
                  </h4>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 list-disc list-inside">
                    <li><strong>ความพร้อมระบบ (System Health SLA):</strong> คำนวณร้อยละของอุปกรณ์ที่ออนไลน์เทียบกับทั้งหมด</li>
                    <li><strong>อุปกรณ์ออนไลน์ (Online / UP):</strong> อุปกรณ์ที่ตอบสนองปกติ (สีเขียว)</li>
                    <li><strong>อุปกรณ์ขัดข้อง (Offline / DOWN):</strong> อุปกรณ์ที่ไม่ตอบสนอง (สีแดง)</li>
                    <li><strong>พักตรวจเช็ค (Maintenance):</strong> อุปกรณ์ที่ปิดพักบำรุงรักษาชั่วคราว</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 text-xs sm:text-sm">
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                    <span>2. แถบเตือนภัยด่วน (Active Issues Alert)</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    หากมีอุปกรณ์ตัวใดสัญญาณหลุด ระบบจะแสดงแถบสีแดงเตือนทันทีที่ด้านบนของแดชบอร์ด พร้อมระบุชื่ออาคารและปุ่มลัดสำหรับเปิดดูสาเหตุวิเคราะห์ปัญหาได้ทันที
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 md:col-span-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 text-xs sm:text-sm">
                    <Clock className="h-4 w-4 text-purple-600 dark:text-amber-400" />
                    <span>3. กราฟวิเคราะห์ประสิทธิภาพ & ประวัติสัญญาณ (Performance Graph)</span>
                  </h4>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 list-disc list-inside">
                    <li><strong>การคลิกเพื่อดูกราฟ:</strong> คลิกที่ชื่ออุปกรณ์ใดก็ได้ในหน้าแดชบอร์ดหรือหน้ารายการอุปกรณ์ เพื่อเปิดหน้าต่างวิเคราะห์ปัญหาเชิงลึก</li>
                    <li><strong>Latency Area Chart:</strong> กราฟพื้นที่แสดงความหน่วงตอบสนอง (ms) พร้อมจุดสีแดงมาร์กตำแหน่งเวลาที่สัญญาณดับ (Outage Drop)</li>
                    <li><strong>Availability Timeline:</strong> แถบสีแสดงความพร้อมย้อนหลัง 20, 50 หรือ 100 รอบล่าสุด</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAMPUS MAP */}
          {activeTab === 'campus' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 rounded-xl p-4">
                <h3 className="font-bold text-purple-900 dark:text-amber-300 text-base flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>หมวดที่ 2: ผังแม่บทและอาคาร 1–23 (Campus Map & Buildings)</span>
                </h3>
                <p className="text-xs text-purple-800/80 dark:text-purple-300/80 mt-1">
                  ผังแม่บทมหาวิทยาลัยราชภัฏบุรีรัมย์แบบโต้ตอบ พร้อมระบบหมุดตรวจสุขภาพอุปกรณ์ประจำแต่ละอาคาร
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    📍 1. การใช้งานผังแม่บทมหาวิทยาลัย (Interactive Map)
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                    <li className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>คลิกที่หมุดตัวเลขอาคาร (1 ถึง 23):</strong> ระบบจะเลื่อนหน้าจอลงไปยังข้อมูลสรุปสัญญาณ สุขภาพ SLA และรายการสวิตช์/WiFi ประจำอาคารนั้นทันที</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>นำเมาส์ไปชี้ (Hover) ที่หมุดอาคาร:</strong> จะมีกล่องสรุปข้อมูลแสดงขึ้นมาทันทีว่า อาคารนี้มีอุปกรณ์กี่เครื่อง และออนไลน์ครบหรือไม่</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>เครื่องมือซูม (+ / - / รีเซ็ต):</strong> ที่มุมขวาบนของผัง มีปุ่มสำหรับซูมขยายและปรับขนาดผังให้พอดีกับหน้าจอ</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    🚨 2. ความหมายของสัญลักษณ์หมุดอาคารบนผัง
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center space-x-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0"></span>
                      <span><strong>จุดสีเขียว (UP):</strong> อุปกรณ์ทุกตัวในอาคารออนไลน์ปกติ</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 flex items-center space-x-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shrink-0 animate-bounce">!</span>
                      <span><strong>เครื่องหมาย ! สีแดง:</strong> ตรวจพบอุปกรณ์ในอาคารดับ (DOWN)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center space-x-2">
                      <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0"></span>
                      <span><strong>หมุดสีเทา:</strong> อาคารที่ยังไม่มีการลงทะเบียนอุปกรณ์</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    🏛️ 3. โครงสร้างอาคารคงที่ (Fixed 1–23 Buildings)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    ระบบล็อคโครงสร้างให้อาคาร 1–23 เป็นอาคารหลักถาวรตามผังแม่บทจริงของมหาวิทยาลัยราชภัฏบุรีรัมย์ ไม่สามารถลบหรือแก้ไขรหัสอาคารได้ เพื่อป้องกันความผิดพลาดของฐานข้อมูลและรักษาความสอดคล้องกับผังแผนที่จริง
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DEVICES */}
          {activeTab === 'devices' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 rounded-xl p-4">
                <h3 className="font-bold text-purple-900 dark:text-amber-300 text-base flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>หมวดที่ 3: การจัดการอุปกรณ์และครุภัณฑ์ (Devices & Assets)</span>
                </h3>
                <p className="text-xs text-purple-800/80 dark:text-purple-300/80 mt-1">
                  การค้นหา คัดกรอง ลงทะเบียนอุปกรณ์ใหม่ และระบบความปลอดภัยในการตรวจสอบวง IP
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    📋 1. การค้นหาและคัดกรองอุปกรณ์
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    ในหน้าอุปกรณ์ คุณสามารถค้นหาได้ทั้งจาก <strong>ชื่ออุปกรณ์, IP Address, เลขครุภัณฑ์, ยี่ห้อ (Cisco, Aruba, Ruijie), หรือรุ่น</strong> และสามารถเลือกกรองตามหมวดหมู่ (สวิตช์ / WiFi AP) หรือกรองเฉพาะอาคารที่ต้องการได้ทันที
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    ➕ 2. การเพิ่มอุปกรณ์ใหม่ (+ เพิ่มอุปกรณ์ใหม่)
                  </h4>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 list-disc list-inside">
                    <li><strong>ข้อมูลทั่วไป:</strong> ระบุชื่ออุปกรณ์, หมวดหมู่, ยี่ห้อ, รุ่น, เลขครุภัณฑ์ และเลือกอาคารที่ติดตั้ง</li>
                    <li><strong>วิธีการตรวจสอบ (Check Type):</strong>
                      <ul className="pl-5 mt-1 space-y-1 list-circle">
                        <li><code>ICMP Ping</code>: ตรวจสอบความพร้อมออนไลน์ด้วยความเร็วสูง</li>
                        <li><code>SNMP v2c</code>: ดึงค่า Uptime ต่อเนื่องจาก Switch/AP ผ่านพอร์ต 161</li>
                        <li><code>TCP Port / HTTP / PJLink</code>: ตรวจสอบพอร์ตเว็บ หรือโปรเจกเตอร์ห้องบรรยาย</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/30 space-y-2">
                  <h4 className="font-bold text-purple-900 dark:text-amber-300 flex items-center space-x-2 text-xs sm:text-sm">
                    <ShieldCheck className="h-4 w-4" />
                    <span>3. ระบบความปลอดภัยของ IP (IP Whitelisting & Simulator Mode)</span>
                  </h4>
                  <div className="text-xs space-y-2 text-slate-700 dark:text-purple-200">
                    <p>
                      <strong>🛡️ การป้องกัน SSRF:</strong> ระบบไม่อนุญาตให้นำ Public IP ภายนอก (เช่น 8.8.8.8) หรือ IP แปลกปลอมมากรอก เพื่อป้องกันการใช้ระบบเป็นฐานสแกนเจาะระบบเครือข่าย โดยจะอนุญาตเฉพาะวงเครือข่ายภายในของมหาวิทยาลัย (เช่น 10.153.x.x) เท่านั้น
                    </p>
                    <p>
                      <strong>🧪 การทดสอบด้วยอุปกรณ์จำลอง (Simulator):</strong> หากต้องการทดสอบด้วยสคริปต์ <code>mock_switch.py</code> หรือ <code>mock_devices.py</code> บนเครื่อง ให้ <strong>ติ๊กเลือกช่อง [✓] "ใช้อุปกรณ์จำลองสำหรับทดสอบ (Simulator / Mock Device)"</strong> ระบบจะอนุญาตให้ใช้ IP <code>127.0.0.1</code> ได้อย่างปลอดภัย พร้อมติดป้ายกำกับ <code>🧪 จำลอง</code> ในตาราง
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INCIDENTS */}
          {activeTab === 'incidents' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 rounded-xl p-4">
                <h3 className="font-bold text-purple-900 dark:text-amber-300 text-base flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>หมวดที่ 4: บันทึกเหตุการณ์ขัดข้อง (Incidents & SLA)</span>
                </h3>
                <p className="text-xs text-purple-800/80 dark:text-purple-300/80 mt-1">
                  การตรวจจับเหตุการณ์ขัดข้องอัตโนมัติ การคำนวณ Downtime และขั้นตอนการรับเรื่อง/แก้ไขปัญหาของช่างเทคนิค
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    ⏱️ 1. วงจรการเกิดเหตุการณ์ (Incident Lifecycle)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 space-y-1">
                      <span className="font-bold text-rose-700 dark:text-rose-300 block">1. ขาดการเชื่อมต่อ (OPEN)</span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">เมื่ออุปกรณ์ดับติดต่อกัน 2 รอบ ระบบจะเปิด Incident อัตโนมัติและเริ่มจับเวลา Downtime</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 space-y-1">
                      <span className="font-bold text-amber-700 dark:text-amber-300 block">2. รับเรื่อง (ACKNOWLEDGED)</span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">ช่างเทคนิคกด "รับเรื่อง" และกรอกชื่อเพื่อยืนยันว่ามีเจ้าหน้าที่กำลังเข้าตรวจสอบ</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-1">
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 block">3. กู้คืนแล้ว (RESOLVED)</span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">ระบบปิดเคสให้อัตโนมัติเมื่ออุปกรณ์กลับมาออนไลน์ พร้อมคำนวณเวลารวมที่ดับไป</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    📝 2. การบันทึกผลการแก้ไข (Resolution Note)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    เจ้าหน้าที่สามารถกดปุ่ม <strong>"บันทึกการแก้ไข (Resolve)"</strong> เพื่อระบุสาเหตุที่แท้จริงและวิธีการแก้ไขปัญหา (เช่น เสียบสาย LAN ใหม่, รีบูตอุปกรณ์, หรือเปลี่ยนตัวแปลงไฟ) เพื่อเก็บเป็นฐานข้อมูลความรู้ (Knowledge Base) สำหรับอ้างอิงในการแก้ไขปัญหาครั้งถัดไป
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-[#160e2b] border-t border-slate-200 dark:border-purple-900/50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-purple-300/60 hidden sm:flex items-center space-x-1.5">
            <Info className="h-3.5 w-3.5 text-purple-600 dark:text-amber-400" />
            <span>BRU UniPulse v1.0 — มหาวิทยาลัยราชภัฏบุรีรัมย์</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-amber-200 font-semibold text-xs transition cursor-pointer shadow-xs ml-auto"
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
