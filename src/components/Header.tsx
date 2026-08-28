import React from 'react';

interface HeaderProps {
  activeTab: 'info' | 'inspect' | 'dashboard';
  setActiveTab: (tab: 'info' | 'inspect' | 'dashboard') => void;
  isFirebaseConnected: boolean;
  onOpenTutorial: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isFirebaseConnected,
  onOpenTutorial
}) => {
  return (
    <header className="bg-white border-b border-[#e5e7eb] sticky top-0 w-full z-50 shadow-xs">
      <div className="flex items-center justify-between w-full max-w-[1140px] mx-auto px-4 py-3">
        {/* Left: App Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#005c55]/10 text-[#005c55] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">directions_bus</span>
          </div>
          <div>
            <h1 className="font-bold text-[16px] md:text-[18px] text-[#121b2e] leading-tight flex items-center gap-2">
              ตรวจสอบความพร้อมรถโดยสาร เขตการเดินรถที่ 6
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-[#6b7280]">องค์การขนส่งมวลชนกรุงเทพ (ขสมก.)</span>
              {isFirebaseConnected && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803d] animate-pulse"></span>
                  ระบบเชื่อมต่อคลาวด์
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right: Desktop Nav Cluster & Video Tutorial Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenTutorial}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[13px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="เปิดวิดีโอสอนการใช้งาน 3 ขั้นตอน"
          >
            <span className="material-symbols-outlined text-[18px] text-red-600 animate-pulse">play_circle</span>
            <span className="hidden sm:inline">วิดีโอสอนใช้งาน</span>
            <span className="sm:hidden">คู่มือวิดีโอ</span>
          </button>

          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-all cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-[#005c55] text-white shadow-xs'
                  : 'text-[#3e4947] hover:bg-[#f5f7fb]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>ข้อมูล (Step 1)</span>
            </button>

            <button
              onClick={() => setActiveTab('inspect')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-all cursor-pointer ${
                activeTab === 'inspect'
                  ? 'bg-[#005c55] text-white shadow-xs'
                  : 'text-[#3e4947] hover:bg-[#f5f7fb]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              <span>การตรวจ (Step 2)</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#005c55] text-white shadow-xs'
                  : 'text-[#3e4947] hover:bg-[#f5f7fb]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span>แดชบอร์ด (Step 3)</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

