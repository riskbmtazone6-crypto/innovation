import React, { useState, useEffect } from 'react';
import { InspectorUser } from '../types';
import { OPERATION_GROUPS } from '../data/initialData';
import { QRScannerModal } from './QRScannerModal';
import { ParsedBusQR } from '../utils/qrScanner';
import { findVehicleByBusNumber } from '../data/fleetData';

interface Step1InfoProps {
  currentInspector: InspectorUser;
  onStartInspection: (info: {
    inspectorName: string;
    operationGroup: string;
    operationGroupName: string;
    busRoute: string;
    busNumber: string;
  }) => void;
  savedInspectorName?: string;
  savedRoute?: string;
  savedBusNumber?: string;
  savedOpGroup?: string;
  onOpenTutorial?: () => void;
}

export const Step1Info: React.FC<Step1InfoProps> = ({
  currentInspector,
  onStartInspection,
  savedInspectorName = '',
  savedRoute = '',
  savedBusNumber = '',
  savedOpGroup = '6-3',
  onOpenTutorial
}) => {
  const [inspectorName, setInspectorName] = useState(savedInspectorName);
  const [operationGroup, setOperationGroup] = useState(savedOpGroup);
  const [busRoute, setBusRoute] = useState(savedRoute);
  const [busNumber, setBusNumber] = useState(savedBusNumber);
  const [formattedDateTime, setFormattedDateTime] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedBadge, setScannedBadge] = useState<boolean>(!!savedRoute && !!savedBusNumber);
  const [scanSourceNote, setScanSourceNote] = useState<string | null>(null);

  // Sync state when props update (e.g., when resetting session)
  useEffect(() => {
    setInspectorName(savedInspectorName);
    setBusRoute(savedRoute);
    setBusNumber(savedBusNumber);
    setOperationGroup(savedOpGroup);
    setScannedBadge(!!savedRoute && !!savedBusNumber);
  }, [savedInspectorName, savedRoute, savedBusNumber, savedOpGroup]);

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
    if (data.route) setBusRoute(data.route);
    if (data.busNumber) setBusNumber(data.busNumber);
    setScannedBadge(true);
    setScanSourceNote(data.sourceFormat || 'ดึงจาก เซล B และ เซล D สำเร็จ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectorName.trim()) {
      alert('กรุณาระบุชื่อผู้ตรวจ');
      return;
    }
    if (!busRoute.trim()) {
      alert('กรุณาสแกนหรือระบุสายเดินรถ');
      return;
    }
    if (!busNumber.trim()) {
      alert('กรุณาสแกนหรือระบุเลขข้างรถ');
      return;
    }

    const selectedGroup = OPERATION_GROUPS.find((g) => g.id === operationGroup);
    onStartInspection({
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

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#121b2e]" htmlFor="inspector-name">
              1. ชื่อ–นามสกุล (ผู้ตรวจ) <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#6b7280] text-[20px]">
                badge
              </span>
              <input
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#bdc9c6] bg-white text-[#121b2e] text-[15px] focus:outline-none focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20 transition-colors"
                id="inspector-name"
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="โปรดระบุ"
                required
              />
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

