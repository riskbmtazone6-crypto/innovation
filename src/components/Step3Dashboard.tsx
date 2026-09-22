import React, { useState, useMemo } from 'react';
import { InspectionRecord } from '../types';
import { updateInspectionStatus, deleteInspection } from '../firebase/config';

interface Step3DashboardProps {
  records: InspectionRecord[];
  onStartNewInspection: () => void;
  justCompletedInspection?: boolean;
}

export const Step3Dashboard: React.FC<Step3DashboardProps> = ({
  records,
  onStartNewInspection,
  justCompletedInspection = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'urgent'>('overview');
  const [displayMode, setDisplayMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail' | 'pending'>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Compute key summary statistics
  const totalInspected = records.length;
  const totalPassed = records.filter((r) => r.overallStatus === 'pass').length;
  const totalIssues = records.filter((r) => r.overallStatus === 'fail').length;
  const totalPending = records.filter((r) => r.overallStatus === 'pending').length;
  const passRate = totalInspected > 0 ? Math.round((totalPassed / totalInspected) * 100) : 0;
  const TOTAL_FLEET = 326; // ขสมก. เขต 6 รวม 326 คัน
  const fleetProgress = Math.min(100, Math.round((totalInspected / TOTAL_FLEET) * 100));

  // Route breakdown analytics
  const routeStats = useMemo(() => {
    const map: Record<string, { total: number; pass: number; fail: number }> = {};
    records.forEach((r) => {
      const key = r.busRoute || 'ไม่ระบุ';
      if (!map[key]) {
        map[key] = { total: 0, pass: 0, fail: 0 };
      }
      map[key].total += 1;
      if (r.overallStatus === 'pass') map[key].pass += 1;
      if (r.overallStatus === 'fail') map[key].fail += 1;
    });
    return Object.entries(map)
      .map(([route, stat]) => ({
        route,
        total: stat.total,
        pass: stat.pass,
        fail: stat.fail,
        rate: Math.round((stat.pass / stat.total) * 100)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [records]);

  // Defect Categories Breakdown
  const categoryIssues = useMemo(() => {
    let exterior = 0;
    let interior = 0;
    let engine = 0;

    records.forEach((r) => {
      if (r.overallStatus === 'fail') {
        const text = (r.issuesSummary || '').toLowerCase();
        if (text.includes('ภายนอก') || text.includes('ยาง') || text.includes('ไฟ') || text.includes('กระจก') || text.includes('สี')) {
          exterior++;
        }
        if (text.includes('ภายใน') || text.includes('เบาะ') || text.includes('กริ่ง') || text.includes('ค้อน') || text.includes('ถังดับเพลิง') || text.includes('แอร์')) {
          interior++;
        }
        if (text.includes('เครื่อง') || text.includes('น้ำมัน') || text.includes('เบรก') || text.includes('ควัน') || text.includes('เสียง')) {
          engine++;
        }
        // Fallback default distribution if not specifically tagged
        if (!text.includes('ภายนอก') && !text.includes('ภายใน') && !text.includes('เครื่อง')) {
          exterior++;
        }
      }
    });

    const maxVal = Math.max(exterior, interior, engine, 1);
    return [
      { id: 'exterior', label: '1. ภายนอกตัวรถ (ยาง/ไฟ/กระจก)', count: exterior, percent: Math.round((exterior / maxVal) * 100) },
      { id: 'interior', label: '2. ภายในห้องโดยสาร (กริ่ง/ค้อน/อุปกรณ์ความปลอดภัย)', count: interior, percent: Math.round((interior / maxVal) * 100) },
      { id: 'engine', label: '3. ห้องเครื่องยนต์/ระบบขับเคลื่อน (น้ำมัน/เบรก/ระบบไฟ)', count: engine, percent: Math.round((engine / maxVal) * 100) }
    ];
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        r.busRoute.toLowerCase().includes(query) ||
        r.busNumber.toLowerCase().includes(query) ||
        r.inspectorName.toLowerCase().includes(query) ||
        (r.inspectorId && r.inspectorId.toLowerCase().includes(query)) ||
        r.issuesSummary.toLowerCase().includes(query);

      const matchStatus = statusFilter === 'all' || r.overallStatus === statusFilter;
      const matchGroup = groupFilter === 'all' || r.operationGroup === groupFilter;

      return matchQuery && matchStatus && matchGroup;
    });
  }, [records, searchQuery, statusFilter, groupFilter]);

  // Urgent failed records
  const urgentRecords = useMemo(() => {
    return records.filter((r) => r.overallStatus === 'fail');
  }, [records]);

  const handleUpdateStatus = async (
    recordId: string,
    newStatus: 'pass' | 'fail' | 'pending'
  ) => {
    setIsUpdating(true);
    try {
      await updateInspectionStatus(recordId, newStatus);
      if (selectedRecord && selectedRecord.id === recordId) {
        setSelectedRecord({ ...selectedRecord, overallStatus: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm('คุณต้องการลบรายการตรวจนี้ใช่หรือไม่?')) {
      try {
        await deleteInspection(recordId);
        if (selectedRecord && selectedRecord.id === recordId) {
          setSelectedRecord(null);
        }
      } catch (err) {
        console.error('Failed to delete record:', err);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['วันเวลา,สายรถ,เบอร์รถ,กลุ่มงาน,รหัสผู้ตรวจ,ชื่อผู้ตรวจ,ผลการตรวจ,ปัญหาที่พบ'];
    const rows = filteredRecords.map(
      (r) =>
        `"${r.dateStr} ${r.timeStr}","${r.busRoute}","${r.busNumber}","${r.operationGroupName}","${r.inspectorId || '-'}","${r.inspectorName}","${r.overallStatus}","${r.issuesSummary}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BMTA_Zone6_Inspection_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLineSummary = () => {
    const now = new Date();
    const thaiDate = now.toLocaleDateString('th-TH');
    let text = `🚌 สรุปผลการตรวจสภาพรถ ขสมก. เขตการเดินรถที่ 6\n`;
    text += `📅 ประจำวันที่: ${thaiDate}\n`;
    text += `------------------------------------\n`;
    text += `✅ ตรวจแล้วทั้งหมด: ${totalInspected} คัน (จากเป้าหมาย ${TOTAL_FLEET} คัน)\n`;
    text += `🟢 ผ่านมาตรฐาน: ${totalPassed} คัน (${passRate}%)\n`;
    text += `🔴 พบปัญหาข้อบกพร่อง: ${totalIssues} คัน\n`;
    text += `🟡 รอดำเนินการ: ${totalPending} คัน\n`;

    if (urgentRecords.length > 0) {
      text += `\n⚠️ รายการรถที่พบปัญหาต้องดำเนินการแก้ไข:\n`;
      urgentRecords.slice(0, 5).forEach((u, i) => {
        text += `${i + 1}. สาย ${u.busRoute} (เลขข้างรถ ${u.busNumber}): ${u.issuesSummary || 'มีข้อบกพร่อง'}\n`;
      });
      if (urgentRecords.length > 5) {
        text += `...และอีก ${urgentRecords.length - 5} คัน\n`;
      }
    }
    text += `------------------------------------\n`;
    text += `รายงานผ่านระบบ BMTA Zone 6 Digital Inspection`;

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 3000);
  };

  return (
    <div className="w-full max-w-[1140px] mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
      {/* Top Header & Fast Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 md:p-6 border border-[#e5e7eb] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-[#005c55] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">bar_chart</span>
            </span>
            <h2 className="font-bold text-[20px] md:text-[24px] text-[#121b2e]">
              STEP 3 • Dashboard ผู้บริหารและหัวหน้างาน
            </h2>
          </div>
          <p className="text-[13px] text-[#64748b] mt-1 ml-11">
            ศูนย์วิเคราะห์ความพร้อมและการตรวจสภาพรถโดยสาร ขสมก. เขตการเดินรถที่ 6 (กองตรวจการ)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyLineSummary}
            className="px-3.5 py-2.5 rounded-xl bg-[#e8f5e9] text-[#1b5e20] hover:bg-[#c8e6c9] text-[13px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-[#a5d6a7]"
            title="คัดลอกข้อความสรุปผลเพื่อส่งเข้ากลุ่ม LINE ขสมก."
          >
            <span className="material-symbols-outlined text-[18px]">
              {copyFeedback ? 'check' : 'content_copy'}
            </span>
            <span>{copyFeedback ? '✓ คัดลอกสำเร็จ!' : 'สรุปส่ง LINE'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#cbd5e1] text-[#334155] text-[13px] font-bold hover:bg-[#f8fafc] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>ส่งออก CSV</span>
          </button>

          <button
            type="button"
            onClick={onStartNewInspection}
            className="px-4 py-2.5 rounded-xl bg-[#005c55] hover:bg-[#0f766e] text-white text-[13px] font-bold flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,92,85,0.2)] cursor-pointer transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>เริ่มตรวจคันใหม่</span>
          </button>
        </div>
      </div>

      {/* Success banner when completing all 3 steps */}
      {justCompletedInspection && (
        <div className="bg-gradient-to-r from-[#dcfce7] to-[#ecfdf5] border border-[#86efac] rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#15803d] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">task_alt</span>
            </div>
            <div>
              <h3 className="font-bold text-[#14532d] text-[15px] md:text-[16px]">
                บันทึกข้อมูลเรียบร้อยครบทั้ง 3 ขั้นตอนแล้ว!
              </h3>
              <p className="text-[13px] text-[#166534] mt-0.5">
                ผลการตรวจสอบถูกจัดเก็บและอัปเดตลงฐานข้อมูลระบบเรียบร้อย พร้อมสำหรับการเริ่มต้นตรวจสอบคันถัดไป
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStartNewInspection}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            <span>เริ่มต้นใหม่ (ตรวจคันถัดไป)</span>
          </button>
        </div>
      )}

      {/* KPI Metric Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Total Inspected */}
        <div className="bg-white rounded-2xl p-4.5 border border-[#e2e8f0] shadow-xs flex flex-col justify-between h-32 relative overflow-hidden group hover:border-[#005c55] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-bold text-[#64748b]">ตรวจแล้วทั้งหมด</span>
            <span className="material-symbols-outlined text-[#005c55] text-[22px]">fact_check</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[30px] font-black text-[#121b2e] leading-none">
                {totalInspected}
              </span>
              <span className="text-[13px] font-semibold text-[#64748b]">คัน</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#005c55] h-full rounded-full transition-all duration-700"
                  style={{ width: `${fleetProgress}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-slate-500">{fleetProgress}% กองรถ</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Passed */}
        <div className="bg-[#f0fdf4] rounded-2xl p-4.5 border border-[#bbf7d0] shadow-xs flex flex-col justify-between h-32 relative overflow-hidden group hover:border-[#16a34a] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-bold text-[#166534]">ผ่านเกณฑ์พร้อมใช้</span>
            <span className="material-symbols-outlined text-[#16a34a] text-[22px]">check_circle</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[30px] font-black text-[#166534] leading-none">
                {totalPassed}
              </span>
              <span className="text-[13px] font-semibold text-[#166534]">คัน</span>
            </div>
            <div className="mt-2 text-[11px] font-bold text-[#15803d]">
              อัตราผ่านเกณฑ์: {passRate}% (เป้าหมาย 95%+)
            </div>
          </div>
        </div>

        {/* Metric 3: Issues Found */}
        <div className="bg-[#fef2f2] rounded-2xl p-4.5 border border-[#fecaca] shadow-xs flex flex-col justify-between h-32 relative overflow-hidden group hover:border-[#dc2626] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-bold text-[#991b1b]">พบปัญหา/ส่งซ่อม</span>
            <span className="material-symbols-outlined text-[#dc2626] text-[22px]">report_problem</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[30px] font-black text-[#991b1b] leading-none">
                {totalIssues}
              </span>
              <span className="text-[13px] font-semibold text-[#991b1b]">คัน</span>
            </div>
            <div className="mt-2 text-[11px] font-bold text-[#b91c1c]">
              {totalIssues > 0 ? '⚠️ ต้องแจ้งช่างซ่อมบำรุง' : '✓ ไม่มีปัญหาร้ายแรง'}
            </div>
          </div>
        </div>

        {/* Metric 4: Fleet Overview */}
        <div className="bg-[#f8fafc] rounded-2xl p-4.5 border border-[#e2e8f0] shadow-xs flex flex-col justify-between h-32 relative overflow-hidden group hover:border-[#0284c7] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-bold text-[#475569]">ขสมก. เขต 6 รวม</span>
            <span className="material-symbols-outlined text-[#0284c7] text-[22px]">directions_bus</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[30px] font-black text-[#0f172a] leading-none">
                {TOTAL_FLEET}
              </span>
              <span className="text-[13px] font-semibold text-[#64748b]">คัน</span>
            </div>
            <div className="mt-2 text-[11px] text-[#64748b] font-medium">
              3 กลุ่มงาน (กปด.16, 26, 36)
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Overview vs Records vs Urgent) */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-[#f1f5f9] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-[#005c55] shadow-xs'
                : 'text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            <span>ภาพรวมและวิเคราะห์สถิติ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'records'
                ? 'bg-white text-[#005c55] shadow-xs'
                : 'text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            <span>รายการตรวจทั้งหมด ({filteredRecords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('urgent')}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'urgent'
                ? 'bg-white text-[#dc2626] shadow-xs'
                : 'text-[#64748b] hover:text-[#dc2626]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>รถที่พบปัญหา ({urgentRecords.length})</span>
          </button>
        </div>

        {activeTab === 'records' && (
          <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setDisplayMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                displayMode === 'table' ? 'bg-white text-[#005c55] shadow-xs' : 'text-[#64748b]'
              }`}
              title="ตารางแบบละเอียด"
            >
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                displayMode === 'cards' ? 'bg-white text-[#005c55] shadow-xs' : 'text-[#64748b]'
              }`}
              title="การ์ดพร้อมภาพถ่าย"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS CHARTS */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* Main Visual Row: Gauge + Fleet Readiness */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Donut Readiness Progress Gauge */}
            <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-[16px] text-[#121b2e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005c55]">pie_chart</span>
                  <span>ดัชนีความพร้อมเดินรถ (Readiness Index)</span>
                </h3>
                <p className="text-[12px] text-[#64748b] mt-0.5">
                  สัดส่วนรถที่พร้อมให้บริการตามมาตรฐาน ขสมก.
                </p>
              </div>

              <div className="my-5 flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      fill="transparent"
                      r="15.915"
                      stroke="#f1f5f9"
                      strokeWidth="3.6"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      fill="transparent"
                      r="15.915"
                      stroke="#10b981"
                      strokeDasharray={`${passRate} ${100 - passRate}`}
                      strokeDashoffset="0"
                      strokeWidth="3.6"
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[28px] font-black text-[#0f172a] leading-none">
                      {passRate}%
                    </span>
                    <span className="text-[11px] text-[#10b981] font-bold mt-1">พร้อมวิ่งบริการ</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                <div className="bg-emerald-50 rounded-xl p-2">
                  <span className="text-[11px] text-emerald-800 font-bold block">ผ่าน</span>
                  <span className="text-[16px] font-black text-emerald-700">{totalPassed}</span>
                </div>
                <div className="bg-red-50 rounded-xl p-2">
                  <span className="text-[11px] text-red-800 font-bold block">ไม่ผ่าน</span>
                  <span className="text-[16px] font-black text-red-700">{totalIssues}</span>
                </div>
                <div className="bg-amber-50 rounded-xl p-2">
                  <span className="text-[11px] text-amber-800 font-bold block">รอตรวจ</span>
                  <span className="text-[16px] font-black text-amber-700">{totalPending}</span>
                </div>
              </div>
            </div>

            {/* Defect Categories Hotspot (3 Inspection Sets Breakdown) */}
            <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-xs lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[16px] text-[#121b2e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#dc2626]">troubleshoot</span>
                    <span>จุดบกพร่องตาม 3 ชุดการตรวจ (Defect Hotspots)</span>
                  </h3>
                  <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                    เขตการเดินรถที่ 6
                  </span>
                </div>
                <p className="text-[12px] text-[#64748b] mt-0.5">
                  จำแนกตาม 3 ชุดการตรวจมาตรฐาน เพื่อส่งซ่อมบำรุงตามฝ่ายที่เกี่ยวข้อง
                </p>
              </div>

              <div className="my-4 flex flex-col gap-4">
                {categoryIssues.map((cat) => (
                  <div key={cat.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-bold text-[#1e293b]">{cat.label}</span>
                      <span className="font-bold text-slate-700">
                        {cat.count} รายการ
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          cat.id === 'exterior'
                            ? 'bg-blue-500'
                            : cat.id === 'interior'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(cat.percent, 8)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#f8fafc] rounded-xl border border-slate-200 text-[12px] text-[#475569] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#005c55]">info</span>
                <span>
                  ข้อแนะนำ: หากพบปัญหาเกี่ยวกับกริ่งสัญญาณหรือค้อนทุบกระจก ให้ส่งฝ่ายซ่อมบำรุงดำเนินการทันทีก่อนนำรถออกวิ่ง
                </span>
              </div>
            </div>
          </div>

          {/* Top Routes Inspection Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[16px] text-[#121b2e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005c55]">route</span>
                  <span>ผลการตรวจสอบจำแนกตามสายเดินรถ (Top Routes)</span>
                </h3>
                <p className="text-[12px] text-[#64748b]">
                  สายเดินรถที่มีการตรวจและประเมินผลความพร้อมในวันนี้
                </p>
              </div>
              <span className="text-[12px] text-[#005c55] font-bold">
                เขต 6 (ปากน้ำ, อู่สายใต้, เมกาบางนา)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {routeStats.length === 0 ? (
                <div className="col-span-3 py-6 text-center text-slate-400 text-[13px]">
                  ยังไม่มีข้อมูลการตรวจสายเดินรถ
                </div>
              ) : (
                routeStats.map((item) => (
                  <div
                    key={item.route}
                    className="p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white hover:border-[#005c55] transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#005c55] text-white flex items-center justify-center font-bold text-[14px]">
                          {item.route}
                        </span>
                        <div>
                          <strong className="text-[14px] text-[#121b2e] block">
                            สาย {item.route}
                          </strong>
                          <span className="text-[11px] text-[#64748b]">ตรวจ {item.total} คัน</span>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.rate >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.rate >= 70
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        ผ่าน {item.rate}%
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748b] border-t border-slate-200/60 pt-2">
                      <span className="text-emerald-700 font-semibold">✓ ผ่าน {item.pass} คัน</span>
                      {item.fail > 0 ? (
                        <span className="text-red-600 font-bold">✕ ต้องแก้ไข {item.fail} คัน</span>
                      ) : (
                        <span className="text-emerald-600">สมบูรณ์ 100%</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL RECORDS (TABLE & CARDS VIEW) */}
      {activeTab === 'records' && (
        <div className="flex flex-col gap-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] text-[20px]">
                  search
                </span>
                <input
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl pl-10 pr-8 py-2.5 text-[14px] text-[#121b2e] focus:outline-none focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55] transition-colors"
                  placeholder="ค้นหา: สายรถ, เบอร์รถ, ชื่อ, ID..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569]"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative w-full sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-[14px] text-[#121b2e] appearance-none focus:outline-none focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55] transition-colors cursor-pointer pr-9"
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="pass">✓ ผ่านการตรวจ</option>
                  <option value="fail">✕ พบปัญหา</option>
                  <option value="pending">⏳ รอดำเนินการ</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none text-[20px]">
                  arrow_drop_down
                </span>
              </div>

              {/* Operation Group Filter */}
              <div className="relative w-full sm:w-52">
                <select
                  value={groupFilter}
                  onChange={(e: any) => setGroupFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-[14px] text-[#121b2e] appearance-none focus:outline-none focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55] transition-colors cursor-pointer pr-9"
                >
                  <option value="all">ทุกกลุ่มงาน (เขต 6)</option>
                  <option value="6-1">กปด.16 (ปากน้ำ/เมกา)</option>
                  <option value="6-2">กปด.26 (แพรกษา/คลองเตย)</option>
                  <option value="6-3">กปด.36 (สายใต้/ฟาร์มจระเข้)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none text-[20px]">
                  arrow_drop_down
                </span>
              </div>
            </div>
          </div>

          {/* TABLE DISPLAY MODE */}
          {displayMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[840px]">
                  <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[13px] font-bold text-[#64748b]">
                    <tr>
                      <th className="px-4 py-3.5">เวลาตรวจ</th>
                      <th className="px-4 py-3.5">สายเดินรถ (เซล B)</th>
                      <th className="px-4 py-3.5">เลขข้างรถ (เซล D)</th>
                      <th className="px-4 py-3.5">ผู้ตรวจ (ID/NAME)</th>
                      <th className="px-4 py-3.5">ผลการตรวจ</th>
                      <th className="px-4 py-3.5">ปัญหาที่พบ</th>
                      <th className="px-4 py-3.5 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px] divide-y divide-[#f1f5f9]">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-[#64748b]">
                          ไม่พบรายการตรวจสอบที่ตรงกับเงื่อนไขการค้นหา
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((rec) => {
                        const isPass = rec.overallStatus === 'pass';
                        const isFail = rec.overallStatus === 'fail';

                        return (
                          <tr
                            key={rec.id || `${rec.timestamp}-${rec.busNumber}`}
                            onClick={() => setSelectedRecord(rec)}
                            className="hover:bg-[#f8fafc] transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-3.5 text-[#64748b] font-mono text-[12px]">
                              {rec.timeStr || '08:00 น.'}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="font-bold text-[#121b2e] bg-slate-100 px-2 py-0.5 rounded text-[13px]">
                                สาย {rec.busRoute}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-[#005c55] font-mono">
                              {rec.busNumber}
                            </td>
                            <td className="px-4 py-3.5 text-[#121b2e]">
                              <div>
                                <strong className="text-[13px] font-semibold block">
                                  {rec.inspectorName}
                                </strong>
                                {rec.inspectorId && (
                                  <span className="text-[11px] font-mono text-slate-500">
                                    ID: {rec.inspectorId}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold border ${
                                  isPass
                                    ? 'bg-[#dcfce7] text-[#15803d] border-[#15803d]/20'
                                    : isFail
                                    ? 'bg-[#fee2e2] text-[#b91c1c] border-[#b91c1c]/20'
                                    : 'bg-[#fffbeb] text-[#b45309] border-[#b45309]/20'
                                }`}
                              >
                                {isPass ? '✓ ผ่าน' : isFail ? '✕ พบปัญหา' : '⏳ รอดำเนินการ'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-[13px] max-w-[220px] truncate">
                              {isPass ? (
                                <span className="text-[#94a3b8]">-</span>
                              ) : (
                                <span className="text-[#b91c1c] font-medium">{rec.issuesSummary}</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRecord(rec);
                                }}
                                className="text-[#005c55] hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 text-[12px] font-bold"
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                                <span>ดูผล</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* CARDS DISPLAY MODE */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((rec) => {
                const isPass = rec.overallStatus === 'pass';
                const hasPhoto = !!(rec.photos?.exteriorUrl || rec.photos?.interiorUrl || rec.photos?.engineUrl);

                return (
                  <div
                    key={rec.id || `${rec.timestamp}-${rec.busNumber}`}
                    onClick={() => setSelectedRecord(rec)}
                    className="bg-white rounded-2xl border border-[#e2e8f0] p-4.5 shadow-xs hover:border-[#005c55] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[12px] font-mono text-slate-500">
                          {rec.dateStr} {rec.timeStr} น.
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isPass
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isPass ? '✓ พร้อมวิ่ง' : '✕ พบข้อบกพร่อง'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-lg bg-[#005c55] text-white font-bold text-[14px]">
                          สาย {rec.busRoute}
                        </span>
                        <strong className="text-[16px] text-[#121b2e] font-mono">
                          เบอร์ {rec.busNumber}
                        </strong>
                      </div>

                      <p className="text-[12px] text-[#64748b] mb-3">
                        ผู้ตรวจ: <strong className="text-[#1e293b]">{rec.inspectorName}</strong>
                        {rec.inspectorId && <span className="text-slate-400 ml-1 font-mono">({rec.inspectorId})</span>}
                      </p>

                      {/* Photo Thumbnail previews if available */}
                      {hasPhoto && (
                        <div className="grid grid-cols-3 gap-1.5 mb-3">
                          {rec.photos?.exteriorUrl && (
                            <img
                              src={rec.photos.exteriorUrl}
                              alt=""
                              className="h-14 w-full object-cover rounded-lg border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          {rec.photos?.interiorUrl && (
                            <img
                              src={rec.photos.interiorUrl}
                              alt=""
                              className="h-14 w-full object-cover rounded-lg border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          {rec.photos?.engineUrl && (
                            <img
                              src={rec.photos.engineUrl}
                              alt=""
                              className="h-14 w-full object-cover rounded-lg border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                      )}

                      {!isPass && rec.issuesSummary && (
                        <div className="bg-red-50 p-2 rounded-lg border border-red-200 text-[11px] text-red-700 font-medium">
                          ⚠️ {rec.issuesSummary}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[12px]">
                      <span className="text-[#64748b] text-[11px]">{rec.operationGroupName}</span>
                      <span className="text-[#005c55] font-bold">ดูรายละเอียด →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: URGENT DEFECT LIST */}
      {activeTab === 'urgent' && (
        <div className="flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-amber-700 text-[24px]">warning</span>
              <div>
                <strong className="text-[14px] text-amber-900 block">
                  รายการรถที่มีข้อบกพร่อง ต้องประสานงานฝ่ายซ่อมบำรุง ({urgentRecords.length} คัน)
                </strong>
                <p className="text-[12px] text-amber-800">
                  โปรดตรวจสอบและแก้ไขปัญหาให้เรียบร้อยก่อนอนุญาตให้ออกเดินรถในเส้นทาง
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyLineSummary}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[12px] flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span>ส่งรายการซ่อมเข้า LINE</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentRecords.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                ✓ ยอดเยี่ยม! ขณะนี้ไม่พบรถที่มีข้อบกพร่อง
              </div>
            ) : (
              urgentRecords.map((item) => (
                <div
                  key={item.id || item.timestamp}
                  className="bg-white rounded-2xl border border-red-200 p-5 shadow-xs flex flex-col justify-between hover:border-red-400 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[14px]">
                          สาย {item.busRoute}
                        </span>
                        <span className="text-[16px] font-bold text-slate-900 font-mono">
                          เบอร์ {item.busNumber}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {item.dateStr} {item.timeStr}
                      </span>
                    </div>

                    <div className="bg-red-50/60 p-3 rounded-xl border border-red-100 text-[13px] text-red-800 mb-3">
                      <strong className="block text-[12px] text-red-900 mb-0.5">ข้อบกพร่องที่พบ:</strong>
                      {item.issuesSummary || 'มีรายการไม่ผ่านการตรวจสอบ'}
                    </div>

                    <p className="text-[12px] text-slate-600">
                      ผู้ตรวจ: <strong className="text-slate-800">{item.inspectorName}</strong>
                      {item.inspectorId && <span className="font-mono text-slate-400 ml-1">({item.inspectorId})</span>}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => item.id && handleUpdateStatus(item.id, 'pass')}
                      disabled={isUpdating}
                      className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[12px] font-bold cursor-pointer transition-colors"
                    >
                      ✓ แก้ไขแล้ว (เปลี่ยนเป็นผ่าน)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(item)}
                      className="text-[#005c55] font-bold text-[13px] hover:underline"
                    >
                      ดูผลการตรวจ 12 จุด →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* RECORD INSPECTION DETAIL MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#e5e7eb] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#005c55] text-[26px]">
                  fact_check
                </span>
                <div>
                  <h3 className="font-bold text-[16px] md:text-[18px] text-[#121b2e]">
                    รายละเอียดการตรวจ: สาย {selectedRecord.busRoute} (เลขข้างรถ {selectedRecord.busNumber})
                  </h3>
                  <p className="text-[12px] text-[#6b7280]">
                    วันที่: {selectedRecord.dateStr} เวลา: {selectedRecord.timeStr} น. • ผู้ตรวจ: {selectedRecord.inspectorName}
                    {selectedRecord.inspectorId && ` (ID: ${selectedRecord.inspectorId})`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-[#6b7280] hover:text-[#121b2e] p-1 rounded-full hover:bg-[#e5e7eb] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Overall Status Banner */}
              <div
                className={`p-4 rounded-xl flex items-center justify-between border ${
                  selectedRecord.overallStatus === 'pass'
                    ? 'bg-[#dcfce7] border-[#15803d]/30 text-[#15803d]'
                    : selectedRecord.overallStatus === 'fail'
                    ? 'bg-[#fee2e2] border-[#b91c1c]/30 text-[#b91c1c]'
                    : 'bg-[#fffbeb] border-[#b45309]/30 text-[#b45309]'
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider block">
                    สถานะการประเมิน
                  </span>
                  <p className="font-bold text-[16px]">
                    {selectedRecord.overallStatus === 'pass'
                      ? '✓ ผ่านการตรวจสอบความพร้อม'
                      : selectedRecord.overallStatus === 'fail'
                      ? '✕ พบปัญหา/ข้อบกพร่อง'
                      : '⏳ รอดำเนินการตรวจสอบเพิ่มเติม'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold">ปรับสถานะ:</span>
                  <select
                    disabled={isUpdating}
                    value={selectedRecord.overallStatus}
                    onChange={(e: any) =>
                      selectedRecord.id && handleUpdateStatus(selectedRecord.id, e.target.value)
                    }
                    className="bg-white px-3 py-1.5 rounded-lg border text-[13px] font-bold cursor-pointer"
                  >
                    <option value="pass">✓ ผ่าน</option>
                    <option value="fail">✕ พบปัญหา</option>
                    <option value="pending">⏳ รอดำเนินการ</option>
                  </select>
                </div>
              </div>

              {/* 3 Inspection Sets Proof Photos */}
              {(selectedRecord.photos?.exteriorUrl ||
                selectedRecord.photos?.interiorUrl ||
                selectedRecord.photos?.engineUrl ||
                selectedRecord.sets?.some((s) => s.imageUrl)) && (
                <div>
                  <h4 className="font-bold text-[14px] text-[#121b2e] mb-2.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#005c55] text-[18px]">
                      photo_library
                    </span>
                    <span>ภาพถ่ายหลักฐานยืนยัน 3 ชุดการตรวจ</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Exterior Photo */}
                    <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e2e8f0]">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5 truncate">
                        1. ภายนอกตัวรถ
                      </span>
                      <div className="aspect-video rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
                        {selectedRecord.photos?.exteriorUrl ||
                        selectedRecord.sets?.find((s) => s.id === 'exterior')?.imageUrl ? (
                          <img
                            src={
                              selectedRecord.photos?.exteriorUrl ||
                              selectedRecord.sets?.find((s) => s.id === 'exterior')?.imageUrl
                            }
                            alt="Exterior"
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                            referrerPolicy="no-referrer"
                            onClick={() =>
                              setPreviewPhoto({
                                url:
                                  selectedRecord.photos?.exteriorUrl ||
                                  selectedRecord.sets?.find((s) => s.id === 'exterior')?.imageUrl ||
                                  '',
                                title: 'ภาพถ่ายภายนอกตัวรถ'
                              })
                            }
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400">
                            ไม่มีภาพ
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interior Photo */}
                    <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e2e8f0]">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5 truncate">
                        2. ภายในห้องโดยสาร
                      </span>
                      <div className="aspect-video rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
                        {selectedRecord.photos?.interiorUrl ||
                        selectedRecord.sets?.find((s) => s.id === 'interior')?.imageUrl ? (
                          <img
                            src={
                              selectedRecord.photos?.interiorUrl ||
                              selectedRecord.sets?.find((s) => s.id === 'interior')?.imageUrl
                            }
                            alt="Interior"
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                            referrerPolicy="no-referrer"
                            onClick={() =>
                              setPreviewPhoto({
                                url:
                                  selectedRecord.photos?.interiorUrl ||
                                  selectedRecord.sets?.find((s) => s.id === 'interior')?.imageUrl ||
                                  '',
                                title: 'ภาพถ่ายภายในห้องโดยสาร'
                              })
                            }
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400">
                            ไม่มีภาพ
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Engine Photo */}
                    <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e2e8f0]">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5 truncate">
                        3. ระบบเครื่องยนต์
                      </span>
                      <div className="aspect-video rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
                        {selectedRecord.photos?.engineUrl ||
                        selectedRecord.sets?.find((s) => s.id === 'engine')?.imageUrl ? (
                          <img
                            src={
                              selectedRecord.photos?.engineUrl ||
                              selectedRecord.sets?.find((s) => s.id === 'engine')?.imageUrl
                            }
                            alt="Engine"
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                            referrerPolicy="no-referrer"
                            onClick={() =>
                              setPreviewPhoto({
                                url:
                                  selectedRecord.photos?.engineUrl ||
                                  selectedRecord.sets?.find((s) => s.id === 'engine')?.imageUrl ||
                                  '',
                                title: 'ภาพถ่ายระบบเครื่องยนต์'
                              })
                            }
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400">
                            ไม่มีภาพ
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-items Checklist Results */}
              <div>
                <h4 className="font-bold text-[14px] text-[#121b2e] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005c55] text-[18px]">
                    checklist
                  </span>
                  <span>
                    รายการตรวจสอบทั้งหมด ({selectedRecord.items?.length || 15} รายการ)
                  </span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {selectedRecord.items && selectedRecord.items.length > 0 ? (
                    selectedRecord.items.map((item, idx) => {
                      const isItemPass = item.status === 'pass';
                      return (
                        <div
                          key={item.id || idx}
                          className={`p-3 rounded-xl border flex flex-col justify-between gap-1.5 ${
                            isItemPass
                              ? 'bg-[#f8fafc] border-[#e2e8f0]'
                              : 'bg-[#fee2e2]/30 border-[#b91c1c]/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-[#1e293b] truncate">
                              {idx + 1}. {item.label}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isItemPass
                                  ? 'bg-[#dcfce7] text-[#15803d]'
                                  : 'bg-[#fee2e2] text-[#b91c1c]'
                              }`}
                            >
                              {isItemPass ? 'ผ่าน' : 'ไม่ผ่าน'}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-[11px] text-[#b91c1c]">{item.notes}</p>
                          )}
                          {item.imageUrl && (
                            <div className="mt-1 w-full h-24 rounded-lg overflow-hidden border border-[#bdc9c6]">
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[12px] text-[#6b7280]">
                      รายการตรวจสอบมาตรฐาน (ผ่านการตรวจรับรอง)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              {selectedRecord.id ? (
                <button
                  type="button"
                  onClick={() => selectedRecord.id && handleDeleteRecord(selectedRecord.id)}
                  className="text-[#b91c1c] text-[13px] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>ลบรายการนี้</span>
                </button>
              ) : (
                <div></div>
              )}
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 rounded-xl bg-[#005c55] text-white text-[13px] font-bold hover:bg-[#0f766e] cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Zoom Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs cursor-pointer animate-fadeIn"
        >
          <div className="max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl p-2">
            <div className="p-3 flex items-center justify-between text-white border-b border-slate-800">
              <span className="text-[13px] font-bold">{previewPhoto.title}</span>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-300"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-2">
              <img
                src={previewPhoto.url}
                alt=""
                className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
