import React, { useState } from 'react';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  Shift,
  UserAccount
} from './types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_SHIFTS,
  MOCK_USERS
} from './data/mockData';
import { generateEmployeePayroll } from './utils/payroll';
import {
  LayoutDashboard,
  Clock,
  ClipboardList,
  Banknote,
  FileText,
  Menu
} from 'lucide-react';

import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CheckInView } from './components/CheckInView';
import { PayrollView } from './components/PayrollView';
import { LeaveView } from './components/LeaveView';
import { ShiftView } from './components/ShiftView';
import { EmployeeView } from './components/EmployeeView';
import { ReportsView } from './components/ReportsView';
import { LoginView } from './components/LoginView';

export default function App() {
  // User Accounts State with localStorage
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('hr_cloud_registered_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_USERS;
      }
    }
    return MOCK_USERS;
  });

  // Application Employees State with localStorage
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('hr_cloud_employees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_EMPLOYEES;
      }
    }
    return INITIAL_EMPLOYEES;
  });

  // Auth State
  const [currentUserAccount, setCurrentUserAccount] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('hr_cloud_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return MOCK_USERS[0]; // Default logged in as HR for initial view
  });
  
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(() => {
    if (currentUserAccount) {
      const found = employees.find((e) => e.id === currentUserAccount.employeeId);
      if (found) return found;
    }
    return employees[0] || INITIAL_EMPLOYEES[0];
  });

  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    return currentUserAccount ? currentUserAccount.role === 'hr' : false;
  });

  const [activeTab, setActiveTab] = useState<TabType>('checkin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);

  // Initialize Payroll Records
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => {
    return employees.map((emp) => {
      const otHours = emp.id === 'EMP-001' ? 3.5 : emp.id === 'EMP-003' ? 2.0 : 0;
      return generateEmployeePayroll(emp, '2026-07', otHours, 0, 2000, 0);
    });
  });

  // Register User Handler
  const handleRegisterUser = (newUser: UserAccount, newEmp: Employee) => {
    const updatedUsers = [...userAccounts, newUser];
    const updatedEmps = [...employees, newEmp];
    
    setUserAccounts(updatedUsers);
    setEmployees(updatedEmps);

    localStorage.setItem('hr_cloud_registered_users', JSON.stringify(updatedUsers));
    localStorage.setItem('hr_cloud_employees', JSON.stringify(updatedEmps));

    // Generate initial payroll for new employee
    const newPayroll = generateEmployeePayroll(newEmp, '2026-07', 0, 0, 0, 0);
    setPayrollRecords((prev) => [newPayroll, ...prev]);
  };

  // Auth Handlers
  const handleLoginSuccess = (userAccount: UserAccount) => {
    setCurrentUserAccount(userAccount);
    localStorage.setItem('hr_cloud_auth_user', JSON.stringify(userAccount));
    
    const emp = employees.find((e) => e.id === userAccount.employeeId) || employees[0];
    setCurrentEmployee(emp);
    setIsAdminView(userAccount.role === 'hr');
    setActiveTab('checkin');
  };

  const handleLogout = () => {
    setCurrentUserAccount(null);
    localStorage.removeItem('hr_cloud_auth_user');
  };

  if (!currentUserAccount) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        userAccounts={userAccounts}
        onRegisterUser={handleRegisterUser}
      />
    );
  }


  // Handlers
  const handleAddAttendance = (newRecord: AttendanceRecord) => {
    setAttendanceRecords((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.employeeId === newRecord.employeeId && a.date === newRecord.date
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        updated[existingIndex] = {
          ...existing,
          ...newRecord,
          checkInTime: newRecord.checkInTime ?? existing.checkInTime,
          checkOutTime: newRecord.checkOutTime ?? existing.checkOutTime,
          note: newRecord.note ? `${existing.note ? existing.note + ' | ' : ''}${newRecord.note}` : existing.note
        };
        return updated;
      }
      return [newRecord, ...prev];
    });
  };

  const handleDeleteAttendance = (id: string) => {
    setAttendanceRecords((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateAttendanceRecord = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) =>
      prev.map((a) => (a.id === record.id ? record : a))
    );
  };

  const handleAddLeaveRequest = (newReq: LeaveRequest) => {
    setLeaveRequests((prev) => [newReq, ...prev]);
  };

  const handleUpdateLeaveRequest = (updatedReq: LeaveRequest) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === updatedReq.id ? updatedReq : l))
    );
  };

  const handleDeleteLeaveRequest = (id: string) => {
    setLeaveRequests((prev) => prev.filter((l) => l.id !== id));
  };

  const handleUpdateLeaveStatus = (
    id: string,
    status: 'approved' | 'rejected',
    approvedBy: string,
    rejectReason?: string
  ) => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              approvedBy,
              approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              rejectReason
            }
          : l
      )
    );
  };

  const handleUpdateShift = (newShift: Shift) => {
    setShifts((prev) => {
      const filtered = prev.filter(
        (s) => !(s.employeeId === newShift.employeeId && s.date === newShift.date)
      );
      return [...filtered, newShift];
    });
  };

  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees((prev) => {
      const updated = [...prev, newEmp];
      localStorage.setItem('hr_cloud_employees', JSON.stringify(updated));
      return updated;
    });
    // Also create initial payroll record for new employee
    const newPayroll = generateEmployeePayroll(newEmp, '2026-07', 0, 0, 1500, 0);
    setPayrollRecords((prev) => [...prev, newPayroll]);
  };

  const handleEditEmployee = (updatedEmp: Employee) => {
    setEmployees((prev) => {
      const updated = prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e));
      localStorage.setItem('hr_cloud_employees', JSON.stringify(updated));
      return updated;
    });
    if (currentEmployee.id === updatedEmp.id) {
      setCurrentEmployee(updatedEmp);
    }
    setPayrollRecords((prev) =>
      prev.map((p) => {
        if (p.employeeId === updatedEmp.id) {
          return {
            ...p,
            employeeName: updatedEmp.name,
            department: updatedEmp.department,
            position: updatedEmp.position,
            baseSalary: updatedEmp.baseSalary,
            netSalary: updatedEmp.baseSalary + p.otPay + p.bonus + p.allowance - p.tax - p.socialSecurity - p.lateDeduction
          };
        }
        return p;
      })
    );
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees((prev) => {
      const updated = prev.filter((e) => e.id !== employeeId);
      localStorage.setItem('hr_cloud_employees', JSON.stringify(updated));
      return updated;
    });
    setPayrollRecords((prev) => prev.filter((p) => p.employeeId !== employeeId));
    if (currentEmployee.id === employeeId) {
      const remaining = employees.filter((e) => e.id !== employeeId);
      if (remaining.length > 0) {
        setCurrentEmployee(remaining[0]);
      }
    }
  };

  const handleEditUserAccount = (updatedUser: UserAccount) => {
    setUserAccounts((prev) => {
      const updated = prev.map((u) => (u.id === updatedUser.id || u.username === updatedUser.username ? updatedUser : u));
      localStorage.setItem('hr_cloud_registered_users', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteUserAccount = (userId: string) => {
    setUserAccounts((prev) => {
      const updated = prev.filter((u) => u.id !== userId && u.username !== userId);
      localStorage.setItem('hr_cloud_registered_users', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSyncData = () => {
    const storedUsers = localStorage.getItem('hr_cloud_registered_users');
    if (storedUsers) {
      try {
        setUserAccounts(JSON.parse(storedUsers));
      } catch (e) {
        console.error('Error syncing user accounts', e);
      }
    }
  };

  const handleQuickCheckIn = (method: 'GPS' | 'FaceScan') => {
    setActiveTab('checkin');
  };

  const notificationLeavesList = isAdminView
    ? leaveRequests.filter((l) => l.status === 'pending')
    : leaveRequests.filter((l) => l.employeeId === currentEmployee.id || l.employeeName === currentEmployee.name);

  const pendingLeavesCount = notificationLeavesList.filter((l) => l.status === 'pending').length;
  const todayCheckedIn = attendanceRecords.some(
    (a) => a.employeeId === currentEmployee.id && a.date === '2026-07-27' && a.checkInTime !== null
  );

  const bottomNavItems = [
    { id: 'dashboard' as TabType, label: 'ภาพรวม', icon: LayoutDashboard },
    { id: 'checkin' as TabType, label: 'ลงเวลา', icon: Clock },
    { id: 'history' as TabType, label: 'ประวัติ', icon: ClipboardList },
    { id: 'payroll' as TabType, label: 'เงินเดือน', icon: Banknote },
    { id: 'leaves' as TabType, label: 'ยื่นลา', icon: FileText, badge: pendingLeavesCount > 0 ? pendingLeavesCount : null }
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      
      {/* Top Header */}
      <Header
        currentEmployee={currentEmployee}
        allEmployees={employees}
        onSelectEmployee={(emp) => setCurrentEmployee(emp)}
        isAdminView={isAdminView}
        onToggleAdminView={(isAdmin) => setIsAdminView(isAdmin)}
        pendingLeavesCount={pendingLeavesCount}
        pendingLeavesList={notificationLeavesList}
        onNavigateToLeaves={() => setActiveTab('leaves')}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        currentUserAccount={currentUserAccount}
        onLogout={handleLogout}
        onSyncData={handleSyncData}
      />

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row relative">
        
        {/* Sidebar (Left Menu) */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          pendingLeavesCount={pendingLeavesCount}
          isAdminView={isAdminView}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        {/* Content Panel */}
        <main className="flex-1 p-2.5 sm:p-3 md:p-3.5 min-w-0 pb-12 md:pb-3">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentEmployee={currentEmployee}
              employees={employees}
              attendanceRecords={attendanceRecords}
              leaveRequests={leaveRequests}
              payrollRecords={payrollRecords}
              onNavigate={(tab) => setActiveTab(tab)}
              isAdminView={isAdminView}
              onQuickCheckIn={handleQuickCheckIn}
              todayCheckedIn={todayCheckedIn}
            />
          )}

          {(activeTab === 'checkin' || activeTab === 'history') && (
            <CheckInView
              currentEmployee={currentEmployee}
              attendanceRecords={attendanceRecords}
              onAddAttendance={handleAddAttendance}
              onDeleteAttendance={handleDeleteAttendance}
              onUpdateAttendanceRecord={handleUpdateAttendanceRecord}
              isAdminView={isAdminView}
              employees={employees}
              initialViewTab={activeTab === 'history' ? 'history' : 'checkin'}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollView
              currentEmployee={currentEmployee}
              employees={employees}
              payrollRecords={payrollRecords}
              onUpdatePayroll={(records) => setPayrollRecords(records)}
              isAdminView={isAdminView}
            />
          )}

          {activeTab === 'leaves' && (
            <LeaveView
              currentEmployee={currentEmployee}
              leaveRequests={leaveRequests}
              onAddLeaveRequest={handleAddLeaveRequest}
              onUpdateLeaveStatus={handleUpdateLeaveStatus}
              onUpdateLeaveRequest={handleUpdateLeaveRequest}
              onDeleteLeaveRequest={handleDeleteLeaveRequest}
              isAdminView={isAdminView}
            />
          )}

          {activeTab === 'shifts' && (
            <ShiftView
              currentEmployee={currentEmployee}
              employees={employees}
              shifts={shifts}
              onUpdateShift={handleUpdateShift}
              isAdminView={isAdminView}
            />
          )}

          {activeTab === 'employees' && (
            isAdminView ? (
              <EmployeeView
                employees={employees}
                userAccounts={userAccounts}
                onAddEmployee={handleAddEmployee}
                onEditEmployee={handleEditEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onEditUserAccount={handleEditUserAccount}
                onDeleteUserAccount={handleDeleteUserAccount}
                isAdminView={isAdminView}
              />
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center space-y-4 shadow-sm border border-slate-200 my-8">
                <div className="p-3 bg-amber-100 text-amber-800 w-12 h-12 rounded-2xl mx-auto flex items-center justify-center font-bold">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">สงวนสิทธิ์สำหรับ HR, หัวหน้างาน และ Admin</h3>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  เมนูข้อมูลพนักงานและการจัดการสิทธิ์ อนุญาตให้เข้าถึงได้เฉพาะ HR, หัวหน้างาน และผู้ดูแลระบบเท่านั้น บัญชีพนักงานทั่วไปไม่สามารถเข้าถึงได้
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  กลับสู่หน้าหลัก
                </button>
              </div>
            )
          )}

          {activeTab === 'reports' && (
            isAdminView ? (
              <ReportsView
                employees={employees}
                attendanceRecords={attendanceRecords}
                payrollRecords={payrollRecords}
                leaveRequests={leaveRequests}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 animate-in fade-in duration-150">
                <div className="p-3 bg-amber-100 text-amber-800 w-12 h-12 rounded-2xl mx-auto flex items-center justify-center font-bold">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">สงวนสิทธิ์สำหรับผู้ดูแลระบบ HR (Admin Only)</h3>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  เมนูรายงานและดาวน์โหลด Excel สำหรับผู้จัดการและเจ้าหน้าที่ HR เท่านั้น บัญชีพนักงานทั่วไปไม่สามารถเข้าถึงได้
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  กลับสู่หน้าหลัก
                </button>
              </div>
            )
          )}
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar for Instant Mobile Access */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-800 text-slate-400 py-1.5 px-2 flex justify-around items-center shadow-2xl backdrop-blur-md">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative min-w-[60px] ${
                isActive ? 'text-emerald-400 font-bold scale-105' : 'hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Button to Open Left Sidebar Mobile Drawer */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative min-w-[60px] ${
            mobileMenuOpen ? 'text-emerald-400 font-bold scale-105' : 'text-slate-300 hover:text-white'
          }`}
        >
          <div className="relative p-1 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold text-emerald-400">เมนูทั้งหมด</span>
        </button>
      </nav>

    </div>
  );
}

