import React, { useState } from 'react';
import { Employee, AttendanceRecord, WorkplaceLocation } from '../types';
import {
  MapPin,
  Camera,
  Smartphone,
  CheckCircle2,
  Clock,
  ClipboardList,
  Search,
  Filter,
  Navigation,
  Sparkles,
  RefreshCw,
  LogIn,
  LogOut,
  UserCheck,
  Settings,
  Edit3,
  Trash2,
  Plus,
  X,
  ShieldCheck,
  Check,
  Building2,
  Sliders,
  Globe,
  Compass,
  Radio,
  Map,
  CheckSquare,
  Briefcase,
  ChevronDown,
  SlidersHorizontal,
  Maximize2,
  ExternalLink,
  Layers
} from 'lucide-react';

interface CheckInViewProps {
  currentEmployee: Employee;
  attendanceRecords: AttendanceRecord[];
  onAddAttendance: (newRecord: AttendanceRecord) => void;
  onDeleteAttendance?: (id: string) => void;
  onUpdateAttendanceRecord?: (record: AttendanceRecord) => void;
  isAdminView?: boolean;
  employees?: Employee[];
  initialViewTab?: 'checkin' | 'history';
}

export const CheckInView: React.FC<CheckInViewProps> = ({
  currentEmployee,
  attendanceRecords,
  onAddAttendance,
  onDeleteAttendance,
  onUpdateAttendanceRecord,
  isAdminView = false,
  employees = [],
  initialViewTab = 'checkin'
}) => {
  const [viewTab, setViewTab] = useState<'checkin' | 'history'>(initialViewTab);

  React.useEffect(() => {
    setViewTab(initialViewTab);
  }, [initialViewTab]);

  const [activeMode, setActiveMode] = useState<'GPS' | 'FaceScan'>('GPS');
  const [note, setNote] = useState('');
  const [workSite, setWorkSite] = useState<'office' | 'field' | 'wfh'>('office');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [simulatedDistance, setSimulatedDistance] = useState(28); // meters from selected location
  const [scanningFace, setScanningFace] = useState(false);

  // Search & Filter state for Attendance Log Table
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // --- HR & Admin Workplace Locations State ---
  const [locations, setLocations] = useState<WorkplaceLocation[]>([
    {
      id: 'LOC-HQ',
      name: 'สำนักงานใหญ่ (อาคารสีลมคอมเพล็กซ์)',
      address: '191 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพมหานคร 10500',
      coords: { lat: 13.7282, lng: 100.5351 },
      allowedRadiusMeters: 100,
      isActive: true,
      isDefault: true,
      wifiBssid: 'HQ_Corporate_WiFi_5G'
    },
    {
      id: 'LOC-RAMA9',
      name: 'สาขาพระราม 9 (อาคาร G Tower ชั้น 12)',
      address: '9 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310',
      coords: { lat: 13.7570, lng: 100.5658 },
      allowedRadiusMeters: 150,
      isActive: true,
      isDefault: false,
      wifiBssid: 'Rama9_Office_WiFi'
    },
    {
      id: 'LOC-BANGNA',
      name: 'ศูนย์กระจายสินค้า บางนา-ตราด กม.19',
      address: '88/9 หมู่ 4 ต.บางฉลอง อ.บางพลี จ.สมุทรปราการ 10540',
      coords: { lat: 13.6234, lng: 100.7012 },
      allowedRadiusMeters: 200,
      isActive: true,
      isDefault: false
    },
    {
      id: 'LOC-PHUKET',
      name: 'ไซต์งานโครงการภูเก็ต (เมืองภูเก็ต)',
      address: '12/5 ถนนวิชิตสงคราม ต.ตลาดใหญ่ อ.เมือง จ.ภูเก็ต 83000',
      coords: { lat: 7.8920, lng: 98.3680 },
      allowedRadiusMeters: 300,
      isActive: true,
      isDefault: false
    }
  ]);

  // Selected Location for current Check-In
  const [selectedLocationId, setSelectedLocationId] = useState<string>('LOC-HQ');
  const [showFullMapModal, setShowFullMapModal] = useState(false);

  // --- HR & Admin Configuration Settings State ---
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'locations' | 'workHours'>('locations');
  const [showOperationsMenu, setShowOperationsMenu] = useState(false);

  const [settings, setSettings] = useState({
    workStartTime: '08:30',
    workEndTime: '17:30',
    gracePeriodMinutes: 15,
    allowFieldCheckIn: true,
    allowWFHCheckIn: true,
    otRateMultiplier: 1.5
  });

  // Location Form State (Add / Edit Location in Modal)
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<WorkplaceLocation | null>(null);
  const [locFormName, setLocFormName] = useState('');
  const [locFormAddress, setLocFormAddress] = useState('');
  const [locFormLat, setLocFormLat] = useState('13.7282');
  const [locFormLng, setLocFormLng] = useState('100.5351');
  const [locFormRadius, setLocFormRadius] = useState(100);
  const [locFormIsActive, setLocFormIsActive] = useState(true);
  const [locFormIsDefault, setLocFormIsDefault] = useState(false);
  const [locFormWifi, setLocFormWifi] = useState('');

  // --- Manual Edit / Add Attendance Record Modal State ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isNewManualEntry, setIsNewManualEntry] = useState(false);

  // Form fields for editing/adding attendance
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formDate, setFormDate] = useState('2026-07-27');
  const [formCheckIn, setFormCheckIn] = useState('08:30');
  const [formCheckOut, setFormCheckOut] = useState('17:30');
  const [formStatus, setFormStatus] = useState<'present' | 'late' | 'leave' | 'absent'>('present');
  const [formLateMinutes, setFormLateMinutes] = useState(0);
  const [formOtHours, setFormOtHours] = useState(0);
  const [formMethod, setFormMethod] = useState<'GPS' | 'FaceScan' | 'Manual HR'>('Manual HR');
  const [formLocation, setFormLocation] = useState('สำนักงานใหญ่ (HR บันทึกย้อนหลัง)');
  const [formNote, setFormNote] = useState('');

  const todayStr = '2026-07-27';

  // Selected Active Location details
  const activeLocation =
    locations.find((l) => l.id === selectedLocationId && l.isActive) ||
    locations.find((l) => l.isDefault) ||
    locations[0];

  // Find today's record for current employee
  const todayRecord = attendanceRecords.find(
    (a) => a.employeeId === currentEmployee.id && a.date === todayStr
  );

  // GPS Check-In / Check-Out
  const handleSimulateGPSCheckIn = (type: 'checkIn' | 'checkOut') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    
    // Check late based on configured workStartTime + gracePeriod
    const [startH, startM] = settings.workStartTime.split(':').map(Number);
    const deadlineMinutes = startH * 60 + startM + settings.gracePeriodMinutes;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isLate = type === 'checkIn' && currentMinutes > deadlineMinutes;
    const calcLateMin = isLate ? currentMinutes - (startH * 60 + startM) : 0;

    const locText =
      workSite === 'office'
        ? activeLocation.name
        : workSite === 'field'
        ? 'ออกพบลูกค้านอกสถานที่ (GPS Verified)'
        : 'ทำงานจากที่บ้าน Work from Home (WFH)';

    const newRecord: AttendanceRecord = {
      id: todayRecord?.id || `ATT-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      department: currentEmployee.department,
      date: todayStr,
      checkInTime: type === 'checkIn' ? timeStr : (todayRecord?.checkInTime || '08:25'),
      checkOutTime: type === 'checkOut' ? timeStr : (todayRecord?.checkOutTime || null),
      status: isLate ? 'late' : (todayRecord?.status || 'present'),
      checkInMethod: 'GPS',
      locationName: locText,
      coords: activeLocation.coords,
      otHours: type === 'checkOut' ? 1.5 : (todayRecord?.otHours || 0),
      lateMinutes: calcLateMin || (todayRecord?.lateMinutes || 0),
      note: note || (type === 'checkIn' ? `ลงเวลาเข้างาน ณ ${locText}` : `ลงเวลาออกงาน ณ ${locText}`)
    };

    onAddAttendance(newRecord);
    setActionSuccessMsg(
      type === 'checkIn'
        ? `บันทึกเวลาเข้างานสำเร็จเวลา ${timeStr} น. ณ ${locText}`
        : `บันทึกเวลาออกงานสำเร็จเวลา ${timeStr} น. ณ ${locText}`
    );
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // FaceScan Check-In / Check-Out
  const handleSimulateFaceScan = (type: 'checkIn' | 'checkOut') => {
    setScanningFace(true);
    setTimeout(() => {
      setScanningFace(false);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

      const newRecord: AttendanceRecord = {
        id: todayRecord?.id || `ATT-${Date.now()}`,
        employeeId: currentEmployee.id,
        employeeName: currentEmployee.name,
        department: currentEmployee.department,
        date: todayStr,
        checkInTime: type === 'checkIn' ? timeStr : (todayRecord?.checkInTime || '08:25'),
        checkOutTime: type === 'checkOut' ? timeStr : (todayRecord?.checkOutTime || null),
        status: todayRecord?.status || 'present',
        checkInMethod: 'FaceScan',
        locationName: `ประตูสแกนหน้า ${activeLocation.name}`,
        otHours: type === 'checkOut' ? 1.5 : (todayRecord?.otHours || 0),
        lateMinutes: 0,
        note: type === 'checkIn' ? 'สแกนใบหน้าเข้างานสำเร็จ' : 'สแกนใบหน้าออกงานสำเร็จ'
      };

      onAddAttendance(newRecord);
      setActionSuccessMsg(
        type === 'checkIn'
          ? `สแกนใบหน้าเข้างานสำเร็จเวลา ${timeStr} น.`
          : `สแกนใบหน้าออกงานสำเร็จเวลา ${timeStr} น.`
      );
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }, 1500);
  };

  // Open Edit Location Form
  const handleOpenEditLocation = (loc: WorkplaceLocation) => {
    setEditingLocation(loc);
    setLocFormName(loc.name);
    setLocFormAddress(loc.address);
    setLocFormLat(loc.coords.lat.toString());
    setLocFormLng(loc.coords.lng.toString());
    setLocFormRadius(loc.allowedRadiusMeters);
    setLocFormIsActive(loc.isActive);
    setLocFormIsDefault(!!loc.isDefault);
    setLocFormWifi(loc.wifiBssid || '');
    setShowLocationForm(true);
  };

  // Open Add Location Form
  const handleOpenAddLocation = () => {
    setEditingLocation(null);
    setLocFormName('');
    setLocFormAddress('');
    setLocFormLat('13.7500');
    setLocFormLng('100.5500');
    setLocFormRadius(100);
    setLocFormIsActive(true);
    setLocFormIsDefault(locations.length === 0);
    setLocFormWifi('');
    setShowLocationForm(true);
  };

  // Save Location (Add/Edit)
  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locFormName.trim()) return;

    const latNum = parseFloat(locFormLat) || 13.7282;
    const lngNum = parseFloat(locFormLng) || 100.5351;

    let updatedList = [...locations];

    if (locFormIsDefault) {
      updatedList = updatedList.map((l) => ({ ...l, isDefault: false }));
    }

    if (editingLocation) {
      updatedList = updatedList.map((l) =>
        l.id === editingLocation.id
          ? {
              ...l,
              name: locFormName,
              address: locFormAddress,
              coords: { lat: latNum, lng: lngNum },
              allowedRadiusMeters: locFormRadius,
              isActive: locFormIsActive,
              isDefault: locFormIsDefault,
              wifiBssid: locFormWifi || undefined
            }
          : l
      );
      setActionSuccessMsg(`อัปเดตข้อมูลสถานที่ "${locFormName}" สำเร็จ`);
    } else {
      const newLoc: WorkplaceLocation = {
        id: `LOC-${Date.now()}`,
        name: locFormName,
        address: locFormAddress,
        coords: { lat: latNum, lng: lngNum },
        allowedRadiusMeters: locFormRadius,
        isActive: locFormIsActive,
        isDefault: locFormIsDefault,
        wifiBssid: locFormWifi || undefined
      };
      updatedList.push(newLoc);
      setActionSuccessMsg(`เพิ่มสถานที่ปฏิบัติงานใหม่ "${locFormName}" สำเร็จ`);
    }

    setLocations(updatedList);
    setShowLocationForm(false);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Delete Location
  const handleDeleteLocation = (id: string, name: string) => {
    if (locations.length <= 1) {
      alert('ต้องมีสถานที่ปฏิบัติงานหลักอย่างน้อย 1 แห่งในระบบ');
      return;
    }
    if (confirm(`คุณต้องการลบสถานที่ "${name}" ใช่หรือไม่?`)) {
      setLocations(locations.filter((l) => l.id !== id));
      setActionSuccessMsg(`ลบสถานที่ปฏิบัติงาน "${name}" เรียบร้อยแล้ว`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    }
  };

  // Fetch Current GPS Coordinates automatically
  const handleFetchCurrentGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocFormLat(position.coords.latitude.toFixed(6));
          setLocFormLng(position.coords.longitude.toFixed(6));
        },
        () => {
          // Fallback simulation
          setLocFormLat('13.7282');
          setLocFormLng('100.5351');
        }
      );
    } else {
      setLocFormLat('13.7282');
      setLocFormLng('100.5351');
    }
  };

  // Open Edit Attendance Modal for existing record
  const handleOpenEditModal = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setIsNewManualEntry(false);
    setFormEmployeeId(record.employeeId);
    setFormDate(record.date);
    setFormCheckIn(record.checkInTime || '08:30');
    setFormCheckOut(record.checkOutTime || '17:30');
    setFormStatus(record.status);
    setFormLateMinutes(record.lateMinutes || 0);
    setFormOtHours(record.otHours || 0);
    setFormMethod(record.checkInMethod || 'Manual HR');
    setFormLocation(record.locationName || 'สำนักงานใหญ่');
    setFormNote(record.note || '');
    setShowEditModal(true);
  };

  // Open Add Attendance Modal for new manual entry
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsNewManualEntry(true);
    const defaultEmp = employees[0] || currentEmployee;
    setFormEmployeeId(defaultEmp.id);
    setFormDate(todayStr);
    setFormCheckIn('08:30');
    setFormCheckOut('17:30');
    setFormStatus('present');
    setFormLateMinutes(0);
    setFormOtHours(0);
    setFormMethod('Manual HR');
    setFormLocation('แก้ไขลงเวลาย้อนหลังโดย HR/Admin');
    setFormNote('HR ลงเวลาแทนพนักงาน');
    setShowEditModal(true);
  };

  // Save Edit / New Entry Attendance Record
  const handleSaveAttendanceForm = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = employees.find((e) => e.id === formEmployeeId) || currentEmployee;

    const updatedRec: AttendanceRecord = {
      id: editingRecord?.id || `ATT-MANUAL-${Date.now()}`,
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      department: targetEmp.department,
      date: formDate,
      checkInTime: formCheckIn || null,
      checkOutTime: formCheckOut || null,
      status: formStatus,
      checkInMethod: formMethod,
      locationName: formLocation,
      otHours: Number(formOtHours) || 0,
      lateMinutes: Number(formLateMinutes) || 0,
      note: formNote
    };

    if (isNewManualEntry) {
      onAddAttendance(updatedRec);
      setActionSuccessMsg(`เพิ่มประวัติลงเวลาสำหรับ ${targetEmp.name} เรียบร้อยแล้ว`);
    } else if (onUpdateAttendanceRecord) {
      onUpdateAttendanceRecord(updatedRec);
      setActionSuccessMsg(`อัปเดตประวัติลงเวลาของ ${targetEmp.name} เรียบร้อยแล้ว`);
    }

    setShowEditModal(false);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleDeleteRecord = (id: string, empName: string) => {
    if (confirm(`คุณต้องการลบประวัติลงเวลานี้ของ ${empName} ใช่หรือไม่?`)) {
      if (onDeleteAttendance) {
        onDeleteAttendance(id);
        setActionSuccessMsg(`ลบรายการลงเวลาเรียบร้อยแล้ว`);
        setTimeout(() => setActionSuccessMsg(null), 3000);
      }
    }
  };

  // Filtered records based on role visibility
  const visibleRecords = isAdminView
    ? attendanceRecords
    : attendanceRecords.filter(
        (rec) => rec.employeeId === currentEmployee.id || rec.employeeName === currentEmployee.name
      );

  const filteredRecords = visibleRecords.filter((rec) => {
    const matchesSearch =
      rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.locationName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || rec.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-1.5 animate-in fade-in duration-200">
      
      {/* Title Header with Tabs & HR/Admin Action Buttons combined in 1 row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1.5 pb-1 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            ระบบบันทึกเวลาเข้า-ออกงาน
          </h2>
          {isAdminView && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold border border-emerald-300">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>HR Config</span>
            </span>
          )}

          {/* View Switcher Tabs embedded inline */}
          <div className="inline-flex items-center gap-1 p-0.5 bg-slate-200/90 rounded-lg border border-slate-300/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewTab('checkin')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                viewTab === 'checkin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300/50'
              }`}
            >
              <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>ลงเวลาวันนี้</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab('history')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                viewTab === 'history'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300/50'
              }`}
            >
              <ClipboardList className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>ประวัติการลงเวลา</span>
            </button>
          </div>
        </div>

        {/* Operations Dropdown Button (HR/Admin Tools) */}
        {isAdminView && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOperationsMenu(!showOperationsMenu)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>เครื่องมือ HR / จัดการ</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showOperationsMenu && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsTab('locations');
                    setShowSettingsModal(true);
                    setShowOperationsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 transition flex items-center gap-2 text-xs font-bold cursor-pointer group"
                >
                  <div className="p-1 bg-emerald-100 text-emerald-700 rounded-md group-hover:bg-emerald-600 group-hover:text-white transition shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="leading-tight">ตั้งค่าสถานที่ทำงาน ({locations.length} สาขา)</div>
                    <div className="text-[9px] font-normal text-slate-500">พิกัด GPS & Geofence</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSettingsTab('workHours');
                    setShowSettingsModal(true);
                    setShowOperationsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-800 transition flex items-center gap-2 text-xs font-bold cursor-pointer group"
                >
                  <div className="p-1 bg-slate-100 text-slate-700 rounded-md group-hover:bg-slate-900 group-hover:text-white transition shrink-0">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="leading-tight">ตั้งค่ากฎลงเวลา</div>
                    <div className="text-[9px] font-normal text-slate-500">เวลาเข้า-ออก และนาทีสายอนุโลม</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleOpenAddModal();
                    setShowOperationsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-800 transition flex items-center gap-2 text-xs font-bold cursor-pointer group"
                >
                  <div className="p-1 bg-slate-100 text-slate-700 rounded-md group-hover:bg-slate-900 group-hover:text-white transition shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="leading-tight">ลงเวลาแทนพนักงาน</div>
                    <div className="text-[9px] font-normal text-slate-500">บันทึกหรือปรับแก้ประวัติย้อนหลัง</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {viewTab === 'checkin' && (
        <>
          {/* Today's Personal Status Card */}
          <div className="bg-slate-900 text-white p-2 sm:p-2.5 rounded-xl shadow-xs border border-slate-800 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <img
                    src={currentEmployee.avatar}
                    alt={currentEmployee.name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-emerald-400/80 object-cover shadow-2xs"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full" />
                </div>
                <div className="space-y-0">
                  <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    <span>{currentEmployee.name} ({currentEmployee.code})</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-white tracking-tight">
                    สถานะลงเวลาวันนี้ <span className="text-emerald-400 font-mono text-xs">(27 ก.ค. 2026)</span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Check-In Card */}
                <div className="flex-1 sm:flex-initial p-2 px-3 rounded-lg bg-slate-800/90 border border-emerald-500/30 flex items-center gap-2 shadow-inner">
                  <LogIn className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold leading-none">เข้างาน</span>
                    <span className="text-xs font-black font-mono text-emerald-300">
                      {todayRecord?.checkInTime ? `${todayRecord.checkInTime} น.` : 'ยังไม่ลงเวลา'}
                    </span>
                  </div>
                </div>

                {/* Check-Out Card */}
                <div className="flex-1 sm:flex-initial p-2 px-3 rounded-lg bg-slate-800/90 border border-rose-500/30 flex items-center gap-2 shadow-inner">
                  <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold leading-none">ออกงาน</span>
                    <span className="text-xs font-black font-mono text-rose-300">
                      {todayRecord?.checkOutTime ? `${todayRecord.checkOutTime} น.` : 'ยังไม่ลงเวลา'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Check-In/Out Interactive Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            
            {/* Method Selector Tabs */}
            <div className="bg-slate-900 text-white px-3 py-1.5 flex flex-row justify-between items-center gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveMode('GPS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeMode === 'GPS'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>เช็คอินด้วย GPS พิกัด</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode('FaceScan')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeMode === 'FaceScan'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>สแกนใบหน้า</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                {currentEmployee.department} • {currentEmployee.position}
              </span>
            </div>

            {/* Action Area */}
            <div className="p-3 sm:p-3.5">
              {actionSuccessMsg && (
                <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-xs">{actionSuccessMsg}</div>
                  </div>
                </div>
              )}

              {activeMode === 'GPS' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                  
                  {/* GPS Location Details & Location Selection (Left Column) */}
                  <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-3 h-full">
                    <div className="space-y-3">
                      {/* Office Location Selector */}
                      {workSite === 'office' && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-slate-900 font-extrabold">
                              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                              เลือกสถานที่ / สาขาปฏิบัติงาน:
                            </span>
                            {isAdminView && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSettingsTab('locations');
                                  setShowSettingsModal(true);
                                }}
                                className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                              >
                                + จัดการพิกัดสาขา (HR)
                              </button>
                            )}
                          </label>

                          <select
                            value={selectedLocationId}
                            onChange={(e) => setSelectedLocationId(e.target.value)}
                            className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                          >
                            {locations
                              .filter((l) => l.isActive)
                              .map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                  🏢 {loc.name} {loc.isDefault ? '(สาขาหลัก)' : ''} — รัศมี {loc.allowedRadiusMeters}m
                                </option>
                              ))}
                          </select>
                        </div>
                      )}

                      {/* GPS Map & Location Interactive Card */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
                        {/* Map Header & Controls */}
                        <div className="p-2.5 bg-slate-900 text-white flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-md shrink-0">
                              <Navigation className="w-3.5 h-3.5 animate-pulse" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-black text-white flex items-center gap-1.5 truncate">
                                <span>แผนที่พิกัด GPS ประจำจุดเช็คอิน</span>
                                <span className="text-[8px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded-full uppercase shrink-0">Live Map</span>
                              </div>
                              <p className="text-[9px] text-slate-400 font-mono truncate">
                                GPS: {activeLocation.coords.lat}° N, {activeLocation.coords.lng}° E
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSimulatedDistance(Math.floor(Math.random() * 40) + 10)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-slate-700"
                              title="รีเฟรชระยะทาง"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span className="hidden sm:inline">รีเฟรช</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowFullMapModal(true)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                              title="ขยายแผนที่ขนาดใหญ่"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span className="hidden sm:inline">ขยาย</span>
                            </button>
                          </div>
                        </div>

                        {/* Interactive Map Canvas Container */}
                        <div className="relative w-full h-48 bg-slate-100 border-b border-slate-200 overflow-hidden group">
                          {/* OpenStreetMap Embed Iframe */}
                          <iframe
                            title="GPS Check-in Map Location"
                            width="100%"
                            height="100%"
                            className="w-full h-full border-0 contrast-[1.03] brightness-[0.98]"
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeLocation.coords.lng - 0.005}%2C${activeLocation.coords.lat - 0.003}%2C${activeLocation.coords.lng + 0.005}%2C${activeLocation.coords.lat + 0.003}&layer=mapnik&marker=${activeLocation.coords.lat}%2C${activeLocation.coords.lng}`}
                          />

                          {/* Map Overlay Badge */}
                          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 max-w-[85%]">
                            <div className="bg-slate-900/90 text-white backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-md text-[11px] font-bold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                              <span className="truncate">
                                📍 {workSite === 'office' ? activeLocation.name : workSite === 'field' ? 'จุดปฏิบัติงานนอกสถานที่' : 'บ้านพักพนักงาน (WFH)'}
                              </span>
                            </div>

                            <div className="bg-emerald-950/90 text-emerald-200 backdrop-blur-md px-2 py-0.5 rounded-md border border-emerald-500/40 shadow-xs text-[10px] font-mono font-bold flex items-center justify-between gap-2">
                              <span>ระยะห่าง: <strong className="text-white font-extrabold">{simulatedDistance}m</strong></span>
                              <span className="bg-emerald-500/30 text-emerald-300 px-1 py-0.2 rounded-xs border border-emerald-400/30">อยู่ในรัศมี {activeLocation.allowedRadiusMeters}m</span>
                            </div>
                          </div>

                          {/* Navigation Google Maps Button */}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${activeLocation.coords.lat},${activeLocation.coords.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 right-2 z-10 bg-white/95 hover:bg-white text-slate-800 hover:text-emerald-700 px-2 py-1 rounded-lg border border-slate-300 shadow-md text-[10px] font-black transition flex items-center gap-1 cursor-pointer backdrop-blur-xs"
                          >
                            <Compass className="w-3 h-3 text-emerald-600" />
                            <span>เปิดใน Google Maps</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                          </a>
                        </div>

                        {/* Location Address Details */}
                        <div className="p-2.5 bg-slate-50 text-xs text-slate-700 space-y-1">
                          {workSite === 'office' && (
                            <div className="text-[11px] text-slate-700 font-semibold flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-tight">{activeLocation.address}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              ระบบ Geofence ตรวจสอบสำเร็จ
                            </span>
                            <span className="font-bold text-slate-700">ขอบเขต {activeLocation.allowedRadiusMeters}m</span>
                          </div>
                        </div>
                      </div>

                      {/* Work Type Selection */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">รูปแบบการปฏิบัติงานวันนี้:</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setWorkSite('office')}
                            className={`py-2 px-1.5 rounded-lg text-xs font-bold border transition text-center cursor-pointer flex items-center justify-center gap-1 min-w-0 ${
                              workSite === 'office'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="shrink-0">🏢</span>
                            <span className="truncate whitespace-nowrap">สาขา</span>
                          </button>
                          {settings.allowFieldCheckIn && (
                            <button
                              type="button"
                              onClick={() => setWorkSite('field')}
                              className={`py-2 px-1.5 rounded-lg text-xs font-bold border transition text-center cursor-pointer flex items-center justify-center gap-1 min-w-0 ${
                                workSite === 'field'
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <span className="shrink-0">🚗</span>
                              <span className="truncate whitespace-nowrap">นอกสถานที่</span>
                            </button>
                          )}
                          {settings.allowWFHCheckIn && (
                            <button
                              type="button"
                              onClick={() => setWorkSite('wfh')}
                              className={`py-2 px-1.5 rounded-lg text-xs font-bold border transition text-center cursor-pointer flex items-center justify-center gap-1 min-w-0 ${
                                workSite === 'wfh'
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <span className="shrink-0">🏠</span>
                              <span className="truncate whitespace-nowrap">WFH</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">หมายเหตุเพิ่มเติม (ถ้ามี):</label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="เช่น ออกพบลูกค้าช่วงเช้า / ทำงานต่างสาขา"
                        className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* GPS Check-in & Check-Out Dual Action Buttons (Right Column) */}
                  <div className="bg-slate-900 rounded-xl p-3.5 sm:p-4 text-white border border-slate-800 shadow-md flex flex-col justify-between gap-3 h-full">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                            <Smartphone className="w-3 h-3 shrink-0 text-emerald-400" />
                            <span>ระบบลงเวลา GPS Geofence verified</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            GPS ±5m
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xs sm:text-sm font-black tracking-tight text-white mb-0.5">ลงเวลาเข้างาน / ออกงาน</h3>
                          <p className="text-[11px] text-slate-300 leading-tight">
                            กดปุ่ม <strong className="text-emerald-400 font-bold">เข้างาน</strong> เพื่อเช็คอินช่วงเช้า หรือกดปุ่ม <strong className="text-rose-400 font-bold">ออกงาน</strong> เพื่อเลิกงานในตอนเย็น
                          </p>
                        </div>
                      </div>

                      {/* Live Verification & Time Status Grid */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 sm:p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
                        <div className="p-2 sm:p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/50 min-w-0">
                          <div className="text-[9px] text-slate-400 font-semibold mb-0.5 truncate">เวลาเข้างานบันทึก:</div>
                          <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono truncate">
                            {todayRecord?.checkInTime ? `${todayRecord.checkInTime} น.` : 'ยังไม่เข้างาน'}
                          </div>
                        </div>
                        <div className="p-2 sm:p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/50 min-w-0">
                          <div className="text-[9px] text-slate-400 font-semibold mb-0.5 truncate">เวลาออกงานบันทึก:</div>
                          <div className="text-xs sm:text-sm font-black text-rose-400 font-mono truncate">
                            {todayRecord?.checkOutTime ? `${todayRecord.checkOutTime} น.` : 'ยังไม่ออกงาน'}
                          </div>
                        </div>
                        <div className="p-2 sm:p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/50 col-span-2 flex items-center justify-between gap-1 min-w-0 flex-wrap sm:flex-nowrap">
                          <span className="text-[10px] text-slate-300 flex items-center gap-1.5 font-medium truncate">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block shrink-0"></span>
                            <span className="truncate">รัศมี {simulatedDistance}m ({activeLocation.name})</span>
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/40 shrink-0 whitespace-nowrap">
                            ✓ พร้อมลงเวลา
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleSimulateGPSCheckIn('checkIn')}
                          className="py-2.5 sm:py-3.5 px-2 sm:px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-500/20 active:scale-98 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap min-w-0"
                        >
                          <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate whitespace-nowrap">ลงเวลาเข้างาน</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSimulateGPSCheckIn('checkOut')}
                          className="py-2.5 sm:py-3.5 px-2 sm:px-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-md shadow-rose-600/20 active:scale-98 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap min-w-0"
                        >
                          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate whitespace-nowrap">ลงเวลาออกงาน</span>
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-400 text-center font-mono">
                        * ตรวจสอบพิกัดกับระบบ HR อัตโนมัติ (รัศมี {activeLocation.allowedRadiusMeters} เมตร)
                      </p>
                    </div>
                  </div>
            </div>
          ) : (
            /* Face Scan Mode */
            <div className="max-w-xl mx-auto space-y-6 text-center py-4">
              <div className="relative w-56 h-56 mx-auto rounded-full border-4 border-dashed border-emerald-500 p-2 bg-slate-900 flex items-center justify-center overflow-hidden shadow-xl">
                {scanningFace ? (
                  <div className="flex flex-col items-center gap-2 text-emerald-400 animate-pulse">
                    <RefreshCw className="w-10 h-10 animate-spin" />
                    <span className="text-xs font-bold">กำลังสแกนใบหน้า...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-300">
                    <img
                      src={currentEmployee.avatar}
                      alt="face preview"
                      className="w-44 h-44 rounded-full object-cover opacity-90 border-2 border-emerald-400"
                    />
                    <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none border border-emerald-400 rounded-full" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base">สแกนใบหน้าลงเวลา (Face Recognition)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  วางใบหน้าให้อยู่ในกรอบเพื่อลงเวลาเข้างานหรือออกงาน ณ {activeLocation.name}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => handleSimulateFaceScan('checkIn')}
                  disabled={scanningFace}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>สแกนหน้าเข้างาน</span>
                </button>

                <button
                  onClick={() => handleSimulateFaceScan('checkOut')}
                  disabled={scanningFace}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>สแกนหน้าออกงาน</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
        </>
      )}

      {viewTab === 'history' && (
        /* Attendance History Log Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>ประวัติการลงเวลาเข้า-ออกงานทั้งหมด (Attendance Log)</span>
              </h3>
              <p className="text-xs text-slate-500">
                แสดงเวลาเข้างาน เวลาออกงาน สาย/OT และสถานที่สำหรับตรวจสอบ
              </p>
            </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส, แผนก..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="ALL">ทุกแผนก (All Depts)</option>
              <option value="ฝ่ายไอที (IT)">ฝ่ายไอที (IT)</option>
              <option value="ฝ่ายการตลาด (Marketing)">ฝ่ายการตลาด (Marketing)</option>
              <option value="ฝ่ายขาย (Sales)">ฝ่ายขาย (Sales)</option>
              <option value="ฝ่ายบุคคล (HR)">ฝ่ายบุคคล (HR)</option>
              <option value="ฝ่ายบัญชี (Accounting)">ฝ่ายบัญชี (Accounting)</option>
              <option value="ฝ่ายปฏิบัติการ (Operations)">ฝ่ายปฏิบัติการ (Operations)</option>
            </select>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3 pl-4 whitespace-nowrap">พนักงาน</th>
                <th className="py-2.5 px-3 whitespace-nowrap">แผนก</th>
                <th className="py-2.5 px-3 whitespace-nowrap">วันที่</th>
                <th className="py-2.5 px-3 text-emerald-800 bg-emerald-50/80 whitespace-nowrap">เข้างาน</th>
                <th className="py-2.5 px-3 text-rose-800 bg-rose-50/80 whitespace-nowrap">ออกงาน</th>
                <th className="py-2.5 px-3 whitespace-nowrap">สาย / OT</th>
                <th className="py-2.5 px-3 whitespace-nowrap">วิธีลงเวลา & สถานที่</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">สถานะ</th>
                {isAdminView && <th className="py-2.5 px-3 pr-4 text-center whitespace-nowrap bg-emerald-50/30">จัดการ (HR)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={isAdminView ? 9 : 8} className="py-8 text-center text-slate-400">
                    ไม่พบประวัติการลงเวลาที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 pl-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                            {rec.employeeId}
                          </span>
                          <span className="truncate max-w-[130px] sm:max-w-[160px]" title={rec.employeeName}>{rec.employeeName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] truncate max-w-[120px]" title={rec.department}>
                        {rec.department}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 text-[11px]">{rec.date}</td>
                      
                      {/* Check In Time Column */}
                      <td className="py-2.5 px-3 bg-emerald-50/20 font-mono font-bold">
                        {rec.checkInTime ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-200/80 text-[11px]">
                            <LogIn className="w-3 h-3 text-emerald-600 shrink-0" />
                            {rec.checkInTime} น.
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Check Out Time Column */}
                      <td className="py-2.5 px-3 bg-rose-50/20 font-mono font-bold">
                        {rec.checkOutTime ? (
                          <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-100/90 px-2 py-0.5 rounded-md border border-rose-200/80 text-[11px]">
                            <LogOut className="w-3 h-3 text-rose-600 shrink-0" />
                            {rec.checkOutTime} น.
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            ยังไม่ออกงาน
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-[11px]">
                        {rec.lateMinutes > 0 ? (
                          <span className="text-amber-700 font-bold block">
                            สาย {rec.lateMinutes} นาที
                          </span>
                        ) : null}
                        {rec.otHours > 0 ? (
                          <span className="text-indigo-700 font-bold block">
                            OT {rec.otHours} ชม.
                          </span>
                        ) : null}
                        {rec.lateMinutes === 0 && rec.otHours === 0 && (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px] font-mono font-semibold">
                            {rec.checkInMethod}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[130px]" title={rec.locationName}>
                            {rec.locationName || 'สำนักงาน'}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          rec.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : rec.status === 'late'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : rec.status === 'leave'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {rec.status === 'present'
                            ? 'เข้างานปกติ'
                            : rec.status === 'late'
                            ? 'มาสาย'
                            : rec.status === 'leave'
                            ? 'ลางาน'
                            : 'ขาดงาน'}
                        </span>
                      </td>

                      {/* HR Edit / Delete Actions */}
                      {isAdminView && (
                        <td className="py-2.5 px-3 pr-4 text-center bg-emerald-50/20">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(rec)}
                              className="p-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-lg transition cursor-pointer"
                              title="แก้ไขประวัติลงเวลา"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRecord(rec.id, rec.employeeName)}
                              className="p-1 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 rounded-lg transition cursor-pointer"
                              title="ลบรายการนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* --- HR & ADMIN SYSTEM & LOCATIONS CONFIGURATION MODAL --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Top Banner */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">ตั้งค่าสถานที่ทำงาน & กฎลงเวลา (HR / Admin Config)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSettingsTab('locations')}
                className={`pb-2.5 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  settingsTab === 'locations'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>สถานที่และพิกัดสาขา ({locations.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab('workHours')}
                className={`pb-2.5 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  settingsTab === 'workHours'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>เวลาเข้างาน & กฎการผ่อนปรน</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
              
              {/* TAB 1: LOCATIONS MANAGEMENT */}
              {settingsTab === 'locations' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold block">การจัดการสถานที่และสาขาปฏิบัติงาน</span>
                        <span className="text-[11px] text-emerald-700">
                          กำหนดพิกัด GPS ละติจูด/ลองจิจูด และรัศมีวงกลม (Geofence) ที่อนุญาตให้พนักงานลงเวลา
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAddLocation}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>เพิ่มสาขาใหม่</span>
                    </button>
                  </div>

                  {/* Locations Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {locations.map((loc) => (
                      <div
                        key={loc.id}
                        className={`p-4 rounded-xl border transition relative flex flex-col justify-between ${
                          loc.isDefault
                            ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                            : loc.isActive
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                              <span>🏢 {loc.name}</span>
                            </h4>

                            <div className="flex items-center gap-1">
                              {loc.isDefault && (
                                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md">
                                  สาขาหลัก
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                  loc.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {loc.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                              </span>
                            </div>
                          </div>

                          <p className="text-slate-600 text-[11px] mb-2 leading-relaxed">
                            📍 {loc.address}
                          </p>

                          <div className="space-y-1 font-mono text-[11px] text-slate-500 bg-slate-100 p-2 rounded-lg">
                            <div>พิกัด: {loc.coords.lat}° N, {loc.coords.lng}° E</div>
                            <div className="text-emerald-700 font-bold">
                              รัศมีอนุญาต: {loc.allowedRadiusMeters} เมตร
                            </div>
                            {loc.wifiBssid && (
                              <div className="text-slate-600">WiFi SSID: {loc.wifiBssid}</div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditLocation(loc)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>แก้ไข</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteLocation(loc.id, loc.name)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ลบ</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: WORK HOURS & RULES */}
              {settingsTab === 'workHours' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-2 text-slate-800 font-bold">
                    <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>ตั้งค่าเวลาเริ่มงาน เลิกงาน และเงื่อนไขการผ่อนปรนสาย</span>
                  </div>

                  {/* Work Hours Config */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">เวลาเริ่มงานปกติ (Work Start):</label>
                      <input
                        type="time"
                        value={settings.workStartTime}
                        onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">เวลาเลิกงานปกติ (Work End):</label>
                      <input
                        type="time"
                        value={settings.workEndTime}
                        onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-sm"
                      />
                    </div>
                  </div>

                  {/* Grace Period */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">ผ่อนปรนการสาย (Grace Period - นาที):</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={settings.gracePeriodMinutes}
                        onChange={(e) => setSettings({ ...settings, gracePeriodMinutes: Number(e.target.value) })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">อัตราคูณค่า OT ปกติ (Multiplier):</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="3"
                        value={settings.otRateMultiplier}
                        onChange={(e) => setSettings({ ...settings, otRateMultiplier: Number(e.target.value) })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={settings.allowFieldCheckIn}
                        onChange={(e) => setSettings({ ...settings, allowFieldCheckIn: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>อนุญาตให้พนักงานลงเวลานอกสถานที่ (Field Check-In)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={settings.allowWFHCheckIn}
                        onChange={(e) => setSettings({ ...settings, allowWFHCheckIn: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>อนุญาตให้พนักงานลงเวลา Work From Home (WFH)</span>
                    </label>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer"
              >
                ปิด
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  setActionSuccessMsg('บันทึกการตั้งค่าระบบและสถานที่เรียบร้อยแล้ว');
                  setTimeout(() => setActionSuccessMsg(null), 3000);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>บันทึกการตั้งค่า</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- ADD / EDIT LOCATION SUB-MODAL --- */}
      {showLocationForm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">
                  {editingLocation ? `แก้ไขสถานที่ "${editingLocation.name}"` : 'เพิ่มสถานที่ปฏิบัติงาน / สาขาใหม่'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationForm(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="p-6 space-y-3 text-xs text-slate-700">
              
              <div>
                <label className="block font-bold text-slate-800 mb-1">ชื่อสถานที่ / ชื่อสาขา:</label>
                <input
                  type="text"
                  required
                  value={locFormName}
                  onChange={(e) => setLocFormName(e.target.value)}
                  placeholder="เช่น สำนักงานใหญ่ อาคารสีลม หรือ สาขาเชียงใหม่"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">ที่อยู่สถานที่ / จุดสังเกต:</label>
                <textarea
                  rows={2}
                  value={locFormAddress}
                  onChange={(e) => setLocFormAddress(e.target.value)}
                  placeholder="ระบุเลขที่ อาคาร ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              {/* GPS Coordinates Inputs */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    พิกัด GPS (Latitude & Longitude)
                  </span>
                  <button
                    type="button"
                    onClick={handleFetchCurrentGPS}
                    className="text-[11px] text-emerald-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    ดึงพิกัด GPS ปัจจุบัน
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ละติจูด (Latitude):</label>
                    <input
                      type="text"
                      required
                      value={locFormLat}
                      onChange={(e) => setLocFormLat(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ลองจิจูด (Longitude):</label>
                    <input
                      type="text"
                      required
                      value={locFormLng}
                      onChange={(e) => setLocFormLng(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Allowed Geofence Radius Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-800">รัศมีเช็คอินที่อนุญาต (Geofence Radius):</label>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {locFormRadius} เมตร
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="1000"
                  step="10"
                  value={locFormRadius}
                  onChange={(e) => setLocFormRadius(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  * พนักงานต้องอยู่ภายในระยะ {locFormRadius} เมตร จากพิกัดสาขาจึงจะลงเวลาได้
                </p>
              </div>

              {/* WiFi Network SSID Optional */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">ชื่อ WiFi Network (SSID) ประจำสาขา (ถ้ามี):</label>
                <input
                  type="text"
                  value={locFormWifi}
                  onChange={(e) => setLocFormWifi(e.target.value)}
                  placeholder="เช่น HQ_Corporate_WiFi_5G"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={locFormIsActive}
                    onChange={(e) => setLocFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>เปิดใช้งานสถานที่นี้ในระบบ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={locFormIsDefault}
                    onChange={(e) => setLocFormIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>ตั้งเป็นสาขาหลัก (Primary Default HQ)</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLocationForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกสถานที่</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- MANUAL ADD / EDIT ATTENDANCE RECORD MODAL --- */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">
                {isNewManualEntry ? 'เพิ่มการลงเวลาแทนพนักงาน (Manual Entry)' : 'แก้ไขประวัติลงเวลาพนักงาน'}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendanceForm} className="p-6 space-y-3 text-xs text-slate-700">
              
              <div>
                <label className="block font-bold text-slate-800 mb-1">พนักงาน:</label>
                <select
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold bg-slate-50"
                  disabled={!isNewManualEntry}
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.code} - {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">วันที่:</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">สถานะ:</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="present">เข้างานปกติ (Present)</option>
                    <option value="late">มาสาย (Late)</option>
                    <option value="leave">ลางาน (Leave)</option>
                    <option value="absent">ขาดงาน (Absent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">เวลาเข้างาน (Clock In):</label>
                  <input
                    type="time"
                    value={formCheckIn}
                    onChange={(e) => setFormCheckIn(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-emerald-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">เวลาออกงาน (Clock Out):</label>
                  <input
                    type="time"
                    value={formCheckOut}
                    onChange={(e) => setFormCheckOut(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-rose-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">นาทีสาย (Late Min):</label>
                  <input
                    type="number"
                    min="0"
                    value={formLateMinutes}
                    onChange={(e) => setFormLateMinutes(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">ชั่วโมง OT:</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formOtHours}
                    onChange={(e) => setFormOtHours(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">สถานที่ / สาขา:</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">หมายเหตุ:</label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกการลงเวลา</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- FULL SCREEN MAP MODAL --- */}
      {showFullMapModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    แผนที่พิกัด GPS ประจำจุดเช็คอิน (Geofence Live View)
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono">
                    {activeLocation.name} — GPS: {activeLocation.coords.lat}° N, {activeLocation.coords.lng}° E
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activeLocation.coords.lat},${activeLocation.coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition items-center gap-1.5 border border-slate-700"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>เปิดใน Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowFullMapModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body: Map View */}
            <div className="relative flex-1 bg-slate-100 overflow-hidden">
              <iframe
                title="Full Interactive GPS Map"
                width="100%"
                height="100%"
                className="w-full h-full border-0 contrast-[1.02]"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeLocation.coords.lng - 0.008}%2C${activeLocation.coords.lat - 0.005}%2C${activeLocation.coords.lng + 0.008}%2C${activeLocation.coords.lat + 0.005}&layer=mapnik&marker=${activeLocation.coords.lat}%2C${activeLocation.coords.lng}`}
              />

              {/* Floating Info Card on Map */}
              <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl max-w-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    {activeLocation.name}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    รัศมี {activeLocation.allowedRadiusMeters}m
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-snug">
                  📍 {activeLocation.address}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">ตำแหน่งปัจจุบันของคุณ:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                    {simulatedDistance}m จากจุดเช็คอิน
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-900 text-slate-300 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>พิกัดตรวจสอบตรงกับเซิร์ฟเวอร์เรียบร้อยแล้ว</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFullMapModal(false)}
                className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer"
              >
                ปิดหน้าต่างแผนที่
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
