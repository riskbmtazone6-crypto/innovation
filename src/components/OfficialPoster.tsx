import React, { useState, useRef, useEffect } from 'react';

interface OfficialPosterProps {
  onPrint?: () => void;
}

export const OfficialPoster: React.FC<OfficialPosterProps> = () => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [uploadedPosterImage, setUploadedPosterImage] = useState<string | null>(() => {
    return localStorage.getItem('bmta_official_poster_image') || null;
  });
  const [isHoveringImage, setIsHoveringImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setUploadedPosterImage(result);
          localStorage.setItem('bmta_official_poster_image', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveUploadedImage = () => {
    setUploadedPosterImage(null);
    localStorage.removeItem('bmta_official_poster_image');
  };

  return (
    <div className="space-y-4">
      {/* Zoom and Action Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900 text-white p-3 rounded-2xl shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[12.5px] font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            <span>ระดับการแสดงผล:</span>
          </span>
          <div className="inline-flex rounded-xl border border-slate-700 bg-slate-800 p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(60, zoomLevel - 15))}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700 rounded-lg cursor-pointer"
              title="ย่อขนาด"
            >
              -
            </button>
            <span className="px-2.5 py-1 text-[11.5px] font-bold text-amber-300 min-w-[52px] text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.min(160, zoomLevel + 15))}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700 rounded-lg cursor-pointer"
              title="ขยายขนาด"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg cursor-pointer border-l border-slate-700 ml-1"
            >
              100%
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {uploadedPosterImage ? (
            <button
              type="button"
              onClick={handleRemoveUploadedImage}
              className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/60 rounded-xl text-[12px] font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="สลับกลับไปใช้โปสเตอร์ระบบ"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>ใช้โปสเตอร์ระบบ</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-[12px] font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="อัปโหลดภาพโปสเตอร์ฉบับกำหนดเอง"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">upload</span>
              <span>อัปโหลดภาพโปสเตอร์</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-[#005c55] hover:bg-[#0f766e] text-white rounded-xl text-[12px] font-bold shadow-xs flex items-center gap-1.5 cursor-pointer border border-emerald-400/40"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>พิมพ์โปสเตอร์ / บันทึก PDF</span>
          </button>
        </div>
      </div>

      {/* Poster Canvas Container */}
      <div className="overflow-x-auto pb-6 flex justify-center bg-slate-200/90 p-2 sm:p-5 rounded-2xl border border-slate-300">
        {uploadedPosterImage ? (
          /* Render User Uploaded Poster Image */
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200 ease-out max-w-[850px] w-full bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-300 relative group print:border-none print:shadow-none print:m-0 print:p-0"
          >
            <img
              src={uploadedPosterImage}
              alt="โปสเตอร์คู่มือการใช้งานระบบตรวจสภาพรถ เขตการเดินรถที่ 6 (ขสมก.)"
              className="w-full h-auto object-contain block"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white px-3 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-2">
              <span>ภาพโปสเตอร์กำหนดเอง</span>
              <button
                type="button"
                onClick={handleRemoveUploadedImage}
                className="text-red-400 hover:text-red-300 underline cursor-pointer"
              >
                ลบ
              </button>
            </div>
          </div>
        ) : (
          /* Render Masterwork Exact Layout of the 10-Step Poster */
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200 ease-out w-full max-w-[860px] bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-300 print:border-none print:shadow-none print:m-0 print:p-0 font-sans"
          >
            {/* Top Decorative Border */}
            <div className="h-2.5 bg-gradient-to-r from-blue-700 via-emerald-600 to-amber-500"></div>

            {/* Poster Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-b from-blue-50/80 via-white to-white border-b border-slate-200 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                {/* Logo & Org Title */}
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#003d73] to-[#005c55] text-amber-300 flex flex-col items-center justify-center p-1.5 shadow-md shrink-0 border-2 border-amber-300/60">
                    <span className="material-symbols-outlined text-[32px] sm:text-[36px] text-amber-300">
                      directions_bus
                    </span>
                    <span className="text-[8.5px] font-extrabold tracking-tight text-white uppercase mt-[-4px]">
                      BMTA
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] sm:text-[14px] font-extrabold text-[#003d73]">
                        องค์การขนส่งมวลชนกรุงเทพ
                      </span>
                    </div>
                    <span className="text-[9.5px] sm:text-[10.5px] text-slate-500 font-bold tracking-wide block uppercase">
                      Bangkok Mass Transit Authority
                    </span>
                    <div className="mt-1 inline-block bg-[#005c55] text-white px-3 py-0.5 rounded-full text-[11.5px] sm:text-[12.5px] font-extrabold shadow-xs">
                      เขตการเดินรถที่ 6
                    </div>
                  </div>
                </div>

                {/* Main Poster Title Badge */}
                <div className="text-center sm:text-right">
                  <h1 className="text-[22px] sm:text-[27px] font-black text-[#002f6c] tracking-tight leading-tight">
                    คู่มือการใช้งาน
                  </h1>
                  <p className="text-[12.5px] sm:text-[14px] font-extrabold text-[#005c55] leading-snug">
                    ระบบตรวจสอบความพร้อมรถโดยสารก่อนออกให้บริการ
                  </p>
                </div>
              </div>

              {/* Slogan Banner */}
              <div className="mt-4 bg-gradient-to-r from-[#003d73] via-[#005c55] to-[#0f766e] text-white p-3.5 rounded-2xl shadow-md text-center flex flex-col sm:flex-row items-center justify-between px-5 gap-2 border-2 border-emerald-400/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-400 text-[#003d73] flex items-center justify-center font-black text-[16px] shadow-sm">
                    ✓
                  </div>
                  <div className="text-left">
                    <span className="text-[14.5px] sm:text-[16.5px] font-black tracking-wide block text-white drop-shadow-xs">
                      “ตรวจก่อน พบก่อน พร้อมให้บริการ”
                    </span>
                    <span className="text-[11.5px] sm:text-[12.5px] text-emerald-200 font-extrabold block">
                      (ตรวจ พบ พร้อม)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-[12px] font-extrabold text-white">
                  <span className="bg-black/25 px-2.5 py-0.5 rounded-full border border-white/20">
                    ✓ ตรวจจริง
                  </span>
                  <span className="bg-black/25 px-2.5 py-0.5 rounded-full border border-white/20">
                    ✓ ถ่ายจริง
                  </span>
                  <span className="bg-black/25 px-2.5 py-0.5 rounded-full border border-white/20">
                    ✓ บันทึกจริง
                  </span>
                  <span className="bg-emerald-400/40 text-amber-200 px-3 py-0.5 rounded-full border border-emerald-300/60 shadow-xs">
                    ✓ ปลอดภัยทุกเที่ยวเดินรถ
                  </span>
                </div>
              </div>
            </div>

            {/* 10-Step Visual Infographic Grid */}
            <div className="p-4 sm:p-5 space-y-3.5 bg-slate-50/70">
              {/* Top Row: Steps 1, 2, 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Step 1 */}
                <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#005c55] transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005c55] text-white font-black text-[12px] flex items-center justify-center shadow-xs shrink-0">
                        1
                      </span>
                      <h3 className="font-extrabold text-[13px] text-[#002f6c]">เข้าสู่ระบบ</h3>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      กรอกเลขประจำตัวพนักงาน ระบบจะแสดงชื่อ-นามสกุล โดยอัตโนมัติ
                    </p>

                    {/* Phone Mockup 1 */}
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-[10px] space-y-1.5 shadow-inner mt-2 border border-slate-700">
                      <div className="text-center font-bold text-slate-300 pb-1 border-b border-slate-700 text-[10px] flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-emerald-400">lock</span>
                        <span>เข้าสู่ระบบ</span>
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-600">
                        <span className="text-slate-400 block text-[8.5px]">เลขประจำตัวพนักงาน:</span>
                        <span className="font-bold text-emerald-400 text-[11px]">123456</span>
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-600">
                        <span className="text-slate-400 block text-[8.5px]">ชื่อ-นามสกุล:</span>
                        <span className="font-bold text-white text-[10.5px]">สมชาย ใจดี</span>
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-600">
                        <span className="text-slate-400 block text-[8.5px]">หน่วยงาน/ศูนย์เดินรถ:</span>
                        <span className="font-bold text-amber-300 text-[10px]">กปด. 16</span>
                      </div>
                      <div className="bg-[#005c55] text-white text-center py-1.5 rounded-lg font-bold text-[9.5px] shadow-xs">
                        เข้าสู่ระบบ
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 bg-blue-50 border border-blue-200 rounded-lg p-1.5 text-[9.5px] text-blue-900 flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[14px] text-blue-700">info</span>
                    <span>หากข้อมูลไม่ครบถ้วน ระบบจะแจ้งเตือน</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#005c55] transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005c55] text-white font-black text-[12px] flex items-center justify-center shadow-xs shrink-0">
                        2
                      </span>
                      <h3 className="font-extrabold text-[13px] text-[#002f6c]">
                        ข้อมูลรถโดยสาร (สแกน QR Code)
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      กดปุ่มสแกน QR Code ที่ตัวรถ เพื่อดึงข้อมูลรถโดยสาร
                    </p>

                    {/* Phone Mockup 2 */}
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-[10px] space-y-1.5 shadow-inner mt-2 border border-slate-700">
                      <div className="text-center font-bold text-slate-300 pb-1 border-b border-slate-700 text-[10px] flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-emerald-400">qr_code_scanner</span>
                        <span>สแกน QR Code</span>
                      </div>
                      <div className="h-16 bg-black rounded-lg border border-emerald-500/60 flex items-center justify-center relative overflow-hidden">
                        <span className="material-symbols-outlined text-emerald-400 text-[28px] animate-pulse">
                          qr_code_2
                        </span>
                        <span className="absolute bottom-0.5 text-[8px] text-white bg-black/80 px-1.5 py-0.2 rounded font-medium">
                          สแกนที่ป้าย QR Code บริเวณตัวรถ
                        </span>
                      </div>
                      <div className="bg-emerald-950/90 p-1.5 rounded-lg border border-emerald-600 text-[9px] space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-slate-300">สายเดินรถ:</span>
                          <span className="font-bold text-emerald-400">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">เลขเข้ารถ:</span>
                          <span className="font-bold text-emerald-400">6-55120</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">ยี่ห้อรถ:</span>
                          <span className="font-bold text-white">MITSUBISHI</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">หมายเลขติดตัวรถ:</span>
                          <span className="font-bold text-amber-300">12-3456</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-0.5">
                        <div className="bg-emerald-700 text-white text-center py-1 rounded-md font-bold text-[8.5px]">
                          ยืนยันข้อมูล
                        </div>
                        <div className="bg-slate-700 text-slate-200 text-center py-1 rounded-md font-bold text-[8.5px]">
                          แก้ไขข้อมูล
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 text-[9.5px] text-emerald-900 flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[14px] text-emerald-700">
                      check_circle
                    </span>
                    <span>ตรวจสอบข้อมูลถูกต้อง กดเลือก ยืนยันข้อมูล</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#005c55] transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005c55] text-white font-black text-[12px] flex items-center justify-center shadow-xs shrink-0">
                        3
                      </span>
                      <h3 className="font-extrabold text-[13px] text-[#002f6c]">ระบุรายละเอียดเพิ่มเติม</h3>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      ยืนยันข้อมูล / กรอกเพิ่มเติม แล้วกด “ต่อไป”
                    </p>

                    {/* Phone Mockup 3 */}
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-[10px] space-y-1.5 shadow-inner mt-2 border border-slate-700">
                      <div className="text-center font-bold text-slate-300 pb-1 border-b border-slate-700 text-[10px] flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-amber-400">edit_note</span>
                        <span>รายละเอียดการตรวจ</span>
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-600">
                        <span className="text-slate-400 block text-[8.5px]">กลุ่มงานปฏิบัติการเดินรถ:</span>
                        <span className="font-bold text-amber-300 text-[10px]">กปด.16</span>
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-600">
                        <span className="text-slate-400 block text-[8.5px]">วันที่ / เวลา:</span>
                        <span className="font-bold text-emerald-400 text-[10px]">26/08/2569 07:45</span>
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-600">
                        <span className="text-slate-400 block text-[8.5px]">ผู้ตรวจสอบ:</span>
                        <span className="font-bold text-white text-[10px]">สมชาย ใจดี</span>
                      </div>
                      <div className="bg-[#005c55] text-white text-center py-1.5 rounded-lg font-bold text-[9.5px] shadow-xs">
                        ต่อไป
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 bg-slate-100 border border-slate-300 rounded-lg p-1.5 text-[9.5px] text-slate-700 flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[14px] text-slate-600">
                      arrow_forward
                    </span>
                    <span>บันทึกสังกัดและเวลาเริ่มต้นตรวจ</span>
                  </div>
                </div>
              </div>

              {/* Middle Row: Steps 4, 5, 6, 7 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Step 4 */}
                <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#005c55] transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005c55] text-white font-black text-[12px] flex items-center justify-center shadow-xs shrink-0">
                        4
                      </span>
                      <h3 className="font-extrabold text-[12.5px] text-[#002f6c]">รายการตรวจสอบ</h3>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-tight">
                      เลือกหมวดการตรวจสอบ เพื่อทำการตรวจสอบในแต่ละหมวด
                    </p>

                    {/* Phone Mockup 4 */}
                    <div className="bg-slate-900 text-white p-2 rounded-xl text-[9.5px] space-y-1.5 shadow-inner mt-1 border border-slate-700">
                      <div className="bg-slate-800 p-1.5 rounded-lg border border-blue-500/50 flex items-center justify-between">
                        <span className="font-bold text-blue-300">หมวดที่ 1 ความปลอดภัย</span>
                        <span className="text-[8.5px] text-slate-400 font-bold">(10 / 15)</span>
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded-lg border border-emerald-500/50 flex items-center justify-between">
                        <span className="font-bold text-emerald-300">หมวดที่ 2 สมรรถนะเครื่อง</span>
                        <span className="text-[8.5px] text-slate-400 font-bold">(0 / 4)</span>
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded-lg border border-amber-500/50 flex items-center justify-between">
                        <span className="font-bold text-amber-300">หมวดที่ 3 ระบบอำนวยความสะดวก</span>
                        <span className="text-[8.5px] text-slate-400 font-bold">(0 / 5)</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[9.5px] text-slate-500 font-bold mt-2 block">
                    รายการทั้งหมด 15 รายการ
                  </span>
                </div>

                {/* Step 5 */}
                <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#005c55] transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005c55] text-white font-black text-[12px] flex items-center justify-center shadow-xs shrink-0">
                        5
                      </span>
                      <h3 className="font-extrabold text-[12.5px] text-[#002f6c]">ตรวจสอบรายรายการ</h3>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-tight">
                      เลือกรายการ ตรวจสอบสภาพ ถ่ายภาพ และเลือกผลการตรวจ
                    </p>

                    {/* Phone Mockup 5 */}
                    <div className="bg-slate-900 text-white p-2 rounded-xl text-[9px] space-y-1.5 shadow-inner mt-1 border border-slate-700">
                      <div className="text-[9px] font-bold text-emerald-400 flex justify-between">
                        <span>1. ไฟหน้า / ไฟเลี้ยว / ไฟท้าย</span>
                        <span className="text-slate-400">1 / 15</span>
                      </div>
                      <div className="h-10 bg-slate-800 rounded-lg flex items-center justify-center text-[8.5px] text-slate-300 border border-slate-600 gap-1">
                        <span className="material-symbols-outlined text-[13px] text-amber-400">photo_camera</span>
                        <span>ถ่ายภาพประกอบ (ไม่เกินสภาพจริง)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 pt-0.5">
                        <div className="bg-emerald-600 text-white text-center py-0.5 rounded font-bold text-[8px]">
                          ผ่าน
                        </div>
                        <div className="bg-red-600 text-white text-center py-0.5 rounded font-bold text-[8px]">
                          ไม่ผ่าน
                        </div>
                        <div className="bg-amber-600 text-white text-center py-0.5 rounded font-bold text-[8px]">
                          งดตรวจสอบ
                        </div>
                      </div>
                      <div className="bg-[#005c55] text-white text-center py-1 rounded font-bold text-[8.5px]">
                        บันทึก
                      </div>
                    </div>
                  </div>
                  <span className="text-[9.5px] text-slate-500 font-bold mt-2 block">
                    ถ่าย 1 ภาพยืนยันประจำชุด
                  </span>
                </div>

                {/* Step 6 */}
                <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#005c55] transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005c55] text-white font-black text-[12px] flex items-center justify-center shadow-xs shrink-0">
                        6
                      </span>
                      <h3 className="font-extrabold text-[12.5px] text-[#002f6c]">หมวดที่ 1–3 ครบถ้วน</h3>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-tight">
                      ตรวจสอบทุกรายการครบตามทุกหมวด
                    </p>

                    {/* Phone Mockup 6 */}
                    <div className="bg-slate-900 text-white p-2 rounded-xl text-[9.5px] space-y-1.5 shadow-inner mt-1 border border-slate-700">
                      <div className="flex items-center justify-between bg-emerald-950/90 p-1.5 rounded-lg border border-emerald-600/70">
                        <span className="font-bold text-emerald-300">หมวดที่ 1 ความปลอดภัย</span>
                        <span className="text-emerald-400 font-bold">✓ ครบถ้วน</span>
                      </div>
                      <div className="flex items-center justify-between bg-emerald-950/90 p-1.5 rounded-lg border border-emerald-600/70">
                        <span className="font-bold text-emerald-300">หมวดที่ 2 สมรรถนะเครื่อง</span>
                        <span className="text-emerald-400 font-bold">✓ ครบถ้วน</span>
                      </div>
                      <div className="flex items-center justify-between bg-emerald-950/90 p-1.5 rounded-lg border border-emerald-600/70">
                        <span className="font-bold text-emerald-300">หมวดที่ 3 อำนวยความสะดวก</span>
                        <span className="text-emerald-400 font-bold">✓ ครบถ้วน</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[9.5px] text-emerald-700 font-bold mt-2 block">
                    ✓ ตรวจครบ 15 / 15 รายการ
                  </span>
                </div>

                {/* Step 7 */}
                <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#005c55] transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005c55] text-white font-black text-[12px] flex items-center justify-center shadow-xs shrink-0">
                        7
                      </span>
                      <h3 className="font-extrabold text-[12.5px] text-[#002f6c]">สรุปผลการตรวจสอบ</h3>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-tight">
                      ระบบสรุปผลการตรวจแยกตามหมวด
                    </p>

                    {/* Phone Mockup 7 */}
                    <div className="bg-slate-900 text-white p-2 rounded-xl text-[9px] space-y-1.5 shadow-inner mt-1 border border-slate-700">
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div className="bg-slate-800 p-1 rounded-md">
                          <span className="block text-[7.5px] text-slate-400">รวม</span>
                          <span className="font-bold text-white text-[10px]">12</span>
                        </div>
                        <div className="bg-red-950/90 p-1 rounded-md border border-red-600">
                          <span className="block text-[7.5px] text-red-400">ไม่ผ่าน</span>
                          <span className="font-bold text-red-300 text-[10px]">2</span>
                        </div>
                        <div className="bg-amber-950/90 p-1 rounded-md border border-amber-600">
                          <span className="block text-[7.5px] text-amber-400">งดตรวจ</span>
                          <span className="font-bold text-amber-300 text-[10px]">1</span>
                        </div>
                      </div>
                      <div className="text-[8px] text-red-300 bg-red-950/40 p-1 rounded border border-red-900/60 leading-tight">
                        - 2 - จุดลงนิรภัยไม่ทำงาน<br />
                        - 9 - ค้อนทุบกระจกนิรภัยชำรุด/สูญหาย
                      </div>
                      <div className="bg-[#005c55] text-white text-center py-1 rounded font-bold text-[8.5px]">
                        ยืนยันและส่งผลการตรวจ
                      </div>
                    </div>
                  </div>
                  <span className="text-[9.5px] text-slate-500 font-bold mt-2 block">
                    ตรวจทานก่อนส่ง Cloud
                  </span>
                </div>
              </div>

              {/* Bottom Row: Steps 8, 9, 10 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Step 8 */}
                <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#005c55] transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005c55] text-white font-black text-[12px] flex items-center justify-center shadow-xs shrink-0">
                        8
                      </span>
                      <h3 className="font-extrabold text-[13px] text-[#002f6c]">
                        ยืนยันและส่งผลการตรวจ
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      ยืนยันผลการตรวจ ระบบจะบันทึกและส่งให้หัวหน้างาน
                    </p>

                    {/* Phone Mockup 8 */}
                    <div className="bg-slate-900 text-white p-3 rounded-xl text-center space-y-2 shadow-inner mt-2 border border-slate-700">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined text-[24px]">check</span>
                      </div>
                      <span className="font-black text-white text-[12px] block">บันทึกผลสำเร็จ</span>
                      <p className="text-[9.5px] text-emerald-300">
                        ส่งผลการตรวจเรียบร้อยแล้ว
                      </p>
                      <div className="bg-slate-800 text-slate-300 text-[9px] py-1 rounded-lg">
                        กลับหน้าหลัก
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 9 */}
                <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#005c55] transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005c55] text-white font-black text-[12px] flex items-center justify-center shadow-xs shrink-0">
                        9
                      </span>
                      <h3 className="font-extrabold text-[13px] text-[#002f6c]">
                        บันทึกข้อมูลเสร็จสิ้น
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      ข้อมูลถูกบันทึกเรียบร้อย สามารถตรวจสอบย้อนหลังได้
                    </p>

                    {/* Phone Mockup 9 */}
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-[9.5px] space-y-1 shadow-inner mt-2 border border-slate-700">
                      <div className="text-center font-bold text-slate-300 pb-1 border-b border-slate-700 text-[9.5px]">
                        📜 ประวัติการตรวจสอบ
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded-lg flex justify-between items-center border border-slate-700">
                        <div>
                          <span className="font-bold text-white block">26/08/2569 07:45</span>
                          <span className="text-[8px] text-slate-400">6-55120</span>
                        </div>
                        <span className="text-emerald-400 font-bold text-[9px]">หน.ซีดี หมวด 2</span>
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded-lg flex justify-between items-center border border-slate-700">
                        <div>
                          <span className="font-bold text-white block">26/08/2569 07:30</span>
                          <span className="text-[8px] text-slate-400">6-55120</span>
                        </div>
                        <span className="text-emerald-400 font-bold text-[9px]">คน.ตัว หมวด 1</span>
                      </div>
                      <div className="bg-slate-800 p-1.5 rounded-lg flex justify-between items-center border border-slate-700">
                        <div>
                          <span className="font-bold text-white block">26/08/2569 07:20</span>
                          <span className="text-[8px] text-slate-400">6-55120</span>
                        </div>
                        <span className="text-emerald-400 font-bold text-[9px]">หน.ซีดี หมวด 3</span>
                      </div>
                      <div className="bg-[#005c55] text-white text-center py-1 rounded font-bold text-[8.5px]">
                        ดูประวัติทั้งหมด
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 10 */}
                <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#005c55] transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005c55] text-white font-black text-[12px] flex items-center justify-center shadow-xs shrink-0">
                        10
                      </span>
                      <h3 className="font-extrabold text-[13px] text-[#002f6c]">
                        Dashboard หัวหน้างาน / ผู้บริหาร
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      ติดตามคุณภาพการตรวจรถยนต์ในพื้นที่ วิเคราะห์แนวโน้มการตรวจงานแบบต่างๆ
                    </p>

                    {/* Desktop / Tablet Dashboard Mockup 10 */}
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-[9.5px] space-y-1.5 shadow-inner mt-2 border border-slate-700">
                      <div className="text-center font-bold text-emerald-400 pb-1 border-b border-slate-700 text-[10px]">
                        📊 Dashboard - เขตการเดินรถที่ 6
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div className="bg-slate-800 p-1 rounded-md">
                          <span className="block text-[7.5px] text-slate-400">คันตรวจแล้ว</span>
                          <span className="font-black text-white text-[11px]">68 คัน</span>
                        </div>
                        <div className="bg-emerald-950/90 p-1 rounded-md border border-emerald-600">
                          <span className="block text-[7.5px] text-emerald-400">ผ่าน</span>
                          <span className="font-black text-emerald-300 text-[11px]">57 คัน</span>
                        </div>
                        <div className="bg-red-950/90 p-1 rounded-md border border-red-600">
                          <span className="block text-[7.5px] text-red-400">ไม่ผ่าน</span>
                          <span className="font-black text-red-300 text-[11px]">9 คัน</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-slate-800/90 p-1.5 rounded-lg text-[8.5px]">
                        <span>อัตราการผ่าน:</span>
                        <span className="font-black text-emerald-400 text-[10px]">83.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Summary 3-Column Info Footer */}
            <div className="p-4 sm:p-5 bg-gradient-to-t from-slate-100 to-white border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
                {/* Box 1: Usage Advice */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                  <h4 className="font-extrabold text-[#002f6c] flex items-center gap-1.5 text-[12px]">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">
                      help_center
                    </span>
                    <span>คำแนะนำการใช้งาน</span>
                  </h4>
                  <ul className="space-y-1 text-slate-700 leading-tight font-medium">
                    <li className="flex items-start gap-1">
                      <span className="text-[#005c55] font-bold">1.</span>
                      <span>ตรวจสอบความถูกต้องและครบถ้วนทุกรายการก่อนออกให้บริการ</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#005c55] font-bold">2.</span>
                      <span>ถ่ายภาพประกอบให้ชัดเจน (ถ้ามี)</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#005c55] font-bold">3.</span>
                      <span>หากพบ "ไม่ผ่าน" ให้แก้ไขก่อนนำรถออกวิ่ง</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#005c55] font-bold">4.</span>
                      <span>หากพบ "งดตรวจสอบ" ให้ระบุเหตุผลและบันทึกหมายเหตุ</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#005c55] font-bold">5.</span>
                      <span>บันทึกและส่งผลทุกครั้งหลังตรวจเสร็จสิ้น</span>
                    </li>
                  </ul>
                </div>

                {/* Box 2: System Benefits */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                  <h4 className="font-extrabold text-[#005c55] flex items-center gap-1.5 text-[12px]">
                    <span className="material-symbols-outlined text-[16px] text-[#005c55]">
                      verified
                    </span>
                    <span>ประโยชน์ของระบบ</span>
                  </h4>
                  <ul className="space-y-1 text-slate-700 leading-tight font-medium">
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>ช่วยเพิ่มความปลอดภัยในการให้บริการประชาชน</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>ลดความเสี่ยงจากความขัดข้องของรถโดยสาร</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>ข้อมูลตรวจสอบเป็นมาตรฐาน ตรวจสอบได้ย้อนหลัง</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>วางแผนซ่อมบำรุงได้อย่างมีประสิทธิภาพ</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>ยกระดับคุณภาพการให้บริการของ ขสมก. อย่างยั่งยืน</span>
                    </li>
                  </ul>
                </div>

                {/* Box 3: Contact Info */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                  <h4 className="font-extrabold text-[#002f6c] flex items-center gap-1.5 text-[12px]">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">
                      support_agent
                    </span>
                    <span>ติดต่อสอบถาม</span>
                  </h4>
                  <div className="space-y-1 text-slate-700 leading-tight">
                    <p className="font-extrabold text-slate-800">
                      งานบริหารการเดินรถและควบคุมคุณภาพการให้บริการ
                    </p>
                    <p className="text-slate-600 font-semibold">กองการเดินรถที่ 6 (บน.6)</p>
                    <p className="flex items-center gap-1 text-slate-800 font-bold">
                      <span className="material-symbols-outlined text-[14px] text-emerald-700">call</span>
                      <span>02-272-3054 ต่อ 6</span>
                    </p>
                    <p className="flex items-center gap-1 text-slate-700 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-blue-700">public</span>
                      <span>BMTA District 6</span>
                    </p>
                    <p className="flex items-center gap-1 text-slate-700 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-red-600">mail</span>
                      <span>bmta.district6@gmail.com</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Ribbon */}
            <div className="bg-[#002f6c] text-white py-2.5 text-center text-[12.5px] font-black tracking-wide flex items-center justify-center gap-2">
              <span>“ตรวจก่อน พบก่อน พร้อมให้บริการ”</span>
              <span className="text-amber-300">(ตรวจ พบ พร้อม)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

