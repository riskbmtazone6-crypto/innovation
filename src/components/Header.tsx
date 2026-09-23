import React from 'react';
import headerBannerImg from '../assets/images/bmta_smart_header_1790140876211.jpg';

interface HeaderProps {
  activeTab: 'info' | 'inspect' | 'dashboard';
  setActiveTab: (tab: 'info' | 'inspect' | 'dashboard') => void;
  isFirebaseConnected: boolean;
  onOpenTutorial: () => void;
  onOpenManual: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isFirebaseConnected,
  onOpenTutorial,
  onOpenManual
}) => {
  return (
    <header className="relative w-full overflow-hidden bg-slate-950 text-white shadow-xl border-b border-emerald-500/20 select-none">
      {/* Background Banner Image */}
      <img
        src={headerBannerImg}
        alt="BMTA Zone 6 Smart Inspection"
        className="absolute inset-0 w-full h-full object-cover object-[center_35%] pointer-events-none transition-transform duration-1000 scale-100 hover:scale-105"
        referrerPolicy="no-referrer"
      />

      {/* Cinematic Gradient Overlays to guarantee 100% legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/65 to-slate-950/88 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-3.5 sm:px-5 pt-3 pb-3.5 sm:py-4 flex flex-col justify-between gap-3">
        {/* Top Utility & Brand Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Brand & Organization Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#005c55] to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-400/40 shrink-0">
              <span className="material-symbols-outlined text-[24px] sm:text-[26px]">
                directions_bus
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-[16px] sm:text-[19px] md:text-[21px] text-white tracking-tight leading-tight drop-shadow-md">
                  BMTA Zone 6 Smart Inspection
                </h1>
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  ตรวจจริง ถ่ายจริง บันทึกจริง
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[11px] sm:text-[12px] text-slate-300 flex-wrap">
                <span className="text-emerald-300 font-semibold">
                  ขสมก. เขตการเดินรถที่ 6
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 text-[10.5px] sm:text-[12px]">
                  (กปด.16 อู่ไร่ขิง / กปด.26 อู่พุทธมณฑลสาย 3 / กปด.36 อู่พุทธมณฑลสาย 3)
                </span>
                {isFirebaseConnected && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-500/40 backdrop-blur-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Cloud Sync</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Guide & Tutorial Modals Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenManual}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 text-[12px] sm:text-[12.5px] font-bold transition-all shadow-md backdrop-blur-md cursor-pointer active:scale-95"
              title="เปิดคู่มือการใช้งานระบบพร้อมภาพหน้าจอทุกเมนู"
            >
              <span className="material-symbols-outlined text-[17px] text-emerald-400">
                menu_book
              </span>
              <span className="hidden sm:inline">คู่มือทุกหน้าจอ</span>
              <span className="sm:hidden">คู่มือ</span>
            </button>

            <button
              type="button"
              onClick={onOpenTutorial}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900/80 text-rose-200 border border-red-500/40 text-[12px] sm:text-[12.5px] font-bold transition-all shadow-md backdrop-blur-md cursor-pointer active:scale-95"
              title="เปิดวิดีโอสอนการใช้งาน 3 ขั้นตอน"
            >
              <span className="material-symbols-outlined text-[17px] text-red-400 animate-pulse">
                play_circle
              </span>
              <span className="hidden sm:inline">วิดีโอสอนใช้งาน</span>
              <span className="sm:hidden">วิดีโอ</span>
            </button>
          </div>
        </div>

        {/* Bottom Menu & Quick Step Navigation Bar (Positioned directly ON the banner) */}
        <div className="pt-1 sm:pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* 3 Main Workflow Tabs Overlaid on Image */}
          <nav className="flex items-center bg-slate-900/85 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-xl overflow-x-auto">
            {/* Step 1: Info & QR */}
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'info'
                  ? 'bg-gradient-to-r from-[#005c55] to-emerald-600 text-white shadow-lg shadow-emerald-950/70 border border-emerald-400/50 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[12px] font-black ${
                  activeTab === 'info'
                    ? 'bg-white text-[#005c55]'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                1
              </div>
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>ข้อมูล & สแกน QR</span>
            </button>

            {/* Step 2: Inspection */}
            <button
              type="button"
              onClick={() => setActiveTab('inspect')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'inspect'
                  ? 'bg-gradient-to-r from-[#005c55] to-emerald-600 text-white shadow-lg shadow-emerald-950/70 border border-emerald-400/50 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[12px] font-black ${
                  activeTab === 'inspect'
                    ? 'bg-white text-[#005c55]'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                2
              </div>
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span>ตรวจสภาพ 3 ชุด</span>
            </button>

            {/* Step 3: Dashboard */}
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#005c55] to-emerald-600 text-white shadow-lg shadow-emerald-950/70 border border-emerald-400/50 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[12px] font-black ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-[#005c55]'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                3
              </div>
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span>แดชบอร์ดสรุปผล</span>
            </button>
          </nav>

          {/* Interactive Feature Shortcuts (Matching the 3 Circular Badges in user's image) */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className="group px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-emerald-500/50 text-[11.5px] font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm backdrop-blur-xs"
              title="สแกน QR Code ประจำรถ ดึงสายเดินรถ (เซล B) และเลขข้างรถ (เซล D)"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <span className="material-symbols-outlined text-[14px]">qr_code_2</span>
              </div>
              <span>สแกน QR รถ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inspect')}
              className="group px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-emerald-500/50 text-[11.5px] font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm backdrop-blur-xs"
              title="ถ่ายภาพหลักฐานพร้อมลายน้ำระบุรถและเวลา"
            >
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors">
                <span className="material-symbols-outlined text-[14px]">add_a_photo</span>
              </div>
              <span>ถ่ายภาพลายน้ำ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="group px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-emerald-500/50 text-[11.5px] font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm backdrop-blur-xs"
              title="ดูสถิติความพร้อมกองรถ รายงาน PDF และสรุปส่ง LINE"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <span className="material-symbols-outlined text-[14px]">bar_chart</span>
              </div>
              <span>แดชบอร์ด & รายงาน</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
