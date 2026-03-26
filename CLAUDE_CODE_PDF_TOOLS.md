# LocalConvert — PDF Tools Page — Claude Code Context (AUDITED v2)
# ==================================================================
# Task: Add a dedicated PDF tools page to LocalConvert
# Inspired by: pdfwithlove.netlify.app
# Audited: March 26, 2026 — all technical issues verified and corrected
# ==================================================================


## TASK OVERVIEW

Add a new PDF tools section to LocalConvert at `/pdf-tools` route. All PDF operations must run 100% locally in the browser — no server uploads. This aligns with LocalConvert's core principle: "Your files never leave your device."

The existing Pandoc converter handles basic document format conversion (DOCX→HTML, etc.) but cannot create, merge, split, or modify PDFs. We need dedicated PDF tools using `pdf-lib` and `pdf.js`.


## TOOLS TO IMPLEMENT (Priority Order)

### Phase A — Core PDF Tools (Must Have)
1. **Merge PDF** — Combine multiple PDF files into one
2. **Split PDF** — Extract specific pages or page ranges (needs pdf.js for page thumbnails)
3. **Rotate Pages** — Rotate individual or all pages (90°, 180°, 270°)
4. **Organize Pages** — Drag-and-drop reorder, delete pages (needs pdf.js for thumbnails + drag library)
5. **Images → PDF** — Convert JPG/PNG/WEBP images to a PDF document

### Phase B — Enhanced Tools
6. **PDF → Images** — Export each PDF page as PNG/JPG (uses pdf.js canvas rendering)
7. **Compress PDF** — Re-render pages at lower quality via pdf.js canvas → pdf-lib rebuild (see COMPRESS STRATEGY below)
8. **Add Watermark** — Text or image watermark on pages
9. **Page Numbers** — Add page numbers to PDF

### Phase C — Advanced Tools (Later — each is complex)
10. **PDF Metadata** — Edit title, author, subject, keywords
11. **Sign PDF** — Draw/upload/type signature, place on specific page position (complex: needs canvas overlay synced with PDF page rendering — estimate 2+ sessions alone)

### ⚠️ DEFERRED — Do NOT implement these
- **DOCX → PDF** — mammoth.js converts DOCX to HTML, but pdf-lib cannot render HTML to PDF. Would need Puppeteer (server-side only). Pandoc already handles DOCX→HTML/Markdown.
- **PDF → Word** — Requires OCR-level text extraction + layout reconstruction.
- **PDF → Excel** — Requires table structure detection.
- **Repair PDF** — Needs low-level PDF stream manipulation beyond pdf-lib.


## ⚠️ COMPRESS PDF STRATEGY (Important — read before implementing)

pdf-lib alone CANNOT compress PDFs. It cannot downsample images or re-encode streams. But we CAN achieve compression using a **pdf.js → canvas → pdf-lib pipeline**:

```
Original PDF
  → pdf.js renders each page to canvas at original resolution
  → canvas.toBlob('image/jpeg', compressionQuality)  // quality: 0.3 = high compression, 0.7 = medium, 0.9 = low
  → pdf-lib creates new PDF with compressed JPEG pages
  → Result: smaller file
```

**Compression levels:**
- Low compression (quality 0.9): ~20-40% size reduction, good quality
- Medium compression (quality 0.6): ~50-70% size reduction, acceptable quality
- High compression (quality 0.3): ~70-90% size reduction, noticeable quality loss

**⚠️ CRITICAL WARNING for users:**
This method converts each page to a JPEG image. The result:
- ✅ File size is reduced significantly
- ❌ Text is no longer selectable/searchable (becomes an image)
- ❌ Hyperlinks are lost
- ❌ Form fields are lost

**UI must clearly warn:** "Compressed PDFs will have image-only pages. Text will not be selectable."

```typescript
// Compress PDF implementation
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

async function compressPdf(
  file: File,
  quality: number = 0.6, // 0.0 to 1.0
  scale: number = 1.5    // render resolution multiplier
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;

    // Convert to JPEG with compression
    const jpegBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality);
    });
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

    // Get original page dimensions (in PDF points, not pixels)
    const originalViewport = page.getViewport({ scale: 1.0 });
    const pageWidth = originalViewport.width;
    const pageHeight = originalViewport.height;

    // Add compressed page
    const jpgImage = await newPdf.embedJpg(jpegBytes);
    const newPage = newPdf.addPage([pageWidth, pageHeight]);
    newPage.drawImage(jpgImage, {
      x: 0, y: 0,
      width: pageWidth,
      height: pageHeight,
    });
  }

  return newPdf.save();
}
```


