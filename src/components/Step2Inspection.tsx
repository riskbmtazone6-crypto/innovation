import React, { useState, useRef } from 'react';
import { InspectionGroupSet, InspectionItem, InspectorUser, InspectionRecord } from '../types';
import { INSPECTION_SETS_TEMPLATE } from '../data/initialData';
import { PhotoUploadModal } from './PhotoUploadModal';
import { InspectionSummaryModal } from './InspectionSummaryModal';

interface Step2InspectionProps {
  currentInspector: InspectorUser;
  inspectorName?: string;
  busRoute: string;
  busNumber: string;
  operationGroupName: string;
  onBackToStep1: () => void;
  onSaveInspection: (record: Omit<InspectionRecord, 'id'>) => Promise<void>;
  isSaving: boolean;
}

export const Step2Inspection: React.FC<Step2InspectionProps> = ({
  currentInspector,
  inspectorName,
  busRoute,
  busNumber,
  operationGroupName,
  onBackToStep1,
  onSaveInspection,
  isSaving
}) => {
  // Initialize 3 Inspection Sets
  const [inspectionSets, setInspectionSets] = useState<InspectionGroupSet[]>(() =>
    JSON.parse(JSON.stringify(INSPECTION_SETS_TEMPLATE))
  );

  // Active Set photo modal state
  const [activePhotoSet, setActivePhotoSet] = useState<InspectionGroupSet | null>(null);

  // Full photo preview modal state
  const [previewImageUrl, setPreviewImageUrl] = useState<{ url: string; title: string } | null>(null);

  // Summary modal state
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Highlighted set for scroll feedback
  const [highlightedSetId, setHighlightedSetId] = useState<string | null>(null);
  const highlightTimerRef = useRef<any>(null);

  // Flattened all sub-items
  const allSubItems = inspectionSets.flatMap((set) =>
    set.items.map((item) => ({
      ...item,
      setId: set.id,
      setName: set.title,
      imageUrl: set.imageUrl
    }))
  );

  // Metrics
  const totalSets = inspectionSets.length; // 3 sets
  const photographedSetsCount = inspectionSets.filter((s) => !!s.imageUrl).length;
  
  const totalSubItemsCount = allSubItems.length; // 15 sub-items
  const answeredSubItemsCount = allSubItems.filter((i) => i.status !== null).length;
  const passedSubItemsCount = allSubItems.filter((i) => i.status === 'pass').length;
  const failedSubItemsCount = allSubItems.filter((i) => i.status === 'fail').length;

  const isAllPhotosTaken = photographedSetsCount === totalSets;
  const isAllSubItemsChecked = answeredSubItemsCount === totalSubItemsCount;
  const isComplete = isAllPhotosTaken && isAllSubItemsChecked;

  const overallProgressPercent = Math.round(
    ((photographedSetsCount * 2 + (answeredSubItemsCount / totalSubItemsCount) * 4) / 6) * 100
  );

  // Find first incomplete set
  const firstIncompleteSet = inspectionSets.find(
    (s) => !s.imageUrl || s.items.some((i) => i.status === null)
  );

  // Smooth scroll to a specific set
  const scrollToSet = (setId: string, openPhoto = false) => {
    const targetElement = document.getElementById(`inspection-set-${setId}`);
    if (targetElement) {
      const yOffset = -140;
      const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });

      setHighlightedSetId(setId);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => {
        setHighlightedSetId(null);
      }, 2500);

      if (openPhoto) {
        const found = inspectionSets.find((s) => s.id === setId);
        if (found) {
          setTimeout(() => {
            setActivePhotoSet(found);
          }, 350);
        }
      }
    }
  };

  // Update a sub-item status in a specific set
  const handleSetSubItemStatus = (
    setId: 'exterior' | 'interior' | 'engine',
    itemId: string,
    status: 'pass' | 'fail'
  ) => {
    setInspectionSets((prev) =>
      prev.map((set) => {
        if (set.id !== setId) return set;
        return {
          ...set,
          items: set.items.map((item) =>
            item.id === itemId ? { ...item, status } : item
          )
        };
      })
    );
  };

  // Update a sub-item note in a specific set
  const handleSetSubItemNotes = (
    setId: 'exterior' | 'interior' | 'engine',
    itemId: string,
    notes: string
  ) => {
    setInspectionSets((prev) =>
      prev.map((set) => {
        if (set.id !== setId) return set;
        return {
          ...set,
          items: set.items.map((item) =>
            item.id === itemId ? { ...item, notes } : item
          )
        };
      })
    );
  };

  // Mark all sub-items in a set as Pass
  const handlePassAllInSet = (setId: 'exterior' | 'interior' | 'engine') => {
    setInspectionSets((prev) =>
      prev.map((set) => {
        if (set.id !== setId) return set;
        return {
          ...set,
          items: set.items.map((item) => ({
            ...item,
            status: 'pass'
          }))
        };
      })
    );
  };

  // Handle confirming photo for a set
  const handleConfirmSetPhoto = (imageUrl: string) => {
    if (activePhotoSet) {
      const targetId = activePhotoSet.id;
      setInspectionSets((prev) =>
        prev.map((set) =>
          set.id === targetId
            ? {
                ...set,
                imageUrl,
                photoTimestamp: Date.now()
              }
            : set
        )
      );

      // Auto scroll to next set without photo
      const nextPendingSet = inspectionSets.find(
        (s) => s.id !== targetId && !s.imageUrl
      );
      if (nextPendingSet) {
        setTimeout(() => {
          scrollToSet(nextPendingSet.id, false);
        }, 300);
      }
    }
  };

  // Quick autofill demo mode (all 3 sets with sample photos and all pass)
  const handleAutoFillDemo = () => {
    setInspectionSets((prev) =>
      prev.map((set) => ({
        ...set,
        imageUrl: set.sampleImageUrl,
        photoTimestamp: Date.now(),
        items: set.items.map((item) => ({
          ...item,
          status: 'pass',
          notes: ''
        }))
      }))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Sticky Progress & Set Jump Strip Header */}
      <div className="sticky top-0 z-30 bg-[#f8fafc]/95 backdrop-blur-md -mx-4 px-4 py-3 border-b border-[#bdc9c6]/40 shadow-xs space-y-2.5">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Info badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStep1}
              className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#121b2e] hover:bg-[#e1e8ff] transition-colors cursor-pointer"
              title="กลับไปแก้ไขข้อมูลรถ"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[15px] text-[#121b2e]">
                  สาย {busRoute || '-'}
                </span>
                <span className="text-[12px] bg-[#e1e8ff] text-[#005c55] px-2 py-0.5 rounded-md font-bold">
                  {busNumber || '-'}
                </span>
                <span className="text-[11px] text-[#6b7280] hidden sm:inline">
                  • {inspectorName || currentInspector.name}
                </span>
              </div>
              <p className="text-[11px] text-[#6b7280]">
                การตรวจ 3 ชุดรายการมาตรฐาน (ภายนอก, ภายใน, เครื่องยนต์)
              </p>
            </div>
          </div>

          {/* Right: Progress Stats & Quick Demo Button */}
          <div className="flex items-center justify-between md:justify-end gap-2.5">
            <div className="flex items-center gap-3 text-[12px]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#005c55]">
                  photo_camera
                </span>
                <span className="font-bold text-[#121b2e]">
                  {photographedSetsCount}/{totalSets} ภาพ
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#005c55]">
                  check_circle
                </span>
                <span className="font-bold text-[#121b2e]">
                  {answeredSubItemsCount}/{totalSubItemsCount} ข้อ
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="px-2.5 py-1 text-[11px] font-bold text-[#005c55] hover:bg-[#005c55]/10 border border-[#005c55]/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              title="เติมรูปตัวอย่างและเช็คผ่านทั้งหมดเพื่อทดสอบอย่างรวดเร็ว"
            >
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>ตัวอย่างด่วน</span>
            </button>
          </div>
        </div>

        {/* 3 Inspection Sets Jump Strip */}
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2">
          {inspectionSets.map((set) => {
            const hasPhoto = !!set.imageUrl;
            const setAnswered = set.items.filter((i) => i.status !== null).length;
            const setTotal = set.items.length;
            const isSetComplete = hasPhoto && setAnswered === setTotal;
            const hasFail = set.items.some((i) => i.status === 'fail');

            return (
              <button
                key={set.id}
                type="button"
                onClick={() => scrollToSet(set.id, false)}
                className={`py-2 px-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSetComplete
                    ? hasFail
                      ? 'bg-red-50/80 border-red-200 text-red-900'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-[#005c55]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0 ${
                      isSetComplete
                        ? hasFail
                          ? 'bg-red-600 text-white'
                          : 'bg-emerald-600 text-white'
                        : hasPhoto
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {set.setNumber}
                  </div>
                  <div className="truncate text-left">
                    <span className="text-[11px] font-bold truncate block">
                      {set.id === 'exterior'
                        ? '1. ภายนอกตัวรถ'
                        : set.id === 'interior'
                        ? '2. ภายในห้องโดยสาร'
                        : '3. ระบบเครื่องยนต์'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {hasPhoto ? '✓ มีรูป' : '📷 รอถ่าย'} • {setAnswered}/{setTotal} ข้อ
                    </span>
                  </div>
                </div>

                <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0 ml-1">
                  arrow_forward
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Progress Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isComplete ? 'bg-[#15803d]' : 'bg-[#005c55]'
              }`}
              style={{ width: `${Math.min(100, overallProgressPercent)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Instruction Banner */}
        <div className="bg-white rounded-2xl p-4 border border-[#bdc9c6]/50 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#005c55]/10 text-[#005c55] flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[24px]">fact_check</span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-[16px] text-[#121b2e]">
              ระบบตรวจสภาพ 3 ชุดรายการมาตรฐาน (Smart 3-Set Checklist)
            </h2>
            <p className="text-[13px] text-[#475569] mt-0.5">
              ตรวจครบถ้วนใน 3 ชุดหลัก: <b>1. ภายนอกตัวรถ</b> (ถ่าย 1 ภาพ + เช็ค 6 รายการ),{' '}
              <b>2. ภายในห้องโดยสาร</b> (ถ่าย 1 ภาพ + เช็ค 5 รายการ), และ{' '}
              <b>3. ระบบเครื่องยนต์</b> (ถ่าย 1 ภาพ + เช็ค 4 รายการ)
            </p>
          </div>
        </div>

        {/* The 3 Inspection Set Cards */}
        <div className="space-y-6">
          {inspectionSets.map((set) => {
            const hasPhoto = !!set.imageUrl;
            const answeredCount = set.items.filter((i) => i.status !== null).length;
            const passCount = set.items.filter((i) => i.status === 'pass').length;
            const failCount = set.items.filter((i) => i.status === 'fail').length;
            const isSetComplete = hasPhoto && answeredCount === set.items.length;
            const isHighlighted = highlightedSetId === set.id;

            return (
              <div
                key={set.id}
                id={`inspection-set-${set.id}`}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs ${
                  isHighlighted
                    ? 'ring-4 ring-[#005c55]/30 border-[#005c55] shadow-lg'
                    : isSetComplete
                    ? 'border-emerald-200'
                    : 'border-[#bdc9c6]/60'
                }`}
              >
                {/* Set Header */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#005c55] text-white flex items-center justify-center shadow-xs shrink-0">
                      <span className="material-symbols-outlined text-[24px]">{set.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#005c55]/10 text-[#005c55]">
                          ชุดที่ {set.setNumber}
                        </span>
                        <h3 className="font-bold text-[16px] sm:text-[17px] text-[#121b2e]">
                          {set.title}
                        </h3>
                      </div>
                      <p className="text-[12px] text-[#64748b] mt-0.5">{set.titleEn}</p>
                    </div>
                  </div>

                  {/* Set Action & Status summary */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handlePassAllInSet(set.id)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">done_all</span>
                      <span>ผ่านทั้งหมดในชุดนี้</span>
                    </button>
                  </div>
                </div>

                {/* Set Body: Divided into (A) Required Photo Section + (B) Sub-items Checklist */}
                <div className="p-4 sm:p-5 space-y-5">
                  {/* (A) Required Photo Proof Section for this Set */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#005c55] text-[20px]">
                            photo_camera
                          </span>
                          <h4 className="font-bold text-[14px] text-[#121b2e]">
                            ภาพถ่ายหลักฐานยืนยันประจำชุด (1 ภาพ)
                          </h4>
                          {hasPhoto ? (
                            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              <span>บันทึกภาพแล้ว</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <span className="material-symbols-outlined text-[14px]">priority_high</span>
                              <span>จำเป็นต้องถ่าย 1 ภาพ</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#64748b]">{set.photoGuide}</p>
                      </div>

                      {/* Photo Thumbnail or Capture Button */}
                      <div className="shrink-0">
                        {hasPhoto ? (
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() =>
                                setPreviewImageUrl({
                                  url: set.imageUrl!,
                                  title: set.title
                                })
                              }
                              className="relative w-28 h-20 rounded-xl overflow-hidden border-2 border-[#005c55] cursor-pointer shadow-xs group"
                            >
                              <img
                                src={set.imageUrl}
                                alt={set.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setActivePhotoSet(set)}
                              className="px-3 py-2 bg-white hover:bg-slate-100 text-[#005c55] border border-[#bdc9c6] rounded-xl text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              <span>เปลี่ยนรูป</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActivePhotoSet(set)}
                            className="w-full sm:w-auto px-4 py-3 bg-[#005c55] hover:bg-[#0f766e] active:scale-[0.98] text-white rounded-xl text-[13px] font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                            <span>เปิดกล้องถ่ายภาพชุดนี้</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* (B) Sub-items Checklist Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-[14px] text-[#121b2e] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#005c55]">
                          checklist
                        </span>
                        <span>รายการตรวจย่อยในชุดนี้ ({set.items.length} รายการ)</span>
                      </h4>
                      <span className="text-[12px] text-[#64748b]">
                        ตรวจแล้ว {answeredCount}/{set.items.length} (ผ่าน {passCount}, ไม่ผ่าน {failCount})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {set.items.map((item) => {
                        const isPass = item.status === 'pass';
                        const isFail = item.status === 'fail';

                        return (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-xl border transition-all ${
                              isPass
                                ? 'bg-[#f8fafc] border-[#e2e8f0]'
                                : isFail
                                ? 'bg-red-50/50 border-red-200 ring-1 ring-red-200'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              {/* Left Item Details */}
                              <div className="flex items-start gap-3 flex-1">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                    isPass
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isFail
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    {item.icon}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[11px] font-bold text-slate-400">
                                      ข้อ {item.order}.
                                    </span>
                                    <span className="font-bold text-[14px] text-[#121b2e]">
                                      {item.label}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      ({item.labelEn})
                                    </span>
                                  </div>
                                  {item.description && (
                                    <p className="text-[12px] text-[#64748b] mt-0.5">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right Pass / Fail Toggle Buttons */}
                              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleSetSubItemStatus(set.id, item.id, 'pass')}
                                  className={`px-3.5 py-2 rounded-xl text-[13px] font-bold flex items-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
                                    isPass
                                      ? 'bg-[#15803d] text-white shadow-xs ring-2 ring-[#15803d]/30'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    check_circle
                                  </span>
                                  <span>ผ่าน</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSetSubItemStatus(set.id, item.id, 'fail')}
                                  className={`px-3.5 py-2 rounded-xl text-[13px] font-bold flex items-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
                                    isFail
                                      ? 'bg-[#b91c1c] text-white shadow-xs ring-2 ring-[#b91c1c]/30'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    cancel
                                  </span>
                                  <span>ไม่ผ่าน</span>
                                </button>
                              </div>
                            </div>

                            {/* Defect note input (always visible if fail, or optional expandable) */}
                            {isFail && (
                              <div className="mt-2.5 pt-2.5 border-t border-red-200/60 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">
                                  warning
                                </span>
                                <input
                                  type="text"
                                  value={item.notes}
                                  onChange={(e) =>
                                    handleSetSubItemNotes(set.id, item.id, e.target.value)
                                  }
                                  placeholder="ระบุอาการชำรุด เช่น โคมไฟแตก, ยางสึก, ลมรั่ว..."
                                  className="w-full px-3 py-1.5 text-[12px] rounded-lg border border-red-300 bg-white text-red-900 placeholder:text-red-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Action Footer */}
        <div className="bg-white rounded-2xl p-5 border border-[#bdc9c6]/60 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-[15px] text-[#121b2e]">
                {isComplete
                  ? '✓ ตรวจครบทั้ง 3 ชุดรายการเรียบร้อย พร้อมส่งรายงาน'
                  : `กำลังตรวจสอบ: ภาพถ่าย ${photographedSetsCount}/${totalSets} ชุด • รายการย่อย ${answeredSubItemsCount}/${totalSubItemsCount} ข้อ`}
              </h4>
              <p className="text-[12px] text-[#64748b]">
                {failedSubItemsCount > 0
                  ? `พบข้อบกพร่อง ${failedSubItemsCount} รายการ (ระบบจะสรุปเข้าใบแจ้งซ่อม)`
                  : 'หากทุกรายการผ่านเกณฑ์ รถจะได้รับสถานะพร้อมใช้งานทันที'}
              </p>
            </div>

            {isComplete ? (
              <button
                type="button"
                onClick={() => setShowSummaryModal(true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#005c55] hover:bg-[#0f766e] active:scale-[0.98] text-white rounded-xl font-bold text-[15px] shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
                <span>สรุปผลและบันทึกข้อมูล (ไปขั้นตอนที่ 3) →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (firstIncompleteSet) {
                    scrollToSet(firstIncompleteSet.id, !firstIncompleteSet.imageUrl);
                  }
                }}
                className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-[14px] shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">near_me</span>
                <span>
                  {firstIncompleteSet
                    ? `นำทางไป ${firstIncompleteSet.title.split(':')[0]} →`
                    : 'ตรวจสอบรายการที่เหลือ'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photo Upload Modal for Selected Set */}
      {activePhotoSet && (
        <PhotoUploadModal
          isOpen={!!activePhotoSet}
          onClose={() => setActivePhotoSet(null)}
          setTitle={activePhotoSet.title}
          photoGuide={activePhotoSet.photoGuide}
          setId={activePhotoSet.id}
          currentImageUrl={activePhotoSet.imageUrl}
          busRoute={busRoute}
          busNumber={busNumber}
          inspectorName={inspectorName || currentInspector.name}
          onConfirmPhoto={handleConfirmSetPhoto}
        />
      )}

      {/* Image Zoom Preview Modal */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs cursor-pointer animate-fadeIn"
        >
          <div className="max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl p-2">
            <div className="p-3 flex items-center justify-between text-white border-b border-slate-800">
              <span className="text-[13px] font-bold">{previewImageUrl.title}</span>
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-300"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-2">
              <img
                src={previewImageUrl.url}
                alt=""
                className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary and Confirmation Modal */}
      <InspectionSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        busRoute={busRoute}
        busNumber={busNumber}
        inspectorName={inspectorName || currentInspector.name}
        operationGroupName={operationGroupName}
        items={allSubItems}
        sets={inspectionSets}
        onConfirmSave={onSaveInspection}
        isSaving={isSaving}
      />
    </div>
  );
};
