# LocalConvert — Claude Code Context
# =====================================
# Use this as context when working with Claude Code in VS Code
# Last updated: March 24, 2026
# =====================================


## PROJECT OVERVIEW

LocalConvert is a privacy-first file converter forked from VERT.sh (AGPL-3.0). All conversions run locally in the browser via WASM — files never touch a server. Live at https://localconvert.app.

**Tech Stack:**
- Frontend: SvelteKit + TypeScript + Tailwind CSS
- Hosting: Cloudflare Pages (auto-deploy on git push)
- Image engine: @imagemagick/magick-wasm
- Audio/Video (CPU): @ffmpeg/core@0.12.10 (WASM, CDN-loaded)
- Video (GPU): Mediabunny + web-demuxer (WebCodecs API)
- Documents: Pandoc WASM (hosted on R2, 50MB)
- WASM hosting: Cloudflare R2 bucket `localconvert-assets`
- State: Svelte 5 runes ($state, $derived)
- i18n: Paraglide (English only)
- PWA: manifest.json + sw.js + beforeinstallprompt capture
- CSS: SCSS with CSS variables for theming (light/dark mode)
- Styling: Tailwind + custom CSS variables in app.scss

**Repository:** github.com/Sp3llC0d3/localconvert
**Domain:** localconvert.app (Cloudflare)
**Deploy:** `git push origin main` → Cloudflare auto-builds
**Build command:** `npm install --legacy-peer-deps && npm run build`
**Local dev:** `npm run dev` → http://localhost:5174/


## WHAT'S BEEN COMPLETED

### Phase 0 — Fork & Verification ✅
- VERT daemon (vertd) removed — all server-side code stripped
- All converters working: image (ImageMagick), audio/video (FFmpeg), documents (Pandoc)
- GPU-accelerated video via Mediabunny + web-demuxer (WebCodecs)
- Deployed to Cloudflare Pages with custom domain

### Phase 1 — Deploy & Rebrand ✅
- Full rebrand: LocalConvert name, logo, messages, footer, about page
- PWA install button (Chrome/Edge/Brave) + iOS Safari banner
- Service worker caching WASM files
- AGPL compliance (VERT attribution in footer)

