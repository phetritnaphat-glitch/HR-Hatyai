import * as XLSX from 'xlsx';
import { Employee, AttendanceRecord, PayrollRecord, LeaveRequest } from '../types';

/**
 * Calculates Thai Social Security deduction (5% of base salary, capped at 750 THB/month)
 */
export function calculateSocialSecurity(baseSalary: number): number {
  const cappedBase = Math.min(Math.max(baseSalary, 1650), 15000);
  return Math.round(cappedBase * 0.05);
}

/**
 * Estimates Thai Personal Income Tax withholding per month
 */
export function calculateTaxWithholding(baseSalary: number, allowances: number): number {
  const annualIncome = (baseSalary + allowances) * 12;
  // Standard deduction + personal allowance ~ 100,000 + 60,000
  const taxableIncome = Math.max(0, annualIncome - 160000);
  
  let annualTax = 0;
  if (taxableIncome > 500000) {
    annualTax = (taxableIncome - 500000) * 0.15 + 22500 + 7500;
  } else if (taxableIncome > 300000) {
    annualTax = (taxableIncome - 300000) * 0.10 + 7500;
  } else if (taxableIncome > 150000) {
    annualTax = (taxableIncome - 150000) * 0.05;
  } else {
    annualTax = 0;
  }

  return Math.round(annualTax / 12);
}

/**
 * Calculate hourly rate based on 30 days / 8 hours per day standard
 */
export function getHourlyRate(baseSalary: number): number {
  return baseSalary / (30 * 8);
}

/**
 * Calculate full payroll record for an employee
 */
export function generateEmployeePayroll(
  employee: Employee,
  period: string,
  ot1_5Hours: number = 0,
  ot2_0Hours: number = 0,
  allowances: number = 2000,
  bonus: number = 0,
  lateMinutes: number = 0,
  providentFundRate: number = 0.03
): PayrollRecord {
  const hourlyRate = getHourlyRate(employee.baseSalary);
  const ot1_5Pay = Math.round(ot1_5Hours * hourlyRate * 1.5);
  const ot2_0Pay = Math.round(ot2_0Hours * hourlyRate * 2.0);
  
  // Late deduction formula: Math.floor(lateMinutes / 15) * 100 THB or per minute
  const lateDeduction = Math.round((lateMinutes / 60) * hourlyRate);
  
  const grossEarnings = employee.baseSalary + ot1_5Pay + ot2_0Pay + allowances + bonus;
  const socialSecurityDeduction = calculateSocialSecurity(employee.baseSalary);
  const taxDeduction = calculateTaxWithholding(employee.baseSalary, allowances);
  const providentFundDeduction = Math.round(employee.baseSalary * providentFundRate);
  
  const totalDeductions = socialSecurityDeduction + taxDeduction + lateDeduction + providentFundDeduction;
  const netPay = Math.max(0, grossEarnings - totalDeductions);

  return {
    id: `PAY-${employee.id}-${period}`,
    employeeId: employee.id,
    employeeName: employee.name,
    department: employee.department,
    position: employee.position,
    period,
    baseSalary: employee.baseSalary,
    ot1_5Hours,
    ot1_5Pay,
    ot2_0Hours,
    ot2_0Pay,
    allowances,
    bonus,
    grossEarnings,
    socialSecurityDeduction,
    taxDeduction,
    lateDeduction,
    providentFundDeduction,
    otherDeductions: 0,
    netPay,
    status: 'approved',
    paidDate: new Date().toISOString().split('T')[0]
  };
}

/**
 * Converts a number into Thai Baht text format
 * e.g., 25500 -> "สองหมื่นห้าพันห้าร้อยบาทถ้วน"
 */
export function convertToThaiBahtText(amount: number): string {
  if (amount === 0) return 'ศูนย์บาทถ้วน';

  const numbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const split = amount.toFixed(2).split('.');
  const baht = split[0];
  const satang = split[1];

  let result = '';

  const bahtLen = baht.length;
  for (let i = 0; i < bahtLen; i++) {
    const digit = parseInt(baht.charAt(i), 10);
    const pos = (bahtLen - i - 1) % 6;

    if (digit !== 0) {
      if (pos === 1 && digit === 1) {
        result += '';
      } else if (pos === 1 && digit === 2) {
        result += 'ยี่';
      } else if (pos === 0 && digit === 1 && bahtLen > 1 && baht.charAt(i - 1) !== '0') {
        result += 'เอ็ด';
      } else {
        result += numbers[digit];
      }
      result += positions[pos];
    } else {
      if (pos === 0 && bahtLen >= 7 && i === bahtLen - 7) {
        result += 'ล้าน';
      }
    }
  }

  result += 'บาท';

  if (satang === '00') {
    result += 'ถ้วน';
  } else {
    const satangNum = parseInt(satang, 10);
    const tens = Math.floor(satangNum / 10);
    const units = satangNum % 10;

    if (tens === 1) result += 'สิบ';
    else if (tens === 2) result += 'ยี่สิบ';
    else if (tens > 2) result += numbers[tens] + 'สิบ';

    if (units === 1 && tens > 0) result += 'เอ็ด';
    else if (units > 0) result += numbers[units];

    result += 'สตางค์';
  }

  return result;
}

