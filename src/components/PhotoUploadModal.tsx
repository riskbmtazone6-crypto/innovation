import React, { useState, useRef, useEffect } from 'react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  setTitle: string;
  photoGuide?: string;
  setId?: 'exterior' | 'interior' | 'engine';
  currentImageUrl?: string;
  busRoute?: string;
  busNumber?: string;
  inspectorName?: string;
  onConfirmPhoto: (imageUrl: string) => void;
}

// Curated realistic transit inspection sample photos grouped by set
const SAMPLE_PHOTOS_BY_SET = {
  exterior: [
    {
      label: 'ภาพรวมหน้ารถ & ตัวถังภายนอก',
      url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=700&auto=format&fit=crop&q=80'
    },
    {
      label: 'มุมมองไฟหน้า & กระจกมองข้าง',
      url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=700&auto=format&fit=crop&q=80'
    },
    {
      label: 'สภาพยางและตัวถังด้านข้าง',
      url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=700&auto=format&fit=crop&q=80'
    }
  ],
  interior: [
    {
      label: 'ภาพรวมห้องโดยสาร & เบาะนั่ง',
      url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=700&auto=format&fit=crop&q=80'
    },
    {
      label: 'คอนโซลคนขับ CCTV & จอแสดงผล',
      url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=700&auto=format&fit=crop&q=80'
    },
    {
      label: 'ประตูขึ้น-ลง & อุปกรณ์ความปลอดภัย',
      url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=700&auto=format&fit=crop&q=80'
    }
  ],
  engine: [
    {
      label: 'ภาพรวมห้องเครื่องยนต์หลัก',
      url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=700&auto=format&fit=crop&q=80'
    },
    {
      label: 'จุดตรวจระดับของเหลว & หม้อน้ำ',
      url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=700&auto=format&fit=crop&q=80'
    },
    {
      label: 'ระบบสายพาน ท่อยาง & วาล์วลม',
      url: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=700&auto=format&fit=crop&q=80'
    }
  ]
};

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  setTitle,
  photoGuide,
  setId = 'exterior',
  currentImageUrl,
  busRoute = '',
  busNumber = '',
  inspectorName = '',
  onConfirmPhoto
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'sample'>('camera');
  const [selectedUrl, setSelectedUrl] = useState<string>(currentImageUrl || '');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingText, setProcessingText] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isActive = true;

    if (isOpen) {
      setSelectedUrl(currentImageUrl || '');
      setIsProcessing(false);

      if (activeMode === 'camera') {
        startCamera(isActive);
      } else {
        stopCamera();
      }
    } else {
      stopCamera();
    }

    return () => {
      isActive = false;
      stopCamera();
    };
  }, [isOpen, activeMode]);

  if (!isOpen) return null;

  const startCamera = async (isActive = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      if (!isActive || !stream) {
        stream?.getTracks().forEach((track) => track.stop());
        return;
      }

      setCameraStream(stream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        
        try {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              if (err && err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                console.warn('Camera video play caught safely:', err);
              }
            });
          }
        } catch (err: any) {
          if (err && err.name !== 'AbortError') {
            console.warn('Camera play synchronous exception:', err);
          }
        }
      }
    } catch (err) {
      console.warn('Camera failed or not permitted:', err);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 800;
      canvas.height = videoRef.current.videoHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw camera image
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Stamp Watermark overlay
        const now = new Date();
        const timeStr = `${now.toLocaleDateString('th-TH')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height - 52, canvas.width, 52);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(`ขสมก. เขต 6 | สาย: ${busRoute || '-'} | เบอร์: ${busNumber || '-'} | ${timeStr}`, 14, canvas.height - 30);
        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#00e5c9';
        ctx.fillText(`${setTitle} | ผู้ตรวจ: ${inspectorName || 'สายตรวจ'}`, 14, canvas.height - 12);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        // ignore
      }
      videoRef.current.srcObject = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Stamp watermark on uploaded photo as well
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const now = new Date();
              const timeStr = `${now.toLocaleDateString('th-TH')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
              
              const barHeight = Math.max(50, Math.floor(canvas.height * 0.08));
              ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
              ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

              const fontSize = Math.max(14, Math.floor(barHeight * 0.32));
              ctx.fillStyle = '#ffffff';
              ctx.font = `bold ${fontSize}px sans-serif`;
              ctx.fillText(`ขสมก. เขต 6 | สาย: ${busRoute || '-'} | เบอร์: ${busNumber || '-'} | ${timeStr}`, 16, canvas.height - (barHeight * 0.55));
              ctx.font = `${fontSize * 0.9}px sans-serif`;
              ctx.fillStyle = '#00e5c9';
              ctx.fillText(`${setTitle} | ผู้ตรวจ: ${inspectorName || 'สายตรวจ'}`, 16, canvas.height - (barHeight * 0.2));

              setSelectedUrl(canvas.toDataURL('image/jpeg', 0.85));
            }
          };
          img.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedUrl) {
      alert('กรุณาถ่ายภาพหรือเลือกภาพหลักฐานประจำชุดการตรวจก่อนยืนยัน');
      return;
    }

    setIsProcessing(true);
    setProcessingText('กำลังประทับลายน้ำและบันทึกภาพถ่ายยืนยัน...');

    setTimeout(() => {
      onConfirmPhoto(selectedUrl);
      setIsProcessing(false);
      handleClose();
    }, 450);
  };

  const currentSamplePhotos = SAMPLE_PHOTOS_BY_SET[setId] || SAMPLE_PHOTOS_BY_SET.exterior;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e5e7eb] flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#005c55] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">photo_camera</span>
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#121b2e]">{setTitle}</h3>
              <p className="text-[11px] text-[#6b7280]">
                {photoGuide || 'ถ่ายภาพ 1 ภาพเพื่อยืนยันรายการตรวจย่อยในชุดนี้'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-[#6b7280] hover:text-[#121b2e] p-1.5 rounded-full hover:bg-[#e5e7eb] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#f1f5f9] p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveMode('camera');
                startCamera();
              }}
              className={`py-2 text-[12px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeMode === 'camera' ? 'bg-white text-[#005c55] shadow-xs' : 'text-[#64748b]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span>กล้องถ่ายภาพ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveMode('upload');
              }}
              className={`py-2 text-[12px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeMode === 'upload' ? 'bg-white text-[#005c55] shadow-xs' : 'text-[#64748b]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>อัปโหลดภาพ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveMode('sample');
              }}
              className={`py-2 text-[12px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeMode === 'sample' ? 'bg-white text-[#005c55] shadow-xs' : 'text-[#64748b]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">image</span>
              <span>ภาพตัวอย่าง</span>
            </button>
          </div>

          {/* Mode 1: Camera Feed */}
          {activeMode === 'camera' && !selectedUrl && (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-900 text-white text-center">
                    <span className="material-symbols-outlined text-[36px] text-[#00e5c9] mb-2 animate-spin">
                      progress_activity
                    </span>
                    <p className="text-[13px]">กำลังเปิดกล้องถ่ายภาพ...</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      หากกล้องไม่เปิด สามารถเลือกแท็บ "ภาพตัวอย่าง" หรือ "อัปโหลดภาพ" ได้
                    </p>
                  </div>
                )}
                {isCameraActive && (
                  <div className="absolute bottom-2 left-2 bg-black/65 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md">
                    ขสมก. เขต 6 • สาย {busRoute || '-'} ({busNumber || '-'})
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={capturePhoto}
                className="w-full py-3.5 bg-[#005c55] hover:bg-[#0f766e] active:scale-[0.98] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all text-[15px]"
              >
                <span className="material-symbols-outlined text-[22px]">camera</span>
                <span>กดชัตเตอร์ถ่ายภาพยืนยันชุดนี้</span>
              </button>
            </div>
          )}

          {/* Selected/Captured Photo Preview */}
          {selectedUrl && (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#005c55] bg-black aspect-video flex items-center justify-center shadow-sm">
                <img
                  src={selectedUrl}
                  alt="Captured inspection"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 bg-[#005c55] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>ภาพถ่ายยืนยันชุดการตรวจสมบูรณ์</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUrl('')}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors cursor-pointer"
                  title="ถ่ายใหม่"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[12px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                <span>ภาพถ่าย 1 ภาพนี้จะใช้เป็นหลักฐานยืนยันรายการตรวจย่อยทั้งหมดในชุดนี้</span>
              </div>
            </div>
          )}

          {/* Mode 2: Upload */}
          {activeMode === 'upload' && !selectedUrl && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#bdc9c6] hover:border-[#005c55] bg-[#f8fafc] rounded-2xl p-8 text-center cursor-pointer transition-colors space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-[#005c55]/10 text-[#005c55] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
                </div>
                <p className="font-bold text-[14px] text-[#121b2e]">คลิกเพื่อเลือกรูปภาพจากเครื่อง</p>
                <p className="text-[11px] text-[#64748b]">รองรับไฟล์ภาพ JPG, PNG, WEBP</p>
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

          {/* Mode 3: Sample Photos */}
          {activeMode === 'sample' && !selectedUrl && (
            <div className="space-y-2">
              <p className="text-[12px] font-semibold text-[#475569]">
                เลือกภาพถ่ายตัวอย่างสำหรับชุดการตรวจนี้:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {currentSamplePhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedUrl(photo.url)}
                    className="group relative rounded-xl overflow-hidden border border-[#e2e8f0] hover:border-[#005c55] text-left p-1.5 transition-all cursor-pointer bg-white hover:shadow-xs"
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={photo.url}
                        alt={photo.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-[11px] font-bold text-[#1e293b] mt-1.5 line-clamp-2 px-0.5">
                      {photo.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="bg-[#005c55]/10 border border-[#005c55]/30 rounded-2xl p-4 flex items-center justify-center gap-3 animate-pulse">
              <span className="material-symbols-outlined text-[#005c55] text-[24px] animate-spin">
                sync
              </span>
              <span className="text-[14px] font-bold text-[#005c55]">{processingText}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-[#64748b] hover:bg-[#e2e8f0] text-[13px] font-medium transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedUrl || isProcessing}
            className={`px-5 py-2.5 rounded-xl font-bold text-[14px] flex items-center gap-2 transition-all cursor-pointer ${
              selectedUrl && !isProcessing
                ? 'bg-[#005c55] hover:bg-[#0f766e] active:scale-[0.98] text-white shadow-md'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{isProcessing ? 'กำลังประมวลผล...' : 'ยืนยันภาพถ่ายประจำชุด'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
