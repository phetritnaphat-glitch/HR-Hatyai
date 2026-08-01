import { Employee, AttendanceRecord, LeaveRequest, PayrollRecord, Shift, UserAccount } from '../types';

export const MOCK_USERS: UserAccount[] = [
  {
    id: 'USR-HR-1',
    username: 'hr',
    passwordHash: '123',
    role: 'hr',
    employeeId: 'EMP-004',
    displayName: 'พิมพา รัตนดิลก (ผู้ดูแล HR)',
    department: 'ฝ่ายบุคคล (HR)'
  },
  {
    id: 'USR-HR-2',
    username: 'admin',
    passwordHash: '123',
    role: 'hr',
    employeeId: 'EMP-001',
    displayName: 'สมชาย ประเสริฐสุข (HR & IT Admin)',
    department: 'ฝ่ายไอที (IT)'
  },
  {
    id: 'USR-EMP-1',
    username: 'emp001',
    passwordHash: '123',
    role: 'employee',
    employeeId: 'EMP-001',
    displayName: 'สมชาย ประเสริฐสุข (พนักงาน)',
    department: 'ฝ่ายไอที (IT)'
  },
  {
    id: 'USR-EMP-2',
    username: 'emp002',
    passwordHash: '123',
    role: 'employee',
    employeeId: 'EMP-002',
    displayName: 'อนันยา วงศ์สว่าง (พนักงาน)',
    department: 'ฝ่ายการตลาด (Marketing)'
  },
  {
    id: 'USR-EMP-3',
    username: 'emp003',
    passwordHash: '123',
    role: 'employee',
    employeeId: 'EMP-003',
    displayName: 'กิตติ สุขสวัสดิ์ (พนักงาน)',
    department: 'ฝ่ายขาย (Sales)'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    code: 'EMP-001',
    name: 'สมชาย ประเสริฐสุข',
    nameEn: 'Somchai Prasertsuk',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'ฝ่ายไอที (IT)',
    position: 'Senior Full-Stack Developer',
    email: 'somchai.p@company.co.th',
    phone: '081-234-5678',
    baseSalary: 65000,
    bankAccount: '123-4-56789-0',
    bankName: 'ธนาคารกสิกรไทย (KBank)',
    taxId: '1-1002-34567-89-1',
    socialSecurityId: '1100234567891',
    workMode: 'Hybrid',
    startDate: '2022-03-15',
    leaveBalance: {
      annual: { total: 10, used: 3 },
      sick: { total: 30, used: 2 },
      personal: { total: 6, used: 1 },
    }
  },
  {
    id: 'EMP-002',
    code: 'EMP-002',
    name: 'อนันยา วงศ์สว่าง',
    nameEn: 'Ananya Wongswang',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'ฝ่ายการตลาด (Marketing)',
    position: 'Marketing Manager',
    email: 'ananya.w@company.co.th',
    phone: '089-876-5432',
    baseSalary: 52000,
    bankAccount: '987-6-54321-0',
    bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
    taxId: '2-3456-78901-23-4',
    socialSecurityId: '2345678901234',
    workMode: 'On-site',
    startDate: '2021-08-01',
    leaveBalance: {
      annual: { total: 12, used: 5 },
      sick: { total: 30, used: 1 },
      personal: { total: 6, used: 2 },
    }
  },
  {
    id: 'EMP-003',
    code: 'EMP-003',
    name: 'กิตติ สุขสวัสดิ์',
    nameEn: 'Kitti Suksawat',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'ฝ่ายขาย (Sales)',
    position: 'Sales Executive Leader',
    email: 'kitti.s@company.co.th',
    phone: '086-555-1234',
    baseSalary: 45000,
    bankAccount: '456-7-89012-3',
    bankName: 'ธนาคารกรุงเทพ (BBL)',
    taxId: '3-4567-89012-34-5',
    socialSecurityId: '3456789012345',
    workMode: 'On-site',
    startDate: '2023-01-10',
    leaveBalance: {
      annual: { total: 10, used: 2 },
      sick: { total: 30, used: 0 },
      personal: { total: 6, used: 0 },
    }
  },
  {
    id: 'EMP-004',
    code: 'EMP-004',
    name: 'พิมพา รัตนดิลก',
    nameEn: 'Pimpa Rattanadilok',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'ฝ่ายบุคคล (HR)',
    position: 'HR Specialist',
    email: 'pimpa.r@company.co.th',
    phone: '082-111-9988',
    baseSalary: 38000,
    bankAccount: '333-2-11144-5',
    bankName: 'ธนาคารกรุงศรีอยุธยา (BAY)',
    taxId: '4-5678-90123-45-6',
    socialSecurityId: '4567890123456',
    workMode: 'On-site',
    startDate: '2023-06-01',
    leaveBalance: {
      annual: { total: 10, used: 1 },
      sick: { total: 30, used: 3 },
      personal: { total: 6, used: 1 },
    }
  },
  {
    id: 'EMP-005',
    code: 'EMP-005',
    name: 'ณัฐพล เมธากุล',
    nameEn: 'Nattapol Methakul',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'ฝ่ายปฏิบัติการ (Operations)',
    position: 'Operations Coordinator',
    email: 'nattapol.m@company.co.th',
    phone: '084-999-7766',
    baseSalary: 32000,
    bankAccount: '777-8-99001-2',
    bankName: 'ธนาคารกสิกรไทย (KBank)',
    taxId: '5-6789-01234-56-7',
    socialSecurityId: '5678901234567',
    workMode: 'Remote',
    startDate: '2024-02-15',
    leaveBalance: {
      annual: { total: 6, used: 0 },
      sick: { total: 30, used: 1 },
      personal: { total: 6, used: 0 },
    }
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ATT-101',
    employeeId: 'EMP-001',
    employeeName: 'สมชาย ประเสริฐสุข',
    department: 'ฝ่ายไอที (IT)',
    date: '2026-07-27',
    checkInTime: '08:24',
    checkOutTime: null,
    status: 'present',
    checkInMethod: 'GPS',
    locationName: 'อาคารสีลม คอมเพล็กซ์ (สำนักงานใหญ่)',
    coords: { lat: 13.728, lng: 100.535 },
    otHours: 1.5,
    lateMinutes: 0,
    note: 'ทำงานไฮบริด / ประชุมออนไลน์'
  },
  {
    id: 'ATT-102',
    employeeId: 'EMP-002',
    employeeName: 'อนันยา วงศ์สว่าง',
    department: 'ฝ่ายการตลาด (Marketing)',
    date: '2026-07-27',
    checkInTime: '08:52',
    checkOutTime: null,
    status: 'late',
    checkInMethod: 'FaceScan',
    locationName: 'สแกนหน้า ประตูทางเข้า A',
    otHours: 0,
    lateMinutes: 22,
    note: 'จราจรติดขัดแถวอโศก'
  },
  {
    id: 'ATT-103',
    employeeId: 'EMP-003',
    employeeName: 'กิตติ สุขสวัสดิ์',
    department: 'ฝ่ายขาย (Sales)',
    date: '2026-07-27',
    checkInTime: '08:15',
    checkOutTime: null,
    status: 'present',
    checkInMethod: 'MobileApp',
    locationName: 'พบลูกค้าโซนสยาม',
    coords: { lat: 13.745, lng: 100.530 },
    otHours: 2.0,
    lateMinutes: 0,
    note: 'ออกพบลูกค้านอกสถานที่'
  },
  {
    id: 'ATT-104',
    employeeId: 'EMP-004',
    employeeName: 'พิมพา รัตนดิลก',
    department: 'ฝ่ายบุคคล (HR)',
    date: '2026-07-27',
    checkInTime: '08:28',
    checkOutTime: null,
    status: 'present',
    checkInMethod: 'FaceScan',
    locationName: 'สแกนหน้า ประตูทางเข้า HR Floor 12',
    otHours: 0,
    lateMinutes: 0
  },
  {
    id: 'ATT-105',
    employeeId: 'EMP-005',
    employeeName: 'ณัฐพล เมธากุล',
    department: 'ฝ่ายปฏิบัติการ (Operations)',
    date: '2026-07-27',
    checkInTime: null,
    checkOutTime: null,
    status: 'leave',
    checkInMethod: 'Manual',
    locationName: 'ลาพักร้อน',
    otHours: 0,
    lateMinutes: 0,
    note: 'อนุมัติลาพักร้อน 1 วัน'
  },
  // Yesterday records for demonstration
  {
    id: 'ATT-090',
    employeeId: 'EMP-001',
    employeeName: 'สมชาย ประเสริฐสุข',
    department: 'ฝ่ายไอที (IT)',
    date: '2026-07-24',
    checkInTime: '08:20',
    checkOutTime: '18:45',
    status: 'present',
    checkInMethod: 'GPS',
    locationName: 'สำนักงานใหญ่ สีลม',
    otHours: 1.0,
    lateMinutes: 0
  },
  {
    id: 'ATT-091',
    employeeId: 'EMP-002',
    employeeName: 'อนันยา วงศ์สว่าง',
    department: 'ฝ่ายการตลาด (Marketing)',
    date: '2026-07-24',
    checkInTime: '08:25',
    checkOutTime: '17:35',
    status: 'present',
    checkInMethod: 'FaceScan',
    locationName: 'สแกนหน้า ประตู A',
    otHours: 0,
    lateMinutes: 0
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'LR-2026-001',
    employeeId: 'EMP-005',
    employeeName: 'ณัฐพล เมธากุล',
    department: 'ฝ่ายปฏิบัติการ (Operations)',
    leaveType: 'annual',
    startDate: '2026-07-27',
    endDate: '2026-07-27',
    daysCount: 1,
    reason: 'ทำธุระส่วนตัวต่างจังหวัด',
    status: 'approved',
    requestedAt: '2026-07-22 10:15',
    approvedBy: 'พิมพา รัตนดิลก (HR Specialist)',
    approvedAt: '2026-07-22 14:00'
  },
  {
    id: 'LR-2026-002',
    employeeId: 'EMP-002',
    employeeName: 'อนันยา วงศ์สว่าง',
    department: 'ฝ่ายการตลาด (Marketing)',
    leaveType: 'sick',
    startDate: '2026-07-30',
    endDate: '2026-07-31',
    daysCount: 2,
    reason: 'นัดตรวจสุขภาพประจำปีและพบแพทย์',
    attachmentUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300&auto=format&fit=crop&q=80',
    status: 'pending',
    requestedAt: '2026-07-26 16:45'
  },
  {
    id: 'LR-2026-003',
    employeeId: 'EMP-003',
    employeeName: 'กิตติ สุขสวัสดิ์',
    department: 'ฝ่ายขาย (Sales)',
    leaveType: 'personal',
    startDate: '2026-08-05',
    endDate: '2026-08-05',
    daysCount: 1,
    reason: 'ติดต่อหน่วยงานราชการทำใบขับขี่',
    status: 'pending',
    requestedAt: '2026-07-27 09:10'
  }
];

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'SH-01',
    employeeId: 'EMP-001',
    date: '2026-07-27',
    shiftType: 'normal',
    shiftName: 'กะปกติ (Hybrid)',
    startTime: '08:30',
    endTime: '17:30'
  },
  {
    id: 'SH-02',
    employeeId: 'EMP-002',
    date: '2026-07-27',
    shiftType: 'normal',
    shiftName: 'กะปกติ (On-site)',
    startTime: '08:30',
    endTime: '17:30'
  },
  {
    id: 'SH-03',
    employeeId: 'EMP-003',
    date: '2026-07-27',
    shiftType: 'morning',
    shiftName: 'กะเช้าพิเศษ (Sales Field)',
    startTime: '08:00',
    endTime: '17:00'
  },
  {
    id: 'SH-04',
    employeeId: 'EMP-004',
    date: '2026-07-27',
    shiftType: 'normal',
    shiftName: 'กะปกติ (HR Floor)',
    startTime: '08:30',
    endTime: '17:30'
  },
  {
    id: 'SH-05',
    employeeId: 'EMP-005',
    date: '2026-07-27',
    shiftType: 'off',
    shiftName: 'วันหยุดพักผ่อน (Off)',
    startTime: '-',
    endTime: '-'
  }
];
