import React from 'react';
import { PayrollRecord, Employee } from '../types';
import { formatTHB, convertToThaiBahtText } from '../utils/payroll';
import { Printer, Download, Mail, CheckCircle2, Building2, X } from 'lucide-react';

interface PayslipModalProps {
  payroll: PayrollRecord;
  employee: Employee;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payroll, employee, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const [emailSent, setEmailSent] = React.useState(false);

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const totalEarnings = payroll.grossEarnings;
  const totalDeductions =
    payroll.socialSecurityDeduction +
    payroll.taxDeduction +
    payroll.lateDeduction +
    payroll.providentFundDeduction +
    payroll.otherDeductions;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm sm:text-base">ใบแจ้งเงินเดือน / Payslip Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-lg transition"
            >
              <Mail className="w-4 h-4 text-sky-400" />
              {emailSent ? 'ส่งสำเร็จ!' : 'ส่งเข้าอีเมล'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 me-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-lg transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              พิมพ์สลิป / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-8 print:p-0 font-sans text-slate-800" id="printable-payslip">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">บริษัท เอชอาร์ ดิจิทัล โซลูชั่นส์ จำกัด</h2>
              <p className="text-xs text-slate-500 mt-0.5">HR Digital Solutions Co., Ltd.</p>
              <p className="text-xs text-slate-500">เลขประจำตัวผู้เสียภาษี: 0105566012345</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-md mb-1">
                ใบแจ้งเงินเดือน (PAYSLIP)
              </span>
              <p className="text-xs font-medium text-slate-600">ประจำเดือน: {payroll.period}</p>
              <p className="text-xs text-slate-500">วันที่จ่ายเงิน: {payroll.paidDate || '27/07/2026'}</p>
            </div>
          </div>

          {/* Employee Details Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 text-xs sm:text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <div>
              <span className="text-slate-500">รหัสพนักงาน:</span>{' '}
              <span className="font-semibold text-slate-900">{employee.code}</span>
            </div>
            <div>
              <span className="text-slate-500">ชื่อ-นามสกุล:</span>{' '}
              <span className="font-semibold text-slate-900">{employee.name}</span>
            </div>
            <div>
              <span className="text-slate-500">ตำแหน่ง:</span>{' '}
              <span className="font-medium text-slate-800">{employee.position}</span>
            </div>
            <div>
              <span className="text-slate-500">แผนก:</span>{' '}
              <span className="font-medium text-slate-800">{employee.department}</span>
            </div>
            <div>
              <span className="text-slate-500">เลขบัญชีธนาคาร:</span>{' '}
              <span className="font-mono text-slate-800">{employee.bankName} ({employee.bankAccount})</span>
            </div>
            <div>
              <span className="text-slate-500">ประกันสังคม ID:</span>{' '}
              <span className="font-mono text-slate-800">{employee.socialSecurityId}</span>
            </div>
          </div>

          {/* Earnings & Deductions Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Earnings Column */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex justify-between">
                <span>รายได้ (Earnings)</span>
                <span>จำนวนเงิน (บาท)</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs sm:text-sm p-2">
                <div className="py-2 px-2 flex justify-between">
                  <span className="text-slate-700">เงินเดือนประจำ (Base Salary)</span>
                  <span className="font-mono text-slate-900">{formatTHB(payroll.baseSalary)}</span>
                </div>
                {payroll.ot1_5Pay > 0 && (
                  <div className="py-2 px-2 flex justify-between">
                    <span className="text-slate-700">ค่าล่วงเวลา OT 1.5x ({payroll.ot1_5Hours} ชม.)</span>
                    <span className="font-mono text-slate-900">{formatTHB(payroll.ot1_5Pay)}</span>
                  </div>
                )}
                {payroll.ot2_0Pay > 0 && (
                  <div className="py-2 px-2 flex justify-between">
                    <span className="text-slate-700">ค่าล่วงเวลา OT 2.0x ({payroll.ot2_0Hours} ชม.)</span>
                    <span className="font-mono text-slate-900">{formatTHB(payroll.ot2_0Pay)}</span>
                  </div>
                )}
                {payroll.allowances > 0 && (
                  <div className="py-2 px-2 flex justify-between">
                    <span className="text-slate-700">เบี้ยเลี้ยง / ค่าเดินทาง</span>
                    <span className="font-mono text-slate-900">{formatTHB(payroll.allowances)}</span>
                  </div>
                )}
                {payroll.bonus > 0 && (
                  <div className="py-2 px-2 flex justify-between">
                    <span className="text-slate-700">โบนัสประจำงวด</span>
                    <span className="font-mono text-slate-900">{formatTHB(payroll.bonus)}</span>
                  </div>
                )}
              </div>
              <div className="bg-emerald-50/70 border-t border-emerald-100 px-4 py-2.5 flex justify-between font-bold text-xs sm:text-sm text-emerald-900">
                <span>รวมรายได้ทั้งหมด</span>
                <span className="font-mono">{formatTHB(totalEarnings)}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-rose-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex justify-between">
                <span>รายการหัก (Deductions)</span>
                <span>จำนวนเงิน (บาท)</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs sm:text-sm p-2">
                <div className="py-2 px-2 flex justify-between">
                  <span className="text-slate-700">ประกันสังคม (Social Security 5%)</span>
                  <span className="font-mono text-rose-600">{formatTHB(payroll.socialSecurityDeduction)}</span>
                </div>
                <div className="py-2 px-2 flex justify-between">
                  <span className="text-slate-700">ภาษี ณ ที่จ่าย (Withholding Tax)</span>
                  <span className="font-mono text-rose-600">{formatTHB(payroll.taxDeduction)}</span>
                </div>
                {payroll.providentFundDeduction > 0 && (
                  <div className="py-2 px-2 flex justify-between">
                    <span className="text-slate-700">กองทุนสำรองเลี้ยงชีพ (Provident Fund)</span>
                    <span className="font-mono text-rose-600">{formatTHB(payroll.providentFundDeduction)}</span>
                  </div>
                )}
                {payroll.lateDeduction > 0 && (
                  <div className="py-2 px-2 flex justify-between">
                    <span className="text-slate-700">หักเข้างานสาย / ลาเกิน</span>
                    <span className="font-mono text-rose-600">{formatTHB(payroll.lateDeduction)}</span>
                  </div>
                )}
              </div>
              <div className="bg-rose-50/70 border-t border-rose-100 px-4 py-2.5 flex justify-between font-bold text-xs sm:text-sm text-rose-900">
                <span>รวมรายการหักทั้งหมด</span>
                <span className="font-mono">{formatTHB(totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">เงินเดือนสุทธิ (NET PAY)</span>
              <span className="text-sm font-medium text-emerald-400 italic mt-0.5 block">
                ({convertToThaiBahtText(payroll.netPay)})
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
              {formatTHB(payroll.netPay)}
            </div>
          </div>

          {/* Footnote / Signatures */}
          <div className="pt-4 border-t border-dashed border-slate-300 flex flex-col sm:flex-row justify-between text-xs text-slate-500 gap-4">
            <div>
              <p>* เอกสารฉบับนี้ออกด้วยระบบบริหารงานบุคคลอัตโนมัติ HR Online</p>
              <p>* หากมีข้อสงสัยโปรดติดต่อฝ่ายทรัพยากรบุคคล (HR) ภายใน 7 วัน</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-4 h-4" /> ตรวจสอบความถูกต้องและอนุมัติแล้ว
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
