import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, Sun, Moon, Info, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api';

interface LoginViewProps {
  onLogin: (username: string, remember: boolean, token?: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  isDarkMode,
  onToggleTheme,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้');
      return;
    }
    if (!password) {
      setErrorMessage('กรุณากรอกรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await api.login(username.trim(), password);
      onLogin(result.username || username.trim(), rememberMe, result.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-[#0c0817] text-slate-800 dark:text-slate-100 flex flex-col justify-between font-sans transition-colors duration-200 selection:bg-purple-600 selection:text-amber-200 relative overflow-hidden">
      
      {/* Top BRU Gold Line */}
      <div className="fixed top-0 left-0 right-0 h-1 w-full bg-gradient-to-r from-purple-700 via-amber-400 to-purple-700 z-30" />

      {/* Background Decorative Ambient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="max-w-md w-full bg-white dark:bg-[#120c24] border border-slate-200 dark:border-purple-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl dark:shadow-purple-950/40 animate-in fade-in zoom-in-95 duration-200">
          
          {/* BRU Logo and Header */}
          <div className="text-center mb-6">
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 opacity-30 dark:opacity-40 blur-md" />
              <img 
                src="/bru-logo.png" 
                alt="ตราสัญลักษณ์ มหาวิทยาลัยราชภัฏบุรีรัมย์" 
                className="relative h-16 w-auto object-contain drop-shadow-md mx-auto"
              />
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              มหาวิทยาลัยราชภัฏบุรีรัมย์
            </h1>
            <p className="text-xs text-purple-900/80 dark:text-purple-300/80 font-medium mt-0.5">
              Buriram Rajabhat University
            </p>

            <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 dark:bg-purple-950/70 dark:text-amber-300 dark:border-purple-800/80 text-[11px] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>BRU UniPulse • ระบบเฝ้าระวังโครงสร้างพื้นฐาน</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            
            {/* BRU SSO Information Box */}
            <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 text-[11px] text-purple-900 dark:text-purple-200/90 flex items-start space-x-2">
              <Info className="h-4 w-4 text-purple-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">
                เข้าสู่ระบบด้วยบัญชี BRU SSO (สำหรับอาจารย์และเจ้าหน้าที่/บุคลากร มหาวิทยาลัยราชภัฏบุรีรัมย์)
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-2 animate-in fade-in duration-150">
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ชื่อผู้ใช้ / Username *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4 text-purple-700 dark:text-amber-400" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ชื่อผู้ใช้ (เช่น admin หรือชื่อของคุณ)"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-600 dark:focus:border-amber-400 transition shadow-2xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                รหัสผ่าน / Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4 text-purple-700 dark:text-amber-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-600 dark:focus:border-amber-400 transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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

            {/* Options */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-purple-700 focus:ring-purple-500 h-3.5 w-3.5 cursor-pointer"
                />
                <span>จดจำฉันไว้ในระบบ</span>
              </label>
              <span className="text-[11px] text-purple-800/80 dark:text-purple-300/80 font-mono">
                v1.0 Demo
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-600/70 dark:bg-purple-800 dark:hover:bg-purple-700 dark:disabled:bg-purple-900/50 text-amber-200 hover:text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed active:scale-98"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                    <span>กำลังตรวจสอบสิทธิ์กับ BRU SSO...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>เข้าสู่ระบบ (Sign In)</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 dark:text-purple-300/50 z-10 px-4">
        มหาวิทยาลัยราชภัฏบุรีรัมย์ 439 ถนนจิระ ตำบลในเมือง อำเภอเมือง จังหวัดบุรีรัมย์ 31000 • ศูนย์คอมพิวเตอร์และเทคโนโลยีสารสนเทศ
      </footer>

      {/* Floating Dark/Light Mode Toggle */}
      <button
        onClick={onToggleTheme}
        aria-label={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
        title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
        className="fixed bottom-5 right-5 z-40 p-2.5 rounded-full bg-white/95 dark:bg-[#1a1130]/95 text-slate-700 dark:text-amber-300 border border-slate-300/80 dark:border-purple-800/80 shadow-lg hover:shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group"
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4 text-amber-400 group-hover:rotate-45 transition-transform" />
        ) : (
          <Moon className="h-4 w-4 text-purple-700 group-hover:-rotate-12 transition-transform" />
        )}
      </button>

    </div>
  );
};