/**
 * Format currency to Thai Baht e.g., ฿25,000.00
 */
export function formatTHB(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Excel Export Utilities using XLSX library
 */
export function exportPayrollToExcel(records: PayrollRecord[], period: string) {
  const data = records.map((r, index) => ({
    'ลำดับ': index + 1,
    'รหัสพนักงาน': r.employeeId,
    'ชื่อ-นามสกุล': r.employeeName,
    'แผนก': r.department,
    'ตำแหน่ง': r.position,
    'เงินเดือนฐาน (บาท)': r.baseSalary,
    'ชั่วโมง OT (1.5x)': r.ot1_5Hours,
    'ค่า OT 1.5x (บาท)': r.ot1_5Pay,
    'ชั่วโมง OT (2.0x)': r.ot2_0Hours,
    'ค่า OT 2.0x (บาท)': r.ot2_0Pay,
    'เบี้ยเลี้ยง/สวัสดิการ': r.allowances,
    'โบนัส': r.bonus,
    'รายได้รวม': r.grossEarnings,
    'หัก ประกันสังคม': r.socialSecurityDeduction,
    'หัก ภาษี ณ ที่จ่าย': r.taxDeduction,
    'หัก มาสาย': r.lateDeduction,
    'หัก กองทุนสำรองฯ': r.providentFundDeduction,
    'รายจ่ายสุทธิ (บาท)': r.netPay,
    'สถานะ': r.status === 'approved' ? 'อนุมัติแล้ว' : 'ฉบับร่าง'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Payroll_${period}`);
  XLSX.writeFile(workbook, `HR_Payroll_Report_${period}.xlsx`);
}

export function exportAttendanceToExcel(records: AttendanceRecord[], monthName: string = 'Current_Month') {
  const data = records.map((a, index) => ({
    'ลำดับ': index + 1,
    'รหัสพนักงาน': a.employeeId,
    'ชื่อ-นามสกุล': a.employeeName,
    'แผนก': a.department,
    'วันที่': a.date,
    'เวลาเข้างาน': a.checkInTime || '-',
    'เวลาออกงาน': a.checkOutTime || '-',
    'สถานะ': a.status === 'present' ? 'ปกติ' : a.status === 'late' ? 'มาสาย' : a.status === 'leave' ? 'ลางาน' : 'ขาดงาน',
    'ช่องทางเช็คอิน': a.checkInMethod,
    'สถานที่ / GPS': a.locationName || 'สำนักงานใหญ่',
    'มาสาย (นาที)': a.lateMinutes,
    'จำนวน OT (ชม.)': a.otHours,
    'หมายเหตุ': a.note || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance_Report');
  XLSX.writeFile(workbook, `HR_Attendance_Report_${monthName}.xlsx`);
}

export function exportLeavesToExcel(records: LeaveRequest[]) {
  const leaveTypeName = {
    annual: 'ลาพักร้อน',
    sick: 'ลาป่วย',
    personal: 'ลากิจ',
    maternity: 'ลาคลอด',
    unpaid: 'ลาไม่รับค่าจ้าง'
  };

  const statusName = {
    pending: 'รออนุมัติ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธ'
  };

  const data = records.map((l, index) => ({
    'ลำดับ': index + 1,
    'รหัสพนักงาน': l.employeeId,
    'ชื่อ-นามสกุล': l.employeeName,
    'แผนก': l.department,
    'ประเภทการลา': leaveTypeName[l.leaveType],
    'วันที่เริ่ม': l.startDate,
    'วันที่สิ้นสุด': l.endDate,
    'จำนวนวัน': l.daysCount,
    'เหตุผลการลา': l.reason,
    'สถานะ': statusName[l.status],
    'ผู้อนุมัติ': l.approvedBy || '-',
    'วันที่ขอ': l.requestedAt
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave_Report');
  XLSX.writeFile(workbook, `HR_Leave_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}
