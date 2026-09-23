import React, { useState, useEffect, useRef } from 'react';

interface VideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep?: (step: 'info' | 'inspect' | 'dashboard') => void;
}

interface Chapter {
  id: number;
  title: string;
  stepName: string;
  duration: number; // in seconds
  description: string;
  keyPoints: string[];
  subtitles: { time: number; text: string }[];
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: 'Step 1: ระบุรหัสผู้ตรวจ (ID/Name) & สแกน QR Code ประจำรถ',
    stepName: 'Step 1',
    duration: 20,
    description:
      'กรอกรหัสพนักงาน (ID) ดึงชื่ออัตโนมัติ เลือกกลุ่มงาน (กปด.) และสแกน QR Code ประจำรถ เพื่อดึงสายเดินรถ (เซล B) และเลขข้างรถ (เซล D) พร้อมรุ่น ISUZU และทะเบียนรถ',
    keyPoints: [
      'กรอกรหัสพนักงาน เช่น 60124 ระบบดึงชื่อ "นายสมศักดิ์ ขสมก." อัตโนมัติ',
      'เลือกสังกัดกลุ่มงานปฏิบัติการเดินรถ: กปด.16, กปด.26 หรือ กปด.36',
      'กดปุ่ม "📷 เปิดกล้องสแกน QR" ส่องป้ายหน้ารถหรือข้างรถ',
      'ระบบดึงสายเดินรถจากเซล B และเลขข้างรถจากเซล D พร้อมข้อมูลทะเบียนรถทันที',
      'มีฐานข้อมูล 326 คันของเขต 6 ค้นหาหรือเลือกได้ทันที',
      'กดปุ่ม "เริ่มต้นตรวจสอบสภาพรถ (ไปขั้นตอนที่ 2) →"'
    ],
    subtitles: [
      { time: 0, text: 'ยินดีต้อนรับสู่ระบบตรวจสภาพรถโดยสาร ขสมก. เขตการเดินรถที่ 6' },
      { time: 4, text: 'ขั้นตอนที่ 1: กรอกเลขประจำตัวผู้ตรวจ ระบบดึงชื่อ-นามสกุลให้อัตโนมัติ' },
      { time: 8, text: 'เลือกสังกัดกลุ่มงาน เช่น กปด.36 อู่พุทธมณฑลสาย 3 และกดเปิดกล้องสแกน QR' },
      { time: 12, text: 'ระบบดึงสายเดินรถจากเซล B และเลขข้างรถจากเซล D พร้อมทะเบียนรถทันที' },
      { time: 16, text: 'กดปุ่ม "เริ่มต้นตรวจสอบสภาพรถ" เพื่อก้าวสู่ขั้นตอนที่ 2' }
    ]
  },
  {
    id: 2,
    title: 'Step 2: ตรวจ 3 ชุดรายการมาตรฐาน & ถ่ายภาพพร้อมลายน้ำ',
    stepName: 'Step 2',
    duration: 22,
    description:
      'ตรวจเช็คลิสต์มาตรฐาน 3 ชุดหลัก (ภายนอก, ภายใน, เครื่องยนต์) ถ่ายภาพยืนยันชุดละ 1 ภาพ พร้อมประทับลายน้ำข้อมูลรถและเวลาอัตโนมัติ',
    keyPoints: [
      'ชุดที่ 1 ภายนอกตัวรถ: ถ่าย 1 ภาพ + เช็คตัวถัง สี ไฟส่องสว่าง ยางรถ และป้ายสาย',
      'ระบบประทับลายน้ำ ขสมก. เขต 6, สาย 4-59, 50010 และเวลาลงในภาพถ่ายอัตโนมัติ',
      'ชุดที่ 2 ภายในห้องโดยสาร และ ชุดที่ 3 ระบบเครื่องยนต์ ถ่ายภาพยืนยันชุดละ 1 ภาพ',
      'กดปุ่มทางลัด "✓ ผ่านทั้งหมดในชุดนี้" เพื่อความรวดเร็วในการบันทึก',
      'ปุ่ม "⚡ เติมข้อมูลทดสอบด่วน (Quick Demo)" ช่วยอำนวยความสะดวกในการทดสอบ'
    ],
    subtitles: [
      { time: 0, text: 'ขั้นตอนที่ 2: ตรวจสอบสภาพรถแบบ 3 ชุดรายการมาตรฐานความปลอดภัย' },
      { time: 4, text: 'ชุดที่ 1 ภายนอกตัวรถ: ถ่ายภาพ 1 ภาพ และประเมินรายการย่อยภายนอก' },
      { time: 8, text: 'ระบบจะประทับลายน้ำ ขสมก. เขต 6 สายรถ เลขข้างรถ และเวลาลงในรูปภาพอัตโนมัติ' },
      { time: 13, text: 'ชุดที่ 2 และชุดที่ 3: ตรวจห้องโดยสารและเครื่องยนต์ พร้อมปุ่มผ่านทั้งหมดในชุด' },
      { time: 18, text: 'เมื่อตรวจครบทั้ง 3 ชุด ให้กดปุ่ม "สรุปผลและบันทึกข้อมูล"' }
    ]
  },
  {
    id: 3,
    title: 'Summary: ตรวจทานสรุปผล & ลงนามส่ง Cloud Firestore',
    stepName: 'สรุปผล',
    duration: 18,
    description:
      'หน้าต่าง Modal ตรวจทานผลการตรวจ 3 ชุด พรีวิวภาพถ่ายหลักฐาน บันทึกคำสั่งการหัวหน้างาน ลงลายมือชื่อดิจิทัล และส่ง Cloud Firestore',
    keyPoints: [
      'แสดงสถานะความพร้อม: "✓ ผ่านเกณฑ์มาตรฐานครบทั้ง 3 ชุด (พร้อมบริการ 100%)"',
      'พรีวิวภาพถ่ายหลักฐานที่ผ่านการประทับลายน้ำครบทั้ง 3 ชุด',
      'บันทึกคำสั่งการของหัวหน้างาน / ผู้ตรวจการ (Supervisor Note)',
      'ลงลายมือชื่อดิจิทัล (Digital Signature) บนหน้าจอ',
      'กด "ยืนยันและบันทึกข้อมูล" ข้อมูลจะถูกบันทึกขึ้น Cloud Firestore ทันที'
    ],
    subtitles: [
      { time: 0, text: 'หน้าต่างสรุปผลการตรวจสอบ: ตรวจทานความถูกต้องก่อนส่งรายงาน' },
      { time: 4, text: 'ตรวจสอบพรีวิวภาพถ่ายหลักฐานทั้ง 3 ชุด ที่ประทับลายน้ำสมบูรณ์' },
      { time: 8, text: 'บันทึกคำสั่งการของหัวหน้างาน และลงลายมือชื่อดิจิทัลบนหน้าจอ' },
      { time: 13, text: 'กดปุ่ม "ยืนยันและบันทึกข้อมูล" ระบบจะซิงค์ข้อมูลขึ้น Cloud Firestore ทันที' }
    ]
  },
  {
    id: 4,
    title: 'Step 3: แดชบอร์ด Real-time, ส่ง LINE กปด.6 & เริ่มตรวจคันถัดไป',
    stepName: 'Step 3',
    duration: 20,
    description:
      'ดู 4 ตัวชี้วัดสถิติกองรถ Real-time ส่งออก Excel/CSV คัดลอกสรุปส่ง LINE กปด.6 และกดเริ่มตรวจคันใหม่',
    keyPoints: [
      'ป้ายสถานะสด: 🔥 เชื่อมต่อ Cloud Firestore เรียบร้อย (Real-time)',
      'การ์ดสถิติ 4 ใบ: ตรวจวันนี้, พร้อมบริการ, ต้องแก้ไข, และดัชนีความพร้อมกองรถ (%)',
      'ปุ่ม "📋 คัดลอกสรุปส่ง LINE กปด.6" ช่วยส่งรายงานเข้ากลุ่มงานทันที',
      'ปุ่ม "📥 ส่งออกเป็น Excel / CSV" และพิมพ์รายงานเอกสาร',
      'ปุ่ม "🔄 เริ่มต้นใหม่ (ตรวจคันถัดไป)" รีเซ็ตฟอร์มและกลับไป Step 1 ทันที'
    ],
    subtitles: [
      { time: 0, text: 'ขั้นตอนที่ 3: แดชบอร์ดสรุปผลการตรวจสภาพรถ ขสมก. เขต 6' },
      { time: 4, text: 'ดู 4 ตัวชี้วัดสำคัญ และดัชนีความพร้อมของกองรถแบบ Real-time บน Cloud' },
      { time: 8, text: 'กดปุ่ม "คัดลอกสรุปส่ง LINE กปด.6" เพื่อส่งรายงานเข้ากลุ่มไลน์ได้ทันที' },
      { time: 12, text: 'สามารถส่งออกเป็น Excel และพิมพ์เอกสารรายงานตรวจสภาพได้' },
      { time: 16, text: 'กดปุ่ม "🔄 เริ่มต้นใหม่ (ตรวจคันถัดไป)" เพื่อเริ่มตรวจคันใหม่ได้ทันที' }
    ]
  }
];

