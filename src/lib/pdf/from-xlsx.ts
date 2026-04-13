// from-xlsx.ts
// XLSX / ODS / CSV → PDF conversion
// Pipeline: SheetJS (read spreadsheet) → pdf-lib (draw table)
// License: SheetJS (Apache 2.0), pdf-lib (MIT) — both AGPL-3.0 compatible

import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface XlsxToPdfOptions {
  onProgress?: (progress: number) => void;
  /** A4 landscape = better for wide sheets */
  orientation?: 'portrait' | 'landscape';
  /** Max columns to render before truncating */
  maxCols?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HEADER_COLOR  = rgb(0.18, 0.38, 0.74);   // blue
const ALT_ROW_COLOR = rgb(0.96, 0.96, 0.97);   // light grey
const BORDER_COLOR  = rgb(0.80, 0.82, 0.86);
const TEXT_DARK     = rgb(0.08, 0.08, 0.08);
const TEXT_WHITE    = rgb(1, 1, 1);

// ─── Main export ──────────────────────────────────────────────────────────────

export async function convertXlsxToPdf(
  file: File,
  options: XlsxToPdfOptions = {}
): Promise<Uint8Array> {
  const {
    onProgress,
    orientation = 'landscape',
    maxCols     = 20,
  } = options;

  // 1 — Read workbook
  onProgress?.(0.05);
  const arrayBuffer = await file.arrayBuffer();
  const workbook    = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array', cellDates: true });

  // 2 — Build PDF
  onProgress?.(0.15);
  const pdfDoc = await PDFDocument.create();

  const regular  = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold     = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const [PAGE_W, PAGE_H] = orientation === 'landscape' ? [842, 595] : [595, 842];
  const MARGIN   = 36;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const sheetNames = workbook.SheetNames;

  for (let s = 0; s < sheetNames.length; s++) {
    onProgress?.(0.15 + (s / sheetNames.length) * 0.8);

    const sheetName = sheetNames[s];
    const sheet     = workbook.Sheets[sheetName];
    const rawData   = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      defval: '',
      raw:    false,       // format dates/numbers as strings
    }) as string[][];

    if (!rawData.length) continue;

    // Trim to maxCols
    const effectiveCols = Math.min(
      maxCols,
      Math.max(...rawData.map(r => r.length))
    );

    const data = rawData.map(row => row.slice(0, effectiveCols));

    // Compute column widths based on content
    const colWidths = computeColWidths(data, effectiveCols, CONTENT_W, regular, bold);

    const ROW_H    = 18;
    const FONT_SZ  = 8.5;
    const PAD      = 4;

    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y    = PAGE_H - MARGIN;

    // Sheet title (when workbook has multiple sheets)
    if (sheetNames.length > 1) {
      page.drawText(sheetName, {
        x: MARGIN, y: y - 13,
        size: 13, font: bold, color: TEXT_DARK,
      });
      y -= 24;
    }

    // Draw each row
    for (let r = 0; r < data.length; r++) {
      const row      = data[r];
      const isHeader = r === 0;

      // New page if no space
      if (y - ROW_H < MARGIN) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y    = PAGE_H - MARGIN;

        // Repeat header on continuation pages
        if (!isHeader && data[0]) {
          drawRow(page, data[0], colWidths, MARGIN, y, ROW_H, FONT_SZ, PAD, bold, regular, true);
          y -= ROW_H;
        }
      }

      drawRow(page, row, colWidths, MARGIN, y, ROW_H, FONT_SZ, PAD,
        bold, regular, isHeader, r % 2 === 1 && !isHeader);
      y -= ROW_H;
    }

    // Draw column borders on top of everything (just the outline)
    // (borders drawn per-cell in drawRow already)
  }

  onProgress?.(1);
  return pdfDoc.save();
}

// ─── Row renderer ─────────────────────────────────────────────────────────────

function drawRow(
  page:       PDFPage,
  row:        string[],
  colWidths:  number[],
  startX:     number,
  topY:       number,
  rowH:       number,
  fontSize:   number,
  pad:        number,
  bold:       PDFFont,
  regular:    PDFFont,
  isHeader:   boolean,
  isAltRow =  false
): void {
  let x = startX;

  for (let c = 0; c < colWidths.length; c++) {
    const w     = colWidths[c];
    const cellY = topY - rowH;

    // Background
    if (isHeader) {
      page.drawRectangle({ x, y: cellY, width: w, height: rowH, color: HEADER_COLOR });
    } else if (isAltRow) {
      page.drawRectangle({ x, y: cellY, width: w, height: rowH, color: ALT_ROW_COLOR });
    }

    // Border
    page.drawRectangle({
      x, y: cellY, width: w, height: rowH,
      borderColor: BORDER_COLOR, borderWidth: 0.4,
    });

    // Cell text
    const raw     = String(row[c] ?? '');
    const font    = isHeader ? bold : regular;
    const color   = isHeader ? TEXT_WHITE : TEXT_DARK;
    const maxTxtW = w - pad * 2;

    const truncated = truncateText(raw, font, fontSize, maxTxtW);
    if (truncated) {
      page.drawText(truncated, {
        x: x + pad,
        y: cellY + (rowH - fontSize) / 2,
        size: fontSize, font, color,
        maxWidth: maxTxtW,
      });
    }

    x += w;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeColWidths(
  data:         string[][],
  numCols:      number,
  totalWidth:   number,
  regular:      PDFFont,
  bold:         PDFFont,
  fontSize    = 8.5,
  padding     = 8,
): number[] {
  const measured = Array.from({ length: numCols }, (_, c) => {
    let maxW = 20; // minimum
    for (let r = 0; r < Math.min(data.length, 50); r++) {
      const font  = r === 0 ? bold : regular;
      const text  = String(data[r]?.[c] ?? '');
      const w     = font.widthOfTextAtSize(text.substring(0, 40), fontSize) + padding;
      if (w > maxW) maxW = w;
    }
    return Math.min(maxW, 180); // cap per column
  });

  // Scale to fit totalWidth
  const sum = measured.reduce((a, b) => a + b, 0);
  if (sum <= totalWidth) return measured;

  const scale = totalWidth / sum;
  return measured.map(w => Math.max(w * scale, 18));
}

function truncateText(text: string, font: PDFFont, size: number, maxW: number): string {
  if (!text) return '';
  if (font.widthOfTextAtSize(text, size) <= maxW) return text;

  let truncated = text;
  while (truncated.length > 1 && font.widthOfTextAtSize(truncated + '…', size) > maxW) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}
