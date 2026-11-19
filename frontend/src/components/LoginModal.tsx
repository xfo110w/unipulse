import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle, LogIn, X, ShieldAlert } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showDevAlert, setShowDevAlert] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger red development alert as requested
    setShowDevAlert(true);
  };

  const handleClose = () => {
    setShowDevAlert(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#120c24] border border-slate-200 dark:border-purple-900/60 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with BRU Theme */}
        <div className="px-5 py-4 bg-gradient-to-r from-purple-800 via-purple-900 to-purple-950 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <img 
              src="/bru-logo.png" 
              alt="BRU Logo" 
              className="h-9 w-auto object-contain drop-shadow"
            />
            <div>
              <h2 className="text-base font-bold tracking-tight flex items-center space-x-1.5">
                <span>เข้าสู่ระบบ — มรภ.บุรีรัมย์</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono px-1.5 py-0.2 rounded">
                  Auth
                </span>
              </h2>
              <p className="text-xs text-purple-200/80">
                ระบบเฝ้าระวังเครือข่ายดิจิทัล (BRU UniPulse)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-purple-700/60 transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Red Development Alert Box (Triggered on click) */}
          {showDevAlert && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start space-x-2.5 animate-in fade-in zoom-in-95 duration-150">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-[13px] text-rose-700 dark:text-rose-300">
                  ระบบกำลังพัฒนาไม่สามารถใช้งานในส่วนนี้ได้
                </div>
                <p className="text-[11px] text-rose-600/90 dark:text-rose-300/80 leading-relaxed">
                  ระบบยืนยันตัวตนผู้ใช้ (Authentication & Database) อยู่ระหว่างการพัฒนาเพื่อเชื่อมต่อกับฐานข้อมูลกลางของมหาวิทยาลัยราชภัฏบุรีรัมย์
                </p>
              </div>
            </div>
          )}

          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ชื่อผู้ใช้ / Username *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4 text-purple-700 dark:text-purple-400" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (showDevAlert) setShowDevAlert(false);
                }}
                placeholder="เช่น admin หรือ user@bru.ac.th"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-600 dark:focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              รหัสผ่าน / Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4 text-purple-700 dark:text-purple-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (showDevAlert) setShowDevAlert(false);
                }}
                placeholder="กรอกรหัสผ่านของคุณ"
                className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-600 dark:focus:border-amber-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Options: Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
              />
              <span>จดจำฉันไว้ในระบบ</span>
            </label>
            <button
              type="button"
              onClick={() => setShowDevAlert(true)}
              className="text-purple-700 hover:text-purple-900 dark:text-amber-400 dark:hover:text-amber-300 font-medium cursor-pointer"
            >
              ลืมรหัสผ่าน?
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 dark:bg-purple-800 dark:hover:bg-purple-700 text-amber-200 hover:text-white font-bold text-sm rounded-xl shadow-md transition duration-150 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>เข้าสู่ระบบ</span>
            </button>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-[#160e2b] border-t border-slate-200 dark:border-purple-900/50 flex items-center justify-between text-[11px] text-slate-500 dark:text-purple-300/60">
          <span>ศูนย์คอมพิวเตอร์และเทคโนโลยีสารสนเทศ</span>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer font-medium"
          >
            ยกเลิก
          </button>
        </div>

      </div>
    </div>
  );
};
