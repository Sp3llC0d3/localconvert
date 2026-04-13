// to-docx.ts
// PDF → DOCX conversion
// Pipeline: pdfjs-dist (text + structure extraction) → docx npm (DOCX builder)
// License: pdfjs-dist (Apache 2.0), docx (MIT) — both AGPL-3.0 compatible
//
// Limitations (client-side only):
// • Text-based PDFs work well. Scanned/image PDFs produce empty output.
// • Layout fidelity is basic — paragraph grouping by Y-position heuristic.
// • Tables, columns, and complex layouts are flattened to plain paragraphs.
// • Fonts, colors, and images are not preserved.

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
} from 'docx';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PdfToDocxOptions {
  onProgress?: (progress: number) => void;
}

interface TextItem {
  str:       string;
  transform: number[]; // [a, b, c, d, tx, ty]
  height:    number;
  width:     number;
  fontName?: string;
}

interface LineGroup {
  y:    number;
  size: number;
  text: string;
  items: TextItem[];
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function convertPdfToDocx(
  file: File,
  options: PdfToDocxOptions = {}
): Promise<Uint8Array> {
  const { onProgress } = options;

  // 1 — Load PDF via pdfjs
  onProgress?.(0.05);
  const { loadPdfDocument } = await import('./preview');
  const pdfDoc = await loadPdfDocument(file);
  const numPages = pdfDoc.numPages;

  // 2 — Extract text page by page
  const allParagraphs: Paragraph[] = [];

  for (let p = 1; p <= numPages; p++) {
    onProgress?.(0.05 + (p / numPages) * 0.75);

    const page        = await pdfDoc.getPage(p);
    const textContent = await page.getTextContent({ includeMarkedContent: false });

    const items = textContent.items as TextItem[];
    const lines = groupItemsIntoLines(items);
    const paras = linesToParagraphs(lines);

    allParagraphs.push(...paras);

    // Page break between pages (not after last)
    if (p < numPages) {
      allParagraphs.push(
        new Paragraph({ children: [new PageBreak()] })
      );
    }

    page.cleanup();
  }

  pdfDoc.destroy();
  onProgress?.(0.85);

  // 3 — Build DOCX
  const doc = new Document({
    creator:     'LocalConvert',
    description: `Converted from ${file.name}`,
    styles: {
      default: {
        document: {
          run: { size: 22, font: 'Calibri' }, // 11pt
        },
      },
    },
    sections: [{
      children: allParagraphs.length
        ? allParagraphs
        : [new Paragraph({ children: [
            new TextRun({
              text: 'No text content found. This PDF may be scanned/image-based.',
              italics: true,
            }),
          ]})]
    }],
  });

  const base64 = await Packer.toBase64String(doc);
  const binary = atob(base64);
  const docxBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) docxBytes[i] = binary.charCodeAt(i);
  onProgress?.(1);
  return docxBytes;
}

// ─── Text grouping ────────────────────────────────────────────────────────────

/** Group individual text items into horizontal lines by Y-coordinate. */
function groupItemsIntoLines(items: TextItem[]): LineGroup[] {
  if (!items.length) return [];

  // Filter empty strings
  const filtered = items.filter(item => item.str.trim() !== '' || item.str === ' ');
  if (!filtered.length) return [];

  // Sort: top to bottom (PDF Y is from bottom), then left to right
  const sorted = [...filtered].sort((a, b) => {
    const ya = a.transform[5];
    const yb = b.transform[5];
    const diff = yb - ya; // descending = top-first
    if (Math.abs(diff) > 2) return diff;
    return a.transform[4] - b.transform[4]; // same line → left first
  });

  const lines: LineGroup[] = [];
  let current: TextItem[] = [];
  let lastY = sorted[0].transform[5];

  for (const item of sorted) {
    const y = item.transform[5];
    if (Math.abs(y - lastY) > 3 && current.length) {
      lines.push(buildLineGroup(current));
      current = [];
    }
    current.push(item);
    lastY = y;
  }
  if (current.length) lines.push(buildLineGroup(current));

  return lines;
}

function buildLineGroup(items: TextItem[]): LineGroup {
  // Sort items left to right
  const sorted = [...items].sort((a, b) => a.transform[4] - b.transform[4]);

  let text = '';
  let lastX = -1;
  let lastW = 0;

  for (const item of sorted) {
    const x = item.transform[4];
    // If there's a noticeable gap between items, add a space
    if (lastX >= 0 && x > lastX + lastW + 2) {
      text += ' ';
    }
    text += item.str;
    lastX = x;
    lastW = item.width ?? (item.str.length * (item.height ?? 10) * 0.5);
  }

  const avgSize = items.reduce((sum, i) => sum + (i.height ?? 11), 0) / items.length;

  return {
    y:     items[0].transform[5],
    size:  avgSize,
    text:  text.trim(),
    items: sorted,
  };
}

// ─── Line → Paragraph logic ───────────────────────────────────────────────────

/** Heuristic: convert line groups to DOCX paragraphs. */
function linesToParagraphs(lines: LineGroup[]): Paragraph[] {
  if (!lines.length) return [];

  // Estimate body font size (most common size)
  const sizes = lines.map(l => Math.round(l.size));
  const sizeFreq: Record<number, number> = {};
  for (const s of sizes) sizeFreq[s] = (sizeFreq[s] ?? 0) + 1;
  const bodySize = Math.max(
    Number(Object.entries(sizeFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 11),
    1  // guard: never divide by zero
  );

  const paragraphs: Paragraph[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.text) { i++; continue; }

    const relSize = line.size / bodySize;

    // Heading detection heuristic
    let heading: HeadingLevel | null = null;
    if (relSize >= 1.8)       heading = HeadingLevel.HEADING_1;
    else if (relSize >= 1.45) heading = HeadingLevel.HEADING_2;
    else if (relSize >= 1.2)  heading = HeadingLevel.HEADING_3;

    // Check for all-caps short line (likely a heading too)
    if (!heading && line.text.length < 80 && line.text === line.text.toUpperCase()
        && line.text.replace(/[^A-Z]/g, '').length > 3) {
      heading = HeadingLevel.HEADING_3;
    }

    if (heading !== null) {
      paragraphs.push(new Paragraph({
        heading,
        children: [new TextRun({ text: line.text, bold: true })],
      }));
      i++;
      continue;
    }

    // Regular paragraph — merge consecutive body lines (same vertical spacing)
    let paraText = line.text;
    while (i + 1 < lines.length) {
      const next   = lines[i + 1];
      const gap    = line.y - next.y;  // Y gap between this line and next
      // If gap ≈ line height, lines are part of same paragraph
      if (gap < line.size * 2.2 && Math.round(next.size / bodySize) === 1) {
        // If previous line ends mid-sentence (no period, not short), merge
        if (!paraText.match(/[.!?:]\s*$/) && paraText.length > 20) {
          paraText += ' ' + next.text;
          i++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: paraText })],
      spacing: { after: 120 }, // 6pt after each paragraph
    }));
    i++;
  }

  return paragraphs;
}
