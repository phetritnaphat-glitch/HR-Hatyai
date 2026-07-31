import React, { useState } from 'react';
import { Employee, AttendanceRecord, LeaveRequest, PayrollRecord } from '../types';
import { TabType } from './Sidebar';
import { formatTHB } from '../utils/payroll';
import {
  Users,
  Clock,
  UserCheck,
  UserX,
  FileSpreadsheet,
  AlertCircle,
  ArrowRight,
  MapPin,
  Camera,
  CalendarCheck,
  Calendar,
  Banknote,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DashboardViewProps {
  currentEmployee: Employee;
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  payrollRecords: PayrollRecord[];
  onNavigate: (tab: TabType) => void;
  isAdminView: boolean;
  onQuickCheckIn: (method: 'GPS' | 'FaceScan') => void;
  todayCheckedIn: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentEmployee,
  employees,
  attendanceRecords,
  leaveRequests,
  payrollRecords,
  onNavigate,
  isAdminView,
  onQuickCheckIn,
  todayCheckedIn
}) => {
  const [isQuickMenuCollapsed, setIsQuickMenuCollapsed] = useState(true);

  // Stats calculation
  const totalEmployees = employees.length;
  const todayDate = '2026-07-27';
  const todayAttendance = attendanceRecords.filter((a) => a.date === todayDate);

  const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
  const lateCount = todayAttendance.filter((a) => a.status === 'late').length;
  const leaveCount = todayAttendance.filter((a) => a.status === 'leave').length;
  const absentCount = totalEmployees - (presentCount + lateCount + leaveCount);

  const pendingLeaves = leaveRequests.filter(
    (l) =>
      l.status === 'pending' &&
      (isAdminView || l.employeeId === currentEmployee.id || l.employeeName === currentEmployee.name)
  );

  const myPayroll = payrollRecords.find((p) => p.employeeId === currentEmployee.id);
  const totalMonthlyPayroll = isAdminView
    ? payrollRecords.reduce((acc, curr) => acc + curr.netPay, 0)
    : myPayroll?.netPay || 0;
  const totalOTPay = isAdminView
    ? payrollRecords.reduce((acc, curr) => acc + curr.ot1_5Pay + curr.ot2_0Pay, 0)
    : (myPayroll?.ot1_5Pay || 0) + (myPayroll?.ot2_0Pay || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ยินดีต้อนรับสู่ระบบบริหารงานบุคคล HR Online</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              สวัสดีคุณ {currentEmployee.name} 👋
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              {currentEmployee.position} • {currentEmployee.department} ({currentEmployee.workMode})
            </p>
          </div>

          {/* Quick Attendance Check-in Widget */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 w-full md:w-auto">
            <div className="text-xs text-slate-300 mb-2 font-medium flex items-center justify-between">
              <span>สถานะลงเวลาวันนี้ (27 ก.ค. 2026):</span>
              {todayCheckedIn ? (
                <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md">
                  ✓ ลงเวลาแล้ว
                </span>
              ) : (
                <span className="text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-md">
                  ยังไม่ได้ลงเวลา
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onQuickCheckIn('GPS')}
                className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md"
              >
                <MapPin className="w-4 h-4" />
                เช็คอิน GPS
              </button>
              <button
                onClick={() => onQuickCheckIn('FaceScan')}
                className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-lg transition"
              >
                <Camera className="w-4 h-4 text-emerald-300" />
                สแกนหน้า
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Present */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {isAdminView ? 'มาทำงานวันนี้' : 'สถานะการลงเวลาวันนี้'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {isAdminView ? (
              <>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{presentCount}</span>
                <span className="text-xs text-slate-500">/ {totalEmployees} คน</span>
              </>
            ) : (
              <span className={`text-base sm:text-lg font-extrabold ${todayCheckedIn ? 'text-emerald-600' : 'text-amber-600'}`}>
                {todayCheckedIn ? 'ลงเวลาเรียบร้อย' : 'ยังไม่ได้ลงเวลา'}
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {isAdminView
              ? `เข้างานตรงเวลาสูง (${Math.round((presentCount / (totalEmployees || 1)) * 100)}%)`
              : todayCheckedIn
              ? 'บันทึกเวลาเข้างานแล้ว'
              : 'กรุณาเช็คอินเมื่อถึงสถานที่'}
          </div>
        </div>

        {/* Card 2: Late */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {isAdminView ? 'มาสายวันนี้' : 'การมาสายของคุณ'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {isAdminView ? (
              <>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{lateCount}</span>
                <span className="text-xs text-slate-500">คน</span>
              </>
            ) : (
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">0</span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {isAdminView ? 'มีเฉลี่ยสาย 15-25 นาที' : 'ประวัติตรงเวลาดีเยี่ยม'}
          </div>
        </div>

        {/* Card 3: On Leave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {isAdminView ? 'ลางานวันนี้' : 'วันลาพักร้อนคงเหลือ'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {isAdminView ? (
              <>
                <span className="text-2xl sm:text-3xl font-extrabold text-sky-600">{leaveCount}</span>
                <span className="text-xs text-slate-500">คน</span>
              </>
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-extrabold text-sky-600">
                  {currentEmployee.leaveBalance.annual.total - currentEmployee.leaveBalance.annual.used}
                </span>
                <span className="text-xs text-slate-500">วัน</span>
              </>
            )}
          </div>
          <div className="mt-2 text-[11px] text-sky-600 font-medium">
            {isAdminView
              ? 'ลาพักร้อน / ลาป่วยถูกต้อง'
              : `ใช้ไปแล้ว ${currentEmployee.leaveBalance.annual.used} จาก ${currentEmployee.leaveBalance.annual.total} วัน`}
          </div>
        </div>

        {/* Card 4: Monthly Payroll Estimate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {isAdminView ? 'ยอดจ่ายเงินเดือนสุทธิงวดนี้' : 'เงินเดือนสุทธิของคุณงวดนี้'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900">
              {formatTHB(totalMonthlyPayroll)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            รวม OT {formatTHB(totalOTPay)}
          </div>
        </div>

      </div>

      {/* Main Grid: Pending Approvals & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Leaves Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">
                {isAdminView ? 'คำขอลางานรอการอนุมัติ' : 'คำขอลางานของคุณรอการอนุมัติ'}
              </h3>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              {pendingLeaves.length} รายการ
            </span>
          </div>

          {pendingLeaves.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">ไม่มีคำขอลางานค้างอนุมัติในขณะนี้</p>
          ) : (
            <div className="space-y-3">
              {pendingLeaves.map((l) => (
                <div key={l.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{l.employeeName}</span>
                    <span className="text-amber-600 font-medium">({l.daysCount} วัน)</span>
                  </div>
                  <div className="text-slate-500">
                    {l.leaveType === 'annual'
                      ? 'ลาพักร้อน'
                      : l.leaveType === 'sick'
                      ? 'ลาป่วย'
                      : 'ลากิจ'}{' '}
                    • {l.startDate} ถึง {l.endDate}
                  </div>
                  <p className="text-slate-600 italic text-[11px]">"{l.reason}"</p>
                  <button
                    onClick={() => onNavigate('leaves')}
                    className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition cursor-pointer"
                  >
                    {isAdminView ? 'จัดการและอนุมัติในเมนูลางาน →' : 'ติดตามสถานะใบลาของคุณ →'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick SaaS Feature Launchers / Employee Quick Actions */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between transition-all duration-300">
          <div>
            {/* Header with Expand / Collapse Toggle Button */}
            <div 
              className="flex items-center justify-between cursor-pointer select-none group"
              onClick={() => setIsQuickMenuCollapsed(!isQuickMenuCollapsed)}
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-base text-white">
                    {isAdminView ? 'ฟังก์ชั่นลัดผู้ดูแลระบบ' : 'เมนูด่วนสำหรับพนักงาน'}
                  </h4>
                  {isQuickMenuCollapsed && (
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                      ย่ออยู่ (คลิกเพื่อขยาย)
                    </span>
                  )}
                </div>
                {!isQuickMenuCollapsed && (
                  <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                    {isAdminView
                      ? 'เข้าถึงเมนูคำนวณเงินเดือน และรายงาน Excel ได้อย่างรวดเร็ว'
                      : 'ทำรายการลงเวลา ยื่นใบลา หรือดูสลิปเงินเดือนของคุณได้อย่างรวดเร็ว'}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsQuickMenuCollapsed(!isQuickMenuCollapsed);
                }}
                className="p-2 bg-white/10 hover:bg-emerald-600 text-white rounded-xl transition cursor-pointer border border-white/15 shadow-xs flex items-center gap-1 shrink-0"
                title={isQuickMenuCollapsed ? 'ขยายเมนูด่วน' : 'ย่อเมนูด่วน'}
              >
                <span className="text-xs font-semibold px-1 hidden sm:inline">
                  {isQuickMenuCollapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
                </span>
                {isQuickMenuCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-emerald-300 group-hover:text-white" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-emerald-300 group-hover:text-white" />
                )}
              </button>
            </div>
            
            {/* Collapsed Items Container */}
            {!isQuickMenuCollapsed && (
              <div className="space-y-3 text-xs mt-4 pt-3 border-t border-white/10 animate-in fade-in duration-200">
                {isAdminView ? (
                  <>
                    <button
                      onClick={() => onNavigate('payroll')}
                      className="w-full flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-left border border-white/10 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">คำนวณเงินเดือน & ออกสลิป</div>
                          <div className="text-[11px] text-slate-300">จัดการข้อมูลฐานเงินเดือน OT และภาษี</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </button>

                    <button
                      onClick={() => onNavigate('reports')}
                      className="w-full flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-left border border-white/10 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">ส่งออกรายงานเงินเดือน Excel</div>
                          <div className="text-[11px] text-slate-300">ดาวน์โหลดรายงาน `.xlsx` ภาษาไทยสดทันที</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigate('checkin')}
                      className="w-full flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-left border border-white/10 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">ลงเวลาเข้างาน / เลิกงาน</div>
                          <div className="text-[11px] text-slate-300">บันทึกเวลาพร้อมพิกัด GPS เรียลไทม์</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </button>

                    <button
                      onClick={() => onNavigate('leaves')}
                      className="w-full flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-left border border-white/10 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">ยื่นคำขอลางาน & เช็คโควต้า</div>
                          <div className="text-[11px] text-slate-300">ลาป่วย ลากิจ ลาพักร้อน พร้อมแนบใบรับรอง</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </button>

                    <button
                      onClick={() => onNavigate('payroll')}
                      className="w-full flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-left border border-white/10 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">ดูสลิปเงินเดือนของฉัน</div>
                          <div className="text-[11px] text-slate-300">ตรวจสอบรายละเอียดรายรับ รายหัก และภาษี</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-emerald-300/80 flex items-center justify-between">
            <span>สถานะระบบ: พร้อมใช้งาน</span>
            <span className="font-mono">v2.4.0 Thai HR Cloud</span>
          </div>
        </div>

      </div>

    </div>
  );
};
