import React, { useState } from 'react';
import { Employee, Department, WorkMode, UserAccount, UserRole } from '../types';
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  CreditCard,
  CheckCircle2,
  X,
  Pencil,
  Trash2,
  AlertTriangle,
  UserCheck,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface EmployeeViewProps {
  employees: Employee[];
  userAccounts?: UserAccount[];
  onAddEmployee: (newEmp: Employee) => void;
  onEditEmployee?: (updatedEmp: Employee) => void;
  onDeleteEmployee?: (employeeId: string) => void;
  onEditUserAccount?: (updatedUser: UserAccount) => void;
  onDeleteUserAccount?: (userId: string) => void;
  isAdminView: boolean;
  hrAdminPasscode?: string;
  onUpdateHrAdminPasscode?: (newPasscode: string) => void;
}

export const EmployeeView: React.FC<EmployeeViewProps> = ({
  employees,
  userAccounts = [],
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onEditUserAccount,
  onDeleteUserAccount,
  isAdminView,
  hrAdminPasscode = '1234',
  onUpdateHrAdminPasscode
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'users'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  
  // HR Admin Passcode Management State
  const [passcodeInput, setPasscodeInput] = useState(hrAdminPasscode);
  const [isEditingPasscode, setIsEditingPasscode] = useState(false);
  const [passcodeSuccessMsg, setPasscodeSuccessMsg] = useState('');
  const [isPasscodeCollapsed, setIsPasscodeCollapsed] = useState(true);
  
  // User Account View state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'hr' | 'employee'>('ALL');
  const [showAllPasswords, setShowAllPasswords] = useState(true);
  const [isUserTableCollapsed, setIsUserTableCollapsed] = useState(true);
  const [isEmpGridCollapsed, setIsEmpGridCollapsed] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [editingUserAccount, setEditingUserAccount] = useState<UserAccount | null>(null);
  const [deletingUserAccount, setDeletingUserAccount] = useState<UserAccount | null>(null);

  // New Employee Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('081-999-8888');
  const [department, setDepartment] = useState<Department>('ฝ่ายไอที (IT)');
  const [position, setPosition] = useState('Software Engineer');
  const [baseSalary, setBaseSalary] = useState(35000);
  const [bankAccount, setBankAccount] = useState('123-4-56789-0');
  const [bankName, setBankName] = useState('ธนาคารกสิกรไทย (KBank)');
  const [workMode, setWorkMode] = useState<WorkMode>('Hybrid');

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || e.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredUsers = userAccounts.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.displayName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const assignedCode = code.trim() ? code.trim().toUpperCase() : `EMP-00${employees.length + 1}`;

    const newEmp: Employee = {
      id: assignedCode,
      code: assignedCode,
      name,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      department,
      position,
      email: email || `${name.toLowerCase().replace(' ', '.')}@company.co.th`,
      phone,
      baseSalary,
      bankAccount,
      bankName,
      taxId: `1-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10000 + Math.random() * 90000)}-0`,
      socialSecurityId: `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      workMode,
      startDate: new Date().toISOString().split('T')[0],
      leaveBalance: {
        annual: { total: 10, used: 0 },
        sick: { total: 30, used: 0 },
        personal: { total: 6, used: 0 }
      }
    };

    onAddEmployee(newEmp);
    setShowAddModal(false);
    setCode('');
    setName('');
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    if (onEditEmployee) {
      onEditEmployee(editingEmployee);
    }
    setEditingEmployee(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingEmployee) return;
    if (onDeleteEmployee) {
      onDeleteEmployee(deletingEmployee.id);
    }
    setDeletingEmployee(null);
  };

  const handleUpdateUserAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserAccount) return;
    if (onEditUserAccount) {
      onEditUserAccount(editingUserAccount);
    }
    setEditingUserAccount(null);
  };

  const handleConfirmDeleteUserAccount = () => {
    if (!deletingUserAccount) return;
    if (onDeleteUserAccount) {
      onDeleteUserAccount(deletingUserAccount.id || deletingUserAccount.username);
    }
    setDeletingUserAccount(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            จัดการบุคลากร และ บัญชีผู้ใช้งานระบบ
          </h2>
          <p className="text-xs text-slate-500">
            ตรวจสอบข้อมูลพนักงาน และรายชื่อผู้สมัคร / บัญชีผู้เข้าใช้งานระบบทั้งหมด (Usernames)
          </p>
        </div>

        {isAdminView && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            เพิ่มพนักงานใหม่
          </button>
        )}
      </div>

      {/* Sub Tabs: Employee Directory vs User Accounts Directory */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('employees')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'employees'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>รายชื่อพนักงานทั้งหมด ({employees.length})</span>
        </button>

        {isAdminView && (
          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'users'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>บัญชีผู้ใช้งาน & รหัสผ่านระบบทั้งหมด ({userAccounts.length})</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-extrabold">
              {userAccounts.length}
            </span>
          </button>
        )}
      </div>

      {/* TAB 1: EMPLOYEES DIRECTORY */}
      {activeSubTab === 'employees' || !isAdminView ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ หรือตำแหน่งพนักงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEmpGridCollapsed(!isEmpGridCollapsed)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                title={isEmpGridCollapsed ? 'โชว์การแสดงผลรายชื่อ' : 'ย่อการแสดงผลรายชื่อ'}
              >
                {isEmpGridCollapsed ? (
                  <>
                    <ChevronDown className="w-4 h-4 text-emerald-600" />
                    <span>โชว์การแสดงผล</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4 text-slate-600" />
                    <span>ย่อการแสดงผล</span>
                  </>
                )}
              </button>

              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="ALL">ทุกฝ่าย (All Departments)</option>
                <option value="ฝ่ายไอที (IT)">ฝ่ายไอที (IT)</option>
                <option value="ฝ่ายการตลาด (Marketing)">ฝ่ายการตลาด (Marketing)</option>
                <option value="ฝ่ายขาย (Sales)">ฝ่ายขาย (Sales)</option>
                <option value="ฝ่ายบุคคล (HR)">ฝ่ายบุคคล (HR)</option>
                <option value="ฝ่ายปฏิบัติการ (Operations)">ฝ่ายปฏิบัติการ (Operations)</option>
              </select>
            </div>
          </div>

          {/* Directory Grid */}
          {isEmpGridCollapsed ? (
            <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl border border-slate-200/80 text-center text-xs font-semibold flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                ย่อการแสดงผลรายชื่อพนักงานไว้ ({filteredEmployees.length} คน)
              </span>
              <button
                type="button"
                onClick={() => setIsEmpGridCollapsed(false)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              >
                <span>โชว์รายชื่อพนักงาน</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredEmployees.map((emp) => (
              <div key={emp.id} className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 space-y-3 relative hover:shadow-md transition flex flex-col justify-between">
                
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20" />
                      <div className="truncate">
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                          {emp.code}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm truncate mt-0.5">{emp.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{emp.position}</p>
                      </div>
                    </div>

                    {/* Top Action Icons */}
                    {isAdminView && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingEmployee({ ...emp })}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/80 bg-white border border-slate-200 rounded-lg transition shadow-2xs cursor-pointer"
                          title="แก้ไขข้อมูลพนักงาน"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingEmployee(emp)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100/80 bg-white border border-slate-200 rounded-lg transition shadow-2xs cursor-pointer"
                          title="ลบพนักงาน"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 text-xs space-y-1.5 text-slate-600 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.department}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-slate-700">เงินเดือนฐาน:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {isAdminView ? `฿${emp.baseSalary.toLocaleString()}` : '•••••• (สงวนสิทธิ์เฉพาะผู้ดูแล)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">โหมดการทำงาน:</span>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-bold rounded-md">
                        {emp.workMode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer Row */}
                {isAdminView && (
                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setEditingEmployee({ ...emp })}
                      className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                      <span>แก้ไขข้อมูล</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingEmployee(emp)}
                      className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>ลบ</span>
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
          )}
        </div>
      ) : (
        /* TAB 2: REGISTERED USER ACCOUNTS & APPLICANTS */
        <div className="space-y-4">
          
          {/* Summary Stat Cards for User Accounts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-medium">ผู้สมัคร/บัญชีทั้งหมด</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">{userAccounts.length}</div>
              <div className="text-[10px] text-emerald-600 font-semibold">บัญชีที่ลงทะเบียนในระบบ</div>
            </div>

            <div className="p-4 bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-xs space-y-1">
              <div className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ผู้ดูแล (HR Admin)</span>
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {userAccounts.filter((u) => u.role === 'hr').length}
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold">มีสิทธิ์การจัดการระดับสูง</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>พนักงาน (Employees)</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {userAccounts.filter((u) => u.role === 'employee').length}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold">ลงเวลา ยื่นลา ดูสลิป</div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xs space-y-1">
              <div className="text-xs text-emerald-800 font-medium flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>บัญชีใหม่ล่าสุด</span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-900 font-mono">
                {userAccounts.length > 3 ? userAccounts.length - 3 : userAccounts.length}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold">พร้อมใช้งานทันที</div>
            </div>
          </div>

          {/* HR Admin Passcode Setting Card (Collapsible & Expandable) */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 shadow-xs transition-all">
            {isPasscodeCollapsed ? (
              /* Collapsed view */
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-500/20 text-amber-900 rounded-lg shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    รหัสอนุมัติ HR Admin:
                    <span className="px-2 py-0.5 bg-amber-200/90 text-amber-900 font-mono font-extrabold rounded-md text-[11px]">
                      {hrAdminPasscode}
                    </span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPasscodeCollapsed(false)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100/70 text-amber-900 border border-amber-300 rounded-lg font-bold text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>โชว์ / ตั้งค่า</span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-800" />
                </button>
              </div>
            ) : (
              /* Expanded view */
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-900 rounded-xl shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        ตั้งค่ารหัสอนุมัติสิทธิ์ผู้ดูแล HR (Admin Passcode)
                        <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 font-mono font-extrabold rounded-md text-[11px]">
                          {hrAdminPasscode}
                        </span>
                      </h4>
                      <p className="text-[11px] text-amber-800/90 mt-0.5">
                        ใช้สำหรับยืนยันสิทธิ์เมื่อผู้สมัครลงทะเบียนเข้าใช้งานในสิทธิ์ผู้ดูแลระบบ (HR Admin)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    {isEditingPasscode ? (
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <input
                          type="text"
                          value={passcodeInput}
                          onChange={(e) => setPasscodeInput(e.target.value.trim())}
                          placeholder="กรอกรหัสใหม่"
                          className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 w-32"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newCode = passcodeInput.trim();
                            if (newCode) {
                              if (onUpdateHrAdminPasscode) {
                                onUpdateHrAdminPasscode(newCode);
                              }
                              setIsEditingPasscode(false);
                              setPasscodeSuccessMsg(`เปลี่ยนรหัสอนุมัติ HR เป็น ${newCode} เรียบร้อยแล้ว!`);
                              setTimeout(() => setPasscodeSuccessMsg(''), 3500);
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer shrink-0"
                        >
                          บันทึก
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPasscodeInput(hrAdminPasscode);
                            setIsEditingPasscode(false);
                          }}
                          className="px-2.5 py-1.5 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPasscodeInput(hrAdminPasscode);
                          setIsEditingPasscode(true);
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                        <span>ตั้งรหัสอนุมัติ HR ใหม่</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsPasscodeCollapsed(true)}
                      className="px-2.5 py-1.5 bg-white hover:bg-amber-100/70 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                      title="ย่อการแสดงผล"
                    >
                      <span>ย่อ</span>
                      <ChevronUp className="w-3.5 h-3.5 text-amber-800" />
                    </button>
                  </div>
                </div>

                {passcodeSuccessMsg && (
                  <div className="w-full text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1.5 rounded-xl animate-in fade-in">
                    ✓ {passcodeSuccessMsg}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filter Bar & Password Visibility Master Toggle */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ใช้ (Username), ชื่อผู้สมัคร หรือ รหัสพนักงาน..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAllPasswords(!showAllPasswords)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  showAllPasswords
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title={showAllPasswords ? 'ซ่อนรหัสผ่านทั้งหมด' : 'แสดงรหัสผ่านทั้งหมด'}
              >
                {showAllPasswords ? (
                  <>
                    <EyeOff className="w-4 h-4 text-emerald-600" />
                    <span>ซ่อนรหัสผ่านทั้งหมด</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-slate-600" />
                    <span>แสดงรหัสผ่านทั้งหมด</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <button
                  type="button"
                  onClick={() => setIsUserTableCollapsed(!isUserTableCollapsed)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 mr-1"
                  title={isUserTableCollapsed ? 'โชว์การแสดงผลตาราง' : 'ย่อการแสดงผลตาราง'}
                >
                  {isUserTableCollapsed ? (
                    <>
                      <ChevronDown className="w-4 h-4 text-emerald-600" />
                      <span>โชว์ตาราง</span>
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-4 h-4 text-slate-600" />
                      <span>ย่อตาราง</span>
                    </>
                  )}
                </button>

                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="ALL">ทุกสิทธิ์การใช้งาน (All Roles)</option>
                  <option value="hr">เฉพาะผู้ดูแล (HR Admin)</option>
                  <option value="employee">เฉพาะพนักงาน (Employee)</option>
                </select>
              </div>
            </div>
          </div>

          {/* User Accounts Table */}
          {isUserTableCollapsed ? (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                ย่อการแสดงผลตารางสิทธิ์ & บัญชีผู้ใช้งานระบบไว้ ({filteredUsers.length} บัญชี)
              </span>
              <button
                type="button"
                onClick={() => setIsUserTableCollapsed(false)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              >
                <span>โชว์ตารางการแสดงผล</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3.5 pl-4">ชื่อผู้ใช้ (Username)</th>
                    <th className="p-3.5">ชื่อ-นามสกุลผู้สมัคร / Display Name</th>
                    <th className="p-3.5">สิทธิ์การใช้งาน (Role)</th>
                    <th className="p-3.5">รหัสพนักงาน & ฝ่าย</th>
                    <th className="p-3.5">รหัสผ่าน (Password)</th>
                    <th className="p-3.5 pr-4 text-right">การจัดการ & คัดลอก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        ไม่พบข้อมูลบัญชีผู้สมัครตรงกับเงื่อนไขการค้นหา
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => {
                      const isHr = user.role === 'hr';
                      const userKey = user.id ? `${user.id}-${index}` : `${user.username}-${index}`;
                      const isVisible = showAllPasswords || visiblePasswords[user.id || user.username];
                      return (
                        <tr key={userKey} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5 pl-4 font-mono font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-extrabold flex items-center gap-1">
                                {user.username}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(user.username)}
                                className="p-1 text-slate-400 hover:text-emerald-600 rounded-md transition cursor-pointer"
                                title="คัดลอก Username"
                              >
                                {copiedText === user.username ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="p-3.5 font-semibold text-slate-800">
                            {user.displayName}
                          </td>

                          <td className="p-3.5">
                            {isHr ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-900 text-emerald-400 font-bold text-[10px] rounded-md shadow-2xs">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                HR Administrator
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-sky-100 text-sky-800 font-bold text-[10px] rounded-md">
                                <UserCheck className="w-3 h-3 text-sky-600" />
                                พนักงาน (Employee)
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-slate-600">
                            <div className="font-mono text-[11px] font-bold text-slate-800">{user.employeeId}</div>
                            <div className="text-[10px] text-slate-400">{user.department}</div>
                          </td>

                          <td className="p-3.5 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-md ${isVisible ? 'bg-amber-50 text-amber-900 border border-amber-200 font-extrabold' : 'text-slate-400 font-semibold'}`}>
                                {isVisible ? user.passwordHash : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(user.id || user.username)}
                                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                                title={isVisible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                              >
                                {isVisible ? <EyeOff className="w-3.5 h-3.5 text-emerald-600" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              {isVisible && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(user.passwordHash)}
                                  className="p-1 text-slate-400 hover:text-emerald-600 rounded-md transition cursor-pointer"
                                  title="คัดลอก Password"
                                >
                                  {copiedText === user.passwordHash ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingUserAccount({ ...user })}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold transition inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="แก้ไขบัญชีผู้ใช้"
                              >
                                <Pencil className="w-3 h-3 text-emerald-600" />
                                <span>แก้ไข</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => copyToClipboard(`Username: ${user.username} | Password: ${user.passwordHash}`)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                title="คัดลอก Username และ Password"
                              >
                                {copiedText === `Username: ${user.username} | Password: ${user.passwordHash}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>คัดลอกแล้ว</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-slate-500" />
                                    <span>คัดลอกทั้งหมด</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingUserAccount(user)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition cursor-pointer"
                                title="ลบบัญชีผู้ใช้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}

        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">แก้ไขข้อมูลพนักงาน</h3>
                  <p className="text-[11px] text-slate-500">รหัสพนักงาน: {editingEmployee.code}</p>
                </div>
              </div>
              <button onClick={() => setEditingEmployee(null)} className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">รหัสพนักงาน (Code):</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.code}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, code: e.target.value.toUpperCase(), id: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล:</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">แผนก / ฝ่าย:</label>
                  <select
                    value={editingEmployee.department}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value as Department })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="ฝ่ายไอที (IT)">ฝ่ายไอที (IT)</option>
                    <option value="ฝ่ายการตลาด (Marketing)">ฝ่ายการตลาด (Marketing)</option>
                    <option value="ฝ่ายขาย (Sales)">ฝ่ายขาย (Sales)</option>
                    <option value="ฝ่ายบุคคล (HR)">ฝ่ายบุคคล (HR)</option>
                    <option value="ฝ่ายปฏิบัติการ (Operations)">ฝ่ายปฏิบัติการ (Operations)</option>
                    <option value="ฝ่ายบัญชี (Accounting)">ฝ่ายบัญชี (Accounting)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ตำแหน่ง:</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.position}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เงินเดือนฐาน (บาท):</label>
                  <input
                    type="number"
                    value={editingEmployee.baseSalary}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, baseSalary: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">โหมดการทำงาน:</label>
                  <select
                    value={editingEmployee.workMode}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, workMode: e.target.value as WorkMode })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="On-site">On-site (เข้าออฟฟิศ)</option>
                    <option value="Hybrid">Hybrid (สลับเข้าออฟฟิศ)</option>
                    <option value="Remote">Remote (ทำงานทางไกล)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">อีเมลพนักงาน:</label>
                  <input
                    type="email"
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์:</label>
                  <input
                    type="text"
                    value={editingEmployee.phone}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ธนาคาร:</label>
                  <input
                    type="text"
                    value={editingEmployee.bankName}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, bankName: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">เลขบัญชีธนาคาร:</label>
                  <input
                    type="text"
                    value={editingEmployee.bankAccount}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, bankAccount: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">ยืนยันการลบพนักงาน</h3>
                <p className="text-xs text-slate-500">การดำเนินการนี้จะไม่สามารถย้อนกลับได้</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">{deletingEmployee.name} ({deletingEmployee.code})</div>
              <div className="text-slate-500">{deletingEmployee.position} • {deletingEmployee.department}</div>
            </div>

            <p className="text-xs text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานท่านนี้ออกจากระบบ? ข้อมูลเงินเดือน ประวัติเวลา และใบลาทั้งหมดจะถูกนำออก
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingEmployee(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันลบพนักงาน</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">เพิ่มพนักงานใหม่ลงระบบ (Add Employee)</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">รหัสพนักงาน (Code):</label>
                  <input
                    type="text"
                    placeholder={`เช่น EMP-00${employees.length + 1}`}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล:</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น พรประภา สุวรรณโชติ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">แผนก:</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="ฝ่ายไอที (IT)">ฝ่ายไอที (IT)</option>
                    <option value="ฝ่ายการตลาด (Marketing)">ฝ่ายการตลาด (Marketing)</option>
                    <option value="ฝ่ายขาย (Sales)">ฝ่ายขาย (Sales)</option>
                    <option value="ฝ่ายบุคคล (HR)">ฝ่ายบุคคล (HR)</option>
                    <option value="ฝ่ายปฏิบัติการ (Operations)">ฝ่ายปฏิบัติการ (Operations)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ตำแหน่ง:</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เงินเดือนฐาน (บาท):</label>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 border rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">โหมดการทำงาน:</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="On-site">On-site (เข้าออฟฟิศ)</option>
                    <option value="Hybrid">Hybrid (สลับเข้าออฟฟิศ)</option>
                    <option value="Remote">Remote (ทำงานทางไกล)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">อีเมลพนักงาน:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.co.th"
                  className="w-full p-2.5 border rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  บันทึกข้อมูลพนักงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Account Modal */}
      {editingUserAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">แก้ไขบัญชีผู้ใช้งานระบบ</h3>
                  <p className="text-[11px] text-slate-500">Username: {editingUserAccount.username}</p>
                </div>
              </div>
              <button onClick={() => setEditingUserAccount(null)} className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserAccount} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อผู้ใช้ (Username):</label>
                  <input
                    type="text"
                    required
                    value={editingUserAccount.username}
                    onChange={(e) => setEditingUserAccount({ ...editingUserAccount, username: e.target.value.trim() })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">รหัสผ่าน (Password):</label>
                  <input
                    type="text"
                    required
                    value={editingUserAccount.passwordHash}
                    onChange={(e) => setEditingUserAccount({ ...editingUserAccount, passwordHash: e.target.value.trim() })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล / Display Name:</label>
                <input
                  type="text"
                  required
                  value={editingUserAccount.displayName}
                  onChange={(e) => setEditingUserAccount({ ...editingUserAccount, displayName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">สิทธิ์การใช้งาน (Role):</label>
                  <select
                    value={editingUserAccount.role}
                    onChange={(e) => setEditingUserAccount({ ...editingUserAccount, role: e.target.value as UserRole })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="employee">พนักงาน (Employee)</option>
                    <option value="hr">ผู้ดูแล (HR Administrator)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">รหัสพนักงาน (Employee ID):</label>
                  <input
                    type="text"
                    value={editingUserAccount.employeeId}
                    onChange={(e) => setEditingUserAccount({ ...editingUserAccount, employeeId: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">แผนก / ฝ่าย:</label>
                <select
                  value={editingUserAccount.department || 'ฝ่ายไอที (IT)'}
                  onChange={(e) => setEditingUserAccount({ ...editingUserAccount, department: e.target.value as Department })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="ฝ่ายไอที (IT)">ฝ่ายไอที (IT)</option>
                  <option value="ฝ่ายการตลาด (Marketing)">ฝ่ายการตลาด (Marketing)</option>
                  <option value="ฝ่ายขาย (Sales)">ฝ่ายขาย (Sales)</option>
                  <option value="ฝ่ายบุคคล (HR)">ฝ่ายบุคคล (HR)</option>
                  <option value="ฝ่ายปฏิบัติการ (Operations)">ฝ่ายปฏิบัติการ (Operations)</option>
                  <option value="ฝ่ายบัญชี (Accounting)">ฝ่ายบัญชี (Accounting)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUserAccount(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  บันทึกการแก้ไขบัญชี
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Account Modal */}
      {deletingUserAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">ยืนยันการลบบัญชีผู้ใช้</h3>
                <p className="text-xs text-slate-500">การดำเนินการนี้จะไม่สามารถย้อนกลับได้</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">{deletingUserAccount.displayName} ({deletingUserAccount.username})</div>
              <div className="text-slate-500">สิทธิ์: {deletingUserAccount.role === 'hr' ? 'HR Administrator' : 'Employee'} • รหัส: {deletingUserAccount.employeeId}</div>
            </div>

            <p className="text-xs text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้ "{deletingUserAccount.username}" ออกจากระบบ? ผู้ใช้จะไม่สามารถเข้าสู่ระบบด้วยบัญชีนี้ได้อีก
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingUserAccount(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUserAccount}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันลบบัญชีผู้ใช้</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