## LIBRARIES TO USE

### pdf-lib (primary — for all PDF manipulation)
- npm: `pdf-lib`
- License: MIT
- Size: ~200KB (no native deps, pure JS)
- GitHub: https://github.com/Hopding/pdf-lib

**What pdf-lib CAN do:**
Create, merge, split, rotate, remove pages, reorder, embed images (JPG/PNG only), draw text/shapes, read/write metadata, fill forms, embed custom fonts.

**What pdf-lib CANNOT do:**
Compress/downsample images, render HTML to PDF, extract text, OCR, repair corrupted PDFs.

Key operations — CORRECT imports:
```typescript
import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
```

### pdf.js (for thumbnails, PDF→Images, compress pipeline)
- npm: `pdfjs-dist`
- License: Apache 2.0
- Size: ~2.5MB (large — MUST lazy-load)

**⚠️ CRITICAL: SvelteKit/Vite compatibility issues!**

pdf.js has known problems with Vite and SSR. Follow these rules:

**Rule 1: Browser-only import (prevent SSR crash)**
```typescript
// WRONG — crashes during SSR
import * as pdfjsLib from 'pdfjs-dist';

// CORRECT — dynamic import, browser only
let pdfjsLib: typeof import('pdfjs-dist');

async function loadPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
  }
  return pdfjsLib;
}
```

**Rule 2: Guard with SvelteKit `browser` check**
```typescript
import { browser } from '$app/environment';

// Only call pdf.js functions when in browser
if (browser) {
  const pdfjs = await loadPdfJs();
  // ... use pdfjs
}
```

**Rule 3: Use CDN worker (avoids Vite bundling issues)**
```typescript
// DO NOT try to import the worker from node_modules with Vite
// USE the CDN version — it just works
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
```

