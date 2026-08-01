import React, { useState } from 'react';
import { UserAccount, Employee, Department, UserRole } from '../types';
import {
  Lock,
  User,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
  Building,
  KeyRound,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle2,
  Briefcase,
  Banknote,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
  userAccounts: UserAccount[];
  onRegisterUser: (newUser: UserAccount, newEmployee: Employee) => void;
  hrAdminPasscode?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  userAccounts,
  onRegisterUser,
  hrAdminPasscode = '1234'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isBannerCollapsed, setIsBannerCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Register Form States
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('employee');
  const [regHrPasscode, setRegHrPasscode] = useState('');
  const [regDepartment, setRegDepartment] = useState<Department>('ฝ่ายไอที (IT)');
  const [regPosition, setRegPosition] = useState('พนักงานใหม่');
  const [regBaseSalary, setRegBaseSalary] = useState<number>(32000);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const foundUser = userAccounts.find(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          u.passwordHash === password.trim()
      );

      if (foundUser) {
        onLoginSuccess(foundUser);
      } else {
        setErrorMsg('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (หากเพิ่งสมัครสมาชิกรบกวนตรวจสอบชื่อผู้ใช้)');
        setLoading(false);
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = regUsername.trim();
    if (!cleanUsername || !regPassword.trim() || !regFullName.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (ชื่อผู้ใช้, รหัสผ่าน, ชื่อ-นามสกุล)');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (regRole === 'hr' && regHrPasscode.trim() !== hrAdminPasscode) {
      setErrorMsg(`รหัสอนุมัติสิทธิ์ HR ไม่ถูกต้อง (รหัสอนุมัติปัจจุบันคือ ${hrAdminPasscode})`);
      return;
    }

    if (cleanUsername.length < 3) {
      setErrorMsg('ชื่อผู้ใช้ (Username) ต้องมีความยาวอย่างน้อย 3 ตัวอักษร');
      return;
    }

    // Check duplicate username
    const isDuplicate = userAccounts.some(
      (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (isDuplicate) {
      setErrorMsg(`ชื่อผู้ใช้ "${cleanUsername}" ถูกใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้อื่น`);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const newEmpId = `EMP-${String(Math.floor(Math.random() * 899) + 100)}`;
      
      const newEmployee: Employee = {
        id: newEmpId,
        code: newEmpId,
        name: regFullName.trim(),
        department: regDepartment,
        position: regPosition.trim() || 'พนักงานใหม่',
        email: `${cleanUsername.toLowerCase()}@company.co.th`,
        phone: '081-234-5678',
        startDate: new Date().toISOString().split('T')[0],
        baseSalary: regBaseSalary || 30000,
        bankName: 'ธนาคารกสิกรไทย (KBANK)',
        bankAccount: `${Math.floor(Math.random() * 899 + 100)}-2-${Math.floor(Math.random() * 89999 + 10000)}-0`,
        taxId: `1-${Math.floor(Math.random() * 8999 + 1000)}-${Math.floor(Math.random() * 89999 + 10000)}-0`,
        socialSecurityId: `3-${Math.floor(Math.random() * 8999 + 1000)}-${Math.floor(Math.random() * 89999 + 10000)}-0`,
        workMode: 'On-site',
        avatar: regRole === 'hr' 
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        leaveBalance: {
          annual: { total: 10, used: 0 },
          sick: { total: 30, used: 0 },
          personal: { total: 6, used: 0 }
        }
      };

      const newUserAccount: UserAccount = {
        id: `USR-${Date.now()}`,
        username: cleanUsername,
        passwordHash: regPassword.trim(),
        role: regRole,
        employeeId: newEmpId,
        displayName: `${regFullName.trim()} (${regRole === 'hr' ? 'HR Admin' : 'พนักงาน'})`,
        department: regDepartment
      };

      onRegisterUser(newUserAccount, newEmployee);
      setSuccessMsg(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${regFullName}`);
      
      // Auto login after short delay
      setTimeout(() => {
        onLoginSuccess(newUserAccount);
      }, 500);

    }, 500);
  };

  const handleQuickLogin = (u: UserAccount) => {
    setErrorMsg('');
    setSuccessMsg('');
    setUsername(u.username);
    setPassword(u.passwordHash);
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(u);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.25),rgba(255,255,255,0))] flex items-center justify-center p-4 text-slate-800 antialiased font-sans my-4">
      
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Left Banner Section */}
        <div className={`md:col-span-5 bg-slate-950 ${isBannerCollapsed ? 'p-4 sm:p-5' : 'p-6 sm:p-8'} text-white flex flex-col justify-between relative overflow-hidden transition-all duration-300`}>
          {/* Subtle Background Elements */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30 shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-extrabold text-base tracking-tight text-white">Thanakrit HR Cloud</h1>
                  <p className="text-[11px] text-emerald-400 font-medium">Enterprise Attendance & Payroll</p>
                </div>
              </div>

              {/* Collapse / Expand Toggle Button */}
              <button
                type="button"
                onClick={() => setIsBannerCollapsed(!isBannerCollapsed)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 border border-slate-700/80 transition cursor-pointer shrink-0"
                title={isBannerCollapsed ? 'ขยายแสดงรายละเอียดระบบ' : 'ย่อเก็บรายละเอียดระบบ'}
              >
                {isBannerCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px]">ขยาย</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px]">ย่อ</span>
                  </>
                )}
              </button>
            </div>

            {!isBannerCollapsed && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> ระบบจำกัดสิทธิ์การเข้าถึง (RBAC)
                </span>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                  ระบบจัดการบุคลากร และลงเวลาเข้างาน
                </h2>

                <p className="text-slate-400 text-xs leading-relaxed">
                  สร้างบัญชีผู้ใช้ใหม่ หรือ เข้าสู่ระบบตามสิทธิ์เพื่อใช้งาน คุณสมบัติลงเวลาผ่าน GPS, คำนวณเงินเดือน และจัดการวันลา
                </p>
              </div>
            )}
          </div>

          {!isBannerCollapsed && (
            <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-slate-300">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span><strong>สิทธิ์ HR / Administrator:</strong> จัดการข้อมูลพนักงาน อนุมัติลางาน ออกรายงาน และคำนวณเงินเดือน</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span><strong>สิทธิ์ พนักงาน (Employee):</strong> ลงเวลาเข้างาน GPS, ยื่นลา และดูสลิปเงินเดือนของตนเอง</span>
              </div>

              {/* Version & Creator Info */}
              <div className="pt-3 border-t border-slate-800/80 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>ระบบพร้อมใช้งาน (Online)</span>
                </div>
                <p className="text-slate-400 text-[10px]">รองรับ GPS เช็คอิน, สแกนหน้า, ภาษี & ประกันสังคมไทย</p>
                <p className="text-[10px] text-emerald-400 font-bold pt-0.5">v69.8.1 -Thanakrit HR Cloud</p>
                <p className="text-[10px] text-slate-400">ออกแบบและจัดทำโดย คุณธนกฤต เพชรฤทธิ์</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Form Section */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          
          {/* Tab Switcher: Login vs Register */}
          <div className="flex bg-slate-100/90 p-1 rounded-2xl mb-6 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>เข้าสู่ระบบ</span>
              <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">(Sign In)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>สมัครสมาชิก</span>
              <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">(Register)</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' ? (
            <div>
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">เข้าสู่ระบบ</h3>
                <p className="text-slate-500 text-xs mt-0.5">กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ระบบ</p>
              </div>



              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อผู้ใช้ (Username)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="เช่น hr, emp001 หรือ Username ที่สมัคร"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสผ่าน (Password)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="กรอกรหัสผ่าน"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>กำลังตรวจสอบ...</span>
                      </>
                    ) : (
                      <>
                        <span>เข้าสู่ระบบ</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* TAB 2: REGISTER */
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">สมัครสมาชิกผู้ใช้ใหม่</h3>
                <p className="text-slate-500 text-xs mt-0.5">สร้างบัญชีผู้ใช้ใหม่และกำหนดสิทธิ์การใช้งานระบบ</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อผู้ใช้ที่ต้องการ (Username) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="เช่น somchai99, hr_admin"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      รหัสผ่าน (Password) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={regShowPassword ? 'text' : 'password'}
                        required
                        placeholder="ตั้งรหัสผ่าน"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setRegShowPassword(!regShowPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {regShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ยืนยันรหัสผ่าน *
                    </label>
                    <input
                      type={regShowPassword ? 'text' : 'password'}
                      required
                      placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นาย สมศักดิ์ ใจดี"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    สิทธิ์การใช้งานในระบบ (Access Role) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('employee')}
                      className={`p-2 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                        regRole === 'employee'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <UserCheck className={`w-4 h-4 ${regRole === 'employee' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs">พนักงาน (Employee)</div>
                        <div className="text-[10px] text-slate-500 font-normal">ลงเวลา & ยื่นลา</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('hr')}
                      className={`p-2 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                        regRole === 'hr'
                          ? 'bg-slate-900 border-slate-900 text-white font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className={`w-4 h-4 ${regRole === 'hr' ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs">ผู้ดูแล HR (Admin)</div>
                        <div className="text-[10px] text-slate-400 font-normal">อนุมัติ & จัดการระบบ</div>
                      </div>
                    </button>
                  </div>

                  {regRole === 'hr' && (
                    <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                      <label className="block text-[11px] font-bold text-amber-900">
                        รหัสอนุมัติสิทธิ์ผู้ดูแล HR (Admin Passcode) *
                      </label>
                      <input
                        type="password"
                        placeholder={`กรอกรหัสอนุมัติ (${hrAdminPasscode}) เพื่อยืนยันสิทธิ์ HR`}
                        value={regHrPasscode}
                        onChange={(e) => setRegHrPasscode(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                      <p className="text-[10px] text-amber-800 font-medium">
                        * ป้องกันพนักงานทั่วไปแอบอ้างสิทธิ์ (รหัสอนุมัติปัจจุบันสำหรับ HR คือ <strong className="font-mono underline">{hrAdminPasscode}</strong>)
                      </p>
                    </div>
                  )}
                </div>

                {/* Department & Position */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      สังกัดฝ่าย/แผนก
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value as Department)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ตำแหน่งงาน
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น Senior Developer"
                      value={regPosition}
                      onChange={(e) => setRegPosition(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Submit Register */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>กำลังบันทึกข้อมูล...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>ยืนยันสมัครสมาชิกและเข้าสู่ระบบ</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

