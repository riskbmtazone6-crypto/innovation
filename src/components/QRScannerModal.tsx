import React, { useState, useEffect, useRef } from 'react';
import { scanQRCodeFromImageData, parseBusQRText, ParsedBusQR } from '../utils/qrScanner';
import { BMTA_DISTRICT_6_FLEET, FleetVehicle } from '../data/fleetData';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: ParsedBusQR) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'preset'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<ParsedBusQR | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>('all');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Distinct routes list for filter tabs
  const distinctRoutes = Array.from(new Set(BMTA_DISTRICT_6_FLEET.map((v) => v.route))).sort();

  // Filtered fleet vehicles
  const filteredFleet = BMTA_DISTRICT_6_FLEET.filter((v) => {
    const matchesRoute = selectedRouteFilter === 'all' || v.route === selectedRouteFilter;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesRoute;
    const matchesQuery =
      v.busNumber.includes(query) ||
      v.route.toLowerCase().includes(query) ||
      v.licensePlate.includes(query) ||
      String(v.no) === query;
    return matchesRoute && matchesQuery;
  });

  // Start / stop camera stream
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);
    setScannedResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        startScanLoop();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('ไม่สามารถเข้าถึงกล้องถ่ายภาพได้ กรุณาอนุญาตการเข้าถึงกล้อง หรือใช้วิธีอัปโหลดรูปภาพ / ปุ่มเลือกจากทะเบียนรถ 326 คัน');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startScanLoop = () => {
    const scan = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrText = scanQRCodeFromImageData(imageData);

          if (qrText) {
            const parsed = parseBusQRText(qrText);
            setScannedResult(parsed);
            handleSuccess(parsed);
            return;
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(scan);
    };

    animFrameRef.current = requestAnimationFrame(scan);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const qrText = scanQRCodeFromImageData(imageData);
          if (qrText) {
            const parsed = parseBusQRText(qrText);
            handleSuccess(parsed);
          } else {
            alert('ไม่พบ QR Code ในรูปภาพที่เลือก กรุณาลองใหม่อีกครั้ง');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectFleetVehicle = (vehicle: FleetVehicle) => {
    // Construct payload simulating the actual QR Code payload from databusnumber.xlsx
    const parsed = parseBusQRText(vehicle.qrPayload);
    handleSuccess({
      ...parsed,
      route: vehicle.route,
      busNumber: vehicle.busNumber,
      cellB: vehicle.route,
      cellD: vehicle.busNumber,
      licensePlate: vehicle.licensePlate,
      model: vehicle.model,
      sourceFormat: `ทะเบียนรถ ขสมก. เขต 6 (#${vehicle.no} - ${vehicle.licensePlate})`
    });
  };

  const handleSuccess = (parsed: ParsedBusQR) => {
    stopCamera();
    onScanSuccess(parsed);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#cbd5e1] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#005c55] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
            <div>
              <h2 className="font-bold text-[16px] leading-tight">สแกน QR Code ประจำรถ</h2>
              <p className="text-[11px] text-emerald-100">
                ระบบแยกข้อมูลอัตโนมัติ: สายเดินรถ (เซล B) และ เลขข้างรถ (เซล D)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Step Guide Banner */}
        <div className="bg-[#f0fdf4] px-4 py-2.5 border-b border-emerald-100 text-[12px] text-slate-700 flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#005c55] shrink-0 mt-0.5">
            info
          </span>
          <div className="space-y-0.5">
            <p className="font-bold text-[#005c55]">
              คำแนะนำการสแกน QR Code ประจำรถ:
            </p>
            <p className="text-[11px] text-slate-600">
              1. ส่องกล้องไปที่ QR Code หน้ารถหรือข้างรถ • 2. ระบบจะดึง <strong>สายเดินรถ (เซล B)</strong> เช่น 4-59, 515, 4-43, 91ก และ <strong>เลขข้างรถ (เซล D)</strong> เช่น 50010, 55001, 56070 เข้าสู่แบบฟอร์มทันที
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#e5e7eb] bg-[#f8fafc]">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-3 text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'camera'
                ? 'text-[#005c55] border-b-2 border-[#005c55] bg-white'
                : 'text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">videocam</span>
            <span>กล้องสแกน QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'text-[#005c55] border-b-2 border-[#005c55] bg-white'
                : 'text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">image</span>
            <span>เลือกรูปภาพ QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-3 text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'preset'
                ? 'text-[#005c55] border-b-2 border-[#005c55] bg-white'
                : 'text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">directions_bus</span>
            <span>ทะเบียนรถ 326 คัน</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {activeTab === 'camera' && (
            <div className="space-y-3">
              {cameraError ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-2">
                  <span className="material-symbols-outlined text-[36px] text-amber-500">videocam_off</span>
                  <p className="text-[13px] text-amber-900 font-medium">{cameraError}</p>
                  <div className="pt-2 flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-[#005c55] text-white rounded-lg text-[12px] font-bold cursor-pointer"
                    >
                      ลองใหม่อีกครั้ง
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preset')}
                      className="px-3 py-1.5 bg-white border border-[#cbd5e1] text-[#1e293b] rounded-lg text-[12px] font-bold cursor-pointer"
                    >
                      เลือกจากทะเบียนรถ 326 คัน
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Visual Scanner Overlay */}
                  <div className="absolute inset-0 border-2 border-[#00e5c9]/40 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 border-2 border-[#00e5c9] rounded-2xl relative shadow-[0_0_20px_rgba(0,229,201,0.3)]">
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#00e5c9] rounded-tl-lg"></div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#00e5c9] rounded-tr-lg"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#00e5c9] rounded-bl-lg"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#00e5c9] rounded-br-lg"></div>

                      {/* Laser Scanning Animation Line */}
                      <div className="w-full h-0.5 bg-[#00e5c9] shadow-[0_0_8px_#00e5c9] animate-bounce mt-24"></div>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none px-4">
                    <span className="bg-black/80 text-white text-[12px] px-3.5 py-1.5 rounded-full backdrop-blur-xs font-medium inline-block shadow-md">
                      📷 ส่องกล้องไปที่ QR Code หน้ารถหรือข้างรถ
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Test Demo Bar for Testing */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#005c55]">bolt</span>
                    <span>ทดสอบจำลองสแกน QR ด่วน (Quick Test):</span>
                  </span>
                  <span className="text-[10px] text-slate-500">คลิกเพื่อจำลองสแกน</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const v = BMTA_DISTRICT_6_FLEET.find((item) => item.busNumber === '50010');
                      if (v) handleSelectFleetVehicle(v);
                    }}
                    className="p-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-[#005c55] rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-[#005c55] block">สาย 4-59</span>
                    <span className="text-[10px] text-slate-600 block">เลข 50010 (เซล D)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const v = BMTA_DISTRICT_6_FLEET.find((item) => item.busNumber === '56070');
                      if (v) handleSelectFleetVehicle(v);
                    }}
                    className="p-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-[#005c55] rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-[#005c55] block">สาย 515</span>
                    <span className="text-[10px] text-slate-600 block">เลข 56070 (เซล D)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const v = BMTA_DISTRICT_6_FLEET.find((item) => item.busNumber === '55001');
                      if (v) handleSelectFleetVehicle(v);
                    }}
                    className="p-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-[#005c55] rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-[#005c55] block">สาย 4-43</span>
                    <span className="text-[10px] text-slate-600 block">เลข 55001 (เซล D)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const v = BMTA_DISTRICT_6_FLEET.find((item) => item.busNumber === '50035');
                      if (v) handleSelectFleetVehicle(v);
                    }}
                    className="p-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-[#005c55] rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-[#005c55] block">สาย 91ก</span>
                    <span className="text-[10px] text-slate-600 block">เลข 50035 (เซล D)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#bdc9c6] hover:border-[#005c55] bg-[#f8fafc] rounded-2xl p-8 text-center cursor-pointer transition-colors space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-[#005c55]/10 text-[#005c55] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[28px]">qr_code_2</span>
                </div>
                <p className="font-bold text-[14px] text-[#121b2e]">คลิกเพื่อเลือกภาพ QR Code ประจำรถ</p>
                <p className="text-[12px] text-[#6b7280]">รองรับไฟล์ภาพ JPG, PNG (ระบบจะดึง เซล B และ เซล D อัตโนมัติ)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {activeTab === 'preset' && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-emerald-900 text-[11px]">
                <span className="material-symbols-outlined text-[18px] text-emerald-700 shrink-0">table_chart</span>
                <span>
                  <strong>ฐานข้อมูล 326 คัน (ขสมก. เขต 6):</strong> สายเดินรถ = <strong>เซล B</strong> | เลขข้างรถ = <strong>เซล D</strong> | ทะเบียน = <strong>เซล E</strong>
                </span>
              </div>

              {/* Search input */}
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#64748b]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาเลขข้างรถ (เช่น 50010), สาย (เช่น 4-59, 515), หรือทะเบียน..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#cbd5e1] text-[13px] focus:outline-none focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 text-[#94a3b8] hover:text-[#475569] text-[14px]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Route Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedRouteFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                    selectedRouteFilter === 'all'
                      ? 'bg-[#005c55] text-white'
                      : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
                  }`}
                >
                  ทั้งหมด ({BMTA_DISTRICT_6_FLEET.length})
                </button>
                {distinctRoutes.map((r) => {
                  const count = BMTA_DISTRICT_6_FLEET.filter((v) => v.route === r).length;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRouteFilter(r)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                        selectedRouteFilter === r
                          ? 'bg-[#005c55] text-white'
                          : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
                      }`}
                    >
                      สาย {r} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Vehicle list */}
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {filteredFleet.length === 0 ? (
                  <div className="text-center py-8 text-[#94a3b8] text-[13px]">
                    ไม่พบข้อมูลรถที่ตรงกับคำค้นหา "{searchQuery}"
                  </div>
                ) : (
                  filteredFleet.map((vehicle) => (
                    <button
                      key={`${vehicle.no}-${vehicle.busNumber}`}
                      type="button"
                      onClick={() => handleSelectFleetVehicle(vehicle)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-emerald-50 hover:border-[#005c55] text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#cbd5e1] flex items-center justify-center text-[#005c55] group-hover:bg-[#005c55] group-hover:text-white transition-colors shrink-0">
                          <span className="text-[11px] font-black">{vehicle.no}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-[13px] text-[#1e293b] group-hover:text-[#005c55]">
                              สาย {vehicle.route} — เลข {vehicle.busNumber}
                            </strong>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                              {vehicle.licensePlate}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748b]">
                            เซล B: <span className="font-semibold text-emerald-700">{vehicle.route}</span> | เซล D: <span className="font-semibold text-emerald-700">{vehicle.busNumber}</span> | {vehicle.model}
                          </p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-[#94a3b8] group-hover:text-[#005c55] shrink-0">
                        arrow_forward_ios
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e5e7eb] flex items-center justify-between">
          <span className="text-[11px] text-[#64748b]">
            ขสมก. เขตการเดินรถที่ 6 (326 คัน)
          </span>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#64748b] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