**Rule 4: Lazy-load pdf.js (it's 2.5MB)**
Only import pdfjs-dist when the user opens a tool that needs it (Split, Organize, PDF→Images, Compress). Do NOT import it on the PDF tools landing page.

**Rule 5: pdf.js pages are 1-indexed, pdf-lib is 0-indexed**
```typescript
// pdf.js: first page = getPage(1)
// pdf-lib: first page = getPage(0)
// When converting between them, always adjust: pdfJsPageNum - 1 = pdfLibPageIndex
```

### Drag & Drop for Organize tool
For the page reorder UI, use one of:
- **Option A: `svelte-dnd-action`** — Svelte-native drag & drop library (recommended)
  - npm: `svelte-dnd-action`
  - Install: `npm install svelte-dnd-action --legacy-peer-deps`
- **Option B: Manual up/down buttons** — Simpler, no extra dependency
  - Each thumbnail gets ↑ ↓ ✕ buttons to move or delete
  - Works everywhere, no drag issues on mobile


## UTILITY FUNCTIONS

```typescript
// src/lib/pdf/utils.ts

export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFileSize(file: File): { ok: boolean; warning?: string } {
  const MB = 1024 * 1024;
  if (file.size > 200 * MB) {
    return { ok: false, warning: 'File too large (>200MB). May cause browser to crash.' };
  }
  if (file.size > 50 * MB) {
    return { ok: true, warning: 'Large file (>50MB). Processing may take a while.' };
  }
  return { ok: true };
}

// pdf-lib only supports JPG and PNG — WEBP must be converted first
export async function convertWebpToPng(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl); // cleanup!
        if (!blob) return reject(new Error('Failed to convert WEBP'));
        blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf)));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
}

// Lazy pdf.js loader — call this instead of direct import
let _pdfjsLib: typeof import('pdfjs-dist') | null = null;

export async function getPdfJs(): Promise<typeof import('pdfjs-dist')> {
  if (_pdfjsLib) return _pdfjsLib;
  _pdfjsLib = await import('pdfjs-dist');
  _pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
  return _pdfjsLib;
}
```


## PROJECT STRUCTURE

```
src/routes/
├── pdf-tools/
│   ├── +page.svelte              ← Landing page (tool cards grid)
│   ├── merge/+page.svelte        ← Merge PDF
│   ├── split/+page.svelte        ← Split PDF (uses pdf.js thumbnails)
│   ├── rotate/+page.svelte       ← Rotate pages
│   ├── organize/+page.svelte     ← Organize/reorder (uses pdf.js + drag)
│   ├── images-to-pdf/+page.svelte ← Images to PDF
│   ├── pdf-to-images/+page.svelte ← PDF to images (uses pdf.js)
│   ├── compress/+page.svelte     ← Compress PDF (uses pdf.js + pdf-lib pipeline)
│   ├── watermark/+page.svelte    ← Add watermark
│   └── page-numbers/+page.svelte ← Add page numbers

src/lib/
├── pdf/
│   ├── merge.ts
│   ├── split.ts
│   ├── rotate.ts
│   ├── organize.ts
│   ├── images-to-pdf.ts
│   ├── pdf-to-images.ts          ← uses getPdfJs()
│   ├── compress.ts               ← uses getPdfJs() + pdf-lib pipeline
│   ├── watermark.ts
│   ├── page-numbers.ts
│   ├── thumbnails.ts             ← uses getPdfJs()
│   └── utils.ts                  ← download, validation, WEBP conversion, getPdfJs()
├── components/
│   └── pdf/
│       ├── PdfToolCard.svelte
│       ├── PdfUploader.svelte    ← accept=".pdf" filter
│       ├── PdfPageThumbnail.svelte
│       ├── PdfPageGrid.svelte    ← drag-and-drop or up/down buttons
│       └── PdfDownloader.svelte
```


## UI DESIGN GUIDELINES

### PDF Tools Landing Page (`/pdf-tools`)
- Hero: "PDF Tools — All processing happens on your device"
- Tool cards grid (2-3 columns desktop, 1 mobile)
- Group by category: "Organize" | "Convert" | "Edit"
- Each card: icon + name + one-line description + link
- Privacy footer: "Your files never leave your device"
- Do NOT import pdf.js on this page (it's just links)

### Individual Tool Pages
1. **Header** — Tool name + description
2. **Upload zone** — `accept=".pdf"` (or `accept="image/*"` for Images→PDF)
3. **File list** — Name, size, remove button
4. **Options** — Tool-specific (page range, quality level, rotation angle)
5. **Preview** — Page thumbnails where relevant (lazy-load pdf.js here)
6. **Action button** — `.btn.highlight` class
7. **Progress bar** — Show during processing
8. **Download** — Result download + file size
9. **Compress warning** — (Compress tool only) "Text will not be selectable"
10. **Privacy note** — "Your files never leave your device"

### Component Patterns
- Svelte 5 runes ($state, $derived, $effect) — NOT legacy stores
- Tailwind + CSS variables (--accent, --bg-panel, etc.)
- Always `onDestroy(() => URL.revokeObjectURL(...))`
- Always validate file size before processing
- Always try/catch with user-friendly error
- Always `input.value = ''` after reading files (allows re-adding same file)
- Use `{ ignoreEncryption: true }` on PDFDocument.load()


## NAVIGATION UPDATE

Add "PDF Tools" to navbar between "Convert" and "Settings":

Files to update:
- `src/lib/components/layout/Navbar/Base.svelte` — desktop nav
- Mobile navbar component (check which file handles mobile nav)
- Optionally add to `messages/en.json` for i18n


## INSTALL INSTRUCTIONS

```bash
cd C:\Users\user0\OneDrive\Documents\localconvert

# Required
npm install pdf-lib pdfjs-dist --legacy-peer-deps

# Optional: for drag & drop in Organize tool
npm install svelte-dnd-action --legacy-peer-deps
```

Test: `npm run dev`
Deploy: `git add . && git commit -m "Add PDF tools" && git push origin main`


## IMPORTANT TECHNICAL NOTES

1. **pdf.js MUST be lazy-loaded** — 2.5MB library, only load when needed
2. **pdf.js MUST use dynamic import** — SSR will crash with static import
3. **pdf.js Worker MUST use CDN** — Vite bundling of the worker causes issues
4. **pdf.js pages are 1-indexed** — pdf-lib is 0-indexed, always adjust
5. **WEBP not supported by pdf-lib** — convert via canvas first (see utils.ts)
6. **Encrypted PDFs** — use `PDFDocument.load(bytes, { ignoreEncryption: true })`
7. **Memory cleanup** — always `URL.revokeObjectURL()` in onDestroy
8. **File size limits** — warn >50MB, block >200MB
9. **Compress converts pages to images** — must warn user clearly
10. **AGPL compatibility** — pdf-lib (MIT) and pdf.js (Apache 2.0) are both compatible
11. **No cMaps needed** — for basic rendering, cMaps aren't required. Only needed for CJK (Chinese/Japanese/Korean) fonts. Skip for Phase A.
12. **pdfjs-dist version** — use 4.x (latest stable). The CDN worker URL must match the installed version.
