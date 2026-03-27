# LocalConvert — PDF Tools Reference
# ==================================================================
# Reference for working on PDF tools in LocalConvert
# Last updated: March 27, 2026
# ==================================================================


## STATUS

### Implemented ✅ (8 tools live at `/pdf-tools`)
1. **Merge PDF** — Combine multiple PDFs into one
2. **Split PDF** — Extract pages/ranges (pdf.js thumbnails)
3. **Rotate Pages** — Rotate individual or all pages (90/180/270)
4. **Organize Pages** — Reorder/delete pages (up/down arrows, pdf.js thumbnails)
5. **Images → PDF** — Convert JPG/PNG/WEBP to PDF
6. **PDF → Images** — Export pages as PNG/JPG (pdf.js canvas)
7. **Compress PDF** — pdf.js → canvas → JPEG → pdf-lib rebuild
8. **Add Watermark** — Text or image watermark on pages

### Not Yet Implemented
9. **Page Numbers** — Add page numbers to PDF (straightforward with pdf-lib)
10. **PDF Metadata** — Edit title, author, subject, keywords (straightforward with pdf-lib)
11. **Sign PDF** — Draw/upload/type signature, place on page (complex: canvas overlay + PDF sync)

### Deferred — Do NOT implement
- **DOCX → PDF** — Would need Puppeteer (server-side only)
- **PDF → Word** — Requires OCR + layout reconstruction
- **PDF → Excel** — Requires table detection
- **Repair PDF** — Beyond pdf-lib capabilities


## ARCHITECTURE

### File Structure
```
src/routes/pdf-tools/
├── +page.svelte              ← Landing page (tool cards grid)
├── _shared.postcss           ← Shared styles for PDF tool pages
├── merge/+page.svelte
├── split/+page.svelte
├── rotate/+page.svelte
├── organize/+page.svelte
├── images-to-pdf/+page.svelte
├── pdf-to-images/+page.svelte
├── compress/+page.svelte
└── watermark/+page.svelte

src/lib/pdf/
├── merge.ts
├── split.ts
├── rotate.ts
├── organize.ts
├── images-to-pdf.ts
├── pdf-to-images.ts          ← uses getPdfJs()
├── compress.ts               ← uses getPdfJs() + pdf-lib pipeline
├── watermark.ts
├── thumbnails.ts             ← uses getPdfJs()
└── utils.ts                  ← downloadPdf, downloadBlob, formatFileSize, validateFileSize, convertWebpToPng, getPdfJs

src/lib/components/pdf/
├── PdfUploader.svelte        ← accept=".pdf" file input
└── PdfPageThumbnail.svelte   ← Single page thumbnail via pdf.js
```

### Libraries
- **pdf-lib** (MIT, ~200KB) — Create, merge, split, rotate, reorder, embed images, draw text/shapes, metadata
- **pdfjs-dist** 5.x (Apache 2.0, ~2.5MB) — Render pages to canvas, thumbnails. MUST be lazy-loaded.

### pdf.js Rules (SvelteKit/Vite compatibility)
1. **Browser-only** — Dynamic import only, never static import (SSR crash)
2. **Use `getPdfJs()` from `src/lib/pdf/utils.ts`** — Handles lazy loading + worker setup
3. **CDN worker** — Do not bundle the worker via Vite
4. **1-indexed pages** — pdf.js `getPage(1)` = pdf-lib `getPage(0)`
5. **Only load when needed** — Don't import on the landing page

### Compress Strategy
pdf-lib cannot compress. The pipeline is: pdf.js renders each page to canvas → `canvas.toBlob('image/jpeg', quality)` → pdf-lib embeds JPEG into new PDF.

**Warning displayed to users:** Compressed PDFs become image-only — no selectable text, no links, no form fields.

Compression levels:
- Low (0.9): ~20-40% reduction
- Medium (0.6): ~50-70% reduction
- High (0.3): ~70-90% reduction

### Component Patterns
- Svelte 5 runes ($state, $derived, $effect)
- `{ ignoreEncryption: true }` on `PDFDocument.load()`
- `input.value = ''` after reading files (allows re-adding same file)
- `URL.revokeObjectURL()` cleanup in onDestroy
- File size: warn >50MB, block >200MB
- pdf-lib only supports JPG/PNG — WEBP must be converted via canvas first (`convertWebpToPng`)


## TECHNICAL NOTES

1. **AGPL compatibility** — pdf-lib (MIT) and pdf.js (Apache 2.0) are both AGPL-compatible
2. **No cMaps needed** — Only needed for CJK fonts, not required for basic rendering
3. **pdfjs-dist 5.x** — CDN worker URL must match installed version
4. **Navbar** — "PDF Tools" entry uses FileTextIcon, positioned between Convert and Settings
5. **Category colors on landing page** — Tool icons use green (Organize), blue (Convert), red (Edit) per category
