import React, { useState } from 'react';
import { Employee, LeaveRequest, LeaveType, LeaveStatus } from '../types';
import { exportLeavesToExcel } from '../utils/payroll';
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Paperclip,
  FileSpreadsheet,
  User,
  X,
  Pencil,
  Trash2,
  Edit3,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface LeaveViewProps {
  currentEmployee: Employee;
  leaveRequests: LeaveRequest[];
  onAddLeaveRequest: (newReq: LeaveRequest) => void;
  onUpdateLeaveStatus: (
    id: string,
    status: 'approved' | 'rejected',
    approvedBy: string,
    reason?: string
  ) => void;
  onUpdateLeaveRequest?: (updatedReq: LeaveRequest) => void;
  onDeleteLeaveRequest?: (id: string) => void;
  isAdminView: boolean;
}

export const LeaveView: React.FC<LeaveViewProps> = ({
  currentEmployee,
  leaveRequests,
  onAddLeaveRequest,
  onUpdateLeaveStatus,
  onUpdateLeaveRequest,
  onDeleteLeaveRequest,
  isAdminView
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isTableCollapsed, setIsTableCollapsed] = useState(true);
  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState('2026-07-30');
  const [endDate, setEndDate] = useState('2026-07-30');
  const [daysCount, setDaysCount] = useState(1);
  const [reason, setReason] = useState('');

  // Editing state
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);
  const [editLeaveType, setEditLeaveType] = useState<LeaveType>('annual');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editDaysCount, setEditDaysCount] = useState(1);
  const [editReason, setEditReason] = useState('');
  const [editRemark, setEditRemark] = useState('');
  const [editStatus, setEditStatus] = useState<LeaveStatus>('pending');
  const [editApprovedBy, setEditApprovedBy] = useState('');

  const [remark, setRemark] = useState('');

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('กรุณาระบุเหตุผลการขอลา');
      return;
    }

    const newReq: LeaveRequest = {
      id: `LR-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      department: currentEmployee.department,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason,
      remark: remark.trim() || undefined,
      status: 'pending',
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onAddLeaveRequest(newReq);
    setShowRequestModal(false);
    setReason('');
    setRemark('');
  };

  const handleOpenEdit = (req: LeaveRequest) => {
    setEditingLeave(req);
    setEditLeaveType(req.leaveType);
    setEditStartDate(req.startDate);
    setEditEndDate(req.endDate);
    setEditDaysCount(req.daysCount);
    setEditReason(req.reason);
    setEditRemark(req.remark || req.rejectReason || '');
    setEditStatus(req.status);
    setEditApprovedBy(req.approvedBy || currentEmployee.name);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeave) return;

    const updated: LeaveRequest = {
      ...editingLeave,
      leaveType: editLeaveType,
      startDate: editStartDate,
      endDate: editEndDate,
      daysCount: editDaysCount,
      reason: editReason,
      remark: editRemark.trim() || undefined,
      rejectReason: editRemark.trim() || undefined,
      status: editStatus,
      approvedBy: editStatus === 'pending' ? '' : editApprovedBy || `${currentEmployee.name} (HR)`,
      approvedAt: editStatus === 'approved' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : editingLeave.approvedAt
    };

    if (onUpdateLeaveRequest) {
      onUpdateLeaveRequest(updated);
    } else if (editStatus !== editingLeave.status) {
      onUpdateLeaveStatus(
        updated.id,
        editStatus === 'approved' ? 'approved' : 'rejected',
        updated.approvedBy || 'HR',
        editRemark || editReason
      );
    }

    setEditingLeave(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`คุณต้องการลบรายการขอลาของ "${name}" ใช่หรือไม่?`)) {
      if (onDeleteLeaveRequest) {
        onDeleteLeaveRequest(id);
      }
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const visibleRequests = isAdminView
    ? leaveRequests
    : leaveRequests.filter(
        (l) => l.employeeId === currentEmployee.id || l.employeeName === currentEmployee.name
      );

  const filteredLeaveRequests = visibleRequests.filter((l) => {
    const matchesSearch =
      l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingList = visibleRequests.filter((l) => l.status === 'pending');

  const leaveBalances = currentEmployee.leaveBalance;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            จัดการวันลา & อนุมัติวันลา (Leave Management)
          </h2>
          <p className="text-xs text-slate-500">
            ยื่นใบลาออนไลน์, ตรวจสอบสิทธิ์วันลาคงเหลือ และอนุมัติวันลาพนักงาน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportLeavesToExcel(leaveRequests)}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-800 font-bold text-xs rounded-xl shadow-xs hover:bg-slate-50 transition inline-flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            ส่งออก Excel
          </button>

          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            ยื่นใบลาใหม่
          </button>
        </div>
      </div>

      {/* Leave Quota Cards for Current Employee */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Annual Leave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-700">ลาพักร้อน (Annual Leave)</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              คงเหลือ {leaveBalances.annual.total - leaveBalances.annual.used} วัน
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${(leaveBalances.annual.used / leaveBalances.annual.total) * 100}%`
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            ใช้ไปแล้ว {leaveBalances.annual.used} วัน จากทั้งหมด {leaveBalances.annual.total} วัน/ปี
          </p>
        </div>

        {/* Sick Leave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-700">ลาป่วย (Sick Leave)</span>
            <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
              คงเหลือ {leaveBalances.sick.total - leaveBalances.sick.used} วัน
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${(leaveBalances.sick.used / leaveBalances.sick.total) * 100}%`
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            ใช้ไปแล้ว {leaveBalances.sick.used} วัน จากทั้งหมด {leaveBalances.sick.total} วัน/ปี
          </p>
        </div>

        {/* Personal Leave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-700">ลากิจ (Personal Leave)</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              คงเหลือ {leaveBalances.personal.total - leaveBalances.personal.used} วัน
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${(leaveBalances.personal.used / leaveBalances.personal.total) * 100}%`
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            ใช้ไปแล้ว {leaveBalances.personal.used} วัน จากทั้งหมด {leaveBalances.personal.total} วัน/ปี
          </p>
        </div>

      </div>

      {/* Pending Leave Approval Center (HR / Manager View) */}
      {pendingList.length > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
              <h3 className="font-extrabold text-slate-900 text-base">
                {isAdminView ? `รายการยื่นใบลา รออนุมัติ (${pendingList.length} คำขอ)` : `รายการยื่นใบลาของคุณ รอการอนุมัติ (${pendingList.length} คำขอ)`}
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-700">
              {isAdminView ? 'คุณสามารถกดอนุมัติหรือปฏิเสธได้ทันที' : 'รอผู้จัดการพิจารณา'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {pendingList.map((req) => (
              <div key={req.id} className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs flex flex-col justify-between h-full space-y-3">
                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{req.employeeName}</span>
                      <span className="text-xs text-slate-500 block">{req.department}</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-md shrink-0">
                      {req.leaveType === 'annual'
                        ? 'ลาพักร้อน'
                        : req.leaveType === 'sick'
                        ? 'ลาป่วย'
                        : 'ลากิจ'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 flex-1 flex flex-col justify-center min-h-[76px]">
                    <div>
                      <span className="font-semibold text-slate-800">ช่วงวันที่:</span> {req.startDate} ถึง {req.endDate} ({req.daysCount} วัน)
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">เหตุผล:</span> "{req.reason}"
                    </div>
                    {req.attachmentUrl && (
                      <div className="text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                        <Paperclip className="w-3.5 h-3.5 shrink-0" /> มีแนบเอกสารใบรับรองแพทย์
                      </div>
                    )}
                  </div>
                </div>

                {isAdminView && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100/80 mt-auto">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateLeaveStatus(req.id, 'approved', `${currentEmployee.name} (HR)`)
                      }
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition inline-flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> อนุมัติการลา
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(req)}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition inline-flex items-center justify-center gap-1 cursor-pointer shrink-0"
                      title="แก้ไขข้อมูลคำขอนี้"
                    >
                      <Pencil className="w-3.5 h-3.5" /> แก้ไข
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateLeaveStatus(req.id, 'rejected', `${currentEmployee.name} (HR)`, 'ไม่อนุมัติเนื่องจากซ้อนกะงานสำคัญ')
                      }
                      className="flex-1 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-lg transition inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> ปฏิเสธคำขอ
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>{isAdminView ? 'ประวัติคำขอลางานทั้งหมด (All Employees)' : 'ประวัติคำขอลางานของคุณ'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              แสดงรายการคำขอลางาน สามารถกดปุ่ม <strong className="text-emerald-700 font-bold">"แก้ไข"</strong> เพื่อปรับเปลี่ยนข้อมูลหรือสถานะ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsTableCollapsed(!isTableCollapsed)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title={isTableCollapsed ? 'โชว์การแสดงผลตาราง' : 'ย่อการแสดงผลตาราง'}
            >
              {isTableCollapsed ? (
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

            <div className="relative flex-1 sm:w-52">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, เหตุผล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="ALL">ทุกสถานะ (All)</option>
              <option value="pending">รออนุมัติ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="rejected">ปฏิเสธ</option>
            </select>
          </div>
        </div>

        {isTableCollapsed ? (
          <div className="p-4 bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs font-semibold">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              ย่อการแสดงผลตารางคำขอลางานไว้ ({filteredLeaveRequests.length} รายการ)
            </span>
            <button
              type="button"
              onClick={() => setIsTableCollapsed(false)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
            >
              <span>โชว์ตารางคำขอลางาน</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 pl-4 whitespace-nowrap">พนักงาน</th>
                <th className="py-2.5 px-3 whitespace-nowrap">ประเภทการลา</th>
                <th className="py-2.5 px-3 whitespace-nowrap">วันที่ลา</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">จำนวนวัน</th>
                <th className="py-2.5 px-3 whitespace-nowrap">เหตุผล</th>
                <th className="py-2.5 px-3 whitespace-nowrap">หมายเหตุ</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">สถานะ</th>
                <th className="py-2.5 px-3 whitespace-nowrap">ผู้อนุมัติ</th>
                <th className="py-2.5 px-3 text-center bg-emerald-50/80 text-emerald-900 border-l border-emerald-200/80 whitespace-nowrap font-extrabold">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
              {filteredLeaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    ไม่พบรายการคำขอลางานที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredLeaveRequests.map((l) => {
                  const deptDisplay = l.department.includes('(') ? l.department : `(${l.department})`;
                  return (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 pl-4 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{l.employeeName}</span>
                        <span className="text-[11px] text-slate-400 font-normal">{deptDisplay}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[11px] font-bold rounded-md border border-slate-200">
                        {l.leaveType === 'annual'
                          ? 'ลาพักร้อน'
                          : l.leaveType === 'sick'
                          ? 'ลาป่วย'
                          : l.leaveType === 'personal'
                          ? 'ลากิจ'
                          : 'ลาไม่รับค่าจ้าง'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 text-[11px] whitespace-nowrap">
                      {l.startDate} ถึง {l.endDate}
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-slate-900 bg-slate-50/50 whitespace-nowrap">
                      {l.daysCount} วัน
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap" title={l.reason}>
                      {l.reason}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap" title={l.remark || l.rejectReason || '-'}>
                      {l.remark || l.rejectReason ? (
                        <span className="text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {l.remark || l.rejectReason}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                          l.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : l.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {l.status === 'approved'
                          ? 'อนุมัติแล้ว'
                          : l.status === 'pending'
                          ? 'รออนุมัติ'
                          : 'ปฏิเสธ'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-500 whitespace-nowrap">{l.approvedBy || '-'}</td>
                    <td className="py-2.5 px-3 text-center bg-emerald-50/30 border-l border-emerald-100 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(l)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                          title="แก้ไขข้อมูลวันลา"
                        >
                          <Pencil className="w-3 h-3 text-emerald-100" />
                          <span>แก้ไข</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(l.id, l.employeeName)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                          title="ลบรายการนี้"
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
        )}
      </div>

      {/* New Leave Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">ยื่นใบลาใหม่ (Leave Request)</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ผู้ยื่นคำขอ:</label>
                <input
                  type="text"
                  disabled
                  value={`${currentEmployee.name} (${currentEmployee.department})`}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ประเภทการลา:</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="annual">ลาพักร้อน (Annual Leave)</option>
                  <option value="sick">ลาป่วย (Sick Leave)</option>
                  <option value="personal">ลากิจ (Personal Leave)</option>
                  <option value="maternity">ลาคลอด (Maternity Leave)</option>
                  <option value="unpaid">ลาไม่รับค่าจ้าง (Unpaid Leave)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">วันที่เริ่มลา:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">วันที่สิ้นสุด:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">จำนวนวันลา:</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={daysCount}
                  onChange={(e) => setDaysCount(parseFloat(e.target.value) || 1)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">เหตุผลการขอลา:</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="เช่น ทำธุระส่วนตัวต่างจังหวัด / ตรวจสุขภาพประจำปี..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">หมายเหตุเพิ่มเติม (ถ้ามี):</label>
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                <Paperclip className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <span className="text-[11px] text-slate-500 block font-medium">
                  คลิกเพื่อแนบเอกสาร / ใบรับรองแพทย์ (ถ้ามี)
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm"
                >
                  ส่งคำขอลางาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Leave Request Modal */}
      {editingLeave && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">แก้ไขข้อมูลใบลา ({editingLeave.employeeName})</h3>
              </div>
              <button
                onClick={() => setEditingLeave(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">พนักงาน:</label>
                <input
                  type="text"
                  disabled
                  value={`${editingLeave.employeeName} (${editingLeave.department})`}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ประเภทการลา:</label>
                <select
                  value={editLeaveType}
                  onChange={(e) => setEditLeaveType(e.target.value as LeaveType)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="annual">ลาพักร้อน (Annual Leave)</option>
                  <option value="sick">ลาป่วย (Sick Leave)</option>
                  <option value="personal">ลากิจ (Personal Leave)</option>
                  <option value="maternity">ลาคลอด (Maternity Leave)</option>
                  <option value="unpaid">ลาไม่รับค่าจ้าง (Unpaid Leave)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">วันที่เริ่มลา:</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">วันที่สิ้นสุด:</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">จำนวนวันลา:</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={editDaysCount}
                  onChange={(e) => setEditDaysCount(parseFloat(e.target.value) || 1)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">เหตุผลการลา:</label>
                <textarea
                  rows={3}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">สถานะการอนุมัติ:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as LeaveStatus)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-emerald-50/50"
                >
                  <option value="pending">รออนุมัติ (Pending)</option>
                  <option value="approved">อนุมัติแล้ว (Approved)</option>
                  <option value="rejected">ปฏิเสธคำขอ (Rejected)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">หมายเหตุ / หมายเหตุจาก HR (Remarks):</label>
                <textarea
                  rows={2}
                  value={editRemark}
                  onChange={(e) => setEditRemark(e.target.value)}
                  placeholder="ระบุหมายเหตุเพิ่มเติม เช่น เหตุผลการอนุมัติ/ปฏิเสธ หรือหมายเหตุ HR..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {editStatus !== 'pending' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ผู้อนุมัติ / HR ผู้ดูแล:</label>
                  <input
                    type="text"
                    value={editApprovedBy}
                    onChange={(e) => setEditApprovedBy(e.target.value)}
                    placeholder="ระบุชื่อผู้อนุมัติ"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLeave(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Pencil className="w-4 h-4" />
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
