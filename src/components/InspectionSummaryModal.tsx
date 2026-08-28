import React, { useState } from 'react';
import { InspectionGroupSet, InspectionItem, InspectionRecord } from '../types';
import confetti from 'canvas-confetti';

interface InspectionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  busRoute: string;
  busNumber: string;
  inspectorName: string;
  operationGroupName: string;
  items: InspectionItem[];
  sets?: InspectionGroupSet[];
  onConfirmSave: (record: Omit<InspectionRecord, 'id'>) => Promise<void>;
  isSaving: boolean;
}

export const InspectionSummaryModal: React.FC<InspectionSummaryModalProps> = ({
  isOpen,
  onClose,
  busRoute,
  busNumber,
  inspectorName,
  operationGroupName,
  items,
  sets,
  onConfirmSave,
  isSaving
}) => {
  const [supervisorNote, setSupervisorNote] = useState('');

  if (!isOpen) return null;

  const passedCount = items.filter((i) => i.status === 'pass').length;
  const failedCount = items.filter((i) => i.status === 'fail').length;
  const unansweredCount = items.filter((i) => i.status === null).length;
  const totalCount = items.length;

  const failedItems = items.filter((i) => i.status === 'fail');
  const isAllPassed = passedCount === totalCount && failedCount === 0;
  const overallStatus: 'pass' | 'fail' | 'pending' = isAllPassed
    ? 'pass'
    : failedCount > 0
    ? 'fail'
    : 'pending';

  const issuesSummary =
    failedItems.length > 0
      ? failedItems.map((f) => `${f.label} ${f.notes ? `(${f.notes})` : ''}`).join(', ')
      : '-';

  // Photos from sets
  const exteriorPhoto = sets?.find((s) => s.id === 'exterior')?.imageUrl;
  const interiorPhoto = sets?.find((s) => s.id === 'interior')?.imageUrl;
  const enginePhoto = sets?.find((s) => s.id === 'engine')?.imageUrl;

  const handleSave = async () => {
    const now = new Date();
    const thaiDate = now.toLocaleDateString('th-TH');
    const thaiTime = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    const newRecord: Omit<InspectionRecord, 'id'> = {
      timestamp: Date.now(),
      dateStr: thaiDate,
      timeStr: thaiTime,
      inspectorName,
      operationGroup: '6-3',
      operationGroupName,
      busRoute,
      busNumber,
      overallStatus,
      passedCount,
      failedCount,
      totalCount,
      issuesSummary: issuesSummary.substring(0, 150),
      items,
      sets,
      photos: {
        exteriorUrl: exteriorPhoto,
        interiorUrl: interiorPhoto,
        engineUrl: enginePhoto
      },
      supervisorNotes: supervisorNote
    };

    await onConfirmSave(newRecord);

    // Fire celebratory confetti if all passed!
    if (isAllPassed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#e5e7eb] flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005c55]">fact_check</span>
            <h3 className="font-bold text-[18px] text-[#121b2e]">สรุปผลการตรวจสอบสภาพรถ 3 ชุดรายการ</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#121b2e] p-1 rounded-full hover:bg-[#e5e7eb] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Header Status Banner */}
          <div
            className={`p-4 rounded-xl flex items-center justify-between border ${
              isAllPassed
                ? 'bg-[#dcfce7] border-[#15803d]/30 text-[#15803d]'
                : 'bg-[#fee2e2] border-[#b91c1c]/30 text-[#b91c1c]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[32px]">
                {isAllPassed ? 'check_circle' : 'error'}
              </span>
              <div>
                <h4 className="font-bold text-[16px]">
                  {isAllPassed ? 'ผ่านเกณฑ์มาตรฐานครบทั้ง 3 ชุด' : `พบข้อบกพร่อง ${failedCount} รายการ`}
                </h4>
                <p className="text-[12px] opacity-90">
                  {isAllPassed
                    ? 'รถพร้อมออกให้บริการรับ-ส่งผู้โดยสาร'
                    : 'ต้องส่งเรื่องแจ้งซ่อมหรือให้นายช่างตรวจสอบก่อนออกวิ่ง'}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[13px] font-bold ${
                isAllPassed ? 'bg-[#15803d] text-white' : 'bg-[#b91c1c] text-white'
              }`}
            >
              {isAllPassed ? 'พร้อมบริการ' : 'ต้องแก้ไข'}
            </span>
          </div>

          {/* Bus and Inspector Details */}
          <div className="grid grid-cols-2 gap-3 bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] text-[13px]">
            <div>
              <span className="text-[#64748b] block text-[11px]">สายเดินรถ:</span>
              <strong className="text-[#005c55] text-[15px]">{busRoute}</strong>
            </div>
            <div>
              <span className="text-[#64748b] block text-[11px]">เลขข้างรถ:</span>
              <strong className="text-[#005c55] text-[15px]">{busNumber}</strong>
            </div>
            <div>
              <span className="text-[#64748b] block text-[11px]">ผู้ตรวจสอบ:</span>
              <span className="text-[#1e293b] font-semibold">{inspectorName}</span>
            </div>
            <div>
              <span className="text-[#64748b] block text-[11px]">สังกัด:</span>
              <span className="text-[#1e293b] truncate block">{operationGroupName}</span>
            </div>
          </div>

          {/* 3 Photos Thumbnails Proofs */}
          <div>
            <h5 className="font-bold text-[13px] text-[#121b2e] mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#005c55]">photo_library</span>
              <span>ภาพถ่ายหลักฐานยืนยันทั้ง 3 ชุด:</span>
            </h5>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  {exteriorPhoto ? (
                    <img src={exteriorPhoto} alt="Exterior" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">ไม่มีรูป</div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-600 block text-center truncate">1. ภายนอกตัวรถ</span>
              </div>

              <div className="space-y-1">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  {interiorPhoto ? (
                    <img src={interiorPhoto} alt="Interior" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">ไม่มีรูป</div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-600 block text-center truncate">2. ภายในห้องโดยสาร</span>
              </div>

              <div className="space-y-1">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  {enginePhoto ? (
                    <img src={enginePhoto} alt="Engine" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">ไม่มีรูป</div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-600 block text-center truncate">3. ระบบเครื่องยนต์</span>
              </div>
            </div>
          </div>

          {/* Checklist Score Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#dcfce7] p-3 rounded-xl border border-[#15803d]/20">
              <span className="text-[11px] text-[#15803d] font-bold block">ผ่าน</span>
              <strong className="text-[20px] text-[#15803d]">{passedCount}</strong>
              <span className="text-[10px] text-[#15803d] block">/ {totalCount} รายการ</span>
            </div>
            <div className="bg-[#fee2e2] p-3 rounded-xl border border-[#b91c1c]/20">
              <span className="text-[11px] text-[#b91c1c] font-bold block">ไม่ผ่าน</span>
              <strong className="text-[20px] text-[#b91c1c]">{failedCount}</strong>
              <span className="text-[10px] text-[#b91c1c] block">รายการ</span>
            </div>
            <div className="bg-[#f1f5f9] p-3 rounded-xl border border-[#cbd5e1]">
              <span className="text-[11px] text-[#64748b] font-bold block">ยังไม่ตรวจ</span>
              <strong className="text-[20px] text-[#475569]">{unansweredCount}</strong>
              <span className="text-[10px] text-[#64748b] block">รายการ</span>
            </div>
          </div>

          {/* Defect / Issues Details */}
          {failedItems.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-[14px] text-[#b91c1c] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">report_problem</span>
                รายละเอียดข้อบกพร่องที่พบ ({failedItems.length}):
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {failedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#fee2e2]/40 border border-[#fee2e2] flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#b91c1c]/10 text-[#b91c1c] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-[#121b2e]">
                        {item.order}. {item.label} ({item.labelEn})
                      </p>
                      <p className="text-[12px] text-[#b91c1c] mt-0.5">
                        {item.notes ? `หมายเหตุ: ${item.notes}` : 'ระบุ: ตรวจไม่ผ่านเกณฑ์'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supervisor / Inspector Additional Notes */}
          <div>
            <label className="text-[13px] font-bold text-[#121b2e] block mb-1">
              หมายเหตุสรุปของหัวหน้างาน / ผู้ตรวจ (ถ้ามี):
            </label>
            <textarea
              rows={2}
              value={supervisorNote}
              onChange={(e) => setSupervisorNote(e.target.value)}
              placeholder="บันทึกคำสั่งการ หรือการส่งซ่อมเพิ่มเติม..."
              className="w-full p-3 rounded-xl border border-[#bdc9c6] text-[13px] focus:outline-none focus:border-[#005c55] focus:ring-2 focus:ring-[#005c55]/20"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-[#cbd5e1] text-[#475569] text-[14px] font-semibold hover:bg-slate-100 cursor-pointer"
          >
            ย้อนกลับไปแก้ไข
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#005c55] hover:bg-[#0f766e] text-white text-[14px] font-bold flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>ยืนยันและบันทึกข้อมูล</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