### Phase 2 — Theme & Brand Assets ✅ (COMPLETE)
- [x] New shield logo with conversion arrows (Logo.svelte)
- [x] Teal/green color theme replacing VERT's pink (app.scss fully updated)
- [x] 20 AI-generated brand images (icons, OG, backgrounds, illustrations)
- [x] Updated manifest.json (teal theme, new icons)
- [x] Updated app.html (new favicon references)
- [x] Updated +layout.svelte (og-image.png, theme-color #0F6E56)
- [x] favicon.svg + favicon.png + icon-192 + icon-512 + icon-maskable-512
- [x] Deleted old VERT files (lettermark.jpg, lettermark_maskable.png, VERT_Feature.webp)
- [x] New landing page — hero (bg-dark.png background), feature pills, How It Works (step images), supported formats, privacy section (privacy-badge.png), FAQ accordion
- [x] 404 page using error-404.png; conversion error state using error-conversion.png
- [x] SEO converter pages — /[format]-converter with hero, steps, format chips, privacy strip, FAQ (src/routes/[converter]/+page.svelte + +page.ts)
- [x] Mobile-responsive design throughout


## COLOR THEME

The theme uses teal/green colors. CSS variable NAMES are still `--accent-pink`, `--accent-blue`, etc. (kept for compatibility with dozens of files) but VALUES are all teal/green.

### Light Mode
| Purpose | Variable | Value | Hex |
|---|---|---|---|
| Primary | --accent-pink | hsl(158, 75%, 34%) | #0F6E56 |
| Accent | --accent-green | hsl(155, 68%, 37%) | #1D9E75 |
| Light | --accent-red | hsl(158, 60%, 58%) | #5DCAA5 |
| Dark | --accent-purple | hsl(164, 80%, 17%) | #085041 |
| Surface | --bg-badge | hsl(160, 40%, 95%) | #E1F5EE |
| Text on accent | --fg-on-accent | hsl(160, 40%, 95%) | #E1F5EE |
| Text on badge | --fg-on-badge | hsl(164, 80%, 17%) | #085041 |

### Dark Mode
| Purpose | Variable | Value | Hex |
|---|---|---|---|
| Primary | --accent-pink | hsl(158, 60%, 58%) | #5DCAA5 |
| Accent | --accent-green | hsl(155, 68%, 37%) | #1D9E75 |
| Dark accent | --accent-purple-alt | hsl(164, 80%, 17%) | #085041 |
| Background | --bg | hsl(0, 0%, 7%) | #111111 |
| Panel | --bg-panel | hsl(160, 4%, 18%) | dark with teal tint |
| Badge | --bg-badge | hsl(164, 80%, 17%) | #085041 |


## KEY FILE PATHS

### Core Files
- `src/lib/css/app.scss` — All CSS variables (theme colors, gradients)
- `src/routes/+page.svelte` — Home page
- `src/routes/+layout.svelte` — Root layout (meta tags, OG image, theme)
- `src/routes/convert/+page.svelte` — Converter page
- `src/app.html` — HTML shell (favicon, PWA capture)
- `tailwind.config.ts` — Tailwind custom colors/plugins

### Converters
- `src/lib/converters/ffmpeg.svelte.ts` — FFmpeg + WebCodecs GPU converter
- `src/lib/converters/magick.svelte.ts` — ImageMagick WASM image converter
- `src/lib/converters/pandoc.svelte.ts` — Pandoc WASM document converter
- `src/lib/converters/index.ts` — Converter registry

### Components
- `src/lib/components/visual/svg/Logo.svelte` — Shield logo (SVG)
- `src/lib/components/layout/Navbar/Base.svelte` — Navbar with install button
- `src/lib/components/layout/IOSInstallBanner.svelte` — iOS install banner
- `src/lib/components/layout/Footer.svelte` — Footer with VERT attribution
- `src/lib/components/functional/Uploader.svelte` — File upload component

### Static Files
- `static/manifest.json` — PWA manifest
- `static/sw.js` — Service worker
- `static/_headers` — Cloudflare headers
- `static/web-demuxer.wasm` — web-demuxer WASM file
- `static/favicon.svg` — SVG favicon
- `static/favicon.png` — 64px PNG favicon
- `static/icon-192.png` — PWA icon 192px
- `static/icon-512.png` — PWA icon 512px
- `static/icon-maskable-512.png` — PWA maskable icon
- `static/apple-splash.png` — iOS splash screen
- `static/bg-dark.png` — Hero background (aurora style)
- `static/bg-mesh.png` — Hero background (geometric mesh)

### Brand Assets (src/lib/assets/)
- `og-image.png` — Primary OG image for social sharing
- `og-image-browser.png` — Alternative OG with browser mockup
- `dropzone-light.png` — Upload zone illustration (light mode)
- `dropzone-dark.png` — Upload zone illustration (dark mode)
- `privacy-badge.png` — Privacy trust badge
- `icons/icon-images.png` — Category: Images
- `icons/icon-video.png` — Category: Video
- `icons/icon-audio.png` — Category: Audio
- `icons/icon-documents.png` — Category: Documents
- `steps/step-1-choose.png` — How it works: Choose file
- `steps/step-2-convert.png` — How it works: Converting
- `steps/step-3-download.png` — How it works: Download
- `errors/error-404.png` — 404 page illustration
- `errors/error-conversion.png` — Conversion error illustration

### Config
- `.env` — Environment variables (PUB_ prefixed)
- `.npmrc` — npm config (legacy-peer-deps=true)
- `messages/en.json` — English translations (i18n)
- `src/lib/util/consts.ts` — VERT_NAME = "LocalConvert", GitHub URL, etc.


## IMPORTANT NOTES

1. **AGPL License** — Must keep VERT attribution in footer. Source link required.
2. **Legacy peer deps** — Always use `npm install --legacy-peer-deps` or builds fail.
3. **COOP/COEP headers removed** — Broke CDN WASM loading. SharedArrayBuffer disabled.
4. **CSS variable names ≠ colors** — `--accent-pink` is actually teal (#0F6E56). Names kept for compatibility.
5. **Pandoc WASM on R2** — 50MB file at `https://pub-a63702e42341425494caded68a9378bd.r2.dev`
6. **web-demuxer needs absolute URL** — `${window.location.origin}/web-demuxer.wasm`
7. **Svelte 5 runes** — Project uses $state, $derived, $effect, $props (not legacy stores)
8. **No network in Claude Code containers** — Cannot npm install or fetch. Work with existing files.
9. **Deploy** — Just `git push origin main` — Cloudflare auto-builds and deploys.
10. **Dark mode** — Uses class-based (.light / .dark) + prefers-color-scheme media query.


## NEXT PRIORITY: Phase 4 — PDF Enhancement

### Phase 3 — Quality Controls ✅ COMPLETE

Per-file inline controls added to each file card in `/convert`:

- **Images**: Quality slider (1–100%, overrides global setting) + Resize (W×H px)
- **Audio**: Bitrate dropdown (Auto/320/256/192/128/96/64/32 kbps) + Trim (start→end seconds)
- **Video**: Trim (start→end seconds)

**Implementation details:**
- `VertFile` has 6 new reactive states: `optQuality`, `optBitrate`, `optTrimStart`, `optTrimEnd`, `optWidth`, `optHeight`
- `null` = inherit from global settings; concrete value = per-file override
- FFmpeg trim uses `-ss {start}` before `-i` (fast seek) + `-to {end}` after codec args
- Magick worker receives `resize: {width, height} | null` in the WorkerMessage
- Card layout: preview wrapper is now the `relative` containing block (h-152px), options strip renders below in normal flow
- Grid changed from `auto-rows-[240px]` to `auto-rows-auto`; empty uploader gets `min-h-[240px]`

### Phase 4 — PDF Enhancement (next)

- pdf-lib: merge/split PDFs
- DOCX→PDF (Pandoc already supports this)
- PDF page picker


## FUTURE PHASES (for reference only)

- Phase 3: Quality controls (bitrate, resize, trim, compression slider)
- Phase 4: PDF enhancement (pdf-lib, merge/split, DOCX→PDF)
- Phase 5: Ad monetization (AdSense, needs 500+ visitors/month first)
- Phase 6: Desktop app (Tauri v2, native FFmpeg, ad-free)
- Phase 7: Mobile app (Tauri v2 or React Native, AdMob)
- Phase 8: SEO & Polish (format-pair pages, schema markup, Product Hunt launch)
