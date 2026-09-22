import React, { useState, useEffect, useRef } from 'react';
import { InspectorUser } from '../types';
import { OPERATION_GROUPS } from '../data/initialData';
import { QRScannerModal } from './QRScannerModal';
import { ParsedBusQR } from '../utils/qrScanner';
import { findVehicleByBusNumber } from '../data/fleetData';
import { findEmployeeById, searchEmployees, BMTAEmployee, POPULAR_ZONE6_EMPLOYEES } from '../data/employeeDatabase';

interface Step1InfoProps {
  currentInspector: InspectorUser;
  onStartInspection: (info: {
    inspectorName: string;
    inspectorId?: string;
    operationGroup: string;
    operationGroupName: string;
    busRoute: string;
    busNumber: string;
  }) => void;
  savedInspectorName?: string;
  savedInspectorId?: string;
  savedRoute?: string;
  savedBusNumber?: string;
  savedOpGroup?: string;
  onOpenTutorial?: () => void;
}

export const Step1Info: React.FC<Step1InfoProps> = ({
  currentInspector,
  onStartInspection,
  savedInspectorName = '',
  savedInspectorId = '',
  savedRoute = '',
  savedBusNumber = '',
  savedOpGroup = '6-3',
  onOpenTutorial
}) => {
  const [inspectorId, setInspectorId] = useState(savedInspectorId || currentInspector.id || '');
  const [inspectorName, setInspectorName] = useState(savedInspectorName || currentInspector.name || '');
  const [idMatchStatus, setIdMatchStatus] = useState<'found' | 'not_found' | 'idle'>('idle');
  const [showIdDropdown, setShowIdDropdown] = useState(false);
  const [idSuggestions, setIdSuggestions] = useState<BMTAEmployee[]>([]);

  const [operationGroup, setOperationGroup] = useState(savedOpGroup);
  const [busRoute, setBusRoute] = useState(savedRoute);
  const [busNumber, setBusNumber] = useState(savedBusNumber);
  const [formattedDateTime, setFormattedDateTime] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedBadge, setScannedBadge] = useState<boolean>(!!savedRoute && !!savedBusNumber);
  const [scanSourceNote, setScanSourceNote] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state when props update (e.g., when resetting session)
  useEffect(() => {
    setInspectorId(savedInspectorId || currentInspector.id || '');
    setInspectorName(savedInspectorName || currentInspector.name || '');
    setBusRoute(savedRoute);
    setBusNumber(savedBusNumber);
    setOperationGroup(savedOpGroup);
    setScannedBadge(!!savedRoute && !!savedBusNumber);
  }, [savedInspectorName, savedInspectorId, savedRoute, savedBusNumber, savedOpGroup, currentInspector]);

  // Click outside to close employee dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowIdDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check ID on initial load or change
  useEffect(() => {
    if (!inspectorId.trim()) {
      setIdMatchStatus('idle');
      return;
    }
    const emp = findEmployeeById(inspectorId.trim());
    if (emp) {
      setIdMatchStatus('found');
      if (!inspectorName || inspectorName === currentInspector.name) {
        setInspectorName(emp.name);
      }
    } else {
      setIdMatchStatus('not_found');
    }
  }, [inspectorId]);

  // Handle typing employee ID
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInspectorId(val);

    if (val.trim()) {
      const results = searchEmployees(val.trim(), 6);
      setIdSuggestions(results);
      setShowIdDropdown(true);

      const exact = findEmployeeById(val.trim());
      if (exact) {
        setInspectorName(exact.name);
        setIdMatchStatus('found');
      } else {
        setIdMatchStatus('not_found');
      }
    } else {
      setIdSuggestions(POPULAR_ZONE6_EMPLOYEES.slice(0, 5));
      setIdMatchStatus('idle');
    }
  };

  const handleSelectEmployee = (emp: BMTAEmployee) => {
    setInspectorId(emp.id);
    setInspectorName(emp.name);
    setIdMatchStatus('found');
    setShowIdDropdown(false);
  };

  // Thai Date formatting
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const day = now.getDate();
      const month = thaiMonths[now.getMonth()];
      const thaiYear = now.getFullYear() + 543;
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setFormattedDateTime(`${day} ${month} ${thaiYear} ${hours}:${minutes} น.`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleQRScanSuccess = (data: ParsedBusQR) => {
    // สายเดินรถ ดึงข้อมูลจากเซล B, เลขข้างรถ ดึงข้อมูลจากเซล D
    if (data.route || data.cellB) setBusRoute(data.route || data.cellB || '');
    if (data.busNumber || data.cellD) setBusNumber(data.busNumber || data.cellD || '');
    setScannedBadge(true);
    setScanSourceNote(
      data.sourceFormat ||
      `ดึงข้อมูลสำเร็จ: สายเดินรถจากเซล B (${data.route || data.cellB}) | เลขข้างรถจากเซล D (${data.busNumber || data.cellD})`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectorName.trim()) {
      alert('กรุณาระบุเลขประจำตัวหรือชื่อผู้ตรวจ');
      return;
    }
    if (!busRoute.trim()) {
      alert('กรุณาสแกนหรือระบุสายเดินรถ (เซล B)');
      return;
    }
    if (!busNumber.trim()) {
      alert('กรุณาสแกนหรือระบุเลขข้างรถ (เซล D)');
      return;
    }

    const selectedGroup = OPERATION_GROUPS.find((g) => g.id === operationGroup);
    onStartInspection({
      inspectorId: inspectorId.trim(),
      inspectorName: inspectorName.trim(),
      operationGroup,
      operationGroupName: selectedGroup ? selectedGroup.name : 'กลุ่มงานปฏิบัติการเดินรถที่ 3 (กปด.36)',
      busRoute: busRoute.trim(),
      busNumber: busNumber.trim()
    });
  };

  const isStep1Ready = !!inspectorName.trim() && !!busRoute.trim() && !!busNumber.trim();

  return (
    <div className="w-full max-w-[680px] mx-auto px-4 py-6 md:py-8 space-y-4">
      {/* Quick Video Tutorial Banner */}
      {onOpenTutorial && (
        <div
          onClick={onOpenTutorial}
          className="bg-gradient-to-r from-[#005c55] to-[#047857] text-white rounded-2xl p-4 sm:p-4.5 shadow-md flex items-center justify-between gap-3 cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[26px]">play_circle</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[14px] sm:text-[15px]">
                  วิดีโอสอนการใช้งาน 3 ขั้นตอน
                </span>
                <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Tutorial
                </span>
              </div>
              <p className="text-[11px] sm:text-[12px] text-emerald-100 mt-0.5">
                ดูวิธีการสแกน QR Code ประจำรถ, ถ่ายภาพประเมิน 12 จุด และดูรายงานสรุปผล
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[12px] font-bold bg-white text-[#005c55] px-3 py-1.5 rounded-xl shrink-0 group-hover:bg-emerald-50 transition-colors shadow-xs">
            <span>ดูวิดีโอ</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
        </div>
      )}

      {/* Form Card (Card-on-Grey layout) */}
      <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-[#e5e7eb] p-6 md:p-8 transition-all">
        {/* Step Header */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#bdc9c6]/40 pb-4">
          <div className="w-9 h-9 rounded-xl bg-[#005c55]/10 text-[#005c55] flex items-center justify-center font-black">
            1
          </div>
          <div>
            <h2 className="font-bold text-[18px] md:text-[20px] text-[#005c55]">
              STEP 1 • ข้อมูลผู้ตรวจและรถโดยสาร
            </h2>
            <p className="text-[12px] text-[#6b7280]">
              ระบุชื่อ เลือกกลุ่มงาน และสแกน QR Code ประจำรถเพื่อเริ่มต้นการตรวจ
            </p>
          </div>
        </div>

        {/* Form Layout */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Date/Time (Disabled) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#121b2e]">
              วัน-เวลา ที่ทำการตรวจสอบ
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#3e4947] text-[20px]">
                schedule
              </span>
              <input
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#bdc9c6]/60 bg-[#f1f3ff] text-[#3e4947] font-medium text-[15px] cursor-not-allowed focus:outline-none"
                disabled
                id="current-datetime"
                type="text"
                value={formattedDateTime || 'กำลังโหลดเวลา...'}
              />
            </div>
          </div>

          {/* 1. Employee ID & Name (ระบุเลขประจำตัว ID แสดงชื่อ-นามสกุล NAME) */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4.5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#005c55] text-white flex items-center justify-center text-[12px] font-bold">
                  1
                </span>
                <span className="text-[14px] font-bold text-[#121b2e]">
                  ข้อมูลผู้ตรวจ (ระบุ ID แสดง NAME อัตโนมัติ)
                </span>
              </div>
              {idMatchStatus === 'found' && (
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>พบข้อมูลพนักงาน</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee ID Input */}
              <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-[#121b2e]" htmlFor="inspector-id">
                    เลขประจำตัว (ID) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#64748b]">พิมพ์ 6 หลัก</span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#6b7280] text-[20px]">
                    badge
                  </span>
                  <input
                    className="w-full pl-11 pr-10 py-3 rounded-xl border border-[#bdc9c6] bg-white text-[#121b2e] text-[15px] font-mono tracking-wider focus:outline-none focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 transition-colors"
                    id="inspector-id"
                    type="text"
                    value={inspectorId}
                    onChange={handleIdChange}
                    onFocus={() => {
                      if (!inspectorId) {
                        setIdSuggestions(POPULAR_ZONE6_EMPLOYEES.slice(0, 5));
                      }
                      setShowIdDropdown(true);
                    }}
                    placeholder="เช่น 137044, 637517"
                    maxLength={10}
                    required
                  />
                  {idMatchStatus === 'found' && (
                    <span className="absolute right-3 text-[#15803d] material-symbols-outlined text-[20px]">
                      check_circle
                    </span>
                  )}
                  {idMatchStatus === 'not_found' && inspectorId.length >= 4 && (
                    <span className="absolute right-3 text-amber-500 material-symbols-outlined text-[20px]" title="ไม่พบในฐานข้อมูล สามารถพิมพ์ชื่อเองได้">
                      help
                    </span>
                  )}
                </div>

                {/* ID Autocomplete Dropdown */}
                {showIdDropdown && idSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-xl shadow-xl border border-[#e2e8f0] max-h-56 overflow-y-auto divide-y divide-slate-100">
                    <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-bold text-slate-500 sticky top-0">
                      รายชื่อพนักงาน ขสมก. เขต 6
                    </div>
                    {idSuggestions.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleSelectEmployee(emp)}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50 transition-colors flex items-center justify-between text-[13px] cursor-pointer"
                      >
                        <div>
                          <strong className="text-[#121b2e] font-semibold">{emp.name}</strong>
                          <p className="text-[11px] text-[#64748b]">ตำแหน่ง: {emp.position || 'พนักงานเขต 6'}</p>
                        </div>
                        <span className="text-[12px] font-mono font-bold text-[#005c55] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ID: {emp.id}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Inspector Name (Auto-populated from ID) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-[#121b2e]" htmlFor="inspector-name">
                    ชื่อ–นามสกุล (NAME) <span className="text-red-500">*</span>
                  </label>
                  {idMatchStatus === 'found' ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      ดึงจาก ID อัตโนมัติ
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#64748b]">แก้ไขได้</span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#6b7280] text-[20px]">
                    person
                  </span>
                  <input
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border border-[#bdc9c6] text-[15px] focus:outline-none focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 transition-colors ${
                      idMatchStatus === 'found' ? 'bg-emerald-50/40 text-[#121b2e] font-medium' : 'bg-white text-[#121b2e]'
                    }`}
                    id="inspector-name"
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    placeholder="ชื่อ–นามสกุล ผู้ตรวจ"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Quick ID chips */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#64748b]">ตัวอย่างรหัส:</span>
              {[
                { id: '137044', name: 'นายสถาพร มีทรัพย์' },
                { id: '637517', name: 'นายสมพร ปิ่นทอง' },
                { id: '662020', name: 'น.ส.กมลทิพย์ แสงใส' },
                { id: '123456', name: 'นายสมชาย ใจดี' }
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    setInspectorId(chip.id);
                    setInspectorName(chip.name);
                    setIdMatchStatus('found');
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                    inspectorId === chip.id
                      ? 'bg-[#005c55] text-white border-[#005c55]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#005c55] hover:text-[#005c55]'
                  }`}
                >
                  {chip.id} ({chip.name.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Operation Group */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#121b2e]" htmlFor="op-group">
              2. กลุ่มงานปฏิบัติการเดินรถ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                className="appearance-none w-full px-4 py-3 rounded-xl border border-[#bdc9c6] bg-white text-[#121b2e] text-[15px] focus:outline-none focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 transition-colors cursor-pointer pr-10"
                id="op-group"
                value={operationGroup}
                onChange={(e) => setOperationGroup(e.target.value)}
              >
                {OPERATION_GROUPS.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3e4947] pointer-events-none text-[22px]">
                expand_more
              </span>
            </div>
          </div>

          {/* QR Scanner Action Section */}
          <div className="pt-2">
            <div className="bg-gradient-to-r from-[#005c55]/8 via-[#005c55]/5 to-transparent rounded-2xl p-4 border border-[#005c55]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#005c55] text-white flex items-center justify-center shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-[#121b2e] flex items-center gap-1.5 flex-wrap">
                    <span>3. สแกน QR Code ประจำรถ</span>
                    {scannedBadge && (
                      <span className="text-[11px] bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded-full font-bold">
                        ✓ ดึงข้อมูลสำเร็จ
                      </span>
                    )}
                  </h3>
                  <p className="text-[12px] text-[#6b7280]">
                    สแกน QR เพื่อดึงข้อมูล: <strong>สายเดินรถ (เซล B)</strong> และ <strong>เลขข้างรถ (เซล D)</strong> อัตโนมัติ
                  </p>
                  {scanSourceNote && scannedBadge && (
                    <p className="text-[11px] text-[#005c55] font-semibold mt-0.5">
                      ✓ แหล่งข้อมูล: {scanSourceNote}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQRScanner(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#005c55] hover:bg-[#0f766e] active:scale-[0.98] text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                <span>{scannedBadge ? '📷 สแกน QR ใหม่อีกครั้ง' : '📷 เปิดกล้องสแกน QR'}</span>
              </button>
            </div>
          </div>

          {/* 2 Column Grid for Route and Bus Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Route */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-bold text-[#121b2e]" htmlFor="bus-route">
                  สายเดินรถ (เซล B) <span className="text-red-500">*</span>
                </label>
                {scannedBadge && busRoute && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    จากเซล B
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  className="w-full px-4 py-3 rounded-xl border border-[#bdc9c6] bg-white text-[#121b2e] text-[15px] focus:outline-none focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 transition-colors"
                  id="bus-route"
                  placeholder="โปรดระบุ (เช่น 511, 509)"
                  type="text"
                  value={busRoute}
                  onChange={(e) => {
                    setBusRoute(e.target.value);
                    setScannedBadge(false);
                    setScanSourceNote(null);
                  }}
                  required
                />
                {busRoute && (
                  <span className="absolute right-3 text-[#15803d] material-symbols-outlined text-[20px]">
                    check_circle
                  </span>
                )}
              </div>
            </div>

            {/* Bus Number */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-bold text-[#121b2e]" htmlFor="bus-number">
                  เลขข้างรถ (เซล D) <span className="text-red-500">*</span>
                </label>
                {scannedBadge && busNumber && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    จากเซล D
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  className="w-full px-4 py-3 rounded-xl border border-[#bdc9c6] bg-white text-[#121b2e] text-[15px] focus:outline-none focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 transition-colors"
                  id="bus-number"
                  placeholder="โปรดระบุ (เช่น 3-50212, 6-56018)"
                  type="text"
                  value={busNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBusNumber(val);
                    setScannedBadge(false);
                    setScanSourceNote(null);
                    
                    // Auto-lookup matching vehicle in 326 fleet table
                    if (val.trim().length >= 4) {
                      const match = findVehicleByBusNumber(val);
                      if (match && !busRoute) {
                        setBusRoute(match.route);
                        setScanSourceNote(`ทะเบียน ${match.licensePlate} (${match.model})`);
                      }
                    }
                  }}
                  required
                />
                {busNumber && (
                  <span className="absolute right-3 text-[#15803d] material-symbols-outlined text-[20px]">
                    check_circle
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            className={`mt-2 w-full rounded-xl py-3.5 md:py-4 flex items-center justify-center gap-2 transition-all font-bold text-[16px] cursor-pointer ${
              isStep1Ready
                ? 'bg-[#005c55] hover:bg-[#0f766e] active:scale-[0.98] text-white shadow-[0_4px_16px_rgba(0,92,85,0.25)]'
                : 'bg-[#94a3b8] text-white/90 cursor-not-allowed opacity-80'
            }`}
            type="submit"
          >
            <span className="material-symbols-outlined text-[22px]">play_arrow</span>
            <span>เริ่มการตรวจ (ไปขั้นตอนที่ 2) →</span>
          </button>
        </form>
      </div>

      {/* Helper text below card */}
      <div className="mt-4 text-center">
        <p className="text-[12px] text-[#6b7280]">
          ระบุชื่อ เลือกกลุ่มงาน และสแกน QR Code ประจำรถ เพื่อเริ่มการตรวจความพร้อม
        </p>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScanSuccess={handleQRScanSuccess}
        />
      )}
    </div>
  );
};

