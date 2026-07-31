import React from 'react';
import { Employee, AttendanceRecord, PayrollRecord, LeaveRequest } from '../types';
import {
  exportPayrollToExcel,
  exportAttendanceToExcel,
  exportLeavesToExcel,
  formatTHB
} from '../utils/payroll';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Users,
  Clock,
  Banknote,
  TrendingUp,
  PieChart,
  Calendar
} from 'lucide-react';

interface ReportsViewProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  payrollRecords: PayrollRecord[];
  leaveRequests: LeaveRequest[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  employees,
  attendanceRecords,
  payrollRecords,
  leaveRequests
}) => {
  const totalEmployees = employees.length;
  const totalPayroll = payrollRecords.reduce((acc, curr) => acc + curr.netPay, 0);
  const totalOTHours = payrollRecords.reduce((acc, curr) => acc + curr.ot1_5Hours + curr.ot2_0Hours, 0);
  const totalOTCost = payrollRecords.reduce((acc, curr) => acc + curr.ot1_5Pay + curr.ot2_0Pay, 0);

  // Department payroll breakdown
  const deptBreakdown: Record<string, number> = {};
  payrollRecords.forEach((r) => {
    deptBreakdown[r.department] = (deptBreakdown[r.department] || 0) + r.netPay;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            รายงานและการวิเคราะห์ข้อมูล HR (Reports & Analytics)
          </h2>
          <p className="text-xs text-slate-500">
            ระบบแสดงสถิติการมาทำงาน ค่าใช้จ่ายเงินเดือน สรุปวันลา พร้อมส่งออกไฟล์ Excel (.xlsx) สดทันที
          </p>
        </div>
      </div>

      {/* Direct Excel Export Hub */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
          <div>
            <h3 className="font-extrabold text-base">ศูนย์ส่งออกรายงาน Excel (Excel Export Hub)</h3>
            <p className="text-xs text-slate-300">คลิกเพื่อดาวน์โหลดไฟล์รายงาน `.xlsx` ภาษาไทยพร้อมสูตรมาตรฐาน</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          {/* Export Payroll */}
          <button
            onClick={() => exportPayrollToExcel(payrollRecords, '2026-07')}
            className="p-4 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition text-left flex items-start justify-between group"
          >
            <div>
              <span className="font-bold text-sm text-emerald-300 block">1. รายงานสรุปเงินเดือน & สลิป</span>
              <span className="text-[11px] text-slate-300">ฐานเงินเดือน, OT, ภาษี, ประกันสังคม 5%</span>
            </div>
            <Download className="w-5 h-5 text-emerald-400 group-hover:translate-y-0.5 transition" />
          </button>

          {/* Export Attendance */}
          <button
            onClick={() => exportAttendanceToExcel(attendanceRecords, 'July_2026')}
            className="p-4 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition text-left flex items-start justify-between group"
          >
            <div>
              <span className="font-bold text-sm text-emerald-300 block">2. รายงานการเวลาทำงาน & GPS</span>
              <span className="text-[11px] text-slate-300">เวลาเข้า-ออก, สถานที่, นาทีสาย, OT</span>
            </div>
            <Download className="w-5 h-5 text-emerald-400 group-hover:translate-y-0.5 transition" />
          </button>

          {/* Export Leaves */}
          <button
            onClick={() => exportLeavesToExcel(leaveRequests)}
            className="p-4 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition text-left flex items-start justify-between group"
          >
            <div>
              <span className="font-bold text-sm text-emerald-300 block">3. รายงานสรุปสิทธิ์และการลา</span>
              <span className="text-[11px] text-slate-300">วันลาคงเหลือ, ลาป่วย, ลาพักร้อน, ผู้อนุมัติ</span>
            </div>
            <Download className="w-5 h-5 text-emerald-400 group-hover:translate-y-0.5 transition" />
          </button>

        </div>
      </div>

      {/* Analytics Summary Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Payroll Distribution Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600" />
              สัดส่วนค่าใช้จ่ายเงินเดือนแบ่งตามฝ่าย
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              รวม {formatTHB(totalPayroll)}
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(deptBreakdown).map(([dept, amount]) => {
              const pct = Math.round((amount / totalPayroll) * 100);
              return (
                <div key={dept} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{dept}</span>
                    <span className="font-mono">{formatTHB(amount)} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OT & Attendance Metrics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            สรุปชั่วโมงการทำงานล่วงเวลา (OT Analysis)
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-medium">ชั่วโมง OT รวมทั้งบริษัท</span>
              <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                {totalOTHours} ชม.
              </span>
              <span className="text-[11px] text-slate-400">คำนวณจากอัตรา 1.5x และ 2.0x</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-medium">มูลค่าจ่ายค่า OT รวม</span>
              <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">
                {formatTHB(totalOTCost)}
              </span>
              <span className="text-[11px] text-slate-400">เฉลี่ย 1,350 บาท/คน</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
            💡 ระบบสรุปรายงานนี้ใช้สำหรับการยื่นแบบแสดงรายการภาษีประจำเดือน (ภ.ง.ด.1) และนำส่งเงินสมทบประกันสังคม (สปส. 1-10) ได้โดยตรง
          </div>
        </div>

      </div>

    </div>
  );
};
