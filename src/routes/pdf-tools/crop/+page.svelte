<script lang="ts">
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { cropPdf, type PdfCropBox } from '$lib/pdf/crop';
	import { loadPdfDocument, renderDocPageToCanvas, type PdfDocProxy } from '$lib/pdf/preview';
	import { downloadPdf, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { CropIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { onDestroy } from 'svelte';
	import { m } from '$lib/paraglide/messages';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	// Page info
	let pageCount = $state(0);
	let pageWidth = $state(0);
	let pageHeight = $state(0);
	let displayW = $state(0);
	let displayH = $state(0);
	let pdfDoc = $state<PdfDocProxy | null>(null);

	// Preview
	let previewCanvas = $state<HTMLCanvasElement>();
	let previewContainer = $state<HTMLDivElement>();
	let baseImageData = $state<ImageData | null>(null);

	// Crop margins (PDF points from each edge)
	let marginLeft = $state(36);
	let marginRight = $state(36);
	let marginTop = $state(36);
	let marginBottom = $state(36);
	let applyToAll = $state(true);

	// Drag state
	type DragEdge = 'left' | 'right' | 'top' | 'bottom' | null;
	let dragEdge = $state<DragEdge>(null);
	let dragStartPos = $state(0);
	let dragStartMargin = $state(0);

	let lastFileRef: File | null = null;

	$effect(() => {
		const currentFile = files.length > 0 ? files[0] : null;
		if (currentFile === lastFileRef) return;
		lastFileRef = currentFile;
		if (!browser || !currentFile) {
			pdfDoc?.destroy();
			pdfDoc = null;
			pageCount = 0;
			baseImageData = null;
			resultBytes = null;
			return;
		}
		loadFile(currentFile);
	});

	onDestroy(() => { pdfDoc?.destroy(); });

	async function loadFile(file: File) {
		pdfDoc?.destroy();
		pdfDoc = null;
		try {
			const doc = await loadPdfDocument(file);
			if (lastFileRef !== file) { doc.destroy(); return; }
			pdfDoc = doc;
			pageCount = doc.numPages;
			await renderPage();
		} catch {
			if (lastFileRef !== file) return;
			error = m['tools_common.failed_read_pdf']();
		}
	}

	async function renderPage() {
		if (!pdfDoc) return;
		// Canvas might not be bound yet if Svelte hasn't flushed DOM — wait one frame
		if (!previewCanvas) {
			await new Promise((r) => requestAnimationFrame(r));
			if (!previewCanvas) return;
		}
		const dims = await renderDocPageToCanvas(pdfDoc, 1, previewCanvas, 0.5);
		pageWidth = dims.width;
		pageHeight = dims.height;

		const maxW = Math.min(500, (typeof window !== 'undefined' ? window.innerWidth : 500) - 48);
		const fitScale = Math.min(1, maxW / (previewCanvas.width));
		displayW = Math.round(previewCanvas.width * fitScale);
		displayH = Math.round(previewCanvas.height * fitScale);

		const ctx = previewCanvas.getContext('2d')!;
		baseImageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
		drawOverlay();
	}

	// Scale factor: display px → PDF points
	const pdfScale = $derived(pageWidth > 0 ? pageWidth / displayW : 1);

	// Display-space margins
	const dLeft = $derived(marginLeft / pdfScale);
	const dRight = $derived(marginRight / pdfScale);
	const dTop = $derived(marginTop / pdfScale);
	const dBottom = $derived(marginBottom / pdfScale);

	// Redraw overlay when margins change
	$effect(() => {
		void marginLeft; void marginRight; void marginTop; void marginBottom;
		drawOverlay();
	});

	function drawOverlay() {
		if (!previewCanvas || !baseImageData) return;
		const ctx = previewCanvas.getContext('2d')!;
		ctx.putImageData(baseImageData, 0, 0);

		const cw = previewCanvas.width;
		const ch = previewCanvas.height;
		const s = cw / pageWidth; // canvas px per PDF point
		const l = marginLeft * s;
		const r = marginRight * s;
		const t = marginTop * s;
		const b = marginBottom * s;

		// Dark overlay on trimmed regions
		ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
		ctx.fillRect(0, 0, cw, t);              // top
		ctx.fillRect(0, ch - b, cw, b);         // bottom
		ctx.fillRect(0, t, l, ch - t - b);      // left
		ctx.fillRect(cw - r, t, r, ch - t - b); // right

		// Crop border
		ctx.strokeStyle = '#0F6E56';
		ctx.lineWidth = 2;
		ctx.setLineDash([6, 3]);
		ctx.strokeRect(l, t, cw - l - r, ch - t - b);
		ctx.setLineDash([]);
	}

	// Drag handlers
	function getPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
		if (!previewContainer) return { x: 0, y: 0 };
		const rect = previewContainer.getBoundingClientRect();
		const pos = 'touches' in e && e.touches.length > 0 ? e.touches[0] : (e as MouseEvent);
		return { x: pos.clientX - rect.left, y: pos.clientY - rect.top };
	}

	function hitTestEdge(x: number, y: number): DragEdge {
		const threshold = 12;
		// Check edges of the crop rectangle
		if (Math.abs(x - dLeft) < threshold && y > dTop && y < displayH - dBottom) return 'left';
		if (Math.abs(x - (displayW - dRight)) < threshold && y > dTop && y < displayH - dBottom) return 'right';
		if (Math.abs(y - dTop) < threshold && x > dLeft && x < displayW - dRight) return 'top';
		if (Math.abs(y - (displayH - dBottom)) < threshold && x > dLeft && x < displayW - dRight) return 'bottom';
		return null;
	}

	function getCursor(edge: DragEdge): string {
		if (edge === 'left' || edge === 'right') return 'ew-resize';
		if (edge === 'top' || edge === 'bottom') return 'ns-resize';
		return 'default';
	}

	function onPointerDown(e: MouseEvent | TouchEvent) {
		if ('touches' in e) e.preventDefault();
		const pos = getPos(e);
		const edge = hitTestEdge(pos.x, pos.y);
		if (!edge) return;
		dragEdge = edge;
		dragStartPos = edge === 'left' || edge === 'right' ? pos.x : pos.y;
		dragStartMargin = edge === 'left' ? marginLeft : edge === 'right' ? marginRight : edge === 'top' ? marginTop : marginBottom;
	}

	function onPointerMove(e: MouseEvent | TouchEvent) {
		const pos = getPos(e);

		if (!dragEdge) {
			// Update cursor
			if (previewContainer) {
				const edge = hitTestEdge(pos.x, pos.y);
				previewContainer.style.cursor = getCursor(edge);
			}
			return;
		}

		if ('touches' in e) e.preventDefault();
		const current = dragEdge === 'left' || dragEdge === 'right' ? pos.x : pos.y;
		const delta = current - dragStartPos;
		const deltaPdf = Math.round(delta * pdfScale);

		const maxMargin = (dragEdge === 'left' || dragEdge === 'right') ? pageWidth / 2 - 10 : pageHeight / 2 - 10;

		if (dragEdge === 'left') {
			marginLeft = Math.max(0, Math.min(maxMargin, dragStartMargin + deltaPdf));
		} else if (dragEdge === 'right') {
			marginRight = Math.max(0, Math.min(maxMargin, dragStartMargin - deltaPdf));
		} else if (dragEdge === 'top') {
			marginTop = Math.max(0, Math.min(maxMargin, dragStartMargin + deltaPdf));
		} else if (dragEdge === 'bottom') {
			marginBottom = Math.max(0, Math.min(maxMargin, dragStartMargin - deltaPdf));
		}
	}

	function onPointerUp() {
		dragEdge = null;
	}

	function getCropBox(): PdfCropBox {
		return {
			left: marginLeft,
			bottom: marginBottom,
			right: pageWidth - marginRight,
			top: pageHeight - marginTop,
		};
	}

	async function apply() {
		if (files.length === 0) return;
		const box = getCropBox();
		if (box.right <= box.left || box.top <= box.bottom) {
			error = m['tool_pages.crop_pdf.err_margins']();
			return;
		}
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await cropPdf(files[0], box, applyToAll ? undefined : [0]);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tools_common.failed']();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, getOutputName(files[0].name, 'cropped', 'pdf'));
	}
</script>

<svelte:head>
	<title>Crop PDF — LocalConvert</title>
	<meta name="description" content="Crop PDF margins with draggable handles. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/crop/" />
	<meta property="og:title" content="Crop PDF — LocalConvert" />
	<meta property="og:description" content="Crop PDF margins with draggable handles. Free, private, no uploads — runs entirely in your browser." />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/crop/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Crop a PDF","step":[{"@type":"HowToStep","text":"Select a PDF file"},{"@type":"HowToStep","text":"Draw the crop area on the page preview"},{"@type":"HowToStep","text":"Apply the crop to selected or all pages"},{"@type":"HowToStep","text":"Save the cropped PDF"}]})}</script>`}
</svelte:head>

<div class="crop-page">
	<ToolPageHeader
		category="pdf"
		title={m['tool_pages.crop_pdf.title']()}
		description={m['tool_pages.crop_pdf.desc']()}
		icon={CropIcon}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<PdfUploader bind:files multiple={false} label={m['tools_common.upload_pdf']()} />

	{#if files.length > 0}
		<!-- Interactive preview -->
		<div class="preview-wrap" class:hidden={!baseImageData || displayW <= 0}>
			<div
				bind:this={previewContainer}
				class="preview-container"
				style="width: {displayW}px; max-width: 100%; height: {displayH}px;"
				onmousedown={onPointerDown}
				onmousemove={onPointerMove}
				onmouseup={onPointerUp}
				onmouseleave={onPointerUp}
				ontouchstart={onPointerDown}
				ontouchmove={onPointerMove}
				ontouchend={onPointerUp}
				ontouchcancel={onPointerUp}
				role="application"
				aria-label={m['tool_pages.crop_pdf.aria_drag']()}
			>
				<canvas bind:this={previewCanvas} class="preview-canvas"></canvas>

				<!-- Drag handle indicators -->
				<div class="handle handle-left" style="left: {Math.max(0, dLeft - 3)}px; top: {dTop + (displayH - dTop - dBottom) / 2 - 16}px;"></div>
				<div class="handle handle-right" style="right: {Math.max(0, dRight - 3)}px; top: {dTop + (displayH - dTop - dBottom) / 2 - 16}px;"></div>
				<div class="handle handle-top" style="top: {Math.max(0, dTop - 3)}px; left: {dLeft + (displayW - dLeft - dRight) / 2 - 16}px;"></div>
				<div class="handle handle-bottom" style="bottom: {Math.max(0, dBottom - 3)}px; left: {dLeft + (displayW - dLeft - dRight) / 2 - 16}px;"></div>
			</div>
			<p class="text-xs text-muted mt-2">
				{pageWidth} × {pageHeight} pt → {Math.max(0, pageWidth - marginLeft - marginRight)} × {Math.max(0, pageHeight - marginTop - marginBottom)} pt
				{pageCount > 1 ? ` — ${pageCount} pages` : ''}
			</p>
		</div>

		<!-- Margin inputs (synced with handles) -->
		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">{m['tools_common.left']()}</span>
				<input type="number" min={0} max={pageWidth / 2} bind:value={marginLeft} class="opt-input" aria-label="Left margin" />
				<span class="opt-label">{m['tools_common.right']()}</span>
				<input type="number" min={0} max={pageWidth / 2} bind:value={marginRight} class="opt-input" aria-label="Right margin" />
			</div>
			<div class="opt-row">
				<span class="opt-label">{m['tools_common.top']()}</span>
				<input type="number" min={0} max={pageHeight / 2} bind:value={marginTop} class="opt-input" aria-label="Top margin" />
				<span class="opt-label">{m['tools_common.bottom']()}</span>
				<input type="number" min={0} max={pageHeight / 2} bind:value={marginBottom} class="opt-input" aria-label="Bottom margin" />
			</div>
			{#if pageCount > 1}
				<label class="flex items-center gap-2 cursor-pointer text-sm">
					<input type="checkbox" bind:checked={applyToAll} />
					{m['tools_common.apply_all_pages']()}
				</label>
			{/if}
		</div>

		<button class="btn highlight" disabled={processing} onclick={apply}>
			{processing ? m['tool_pages.crop_pdf.btn_busy']() : m['tool_pages.crop_pdf.btn']()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{m['tools_common.ready']()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{m['tool_pages.crop_pdf.save']()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style>
	.crop-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 3.5rem; flex-shrink: 0; }
	.opt-input {
		width: 5rem; padding: 0.375rem 0.5rem; border-radius: 0.5rem; font-size: 0.875rem;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.opt-input:focus { outline: 1.5px solid var(--accent); }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }

	/* Preview */
	.preview-wrap { display: flex; flex-direction: column; align-items: center; }
	.preview-container {
		position: relative; user-select: none; -webkit-user-select: none; touch-action: none;
		border-radius: 0.5rem; overflow: hidden; box-shadow: var(--shadow-panel);
	}
	.preview-canvas { display: block; width: 100%; height: 100%; }

	/* Edge handles */
	.handle {
		position: absolute; pointer-events: none; z-index: 10;
		background: white; border: 2px solid var(--accent, #0F6E56);
		border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
	}
	.handle-left, .handle-right { width: 6px; height: 32px; }
	.handle-top, .handle-bottom { width: 32px; height: 6px; }
</style>
