import React, { useState } from 'react';
import { Employee, PayrollRecord } from '../types';
import { formatTHB, exportPayrollToExcel } from '../utils/payroll';
import { PayslipModal } from './PayslipModal';
import {
  Banknote,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  Edit2,
  Search,
  Filter,
  TrendingUp,
  ShieldCheck,
  Building
} from 'lucide-react';

interface PayrollViewProps {
  currentEmployee?: Employee;
  employees: Employee[];
  payrollRecords: PayrollRecord[];
  onUpdatePayroll: (records: PayrollRecord[]) => void;
  isAdminView: boolean;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  currentEmployee,
  employees,
  payrollRecords,
  onUpdatePayroll,
  isAdminView
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('2026-07');
  const [selectedPayslip, setSelectedPayslip] = useState<{
    payroll: PayrollRecord;
    employee: Employee;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Edit OT Modal state
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [editOt1_5, setEditOt1_5] = useState(0);
  const [editOt2_0, setEditOt2_0] = useState(0);
  const [editAllowances, setEditAllowances] = useState(0);
  const [editBonus, setEditBonus] = useState(0);

  const visibleRecords = isAdminView
    ? payrollRecords
    : payrollRecords.filter(
        (rec) =>
          rec.employeeId === currentEmployee?.id ||
          rec.employeeName === currentEmployee?.name
      );

  const filteredRecords = visibleRecords.filter((rec) => {
    const matchesSearch =
      rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || rec.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const totalGross = filteredRecords.reduce((acc, curr) => acc + curr.grossEarnings, 0);
  const totalDeductions = filteredRecords.reduce(
    (acc, curr) =>
      acc +
      curr.socialSecurityDeduction +
      curr.taxDeduction +
      curr.providentFundDeduction +
      curr.lateDeduction,
    0
  );
  const totalNet = filteredRecords.reduce((acc, curr) => acc + curr.netPay, 0);

  const handleOpenEdit = (rec: PayrollRecord) => {
    setEditingRecord(rec);
    setEditOt1_5(rec.ot1_5Hours);
    setEditOt2_0(rec.ot2_0Hours);
    setEditAllowances(rec.allowances);
    setEditBonus(rec.bonus);
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;
    const emp = employees.find((e) => e.id === editingRecord.employeeId);
    if (!emp) return;

    const hourlyRate = emp.baseSalary / (30 * 8);
    const ot1_5Pay = Math.round(editOt1_5 * hourlyRate * 1.5);
    const ot2_0Pay = Math.round(editOt2_0 * hourlyRate * 2.0);
    const grossEarnings = emp.baseSalary + ot1_5Pay + ot2_0Pay + editAllowances + editBonus;

    const netPay = Math.max(
      0,
      grossEarnings -
        (editingRecord.socialSecurityDeduction +
          editingRecord.taxDeduction +
          editingRecord.providentFundDeduction +
          editingRecord.lateDeduction)
    );

    const updated = payrollRecords.map((r) =>
      r.id === editingRecord.id
        ? {
            ...r,
            ot1_5Hours: editOt1_5,
            ot1_5Pay,
            ot2_0Hours: editOt2_0,
            ot2_0Pay,
            allowances: editAllowances,
            bonus: editBonus,
            grossEarnings,
            netPay
          }
        : r
    );

    onUpdatePayroll(updated);
    setEditingRecord(null);
  };

  const handleBatchApprove = () => {
    const updated = payrollRecords.map((r) => ({ ...r, status: 'approved' as const }));
    onUpdatePayroll(updated);
    alert('อนุมัติการจ่ายเงินเดือนประจำงวดเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title & Summary Topbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            คำนวณเงินเดือน & ออกสลิป (Thai Payroll System)
          </h2>
          <p className="text-xs text-slate-500">
            คำนวณภาษีหัก ณ ที่จ่าย, ประกันสังคม 5% (สูงสุด 750 บาท), ค่า OT และเบี้ยเลี้ยงอัตโนมัติ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:outline-hidden"
          >
            <option value="2026-07">งวดเงินเดือน: กรกฎาคม 2026</option>
            <option value="2026-06">งวดเงินเดือน: มิถุนายม 2026</option>
            <option value="2026-05">งวดเงินเดือน: พฤษภาคม 2026</option>
          </select>

          <button
            onClick={() => exportPayrollToExcel(filteredRecords, selectedPeriod)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            ส่งออก Excel
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">
            {isAdminView ? 'รวมเงินได้รวมทั้งบริษัท (Gross Earnings)' : 'รวมเงินได้ของคุณ (Gross Earnings)'}
          </span>
          <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900">{formatTHB(totalGross)}</div>
          <p className="text-[11px] text-slate-400 mt-1">รวมเงินเดือนฐาน + OT + เบี้ยเลี้ยง</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">
            {isAdminView ? 'รวมรายการหักทั้งบริษัท (Deductions)' : 'รวมรายการหักของคุณ (Deductions)'}
          </span>
          <div className="mt-2 text-2xl font-extrabold font-mono text-rose-600">{formatTHB(totalDeductions)}</div>
          <p className="text-[11px] text-slate-400 mt-1">ประกันสังคม + ภาษี + กองทุนเลี้ยงชีพ</p>
        </div>

        <div className="bg-emerald-900 text-white p-5 rounded-2xl border border-emerald-800 shadow-md">
          <span className="text-xs font-semibold text-emerald-300">
            {isAdminView ? 'ยอดจ่ายสุทธิทั้งบริษัท (Net Payroll)' : 'ยอดเงินเดือนสุทธิของคุณ (Net Pay)'}
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
            {formatTHB(totalNet)}
          </div>
          <p className="text-[11px] text-emerald-200 mt-1">
            {isAdminView ? 'โอนเข้าบัญชีธนาคารพนักงานทั้งหมด' : 'โอนเข้าบัญชีธนาคารของคุณ'}
          </p>
        </div>
      </div>

      {/* Main Payroll Table Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">รายการคำนวณเงินเดือนพนักงานประจำงวด</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อพนักงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {isAdminView && (
              <button
                onClick={handleBatchApprove}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                อนุมัติจ่ายเงินเดือนทั้งตาราง
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">ชื่อ-นามสกุล / ตำแหน่ง</th>
                <th className="py-3.5 px-4">เงินเดือนฐาน</th>
                <th className="py-3.5 px-4">OT (1.5x / 2x)</th>
                <th className="py-3.5 px-4">เบี้ยเลี้ยง / โบนัส</th>
                <th className="py-3.5 px-4">ประกันสังคม (5%)</th>
                <th className="py-3.5 px-4">ภาษีหัก ณ ที่จ่าย</th>
                <th className="py-3.5 px-4">เงินสุทธิ (Net Pay)</th>
                <th className="py-3.5 px-4 text-center">สลิป / จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => {
                const emp = employees.find((e) => e.id === r.employeeId);
                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.employeeName}</div>
                      <div className="text-slate-500 text-xs">{r.department} • {r.position}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatTHB(r.baseSalary)}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-slate-900 font-semibold">{formatTHB(r.ot1_5Pay + r.ot2_0Pay)}</div>
                      <div className="text-[11px] text-slate-400">
                        ({r.ot1_5Hours + r.ot2_0Hours} ชม.)
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {formatTHB(r.allowances + r.bonus)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-rose-600 font-medium">
                      -{formatTHB(r.socialSecurityDeduction)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-rose-600 font-medium">
                      -{formatTHB(r.taxDeduction)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-700 text-base">
                      {formatTHB(r.netPay)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => emp && setSelectedPayslip({ payroll: r, employee: emp })}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg transition inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          ออกสลิป
                        </button>
                        {isAdminView && (
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="แก้ไขค่า OT / เบี้ยเลี้ยง"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Edit OT & Allowance Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              ปรับปรุงค่า OT และเบี้ยเลี้ยง: {editingRecord.employeeName}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">จำนวนชั่วโมง OT 1.5x:</label>
                <input
                  type="number"
                  value={editOt1_5}
                  onChange={(e) => setEditOt1_5(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">จำนวนชั่วโมง OT 2.0x:</label>
                <input
                  type="number"
                  value={editOt2_0}
                  onChange={(e) => setEditOt2_0(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เบี้ยเลี้ยง / ค่าเดินทาง (บาท):</label>
                <input
                  type="number"
                  value={editAllowances}
                  onChange={(e) => setEditAllowances(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">โบนัสประจำงวด (บาท):</label>
                <input
                  type="number"
                  value={editBonus}
                  onChange={(e) => setEditBonus(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                บันทึกการปรับปรุง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Payslip Modal when selected */}
      {selectedPayslip && (
        <PayslipModal
          payroll={selectedPayslip.payroll}
          employee={selectedPayslip.employee}
          onClose={() => setSelectedPayslip(null)}
        />
      )}

    </div>
  );
};
