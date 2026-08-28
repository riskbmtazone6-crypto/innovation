import jsQR from 'jsqr';
import { BMTA_DISTRICT_6_FLEET, findVehicleByBusNumber } from '../data/fleetData';

export interface ParsedBusQR {
  route: string;
  busNumber: string;
  rawText: string;
  cellB?: string;
  cellD?: string;
  licensePlate?: string;
  model?: string;
  sourceFormat?: string;
}

// Clean quotes, control characters (ASCII 0-31), and extra whitespace from string
function cleanCellValue(val: string | undefined | null): string {
  if (!val) return '';
  return String(val)
    // Remove control characters (except newline \n for multiline check)
    .replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '')
    // Remove non-printable / escape sequences like \x1B-.91
    .replace(/^\x1B-[.]?/, '')
    .replace(/^["']|["']$/g, '') // remove outer quotes
    .trim();
}

// Sanitize route strings (e.g. normalizing 91 to 91ก if applicable)
function sanitizeRoute(route: string, busNumber?: string): string {
  if (!route) {
    if (busNumber) {
      const fleet = findVehicleByBusNumber(busNumber);
      if (fleet) return fleet.route;
    }
    return '';
  }
  let r = route.trim();
  // Clean corrupt prefix from raw terminal/barcode esc bytes
  r = r.replace(/^[^0-9A-Za-zก-๙]+/, '').replace(/[^0-9A-Za-zก-๙\-]+$/, '');
  
  // Normalization for Thai route designations like 91ก
  if (r === '91' || r === '91' || r === '-.91' || r.startsWith('91')) {
    return '91ก';
  }
  return r;
}

export function parseBusQRText(text: string): ParsedBusQR {
  if (!text) {
    return { route: '', busNumber: '', rawText: '' };
  }

  const rawClean = text.trim();
  // Strip control chars except newline
  const clean = rawClean.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '').trim();

  // =========================================================================
  // 1. BMTA District 6 QR Payload Format:
  //    "*2\"#\x16 (Bus line): 4-59\n@%\x02\x02I2\x07#\x16 (Bus number): 50010"
  //    or "(Bus line): 4-59 \n (Bus number): 50010"
  // =========================================================================
  const busLineMatch = clean.match(/\(?\s*Bus\s*line\s*\)?\s*[:=\-]?\s*([0-9A-Za-z\-ก-๙\.]+)/i);
  const busNoMatch = clean.match(/\(?\s*Bus\s*number\s*\)?\s*[:=\-]?\s*([0-9A-Za-z\-]+)/i);

  if (busLineMatch || busNoMatch) {
    const rawBusNumber = cleanCellValue(busNoMatch ? busNoMatch[1] : '');
    const rawRoute = cleanCellValue(busLineMatch ? busLineMatch[1] : '');
    
    // Cross reference fleet registry to ensure 100% accuracy
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
      sourceFormat: 'ดึงจาก QR Code (เซล B: Bus line, เซล D: Bus number)'
    };
  }

  // =========================================================================
  // 2. Spreadsheet Row: Tab-separated (TSV / Excel / Google Sheets copy-paste)
  //    No., Bus line (Cell B), model (Cell C), busnumber (Cell D), License plate (Cell E)
  // =========================================================================
  if (clean.includes('\t')) {
    const tsvParts = clean.split('\t').map(cleanCellValue);
    if (tsvParts.length >= 4) {
      // Column index 1 = Cell B (Bus line), Column index 3 = Cell D (busnumber)
      const route = sanitizeRoute(tsvParts[1]);
      const busNumber = cleanCellValue(tsvParts[3]);
      const fleetVehicle = findVehicleByBusNumber(busNumber);

      return {
        route: route || fleetVehicle?.route || '',
        busNumber,
        cellB: route,
        cellD: busNumber,
        licensePlate: tsvParts[4] || fleetVehicle?.licensePlate,
        model: tsvParts[2] || fleetVehicle?.model,
        rawText: rawClean,
        sourceFormat: 'Excel/Sheets TSV (Cell B: สายเดินรถ, Cell D: เลขข้างรถ)'
      };
    } else if (tsvParts.length >= 2) {
      const route = sanitizeRoute(tsvParts[0]);
      const busNumber = cleanCellValue(tsvParts[1]);
      return {
        route,
        busNumber,
        cellB: route,
        cellD: busNumber,
        rawText: rawClean,
        sourceFormat: 'TSV 2-Columns'
      };
    }
  }

  // =========================================================================
  // 3. Comma-separated (CSV): 1,4-59,ISUZU,50010,11-8991,...
  //    Cell A = No, Cell B = Bus line (index 1), Cell C = model, Cell D = busnumber (index 3)
  // =========================================================================
  if (clean.includes(',')) {
    const csvParts = clean.split(',').map(cleanCellValue);
    if (csvParts.length >= 4) {
      const route = sanitizeRoute(csvParts[1]);
      const busNumber = cleanCellValue(csvParts[3]);
      const fleetVehicle = findVehicleByBusNumber(busNumber);

      return {
        route: route || fleetVehicle?.route || '',
        busNumber,
        cellB: route,
        cellD: busNumber,
        licensePlate: csvParts[4] || fleetVehicle?.licensePlate,
        model: csvParts[2] || fleetVehicle?.model,
        rawText: rawClean,
        sourceFormat: 'CSV Row (Cell B: สายเดินรถ, Cell D: เลขข้างรถ)'
      };
    } else if (csvParts.length >= 2) {
      return {
        route: sanitizeRoute(csvParts[0]),
        busNumber: csvParts.slice(1).join('-'),
        rawText: rawClean,
        sourceFormat: 'CSV 2-Columns'
      };
    }
  }

  // =========================================================================
  // 4. Multiline text: 4+ lines representing Cell A, Cell B, Cell C, Cell D
  // =========================================================================
  const lines = clean.split(/\r?\n/).map(cleanCellValue).filter((l) => l.length > 0);
  if (lines.length >= 4) {
    const route = sanitizeRoute(lines[1]); // Line 2 = Cell B
    const busNumber = cleanCellValue(lines[3]); // Line 4 = Cell D
    const fleetVehicle = findVehicleByBusNumber(busNumber);

    return {
      route: route || fleetVehicle?.route || '',
      busNumber,
      cellB: route,
      cellD: busNumber,
      licensePlate: lines[4] || fleetVehicle?.licensePlate,
      model: lines[2] || fleetVehicle?.model,
      rawText: rawClean,
      sourceFormat: 'Multiline Cells (Line 2: เซล B, Line 4: เซล D)'
    };
  }

  // =========================================================================
  // 5. JSON format: {"B":"4-59", "D":"50010"} or {"Bus line":"4-59", "busnumber":"50010"}
  // =========================================================================
  try {
    const json = JSON.parse(clean);
    if (Array.isArray(json)) {
      if (json.length >= 4) {
        const route = sanitizeRoute(cleanCellValue(json[1]));
        const busNumber = cleanCellValue(json[3]);
        return {
          route,
          busNumber,
          cellB: route,
          cellD: busNumber,
          rawText: rawClean,
          sourceFormat: 'JSON Row Array (Cell B & Cell D)'
        };
      }
    } else if (typeof json === 'object' && json !== null) {
      const route = sanitizeRoute(
        cleanCellValue(
          json.B || json.b || json.cellB || json.cell_b || json['Cell B'] || json['เซลB'] || json['เซล B'] ||
          json['Bus line'] || json['busLine'] || json.route || json.busRoute || json.line || ''
        )
      );

      const busNumber = cleanCellValue(
        json.D || json.d || json.cellD || json.cell_d || json['Cell D'] || json['เซลD'] || json['เซล D'] ||
        json.busnumber || json['Bus number'] || json.busNumber || json.busNo || json.vehicleNo || ''
      );

      if (route || busNumber) {
        const fleetVehicle = findVehicleByBusNumber(busNumber);
        return {
          route: route || fleetVehicle?.route || '',
          busNumber: busNumber || fleetVehicle?.busNumber || '',
          cellB: route,
          cellD: busNumber,
          licensePlate: json['License plate'] || json.licensePlate || fleetVehicle?.licensePlate,
          model: json.model || fleetVehicle?.model,
          rawText: rawClean,
          sourceFormat: 'JSON Object (Cell B & Cell D)'
        };
      }
    }
  } catch (e) {
    // Not valid JSON
  }

  // =========================================================================
  // 6. Explicit Cell key-value syntax: e.g. "B: 4-59, D: 50010" or "เซล B: 4-59 เซล D: 50010"
  // =========================================================================
  const cellBMatch = clean.match(/(?:(?:เซล|cell|col|column)\s*b|b)\s*[:=]\s*([^,\s;&\n]+)/i);
  const cellDMatch = clean.match(/(?:(?:เซล|cell|col|column)\s*d|d)\s*[:=]\s*([^,\s;&\n]+)/i);
  if (cellBMatch && cellDMatch) {
    const route = sanitizeRoute(cleanCellValue(cellBMatch[1]));
    const busNumber = cleanCellValue(cellDMatch[1]);
    const fleetVehicle = findVehicleByBusNumber(busNumber);

    return {
      route: route || fleetVehicle?.route || '',
      busNumber,
      cellB: route,
      cellD: busNumber,
      licensePlate: fleetVehicle?.licensePlate,
      model: fleetVehicle?.model,
      rawText: rawClean,
      sourceFormat: 'Key-Value (Cell B & Cell D)'
    };
  }

  // =========================================================================
  // 7. Thai Natural Text (e.g. "สาย 4-59 เลข 50010" หรือ "สาย 515 เบอร์ 56070")
  // =========================================================================
  const thaiMatch = clean.match(/สาย\s*([0-9A-Za-z\-ก-๙]+).*?(?:เลข|เบอร์|คันที่|ข้างรถ)?\s*([0-9]+-[0-9]+|[0-9]{4,6})/);
  if (thaiMatch) {
    const route = sanitizeRoute(thaiMatch[1].trim());
    const busNumber = thaiMatch[2].trim();
    const fleetVehicle = findVehicleByBusNumber(busNumber);
    return {
      route: route || fleetVehicle?.route || '',
      busNumber,
      cellB: route,
      cellD: busNumber,
      licensePlate: fleetVehicle?.licensePlate,
      model: fleetVehicle?.model,
      rawText: rawClean,
      sourceFormat: 'Thai Text Match'
    };
  }

  // =========================================================================
  // 8. Delimited formats with 2 parts: "4-59/50010", "4-59:50010"
  // =========================================================================
  const splitDelim = clean.split(/[/:]+/).map(cleanCellValue);
  if (splitDelim.length >= 2) {
    const r = sanitizeRoute(splitDelim[0]);
    const b = splitDelim.slice(1).join('-').trim();
    if (r && b) {
      const fleetVehicle = findVehicleByBusNumber(b);
      return {
        route: r || fleetVehicle?.route || '',
        busNumber: b,
        cellB: r,
        cellD: b,
        licensePlate: fleetVehicle?.licensePlate,
        model: fleetVehicle?.model,
        rawText: rawClean,
        sourceFormat: 'Delimiter / or :'
      };
    }
  }

  // =========================================================================
  // 9. Single 5-digit bus number lookup (e.g. "50010" or "6-56018")
  // =========================================================================
  const directBus = findVehicleByBusNumber(clean);
  if (directBus) {
    return {
      route: directBus.route,
      busNumber: directBus.busNumber,
      cellB: directBus.route,
      cellD: directBus.busNumber,
      licensePlate: directBus.licensePlate,
      model: directBus.model,
      rawText: rawClean,
      sourceFormat: `Fleet Registry Matched (#${directBus.no})`
    };
  }

  // Fallback: If single string
  return {
    route: sanitizeRoute(clean),
    busNumber: '',
    rawText: rawClean,
    sourceFormat: 'Single Value'
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
