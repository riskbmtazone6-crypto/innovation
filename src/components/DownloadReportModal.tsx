import React, { useState, useMemo } from 'react';
import { InspectionRecord } from '../types';
import {
  generatePrintableHtml,
  triggerPrintHtml,
  downloadPrintableFile,
  ReportOptions
} from '../utils/reportPdfGenerator';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: InspectionRecord[];
  initialRecord?: InspectionRecord | null;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  isOpen,
  onClose,
  records,
  initialRecord = null
}) => {
  const [reportType, setReportType] = useState<'summary' | 'single'>(
    initialRecord ? 'single' : 'summary'
  );
  const [filterStatus, setFilterStatus] = useState<'all' | 'pass' | 'fail'>('all');
  const [operationGroupFilter, setOperationGroupFilter] = useState<string>('all');
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    initialRecord?.id || (records.length > 0 ? records[0].id || '' : '')
  );
  const [isPrinting, setIsPrinting] = useState(false);

  const selectedRecord = useMemo(() => {
    if (initialRecord && initialRecord.id === selectedRecordId) return initialRecord;
    return records.find((r) => r.id === selectedRecordId) || records[0] || null;
  }, [records, selectedRecordId, initialRecord]);

  const reportOptions: ReportOptions = useMemo(
    () => ({
      reportType,
      filterStatus,
      operationGroupFilter,
      selectedRecord: selectedRecord || undefined
    }),
    [reportType, filterStatus, operationGroupFilter, selectedRecord]
  );

  const previewHtml = useMemo(() => {
    if (!isOpen) return '';
    return generatePrintableHtml(records, reportOptions);
  }, [isOpen, records, reportOptions]);

  if (!isOpen) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    triggerPrintHtml(previewHtml);
    setTimeout(() => setIsPrinting(false), 1200);
  };

  const handleDownload = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName =
      reportType === 'single' && selectedRecord
        ? `BMTA_Inspection_Route${selectedRecord.busRoute}_${selectedRecord.busNumber}_${dateStr}.html`
        : `BMTA_Zone6_Inspection_DailyReport_${dateStr}.html`;
    downloadPrintableFile(previewHtml, fileName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#005c55] to-[#047857] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <span className="material-symbols-outlined text-[22px] text-white">
                picture_as_pdf
              </span>
            </div>
            <div>
              <h3 className="font-bold text-[16px] sm:text-[18px] text-white flex items-center gap-2">
                <span>ดาวน์โหลด / พิมพ์รายงานตรวจสภาพรถ (Printable PDF)</span>
                <span className="text-[10px] bg-emerald-400 text-emerald-950 font-black px-2 py-0.5 rounded-full uppercase">
                  A4 Official
                </span>
              </h3>
              <p className="text-[12px] text-emerald-100">
                ขสมก. เขตการเดินรถที่ 6 • จัดพิมพ์เอกสารราชการมาตรฐาน พร้อมลงลายมือชื่อ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Options Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Format toggle: Summary vs Single */}
            <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setReportType('summary')}
                className={`px-3 py-1.5 rounded-lg font-bold text-[12px] flex items-center gap-1.5 transition-all cursor-pointer ${
                  reportType === 'summary'
                    ? 'bg-[#005c55] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">table_chart</span>
                <span>สรุปรวมประจำวัน ({records.length} คัน)</span>
              </button>
              <button
                type="button"
                onClick={() => setReportType('single')}
                className={`px-3 py-1.5 rounded-lg font-bold text-[12px] flex items-center gap-1.5 transition-all cursor-pointer ${
                  reportType === 'single'
                    ? 'bg-[#005c55] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">description</span>
                <span>ใบตรวจรายคัน (พร้อมภาพ 3 จุด)</span>
              </button>
            </div>

            {reportType === 'summary' ? (
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-slate-700 outline-none focus:border-[#005c55]"
                >
                  <option value="all">ผลการตรวจ: ทั้งหมด</option>
                  <option value="pass">เฉพาะที่ผ่านเกณฑ์</option>
                  <option value="fail">เฉพาะที่พบข้อบกพร่อง (ต้องซ่อม)</option>
                </select>

                <select
                  value={operationGroupFilter}
                  onChange={(e) => setOperationGroupFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-slate-700 outline-none focus:border-[#005c55]"
                >
                  <option value="all">ทุกกลุ่มงาน (เขต 6)</option>
                  <option value="6-1">กปด.16 (อู่ไร่ขิง)</option>
                  <option value="6-2">กปด.26 (อู่พุทธมณฑลสาย 3)</option>
                  <option value="6-3">กปด.36 (อู่พุทธมณฑลสาย 3)</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium text-[12px]">เลือกรถ:</span>
                <select
                  value={selectedRecordId}
                  onChange={(e) => setSelectedRecordId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-[#005c55] outline-none focus:border-[#005c55]"
                >
                  {records.map((r) => (
                    <option key={r.id || `${r.timestamp}-${r.busNumber}`} value={r.id || ''}>
                      สาย {r.busRoute} - เบอร์ {r.busNumber} ({r.overallStatus === 'pass' ? '✓ ผ่าน' : '✕ ซ่อม'}) [{r.dateStr}]
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[12px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="ดาวน์โหลดไฟล์เอกสารรายงาน HTML/PDF"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>ดาวน์โหลดไฟล์</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-4 py-1.5 rounded-lg bg-[#005c55] hover:bg-[#0f766e] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              title="เปิดหน้าต่างสั่งพิมพ์ หรือเลือก Save as PDF ในเบราว์เซอร์"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>{isPrinting ? 'กำลังพิมพ์...' : 'สั่งพิมพ์ / บันทึกเป็น PDF'}</span>
            </button>
          </div>
        </div>

        {/* Live A4 Document Preview Frame */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/80 flex justify-center">
          <div className="w-full max-w-[210mm] bg-white shadow-xl rounded-md overflow-hidden border border-slate-300 min-h-[500px]">
            <iframe
              srcDoc={previewHtml}
              title="Report PDF Preview"
              className="w-full h-[620px] border-0"
            />
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">
              check_circle
            </span>
            <span>
              💡 <strong>คำแนะนำ:</strong> ในหน้าต่างการพิมพ์ สามารถเลือก Destination เป็น{' '}
              <strong>"Save as PDF" (บันทึกเป็น PDF)</strong> เพื่อเซฟไฟล์เอกสาร PDF เก็บไว้ได้ทันที
            </span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-[#005c55] hover:bg-[#0f766e] text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>พิมพ์ / บันทึก PDF ตอนนี้</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
