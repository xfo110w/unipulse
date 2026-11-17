import React, { useState, useEffect } from 'react';
import { Sliders, Send, CheckCircle2, AlertCircle, Terminal, HelpCircle, ExternalLink, ShieldCheck, FileCode } from 'lucide-react';
import { api } from '../api';

export const SettingsView: React.FC = () => {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [config, setConfig] = useState<{
    telegram_configured: boolean;
    telegram_chat_id: string;
    telegram_bot_token_masked: string;
    config_source: string;
  } | null>(null);

  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadConfig = async () => {
    try {
      setLoadingConfig(true);
      const data = await api.getNotificationSettings();
      setConfig(data);
    } catch (err: any) {
      console.error('Error loading notification config:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleTestTelegram = async () => {
    setTestResult(null);
    setTestingTelegram(true);
    try {
      const res = await api.testNotification();
      setTestResult({ type: 'success', message: res.message });
      loadConfig();
    } catch (err: any) {
      setTestResult({ type: 'error', message: err.message || 'เกิดข้อผิดพลาดในการส่งข้อความทดสอบ' });
    } finally {
      setTestingTelegram(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - BRU Themed */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
          <Sliders className="h-6 w-6 text-purple-700 dark:text-amber-400" />
          <span>การตั้งค่าระบบ & การแจ้งเตือน Telegram — มหาวิทยาลัยราชภัฏบุรีรัมย์</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-purple-200/70 mt-1">
          ศูนย์คอมพิวเตอร์และเทคโนโลยีสารสนเทศ มรภ.บุรีรัมย์ — ตั้งค่าช่องทางแจ้งเตือนหลักผ่าน Telegram Bot ด้วยไฟล์ <code className="text-purple-700 dark:text-amber-300 font-mono font-medium">.env</code>
        </p>
      </div>

      {/* Test Result Toast */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border flex items-center space-x-3 shadow-xs ${
            testResult.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-500/50 dark:text-emerald-300'
              : 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-500/50 dark:text-rose-300'
          }`}
        >
          {testResult.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{testResult.message}</span>
        </div>
      )}

      {/* Main Telegram Status Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs dark:bg-slate-800/60 dark:border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center space-x-3.5">
            <div className="h-12 w-12 rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400 flex items-center justify-center font-bold text-lg shadow-inner">
              TG
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Telegram Alert Channel</h3>
                {loadingConfig ? (
                  <span className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
                    กำลังโหลด...
                  </span>
                ) : config?.telegram_configured ? (
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>พร้อมใช้งาน (Configured)</span>
                  </span>
                ) : (
                  <span className="text-xs bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                    ยังไม่ได้ตั้งค่าใน .env
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ช่องทางแจ้งเตือนหลักเมื่ออุปกรณ์ในมหาวิทยาลัยขัดข้องหรือกลับมาออนไลน์ (ส่งตรงเข้าแชตหรือกลุ่ม Telegram)
              </p>
            </div>
          </div>

          <button
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-800 disabled:bg-slate-400 text-amber-200 border border-purple-600 font-semibold py-2.5 px-5 rounded-xl text-sm transition shadow-md cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <Send className="h-4 w-4" />
            <span>{testingTelegram ? 'กำลังส่งข้อความ...' : 'ทดสอบส่งการแจ้งเตือน Telegram'}</span>
          </button>
        </div>

        {/* Configuration Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl dark:bg-slate-900/60 dark:border-slate-700/50">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Telegram Bot Token</span>
            <div className="font-mono text-sm text-purple-800 dark:text-sky-300 truncate font-semibold">
              {config?.telegram_bot_token_masked || (
                <span className="text-slate-400 text-xs italic">ยังไม่ได้ระบุใน .env</span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">อ่านจากตัวแปร TELEGRAM_BOT_TOKEN</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl dark:bg-slate-900/60 dark:border-slate-700/50">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Target Chat ID</span>
            <div className="font-mono text-sm text-purple-800 dark:text-sky-300 truncate font-semibold">
              {config?.telegram_chat_id || (
                <span className="text-slate-400 text-xs italic">ยังไม่ได้ระบุใน .env</span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">อ่านจากตัวแปร TELEGRAM_CHAT_ID (กลุ่ม/แชต)</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl dark:bg-slate-900/60 dark:border-slate-700/50">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">แหล่งที่มาของการตั้งค่า (Source)</span>
            <div className="flex items-center space-x-1.5 text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
              <FileCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>ไฟล์ .env ของระบบ</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">ปลอดภัย ไม่บันทึกลงฐานข้อมูลหรือหน้าเว็บ</span>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-5 p-3.5 rounded-xl bg-purple-50 border border-purple-200 dark:bg-indigo-950/20 dark:border-indigo-500/20 flex items-start space-x-3 text-xs text-purple-900 dark:text-slate-300">
          <ShieldCheck className="h-4 w-4 text-purple-700 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong>ความปลอดภัยของระบบ:</strong> ค่า Bot Token และ Chat ID ถูกควบคุมผ่านไฟล์ <code className="text-purple-800 dark:text-indigo-300 font-mono font-semibold">.env</code> ของเซิร์ฟเวอร์โดยตรง ไม่มีการส่ง Token ผ่านหน้าต่างเว็บเบราว์เซอร์ เพื่อความปลอดภัยของระบบในระดับองค์กร
          </div>
        </div>
      </div>

      {/* How to configure guide */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs dark:bg-slate-800/40 dark:border-slate-700/60">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-3">
          <HelpCircle className="h-5 w-5 text-purple-700 dark:text-sky-400" />
          <span>ขั้นตอนการตั้งค่า Telegram Bot ในไฟล์ .env</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-purple-800 dark:text-sky-400 font-bold block mb-1.5">ขั้นตอนที่ 1: สร้าง Bot Token</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                เปิดแอปพลิเคชัน Telegram ค้นหาบอท <strong className="text-slate-900 dark:text-white">@BotFather</strong> แล้วพิมพ์คำสั่ง <code className="text-purple-700 dark:text-sky-300">/newbot</code> ตั้งชื่อบอท จะได้รับรหัส <strong>HTTP API Token</strong>
              </p>
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              ตัวอย่าง Token: <code className="text-slate-600 dark:text-slate-400">123456789:ABCdefGHI...</code>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-purple-800 dark:text-sky-400 font-bold block mb-1.5">ขั้นตอนที่ 2: หา Chat ID หรือ Group ID</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                ดึง Chat ID ของคุณเอง หรือดึง Group ID ของกลุ่มเจ้าหน้าที่ช่างเทคนิค (เช่น ดึงผ่านบอท <strong className="text-slate-900 dark:text-white">@userinfobot</strong> หรือ <strong className="text-slate-900 dark:text-white">@RawDataBot</strong>)
              </p>
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              หากเป็นกลุ่มไลน์ Chat ID มักขึ้นต้นด้วยเครื่องหมายลบ เช่น <code className="text-slate-600 dark:text-slate-400">-100123456789</code>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-purple-800 dark:text-sky-400 font-bold block mb-1.5">ขั้นตอนที่ 3: ระบุในไฟล์ .env</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                เปิดไฟล์ <code className="text-purple-700 dark:text-sky-300 font-mono font-semibold">.env</code> ในโฟลเดอร์โปรเจกต์ และกรอกค่าดังนี้:
              </p>
              <div className="font-mono text-[11px] bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-purple-900 dark:text-sky-300 font-medium">
                TELEGRAM_BOT_TOKEN=123456789:ABC...<br />
                TELEGRAM_CHAT_ID=-100123456789
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              เมื่อแก้ไขแล้ว ให้รีสตาร์ตเซิร์ฟเวอร์ Backend แล้วกดทดสอบได้ทันที
            </div>
          </div>
        </div>
      </div>

      {/* System Information & API Docs */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs dark:bg-slate-900/80 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 dark:text-white">Campus Equipment &amp; Infrastructure Monitoring System</span>
            <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded">v1.0.0</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            License: MIT Open Source • Backend: Python FastAPI + APScheduler • Alerts: Telegram Bot
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 bg-slate-100 hover:bg-purple-100 text-purple-900 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer"
          >
            <Terminal className="h-3.5 w-3.5 text-purple-700 dark:text-sky-400" />
            <span>Interactive API Docs (Swagger)</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
