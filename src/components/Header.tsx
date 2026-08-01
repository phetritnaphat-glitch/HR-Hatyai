import React, { useState, useEffect } from 'react';
import { Employee, LeaveRequest, UserAccount } from '../types';
import { Clock, ShieldCheck, UserCheck, ChevronDown, Bell, Building, Menu, ArrowRight, CheckCircle2, LogOut, Lock, RefreshCw, Check } from 'lucide-react';

interface HeaderProps {
  currentEmployee: Employee;
  allEmployees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
  isAdminView: boolean;
  onToggleAdminView: (isAdmin: boolean) => void;
  pendingLeavesCount: number;
  pendingLeavesList?: LeaveRequest[];
  onNavigateToLeaves?: () => void;
  onToggleMobileMenu: () => void;
  currentUserAccount?: UserAccount | null;
  onLogout?: () => void;
  onSyncData?: () => void;
  sessionSecondsLeft?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentEmployee,
  allEmployees,
  onSelectEmployee,
  isAdminView,
  onToggleAdminView,
  pendingLeavesCount,
  pendingLeavesList = [],
  onNavigateToLeaves,
  onToggleMobileMenu,
  currentUserAccount,
  onLogout,
  onSyncData,
  sessionSecondsLeft
}) => {

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Data Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  });

  const handleTriggerSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);

    if (onSyncData) {
      onSyncData();
    }

    setTimeout(() => {
      setIsSyncing(false);
      const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncedTime(timeStr.substring(0, 5));
      setSyncToast(`ซิงค์ข้อมูลคลาวด์สำเร็จเรียบร้อย (${timeStr} น.)`);

      setTimeout(() => {
        setSyncToast(null);
      }, 4000);
    }, 1100);
  };

  const formatSessionTime = (seconds?: number) => {
    if (seconds === undefined) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('th-TH', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-13 sm:h-14 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Left: Hamburger Menu Button + Brand / Logo */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="p-1.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl md:hidden flex items-center justify-center transition border border-slate-200 shadow-xs shrink-0"
            aria-label="เปิดเมนูหลักซ้ายมือ"
            title="เปิดเมนูซ้ายมือ"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
          </button>

          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 hidden xs:flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
            <Building className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1">
              <h1 className="font-extrabold text-slate-900 text-xs sm:text-base md:text-lg tracking-tight leading-none truncate">
                Thanakrit HR Cloud
              </h1>
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] sm:text-[10px] font-bold rounded-full uppercase tracking-wider hidden sm:inline-block">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate">ระบบบริหารงานบุคคล & คำนวณเงินเดือน</p>
          </div>
        </div>

        {/* Middle: Live Thai Date & Clock Badge */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 h-10 text-xs text-slate-700 shadow-2xs shrink-0">
          <Clock className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
          <span className="font-medium whitespace-nowrap">{currentDate}</span>
          <span className="text-slate-300">|</span>
          <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm whitespace-nowrap">{currentTime} น.</span>
        </div>

        {/* 10-Minute Session Inactivity Timer Badge */}
        {sessionSecondsLeft !== undefined && (
          <div
            className={`hidden lg:flex items-center gap-1.5 px-3 h-10 rounded-xl border text-xs font-mono font-bold shadow-2xs transition whitespace-nowrap shrink-0 ${
              sessionSecondsLeft <= 120
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-amber-50/90 text-amber-900 border-amber-200/90'
            }`}
            title="ระบบจะออกจากระบบอัตโนมัติเมื่อไม่ใช้งานครบ 10 นาที (เวลานับถอยหลังจะรีเซ็ตเมื่อมีการเคลื่อนไหวใช้งานหน้าจอ)"
          >
            <Clock className={`w-3.5 h-3.5 shrink-0 ${sessionSecondsLeft <= 120 ? 'text-rose-600' : 'text-amber-600'}`} />
            <span className="whitespace-nowrap">
              หมดเวลาใน <strong className="font-extrabold text-amber-950 font-mono">{formatSessionTime(sessionSecondsLeft)}</strong> นาที
            </span>
          </div>
        )}

        {/* Right: Role Switcher & Employee Profile Switcher */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          
          {/* Sync Data Button */}
          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className={`h-8.5 sm:h-10 px-2 sm:px-3 rounded-xl border font-bold text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs shrink-0 ${
              isSyncing
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border-emerald-200/80 hover:border-emerald-300'
            }`}
            title={`กดเพื่อซิงค์ข้อมูลล่าสุดกับเซิร์ฟเวอร์ (ซิงค์ล่าสุดเมื่อ ${lastSyncedTime} น.)`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 shrink-0 ${isSyncing ? 'animate-spin text-emerald-700' : ''}`} />
            <span className="hidden sm:inline whitespace-nowrap">ซิงค์</span>
            <span className="text-[10px] text-emerald-600 font-mono hidden lg:inline whitespace-nowrap">({lastSyncedTime})</span>
          </button>

          {/* Notification Button & Popover Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setDropdownOpen(false);
              }}
              className={`h-8.5 w-8.5 sm:h-10 sm:w-10 rounded-xl transition relative flex items-center justify-center border cursor-pointer shadow-2xs ${
                notifOpen
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200/80 text-slate-700'
              }`}
              aria-label="การแจ้งเตือน"
              title="ดูการแจ้งเตือน"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
              {pendingLeavesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-rose-500 text-white text-[9px] sm:text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                  {pendingLeavesCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Backdrop & Popover */}
            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/5"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="fixed left-3 right-3 top-16 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:w-80 md:w-96 sm:max-w-md w-auto mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate" title={isAdminView ? 'การแจ้งเตือนระบบ (HR Admin)' : `การแจ้งเตือนของคุณ (${currentEmployee.name})`}>
                          {isAdminView ? 'การแจ้งเตือนระบบ (HR Admin)' : `การแจ้งเตือนของคุณ (${currentEmployee.name})`}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">
                          {isAdminView ? 'คำขอลางานและรายการรออนุมัติทั้งหมด' : 'คำขอลางานและสถานะรายการของคุณ'}
                        </p>
                      </div>
                    </div>
                    {pendingLeavesCount > 0 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full shrink-0">
                        {pendingLeavesCount} รายการใหม่
                      </span>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 px-2 my-1">
                    {pendingLeavesList && pendingLeavesList.length > 0 ? (
                      pendingLeavesList.map((req) => (
                        <div
                          key={req.id}
                          onClick={() => {
                            if (onNavigateToLeaves) onNavigateToLeaves();
                            setNotifOpen(false);
                          }}
                          className="p-3 hover:bg-slate-50 rounded-xl transition cursor-pointer text-xs space-y-1 group"
                        >
                          <div className="flex justify-between items-center font-bold text-slate-900 gap-2">
                            <span className="group-hover:text-emerald-700 transition truncate">{req.employeeName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                              req.status === 'approved'
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                : req.status === 'rejected'
                                ? 'text-rose-700 bg-rose-50 border border-rose-200'
                                : 'text-amber-600 bg-amber-50 border border-amber-200/60'
                            }`}>
                              {req.status === 'approved' ? 'อนุมัติแล้ว' : req.status === 'rejected' ? 'ไม่อนุมัติ' : 'รออนุมัติ'}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] truncate">
                            ขอลา{req.leaveType === 'annual' ? 'พักร้อน' : req.leaveType === 'sick' ? 'ป่วย' : 'กิจ'} {req.daysCount} วัน ({req.startDate} ถึง {req.endDate})
                          </p>
                          <p className="text-slate-400 text-[10px] italic truncate">"{req.reason}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                        <p className="font-semibold text-slate-600">ไม่มีการแจ้งเตือนค้างอยู่</p>
                        <p className="text-[10px] text-slate-400">รายการทั้งหมดของคุณเรียบร้อยแล้ว</p>
                      </div>
                    )}
                  </div>

                  <div className="px-3 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateToLeaves) onNavigateToLeaves();
                        setNotifOpen(false);
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span className="truncate">ไปที่เมนูการจัดการลางานทั้งหมด</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Admin / Employee Mode Toggle Pill */}
          <div className="h-8.5 sm:h-10 bg-slate-100/90 p-0.5 sm:p-1 rounded-xl flex items-center border border-slate-200/80 text-[10px] sm:text-xs font-semibold whitespace-nowrap shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => onToggleAdminView(false)}
              className={`h-7 sm:h-8 px-1.5 sm:px-3 rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 whitespace-nowrap cursor-pointer ${
                !isAdminView
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>พนักงาน</span>
            </button>

            {currentUserAccount?.role === 'hr' ? (
              <button
                type="button"
                onClick={() => onToggleAdminView(true)}
                className={`h-7 sm:h-8 px-1.5 sm:px-3 rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 whitespace-nowrap cursor-pointer ${
                  isAdminView
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                <span>ผู้ดูแล HR</span>
              </button>
            ) : (
              <span
                title="สิทธิ์พนักงาน: บัญชีของคุณไม่มีสิทธิ์เปิดโหมดผู้ดูแล HR"
                className="h-7 sm:h-8 px-1.5 text-slate-400 opacity-60 flex items-center gap-1 text-[10px] sm:text-[11px] cursor-not-allowed"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span className="hidden xs:inline">HR (จำกัด)</span>
                <span className="xs:hidden">HR</span>
              </span>
            )}
          </div>

          {/* User Profile & Logout Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
                setNotifOpen(false);
              }}
              className="h-8.5 sm:h-10 flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 rounded-xl hover:bg-slate-100 bg-slate-50/80 border border-slate-200/90 transition text-left cursor-pointer shadow-2xs group"
              title="คลิกเพื่อดูรายละเอียดโปรไฟล์ และสลับเลือกพนักงาน"
            >
              <img
                src={currentEmployee.avatar}
                alt={currentEmployee.name}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover ring-2 ring-emerald-500/30 shrink-0"
              />
              <div className="hidden sm:block leading-tight min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[100px] md:max-w-[130px] group-hover:text-emerald-700 transition">
                    {currentEmployee.name}
                  </span>
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                    currentUserAccount?.role === 'hr' ? 'bg-slate-900 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentUserAccount?.role === 'hr' ? 'HR' : 'พนักงาน'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[110px] md:max-w-[140px]">{currentEmployee.position}</div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/5"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="fixed left-3 right-3 top-16 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:w-80 sm:max-w-xs w-auto mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 -mt-2.5 rounded-t-2xl">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={currentEmployee.avatar}
                        alt={currentEmployee.name}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/30 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 text-xs truncate" title={currentEmployee.name}>
                          {currentEmployee.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate" title={currentEmployee.email}>
                          {currentEmployee.email}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {currentEmployee.department} • {currentEmployee.position}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-1 pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-500 font-medium shrink-0">รหัสพนักงาน: <strong className="font-mono text-slate-800">{currentEmployee.code}</strong></span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md truncate shrink-0 ${
                        currentUserAccount?.role === 'hr' ? 'bg-slate-900 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {currentUserAccount?.role === 'hr' ? 'ผู้ดูแลระบบ (HR)' : 'พนักงานทั่วไป'}
                      </span>
                    </div>
                  </div>

                  {/* Logout Action */}
                  <div className="px-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-2 font-bold text-xs cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>ออกจากระบบ (Logout)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>

      {/* Sync Toast Notification Banner */}
      {syncToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 shadow-md flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0 animate-bounce" />
            <span className="truncate">{syncToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncToast(null)}
            className="p-1 hover:bg-emerald-700 rounded-md transition text-emerald-100 cursor-pointer text-[10px] font-mono shrink-0"
          >
            ปิด✕
          </button>
        </div>
      )}
    </header>
  );
};
