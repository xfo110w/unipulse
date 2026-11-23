import React from 'react';
import { Activity, Server, AlertTriangle, Building2, Sliders, RefreshCw, ExternalLink, Sun, Moon, LogOut } from 'lucide-react';
import { DashboardStats } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  stats: DashboardStats | null;
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean) => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onLogout?: () => void;
  currentUser?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  stats,
  autoRefresh,
  setAutoRefresh,
  onManualRefresh,
  isRefreshing,
  onLogout,
  currentUser,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'ภาพรวม', en: 'Dashboard', icon: Activity },
    { id: 'campus', label: 'ผังอาคาร', en: 'Campus', icon: Building2 },
    { id: 'devices', label: 'อุปกรณ์', en: 'Devices', icon: Server, badge: stats?.total_devices },
    { id: 'incidents', label: 'เหตุการณ์', en: 'Incidents', icon: AlertTriangle, badge: stats?.open_incidents_count, alert: (stats?.open_incidents_count || 0) > 0 },
    { id: 'settings', label: 'ตั้งค่า & Telegram', icon: Sliders },
  ];

  return (
    <header className="bg-white/95 border-b border-purple-100 text-slate-800 dark:bg-[#0f0a1c]/95 dark:border-purple-900/40 dark:text-white sticky top-0 z-40 backdrop-blur-md shadow-xs dark:shadow-lg dark:shadow-purple-950/30 transition-colors duration-200">
      {/* Top BRU Gold Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-purple-700 via-amber-400 to-purple-700" />
      
      {/* Tier 1: University Identity & Controls Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 border-b border-purple-100/60 dark:border-purple-950/50">
          {/* Left Column: Logo & University Full Brand Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer shrink-0 group" 
            onClick={() => setCurrentTab('dashboard')}
          >
            <div className="relative flex items-center justify-center shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 opacity-40 blur-xs group-hover:opacity-80 transition duration-300" />
              <img 
                src="/bru-logo.png" 
                alt="ตราสัญลักษณ์ มหาวิทยาลัยราชภัฏบุรีรัมย์" 
                className="relative h-9 sm:h-10 w-auto drop-shadow-md object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-purple-950 dark:text-white group-hover:text-purple-700 dark:group-hover:text-amber-300 transition-colors whitespace-nowrap">
                  มหาวิทยาลัยราชภัฏบุรีรัมย์
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-900 border border-purple-300 dark:bg-gradient-to-r dark:from-purple-900/80 dark:to-purple-800/80 dark:text-amber-300 dark:border-amber-400/40 font-bold px-1.5 py-0.5 rounded shadow-xs tracking-wider shrink-0">
                  BRU
                </span>
              </div>
              <p className="text-[11px] text-purple-900/70 dark:text-purple-200/70 tracking-normal hidden md:block">
                ระบบเฝ้าระวังและตรวจวัดสถานะโครงสร้างพื้นฐานดิจิทัล (BRU UniPulse)
              </p>
            </div>
          </div>

          {/* Right Column: Refresh Controls, Health Indicator & bru.ac.th link */}
          <div className="flex items-center justify-end space-x-2 shrink-0">
            {stats && (
              <div 
                className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 dark:bg-[#150e28] dark:border-purple-900/60 rounded-lg px-2.5 py-1 text-xs whitespace-nowrap"
                title={`สถานะระบบโดยรวม: ${stats.system_health_percentage}% SLA`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    stats.offline_count === 0 ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]' : 'bg-rose-500 animate-ping'
                  }`}
                />
                <span className="text-slate-500 dark:text-purple-200/70 text-[11px]">SLA:</span>
                <span
                  className={`font-semibold font-mono text-xs ${
                    stats.system_health_percentage >= 95
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : stats.system_health_percentage >= 80
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {stats.system_health_percentage}%
                </span>
              </div>
            )}

            <button
              onClick={onManualRefresh}
              disabled={isRefreshing}
              title="รีเฟรชข้อมูลทันที"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#150e28] dark:hover:bg-purple-900/60 dark:text-purple-200/80 dark:hover:text-amber-300 transition border border-slate-200 dark:border-purple-900/60 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-purple-600 dark:text-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? 'กำลังอัปเดตอัตโนมัติ (คลิกเพื่อหยุด)' : 'คลิกเพื่อเปิดอัปเดตอัตโนมัติ'}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                autoRefresh
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#150e28] dark:text-slate-400 dark:border-purple-900/60 hover:text-slate-900'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="font-mono text-[11px]">{autoRefresh ? 'Auto 15s' : 'Manual'}</span>
            </button>

            {/* Link to bru.ac.th */}
            <a
              href="https://www.bru.ac.th"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center space-x-1 bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 border border-amber-300 dark:bg-amber-400/10 dark:hover:bg-amber-400/20 dark:text-amber-300 dark:border-amber-400/30 px-2.5 py-1 rounded-lg text-xs font-medium transition shadow-xs"
              title="เปิดหน้าเว็บไซต์หลัก มหาวิทยาลัยราชภัฏบุรีรัมย์"
            >
              <span>bru.ac.th</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            {/* Logged-in User Badge */}
            {currentUser && (
              <span className="hidden md:inline-flex items-center space-x-1 text-xs text-purple-950 dark:text-amber-200 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 px-2 py-1 rounded-lg font-mono">
                <span className="text-[11px]">👤</span>
                <span className="font-semibold">{currentUser}</span>
              </span>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 dark:border-rose-800/60 px-2.5 py-1 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
              title="ออกจากระบบ (Sign Out)"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tier 2: Dedicated Navigation Tab Bar - 100% Centered, Full Width, Zero Truncation */}
      <div className="bg-slate-50/70 dark:bg-[#0c0817]/70 py-1.5 px-4 border-t border-purple-50/60 dark:border-purple-950/40">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <nav className="flex items-center overflow-x-auto bg-white/90 dark:bg-[#150e28]/90 p-1 rounded-xl border border-slate-200/90 dark:border-purple-900/50 space-x-1.5 shadow-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-700 to-purple-800 text-amber-200 border border-purple-600 font-semibold shadow-xs dark:from-purple-800/80 dark:to-purple-900/90 dark:text-amber-300 dark:border-amber-400/50 dark:shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'text-slate-600 hover:text-purple-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-amber-200 dark:hover:bg-purple-950/60 border border-transparent'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${item.alert ? 'text-amber-500 animate-bounce' : isActive ? 'text-amber-300' : 'text-purple-700 dark:text-purple-300/80'}`} />
                  <span>{item.label}</span>
                  {item.en && <span className="text-[11px] opacity-75 font-normal">({item.en})</span>}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
                        item.alert
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isActive
                          ? 'bg-amber-400/20 text-amber-200 border border-amber-300/40 dark:text-amber-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
