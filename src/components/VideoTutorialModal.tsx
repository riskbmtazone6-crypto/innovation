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
    title: 'ระบุข้อมูลผู้ตรวจ & สแกน QR Code ประจำรถ',
    stepName: 'Step 1',
    duration: 18,
    description: 'กรอกชื่อผู้ตรวจ เลือกกลุ่มงาน (กปด.) และสแกน QR Code หน้ารถหรือข้างรถเพื่อดึงสาย (เซล B) และเลขข้างรถ (เซล D) อัตโนมัติ',
    keyPoints: [
      'ระบุชื่อ-นามสกุลผู้ตรวจ และเลือกกลุ่มงานปฏิบัติการเดินรถ',
      'กดปุ่ม "เปิดกล้องสแกน QR" ส่องไปที่ QR ประจำรถ',
      'ระบบดึงสายเดินรถจาก เซล B และเลขข้างรถจาก เซล D ให้อัตโนมัติทันที',
      'กดปุ่ม "เริ่มการตรวจ (ไปขั้นตอนที่ 2)"'
    ],
    subtitles: [
      { time: 0, text: 'ยินดีต้อนรับสู่ระบบตรวจสภาพรถโดยสาร ขสมก. เขต 6' },
      { time: 3, text: 'ขั้นตอนที่ 1: ให้กรอกชื่อผู้ตรวจ และเลือกกลุ่มงานเดินรถ' },
      { time: 7, text: 'จากนั้นกดปุ่ม "เปิดกล้องสแกน QR" ส่องที่ QR Code หน้ารถ' },
      { time: 11, text: 'ระบบจะดึงสายเดินรถจากเซล B และเลขข้างรถจากเซล D ให้อัตโนมัติ' },
      { time: 15, text: 'เมื่อข้อมูลครบถ้วนแล้ว ให้กดปุ่ม "เริ่มการตรวจ" เพื่อไปขั้นตอนที่ 2' }
    ]
  },
  {
    id: 2,
    title: 'ตรวจ 3 ชุดรายการมาตรฐาน (ภายนอก, ภายใน, เครื่องยนต์) & ถ่ายภาพยืนยัน',
    stepName: 'Step 2',
    duration: 22,
    description: 'ตรวจเช็คลิสต์ 3 ชุดรายการหลัก ถ่ายภาพยืนยันชุดละ 1 ภาพ พร้อมประทับลายน้ำข้อมูลรถและเวลาอัตโนมัติ',
    keyPoints: [
      'ชุดที่ 1 ภายนอกตัวรถ: ถ่ายภาพ 1 ภาพ + เช็ครายการย่อยตัวถัง ไฟส่องสว่าง ยางรถ',
      'ชุดที่ 2 ภายในห้องโดยสาร: ถ่ายภาพ 1 ภาพ + เช็คประตู CCTV แอร์ ค้อนฉุกเฉิน ถังดับเพลิง',
      'ชุดที่ 3 ระบบเครื่องยนต์: ถ่ายภาพห้องเครื่อง 1 ภาพ + เช็คการรั่วซึม ลมเบรก น้ำมันเครื่อง ควันดำ',
      'กดปุ่ม "ผ่านทั้งหมดในชุดนี้" หรือเลือกผ่าน/ไม่ผ่านเป็นรายข้อ',
      'เมื่อครบทั้ง 3 ชุด กด "สรุปผลและบันทึกข้อมูล" ไปยังขั้นตอนที่ 3'
    ],
    subtitles: [
      { time: 0, text: 'ขั้นตอนที่ 2: ตรวจสอบสภาพรถแบบ 3 ชุดรายการมาตรฐาน' },
      { time: 4, text: 'ชุดที่ 1 ภายนอกตัวรถ: ถ่ายภาพยืนยัน 1 ภาพ และเช็ครายการย่อยภายนอก' },
      { time: 8, text: 'ชุดที่ 2 ภายในห้องโดยสาร: ถ่ายภาพ 1 ภาพ และเช็ครายการย่อยในห้องโดยสาร' },
      { time: 13, text: 'ชุดที่ 3 ระบบเครื่องยนต์: ถ่ายภาพห้องเครื่อง 1 ภาพ และเช็ครายการย่อยเครื่องยนต์' },
      { time: 17, text: 'เมื่อตรวจครบทั้ง 3 ชุด ให้กดปุ่ม "สรุปผลและบันทึกข้อมูล" เพื่อส่งรายงาน' }
    ]
  },
  {
    id: 3,
    title: 'แดชบอร์ดสรุปผล Cloud & เริ่มต้นตรวจคันถัดไป',
    stepName: 'Step 3',
    duration: 16,
    description: 'ดูรายงานสรุปผล Real-time บนคลาวด์ และกดเริ่มต้นใหม่เพื่อตรวจคันต่อไปได้อย่างต่อเนื่อง',
    keyPoints: [
      'ข้อมูลจะถูกซิงค์ขึ้นระบบ Cloud Firestore แบบ Real-time ทันที',
      'ดูสถิติภาพรวม ยอดผ่าน/ไม่ผ่าน และรายการบันทึกย้อนหลัง',
      'กดปุ่ม "🔄 เริ่มต้นใหม่ (ตรวจคันถัดไป)" เพื่อล้างค่าและกลับไป Step 1 ทันที'
    ],
    subtitles: [
      { time: 0, text: 'ขั้นตอนที่ 3: ระบบบันทึกผลขึ้น Cloud Firestore ทันที' },
      { time: 4, text: 'สามารถดูรายงานสถิติ และประวัติการตรวจย้อนหลังได้ใน Dashboard' },
      { time: 9, text: 'หากต้องการตรวจคันถัดไป ให้กดปุ่ม "เริ่มต้นใหม่ (ตรวจคันถัดไป)"' },
      { time: 13, text: 'ระบบจะรีเซ็ตฟอร์มให้สะอาด และกลับไปที่ Step 1 พร้อมตรวจต่อทันที' }
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
                เขตการเดินรถที่ 6 • สแกน QR, ถ่ายภาพประเมิน 12 จุด, และแดชบอร์ด
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
                <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
                  {/* Background app mock */}
                  <div className="w-[85%] max-w-md bg-white rounded-xl shadow-2xl p-4 text-slate-800 border border-slate-200 animate-fadeIn">
                    <div className="flex items-center justify-between border-b pb-2 mb-3">
                      <span className="text-[12px] font-bold text-[#005c55] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#005c55]"></span>
                        STEP 1 • ข้อมูลผู้ตรวจและรถโดยสาร
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        ขสมก. เขต 6
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="bg-slate-50 p-2 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[9px]">1. ชื่อผู้ตรวจ:</span>
                        <strong className="text-slate-800">
                          {currentTime > 3 ? 'นายสุรศักดิ์ สุขใจ (สายตรวจ)' : 'กำลังพิมพ์ชื่อ...'}
                        </strong>
                      </div>

                      <div className="bg-slate-50 p-2 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[9px]">2. กลุ่มงาน:</span>
                        <strong className="text-slate-800">กลุ่มงานปฏิบัติการเดินรถที่ 1 (กปด.16)</strong>
                      </div>

                      {/* QR Scan Action Box */}
                      <div
                        className={`p-2.5 rounded-lg border transition-all ${
                          currentTime >= 7 && currentTime <= 12
                            ? 'bg-[#005c55] text-white ring-2 ring-emerald-400'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">
                              qr_code_scanner
                            </span>
                            <span className="font-bold">
                              {currentTime >= 11
                                ? '✓ สแกน QR Code สำเร็จแล้ว'
                                : currentTime >= 7
                                ? '📷 กำลังสแกน QR Code...'
                                : '3. สแกน QR Code ประจำรถ'}
                            </span>
                          </div>
                          {currentTime >= 11 && (
                            <span className="text-[9px] bg-white text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                              Auto-filled
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Auto-filled values */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-slate-100 p-2 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[9px]">สายเดินรถ:</span>
                          <strong className="text-[#005c55] text-[13px]">
                            {currentTime >= 11 ? '511' : '-'}
                          </strong>
                        </div>
                        <div className="bg-slate-100 p-2 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[9px]">เลขข้างรถ:</span>
                          <strong className="text-[#005c55] text-[13px]">
                            {currentTime >= 11 ? '3-50212' : '-'}
                          </strong>
                        </div>
                      </div>

                      {/* Next button */}
                      <button
                        className={`w-full py-2 rounded-lg font-bold text-center text-[12px] transition-all ${
                          currentTime >= 14
                            ? 'bg-[#005c55] text-white ring-2 ring-emerald-400 scale-[1.02]'
                            : 'bg-slate-300 text-slate-500'
                        }`}
                      >
                        เริ่มการตรวจ (ไปขั้นตอนที่ 2) →
                      </button>
                    </div>
                  </div>

                  {/* QR Overlay laser animation when scanning */}
                  {currentTime >= 7 && currentTime <= 11 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs animate-fadeIn">
                      <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-[64px] text-white/80">
                          qr_code_2
                        </span>
                        <div className="w-full h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce"></div>
                        <span className="absolute bottom-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          สาย 511 | 3-50212
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentChapterIndex === 1 && (
                /* Chapter 2: Step 2 Simulation */
                <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
                  <div className="w-[88%] max-w-md bg-white rounded-xl shadow-2xl p-3.5 text-slate-800 border border-slate-200 animate-fadeIn">
                    <div className="flex items-center justify-between border-b pb-2 mb-2">
                      <span className="text-[12px] font-bold text-[#005c55] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                        STEP 2 • ถ่ายภาพตรวจสอบ 12 รายการ
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        {currentTime >= 15 ? '12 / 12 จุด' : '1 / 12 จุด'}
                      </span>
                    </div>

                    {/* Inspection Item Card Mock */}
                    <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-[12px] text-slate-900">
                          1. สภาพตัวถัง สี และความสะอาด
                        </strong>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            currentTime >= 12
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {currentTime >= 12 ? '✓ ยืนยันภาพถ่าย (ผ่าน)' : 'รอถ่ายภาพ'}
                        </span>
                      </div>

                      {/* Photo evidence preview or button */}
                      {currentTime < 8 ? (
                        <div className="bg-white border-2 border-dashed border-slate-300 p-3 rounded-lg flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            ต้องถ่ายภาพยืนยันสภาพเพื่อประมวลผล
                          </span>
                          <span className="bg-[#005c55] text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-outlined text-[14px]">camera</span>
                            ถ่ายภาพ
                          </span>
                        </div>
                      ) : (
                        <div className="relative rounded-lg overflow-hidden border-2 border-[#005c55] h-28 bg-slate-900 flex items-center justify-center">
                          <img
                            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80"
                            alt="Bus inspection"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] px-2 py-1 flex items-center justify-between">
                            <span>ขสมก. เขต 6 | สาย 511 (3-50212)</span>
                            <span className="text-emerald-400">✓ ลายน้ำประทับสมบูรณ์</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-1.5 pt-1">
                        <button
                          className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-all ${
                            currentTime >= 12
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-600'
                          }`}
                        >
                          ✓ สภาพผ่านเกณฑ์
                        </button>
                        <button className="px-3 py-1.5 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-600">
                          ✕ ชำรุด
                        </button>
                      </div>
                    </div>

                    {/* Submit Bar */}
                    <button
                      className={`w-full mt-2.5 py-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 text-white transition-all ${
                        currentTime >= 17
                          ? 'bg-[#005c55] ring-2 ring-emerald-400 scale-[1.02]'
                          : 'bg-slate-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        assignment_turned_in
                      </span>
                      <span>
                        {currentTime >= 17
                          ? 'สรุปผลและบันทึกข้อมูล (ไปขั้นตอนที่ 3) →'
                          : 'ถ่ายภาพครบ 12 จุดแล้วพร้อมบันทึก'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {currentChapterIndex === 2 && (
                /* Chapter 3: Step 3 Simulation */
                <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
                  <div className="w-[90%] max-w-md bg-white rounded-xl shadow-2xl p-4 text-slate-800 border border-slate-200 animate-fadeIn">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[22px]">
                        check_circle
                      </span>
                      <div className="text-[11px]">
                        <strong className="text-emerald-900 block">
                          บันทึกข้อมูลเรียบร้อยครบทั้ง 3 ขั้นตอนแล้ว!
                        </strong>
                        <span className="text-emerald-700">
                          ซิงค์ขึ้น Cloud Firestore เรียบร้อย
                        </span>
                      </div>
                    </div>

                    {/* Stats metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-slate-50 p-2 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">ตรวจวันนี้</span>
                        <strong className="text-[16px] text-slate-800">12 คัน</strong>
                      </div>
                      <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
                        <span className="text-[10px] text-emerald-700 block">ผ่านเกณฑ์</span>
                        <strong className="text-[16px] text-emerald-700">11 คัน</strong>
                      </div>
                      <div className="bg-rose-50 p-2 rounded border border-rose-200">
                        <span className="text-[10px] text-rose-700 block">พบปัญหา</span>
                        <strong className="text-[16px] text-rose-700">1 คัน</strong>
                      </div>
                    </div>

                    {/* Restart Button highlight */}
                    <button
                      className={`w-full py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 text-white shadow-lg transition-all ${
                        currentTime >= 8
                          ? 'bg-[#005c55] ring-4 ring-emerald-300 scale-[1.03] animate-pulse'
                          : 'bg-[#005c55]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">replay</span>
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
                    else if (currentChapterIndex === 1) onJumpToStep('inspect');
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
