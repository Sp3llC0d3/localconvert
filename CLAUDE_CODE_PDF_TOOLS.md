# LocalConvert — PDF & Image Tools Reference
# ==================================================================
# Reference for working on PDF and image tools in LocalConvert
# Last updated: March 27, 2026
# ==================================================================


## PDF TOOLS — 15 tools at `/pdf-tools`

### Organize (green category)
1. **Merge PDF** — merge.ts — Combine multiple PDFs
2. **Split PDF** — split.ts — Extract pages/ranges (thumbnail selection)
3. **Rotate Pages** — rotate.ts — Rotate with visual indicators on thumbnails
4. **Organize Pages** — organize.ts — Reorder/delete with arrow buttons

### Convert (blue category)
5. **Images → PDF** — images-to-pdf.ts — Create PDF from images
6. **PDF → Images** — pdf-to-images.ts — Export pages as PNG/JPG
7. **PDF → PowerPoint** — pdf-to-ppt.ts — pptxgenjs, each page becomes a slide

### Optimize & Edit (red category)
8. **Compress PDF** — compress.ts — pdf.js → canvas → JPEG → pdf-lib. Before/after comparison view
9. **Add Watermark** — watermark.ts — **Live canvas preview**, page navigation
10. **Add Page Numbers** — page-numbers.ts — **Live canvas preview**, 6 positions, 4 formats
11. **Edit Metadata** — metadata.ts — View/edit title, author, subject, keywords
12. **Crop PDF** — crop.ts — **Draggable edge handles** synced with number inputs
13. **Sign PDF** — sign.ts — Draw/type/upload signature, **click-to-place** on page, draggable
14. **Edit PDF** — edit.ts — **Click-to-place** text, drag, **undo/redo**, keyboard shortcuts
15. **Password Protect** — password.ts — AES encryption via pdf-lib-plus-encrypt, permissions UI


## IMAGE TOOLS — 4 tools at `/image-tools`

1. **Rotate Image** — image/rotate.ts — 90/180/270°, **live canvas preview**
2. **Crop Image** — image/crop.ts — **Interactive handles**, aspect ratios, circle crop with transparent PNG
3. **Watermark Image** — image/watermark.ts — Center/tile, **live canvas preview**
4. **Meme Generator** — image/meme.ts — Impact font, **live canvas preview** on keystroke


## ARCHITECTURE

### File Structure
```
src/lib/pdf/
├── merge.ts, split.ts, rotate.ts, organize.ts
├── images-to-pdf.ts, pdf-to-images.ts, pdf-to-ppt.ts
├── compress.ts, watermark.ts, page-numbers.ts
├── metadata.ts, crop.ts, sign.ts, edit.ts, password.ts
├── thumbnails.ts          ← renders all pages as data URL thumbnails
├── preview.ts             ← loadPdfDocument + renderDocPageToCanvas (single-parse)
└── utils.ts               ← downloadPdf, downloadBlob, formatFileSize, validateFileSize, getPdfJs

src/lib/image/
├── rotate.ts, crop.ts, watermark.ts, meme.ts
└── utils.ts               ← loadImage, canvasToBlob, downloadBlob, validateImageSize

src/lib/util/
└── history.svelte.ts      ← createHistory<T>() — generic undo/redo (max 50 snapshots)

src/lib/components/pdf/
├── PdfUploader.svelte     ← accept=".pdf" file input with drag-drop
└── PdfPageThumbnail.svelte

src/lib/components/image/
└── ImageUploader.svelte   ← accept="image/*" with type + size validation

src/routes/pdf-tools/      ← 15 tool routes + landing page
src/routes/image-tools/    ← 4 tool routes + landing page
```

### Libraries
- **pdf-lib** (MIT, ~200KB) — Create, merge, split, rotate, reorder, embed images, draw text/shapes, metadata
- **pdf-lib-plus-encrypt** (MIT) — Fork with AES encryption support for password protection
- **pdfjs-dist** 5.x (Apache 2.0, ~2.5MB) — Render pages to canvas. MUST be lazy-loaded
- **pptxgenjs** (MIT, ~500KB) — Generate PowerPoint files in the browser

### Interactive Patterns

**Live Canvas Preview (watermark, page-numbers, image tools):**
- Load PDF document once via `loadPdfDocument()`, reuse for page navigation
- Render page to canvas via `renderDocPageToCanvas()` at scale 0.5
- Cache base rendering as `ImageData` via `ctx.getImageData()`
- On settings change: `$effect` → `requestAnimationFrame` → `ctx.putImageData()` + draw overlay
- `onDestroy` cancels pending rAF and calls `doc.destroy()`

**Click-to-Place (edit, sign):**
- Render page as image, overlay transparent container
- Ghost element follows cursor (opacity 0.4) before placement
- Click places element, drag repositions via CSS position updates
- Coordinate conversion: `displayPx * (pageWidth / displayW)` and Y-axis flip for PDF

**Undo/Redo (edit):**
- `createHistory<PlacedText[]>([])` — snapshot-based, structuredClone, max 50
- Push on place, drag-end, delete. Arrow nudge pushes with 300ms debounce
- Ctrl+Z / Ctrl+Shift+Z, Delete, Escape, Arrow keys

**Draggable Handles (PDF crop):**
- 4 edge handles positioned in display-space, hit-test with 12px threshold
- Drag delta converted to PDF points via `delta * pdfScale`
- Number inputs stay bidirectionally synced
- Dark overlay drawn on canvas for trimmed regions


## TECHNICAL NOTES

1. **pdf-lib + pdf-lib-plus-encrypt coexist** — Separate imports, no conflict
2. **pdf.js pages are 1-indexed, pdf-lib is 0-indexed** — Always adjust
3. **pdf.js MUST be lazy-loaded** — Use `getPdfJs()` or `loadPdfDocument()`
4. **pdf.js Worker from CDN** — URL auto-matches installed version
5. **Svelte scoped CSS** — Cannot style Panel's div from Base.svelte. Use Tailwind utilities for cross-component styling
6. **Image tools validate file size** — >100MB blocked, >20MB warned
7. **WEBP not supported by pdf-lib** — Convert via canvas first (`convertWebpToPng`)
8. **Encrypted PDFs** — Use `{ ignoreEncryption: true }` on `PDFDocument.load()`
9. **Compress warning** — Must warn that text becomes non-selectable
10. **JSON-LD** — Present on image-tools pages. Follow existing pattern for new tools
11. **Sitemap** — 207 URLs. Update `scripts/generate-sitemap.js` when adding new routes
12. **All 16 locales must stay synced** — Use `scripts/add-translations.cjs` pattern for batch updates
