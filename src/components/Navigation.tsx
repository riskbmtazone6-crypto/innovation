import React from 'react';

interface NavigationProps {
  activeTab: 'info' | 'inspect' | 'dashboard';
  setActiveTab: (tab: 'info' | 'inspect' | 'dashboard') => void;
  badgeCounts?: {
    inspectCount?: number;
    issueCount?: number;
  };
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  badgeCounts
}) => {
  return (
    <nav className="md:hidden bg-white text-[#005c55] font-semibold fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 rounded-t-2xl border-t border-[#bdc9c6] shadow-xl pb-safe">
      {/* Tab 1: ข้อมูล */}
      <button
        onClick={() => setActiveTab('info')}
        className={`flex flex-col items-center justify-center transition-all rounded-xl py-1 px-3 min-w-[64px] ${
          activeTab === 'info'
            ? 'bg-[#a8ece5] text-[#266d68] font-bold scale-105 shadow-xs'
            : 'text-[#3e4947] hover:bg-[#e9edff]'
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">info</span>
        <span className="text-[11px] mt-0.5">ข้อมูล</span>
      </button>

      {/* Tab 2: การตรวจ */}
      <button
        onClick={() => setActiveTab('inspect')}
        className={`flex flex-col items-center justify-center relative transition-all rounded-xl py-1 px-3 min-w-[64px] ${
          activeTab === 'inspect'
            ? 'bg-[#a8ece5] text-[#266d68] font-bold scale-105 shadow-xs'
            : 'text-[#3e4947] hover:bg-[#e9edff]'
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">fact_check</span>
        <span className="text-[11px] mt-0.5">การตรวจ</span>
        {badgeCounts?.inspectCount !== undefined && badgeCounts.inspectCount > 0 && (
          <span className="absolute -top-1 right-2 bg-[#005c55] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {badgeCounts.inspectCount}
          </span>
        )}
      </button>

      {/* Tab 3: แดชบอร์ด */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center justify-center relative transition-all rounded-xl py-1 px-3 min-w-[64px] ${
          activeTab === 'dashboard'
            ? 'bg-[#a8ece5] text-[#266d68] font-bold scale-105 shadow-xs'
            : 'text-[#3e4947] hover:bg-[#e9edff]'
        }`}
      >
        <span
          className="material-symbols-outlined text-[24px]"
          style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}
        >
          dashboard
        </span>
        <span className="text-[11px] mt-0.5">แดชบอร์ด</span>
        {badgeCounts?.issueCount !== undefined && badgeCounts.issueCount > 0 && (
          <span className="absolute -top-1 right-2 bg-[#b91c1c] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {badgeCounts.issueCount}
          </span>
        )}
      </button>
    </nav>
  );
};
