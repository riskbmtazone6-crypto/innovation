import React, { useState } from 'react';
import { OfficialPoster } from './OfficialPoster';

interface SystemManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ManualSection {
  id: string;
  title: string;
  badge: string;
  icon: string;
  subtitle: string;
  description: string;
  screenSummary: string[];
  keyHighlights: { icon: string; title: string; desc: string }[];
  uiMockup: React.ReactNode;
}

export const SystemManualModal: React.FC<SystemManualModalProps> = ({ isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState<'poster' | 'screenByScreen'>('poster');
  const [activeSectionId, setActiveSectionId] = useState<string>('step1');

  if (!isOpen) return null;

  const handlePrintManual = () => {
    window.print();
  };

  const manualSections: ManualSection[] = [
    {
      id: 'step1',
      title: 'ขั้นตอนที่ 1: ข้อมูลผู้ตรวจและรถโดยสาร (Step 1)',
      badge: 'Step 1',
      icon: 'badge',
      subtitle: 'การระบุรหัสพนักงาน (ID) ดึงชื่ออัตโนมัติ สังกัด กปด. และสแกน QR Code ประจำรถ',
      description:
        'หน้าจอเริ่มต้นสำหรับการปฏิบัติงานของผู้ตรวจการ ขสมก. เขต 6 เริ่มจากการกรอกเลขประจำตัวพนักงาน (ID) ระบบจะดึงชื่อ-นามสกุลให้อัตโนมัติ จากนั้นเลือกกลุ่มงานปฏิบัติการเดินรถ (กปด.16, 26, หรือ 36) และสแกน QR Code ประจำรถ เพื่อดึงสายเดินรถ (เซล B) และเลขข้างรถ (เซล D) พร้อมยี่ห้อ ISUZU และทะเบียนรถ (เซล E) เข้าสู่แบบฟอร์มทันที หรือจะค้นหาจากบัญชีรถ 326 คันของเขต 6 ก็ได้',
      screenSummary: [
        '1. ช่องกรอกเลขประจำตัวผู้ตรวจ (ID) เช่น 60124 ระบบดึงชื่ออัตโนมัติ "นายสมศักดิ์ ขสมก."',
        '2. ช่องชื่อ-นามสกุลผู้ตรวจสอบ (NAME) สามารถแก้ไขหรือพิมพ์เพิ่มเติมได้',
        '3. เมนูเลือกสังกัดกลุ่มงาน: กปด.16 (อู่ไร่ขิง), กปด.26 (อู่พุทธมณฑลสาย 3), กปด.36 (อู่พุทธมณฑลสาย 3)',
        '4. ปุ่ม "📷 เปิดกล้องสแกน QR" สแกนป้าย QR หน้ารถหรือข้างรถ',
        '5. ช่องสายเดินรถ (ดึงจากเซล B) เช่น สาย 4-59, 515, 4-43, 91ก',
        '6. ช่องเลขข้างรถ (ดึงจากเซล D) เช่น 50010, 55001, 56070',
        '7. แสดงยี่ห้อ/รุ่นรถ (เซล C: ISUZU) และ ทะเบียนรถ (เซล E เช่น 11-8991)',
        '8. เมนู "ค้นหาจากบัญชีรถ 326 คันของเขต 6" และปุ่ม Quick Test จำลองสแกนด่วน',
        '9. ปุ่ม "เริ่มต้นตรวจสอบสภาพรถ (ไปขั้นตอนที่ 2) →"'
      ],
      keyHighlights: [
        {
          icon: 'badge',
          title: 'ดึงชื่อจาก ID อัตโนมัติ',
          desc: 'เพียงพิมพ์เลขประจำตัวพนักงาน 5-6 หลัก ระบบจะแสดงชื่อ-นามสกุลทันที'
        },
        {
          icon: 'qr_code_scanner',
          title: 'สแกน QR เซล B และ เซล D',
          desc: 'ดึงสายเดินรถจากเซล B และเลขข้างรถจากเซล D พร้อมข้อมูลทะเบียนรถครบถ้วน'
        },
        {
          icon: 'directions_bus',
          title: 'บัญชีกองรถ 326 คัน',
          desc: 'มีฐานข้อมูลรถโดยสาร ISUZU ครบทั้ง 326 คันของเขตการเดินรถที่ 6'
        }
      ],
      uiMockup: (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-700 space-y-3 font-sans shadow-lg text-[13px]">
          {/* Header Mock */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-slate-300 text-[12px] ml-2">
                Step 1: ข้อมูลผู้ตรวจและรถโดยสาร (ขสมก. เขต 6)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#005c55] text-[11px] font-bold text-white">
              ขั้นตอนที่ 1 / 3
            </span>
          </div>

          {/* Form Content Mock */}
          <div className="space-y-2.5 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">badge</span>
                <span>ส่วนที่ 1: ข้อมูลผู้ตรวจสอบ</span>
              </span>
              <span className="text-[11px] text-slate-400">ระบบจำรหัสผู้ตรวจ</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="bg-slate-700/80 p-2 rounded-lg border border-slate-600">
                <span className="text-slate-400 block text-[10px]">เลขประจำตัว (ID):</span>
                <span className="text-emerald-300 font-bold text-[13px]">60124</span>
              </div>
              <div className="bg-slate-700/80 p-2 rounded-lg border border-slate-600">
                <span className="text-slate-400 block text-[10px]">ชื่อ-นามสกุล (NAME):</span>
                <span className="text-white font-semibold">นายสมศักดิ์ ขสมก.</span>
              </div>
            </div>
            <div className="bg-slate-700/80 p-2 rounded-lg border border-slate-600">
              <span className="text-slate-400 block text-[10px]">สังกัดกลุ่มงานปฏิบัติการเดินรถ:</span>
              <span className="text-amber-300 font-bold text-[12px]">กปด.36 (อู่พุทธมณฑลสาย 3)</span>
            </div>

            <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">directions_bus</span>
                <span>ส่วนที่ 2: ข้อมูลรถโดยสาร (เขต 6)</span>
              </span>
              <span className="px-2 py-0.5 bg-emerald-900/60 text-emerald-300 rounded text-[10px] font-bold">
                QR Scanner พร้อมใช้
              </span>
            </div>

            {/* QR Scan Action Bar Mock */}
            <div className="bg-gradient-to-r from-emerald-950/70 via-slate-800 to-slate-900 p-2.5 rounded-lg border border-emerald-600/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[20px] animate-pulse">
                  qr_code_scanner
                </span>
                <div>
                  <span className="text-[12px] font-bold text-white block">สแกน QR Code ประจำรถ</span>
                  <span className="text-[10px] text-emerald-300">ดึงสาย (เซล B) & เลขข้างรถ (เซล D)</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#005c55] text-white rounded-lg text-[11px] font-bold shadow-xs">
                📷 เปิดกล้องสแกน
              </span>
            </div>

            {/* Selected Bus Info Display */}
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="bg-slate-700/80 p-2 rounded-lg border border-emerald-500/50">
                <span className="text-slate-400 block text-[10px]">สายเดินรถ (เซล B):</span>
                <span className="text-emerald-300 font-bold text-[14px]">สาย 4-59</span>
              </div>
              <div className="bg-slate-700/80 p-2 rounded-lg border border-emerald-500/50">
                <span className="text-slate-400 block text-[10px]">เลขข้างรถ (เซล D):</span>
                <span className="text-emerald-300 font-bold text-[14px]">50010</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="bg-slate-700/50 p-1.5 rounded">ยี่ห้อ: <strong>ISUZU</strong></div>
              <div className="bg-slate-700/50 p-1.5 rounded">ทะเบียน: <strong className="text-amber-300">11-8991</strong></div>
            </div>
          </div>

          {/* Action Button Mock */}
          <div className="pt-1">
            <div className="w-full py-2.5 bg-[#005c55] text-white font-bold text-center rounded-xl flex items-center justify-center gap-1.5 shadow-md">
              <span>เริ่มต้นตรวจสอบสภาพรถ (ไปขั้นตอนที่ 2)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'qr-scanner',
      title: 'หน้าต่างสแกน QR Code ประจำรถ (QR Scanner Modal)',
      badge: 'QR Scanner',
      icon: 'qr_code_2',
      subtitle: 'ระบบสแกนกล้องสด รองรับไฟล์ Excel databusnumber.xlsx (เซล B, D, E, F)',
      description:
        'หน้าต่าง Modal สำหรับสแกน QR Code ประจำรถ ขสมก. เขต 6 ด้วยกล้องสด หรือเลือกรูปภาพ QR จากโทรศัพท์ ตัวสแกนรองรับข้อมูลที่ส่งออกจากตาราง Excel โดยดึงสายเดินรถจากเซล B, เลขข้างรถจากเซล D, รุ่นรถ ISUZU จากเซล C, ทะเบียนรถจากเซล E และ JSON Payload ในเซล F พร้อมทั้งมีระบบค้นหาและเลือกจากบัญชีรถ 326 คันได้โดยตรง',
      screenSummary: [
        '1. หน้าต่างส่องกล้องสแกนแบบ Real-time พร้อมเส้นเล็งเป้าและเลเซอร์สีเขียว',
        '2. การดึงข้อมูลอัตโนมัติ: สายเดินรถ (เซล B) และ เลขข้างรถ (เซล D)',
        '3. การตรวจจับและจับคู่ทะเบียนรถ ขสมก. (เช่น 11-8991) และรุ่นรถ ISUZU',
        '4. ปุ่มเปิด/ปิดไฟฉาย (Flashlight) สำหรับสแกนในที่มืด หรือเวลากลางคืน',
        '5. ปุ่มสลับกล้องหน้า-หลัง (Switch Camera)',
        '6. ปุ่มอัปโหลดรูปภาพ QR Code จากแกลเลอรีภาพในเครื่อง',
        '7. ปุ่มค้นหาด่วนจากบัญชีรถ 326 คันของเขต 6',
        '8. ปุ่ม Quick Test จำลองสแกนด่วน (4-59, 515, 4-43, 91ก)'
      ],
      keyHighlights: [
        {
          icon: 'table_view',
          title: 'ตรงตามโครงสร้าง Excel ขสมก.',
          desc: 'แยกเซล B (สาย) และเซล D (เลขข้างรถ) ได้แม่นยำ 100%'
        },
        {
          icon: 'flash_on',
          title: 'สแกนไวในเสี้ยววินาที',
          desc: 'ตรวจจับ QR ทันทีที่เข้าสู่กรอบเล็งเป้า พร้อมเสียงและสั่นเตือน'
        },
        {
          icon: 'fact_check',
          title: 'แสดงผลตรวจสอบทันที',
          desc: 'แถบสีเขียวยืนยันข้อมูลรถพร้อมปุ่มนำเข้าข้อมูลสู่แบบฟอร์ม'
        }
      ],
      uiMockup: (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-700 space-y-3 font-sans shadow-lg text-[13px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                qr_code_scanner
              </span>
              <span className="font-bold text-white text-[13px]">สแกน QR Code ประจำรถ (เขต 6)</span>
            </div>
            <span className="text-[11px] text-slate-400">ปิด (ESC)</span>
          </div>

          {/* Scanner Viewport Mock */}
          <div className="relative bg-black rounded-xl h-44 flex flex-col items-center justify-center overflow-hidden border border-slate-700">
            {/* Target Box */}
            <div className="w-32 h-32 border-2 border-emerald-400 rounded-xl relative flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400 text-[40px] animate-pulse">
                  qr_code_2
                </span>
              </div>
              {/* Scan beam line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-bounce"></div>
            </div>

            {/* Quick helper controls inside camera */}
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="p-1 bg-black/60 rounded text-slate-300 text-[10px]">🔦 ไฟฉาย</span>
              <span className="p-1 bg-black/60 rounded text-slate-300 text-[10px]">🔄 สลับกล้อง</span>
            </div>

            <span className="absolute bottom-2 bg-black/80 text-white text-[10px] px-3 py-1 rounded-full border border-emerald-500/30">
              📷 เล็งกล้องไปที่ QR Code หน้ารถหรือข้างรถ
            </span>
          </div>

          {/* Result Tag Mock */}
          <div className="bg-emerald-950/80 border border-emerald-500/60 p-2.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 block font-bold">✓ ดึงข้อมูลจากเซล B และ D สำเร็จ:</span>
              <span className="font-bold text-white text-[13px]">
                สาย 4-59 • เลขข้างรถ 50010 (ISUZU 11-8991)
              </span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg shadow-xs">
              นำเข้าข้อมูล
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'step2',
      title: 'ขั้นตอนที่ 2: ตรวจ 3 ชุดรายการมาตรฐาน (Step 2)',
      badge: 'Step 2',
      icon: 'checklist',
      subtitle: 'เช็คลิสต์ 3 ชุดหลัก (ภายนอก, ภายใน, เครื่องยนต์) + ถ่ายภาพ 3 รูปยืนยัน',
      description:
        'ขั้นตอนการตรวจสภาพรถตามมาตรฐานความปลอดภัย ขสมก. เขต 6 แบ่งการตรวจสอบออกเป็น 3 ชุดรายการหลักชัดเจน ได้แก่ 1. ภายนอกตัวรถ, 2. ภายในห้องโดยสาร และ 3. ระบบเครื่องยนต์และช่วงล่าง แต่ละชุดบังคับถ่ายภาพยืนยัน 1 ภาพ (รวม 3 ภาพ) และมีปุ่มทางลัด "✓ ผ่านทั้งหมดในชุดนี้" ช่วยให้ผู้ตรวจทำงานได้รวดเร็ว',
      screenSummary: [
        '1. แถบความคืบหน้าด้านบน (Sticky Progress Bar 0 - 100%)',
        '2. แถบปุ่มทางลัด 3 ชุด (Jump Strip): 1. ภายนอก, 2. ภายใน, 3. เครื่องยนต์',
        '3. ชุดที่ 1: ภายนอกตัวรถ (ถ่ายภาพ 1 ภาพ + เช็ค 4 รายการ: ตัวถัง สี, ไฟส่องสว่าง, ยางรถ, ป้ายสาย)',
        '4. ชุดที่ 2: ภายในห้องโดยสาร (ถ่ายภาพ 1 ภาพ + เช็ค 4 รายการ: เบาะ/ราวจับ, ประตู, CCTV/แอร์, ค้อน/ถังดับเพลิง)',
        '5. ชุดที่ 3: ระบบเครื่องยนต์ (ถ่ายภาพห้องเครื่อง 1 ภาพ + เช็ค 4 รายการ: รอยรั่วซึม, น้ำมันเครื่อง, ลมเบรก, ควันดำ)',
        '6. ปุ่ม "✓ ผ่านทั้งหมดในชุดนี้" ประจำแต่ละชุด กดครั้งเดียวผ่านทุกข้อในชุดนั้น',
        '7. ปุ่มทางลัด "⚡ เติมข้อมูลทดสอบด่วน (Quick Demo)" สำหรับทดสอบระบบ',
        '8. ปุ่ม "สรุปผลและบันทึกข้อมูล (ไปขั้นตอนที่ 3) →"'
      ],
      keyHighlights: [
        {
          icon: 'photo_camera',
          title: '3 ชุด = ถ่าย 3 ภาพหลักฐาน',
          desc: 'ถ่ายภาพยืนยันชุดละ 1 ภาพ ไม่ต้องถ่ายย่อยซ้ำซ้อน รวดเร็วและถูกต้อง'
        },
        {
          icon: 'done_all',
          title: 'ปุ่มผ่านทั้งหมดในชุด',
          desc: 'คลิกเดียวปรับสถานะรายการย่อยทั้งหมดในชุดนั้นเป็น "ผ่าน" ทันที'
        },
        {
          icon: 'assignment_turned_in',
          title: 'สรุปผลก่อนส่งคลาวด์',
          desc: 'ปุ่มส่งข้อมูลจะนำเข้าสู่หน้าต่างสรุปผลและลงนามอย่างเป็นทางการ'
        }
      ],
      uiMockup: (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-700 space-y-3 font-sans shadow-lg text-[13px]">
          {/* Header Mock */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-[13px]">
                Step 2: การตรวจ 3 ชุดรายการมาตรฐาน
              </span>
              <span className="text-[11px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-bold">
                สาย 4-59 (50010)
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">ความคืบหน้า 100%</span>
          </div>

          {/* 3 Jump Sets Mock */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <div className="bg-emerald-950/80 border border-emerald-600 p-1.5 rounded-lg text-center">
              <span className="font-bold text-emerald-300 block">1. ภายนอก</span>
              <span className="text-[10px] text-emerald-400">✓ ภาพครบ • 4/4 ข้อ</span>
            </div>
            <div className="bg-emerald-950/80 border border-emerald-600 p-1.5 rounded-lg text-center">
              <span className="font-bold text-emerald-300 block">2. ภายใน</span>
              <span className="text-[10px] text-emerald-400">✓ ภาพครบ • 4/4 ข้อ</span>
            </div>
            <div className="bg-emerald-950/80 border border-emerald-600 p-1.5 rounded-lg text-center">
              <span className="font-bold text-emerald-300 block">3. เครื่องยนต์</span>
              <span className="text-[10px] text-emerald-400">✓ ภาพครบ • 4/4 ข้อ</span>
            </div>
          </div>

          {/* Set 1 Card Detail Mock */}
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#005c55] text-white flex items-center justify-center font-bold text-[11px]">
                  1
                </span>
                <span className="font-bold text-white text-[12px]">ชุดที่ 1: ภายนอกตัวรถ</span>
              </div>
              <span className="text-[10px] bg-emerald-600/40 text-emerald-300 px-2 py-0.5 rounded font-bold">
                ✓ ผ่านทั้งหมดในชุดนี้
              </span>
            </div>

            {/* Photo proof bar */}
            <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-700 text-[11px]">
              <span className="text-slate-300">📷 ภาพถ่ายภายนอก: บันทึกและประทับลายน้ำแล้ว</span>
              <span className="text-emerald-400 font-bold">✓ ตรวจสอบแล้ว</span>
            </div>

            {/* Sample items */}
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between bg-slate-700/50 p-1.5 rounded">
                <span>1.1 สภาพตัวถัง สี และกระจกรอบคัน</span>
                <span className="text-emerald-400 font-bold">✓ ผ่าน</span>
              </div>
              <div className="flex items-center justify-between bg-slate-700/50 p-1.5 rounded">
                <span>1.2 ระบบไฟส่องสว่าง & ยางรถยนต์</span>
                <span className="text-emerald-400 font-bold">✓ ผ่าน</span>
              </div>
            </div>
          </div>

          {/* Bottom Action Button */}
          <div className="py-2.5 bg-[#005c55] text-white font-bold text-center rounded-xl flex items-center justify-center gap-1.5 shadow-md">
            <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
            <span>สรุปผลและบันทึกข้อมูล (ไปขั้นตอนที่ 3)</span>
          </div>
        </div>
      )
    },
    {
      id: 'photo-watermark',
      title: 'เมนูถ่ายภาพ & ประทับลายน้ำ (Photo Evidence & Watermark)',
      badge: 'Photo Evidence',
      icon: 'photo_camera',
      subtitle: 'ระบบประทับลายน้ำข้อมูลรถ สายเดินรถ เลขข้างรถ และเวลาลงในรูปภาพอัตโนมัติ',
      description:
        'หน้าต่าง Modal สำหรับถ่ายภาพหลักฐานการตรวจสภาพรถแต่ละชุด ระบบจะเปิดกล้องสด หรือให้อัปโหลดภาพ พร้อมทั้งประทับข้อความลายน้ำ (Automated Watermark) ระบุสังกัด ขสมก. เขตการเดินรถที่ 6, สายเดินรถ (เซล B: 4-59), เลขข้างรถ (เซล D: 50010), รหัสผู้ตรวจการ, วันที่ และเวลาจริงลงในไฟล์ภาพ ป้องกันการสวมรอย',
      screenSummary: [
        '1. ปุ่ม "เปิดกล้องถ่ายภาพสด" หรือ "เลือกภาพถ่ายจากเครื่อง"',
        '2. กรอบพรีวิวรูปภาพความละเอียดสูง พร้อมปุ่มหมุนภาพ 90° (Rotate)',
        '3. แถบประทับลายน้ำดิจิทัลอัตโนมัติ (Automated Watermark):',
        '   - สังกัด: ขสมก. เขตการเดินรถที่ 6 (กปด.36)',
        '   - สายเดินรถ & เลขข้างรถ: สาย 4-59 (50010) ISUZU',
        '   - ผู้ตรวจ: นายสมศักดิ์ ขสมก. (รหัส 60124)',
        '   - วันที่และเวลาจริงตามนาฬิกาเครื่อง (Timestamp)',
        '4. ปุ่ม "ยืนยันภาพถ่ายประจำชุดนี้" และปุ่ม "ถ่ายใหม่"'
      ],
      keyHighlights: [
        {
          icon: 'branding_watermark',
          title: 'ประทับลายน้ำอัตโนมัติ',
          desc: 'ระบุข้อมูลรถและเวลาลงในภาพถ่ายทันที ไม่สามารถปลอมแปลงได้'
        },
        {
          icon: 'verified',
          title: 'ยืนยันความถูกต้อง',
          desc: 'ใช้เป็นหลักฐานทางการยืนยันสภาพรถก่อนปล่อยรถออกบริการ'
        },
        {
          icon: 'rotate_right',
          title: 'ปรับหมุนและพรีวิว',
          desc: 'หมุนภาพ 90 องศาได้สะดวกทั้งภาพแนวนอนและแนวตั้ง'
        }
      ],
      uiMockup: (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-700 space-y-3 font-sans shadow-lg text-[13px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                photo_camera
              </span>
              <span className="font-bold text-white text-[13px]">
                ถ่ายภาพหลักฐาน: ชุดที่ 1 ภายนอกตัวรถ
              </span>
            </div>
            <span className="text-[11px] text-slate-400">ปิด</span>
          </div>

          {/* Photo Frame Mock with Watermark */}
          <div className="relative bg-slate-950 rounded-xl h-44 overflow-hidden border border-slate-700 flex items-center justify-center">
            {/* Bus Silhouette Illustration */}
            <div className="text-center space-y-1">
              <span className="material-symbols-outlined text-emerald-400 text-[48px]">
                directions_bus
              </span>
              <p className="text-[11px] text-slate-300 font-semibold">[ภาพตัวอย่างภายนอกตัวรถ]</p>
            </div>

            {/* Watermark Overlay at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/85 backdrop-blur-xs p-2 text-[10px] text-left border-t border-emerald-500/40">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>🚌 ขสมก. เขตการเดินรถที่ 6 (กปด.36)</span>
                <span>สาย 4-59 (50010)</span>
              </div>
              <div className="text-slate-300 flex items-center justify-between mt-0.5">
                <span>ผู้ตรวจ: นายสมศักดิ์ ขสมก. (60124)</span>
                <span>22/09/2026 08:30 น.</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold text-[12px] border border-slate-700">
              ถ่ายใหม่
            </button>
            <button className="flex-2 py-2 bg-[#005c55] text-white rounded-xl font-bold text-[12px] shadow-md">
              ยืนยันภาพถ่ายประจำชุดนี้
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'summary-modal',
      title: 'หน้าต่างสรุปผลและลงนามส่งรายงาน (Inspection Summary Modal)',
      badge: 'Summary',
      icon: 'fact_check',
      subtitle: 'ตรวจทานผลการตรวจ 3 ชุด ภาพถ่ายหลักฐาน ลายมือชื่อ และบันทึก Cloud Firestore',
      description:
        'หน้าต่าง Modal สำหรับตรวจทานผลการตรวจสภาพรถทั้งหมดก่อนส่งขึ้น Cloud Firestore แสดงสถานะความพร้อมของรถ (พร้อมบริการ 100% หรือ พบข้อบกพร่อง) พรีวิวภาพถ่ายยืนยัน 3 ชุด สรุปรายการผ่าน/ไม่ผ่าน คำสั่งการหัวหน้างาน และช่องลงนามดิจิทัล (Digital Signature)',
      screenSummary: [
        '1. ป้ายแจ้งสถานะภาพรวม: "✓ ผ่านเกณฑ์มาตรฐานครบทั้ง 3 ชุด (พร้อมบริการ)" หรือ "พบข้อบกพร่อง"',
        '2. ข้อมูลสรุปสายเดินรถ (เซล B) เลขข้างรถ (เซล D) ผู้ตรวจ และสังกัด กปด.',
        '3. พรีวิวภาพถ่ายหลักฐานยืนยันครบทั้ง 3 ชุด (ภายนอก, ภายใน, เครื่องยนต์)',
        '4. กล่องสรุปคะแนน: ผ่าน 12/12 รายการ หรือแจกแจงข้อที่ชำรุด',
        '5. ช่องบันทึกคำสั่งการของหัวหน้างาน / ผู้ตรวจการ (Supervisor Note)',
        '6. ช่องลงลายมือชื่อดิจิทัล (Digital Signature)',
        '7. ปุ่ม "ยืนยันและบันทึกข้อมูล (ส่งรายงาน)" ซิงค์ขึ้น Cloud Firestore ทันที'
      ],
      keyHighlights: [
        {
          icon: 'cloud_done',
          title: 'ซิงค์ Cloud Firestore',
          desc: 'ข้อมูลถูกส่งเข้าสู่ฐานข้อมูลกลางของเขต 6 ทันทีที่กดยืนยัน'
        },
        {
          icon: 'draw',
          title: 'ลงลายมือชื่อดิจิทัล',
          desc: 'เซ็นชื่อกำกับผลการตรวจบนหน้าจอได้ทันทีเพื่อความสมบูรณ์ของเอกสาร'
        },
        {
          icon: 'verified',
          title: 'รับรองสถานะพร้อมบริการ',
          desc: 'รถที่ผ่านครบ 3 ชุด จะได้รับสถานะ "พร้อมบริการ 100%" ทันที'
        }
      ],
      uiMockup: (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-700 space-y-3 font-sans shadow-lg text-[13px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-bold text-white text-[13px]">
              สรุปผลการตรวจสอบสภาพรถ 3 ชุดรายการ
            </span>
            <span className="text-[11px] text-slate-400">ตรวจทานก่อนส่ง</span>
          </div>

          {/* Status Banner Mock */}
          <div className="bg-emerald-950/80 border border-emerald-500/50 p-2.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[24px]">
                check_circle
              </span>
              <div>
                <span className="font-bold text-emerald-300 text-[12px] block">
                  ผ่านเกณฑ์มาตรฐานครบทั้ง 3 ชุด
                </span>
                <span className="text-[10px] text-emerald-400/80">รถพร้อมออกให้บริการ 100%</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-bold rounded-full text-[10px]">
              พร้อมบริการ
            </span>
          </div>

          {/* 3 Photos Mini Preview */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700">
              <div className="h-10 bg-slate-700 rounded flex items-center justify-center mb-1 text-emerald-400">
                📷 ภายนอก
              </div>
              <span className="text-slate-300">ชุดที่ 1</span>
            </div>
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700">
              <div className="h-10 bg-slate-700 rounded flex items-center justify-center mb-1 text-emerald-400">
                📷 ภายใน
              </div>
              <span className="text-slate-300">ชุดที่ 2</span>
            </div>
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700">
              <div className="h-10 bg-slate-700 rounded flex items-center justify-center mb-1 text-emerald-400">
                📷 เครื่องยนต์
              </div>
              <span className="text-slate-300">ชุดที่ 3</span>
            </div>
          </div>

          {/* Action button */}
          <div className="py-2.5 bg-[#005c55] text-white font-bold text-center rounded-xl flex items-center justify-center gap-1.5 shadow-md">
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>ยืนยันและบันทึกข้อมูล (ส่งรายงานขึ้น Cloud)</span>
          </div>
        </div>
      )
    },
    {
      id: 'step3',
      title: 'ขั้นตอนที่ 3: แดชบอร์ดสรุปผล Real-time Cloud (Step 3)',
      badge: 'Step 3',
      icon: 'dashboard',
      subtitle: 'ศูนย์รวมสถิติกองรถ, ส่งออก Excel/CSV, คัดลอกสรุปส่ง LINE, และเริ่มตรวจคันใหม่',
      description:
        'หน้าแดชบอร์ดสรุปผลการตรวจสภาพรถทั้งหมดของเขตการเดินรถที่ 6 เชื่อมต่อ Cloud Firestore แสดง 4 การ์ดตัวชี้วัดสำคัญ พร้อมแท็บภาพรวมวิเคราะห์สถิติ แท็บบันทึกการตรวจทั้งหมด (ดูภาพ 3 ชุดได้) แท็บรายการด่วนส่งซ่อม พร้อมฟังก์ชันส่งออก Excel/CSV, คัดลอกสรุปส่ง LINE กปด.6 และปุ่ม "🔄 เริ่มต้นใหม่ (ตรวจคันถัดไป)"',
      screenSummary: [
        '1. ป้ายแจ้งสถานะการเชื่อมต่อ: "🔥 เชื่อมต่อ Cloud Firestore เรียบร้อย (Real-time)"',
        '2. การ์ดตัวชี้วัด 4 ใบ: ตรวจแล้ววันนี้, พร้อมบริการ 100%, พบข้อบกพร่อง, ดัชนีความพร้อมกองรถ (%)',
        '3. 3 แท็บมุมมอง: แท็บภาพรวม (Charts), แท็บบันทึกการตรวจ (Records), แท็บรายการด่วนส่งซ่อม (Urgent)',
        '4. ปุ่มเปิดดูภาพถ่ายหลักฐานทั้ง 3 ชุด พร้อมลายน้ำในตารางบันทึกการตรวจ',
        '5. ปุ่ม "📥 ส่งออกเป็น Excel / CSV"',
        '6. ปุ่ม "📋 คัดลอกสรุปส่ง LINE กปด.6" (มีข้อความสรุปพร้อมส่งในกลุ่มทันที)',
        '7. ปุ่ม "🖨️ พิมพ์รายงาน / บันทึก PDF"',
        '8. ปุ่ม "🔄 เริ่มต้นใหม่ (ตรวจคันถัดไป)" เพื่อล้างค่าและกลับไป Step 1 พร้อมตรวจรถคันต่อไป'
      ],
      keyHighlights: [
        {
          icon: 'analytics',
          title: 'วิเคราะห์ผลแบบ Real-time',
          desc: 'อัปเดตสถิติและสถานะความพร้อมของรถโดยสารในเขต 6 ทันที'
        },
        {
          icon: 'chat',
          title: 'ส่ง LINE กปด.6 ทันใจ',
          desc: 'คัดลอกข้อความสรุปผลยอดตรวจพร้อมบริการส่งเข้ากลุ่ม LINE ได้ในคลิกเดียว'
        },
        {
          icon: 'replay',
          title: 'ตรวจคันถัดไปได้ทันที',
          desc: 'กดปุ่มเริ่มต้นใหม่เพื่อรีเซ็ตฟอร์ม และตรวจรถคันถัดไปได้อย่างต่อเนื่อง'
        }
      ],
      uiMockup: (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-700 space-y-3 font-sans shadow-lg text-[13px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                dashboard
              </span>
              <span className="font-bold text-white text-[13px]">
                Step 3: แดชบอร์ดสรุปผล ขสมก. เขต 6
              </span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-900/60 text-emerald-300 text-[10px] font-bold rounded">
              🔥 Real-time Cloud
            </span>
          </div>

          {/* Metric stats 4 cols */}
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
            <div className="bg-slate-800 p-1.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[9px]">ตรวจวันนี้</span>
              <span className="font-bold text-[16px] text-white">48 คัน</span>
            </div>
            <div className="bg-emerald-950/80 p-1.5 rounded-xl border border-emerald-600/60">
              <span className="text-emerald-400 block text-[9px]">พร้อมบริการ</span>
              <span className="font-bold text-[16px] text-emerald-300">46 คัน</span>
            </div>
            <div className="bg-red-950/80 p-1.5 rounded-xl border border-red-600/60">
              <span className="text-red-400 block text-[9px]">ต้องแก้ไข</span>
              <span className="font-bold text-[16px] text-red-300">2 คัน</span>
            </div>
            <div className="bg-blue-950/80 p-1.5 rounded-xl border border-blue-600/60">
              <span className="text-blue-400 block text-[9px]">ความพร้อม</span>
              <span className="font-bold text-[16px] text-blue-300">95.8%</span>
            </div>
          </div>

          {/* Table Mock Item */}
          <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>ล่าสุด • 22/09/2026 08:30</span>
              <span className="text-emerald-400 font-bold">✓ พร้อมบริการ 100%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">สาย 4-59 • เลข 50010 (ISUZU)</span>
              <span className="text-[10px] bg-emerald-900/60 border border-emerald-500/50 px-2 py-0.5 rounded text-emerald-300 font-bold">
                ดูภาพ 3 ชุด ➔
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button className="py-2 bg-rose-700 text-white rounded-xl font-bold text-[10.5px] flex items-center justify-center gap-1 shadow-xs">
              <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
              <span>📄 รายงาน PDF</span>
            </button>
            <button className="py-2 bg-emerald-800/80 text-emerald-200 rounded-xl font-bold text-[10.5px] border border-emerald-600/50 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">chat</span>
              <span>📋 ส่ง LINE</span>
            </button>
            <button className="py-2 bg-[#005c55] text-white rounded-xl font-bold text-[10.5px] flex items-center justify-center gap-1 shadow-md">
              <span className="material-symbols-outlined text-[14px]">replay</span>
              <span>🔄 คันถัดไป</span>
            </button>
          </div>
        </div>
      )
    }
  ];

  const currentSection =
    manualSections.find((s) => s.id === activeSectionId) || manualSections[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-emerald-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005c55] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">menu_book</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-[17px] text-[#121b2e] leading-tight">
                  คู่มือการใช้งานระบบตรวจสภาพรถ (ทุกหน้าจอ & ทุกเมนู)
                </h2>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  ขสมก. เขต 6
                </span>
              </div>
              <p className="text-[12px] text-slate-500">
                รวมภาพหน้าจอจริง คำอธิบายฟังก์ชัน และขั้นตอนการทำงานอย่างละเอียด
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintManual}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="สั่งพิมพ์คู่มือหรือบันทึกเป็น PDF"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span className="hidden sm:inline">พิมพ์คู่มือ / บันทึก PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-5 pt-3 pb-2 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('poster')}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'poster'
                  ? 'bg-[#005c55] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">image</span>
              <span>โปสเตอร์คู่มือฉบับเต็ม "ตรวจ พบ พร้อม" (10 ขั้นตอน)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('screenByScreen')}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'screenByScreen'
                  ? 'bg-[#005c55] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">devices</span>
              <span>คู่มือเจาะลึกรายหน้าจอ & ภาพจำลองระบบ (Screen Guide)</span>
            </button>
          </div>

          <div className="text-[11.5px] text-slate-500 font-medium hidden sm:block">
            {viewMode === 'poster'
              ? '✨ โปสเตอร์คู่มือทางการ เขตการเดินรถที่ 6'
              : `📖 หน้าจอที่ ${manualSections.findIndex((s) => s.id === activeSectionId) + 1} จาก ${manualSections.length}`}
          </div>
        </div>

        {viewMode === 'poster' ? (
          /* Official Infographic Poster View */
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-slate-100/50">
            <OfficialPoster />
          </div>
        ) : (
          /* Screen by Screen View */
          <>
            {/* Section Navigation Tabs (Horizontal Strip) */}
            <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/80 px-4 py-2 gap-2 scrollbar-none">
              {manualSections.map((sec) => {
                const isActive = sec.id === activeSectionId;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`px-3.5 py-2 rounded-xl text-[12.5px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                      isActive
                        ? 'bg-[#005c55] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{sec.icon}</span>
                    <span>{sec.title.split(':')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Main Content (2 Columns: Left is Details & Checklist, Right is Visual UI Mockup) */}
            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              {/* Section Banner */}
              <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-[#005c55] text-white text-[11px] font-bold rounded-lg">
                      {currentSection.badge}
                    </span>
                    <h3 className="font-bold text-[18px] text-[#121b2e]">{currentSection.title}</h3>
                  </div>
                  <p className="text-[13px] text-slate-600 mt-1">{currentSection.subtitle}</p>
                </div>
                <span className="text-[12px] text-slate-400 italic">
                  หน้าจอเมนูส่วนที่ {manualSections.findIndex((s) => s.id === activeSectionId) + 1} จาก{' '}
                  {manualSections.length}
                </span>
              </div>

              {/* 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Detailed Instructions & Key Points (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Detailed Description */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-[14px] text-[#121b2e] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#005c55] text-[18px]">
                        description
                      </span>
                      <span>คำอธิบายฟังก์ชันและการทำงาน:</span>
                    </h4>
                    <p className="text-[13px] text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      {currentSection.description}
                    </p>
                  </div>

                  {/* Elements & Step Checklist */}
                  <div className="space-y-2.5">
                    <h4 className="font-bold text-[14px] text-[#121b2e] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#005c55] text-[18px]">
                        list_alt
                      </span>
                      <span>จุดสำคัญและองค์ประกอบบนหน้าจอนี้:</span>
                    </h4>
                    <div className="space-y-1.5">
                      {currentSection.screenSummary.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-white rounded-xl border border-slate-200 text-[12.5px] text-slate-800 flex items-start gap-2 shadow-2xs"
                        >
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            ✓
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3 Key Highlights Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {currentSection.keyHighlights.map((hl, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1"
                      >
                        <div className="flex items-center gap-1.5 text-emerald-800">
                          <span className="material-symbols-outlined text-[18px]">{hl.icon}</span>
                          <strong className="text-[12px]">{hl.title}</strong>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-tight">{hl.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Visual UI Screen Representation Mockup (5 cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[14px] text-[#121b2e] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#005c55] text-[18px]">
                        preview
                      </span>
                      <span>ภาพจำลองหน้าจอจริง (Screen Mockup):</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">มุมมองระบบ</span>
                  </div>

                  {/* Render Section Mockup */}
                  {currentSection.uiMockup}
                </div>
              </div>
            </div>

            {/* Modal Footer: Next / Prev Navigation */}
            <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  const curIdx = manualSections.findIndex((s) => s.id === activeSectionId);
                  if (curIdx > 0) {
                    setActiveSectionId(manualSections[curIdx - 1].id);
                  }
                }}
                disabled={activeSectionId === manualSections[0].id}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-[13px] font-bold hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>หน้าจอก่อนหน้า</span>
              </button>

              <div className="text-[12px] text-slate-500 font-medium">
                หน้า {manualSections.findIndex((s) => s.id === activeSectionId) + 1} จาก{' '}
                {manualSections.length}
              </div>

              <button
                type="button"
                onClick={() => {
                  const curIdx = manualSections.findIndex((s) => s.id === activeSectionId);
                  if (curIdx < manualSections.length - 1) {
                    setActiveSectionId(manualSections[curIdx + 1].id);
                  } else {
                    onClose();
                  }
                }}
                className="px-5 py-2 rounded-xl bg-[#005c55] hover:bg-[#0f766e] text-white text-[13px] font-bold cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>
                  {activeSectionId === manualSections[manualSections.length - 1].id
                    ? 'เข้าใจแล้ว / ปิดคู่มือ'
                    : 'หน้าจอถัดไป'}
                </span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
