// from-docx.ts
// DOCX → PDF conversion
// Pipeline: mammoth.js (DOCX→HTML) → DOM parse → pdf-lib rendering
// License: mammoth (BSD-2), pdf-lib (MIT) — both AGPL-3.0 compatible

import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocxToPdfOptions {
  onProgress?: (progress: number) => void;
}

interface ContentBlock {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'li' | 'hr' | 'br';
  text: string;
  bold?: boolean;
  italic?: boolean;
  runs?: TextRun[];
}

interface TextRun {
  text: string;
  bold: boolean;
  italic: boolean;
}

interface PageState {
  page: PDFPage;
  y: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_W = 595;   // A4 portrait in points
const PAGE_H = 842;
const MARGIN = 55;
const MAX_W  = PAGE_W - MARGIN * 2;

const HEADING_SIZES: Record<string, number> = {
  h1: 22, h2: 18, h3: 15, h4: 13, h5: 12, h6: 11,
};

const HEADING_SPACING_BEFORE: Record<string, number> = {
  h1: 14, h2: 12, h3: 10, h4: 8, h5: 6, h6: 4,
};

// ─── Main export ──────────────────────────────────────────────────────────────

export async function convertDocxToPdf(
  file: File,
  options: DocxToPdfOptions = {}
): Promise<Uint8Array> {
  const { onProgress } = options;

  // 1 — Extract HTML from DOCX via mammoth
  onProgress?.(0.05);
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;

  // 2 — Parse HTML into content blocks
  onProgress?.(0.25);
  const blocks = parseHtmlToBlocks(html);

  // 3 — Build PDF with pdf-lib
  onProgress?.(0.35);
  const pdfDoc = await PDFDocument.create();

  const regular  = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold     = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic   = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const boldItalic = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

  const state = addNewPage(pdfDoc);

  for (let i = 0; i < blocks.length; i++) {
    onProgress?.(0.35 + (i / blocks.length) * 0.6);
    await drawBlock(blocks[i], state, pdfDoc, { regular, bold, italic, boldItalic });
  }

  onProgress?.(1);
  return pdfDoc.save();
}

// ─── Page helpers ─────────────────────────────────────────────────────────────

function addNewPage(pdfDoc: PDFDocument): PageState {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  return { page, y: PAGE_H - MARGIN };
}

function ensureSpace(
  neededHeight: number,
  state: PageState,
  pdfDoc: PDFDocument
): void {
  if (state.y - neededHeight < MARGIN) {
    const next = addNewPage(pdfDoc);
    state.page = next.page;
    state.y    = next.y;
  }
}

// ─── Block renderer ──────────────────────────────────────────────────────────

async function drawBlock(
  block: ContentBlock,
  state: PageState,
  pdfDoc: PDFDocument,
  fonts: { regular: PDFFont; bold: PDFFont; italic: PDFFont; boldItalic: PDFFont }
): Promise<void> {
  if (block.type === 'br') {
    state.y -= 6;
    return;
  }

  if (block.type === 'hr') {
    ensureSpace(10, state, pdfDoc);
    state.y -= 6;
    state.page.drawLine({
      start: { x: MARGIN, y: state.y },
      end:   { x: PAGE_W - MARGIN, y: state.y },
      thickness: 0.75,
      color: rgb(0.75, 0.75, 0.75),
    });
    state.y -= 10;
    return;
  }

  const isHeading  = block.type.startsWith('h');
  const fontSize   = isHeading ? HEADING_SIZES[block.type] : 11;
  const lineHeight = fontSize * 1.45;
  const indent     = block.type === 'li' ? 14 : 0;

  // Vertical space before heading
  if (isHeading) {
    state.y -= HEADING_SPACING_BEFORE[block.type] ?? 8;
  }

  // Use runs if available (mixed bold/italic), else treat whole block uniformly
  const runs: TextRun[] = block.runs?.length
    ? block.runs
    : [{ text: block.text, bold: !!block.bold, italic: !!block.italic }];

  // Build word list with font info, then line-wrap
  const words = buildWords(runs, fonts, isHeading, fontSize);
  const lines  = wrapWords(words, MAX_W - indent, fontSize);

  const blockH = lines.length * lineHeight + (isHeading ? 6 : 2);
  ensureSpace(blockH, state, pdfDoc);

  for (const line of lines) {
    if (state.y - lineHeight < MARGIN) {
      const next = addNewPage(pdfDoc);
      state.page = next.page;
      state.y    = next.y;
    }

    let x = MARGIN + indent;
    for (const segment of line) {
      state.page.drawText(segment.text, {
        x,
        y: state.y - fontSize,
        size: fontSize,
        font: segment.font,
        color: rgb(0.05, 0.05, 0.05),
      });
      x += segment.font.widthOfTextAtSize(segment.text, fontSize);
    }
    state.y -= lineHeight;
  }

  // Extra space after headings
  if (isHeading) state.y -= 4;
}

// ─── Word / line helpers ──────────────────────────────────────────────────────

interface Word { text: string; font: PDFFont }
interface Segment { text: string; font: PDFFont }

function buildWords(
  runs: TextRun[],
  fonts: { regular: PDFFont; bold: PDFFont; italic: PDFFont; boldItalic: PDFFont },
  forceHeading: boolean,
  _fontSize: number
): Word[] {
  const words: Word[] = [];
  for (const run of runs) {
    const font = forceHeading
      ? fonts.bold
      : run.bold && run.italic ? fonts.boldItalic
      : run.bold               ? fonts.bold
      : run.italic             ? fonts.italic
      :                          fonts.regular;

    // Split by whitespace but keep tokens
    const tokens = run.text.split(/(\s+)/);
    for (const tok of tokens) {
      if (tok) words.push({ text: tok, font });
    }
  }
  return words;
}

function wrapWords(words: Word[], maxWidth: number, fontSize: number): Segment[][] {
  const lines: Segment[][] = [];
  let currentLine: Segment[] = [];
  let currentWidth = 0;
  // fontSize passed from caller — correct for headings (22/18/15pt) and body (11pt)

  for (const word of words) {
    // Whitespace — just add to current segment
    if (/^\s+$/.test(word.text)) {
      if (currentLine.length) {
        const last = currentLine[currentLine.length - 1];
        if (last.font === word.font) {
          last.text += word.text;
        } else {
          currentLine.push({ text: word.text, font: word.font });
        }
        currentWidth += word.font.widthOfTextAtSize(word.text, fontSize);
      }
      continue;
    }

    const wordWidth = word.font.widthOfTextAtSize(word.text, fontSize);
    if (currentWidth + wordWidth > maxWidth && currentLine.length) {
      lines.push(trimLine(currentLine));
      currentLine  = [];
      currentWidth = 0;
    }

    const last = currentLine[currentLine.length - 1];
    if (last && last.font === word.font) {
      last.text += word.text;
    } else {
      currentLine.push({ text: word.text, font: word.font });
    }
    currentWidth += wordWidth;
  }

  if (currentLine.length) lines.push(trimLine(currentLine));
  return lines.length ? lines : [[]];
}

function trimLine(segments: Segment[]): Segment[] {
  // Strip leading/trailing whitespace from first/last segments
  const result = segments.map(s => ({ ...s }));
  if (result.length) result[0].text = result[0].text.trimStart();
  if (result.length) result[result.length - 1].text = result[result.length - 1].text.trimEnd();
  return result.filter(s => s.text.length > 0);
}

// ─── HTML parser ──────────────────────────────────────────────────────────────

function parseHtmlToBlocks(html: string): ContentBlock[] {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(html, 'text/html');
  const blocks: ContentBlock[] = [];

  function extractRuns(node: Node): TextRun[] {
    const runs: TextRun[] = [];
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? '';
        if (text) runs.push({ text, bold: false, italic: false });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el   = child as Element;
        const tag  = el.tagName.toLowerCase();
        const childRuns = extractRuns(el);
        const isBold   = ['strong', 'b'].includes(tag);
        const isItalic = ['em', 'i'].includes(tag);
        for (const r of childRuns) {
          runs.push({
            text:   r.text,
            bold:   r.bold || isBold,
            italic: r.italic || isItalic,
          });
        }
      }
    }
    return runs;
  }

  function processNode(node: Element) {
    const tag = node.tagName?.toLowerCase();
    if (!tag) return;

    if (['h1','h2','h3','h4','h5','h6'].includes(tag)) {
      const runs = extractRuns(node);
      const text = node.textContent?.trim() ?? '';
      if (text) blocks.push({ type: tag as ContentBlock['type'], text, runs });

    } else if (tag === 'p') {
      const runs = extractRuns(node);
      const text = node.textContent?.trim() ?? '';
      if (text) {
        blocks.push({ type: 'p', text, runs });
      } else {
        blocks.push({ type: 'br', text: '' });
      }

    } else if (tag === 'ul' || tag === 'ol') {
      const items = node.querySelectorAll(':scope > li');
      items.forEach((li, idx) => {
        const prefix = tag === 'ol' ? `${idx + 1}. ` : '• ';
        const text   = li.textContent?.trim() ?? '';
        if (text) {
          const runs = extractRuns(li);
          runs.unshift({ text: prefix, bold: false, italic: false });
          blocks.push({ type: 'li', text: prefix + text, runs });
        }
      });

    } else if (tag === 'hr') {
      blocks.push({ type: 'hr', text: '' });

    } else if (tag === 'br') {
      blocks.push({ type: 'br', text: '' });

    } else if (tag === 'table') {
      // Render table rows as text lines
      node.querySelectorAll('tr').forEach(row => {
        const cells = Array.from(row.querySelectorAll('td, th'))
          .map(c => c.textContent?.trim() ?? '');
        const text = cells.join('  │  ');
        if (text.trim()) {
          const isHeader = row.querySelectorAll('th').length > 0;
          blocks.push({ type: 'p', text, bold: isHeader });
        }
      });
      blocks.push({ type: 'br', text: '' });

    } else if (tag === 'blockquote') {
      const text = node.textContent?.trim() ?? '';
      if (text) blocks.push({ type: 'p', text: `  "${text}"`, italic: true });

    } else {
      Array.from(node.children).forEach(child => processNode(child));
    }
  }

  Array.from(doc.body.children).forEach(child => processNode(child));
  return blocks;
}
