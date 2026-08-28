import React, { useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail' | 'pending'>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Compute summary stats dynamically from live Firestore records
  const totalInspected = records.length;
  const totalPassed = records.filter((r) => r.overallStatus === 'pass').length;
  const totalIssues = records.filter((r) => r.overallStatus === 'fail').length;
  const totalPending = records.filter((r) => r.overallStatus === 'pending').length;
  const passRate = totalInspected > 0 ? Math.round((totalPassed / totalInspected) * 100) : 0;

  // Filter records
  const filteredRecords = records.filter((r) => {
    const query = searchQuery.toLowerCase().trim();
    const matchQuery =
      !query ||
      r.busRoute.toLowerCase().includes(query) ||
      r.busNumber.toLowerCase().includes(query) ||
      r.inspectorName.toLowerCase().includes(query) ||
      r.issuesSummary.toLowerCase().includes(query);

    const matchStatus = statusFilter === 'all' || r.overallStatus === statusFilter;
    const matchGroup = groupFilter === 'all' || r.operationGroup === groupFilter;

    return matchQuery && matchStatus && matchGroup;
  });

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
    const headers = ['เวลา,สายรถ,เบอร์รถ,กลุ่มงาน,ผู้ตรวจ,ผลการตรวจ,ปัญหาที่พบ'];
    const rows = filteredRecords.map(
      (r) =>
        `"${r.dateStr} ${r.timeStr}","${r.busRoute}","${r.busNumber}","${r.operationGroupName}","${r.inspectorName}","${r.overallStatus}","${r.issuesSummary}"`
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

  return (
    <div className="w-full max-w-[1140px] mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-[22px] md:text-[26px] text-[#121b2e] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005c55] text-[32px]">
              bar_chart
            </span>
            STEP 3 • Dashboard หัวหน้างาน
          </h2>
          <p className="text-[14px] text-[#6b7280] mt-0.5">
            ภาพรวมการตรวจสอบสภาพรถประจำวัน เขตการเดินรถที่ 6
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#cbd5e1] text-[#334155] text-[13px] font-bold hover:bg-[#f8fafc] flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>ส่งออก CSV</span>
          </button>
          <button
            type="button"
            onClick={onStartNewInspection}
            className="px-4 py-2 rounded-xl bg-[#005c55] hover:bg-[#0f766e] text-white text-[13px] font-bold flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,92,85,0.2)] cursor-pointer transition-colors"
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
                ผลการตรวจสอบถูกจัดเก็บและอัปเดตลงระบบเรียบร้อย พร้อมสำหรับการเริ่มต้นตรวจสอบคันใหม่
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

      {/* Donut Progress / Summary Ratio Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#bdc9c6]/60 card-shadow flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              fill="transparent"
              r="15.915"
              stroke="#fee2e2"
              strokeWidth="3.8"
            ></circle>
            <circle
              cx="18"
              cy="18"
              fill="transparent"
              r="15.915"
              stroke="#005c55"
              strokeDasharray={`${passRate} ${100 - passRate}`}
              strokeDashoffset="0"
              strokeWidth="3.8"
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            ></circle>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-[24px] font-black text-[#121b2e] leading-none">
              {passRate}%
            </span>
            <span className="text-[11px] text-[#6b7280] font-semibold mt-0.5">ผ่าน</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3 w-full">
          <h3 className="font-bold text-[15px] text-[#121b2e]">สรุปผลการตรวจสภาพรถวันนี้</h3>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#005c55]"></div>
                <span className="text-[14px] text-[#3e4947]">ผ่านการตรวจสอบ</span>
              </div>
              <span className="text-[14px] font-bold text-[#005c55]">{totalPassed} คัน</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#b91c1c]"></div>
                <span className="text-[14px] text-[#3e4947]">พบปัญหา/รอดำเนินการ</span>
              </div>
              <span className="text-[14px] font-bold text-[#b91c1c]">
                {totalIssues + totalPending} รายการ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Metrics (4 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Metric 1: Total Inspected */}
        <div className="bg-white rounded-2xl p-4 border border-[#bdc9c6]/60 card-shadow bento-hover flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-[#0f766e] opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-bold text-[#6b7280]">ตรวจแล้ว</span>
            <span className="material-symbols-outlined text-[#005c55]">fact_check</span>
          </div>
          <div>
            <span className="text-[26px] md:text-[28px] text-[#121b2e] font-black">
              {totalInspected}
            </span>
            <span className="text-[12px] text-[#6b7280] ml-1">คัน</span>
          </div>
        </div>

        {/* Metric 2: Total Passed */}
        <div className="bg-[#dcfce7] rounded-2xl p-4 border border-[#15803d]/20 card-shadow bento-hover flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-[#15803d] opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-bold text-[#15803d]">ผ่านทั้งหมด</span>
            <span className="material-symbols-outlined text-[#15803d]">check_circle</span>
          </div>
          <div>
            <span className="text-[26px] md:text-[28px] text-[#15803d] font-black">
              {totalPassed}
            </span>
            <span className="text-[12px] text-[#15803d] ml-1">คัน</span>
          </div>
        </div>

        {/* Metric 3: Issues Found */}
        <div className="bg-[#fee2e2] rounded-2xl p-4 border border-[#b91c1c]/20 card-shadow bento-hover flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-[#b91c1c] opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-bold text-[#b91c1c]">พบปัญหา</span>
            <span className="material-symbols-outlined text-[#b91c1c]">report</span>
          </div>
          <div>
            <span className="text-[26px] md:text-[28px] text-[#b91c1c] font-black">
              {totalIssues}
            </span>
            <span className="text-[12px] text-[#b91c1c] ml-1">รายการ</span>
          </div>
        </div>

        {/* Metric 4: Pending Action */}
        <div className="bg-[#fffbeb] rounded-2xl p-4 border border-[#b45309]/20 card-shadow bento-hover flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-[#b45309] opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-bold text-[#b45309]">รอดำเนินการ</span>
            <span className="material-symbols-outlined text-[#b45309]">pending_actions</span>
          </div>
          <div>
            <span className="text-[26px] md:text-[28px] text-[#b45309] font-black">
              {totalPending}
            </span>
            <span className="text-[12px] text-[#b45309] ml-1">รายการ</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#bdc9c6]/60 card-shadow flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-[20px]">
              search
            </span>
            <input
              className="w-full bg-[#f5f7fb] border border-[#e5e7eb] rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-[#121b2e] focus:outline-none focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55] transition-colors"
              placeholder="ค้นหาสายรถ, เบอร์รถ, ผู้ตรวจ..."
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

          {/* Status Dropdown */}
          <div className="relative w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="w-full bg-[#f5f7fb] border border-[#e5e7eb] rounded-xl px-4 py-2.5 text-[14px] text-[#121b2e] appearance-none focus:outline-none focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55] transition-colors cursor-pointer pr-9"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="pass">ผ่านการตรวจ</option>
              <option value="fail">พบปัญหา</option>
              <option value="pending">รอดำเนินการ</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none text-[20px]">
              arrow_drop_down
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
          className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
            showAdvancedFilter
              ? 'bg-[#005c55] text-white border-[#005c55]'
              : 'bg-[#e1e8ff]/50 text-[#005c55] border-[#bdc9c6]/60 hover:bg-[#e1e8ff]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          <span>ตัวกรองขั้นสูง</span>
        </button>
      </div>

      {/* Advanced Filter Expansion */}
      {showAdvancedFilter && (
        <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#cbd5e1] flex flex-wrap gap-4 items-center">
          <span className="text-[13px] font-bold text-[#334155]">กลุ่มงานปฏิบัติการ:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: '6-1', label: 'กปด.16 (ปากน้ำ/เมกา)' },
              { id: '6-2', label: 'กปด.26 (แพรกษา/คลองเตย)' },
              { id: '6-3', label: 'กปด.36 (สายใต้/ฟาร์มจระเข้)' }
            ].map((grp) => (
              <button
                key={grp.id}
                type="button"
                onClick={() => setGroupFilter(grp.id)}
                className={`text-[12px] px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  groupFilter === grp.id
                    ? 'bg-[#005c55] text-white border-[#005c55] font-bold shadow-xs'
                    : 'bg-white text-[#475569] border-[#cbd5e1] hover:border-[#005c55]'
                }`}
              >
                {grp.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Inspections Table */}
      <div className="bg-white rounded-2xl border border-[#bdc9c6]/60 card-shadow overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-[#e5e7eb] flex justify-between items-center bg-[#f9f9ff]">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[16px] text-[#121b2e]">รายการตรวจล่าสุด</h3>
            <span className="text-[12px] bg-[#e1e8ff] text-[#005c55] font-bold px-2 py-0.5 rounded-full">
              {filteredRecords.length} รายการ
            </span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[780px]">
            <thead className="bg-[#f5f7fb]/80 border-b border-[#e5e7eb] text-[13px] font-bold text-[#6b7280]">
              <tr>
                <th className="px-4 py-3.5">เวลา</th>
                <th className="px-4 py-3.5">สายรถ</th>
                <th className="px-4 py-3.5">เบอร์รถ</th>
                <th className="px-4 py-3.5">ผู้ตรวจ</th>
                <th className="px-4 py-3.5">ผลการตรวจ</th>
                <th className="px-4 py-3.5">ปัญหาที่พบ</th>
                <th className="px-4 py-3.5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-[14px] divide-y divide-[#e5e7eb]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6b7280]">
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
                      className="hover:bg-[#f5f7fb]/60 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3.5 text-[#6b7280] font-mono text-[13px]">
                        {rec.timeStr || '08:00'}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#121b2e]">{rec.busRoute}</td>
                      <td className="px-4 py-3.5 font-medium text-[#3e4947]">{rec.busNumber}</td>
                      <td className="px-4 py-3.5 text-[#121b2e]">
                        <div className="flex items-center gap-2">
                          {rec.inspectorAvatar && (
                            <img
                              src={rec.inspectorAvatar}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          )}
                          <span>{rec.inspectorName}</span>
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
                          {isPass ? 'ผ่าน' : isFail ? 'พบปัญหา' : 'รอดำเนินการ'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] max-w-[200px] truncate">
                        {isPass ? (
                          <span className="text-[#6b7280]">-</span>
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
                          className="text-[#005c55] hover:bg-[#e1e8ff] p-1.5 rounded-lg transition-colors inline-flex items-center gap-1 text-[12px] font-bold"
                          title="ดูรายละเอียดการตรวจ"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                          <span>ดู</span>
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

      {/* Record Inspection Detail Modal */}
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
                    รายละเอียดการตรวจ: สาย {selectedRecord.busRoute} ({selectedRecord.busNumber})
                  </h3>
                  <p className="text-[12px] text-[#6b7280]">
                    วันที่: {selectedRecord.dateStr} เวลา: {selectedRecord.timeStr} น. • ผู้ตรวจ: {selectedRecord.inspectorName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-[#6b7280] hover:text-[#121b2e] p-1 rounded-full hover:bg-[#e5e7eb] transition-colors"
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
                  <span className="text-[12px]">เปลี่ยนสถานะ:</span>
                  <select
                    disabled={isUpdating}
                    value={selectedRecord.overallStatus}
                    onChange={(e: any) =>
                      selectedRecord.id && handleUpdateStatus(selectedRecord.id, e.target.value)
                    }
                    className="bg-white px-3 py-1 rounded-lg border text-[13px] font-bold cursor-pointer"
                  >
                    <option value="pass">ผ่าน</option>
                    <option value="fail">พบปัญหา</option>
                    <option value="pending">รอดำเนินการ</option>
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
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
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
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
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
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
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
                  className="text-[#b91c1c] text-[13px] font-bold hover:underline flex items-center gap-1"
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
                className="px-5 py-2 rounded-xl bg-[#005c55] text-white text-[13px] font-bold hover:bg-[#0f766e]"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
