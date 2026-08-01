import React, { useState } from 'react';
import {
  LayoutDashboard,
  Clock,
  ClipboardList,
  Banknote,
  FileText,
  CalendarDays,
  Users,
  BarChart3,
  CheckCircle2,
  Sparkles,
  X,
  Building,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export type TabType = 'dashboard' | 'checkin' | 'history' | 'payroll' | 'leaves' | 'shifts' | 'employees' | 'reports';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingLeavesCount: number;
  isAdminView: boolean;
  mobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingLeavesCount,
  isAdminView,
  mobileMenuOpen = false,
  onCloseMobileMenu
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const rawMenuItems = [
    {
      id: 'checkin' as TabType,
      label: 'การลงเวลาเข้างานเรียลไทม์วันนี้',
      subLabel: 'บันทึกผ่าน GPS และสแกนหน้าล่าสุด',
      icon: Clock,
      badge: null,
      adminOnly: false
    },
    {
      id: 'history' as TabType,
      label: 'ประวัติการลงเวลา (Attendance Log)',
      subLabel: 'บันทึกเข้า-ออก สาย/OT และสถานที่',
      icon: ClipboardList,
      badge: null,
      adminOnly: false
    },
    {
      id: 'dashboard' as TabType,
      label: isAdminView ? 'แดชบอร์ดสรุปภาพรวม' : 'ภาพรวมการทำงานของฉัน',
      subLabel: isAdminView ? 'Overview & HR Analytics' : 'My Performance & Daily Log',
      icon: LayoutDashboard,
      badge: null,
      adminOnly: false
    },
    {
      id: 'payroll' as TabType,
      label: isAdminView ? 'คำนวณเงินเดือน & ออกสลิป' : 'สลิปเงินเดือนของฉัน',
      subLabel: isAdminView ? 'Payroll & Tax Management' : 'My Payslip & Salary Slip',
      icon: Banknote,
      badge: null,
      adminOnly: false
    },
    {
      id: 'leaves' as TabType,
      label: isAdminView ? 'จัดการวันลา & อนุมัติ' : 'ยื่นคำขอลางาน & โควต้า',
      subLabel: isAdminView ? 'Leave Approval & Quotas' : 'My Leave Requests & Balance',
      icon: FileText,
      badge: (isAdminView && pendingLeavesCount > 0) ? pendingLeavesCount : null,
      adminOnly: false
    },
    {
      id: 'shifts' as TabType,
      label: isAdminView ? 'จัดกะ & ตารางทำงาน' : 'ตารางกะการทำงานของฉัน',
      subLabel: isAdminView ? 'Shift & Roster Planning' : 'My Work Schedule',
      icon: CalendarDays,
      badge: null,
      adminOnly: false
    },
    {
      id: 'employees' as TabType,
      label: 'ข้อมูลพนักงาน & สิทธิ์',
      subLabel: 'Employee Directory & Permissions',
      icon: Users,
      badge: null,
      adminOnly: true
    },
    {
      id: 'reports' as TabType,
      label: 'รายงาน & ส่งออก Excel',
      subLabel: 'Analytics & Excel Export',
      icon: BarChart3,
      badge: 'Excel',
      adminOnly: true
    }
  ];

  const menuItems = rawMenuItems.filter((item) => !item.adminOnly || isAdminView);

  const handleSelectTab = (tab: TabType) => {
    onTabChange(tab);
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          onClick={onCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container (Desktop Sidebar + Mobile Drawer) */}
      <aside
        className={`bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between transition-all duration-300 z-50
          /* Desktop Styles */
          md:static md:translate-x-0 ${isCollapsed ? 'md:w-20 md:p-3' : 'md:w-64 md:p-4'} md:min-h-[calc(100vh-4rem)] md:z-auto
          /* Mobile Drawer Styles */
          fixed inset-y-0 left-0 w-80 max-w-[85vw] p-4 shadow-2xl overflow-y-auto ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="space-y-4">
          
          {/* Mobile Drawer Top Header (Shown on mobile only) */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 md:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-white text-sm">เมนู Thanakrit HR Cloud</div>
                <div className="text-[10px] text-slate-400">เลือกเมนูการใช้งาน</div>
              </div>
            </div>
            <button
              onClick={onCloseMobileMenu}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              aria-label="ปิดเมนู"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Sidebar Toggle Header (Shown on desktop) */}
          <div className="hidden md:flex items-center justify-between pb-3 border-b border-slate-800/80">
            {!isCollapsed ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  HR
                </div>
                <span className="text-xs font-bold text-slate-200">เมนูการทำงาน</span>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer border shadow-2xs flex items-center justify-center gap-1.5 active:scale-95 ${
                isCollapsed 
                  ? 'w-11 h-11 mx-auto bg-slate-800/90 hover:bg-emerald-600 text-emerald-400 hover:text-white border-slate-700 hover:border-emerald-500' 
                  : 'p-2 bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
              }`}
              title={isCollapsed ? 'ขยายเมนูข้าง (Click to Expand Sidebar)' : 'ย่อเมนูข้าง (Click to Collapse Sidebar)'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5" />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-300 hover:text-white">ย่อเมนู</span>
                </>
              )}
            </button>
          </div>

          {/* Mode Info Banner */}
          {!isCollapsed ? (
            <div className={`p-3 rounded-xl border text-xs transition-all ${
              isAdminView 
                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' 
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{isAdminView ? 'โหมดผู้ดูแลระบบ (HR)' : 'โหมดพนักงาน'}</span>
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                {isAdminView
                  ? 'คุณสามารถอนุมัติการลา คำนวณเงินเดือน และส่งออก Excel ได้'
                  : 'ลงเวลาทำงาน ยื่นใบลา และดูสลิปเงินเดือนของคุณ'}
              </p>
            </div>
          ) : (
            <div
              className="hidden md:flex justify-center p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-emerald-400"
              title={isAdminView ? 'โหมดผู้ดูแลระบบ (HR Admin)' : 'โหมดพนักงาน (Employee Portal)'}
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
          )}

          {/* Menu Navigation */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  title={`${item.label} (${item.subLabel})`}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'md:justify-center p-3' : 'justify-between p-3'
                  } rounded-xl transition-all text-left group min-h-[44px] relative ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'md:justify-center' : ''}`}>
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`} />
                    
                    {/* Hide text when collapsed on desktop */}
                    <div className={`truncate ${isCollapsed ? 'md:hidden' : 'block'}`}>
                      <div className="text-sm tracking-tight leading-snug truncate">{item.label}</div>
                      <div className={`text-[10px] font-normal truncate ${
                        isActive ? 'text-emerald-100' : 'text-slate-400'
                      }`}>
                        {item.subLabel}
                      </div>
                    </div>
                  </div>

                  {/* Badge */}
                  {item.badge !== null && (
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      isCollapsed ? 'md:absolute md:-top-1 md:-right-1 md:px-1.5 md:py-0.2 md:text-[9px]' : ''
                    } ${
                      isActive
                        ? 'bg-white text-emerald-800'
                        : typeof item.badge === 'number'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className={`mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1 ${
          isCollapsed ? 'md:hidden' : 'block'
        }`}>
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>ระบบพร้อมใช้งาน (Online)</span>
          </div>
          <p className="text-slate-400">รองรับ GPS เช็คอิน, สแกนหน้า, ภาษี & ประกันสังคมไทย</p>
          <p className="text-[10px] text-emerald-400 font-semibold pt-1">v69.8.1 -Thanakrit HR Cloud</p>
          <p className="text-[10px] text-slate-400">ออกแบบและจัดทำโดย คุณธนกฤต เพชรฤทธิ์</p>
        </div>

        {/* Collapsed Footer Icon & Quick Expand Button */}
        {isCollapsed && (
          <div className="hidden md:flex flex-col items-center gap-2 pt-3 border-t border-slate-800 text-emerald-500">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="p-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-xl transition border border-slate-700/80 cursor-pointer shadow-xs"
              title="ขยายเมนูข้าง (Expand Sidebar)"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
            <div title="ระบบพร้อมใช้งาน (Online)" className="p-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};


