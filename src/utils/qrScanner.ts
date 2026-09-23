import jsQR from 'jsqr';
import { BMTA_DISTRICT_6_FLEET, findVehicleByBusNumber } from '../data/fleetData';

export interface ParsedBusQR {
  route: string;       // สายเดินรถ (ดึงจากเซล B)
  busNumber: string;   // เลขข้างรถ (ดึงจากเซล D)
  rawText: string;
  cellB?: string;      // ข้อมูลจากเซล B (Bus line)
  cellD?: string;      // ข้อมูลจากเซล D (busnumber)
  licensePlate?: string;// ทะเบียนรถ (เซล E)
  model?: string;      // รุ่นรถ (เซล C)
  sourceFormat?: string;
}

// Clean quotes, control characters (ASCII 0-31 except tab \t and newline \n \r), and extra whitespace
function cleanCellValue(val: string | undefined | null): string {
  if (!val) return '';
  return String(val)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/^\x1B-[.]?/, '')
    .replace(/^["']|["']$/g, '')
    .trim();
}

// Sanitize route strings (e.g. normalizing 91 / -.91 to 91ก if applicable)
function sanitizeRoute(route: string, busNumber?: string): string {
  if (!route) {
    if (busNumber) {
      const fleet = findVehicleByBusNumber(busNumber);
      if (fleet) return fleet.route;
    }
    return '';
  }
  let r = route.trim();
  r = r.replace(/^[^0-9A-Za-zก-๙]+/, '').replace(/[^0-9A-Za-zก-๙\-]+$/, '');
  
  // Normalization for Thai route 91ก (District 6)
  if (r === '91' || r === '-.91' || r === '91' || r === ' -.91' || r.startsWith('91')) {
    return '91ก';
  }
  return r;
}

// Unescape Excel JSON export (e.g. "{""Bus line"":""4-59""}")
function unescapeExcelJson(raw: string): string {
  let text = raw.trim();
  if (text.startsWith('"') && text.endsWith('"')) {
    const inner = text.slice(1, -1);
    if (inner.includes('""')) {
      text = inner.replace(/""/g, '"');
    }
  }
  return text;
}

export function parseBusQRText(text: string): ParsedBusQR {
  if (!text) {
    return { route: '', busNumber: '', rawText: '' };
  }

  const rawClean = text.trim();
  // Strip control chars except tab (\t = 0x09), line feed (\n = 0x0A), carriage return (\r = 0x0D)
  const clean = rawClean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();

  // =========================================================================
  // 1. JSON PAYLOAD FORMAT (Column F from databusnumber.xlsx):
  //    {"Bus line":"4-59","model":"ISUZU","busnumber":"50010","License plate":"11-8991"}
  //    or "{""Bus line"":""4-59"",""model"":""ISUZU"",""busnumber"":""50010""}"
  //    ดึงสายเดินรถจากเซล B (key: "Bus line") และเลขข้างรถจากเซล D (key: "busnumber")
  // =========================================================================
  try {
    const jsonCandidate = unescapeExcelJson(clean);
    if (jsonCandidate.startsWith('{') && jsonCandidate.endsWith('}')) {
      const json = JSON.parse(jsonCandidate);
      if (typeof json === 'object' && json !== null) {
        // ดึงสายเดินรถจากเซล B
        const rawRoute = cleanCellValue(
          json['Bus line'] || json['Bus Line'] || json['bus line'] || json.busline || json.busLine ||
          json.B || json.b || json.cellB || json.cell_b || json['Cell B'] || json['เซลB'] || json['เซล B'] ||
          json.route || json.busRoute || json.line || ''
        );

        // ดึงเลขข้างรถจากเซล D
        const rawBusNumber = cleanCellValue(
          json.busnumber || json['bus number'] || json['Bus number'] || json['Bus Number'] ||
          json.busNumber || json.busNo || json.vehicleNo ||
          json.D || json.d || json.cellD || json.cell_d || json['Cell D'] || json['เซลD'] || json['เซล D'] || ''
        );

        const fleetVehicle = findVehicleByBusNumber(rawBusNumber);
        const finalRoute = sanitizeRoute(rawRoute || fleetVehicle?.route || '', rawBusNumber) || fleetVehicle?.route || '';
        const finalBusNumber = rawBusNumber || fleetVehicle?.busNumber || '';

        if (finalRoute || finalBusNumber) {
          return {
            route: finalRoute,
            busNumber: finalBusNumber,
            cellB: finalRoute,
            cellD: finalBusNumber,
            licensePlate: json['License plate'] || json.licensePlate || fleetVehicle?.licensePlate,
            model: json.model || fleetVehicle?.model,
            rawText: rawClean,
            sourceFormat: `JSON QR Payload (เซล B: ${finalRoute}, เซล D: ${finalBusNumber})`
          };
        }
      }
    }
  } catch (e) {
    // Continue to other parsers
  }

  // =========================================================================
  // 2. EXPLICIT CELL LABELS: e.g. "เซล B: 4-43, เซล D: 55001" or "Cell B: 4-59, Cell D: 50010"
  // =========================================================================
  const cellBMatch = clean.match(/(?:(?:เซล|cell|col|column|ช่อง)\s*b|b)\s*[:=\s]\s*([0-9A-Za-z\-ก-๙\.]+)/i);
  const cellDMatch = clean.match(/(?:(?:เซล|cell|col|column|ช่อง)\s*d|d)\s*[:=\s]\s*([0-9A-Za-z\-]+)/i);
  if (cellBMatch && cellDMatch) {
    const rawRoute = cleanCellValue(cellBMatch[1]);
    const rawBus = cleanCellValue(cellDMatch[1]);
    const fleetVehicle = findVehicleByBusNumber(rawBus);

    const finalRoute = sanitizeRoute(rawRoute || fleetVehicle?.route || '', rawBus) || fleetVehicle?.route || '';
    const finalBusNumber = rawBus || fleetVehicle?.busNumber || '';

    return {
      route: finalRoute,
      busNumber: finalBusNumber,
      cellB: finalRoute,
      cellD: finalBusNumber,
      licensePlate: fleetVehicle?.licensePlate,
      model: fleetVehicle?.model,
      rawText: rawClean,
      sourceFormat: `ระบุเซลตรงกัน (สายเดินรถจากเซล B: ${finalRoute}, เลขข้างรถจากเซล D: ${finalBusNumber})`
    };
  }

  // =========================================================================
  // 3. SPREADSHEET ROW (Tab, Pipe, Semicolon, or Comma separated):
  //    No. (Col A) | Bus line (Col B) | model (Col C) | busnumber (Col D) | License plate (Col E)
  //    ตัวอย่าง: 1\t4-59\tISUZU\t50010\t11-8991
  // =========================================================================
  const delimiterMatch = clean.includes('\t') ? '\t'
    : clean.includes('|') ? '|'
    : clean.includes(';') ? ';'
    : clean.includes(',') && !clean.includes('เซล') ? ',' : null;

  if (delimiterMatch) {
    const rowParts = clean.split(delimiterMatch).map(cleanCellValue);
    if (rowParts.length >= 4) {
      // คอลัมน์ที่ 2 (index 1) = เซล B คือสายเดินรถ
      // คอลัมน์ที่ 4 (index 3) = เซล D คือเลขข้างรถ
      const routeCandidate = sanitizeRoute(rowParts[1]);
      const busCandidate = cleanCellValue(rowParts[3]);
      const fleetVehicle = findVehicleByBusNumber(busCandidate);

      const finalRoute = routeCandidate || fleetVehicle?.route || '';
      const finalBusNumber = busCandidate || fleetVehicle?.busNumber || '';

      return {
        route: finalRoute,
        busNumber: finalBusNumber,
        cellB: finalRoute,
        cellD: finalBusNumber,
        licensePlate: rowParts[4] || fleetVehicle?.licensePlate,
        model: rowParts[2] || fleetVehicle?.model,
        rawText: rawClean,
        sourceFormat: `สเปรดชีต (สายเดินรถจากเซล B: ${finalRoute}, เลขข้างรถจากเซล D: ${finalBusNumber})`
      };
    } else if (rowParts.length >= 2) {
      // 2 คอลัมน์: Col 0 = เซล B (สายเดินรถ), Col 1 = เซล D (เลขข้างรถ)
      const routeCandidate = sanitizeRoute(rowParts[0]);
      const busCandidate = cleanCellValue(rowParts[1]);
      const fleetVehicle = findVehicleByBusNumber(busCandidate);

      const finalRoute = routeCandidate || fleetVehicle?.route || '';
      const finalBusNumber = busCandidate || fleetVehicle?.busNumber || '';

      return {
        route: finalRoute,
        busNumber: finalBusNumber,
        cellB: finalRoute,
        cellD: finalBusNumber,
        licensePlate: fleetVehicle?.licensePlate,
        model: fleetVehicle?.model,
        rawText: rawClean,
        sourceFormat: `ดึงข้อมูลสำเร็จ (เซล B: ${finalRoute}, เซล D: ${finalBusNumber})`
      };
    }
  }

  // =========================================================================
  // 4. MULTILINE TEXT: 4+ lines representing Cell A, Cell B, Cell C, Cell D
  // =========================================================================
  const lines = clean.split(/\r?\n/).map(cleanCellValue).filter((l) => l.length > 0);
  if (lines.length >= 4) {
    const route = sanitizeRoute(lines[1]);       // Line 2 = เซล B
    const busNumber = cleanCellValue(lines[3]);   // Line 4 = เซล D
    const fleetVehicle = findVehicleByBusNumber(busNumber);

    const finalRoute = route || fleetVehicle?.route || '';
    const finalBusNumber = busNumber || fleetVehicle?.busNumber || '';

    return {
      route: finalRoute,
      busNumber: finalBusNumber,
      cellB: finalRoute,
      cellD: finalBusNumber,
      licensePlate: lines[4] || fleetVehicle?.licensePlate,
      model: lines[2] || fleetVehicle?.model,
      rawText: rawClean,
      sourceFormat: `Multiline Cells (Line 2: เซล B [${finalRoute}], Line 4: เซล D [${finalBusNumber}])`
    };
  }

  // =========================================================================
  // 5. BMTA DISTRICT 6 TEXT PAYLOAD FORMAT:
  //    (Bus line): 4-59 \n (Bus number): 50010
  // =========================================================================
  const busLineMatch = clean.match(/\(?\s*Bus\s*line\s*\)?\s*[:=\-]?\s*([0-9A-Za-z\-ก-๙\.]+)/i);
  const busNoMatch = clean.match(/\(?\s*Bus\s*number\s*\)?\s*[:=\-]?\s*([0-9A-Za-z\-]+)/i);

  if (busLineMatch || busNoMatch) {
    const rawBusNumber = cleanCellValue(busNoMatch ? busNoMatch[1] : '');
    const rawRoute = cleanCellValue(busLineMatch ? busLineMatch[1] : '');
    
    const fleetVehicle = findVehicleByBusNumber(rawBusNumber);
    const finalRoute = sanitizeRoute(rawRoute || fleetVehicle?.route || '', rawBusNumber) || fleetVehicle?.route || '';
    const finalBusNumber = rawBusNumber || fleetVehicle?.busNumber || '';

    return {
      route: finalRoute,
      busNumber: finalBusNumber,
      cellB: finalRoute,
      cellD: finalBusNumber,
      licensePlate: fleetVehicle?.licensePlate,
      model: fleetVehicle?.model,
      rawText: rawClean,
      sourceFormat: `ดึงจาก QR Code (เซล B: ${finalRoute}, เซล D: ${finalBusNumber})`
    };
  }

  // =========================================================================
  // 6. THAI NATURAL TEXT (e.g. "สาย 4-59 เลข 50010" หรือ "สาย 515 เบอร์ 56070")
  // =========================================================================
  const thaiMatch = clean.match(/สาย\s*([0-9A-Za-z\-ก-๙]+).*?(?:เลข|เบอร์|คันที่|ข้างรถ)?\s*([0-9]+-[0-9]+|[0-9]{4,6})/);
  if (thaiMatch) {
    const route = sanitizeRoute(thaiMatch[1].trim());
    const busNumber = thaiMatch[2].trim();
    const fleetVehicle = findVehicleByBusNumber(busNumber);

    const finalRoute = route || fleetVehicle?.route || '';
    const finalBusNumber = busNumber || fleetVehicle?.busNumber || '';

    return {
      route: finalRoute,
      busNumber: finalBusNumber,
      cellB: finalRoute,
      cellD: finalBusNumber,
      licensePlate: fleetVehicle?.licensePlate,
      model: fleetVehicle?.model,
      rawText: rawClean,
      sourceFormat: `ข้อความภาษาไทย (เซล B: ${finalRoute}, เซล D: ${finalBusNumber})`
    };
  }

  // =========================================================================
  // 7. LOOKUP BY 5-DIGIT BUS NUMBER IN 326 FLEET REGISTRY
  //    (ค้นหาจากเลขข้างรถ 5 หลัก เช่น 50010, 56070, 55001 ในฐานข้อมูล 326 คัน)
  //    เมื่อพบ จะดึงเซล B (สายเดินรถ) และเซล D (เลขข้างรถ) มาให้ครบถ้วน 100%
  // =========================================================================
  const busNumExtract = clean.match(/\b(6-\d{5}|\d{5})\b/);
  const busTarget = busNumExtract ? busNumExtract[1] : clean;
  const directBus = findVehicleByBusNumber(busTarget);
  if (directBus) {
    return {
      route: directBus.route,
      busNumber: directBus.busNumber,
      cellB: directBus.cellB || directBus.route,
      cellD: directBus.cellD || directBus.busNumber,
      licensePlate: directBus.licensePlate,
      model: directBus.model,
      rawText: rawClean,
      sourceFormat: `ฐานข้อมูล ขสมก. เขต 6 (ลำดับที่ ${directBus.no} | เซล B: ${directBus.route} | เซล D: ${directBus.busNumber})`
    };
  }

  // Fallback: If single string
  return {
    route: sanitizeRoute(clean),
    busNumber: '',
    cellB: sanitizeRoute(clean),
    cellD: '',
    rawText: rawClean,
    sourceFormat: 'ไม่สามารถระบุเลขข้างรถได้'
  };
}

/**
 * Scan raw ImageData for QR code text using jsQR
 */
export function scanQRCodeFromImageData(imageData: ImageData): string | null {
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth'
  });
  return code ? code.data : null;
}

/**
 * Scan video element frame for QR code using jsQR
 */
export function scanVideoForQR(video: HTMLVideoElement): ParsedBusQR | null {
  if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth'
  });

  if (code && code.data) {
    return parseBusQRText(code.data);
  }

  return null;
}

/**
 * Scan uploaded Image File for QR code
 */
export async function scanImageFileForQR(file: File): Promise<ParsedBusQR | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          resolve(parseBusQRText(code.data));
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
