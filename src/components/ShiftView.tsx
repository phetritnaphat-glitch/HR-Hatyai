import React, { useState } from 'react';
import { Employee, Shift } from '../types';
import { CalendarDays, Clock, Plus, Users, Sparkles, CheckCircle } from 'lucide-react';

interface ShiftViewProps {
  currentEmployee: Employee;
  employees: Employee[];
  shifts: Shift[];
  onUpdateShift: (shift: Shift) => void;
  isAdminView: boolean;
}

export const ShiftView: React.FC<ShiftViewProps> = ({
  currentEmployee,
  employees,
  shifts,
  onUpdateShift,
  isAdminView
}) => {
  const visibleEmployees = isAdminView
    ? employees
    : employees.filter((e) => e.id === currentEmployee.id);
  const daysOfWeek = [
    { date: '2026-07-27', label: 'จันทร์ 27' },
    { date: '2026-07-28', label: 'อังคาร 28' },
    { date: '2026-07-29', label: 'พุธ 29' },
    { date: '2026-07-30', label: 'พฤหัส 30' },
    { date: '2026-07-31', label: 'ศุกร์ 31' },
    { date: '2026-08-01', label: 'เสาร์ 01' },
    { date: '2026-08-02', label: 'อาทิตย์ 02' }
  ];

  const shiftPresets = [
    { type: 'normal', name: 'กะปกติ', time: '08:30 - 17:30', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { type: 'morning', name: 'กะเช้า', time: '08:00 - 17:00', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    { type: 'evening', name: 'กะบ่าย', time: '13:00 - 22:00', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { type: 'off', name: 'วันหยุด', time: 'OFF', color: 'bg-slate-100 text-slate-500 border-slate-200' }
  ];

  const [selectedShiftEdit, setSelectedShiftEdit] = useState<{
    employeeId: string;
    employeeName: string;
    date: string;
    currentType: string;
  } | null>(null);

  const getShiftForEmpDate = (empId: string, date: string) => {
    return shifts.find((s) => s.employeeId === empId && s.date === date);
  };

  const handleSaveShiftType = (type: 'normal' | 'morning' | 'evening' | 'off') => {
    if (!selectedShiftEdit) return;
    const preset = shiftPresets.find((p) => p.type === type);
    const newShift: Shift = {
      id: `SH-${selectedShiftEdit.employeeId}-${selectedShiftEdit.date}`,
      employeeId: selectedShiftEdit.employeeId,
      date: selectedShiftEdit.date,
      shiftType: type,
      shiftName: preset?.name || 'กะปกติ',
      startTime: preset?.type === 'off' ? '-' : preset?.time.split(' - ')[0] || '08:30',
      endTime: preset?.type === 'off' ? '-' : preset?.time.split(' - ')[1] || '17:30'
    };

    onUpdateShift(newShift);
    setSelectedShiftEdit(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            จัดกะการทำงาน & ตารางเวลา (Shift & Roster Planning)
          </h2>
          <p className="text-xs text-slate-500">
            วางแผนจัดกะการทำงานประจำสัปดาห์ สำหรับพนักงานเข้าเวรและพนักงานไฮบริด
          </p>
        </div>

        <div className="flex items-center gap-2">
          {shiftPresets.map((p) => (
            <span
              key={p.type}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${p.color}`}
            >
              {p.name}: {p.time}
            </span>
          ))}
        </div>
      </div>

      {/* Roster Calendar Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                <th className="p-3.5 min-w-[180px]">พนักงาน / แผนก</th>
                {daysOfWeek.map((day) => (
                  <th key={day.date} className="p-3.5 text-center min-w-[120px]">
                    <div>{day.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">กะทำงาน</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                  {/* Employee name & info */}
                  <td className="p-3.5 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[11px] text-slate-500">{emp.department}</div>
                      </div>
                    </div>
                  </td>

                  {/* Days */}
                  {daysOfWeek.map((day) => {
                    const shift = getShiftForEmpDate(emp.id, day.date);
                    const shiftType = shift?.shiftType || 'normal';
                    const preset = shiftPresets.find((p) => p.type === shiftType) || shiftPresets[0];

                    return (
                      <td
                        key={day.date}
                        onClick={() =>
                          isAdminView &&
                          setSelectedShiftEdit({
                            employeeId: emp.id,
                            employeeName: emp.name,
                            date: day.date,
                            currentType: shiftType
                          })
                        }
                        className={`p-2.5 text-center cursor-pointer transition relative group hover:ring-2 hover:ring-emerald-500 rounded-lg ${
                          isAdminView ? 'hover:bg-emerald-50' : ''
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 ${preset.color}`}
                        >
                          <span>{shift?.shiftName || preset.name}</span>
                          <span className="text-[10px] font-mono opacity-80">{preset.time}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Shift Modal */}
      {selectedShiftEdit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              เลือกกะการทำงานสำหรับ {selectedShiftEdit.employeeName}
            </h3>
            <p className="text-xs text-slate-500">วันที่: {selectedShiftEdit.date}</p>

            <div className="space-y-2">
              {shiftPresets.map((preset) => (
                <button
                  key={preset.type}
                  onClick={() =>
                    handleSaveShiftType(preset.type as 'normal' | 'morning' | 'evening' | 'off')
                  }
                  className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition ${preset.color} hover:brightness-95`}
                >
                  <div>
                    <div className="font-bold">{preset.name}</div>
                    <div className="text-xs opacity-80">{preset.time}</div>
                  </div>
                  <CheckCircle className="w-4 h-4 opacity-70" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedShiftEdit(null)}
              className="w-full py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
