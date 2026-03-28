# Product Hunt Launch — LocalConvert
# Preparation document for Product Hunt submission


## Tagline (60 char max)
Free file converter that never touches your files


## Description

LocalConvert converts images, audio, video, documents, and PDFs entirely in your browser. No uploads, no server, no accounts. Your files never leave your device.

**Why LocalConvert?**

Most file converters upload your files to a server, process them remotely, and send them back. That's slow, risky, and unnecessary. LocalConvert uses WebAssembly (ImageMagick, FFmpeg, Pandoc) to do everything client-side.

**What it does:**

- **Convert** 200+ format combinations — images (60+ formats), audio, video, documents
- **16 PDF tools** — merge, split, rotate, organize, compress, watermark, page numbers, crop, sign, edit text, password protect, unlock, images-to-PDF, PDF-to-images, PDF-to-PowerPoint, metadata editor
- **7 image tools** — rotate, crop (with circle mode), watermark, meme generator, batch processing, QR code generator, color picker
- **Live previews** — see watermarks, page numbers, meme text, and rotations update in real-time
- **Interactive editing** — click to place text on PDFs, drag signatures, drag-and-drop page reordering
- **Undo/redo** — Ctrl+Z with keyboard shortcuts on PDF editing tools
- **Before/after slider** — compare original and edited images with a draggable divider
- **16 languages** — Arabic, German, Spanish, French, Japanese, Korean, Chinese, and more
- **PWA** — install as a desktop or mobile app

**Built with:**
- SvelteKit + Svelte 5
- ImageMagick WASM, FFmpeg WASM, Pandoc WASM
- pdf-lib + pdf.js for PDF tools
- Tailwind CSS with dark mode
- Deployed on Cloudflare Pages

**Open source** (AGPL-3.0) — forked from VERT.sh with full attribution.


## First Comment (Maker's Comment)

Hey Product Hunt!

I built LocalConvert because I was tired of file converters that upload my files to unknown servers. Every time I needed to compress a PDF or convert a HEIC photo, I had to trust some random website with my files.

LocalConvert runs 100% in your browser using WebAssembly. Your files literally never leave your device — there's no server to upload to.

It started as a simple converter but grew into a full toolkit: 16 PDF tools, 7 image tools, live previews, interactive editing, and support for 200+ format combinations.

Some features I'm most proud of:
- The live canvas preview that updates watermarks and meme text as you type
- Click-to-place text editing on PDFs with undo/redo
- Circle crop with transparent PNG output
- Before/after comparison slider for image edits
- Drag-and-drop page reordering for PDFs

It's completely free, open source, and works offline once loaded. I'd love to hear what you think and what tools you'd want to see next!


## Feature Bullets (for the listing)

1. Convert 200+ format combinations — images, audio, video, documents
2. 16 PDF tools — merge, split, compress, watermark, sign, edit, and more
3. 7 image tools — crop, rotate, watermark, meme generator, QR codes
4. 100% browser-based — your files never leave your device
5. Live previews and interactive editing with undo/redo
6. Works offline as a PWA — install on desktop or mobile
7. 16 languages, dark mode, fully accessible
8. Free and open source (AGPL-3.0)


## Topics/Categories
- Productivity
- Developer Tools
- Privacy
- Design Tools
- Open Source


## Screenshots Needed (5 max)

1. **Home page** — hero section showing the privacy-first message + format support
2. **PDF Tools landing** — grid of 16 tool cards with category colors
3. **Live preview** — PDF watermark tool showing real-time canvas update
4. **Image crop** — interactive crop with handles, circle mode, rule-of-thirds grid
5. **Before/after** — the comparison slider showing original vs watermarked image


## Social Share Text

**Twitter/X:**
Just launched LocalConvert on Product Hunt! A free file converter that runs entirely in your browser — no uploads, no server. Convert 200+ formats, edit PDFs, create memes, generate QR codes. All private. localconvert.app

**LinkedIn:**
Excited to share LocalConvert — a privacy-first file converter I built that processes everything in your browser using WebAssembly. No file uploads, no server processing. 16 PDF tools, 7 image tools, 200+ format combinations. Free and open source.
