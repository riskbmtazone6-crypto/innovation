import { InspectionRecord } from '../types';

export interface ReportOptions {
  title?: string;
  reportType: 'summary' | 'single';
  filterStatus?: 'all' | 'pass' | 'fail';
  operationGroupFilter?: string;
  inspectorName?: string;
  supervisorName?: string;
  dateRangeStr?: string;
  includePhotos?: boolean;
  includeSignatures?: boolean;
  selectedRecord?: InspectionRecord;
}

/**
 * Generates an official BMTA Zone 6 printable HTML document
 * formatted strictly for A4 print-to-PDF standard.
 */
export function generatePrintableHtml(
  records: InspectionRecord[],
  options: ReportOptions
): string {
  const now = new Date();
  const thaiDate = now.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const printTimeStr = now.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const filtered = records.filter((r) => {
    if (options.filterStatus === 'pass' && r.overallStatus !== 'pass') return false;
    if (options.filterStatus === 'fail' && r.overallStatus !== 'fail') return false;
    if (options.operationGroupFilter && options.operationGroupFilter !== 'all' && r.operationGroup !== options.operationGroupFilter) return false;
    return true;
  });

  const total = filtered.length;
  const passed = filtered.filter((r) => r.overallStatus === 'pass').length;
  const failed = filtered.filter((r) => r.overallStatus === 'fail').length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  if (options.reportType === 'single' && options.selectedRecord) {
    return generateSingleVehicleReportHtml(options.selectedRecord, thaiDate, printTimeStr, options);
  }

  // Summary Report HTML
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>แบบรายงานผลการตรวจสภาพรถโดยสาร ขสมก. เขต 6 - ${thaiDate}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Prompt:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Sarabun', 'Prompt', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      line-height: 1.4;
      color: #1e293b;
      background: #ffffff;
    }
    .page-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      padding: 10px;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #005c55;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .emblem-box {
      width: 60px;
      height: 60px;
      background: #005c55;
      color: #ffffff;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: 1px;
    }
    .title-main {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .title-sub {
      font-size: 13px;
      font-weight: 600;
      color: #005c55;
      margin: 2px 0 0 0;
    }
    .title-dept {
      font-size: 12px;
      color: #64748b;
      margin: 2px 0 0 0;
    }
    .doc-meta {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .badge-doc {
      display: inline-block;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 11px;
      color: #334155;
      margin-bottom: 4px;
    }

    /* KPI Summary Bento */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      text-align: center;
    }
    .kpi-card.highlight {
      background: #ecfdf5;
      border-color: #a7f3d0;
    }
    .kpi-card.warn {
      background: #fef2f2;
      border-color: #fecaca;
    }
    .kpi-title {
      font-size: 11px;
      color: #64748b;
      display: block;
      margin-bottom: 2px;
      font-weight: 500;
    }
    .kpi-val {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
    }
    .kpi-card.highlight .kpi-val {
      color: #047857;
    }
    .kpi-card.warn .kpi-val {
      color: #dc2626;
    }

    /* Records Table */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
      margin-bottom: 16px;
    }
    table.data-table th {
      background: #005c55;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #004b45;
    }
    table.data-table td {
      padding: 5px 8px;
      border: 1px solid #cbd5e1;
      vertical-align: middle;
    }
    table.data-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    .status-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10.5px;
      font-weight: 700;
      text-align: center;
      white-space: nowrap;
    }
    .status-pass {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }
    .status-fail {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fca5a5;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fcd34d;
    }
    .route-tag {
      font-weight: 700;
      color: #005c55;
    }
    .bus-no {
      font-family: monospace;
      font-weight: 700;
      font-size: 12px;
    }

    /* Signatures Zone */
    .sign-zone {
      margin-top: 20px;
      width: 100%;
      border-top: 1px dashed #cbd5e1;
      padding-top: 15px;
      page-break-inside: avoid;
    }
    .sign-table {
      width: 100%;
      border-collapse: collapse;
      text-align: center;
      font-size: 11.5px;
    }
    .sign-table td {
      width: 33.33%;
      padding: 0 10px;
      vertical-align: top;
    }
    .sign-line {
      border-bottom: 1px solid #94a3b8;
      height: 40px;
      margin-bottom: 6px;
    }
    .sign-title {
      font-weight: 600;
      color: #334155;
    }
    .sign-role {
      font-size: 11px;
      color: #64748b;
    }

    /* Footer note */
    .footer-note {
      margin-top: 14px;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
      border-top: 1px solid #f1f5f9;
      padding-top: 6px;
    }

    @media print {
      body {
        margin: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Top Action Bar (for browser view / offline viewer) -->
    <div class="no-print" style="background:#005c55; color:white; padding:10px 16px; border-radius:8px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-weight:bold; font-size:14px;">
        🚌 เอกสารรายงานผลการตรวจสภาพรถ ขสมก. เขตการเดินรถที่ 6 (A4 PDF Format)
      </div>
      <div>
        <button onclick="window.print()" style="background:#ffffff; color:#005c55; border:none; padding:6px 14px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
          🖨️ สั่งพิมพ์ / บันทึกเป็น PDF
        </button>
      </div>
    </div>

    <!-- Official Header -->
    <table class="header-table">
      <tr>
        <td style="width: 70px; vertical-align: top;">
          <div class="emblem-box">ขสมก.</div>
        </td>
        <td style="vertical-align: top; padding-left: 10px;">
          <h1 class="title-main">องค์การขนส่งมวลชนกรุงเทพ (ขสมก.)</h1>
          <h2 class="title-sub">แบบรายงานผลการตรวจสภาพและความพร้อมของรถโดยสารประจำทาง</h2>
          <p class="title-dept">เขตการเดินรถที่ 6 (กปด.16 อู่ไร่ขิง / กปด.26 อู่พุทธมณฑลสาย 3 / กปด.36 อู่พุทธมณฑลสาย 3)</p>
        </td>
        <td class="doc-meta" style="vertical-align: top;">
          <span class="badge-doc">เอกสารควบคุมระบบดิจิทัล</span>
          <div><strong>วันที่ตรวจ:</strong> ${thaiDate}</div>
          <div><strong>เวลาที่ออกรายงาน:</strong> ${printTimeStr} น.</div>
          <div><strong>เขตการเดินรถ:</strong> เขต 6 (รวม 326 คัน)</div>
        </td>
      </tr>
    </table>

    <!-- KPI Metric Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-title">ตรวจแล้วทั้งหมด</span>
        <div class="kpi-val">${total} คัน</div>
      </div>
      <div class="kpi-card highlight">
        <span class="kpi-title">ผ่านเกณฑ์พร้อมบริการ</span>
        <div class="kpi-val">${passed} คัน</div>
      </div>
      <div class="kpi-card warn">
        <span class="kpi-title">พบข้อบกพร่อง/ต้องซ่อม</span>
        <div class="kpi-val">${failed} คัน</div>
      </div>
      <div class="kpi-card highlight">
        <span class="kpi-title">อัตราความพร้อมกองรถ</span>
        <div class="kpi-val">${passRate}%</div>
      </div>
    </div>

    <!-- Data Table -->
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 35px; text-align: center;">ลำดับ</th>
          <th style="width: 60px;">เวลา</th>
          <th style="width: 70px;">สาย (เซล B)</th>
          <th style="width: 75px;">เลขรถ (เซล D)</th>
          <th style="width: 100px;">กลุ่มงาน</th>
          <th style="width: 120px;">ผู้ตรวจสภาพรถ</th>
          <th style="width: 75px; text-align: center;">ผลการตรวจ</th>
          <th>รายการข้อบกพร่อง / คำสั่งการ</th>
        </tr>
      </thead>
      <tbody>
        ${
          filtered.length === 0
            ? `<tr><td colspan="8" style="text-align: center; padding: 20px; color: #94a3b8;">ไม่พบข้อมูลการตรวจตามเงื่อนไขที่เลือก</td></tr>`
            : filtered
                .map(
                  (rec, idx) => `
          <tr>
            <td style="text-align: center; color: #64748b;">${idx + 1}</td>
            <td style="font-family: monospace;">${rec.timeStr || '-'}</td>
            <td><span class="route-tag">สาย ${rec.busRoute}</span></td>
            <td><span class="bus-no">${rec.busNumber}</span></td>
            <td style="font-size: 11px;">${rec.operationGroupName || rec.operationGroup}</td>
            <td>
              <strong>${rec.inspectorName}</strong>
              ${rec.inspectorId ? `<div style="font-size: 10px; color: #64748b;">รหัส: ${rec.inspectorId}</div>` : ''}
            </td>
            <td style="text-align: center;">
              <span class="status-badge ${
                rec.overallStatus === 'pass'
                  ? 'status-pass'
                  : rec.overallStatus === 'fail'
                  ? 'status-fail'
                  : 'status-pending'
              }">
                ${
                  rec.overallStatus === 'pass'
                    ? '✓ ผ่าน'
                    : rec.overallStatus === 'fail'
                    ? '✕ ไม่ผ่าน'
                    : '⏳ รอตรวจ'
                }
              </span>
            </td>
            <td style="font-size: 11px;">
              ${
                rec.overallStatus === 'pass'
                  ? '<span style="color: #15803d;">พร้อมให้บริการตามมาตรฐาน (กปด.)</span>'
                  : `<span style="color: #b91c1c; font-weight: 600;">${rec.issuesSummary || 'มีรายการไม่ผ่านเกณฑ์'}</span>`
              }
              ${rec.supervisorNotes ? `<div style="color: #475569; font-size: 10px; margin-top: 2px;"><em>หมายเหตุ: ${rec.supervisorNotes}</em></div>` : ''}
            </td>
          </tr>
        `
                )
                .join('')
        }
      </tbody>
    </table>

    <!-- Official Signatures Zone -->
    <div class="sign-zone">
      <table class="sign-table">
        <tr>
          <td>
            <div class="sign-line"></div>
            <div class="sign-title">( ............................................................ )</div>
            <div class="sign-role">เจ้าหน้าที่ผู้ตรวจสภาพรถ (Inspector)</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">วันที่ ......../......../............</div>
          </td>
          <td>
            <div class="sign-line"></div>
            <div class="sign-title">( ............................................................ )</div>
            <div class="sign-role">นายตรวจ / หน.กลุ่มปฏิบัติการเดินรถ</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">วันที่ ......../......../............</div>
          </td>
          <td>
            <div class="sign-line"></div>
            <div class="sign-title">( ............................................................ )</div>
            <div class="sign-role">ผู้ช่วยผู้อำนวยการเขตการเดินรถที่ 6</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">วันที่ ......../......../............</div>
          </td>
        </tr>
      </table>
    </div>

    <div class="footer-note">
      ระบบตรวจสอบความพร้อมสภาพรถโดยสารประจำทางดิจิทัล ขสมก. เขตการเดินรถที่ 6 • สร้างรายงานเมื่อ ${thaiDate} เวลา ${printTimeStr} น. • จัดเก็บข้อมูลบนระบบคลาวด์มาตรฐาน
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates an official single vehicle inspection certificate HTML
 */
function generateSingleVehicleReportHtml(
  rec: InspectionRecord,
  thaiDate: string,
  printTimeStr: string,
  _options: ReportOptions
): string {
  const isPass = rec.overallStatus === 'pass';
  const exteriorPhoto = rec.photos?.exteriorUrl || rec.sets?.find((s) => s.id === 'exterior')?.imageUrl;
  const interiorPhoto = rec.photos?.interiorUrl || rec.sets?.find((s) => s.id === 'interior')?.imageUrl;
  const enginePhoto = rec.photos?.engineUrl || rec.sets?.find((s) => s.id === 'engine')?.imageUrl;

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>ใบตรวจสภาพรถ - สาย ${rec.busRoute} เบอร์ ${rec.busNumber} - ขสมก. เขต 6</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Prompt:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Sarabun', 'Prompt', sans-serif;
      font-size: 12.5px;
      line-height: 1.4;
      color: #1e293b;
      background: #ffffff;
    }
    .page-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      padding: 10px;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #005c55;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .emblem-box {
      width: 55px;
      height: 55px;
      background: #005c55;
      color: #ffffff;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18px;
    }
    .title-main {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .title-sub {
      font-size: 13px;
      font-weight: 600;
      color: #005c55;
      margin: 2px 0 0 0;
    }
    .title-dept {
      font-size: 11.5px;
      color: #64748b;
      margin: 2px 0 0 0;
    }

    /* Vehicle Info Box */
    .bus-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .bus-pill {
      display: inline-block;
      background: #005c55;
      color: #ffffff;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 700;
    }
    .status-badge-lg {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
    }
    .status-pass-lg {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }
    .status-fail-lg {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fca5a5;
    }

    /* 3 Inspection Sets Grid */
    .sets-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .set-box {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px;
      background: #ffffff;
    }
    .set-title {
      font-weight: 700;
      font-size: 12px;
      color: #005c55;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
    }
    .set-photo {
      width: 100%;
      height: 95px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      background: #f1f5f9;
      display: block;
      margin-bottom: 6px;
    }
    .photo-placeholder {
      width: 100%;
      height: 95px;
      border-radius: 4px;
      border: 1px dashed #cbd5e1;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    .set-items-list {
      font-size: 10.5px;
      color: #334155;
      line-height: 1.35;
    }

    /* Items Checklist Table */
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 12px;
    }
    table.items-table th {
      background: #005c55;
      color: #ffffff;
      padding: 5px 8px;
      border: 1px solid #004b45;
      text-align: left;
    }
    table.items-table td {
      padding: 4px 8px;
      border: 1px solid #cbd5e1;
    }
    table.items-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Sign-off */
    .sign-zone {
      margin-top: 15px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 12px;
    }
    .sign-table {
      width: 100%;
      text-align: center;
      font-size: 11px;
    }
    .sign-table td {
      width: 50%;
      padding: 0 15px;
    }
    .sign-line {
      border-bottom: 1px solid #94a3b8;
      height: 35px;
      margin-bottom: 4px;
    }

    @media print {
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="no-print" style="background:#005c55; color:white; padding:10px 16px; border-radius:8px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-weight:bold; font-size:14px;">
        🚌 ใบรับรองผลการตรวจสภาพรถเฉพาะคัน (สาย ${rec.busRoute} เบอร์ ${rec.busNumber})
      </div>
      <div>
        <button onclick="window.print()" style="background:#ffffff; color:#005c55; border:none; padding:6px 14px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
          🖨️ สั่งพิมพ์ / บันทึกเป็น PDF
        </button>
      </div>
    </div>

    <!-- Official Header -->
    <table class="header-table">
      <tr>
        <td style="width: 60px; vertical-align: top;">
          <div class="emblem-box">ขสมก.</div>
        </td>
        <td style="vertical-align: top; padding-left: 10px;">
          <h1 class="title-main">องค์การขนส่งมวลชนกรุงเทพ (ขสมก.) เขตการเดินรถที่ 6</h1>
          <h2 class="title-sub">ใบรับรองและบันทึกผลการตรวจสอบสภาพความพร้อมรถโดยสาร (กปด.36)</h2>
          <p class="title-dept">${rec.operationGroupName || 'กลุ่มปฏิบัติการเดินรถ เขต 6'} • ทะเบียนคุมการตรวจ</p>
        </td>
        <td style="text-align: right; vertical-align: top; font-size: 11px; color: #475569;">
          <div><strong>วันที่ตรวจ:</strong> ${rec.dateStr}</div>
          <div><strong>เวลาตรวจ:</strong> ${rec.timeStr} น.</div>
          <div><strong>เลขที่บันทึก:</strong> ${rec.id ? rec.id.slice(0, 10).toUpperCase() : 'BMTA-6'}</div>
        </td>
      </tr>
    </table>

    <!-- Vehicle Overview Bar -->
    <div class="bus-card">
      <div>
        <span class="bus-pill">สาย ${rec.busRoute}</span>
        <span style="font-size: 18px; font-weight: 800; font-family: monospace; color: #005c55; margin-left: 8px;">
          เลขข้างรถ: ${rec.busNumber}
        </span>
        <div style="font-size: 11.5px; color: #64748b; margin-top: 4px;">
          ผู้ตรวจสภาพรถ: <strong>${rec.inspectorName}</strong> ${rec.inspectorId ? `(รหัส ${rec.inspectorId})` : ''} • สังกัด: ${rec.operationGroupName}
        </div>
      </div>
      <div style="text-align: right;">
        <span class="status-badge-lg ${isPass ? 'status-pass-lg' : 'status-fail-lg'}">
          ${isPass ? '✓ ผ่านเกณฑ์มาตรฐาน (พร้อมบริการ)' : '✕ ไม่ผ่านเกณฑ์ (ต้องส่งซ่อม)'}
        </span>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
          ผ่าน ${rec.passedCount || 12} / ${rec.totalCount || 12} รายการ
        </div>
      </div>
    </div>

    <!-- 3 Standard Sets with Evidence Photos -->
    <div class="sets-grid">
      <!-- Set 1: Exterior -->
      <div class="set-box">
        <div class="set-title">
          <span>ชุดที่ 1: ภายนอกตัวรถ</span>
          <span>✓ มาตรฐาน</span>
        </div>
        ${
          exteriorPhoto
            ? `<img src="${exteriorPhoto}" class="set-photo" alt="ภายนอก" />`
            : `<div class="photo-placeholder">📷 ไม่มีภาพถ่ายภายนอก</div>`
        }
        <div class="set-items-list">
          <div>• สภาพยางล้อ/น็อตล้อ 4 ตำแหน่ง</div>
          <div>• กระจกมองข้าง/บานหน้า-หลัง</div>
          <div>• โคมไฟหน้า-ท้าย/ไฟเลี้ยว</div>
          <div>• สีตัวถังและป้ายสายเดินรถ</div>
        </div>
      </div>

      <!-- Set 2: Interior -->
      <div class="set-box">
        <div class="set-title">
          <span>ชุดที่ 2: ภายในห้องโดยสาร</span>
          <span>✓ มาตรฐาน</span>
        </div>
        ${
          interiorPhoto
            ? `<img src="${interiorPhoto}" class="set-photo" alt="ภายใน" />`
            : `<div class="photo-placeholder">📷 ไม่มีภาพถ่ายภายใน</div>`
        }
        <div class="set-items-list">
          <div>• กริ่งสัญญาณหยุดรถครบทุกจุด</div>
          <div>• ค้อนทุบกระจกฉุกเฉินประจำจุด</div>
          <div>• ถังดับเพลิงเคมีพร้อมใช้งาน</div>
          <div>• สภาพเบาะนั่ง/ราวจับ/ความสะอาด</div>
        </div>
      </div>

      <!-- Set 3: Engine -->
      <div class="set-box">
        <div class="set-title">
          <span>ชุดที่ 3: ระบบเครื่องยนต์</span>
          <span>✓ มาตรฐาน</span>
        </div>
        ${
          enginePhoto
            ? `<img src="${enginePhoto}" class="set-photo" alt="เครื่องยนต์" />`
            : `<div class="photo-placeholder">📷 ไม่มีภาพถ่ายเครื่องยนต์</div>`
        }
        <div class="set-items-list">
          <div>• ระดับน้ำมันเครื่องและน้ำหล่อเย็น</div>
          <div>• ระบบลมเบรกและมาตรวัดลม</div>
          <div>• สภาพควันไอเสียและการเผาไหม้</div>
          <div>• เสียงเครื่องยนต์/สตาร์ทติดง่าย</div>
        </div>
      </div>
    </div>

    <!-- Detailed Inspection List if available -->
    ${
      rec.items && rec.items.length > 0
        ? `
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 30px; text-align: center;">ลำดับ</th>
            <th>รายการตรวจมาตรฐานความปลอดภัย (12 จุด)</th>
            <th style="width: 70px; text-align: center;">สถานะ</th>
            <th>ข้อเสนอแนะ / ข้อบกพร่องที่พบ</th>
          </tr>
        </thead>
        <tbody>
          ${rec.items
            .map(
              (item, idx) => `
            <tr>
              <td style="text-align: center; color: #64748b;">${idx + 1}</td>
              <td>${item.label}</td>
              <td style="text-align: center; font-weight: bold; color: ${item.status === 'pass' ? '#15803d' : '#b91c1c'};">
                ${item.status === 'pass' ? '✓ ผ่าน' : '✕ ไม่ผ่าน'}
              </td>
              <td style="color: ${item.status === 'pass' ? '#64748b' : '#b91c1c'};">
                ${item.notes || (item.status === 'pass' ? 'ปกติ' : 'ต้องแก้ไข')}
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
        : ''
    }

    <!-- Issues / Remarks Box -->
    <div style="background: ${isPass ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${isPass ? '#bbf7d0' : '#fecaca'}; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px;">
      <strong style="color: ${isPass ? '#166534' : '#991b1b'}; display: block; font-size: 11.5px; margin-bottom: 2px;">
        สรุปผลและข้อบกพร่อง:
      </strong>
      <div style="font-size: 11.5px; color: ${isPass ? '#15803d' : '#b91c1c'};">
        ${rec.issuesSummary || (isPass ? 'ผ่านเกณฑ์มาตรฐานทุกจุด รถพร้อมออกให้บริการรับส่งผู้โดยสาร' : 'มีรายการไม่ผ่านเกณฑ์')}
      </div>
      ${
        rec.supervisorNotes
          ? `<div style="font-size: 11px; color: #475569; margin-top: 4px; padding-top: 4px; border-top: 1px dashed ${isPass ? '#bbf7d0' : '#fecaca'};">
              <strong>คำสั่งการหัวหน้างาน:</strong> ${rec.supervisorNotes}
            </div>`
          : ''
      }
    </div>

    <!-- Signatures -->
    <div class="sign-zone">
      <table class="sign-table">
        <tr>
          <td>
            <div class="sign-line"></div>
            <div style="font-weight: 700; color: #1e293b;">( ${rec.inspectorName} )</div>
            <div style="color: #64748b; font-size: 10.5px;">เจ้าหน้าที่ผู้ตรวจสภาพรถ (Inspector)</div>
            <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">วันที่ ${rec.dateStr} เวลา ${rec.timeStr} น.</div>
          </td>
          <td>
            <div class="sign-line"></div>
            <div style="font-weight: 700; color: #1e293b;">( ............................................................ )</div>
            <div style="color: #64748b; font-size: 10.5px;">นายตรวจ / หัวหน้ากลุ่มปฏิบัติการเดินรถ (Supervisor)</div>
            <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">วันที่ ......../......../............</div>
          </td>
        </tr>
      </table>
    </div>

    <div style="margin-top: 12px; font-size: 9.5px; color: #94a3b8; text-align: center;">
      เอกสารบันทึกการตรวจสภาพรถโดยสารดิจิทัล ขสมก. เขตการเดินรถที่ 6 • จัดพิมพ์เมื่อ ${thaiDate} ${printTimeStr} น.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers the browser's native print engine (Print to PDF) via an isolated hidden iframe
 */
export function triggerPrintHtml(htmlContent: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('title', 'Print Frame');

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Wait for images and webfonts to settle
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error('Error invoking print dialog:', err);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  }, 350);
}

/**
 * Downloads a standalone HTML file that can be opened in any browser and saved/printed to PDF
 */
export function downloadPrintableFile(htmlContent: string, fileName: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
