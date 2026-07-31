export type Department = 'ฝ่ายไอที (IT)' | 'ฝ่ายการตลาด (Marketing)' | 'ฝ่ายขาย (Sales)' | 'ฝ่ายบุคคล (HR)' | 'ฝ่ายบัญชี (Accounting)' | 'ฝ่ายปฏิบัติการ (Operations)';

export type WorkMode = 'On-site' | 'Hybrid' | 'Remote';

export interface Employee {
  id: string;
  code: string; // e.g. EMP-001
  name: string;
  nameEn?: string;
  avatar: string;
  department: Department;
  position: string;
  email: string;
  phone: string;
  baseSalary: number;
  bankAccount: string;
  bankName: string;
  taxId: string;
  socialSecurityId: string;
  workMode: WorkMode;
  startDate: string;
  leaveBalance: {
    annual: { total: number; used: number };
    sick: { total: number; used: number };
    personal: { total: number; used: number };
  };
}

export type AttendanceStatus = 'present' | 'late' | 'leave' | 'absent' | 'early_leave';
export type CheckInMethod = 'GPS' | 'FaceScan' | 'MobileApp' | 'Manual';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  date: string; // YYYY-MM-DD
  checkInTime: string | null; // e.g. "08:25"
  checkOutTime: string | null; // e.g. "17:35"
  status: AttendanceStatus;
  checkInMethod: CheckInMethod;
  locationName?: string;
  coords?: { lat: number; lng: number };
  photoUrl?: string;
  otHours: number;
  lateMinutes: number;
  note?: string;
}

export type LeaveType = 'personal' | 'sick' | 'annual' | 'maternity' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  attachmentUrl?: string;
  status: LeaveStatus;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectReason?: string;
  remark?: string; // หมายเหตุเพิ่มเติม / หมายเหตุจาก HR
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  position: string;
  period: string; // e.g. "2026-07"
  baseSalary: number;
  ot1_5Hours: number;
  ot1_5Pay: number;
  ot2_0Hours: number;
  ot2_0Pay: number;
  allowances: number; // เบี้ยขยัน / ค่าอาหาร / ค่าเดินทาง
  bonus: number;
  grossEarnings: number;
  socialSecurityDeduction: number; // 5% max 750
  taxDeduction: number;
  lateDeduction: number;
  providentFundDeduction: number;
  otherDeductions: number;
  netPay: number;
  status: 'draft' | 'approved' | 'paid';
  paidDate?: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  shiftType: 'morning' | 'normal' | 'evening' | 'night' | 'off';
  shiftName: string;
  startTime: string;
  endTime: string;
}

export type UserRole = 'hr' | 'employee';

export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  employeeId: string;
  displayName: string;
  department: Department;
}

export interface WorkplaceLocation {
  id: string;
  name: string;
  address: string;
  coords: { lat: number; lng: number };
  allowedRadiusMeters: number;
  isActive: boolean;
  isDefault?: boolean;
  wifiBssid?: string;
}

