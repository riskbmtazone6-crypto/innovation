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
      title: 'ขั้นตอนที่ 1: ข้อมูลผู้ตรวจและข้อมูลรถ (Step 1)',
      badge: 'Step 1',
      icon: 'badge',
      subtitle: 'การระบุตัวตนผู้ตรวจ สังกัดกลุ่มงาน และการระบุรถโดยสาร',
      description:
        'เป็นหน้าจอเริ่มต้นที่ผู้ตรวจการต้องระบุชื่อ-นามสกุล สังกัดกลุ่มงานปฏิบัติการเดินรถ (กปด.16, 26, หรือ 36) พร้อมทั้งระบุสายการเดินรถและเลขข้างรถ ซึ่งสามารถเลือกใช้วิธีสแกน QR Code ประจำรถ หรือเลือกจากฐานข้อมูล 326 คันของเขต 6 ได้อย่างสะดวกรวดเร็ว',
      screenSummary: [
        '1. ช่องกรอกชื่อ-นามสกุล ผู้ตรวจการ หรือเชื่อมต่อบัญชีอัตโนมัติ',
        '2. เมนูเลือกสังกัดกลุ่มงานปฏิบัติการเดินรถ (กปด.16 อู่บรมราชชนนี, กปด.26 อู่ศรีณรงค์, กปด.36 อู่ไร่ขิง)',
        '3. ปุ่ม "📷 เปิดกล้องสแกน QR" เพื่ออ่านค่าสายและเลขข้างรถอัตโนมัติ',
        '4. ช่องกรอกสายเดินรถ (เซล B) เช่น 4-59, 515, 4-43, 91ก',
        '5. ช่องกรอกเลขข้างรถ (เซล D) เช่น 50010, 55001, 56070',
        '6. บัญชีค้นหาด่วนจากทะเบียนรถ 326 คันของเขตการเดินรถที่ 6',
        '7. ปุ่ม "ถัดไป: เริ่มต้นตรวจสอบสภาพรถ (ไปขั้นตอนที่ 2) →"'
      ],
      keyHighlights: [
        {
          icon: 'qr_code_scanner',
          title: 'สแกน QR Code อัจฉริยะ',
          desc: 'แยกสายเดินรถ (เซล B) และเลขข้างรถ (เซล D) อัตโนมัติในเสี้ยววินาที'
        },
        {
          icon: 'directions_bus',
          title: 'ฐานข้อมูล 326 คันในตัว',
          desc: 'มีข้อมูลทะเบียนรถ ยี่ห้อ และรุ่นของเขต 6 ครบถ้วน ไม่ต้องพิมพ์เอง'
        },
        {
          icon: 'lock',
          title: 'ตรวจสอบความถูกต้อง',
          desc: 'ปุ่มไปขั้นตอนที่ 2 จะเปิดใช้งานเมื่อกรอกข้อมูลจำเป็นครบถ้วน'
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
                หน้าจอ Step 1: ข้อมูลผู้ตรวจและข้อมูลรถ
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#005c55] text-[11px] font-bold text-white">
              ขั้นตอนที่ 1 จาก 3
            </span>
          </div>

          {/* Form Content Mock */}
          <div className="space-y-2.5 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">1. ข้อมูลผู้ตรวจสอบ & สังกัด</span>
              <span className="text-[11px] text-slate-400">ผู้ตรวจการเขต 6</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="bg-slate-700/80 p-2 rounded-lg border border-slate-600">
                <span className="text-slate-400 block text-[10px]">ชื่อผู้ตรวจ:</span>
                <span className="text-white font-semibold">นายสมศักดิ์ ขสมก. (60124)</span>
              </div>
              <div className="bg-slate-700/80 p-2 rounded-lg border border-slate-600">
                <span className="text-slate-400 block text-[10px]">สังกัดกลุ่มงาน:</span>
                <span className="text-white font-semibold">กปด.36 (อู่ไร่ขิง)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
              <span className="font-bold text-emerald-400">2. ข้อมูลรถโดยสารประจำทาง</span>
              <span className="px-2 py-0.5 bg-emerald-900/60 text-emerald-300 rounded text-[10px] font-bold">
                📷 รองรับสแกน QR
              </span>
            </div>

            {/* QR Scan Action Bar Mock */}
            <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 p-2.5 rounded-lg border border-emerald-700/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[20px]">
                  qr_code_scanner
                </span>
                <span className="text-[12px] font-bold text-emerald-200">สแกน QR หน้ารถ/ข้างรถ</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[11px] font-bold">
                เปิดกล้องสแกน QR
              </span>
            </div>

            {/* Selected Bus Info Display */}
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="bg-slate-700/80 p-2 rounded-lg border border-emerald-500/40">
                <span className="text-slate-400 block text-[10px]">สายเดินรถ (เซล B):</span>
                <span className="text-emerald-300 font-bold text-[14px]">สาย 4-59</span>
              </div>
              <div className="bg-slate-700/80 p-2 rounded-lg border border-emerald-500/40">
                <span className="text-slate-400 block text-[10px]">เลขข้างรถ (เซล D):</span>
                <span className="text-emerald-300 font-bold text-[14px]">50010</span>
              </div>
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
      title: 'เมนูสแกน QR Code ประจำรถ (QR Scanner)',
      badge: 'QR Code',
      icon: 'qr_code_2',
      subtitle: 'ระบบสแกนและแยกข้อมูลสายเดินรถและเลขข้างรถอัตโนมัติ',
      description:
        'หน้าต่าง Modal สำหรับสแกน QR Code ประจำรถ ขสมก. เขต 6 ด้วยกล้องถ่ายรูป หรือเลือกไฟล์ภาพ ระบบจะถอดรหัสและแยกข้อมูล สายเดินรถ (ดึงจากเซล B) และ เลขข้างรถ (ดึงจากเซล D) พร้อมทั้งดึงข้อมูลรุ่นรถและทะเบียนรถมาใส่ในแบบฟอร์มทันที',
      screenSummary: [
        '1. หน้าต่างส่องกล้องสแกนแบบ Real-time พร้อมเส้นเล็งเป้า',
        '2. แท็บ "เปิดกล้องสแกน" ส่องกล้องไปที่ QR Code หน้ารถหรือข้างรถ',
        '3. แท็บ "เลือกรูปภาพ" สำหรับอัปโหลดภาพ QR Code จากอัลบั้ม',
        '4. แท็บ "ทะเบียนรถ 326 คัน" สำหรับค้นหาและเลือกคันรถได้โดยตรง',
        '5. แถบทดสอบจำลองสแกนด่วน (Quick Test) เช่น สาย 4-59 (50010), 515 (56070), 4-43 (55001), 91ก (50035)'
      ],
      keyHighlights: [
        {
          icon: 'auto_awesome',
          title: 'แยกข้อมูลอัตโนมัติ',
          desc: 'ดึงสายเดินรถ (Bus line) และเลขข้างรถ (Bus number) เข้าฟอร์มทันที'
        },
        {
          icon: 'flash_on',
          title: 'สแกนไวและแม่นยำ',
          desc: 'รองรับกล้องทุกรุ่นพร้อมเปิดไฟแฟลชและสลับกล้องหน้า-หลัง'
        },
        {
          icon: 'verified',
          title: 'จับคู่ทะเบียนรถ',
          desc: 'ค้นหาเลขทะเบียน ขสมก. เช่น 11-8991 และยี่ห้อ ISUZU ให้อัตโนมัติ'
        }
      ],
      uiMockup: (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-700 space-y-3 font-sans shadow-lg text-[13px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                qr_code_scanner
              </span>
              <span className="font-bold text-white text-[13px]">หน้าต่างสแกน QR Code ประจำรถ</span>
            </div>
            <span className="text-[11px] text-slate-400">ปิด (ESC)</span>
          </div>

          {/* Scanner Viewport Mock */}
          <div className="relative bg-black rounded-xl h-44 flex flex-col items-center justify-center overflow-hidden border border-slate-700">
            {/* Target Box */}
            <div className="w-32 h-32 border-2 border-emerald-400 rounded-xl relative flex items-center justify-center">
              <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400 text-[40px] animate-pulse">
                  qr_code_2
                </span>
              </div>
              {/* Scan beam line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
            </div>
            <span className="absolute bottom-2 bg-black/80 text-white text-[10px] px-3 py-1 rounded-full">
              📷 ส่องกล้องไปที่ QR Code หน้ารถหรือข้างรถ
            </span>
          </div>

          {/* Result Tag Mock */}
          <div className="bg-emerald-950/70 border border-emerald-600/50 p-2.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 block font-bold">ผลการสแกนสำเร็จ:</span>
              <span className="font-bold text-white text-[13px]">
                สาย 4-59 • เลขข้างรถ 50010 (ISUZU)
              </span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg">
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
      subtitle: 'ระบบเช็คลิสต์ 3 ชุดหลัก (ภายนอก, ภายใน, เครื่องยนต์) พร้อมถ่ายภาพยืนยัน',
      description:
        'หัวใจหลักของการตรวจสภาพรถ แบ่งออกเป็น 3 ชุดรายการตามมาตรฐานความปลอดภัย ขสมก. แต่ละชุดบังคับถ่ายภาพยืนยัน 1 ภาพ (พร้อมประทับลายน้ำ) และประเมินรายการย่อย ผ่าน/ไม่ผ่าน มีปุ่มลัด "ผ่านทั้งหมดในชุดนี้" เพื่อความรวดเร็ว',
      screenSummary: [
        '1. แถบสรุปภาพรวมและความคืบหน้า (Sticky Progress Strip)',
        '2. แถบปุ่มทางลัดกระโดด 3 ชุด (Jump Strip): ภายนอก (1), ภายใน (2), เครื่องยนต์ (3)',
        '3. ชุดที่ 1: ภายนอกตัวรถ (ถ่าย 1 ภาพยืนยัน + ตรวจสอบ 6 รายการย่อย)',
        '4. ชุดที่ 2: ภายในห้องโดยสาร (ถ่าย 1 ภาพยืนยัน + ตรวจสอบ 5 รายการย่อย)',
        '5. ชุดที่ 3: ระบบเครื่องยนต์ (ถ่าย 1 ภาพยืนยัน + ตรวจสอบ 4 รายการย่อย)',
        '6. ปุ่มทางลัด "ผ่านทั้งหมดในชุดนี้" ประจำแต่ละการ์ด',
        '7. ปุ่มตัวอย่างด่วน (Quick Demo) สำหรับทดสอบระบบแบบรวดเร็ว',
        '8. ช่องระบุอาการชำรุด/ข้อบกพร่อง เมื่อเลือกสถานะ "ไม่ผ่าน"',
        '9. ปุ่ม "สรุปผลและบันทึกข้อมูล (ไปขั้นตอนที่ 3) →"'
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
          icon: 'report_problem',
          title: 'ระบุข้อบกพร่องอัตโนมัติ',
          desc: 'หากมีข้อไม่ผ่าน ระบบจะเปิดช่องบันทึกอาการและส่งต่อไปยังใบแจ้งซ่อม'
        }
      ],
      uiMockup: (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-700 space-y-3 font-sans shadow-lg text-[13px]">
          {/* Header Mock */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-[13px]">
                Step 2: การตรวจสภาพ 3 ชุดรายการมาตรฐาน
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
              <span className="text-[10px] text-emerald-400">✓ ภาพครบ • 6/6 ข้อ</span>
            </div>
            <div className="bg-emerald-950/80 border border-emerald-600 p-1.5 rounded-lg text-center">
              <span className="font-bold text-emerald-300 block">2. ภายใน</span>
              <span className="text-[10px] text-emerald-400">✓ ภาพครบ • 5/5 ข้อ</span>
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
              <span className="text-[10px] bg-emerald-600/30 text-emerald-300 px-2 py-0.5 rounded font-bold">
                ผ่านทั้งหมดในชุดนี้
              </span>
            </div>

            {/* Photo proof bar */}
            <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-700 text-[11px]">
              <span className="text-slate-300">📷 ภาพหลักฐานประจำชุด: มีรูปแล้ว</span>
              <span className="text-emerald-400 font-bold">✓ ตรวจสอบแล้ว</span>
            </div>

            {/* Sample items */}
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between bg-slate-700/50 p-1.5 rounded">
                <span>1.1 สภาพตัวถัง สี และกระจกรอบคัน</span>
                <span className="text-emerald-400 font-bold">✓ ผ่าน</span>
              </div>
              <div className="flex items-center justify-between bg-slate-700/50 p-1.5 rounded">
                <span>1.2 ยางรถยนต์ ความดันลม และน็อตล้อ</span>
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
      title: 'เมนูถ่ายภาพ & ประทับลายน้ำ (Photo & Watermark)',
      badge: 'Photo Proof',
      icon: 'photo_camera',
      subtitle: 'ระบบถ่ายภาพสด บันทึกหลักฐาน และประทับลายน้ำข้อมูลรถ/เวลาอัตโนมัติ',
      description:
        'หน้าต่าง Modal สำหรับถ่ายภาพหลักฐานการตรวจชุดรายการ ระบบจะเปิดกล้องถ่ายภาพจริง หรือให้อัปโหลดภาพ พร้อมทั้งประทับข้อความลายน้ำ (Watermark) ระบุสังกัด ขสมก. เขต 6, สายรถ, เลขข้างรถ, ผู้ตรวจการ, วันที่และเวลาที่บันทึกจริงลงในเนื้อไฟล์ภาพ ป้องกันการปลอมแปลง',
      screenSummary: [
        '1. ปุ่ม "เปิดกล้องถ่ายภาพสด" หรือ "อัปโหลดภาพจากเครื่อง"',
        '2. กรอบพรีวิวรูปภาพพร้อมการปรับหมุน (Rotate 90°)',
        '3. แถบประทับลายน้ำดิจิทัล (Digital Watermark Badge):',
        '   - สังกัด: องค์การขนส่งมวลชนกรุงเทพ (ขสมก. เขตการเดินรถที่ 6)',
        '   - สายเดินรถ & เลขข้างรถ เช่น สาย 4-59 (เลขข้างรถ: 50010)',
        '   - ชื่อผู้ตรวจการ & วันที่-เวลาบันทึก (Timestamp)',
        '4. ปุ่ม "ยืนยันและใช้ภาพนี้ประจำชุด"'
      ],
      keyHighlights: [
        {
          icon: 'branding_watermark',
          title: 'ประทับลายน้ำอัตโนมัติ',
          desc: 'บันทึกเวลา สายรถ และเลขข้างรถลงในภาพถ่ายทันที ไม่สามารถแก้ไขได้'
        },
        {
          icon: 'security',
          title: 'ความโปร่งใสของข้อมูล',
          desc: 'ใช้เป็นหลักฐานยืนยันว่าได้ตรวจสภาพรถจริงก่อนปล่อยรถออกให้บริการ'
        },
        {
          icon: 'tune',
          title: 'ปรับหมุนและพรีวิว',
          desc: 'หมุนภาพ 90 องศาได้หากถ่ายในแนวนอนหรือแนวตั้งผิดทิศทาง'
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
              <span className="material-symbols-outlined text-slate-600 text-[48px]">
                directions_bus
              </span>
              <p className="text-[11px] text-slate-500 font-semibold">[ภาพตัวอย่างภายนอกตัวรถ]</p>
            </div>

            {/* Watermark Overlay at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/85 backdrop-blur-xs p-2 text-[10px] text-left border-t border-emerald-500/40">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>🚌 ขสมก. เขตการเดินรถที่ 6 (กปด.36)</span>
                <span>สาย 4-59 (50010)</span>
              </div>
              <div className="text-slate-300 flex items-center justify-between mt-0.5">
                <span>ผู้ตรวจ: นายสมศักดิ์ ขสมก.</span>
                <span>28/08/2026 08:30 น.</span>
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
      title: 'หน้าต่างสรุปผลการตรวจสอบ (Inspection Summary)',
      badge: 'Summary',
      icon: 'fact_check',
      subtitle: 'การตรวจทานผลการตรวจ 3 ชุด ภาพถ่ายหลักฐาน และการบันทึกลงระบบ',
      description:
        'หน้าต่างสำหรับสรุปและตรวจทานข้อมูลทั้งหมดก่อนบันทึกลงระบบ Cloud Firestore แสดงสถานะการผ่านเกณฑ์ พรีวิวภาพถ่ายทั้ง 3 ชุด รายการข้อบกพร่องที่พบ (ถ้ามี) และช่องสำหรับให้หัวหน้างานบันทึกคำสั่งการเพิ่มเติม',
      screenSummary: [
        '1. ป้ายแจ้งสถานะภาพรวม (ผ่านเกณฑ์มาตรฐานครบ 3 ชุด / พบข้อบกพร่องต้องส่งซ่อม)',
        '2. ข้อมูลสรุปสายเดินรถ เลขข้างรถ ผู้ตรวจ และสังกัด',
        '3. พรีวิวภาพถ่ายหลักฐานยืนยันทั้ง 3 ชุด (ภายนอก, ภายใน, เครื่องยนต์)',
        '4. กล่องสรุปคะแนน: ผ่านกี่รายการ, ไม่ผ่านกี่รายการ',
        '5. กล่องแจกแจงรายการข้อบกพร่องที่พบพร้อมหมายเหตุอาการชำรุด',
        '6. ช่องบันทึกคำสั่งการของหัวหน้างาน / ผู้ตรวจการ (Supervisor Note)',
        '7. ปุ่ม "ยืนยันและบันทึกข้อมูล" (บันทึกขึ้น Cloud ทันที พร้อมเอฟเฟกต์ Confetti ฉลองเมื่อผ่านครบ)'
      ],
      keyHighlights: [
        {
          icon: 'cloud_done',
          title: 'บันทึก Real-time ทันที',
          desc: 'ข้อมูลถูกส่งเข้าสู่ฐานข้อมูลกลางของเขต 6 ทันทีที่กดยืนยัน'
        },
        {
          icon: 'celebration',
          title: 'ตรวจผ่านพร้อมบริการ',
          desc: 'หากผ่านครบทุกข้อ รถจะได้รับสถานะ "พร้อมบริการ" ทันที'
        },
        {
          icon: 'build',
          title: 'เชื่อมโยงใบแจ้งซ่อม',
          desc: 'หากมีรายการไม่ผ่าน จะจัดทำรายการข้อบกพร่องเตรียมส่งให้นายช่าง'
        }
      ],
      uiMockup: (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-700 space-y-3 font-sans shadow-lg text-[13px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-bold text-white text-[13px]">
              สรุปผลการตรวจสอบสภาพรถ 3 ชุดรายการ
            </span>
            <span className="text-[11px] text-slate-400">ตรวจทาน</span>
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
                <span className="text-[10px] text-emerald-400/80">รถพร้อมออกให้บริการ</span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded-full text-[10px]">
              พร้อมบริการ
            </span>
          </div>

          {/* 3 Photos Mini Preview */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700">
              <div className="h-10 bg-slate-700 rounded flex items-center justify-center mb-1">
                📷 1
              </div>
              <span className="text-slate-300">ภายนอก</span>
            </div>
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700">
              <div className="h-10 bg-slate-700 rounded flex items-center justify-center mb-1">
                📷 2
              </div>
              <span className="text-slate-300">ภายใน</span>
            </div>
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700">
              <div className="h-10 bg-slate-700 rounded flex items-center justify-center mb-1">
                📷 3
              </div>
              <span className="text-slate-300">เครื่องยนต์</span>
            </div>
          </div>

          {/* Action button */}
          <div className="py-2.5 bg-[#005c55] text-white font-bold text-center rounded-xl flex items-center justify-center gap-1.5 shadow-md">
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>ยืนยันและบันทึกข้อมูล (ส่งรายงาน)</span>
          </div>
        </div>
      )
    },
    {
      id: 'step3',
      title: 'ขั้นตอนที่ 3: แดชบอร์ด & รายการบันทึก (Step 3)',
      badge: 'Step 3',
      icon: 'dashboard',
      subtitle: 'ศูนย์รวมข้อมูลสถิติ สรุปผล Real-time การดูภาพถ่ายย้อนหลัง และการพิมพ์รายงาน',
      description:
        'หน้าแดชบอร์ดสรุปผลการตรวจสภาพรถทั้งหมดของเขตการเดินรถที่ 6 แสดงการ์ดสถิติประจำวัน กราฟสรุปผลแยกตามสายรถ ตารางรายการตรวจย้อนหลัง พร้อมฟังก์ชันเปิดดูภาพถ่ายหลักฐาน 3 ชุด การพิมพ์รายงาน (Print) และการส่งออกข้อมูล Excel / CSV',
      screenSummary: [
        '1. การ์ดสถิติภาพรวม: รถที่ตรวจแล้ววันนี้, ผ่านเกณฑ์พร้อมวิ่ง, ชำรุด/ต้องแก้ไข',
        '2. กราฟสรุปผลการตรวจแยกตามสายการเดินรถ (Bar Chart / Distribution)',
        '3. ตัวกรองข้อมูลตามสายเดินรถ (4-59, 515, 4-43, 91ก...) และสถานะ',
        '4. ตารางบันทึกการตรวจ Real-time พร้อมแสดงเลขข้างรถ ผู้ตรวจ เวลา และสถานะ',
        '5. หน้าต่างแสดงรายละเอียด (Inspection Detail Modal) พร้อมภาพถ่ายหลักฐานทั้ง 3 ชุด',
        '6. ปุ่มสั่งพิมพ์รายงานผลการตรวจ (Print Report)',
        '7. ปุ่มส่งออกข้อมูล (Export to Excel / CSV)',
        '8. ปุ่ม "เริ่มต้นตรวจคันใหม่ (เริ่มขั้นตอนที่ 1)"'
      ],
      keyHighlights: [
        {
          icon: 'analytics',
          title: 'วิเคราะห์ผลแบบ Real-time',
          desc: 'อัปเดตสถิติและสถานะความพร้อมของรถโดยสารในเขต 6 ทันที'
        },
        {
          icon: 'print',
          title: 'พิมพ์ใบรายงานตรวจสภาพ',
          desc: 'จัดหน้าแบบมาตรฐานสำหรับพิมพ์เอกสารลงกระดาษ A4 สวยงาม'
        },
        {
          icon: 'restart_alt',
          title: 'ตรวจคันถัดไปได้ทันที',
          desc: 'คลิกปุ่มเริ่มต้นตรวจคันใหม่ เพื่อกลับไป Step 1 สำหรับรถคันต่อไป'
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
                Step 3: แดชบอร์ดสรุปผลการตรวจสภาพรถ
              </span>
            </div>
            <span className="px-2 py-0.5 bg-[#005c55] text-[10px] font-bold rounded">
              ขสมก. เขต 6
            </span>
          </div>

          {/* Metric stats 3 cols */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="bg-slate-800 p-2 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[10px]">ตรวจแล้ววันนี้</span>
              <span className="font-bold text-[18px] text-white">48</span>
            </div>
            <div className="bg-emerald-950/80 p-2 rounded-xl border border-emerald-600/60">
              <span className="text-emerald-400 block text-[10px]">พร้อมบริการ</span>
              <span className="font-bold text-[18px] text-emerald-300">46</span>
            </div>
            <div className="bg-red-950/80 p-2 rounded-xl border border-red-600/60">
              <span className="text-red-400 block text-[10px]">ต้องแก้ไข</span>
              <span className="font-bold text-[18px] text-red-300">2</span>
            </div>
          </div>

          {/* Table Mock Item */}
          <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>ล่าสุด • 28/08/2026 08:30</span>
              <span className="text-emerald-400 font-bold">✓ ผ่านเกณฑ์</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">สาย 4-59 • เลข 50010 (ISUZU)</span>
              <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                ดูภาพ 3 ชุด ➔
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-1">
            <button className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-[11px] border border-slate-700 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">print</span>
              <span>พิมพ์รายงาน</span>
            </button>
            <button className="flex-2 py-2 bg-[#005c55] text-white rounded-xl font-bold text-[12px] flex items-center justify-center gap-1 shadow-md">
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>เริ่มต้นตรวจคันใหม่ (Step 1)</span>
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