export const VideoTutorialModal: React.FC<VideoTutorialModalProps> = ({
  isOpen,
  onClose,
  onJumpToStep
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'steps' | 'faq'>('video');

  const currentChapter = CHAPTERS[currentChapterIndex];
  const timerRef = useRef<number | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Playback timer ticker
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      stopSpeech();
      return;
    }

    if (isPlaying) {
      const interval = 100 / playbackRate;
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentChapter.duration) {
            // Move to next chapter or loop
            if (currentChapterIndex < CHAPTERS.length - 1) {
              setCurrentChapterIndex((idx) => idx + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return currentChapter.duration;
            }
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, currentChapterIndex, playbackRate, currentChapter.duration]);

  // Handle Speech Narration for Thai Audio Guide
  useEffect(() => {
    if (!isOpen || isMuted || !isPlaying) {
      stopSpeech();
      return;
    }

    // Find current subtitle
    const sub = [...currentChapter.subtitles]
      .reverse()
      .find((s) => currentTime >= s.time);

    if (sub && 'speechSynthesis' in window) {
      // Don't repeat if already speaking same text
      if (!window.speechSynthesis.speaking) {
        speakThai(sub.text);
      }
    }
  }, [isOpen, currentTime, isPlaying, isMuted, currentChapterIndex]);

  const speakThai = (text: string) => {
    if (!('speechSynthesis' in window) || isMuted) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = playbackRate * 0.95;
    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSelectChapter = (index: number) => {
    stopSpeech();
    setCurrentChapterIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (currentTime >= currentChapter.duration) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
  };

  // Find active subtitle string
  const currentSubtitle = [...currentChapter.subtitles]
    .reverse()
    .find((s) => currentTime >= s.time)?.text || currentChapter.description;

  const totalDuration = CHAPTERS.reduce((acc, c) => acc + c.duration, 0);
  const currentTotalTime =
    CHAPTERS.slice(0, currentChapterIndex).reduce((acc, c) => acc + c.duration, 0) + currentTime;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] text-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[95vh]">
        {/* Top Bar Header */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
            </div>
            <div>
              <h2 className="font-bold text-[15px] sm:text-[16px] text-white flex items-center gap-2">
                <span>วิดีโอคู่มือการใช้งานระบบตรวจสภาพรถ ขสมก.</span>
                <span className="text-[10px] bg-red-600/80 text-white font-bold px-2 py-0.5 rounded-full">
                  HD TUTORIAL
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                เขตการเดินรถที่ 6 • สแกน QR (เซล B/D), ตรวจ 3 ชุดมาตรฐาน, และแดชบอร์ด Real-time
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left / Center: Interactive Simulated Video Screen */}
          <div className="flex-1 flex flex-col bg-black">
            {/* 16:9 Simulated Video Screen Viewport */}
            <div className="relative aspect-video w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden flex items-center justify-center select-none">
              {/* Scene Simulation Render based on Chapter and Time */}
              {currentChapterIndex === 0 && (
                /* Chapter 1: Step 1 Simulation */
                <div className="relative w-full h-full p-3 sm:p-4 flex flex-col items-center justify-center">
                  {/* Background app mock */}
                  <div className="w-[90%] max-w-md bg-white rounded-xl shadow-2xl p-3.5 text-slate-800 border border-slate-200 animate-fadeIn">
                    <div className="flex items-center justify-between border-b pb-2 mb-2.5">
                      <span className="text-[12px] font-bold text-[#005c55] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#005c55] animate-ping"></span>
                        STEP 1 • ข้อมูลผู้ตรวจและรถโดยสาร
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        ขสมก. เขต 6
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      {/* ID and Name auto lookup */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-500 block text-[9px]">รหัสพนักงาน (ID):</span>
                          <strong className="text-emerald-700 text-[12px]">
                            {currentTime > 1 ? '60124' : 'พิมพ์รหัส...'}
                          </strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-500 block text-[9px]">ชื่อผู้ตรวจ:</span>
                          <strong className="text-slate-800 text-[11px]">
                            {currentTime > 2 ? 'นายสมศักดิ์ ขสมก.' : '-'}
                          </strong>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-slate-500 block text-[9px]">สังกัดกลุ่มงาน:</span>
                          <strong className="text-amber-800 font-bold">
                            {currentTime > 4 ? 'กปด.36 (อู่พุทธมณฑลสาย 3)' : 'เลือกกลุ่มงาน...'}
                          </strong>
                        </div>
                        <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-semibold">
                          เขต 6
                        </span>
                      </div>

                      {/* QR Scan Action Box */}
                      <div
                        className={`p-2 rounded-lg border transition-all ${
                          currentTime >= 8 && currentTime <= 13
                            ? 'bg-[#005c55] text-white ring-2 ring-emerald-400'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">
                              qr_code_scanner
                            </span>
                            <div>
                              <span className="font-bold block text-[11px]">
                                {currentTime >= 12
                                  ? '✓ สแกน QR Code ประจำรถสำเร็จ'
                                  : currentTime >= 8
                                  ? '📷 กำลังสแกน QR หน้ารถ...'
                                  : 'สแกน QR Code ประจำรถ'}
                              </span>
                              <span className="text-[9px] opacity-80">
                                ดึงสาย (เซล B) & เลขข้างรถ (เซล D)
                              </span>
                            </div>
                          </div>
                          {currentTime >= 12 && (
                            <span className="text-[9px] bg-white text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                              Auto-filled
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Auto-filled values */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                          <span className="text-slate-500 block text-[9px]">สายเดินรถ (เซล B):</span>
                          <strong className="text-[#005c55] text-[13px]">
                            {currentTime >= 12 ? 'สาย 4-59' : '-'}
                          </strong>
                        </div>
                        <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                          <span className="text-slate-500 block text-[9px]">เลขข้างรถ (เซล D):</span>
                          <strong className="text-[#005c55] text-[13px]">
                            {currentTime >= 12 ? '50010' : '-'}
                          </strong>
                        </div>
                      </div>

                      {currentTime >= 12 && (
                        <div className="flex items-center justify-between text-[10px] text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          <span>ยี่ห้อ: <strong>ISUZU</strong></span>
                          <span>ทะเบียน: <strong className="text-emerald-700">11-8991</strong> (เซล E)</span>
                        </div>
                      )}

                      {/* Next button */}
                      <button
                        className={`w-full py-2 rounded-lg font-bold text-center text-[11px] transition-all flex items-center justify-center gap-1 ${
                          currentTime >= 15
                            ? 'bg-[#005c55] text-white ring-2 ring-emerald-400 scale-[1.02] shadow-md'
                            : 'bg-slate-300 text-slate-500'
                        }`}
                      >
                        <span>เริ่มต้นตรวจสอบสภาพรถ (ไปขั้นตอนที่ 2)</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>

                  {/* QR Overlay laser animation when scanning */}
                  {currentTime >= 8 && currentTime <= 12 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs animate-fadeIn z-10">
                      <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-[64px] text-white/80 animate-pulse">
                          qr_code_2
                        </span>
                        <div className="w-full h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce"></div>
                        <span className="absolute bottom-2 bg-black/85 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-400/40">
                          สาย 4-59 | เลข 50010
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentChapterIndex === 1 && (
                /* Chapter 2: Step 2 Simulation */
                <div className="relative w-full h-full p-3 sm:p-4 flex flex-col items-center justify-center">
                  <div className="w-[90%] max-w-md bg-white rounded-xl shadow-2xl p-3 text-slate-800 border border-slate-200 animate-fadeIn">
                    <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                      <span className="text-[11px] font-bold text-[#005c55] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">checklist</span>
                        STEP 2 • ตรวจ 3 ชุดรายการมาตรฐาน
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        {currentTime >= 16 ? 'ครบ 3/3 ชุด (100%)' : 'ชุดที่ 1 / 3'}
                      </span>
                    </div>

                    {/* 3 Jump Strips */}
                    <div className="grid grid-cols-3 gap-1 mb-2 text-[10px] text-center">
                      <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 p-1 rounded font-bold">
                        1. ภายนอก ✓
                      </div>
                      <div className={`p-1 rounded font-bold ${currentTime >= 12 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                        2. ภายใน {currentTime >= 12 ? '✓' : ''}
                      </div>
                      <div className={`p-1 rounded font-bold ${currentTime >= 15 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                        3. เครื่องยนต์ {currentTime >= 15 ? '✓' : ''}
                      </div>
                    </div>

                    {/* Inspection Item Card Mock */}
                    <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-[11px] text-slate-900">
                          ชุดที่ 1: ภายนอกตัวรถ (4 รายการ)
                        </strong>
                        <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                          ✓ ผ่านทั้งหมดในชุดนี้
                        </span>
                      </div>

                      {/* Photo evidence preview with real watermark */}
                      {currentTime < 6 ? (
                        <div className="bg-white border-2 border-dashed border-slate-300 p-2.5 rounded-lg flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">
                            📷 ต้องถ่ายภาพยืนยันประจำชุดที่ 1
                          </span>
                          <span className="bg-[#005c55] text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-outlined text-[13px]">camera</span>
                            เปิดกล้องถ่าย
                          </span>
                        </div>
                      ) : (
                        <div className="relative rounded-lg overflow-hidden border-2 border-[#005c55] h-24 bg-slate-900 flex items-center justify-center">
                          <img
                            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80"
                            alt="Bus inspection"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {/* Automated Watermark overlay */}
                          <div className="absolute bottom-0 inset-x-0 bg-black/85 text-white text-[8px] px-2 py-0.5 flex flex-col justify-center border-t border-emerald-400/40">
                            <div className="flex items-center justify-between text-emerald-300 font-bold">
                              <span>ขสมก. เขต 6 (กปด.36)</span>
                              <span>สาย 4-59 (50010)</span>
                            </div>
                            <div className="text-slate-300 flex items-center justify-between text-[7.5px]">
                              <span>ผู้ตรวจ: นายสมศักดิ์ (60124)</span>
                              <span>22/09/2026 08:30 น.</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-1 text-[10px] pt-0.5">
                        <div className="bg-white border border-slate-200 p-1 rounded flex items-center justify-between">
                          <span className="truncate">1.1 ตัวถัง/กระจก</span>
                          <span className="text-emerald-600 font-bold">✓ ผ่าน</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-1 rounded flex items-center justify-between">
                          <span className="truncate">1.2 ยาง/ไฟ</span>
                          <span className="text-emerald-600 font-bold">✓ ผ่าน</span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Bar */}
                    <button
                      className={`w-full mt-2 py-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 text-white transition-all ${
                        currentTime >= 18
                          ? 'bg-[#005c55] ring-2 ring-emerald-400 scale-[1.02] shadow-md'
                          : 'bg-slate-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        assignment_turned_in
                      </span>
                      <span>
                        {currentTime >= 18
                          ? 'สรุปผลและบันทึกข้อมูล (ไปขั้นตอนที่ 3) →'
                          : 'ตรวจครบทั้ง 3 ชุดแล้วพร้อมสรุปผล'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {currentChapterIndex === 2 && (
                /* Chapter 3: Summary Modal Simulation */
                <div className="relative w-full h-full p-3 sm:p-4 flex flex-col items-center justify-center">
                  <div className="w-[90%] max-w-md bg-white rounded-xl shadow-2xl p-3.5 text-slate-800 border border-slate-200 animate-fadeIn">
                    <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                      <span className="text-[11px] font-bold text-[#005c55] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">fact_check</span>
                        หน้าต่างสรุปผลและลงนามส่งรายงาน
                      </span>
                      <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                        สาย 4-59 (50010)
                      </span>
                    </div>

                    {/* Status Banner */}
                    <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-[22px]">
                          check_circle
                        </span>
                        <div className="text-[10px]">
                          <strong className="text-emerald-900 block font-bold">
                            ผ่านเกณฑ์มาตรฐานครบทั้ง 3 ชุด
                          </strong>
                          <span className="text-emerald-700">รถพร้อมบริการ 100% (กปด.36)</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded-full text-[9px]">
                        พร้อมบริการ
                      </span>
                    </div>

                    {/* 3 Photos Thumbnails */}
                    <div className="grid grid-cols-3 gap-1 text-center text-[9px] mb-2">
                      <div className="bg-slate-100 p-1 rounded border border-slate-200">
                        <div className="h-8 bg-slate-700 rounded text-white flex items-center justify-center text-[10px] mb-0.5">
                          📷 ภายนอก
                        </div>
                        <span className="text-slate-600">ชุดที่ 1</span>
                      </div>
                      <div className="bg-slate-100 p-1 rounded border border-slate-200">
                        <div className="h-8 bg-slate-700 rounded text-white flex items-center justify-center text-[10px] mb-0.5">
                          📷 ภายใน
                        </div>
                        <span className="text-slate-600">ชุดที่ 2</span>
                      </div>
                      <div className="bg-slate-100 p-1 rounded border border-slate-200">
                        <div className="h-8 bg-slate-700 rounded text-white flex items-center justify-center text-[10px] mb-0.5">
                          📷 เครื่องยนต์
                        </div>
                        <span className="text-slate-600">ชุดที่ 3</span>
                      </div>
                    </div>

                    {/* Signature Preview */}
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 mb-2 flex items-center justify-between text-[10px]">
                      <div>
                        <span className="text-slate-500 block text-[8.5px]">ลายมือชื่อผู้ตรวจ:</span>
                        <span className="font-serif italic font-bold text-slate-800 text-[12px]">
                          สมศักดิ์ ขสมก.
                        </span>
                      </div>
                      <span className="text-emerald-600 font-bold">✓ เซ็นรับรองแล้ว</span>
                    </div>

                    {/* Confirm Cloud Submit Button */}
                    <button
                      className={`w-full py-2.5 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 text-white shadow-md transition-all ${
                        currentTime >= 13
                          ? 'bg-[#005c55] ring-2 ring-emerald-400 scale-[1.02] shadow-emerald-500/30'
                          : 'bg-[#005c55]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                      <span>
                        {currentTime >= 13
                          ? '✓ บันทึกสำเร็จ! ซิงค์ Cloud Firestore'
                          : 'ยืนยันและบันทึกข้อมูล (ส่งรายงาน)'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {currentChapterIndex === 3 && (
                /* Chapter 4: Step 3 Dashboard Simulation */
                <div className="relative w-full h-full p-3 sm:p-4 flex flex-col items-center justify-center">
                  <div className="w-[92%] max-w-md bg-white rounded-xl shadow-2xl p-3 text-slate-800 border border-slate-200 animate-fadeIn">
                    <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                      <span className="text-[11px] font-bold text-[#005c55] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">dashboard</span>
                        STEP 3 • แดชบอร์ดสรุปผล ขสมก. เขต 6
                      </span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Cloud Real-time
                      </span>
                    </div>

                    {/* 4 Stats metrics */}
                    <div className="grid grid-cols-4 gap-1.5 text-center mb-2 text-[10px]">
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        <span className="text-[8.5px] text-slate-500 block">ตรวจวันนี้</span>
                        <strong className="text-[14px] text-slate-800">48</strong>
                      </div>
                      <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                        <span className="text-[8.5px] text-emerald-700 block">พร้อมบริการ</span>
                        <strong className="text-[14px] text-emerald-700">46</strong>
                      </div>
                      <div className="bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                        <span className="text-[8.5px] text-rose-700 block">ต้องซ่อม</span>
                        <strong className="text-[14px] text-rose-700">2</strong>
                      </div>
                      <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-200">
                        <span className="text-[8.5px] text-blue-700 block">ความพร้อม</span>
                        <strong className="text-[14px] text-blue-700">95.8%</strong>
                      </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="grid grid-cols-3 gap-1 mb-2 text-[9.5px]">
                      <button className="p-1 rounded-lg font-bold flex items-center justify-center gap-0.5 bg-rose-600 text-white shadow-xs">
                        <span className="material-symbols-outlined text-[12px]">picture_as_pdf</span>
                        <span>📄 รายงาน PDF</span>
                      </button>
                      <button
                        className={`p-1 rounded-lg font-bold flex items-center justify-center gap-0.5 transition-all ${
                          currentTime >= 8 && currentTime <= 14
                            ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                            : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">chat</span>
                        <span>📋 ส่ง LINE</span>
                      </button>
                      <button className="p-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold flex items-center justify-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">download</span>
                        <span>📥 CSV</span>
                      </button>
                    </div>

                    {/* Toast notification during LINE copy simulation */}
                    {currentTime >= 8 && currentTime <= 14 && (
                      <div className="bg-slate-900 text-emerald-300 text-[10px] px-2.5 py-1 rounded-md text-center mb-2 animate-bounce flex items-center justify-center gap-1 shadow-md">
                        <span className="material-symbols-outlined text-[14px] text-emerald-400">check</span>
                        <span>คัดลอกข้อความสรุปยอดประจำวันส่งกลุ่ม LINE สำเร็จแล้ว!</span>
                      </div>
                    )}

                    {/* Restart Button highlight */}
                    <button
                      className={`w-full py-2.5 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 text-white shadow-lg transition-all ${
                        currentTime >= 15
                          ? 'bg-[#005c55] ring-4 ring-emerald-300 scale-[1.02] animate-pulse'
                          : 'bg-[#005c55]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">replay</span>
                      <span>🔄 เริ่มต้นใหม่ (ตรวจคันถัดไป)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Subtitle / Teleprompter Banner */}
              <div className="absolute bottom-12 inset-x-4 z-20 flex justify-center pointer-events-none">
                <div className="bg-black/85 text-emerald-300 text-[12px] sm:text-[13px] px-4 py-2 rounded-full border border-emerald-500/40 backdrop-blur-md shadow-lg text-center max-w-xl animate-fadeIn font-medium">
                  {currentSubtitle}
                </div>
              </div>

              {/* Chapter Tag Watermark */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>
                  บทที่ {currentChapter.id}/{CHAPTERS.length}: {currentChapter.stepName}
                </span>
              </div>
            </div>

            {/* Video Player Control Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-2">
              {/* Scrubbing timeline */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>
                  {Math.floor(currentTime / 60)}:
                  {String(Math.floor(currentTime % 60)).padStart(2, '0')}
                </span>
                <input
                  type="range"
                  min="0"
                  max={currentChapter.duration}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span>
                  {Math.floor(currentChapter.duration / 60)}:
                  {String(Math.floor(currentChapter.duration % 60)).padStart(2, '0')}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer"
                    title={isPlaying ? 'หยุดชั่วคราว' : 'เล่นต่อ'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTime(0);
                      setIsPlaying(true);
                    }}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="เริ่มบทนี้ใหม่"
                  >
                    <span className="material-symbols-outlined text-[18px]">replay</span>
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isMuted ? 'text-rose-400 bg-rose-950/40' : 'text-slate-300 hover:text-white'
                    }`}
                    title={isMuted ? 'เปิดเสียงบรรยาย' : 'ปิดเสียงบรรยาย'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isMuted ? 'volume_off' : 'volume_up'}
                    </span>
                  </button>

                  {/* Playback rate */}
                  <button
                    onClick={() => setPlaybackRate((r) => (r === 1 ? 1.5 : r === 1.5 ? 2 : 1))}
                    className="px-2 py-1 text-[11px] font-bold bg-slate-800 text-slate-300 hover:text-white rounded-md transition-colors"
                  >
                    {playbackRate}x
                  </button>
                </div>

                {/* Chapter step navigators */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentChapterIndex === 0}
                    onClick={() => handleSelectChapter(currentChapterIndex - 1)}
                    className="px-2.5 py-1 rounded-lg text-[12px] bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    ← ก่อนหน้า
                  </button>
                  <button
                    disabled={currentChapterIndex === CHAPTERS.length - 1}
                    onClick={() => handleSelectChapter(currentChapterIndex + 1)}
                    className="px-2.5 py-1 rounded-lg text-[12px] bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    ถัดไป →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Chapter Playlist & Interactive Manual */}
          <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col">
            {/* Nav Tabs */}
            <div className="flex border-b border-slate-800 p-2 gap-1 bg-slate-950/50">
              <button
                onClick={() => setActiveTab('video')}
                className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${
                  activeTab === 'video'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                บทเรียน (3 ตอน)
              </button>
              <button
                onClick={() => setActiveTab('steps')}
                className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${
                  activeTab === 'steps'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                สรุปย่อ
              </button>
            </div>

            {/* Playlist list */}
            {activeTab === 'video' && (
              <div className="p-3 overflow-y-auto space-y-2 flex-1 max-h-[260px] lg:max-h-none">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  เลือกเนื้อหาที่ต้องการดู:
                </span>
                {CHAPTERS.map((chap, idx) => {
                  const isCurrent = currentChapterIndex === idx;
                  return (
                    <div
                      key={chap.id}
                      onClick={() => handleSelectChapter(idx)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-emerald-950/60 border-emerald-500/80 text-white ring-1 ring-emerald-500/40'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            isCurrent
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {chap.stepName}
                        </span>
                        <span className="text-[11px] text-slate-400">{chap.duration} วิ</span>
                      </div>
                      <h4 className="font-bold text-[13px] leading-tight mb-1">{chap.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{chap.description}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Summary View */}
            {activeTab === 'steps' && (
              <div className="p-3.5 overflow-y-auto space-y-3 flex-1 text-[12px]">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1.5">
                  <strong className="text-emerald-400 block text-[13px]">
                    {currentChapter.stepName} • ข้อควรทราบ:
                  </strong>
                  <ul className="space-y-1.5 text-slate-300">
                    {currentChapter.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Quick Action Button to Jump to App Steps */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  onClose();
                  if (onJumpToStep) {
                    if (currentChapterIndex === 0) onJumpToStep('info');
                    else if (currentChapterIndex === 1 || currentChapterIndex === 2) onJumpToStep('inspect');
                    else onJumpToStep('dashboard');
                  }
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                <span>ลองทำตามใน {currentChapter.stepName} ตอนนี้</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
