import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CampusView } from './components/CampusView';
import { DevicesView } from './components/DevicesView';
import { IncidentsView } from './components/IncidentsView';
import { SettingsView } from './components/SettingsView';
import { DeviceModal } from './components/DeviceModal';
import { DeviceLogsModal } from './components/DeviceLogsModal';
import { UserManualModal } from './components/UserManualModal';
import { LoginView } from './components/LoginView';
import { DashboardStats, Device, Building, Incident } from './types';
import { api } from './api';

export function App() {
  // Authentication state (Prototype Mock Login)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('unipulse_auth') === 'true' || localStorage.getItem('unipulse_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return sessionStorage.getItem('unipulse_user') || localStorage.getItem('unipulse_user') || 'admin';
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkingIds, setCheckingIds] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [viewingLogsDevice, setViewingLogsDevice] = useState<Device | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Theme state: defaults to 'light' (white background as requested), persists in localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('bru_theme');
    if (saved) return saved === 'dark';
    return false; // Default to Light Mode (white background) as requested
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bru_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bru_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const handleLogin = (user: string, remember: boolean, token?: string) => {
    const uname = user.trim() || 'admin';
    setCurrentUser(uname);
    setIsLoggedIn(true);
    if (remember) {
      localStorage.setItem('unipulse_auth', 'true');
      localStorage.setItem('unipulse_user', uname);
      if (token) localStorage.setItem('unipulse_token', token);
    } else {
      sessionStorage.setItem('unipulse_auth', 'true');
      sessionStorage.setItem('unipulse_user', uname);
      if (token) sessionStorage.setItem('unipulse_token', token);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('unipulse_auth');
    sessionStorage.removeItem('unipulse_user');
    sessionStorage.removeItem('unipulse_token');
    localStorage.removeItem('unipulse_auth');
    localStorage.removeItem('unipulse_user');
    localStorage.removeItem('unipulse_token');
  };

  // Load all initial data
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const [statsData, devicesData, buildingsData, incidentsData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getDevices().catch(() => []),
        api.getBuildings().catch(() => []),
        api.getIncidents().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setDevices(devicesData);
      setBuildings(buildingsData);
      setIncidents(incidentsData);
      setErrorMsg(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setErrorMsg('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend ได้');
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [fetchData, isLoggedIn]);

  // Periodic Auto-refresh (pause while adding/editing a device or when logged out)
  useEffect(() => {
    if (!isLoggedIn || !autoRefresh || isDeviceModalOpen) return;
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000); // 15 seconds
    return () => clearInterval(interval);
  }, [isLoggedIn, autoRefresh, isDeviceModalOpen, fetchData]);

  // Handlers
  const handleCheckDevice = async (id: number) => {
    if (checkingIds.includes(id)) return;
    setCheckingIds((prev) => [...prev, id]);
    try {
      await api.checkDeviceNow(id);
      await fetchData(true);
    } catch (err: any) {
      alert(`ไม่สามารถตรวจสอบสถานะได้: ${err.message}`);
    } finally {
      setCheckingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleSaveDevice = async (deviceData: Partial<Device>) => {
    try {
      if (editingDevice) {
        await api.updateDevice(editingDevice.id, deviceData);
      } else {
        await api.createDevice(deviceData);
      }
      setIsDeviceModalOpen(false);
      setEditingDevice(null);
      fetchData();
    } catch (err: any) {
      alert(`บันทึกอุปกรณ์ไม่สำเร็จ: ${err.message}`);
    }
  };

  const handleDeleteDevice = async (id: number) => {
    if (!window.confirm('คุณต้องการลบอุปกรณ์นี้ออกจากระบบหรือไม่?')) return;
    try {
      await api.deleteDevice(id);
      fetchData();
    } catch (err: any) {
      alert(`ลบอุปกรณ์ไม่สำเร็จ: ${err.message}`);
    }
  };

  const handleAcknowledgeIncident = async (id: number, name: string) => {
    try {
      await api.acknowledgeIncident(id, name);
      fetchData();
    } catch (err: any) {
      alert(`บันทึกการรับเรื่องไม่สำเร็จ: ${err.message}`);
    }
  };

  const handleResolveIncident = async (id: number, note: string) => {
    try {
      await api.resolveIncident(id, note);
      fetchData();
    } catch (err: any) {
      alert(`บันทึกการแก้ไขไม่สำเร็จ: ${err.message}`);
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginView
        onLogin={handleLogin}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 dark:bg-[#0c0916] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-purple-600 selection:text-amber-200">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        stats={stats}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        onManualRefresh={() => fetchData(false)}
        isRefreshing={isRefreshing}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Backend connection alert if error */}
      {errorMsg && (
        <div className="bg-rose-50 border-b border-rose-200 text-rose-700 dark:bg-rose-950/60 dark:border-rose-500/40 dark:text-rose-300 px-4 py-2.5 text-center text-xs flex items-center justify-center space-x-2">
          <span>⚠️ {errorMsg} — กรุณาตรวจสอบว่ารัน backend server บนพอร์ต 8000 หรือไม่</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            devices={devices}
            incidents={incidents}
            checkingIds={checkingIds}
            onOpenAddModal={() => {
              setEditingDevice(null);
              setIsDeviceModalOpen(true);
            }}
            onNavigateTab={setCurrentTab}
            onCheckDevice={handleCheckDevice}
            onViewLogs={(device) => setViewingLogsDevice(device)}
            onEditDevice={(device) => {
              setEditingDevice(device);
              setIsDeviceModalOpen(true);
            }}
          />
        )}

        {currentTab === 'campus' && (
          <CampusView
            buildings={buildings}
            devices={devices}
            onCheckDevice={handleCheckDevice}
            onSelectDevice={(d) => setViewingLogsDevice(d)}
            onEditDevice={(device) => {
              setEditingDevice(device);
              setIsDeviceModalOpen(true);
            }}
            onRefresh={() => fetchData(true)}
          />
        )}

        {currentTab === 'devices' && (
          <DevicesView
            devices={devices}
            buildings={buildings}
            checkingIds={checkingIds}
            onOpenAddModal={() => {
              setEditingDevice(null);
              setIsDeviceModalOpen(true);
            }}
            onEditDevice={(device) => {
              setEditingDevice(device);
              setIsDeviceModalOpen(true);
            }}
            onDeleteDevice={handleDeleteDevice}
            onCheckDevice={handleCheckDevice}
            onViewLogs={(device) => setViewingLogsDevice(device)}
          />
        )}

        {currentTab === 'incidents' && (
          <IncidentsView
            incidents={incidents}
            onAcknowledge={handleAcknowledgeIncident}
            onResolve={handleResolveIncident}
          />
        )}

        {currentTab === 'settings' && <SettingsView />}
      </main>

      {/* Modals */}
      <DeviceModal
        isOpen={isDeviceModalOpen}
        onClose={() => {
          setIsDeviceModalOpen(false);
          setEditingDevice(null);
        }}
        onSave={handleSaveDevice}
        device={editingDevice}
        buildings={buildings}
      />

      <DeviceLogsModal
        device={viewingLogsDevice}
        onClose={() => setViewingLogsDevice(null)}
        onCheckDevice={handleCheckDevice}
        onEditDevice={(device) => {
          setViewingLogsDevice(null);
          setEditingDevice(device);
          setIsDeviceModalOpen(true);
        }}
      />

      <UserManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

      {/* Floating Small Dark/Light Mode Toggle Button */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        aria-label={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง (Light Mode)' : 'เปลี่ยนเป็นโหมดมืด (Dark Mode)'}
        title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง (Light Mode)' : 'เปลี่ยนเป็นโหมดมืด (Dark Mode)'}
        className="fixed bottom-5 right-5 z-40 p-2.5 rounded-full bg-white/95 dark:bg-[#1a1130]/95 text-slate-700 dark:text-amber-300 border border-slate-300/80 dark:border-purple-800/80 shadow-lg hover:shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group"
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4 text-amber-400 group-hover:rotate-45 transition-transform" />
        ) : (
          <Moon className="h-4 w-4 text-purple-700 group-hover:-rotate-12 transition-transform" />
        )}
      </button>

      {/* Footer - Buriram Rajabhat University */}
      <footer className="border-t border-slate-200 bg-white dark:border-purple-900/40 dark:bg-[#090612] py-8 text-xs text-slate-600 dark:text-purple-200/60 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center md:text-left">
            <img 
              src="/bru-logo.png" 
              alt="BRU Logo" 
              className="h-8 w-auto hidden sm:block opacity-90"
            />
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-200">
                มหาวิทยาลัยราชภัฏบุรีรัมย์ (Buriram Rajabhat University)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-purple-300/50">
                439 ถนนจิระ ตำบลในเมือง อำเภอเมือง จังหวัดบุรีรัมย์ 31000 • ศูนย์คอมพิวเตอร์และเทคโนโลยีสารสนเทศ
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-1 text-xs">
            <a 
              href="https://www.bru.ac.th" 
              target="_blank" 
              rel="noreferrer" 
              className="text-purple-700 hover:text-purple-950 dark:text-amber-400 dark:hover:text-amber-300 transition-colors font-medium flex items-center space-x-1"
            >
              <span>เว็บไซต์หลัก bru.ac.th</span>
            </a>
            <span className="text-slate-300 dark:text-purple-900">•</span>
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="text-purple-700 hover:text-purple-950 dark:text-amber-400 dark:hover:text-amber-300 transition-colors font-medium cursor-pointer"
            >
              <span>คู่มือการใช้งานระบบ</span>
            </button>
            <span className="text-slate-300 dark:text-purple-900">•</span>
            <a href="/docs" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-purple-900 dark:text-purple-200/80 dark:hover:text-purple-200 transition-colors">
              API Docs
            </a>
            <span className="text-slate-300 dark:text-purple-900">•</span>
            <span className="text-slate-400 dark:text-purple-300/40 font-mono">BRU UniPulse v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
