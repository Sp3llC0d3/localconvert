<script lang="ts">
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { addWatermark } from '$lib/pdf/watermark';
	import { loadPdfDocument, renderDocPageToCanvas, type PdfDocProxy } from '$lib/pdf/preview';
	import { downloadPdf, formatFileSize } from '$lib/pdf/utils';
	import { PenLineIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-svelte';
	import { onDestroy } from 'svelte';

	let files = $state<File[]>([]);
	let text = $state('CONFIDENTIAL');
	let opacity = $state(30);
	let fontSize = $state(60);
	let rotation = $state(45);
	let position = $state<'center' | 'tile'>('center');
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	// Preview state
	let previewCanvas = $state<HTMLCanvasElement>();
	let pageCount = $state(0);
	let currentPage = $state(1);
	let pageWidth = $state(0);
	let pageHeight = $state(0);
	let baseImageData = $state<ImageData | null>(null);
	let pdfDoc = $state<PdfDocProxy | null>(null);
	let rafId: number | null = null;

	$effect(() => {
		if (!browser || files.length === 0) {
			pageCount = 0;
			baseImageData = null;
			resultBytes = null;
			pdfDoc?.destroy();
			pdfDoc = null;
			return;
		}
		loadFile();
	});

	async function loadFile() {
		pdfDoc?.destroy();
		try {
			pdfDoc = await loadPdfDocument(files[0]);
			pageCount = pdfDoc.numPages;
			currentPage = 1;
			await renderCurrentPage();
		} catch {
			error = 'Failed to read PDF.';
		}
	}

	async function renderCurrentPage() {
		if (!previewCanvas || !pdfDoc) return;
		const dims = await renderDocPageToCanvas(pdfDoc, currentPage, previewCanvas, 0.5);
		pageWidth = dims.width;
		pageHeight = dims.height;
		const ctx = previewCanvas.getContext('2d')!;
		baseImageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
		drawWatermarkOverlay();
	}

	// Live preview: redraw watermark on every option change
	$effect(() => {
		void text; void opacity; void fontSize; void rotation; void position;
		if (!previewCanvas || !baseImageData) return;
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			drawWatermarkOverlay();
			rafId = null;
		});
	});

	onDestroy(() => {
		if (rafId !== null) cancelAnimationFrame(rafId);
		pdfDoc?.destroy();
	});

	function drawWatermarkOverlay() {
		if (!previewCanvas || !baseImageData) return;
		const ctx = previewCanvas.getContext('2d')!;

		// Restore base page (no re-render needed)
		ctx.putImageData(baseImageData, 0, 0);

		if (!text.trim()) return;

		const scale = previewCanvas.width / pageWidth;
		const scaledFontSize = fontSize * scale;

		ctx.globalAlpha = opacity / 100;
		ctx.fillStyle = '#888888';
		ctx.font = `bold ${scaledFontSize}px sans-serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		const cw = previewCanvas.width;
		const ch = previewCanvas.height;

		if (position === 'tile') {
			const metric = ctx.measureText(text);
			const tileW = metric.width + 60 * scale;
			const tileH = scaledFontSize * 3;
			for (let y = -ch; y < ch * 2; y += tileH) {
				for (let x = -cw; x < cw * 2; x += tileW) {
					ctx.save();
					ctx.translate(x, y);
					ctx.rotate((rotation * Math.PI) / 180);
					ctx.fillText(text, 0, 0);
					ctx.restore();
				}
			}
		} else {
			ctx.save();
			ctx.translate(cw / 2, ch / 2);
			ctx.rotate((rotation * Math.PI) / 180);
			ctx.fillText(text, 0, 0);
			ctx.restore();
		}
		ctx.globalAlpha = 1;
	}

	function prevPage() {
		if (currentPage > 1) { currentPage--; renderCurrentPage(); }
	}
	function nextPage() {
		if (currentPage < pageCount) { currentPage++; renderCurrentPage(); }
	}

	async function apply() {
		if (files.length === 0) { error = 'Add a PDF file.'; return; }
		if (!text.trim()) { error = 'Enter watermark text.'; return; }
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await addWatermark(files[0], {
				text: text.trim(),
				opacity: opacity / 100,
				fontSize,
				rotation,
				position,
			});
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed.';
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, files[0].name.replace(/\.pdf$/i, '_watermarked.pdf'));
	}
</script>

<svelte:head>
	<title>Add Watermark to PDF — LocalConvert</title>
	<meta name="description" content="Stamp custom text on every page of a PDF. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/watermark/" />
</svelte:head>

<div class="wm-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">← PDF Tools</a>
	<div class="wm-header">
		<PenLineIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Add Watermark</h1>
			<p class="text-sm text-muted">Adjust settings and see the watermark live on the page.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

	{#if files.length > 0}
		<!-- Live preview -->
		<div class="preview-wrap">
			<canvas bind:this={previewCanvas} class="preview-canvas"></canvas>
			{#if pageCount > 1}
				<div class="page-nav">
					<button class="nav-btn" onclick={prevPage} disabled={currentPage <= 1} aria-label="Previous page">
						<ChevronLeftIcon size={16} />
					</button>
					<span class="text-xs text-muted">Page {currentPage} / {pageCount}</span>
					<button class="nav-btn" onclick={nextPage} disabled={currentPage >= pageCount} aria-label="Next page">
						<ChevronRightIcon size={16} />
					</button>
				</div>
			{/if}
		</div>

		<!-- Options -->
		<div class="opt-section">
			<div class="opt-row">
				<label class="opt-label" for="wm-text">Text</label>
				<input id="wm-text" type="text" bind:value={text} placeholder="CONFIDENTIAL" class="opt-input" maxlength={80} />
			</div>
			<div class="opt-row">
				<span class="opt-label">Opacity</span>
				<input type="range" min={5} max={80} bind:value={opacity} class="slider flex-1" aria-label="Opacity" />
				<span class="val">{opacity}%</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">Font size</span>
				<input type="range" min={20} max={120} bind:value={fontSize} class="slider flex-1" aria-label="Font size" />
				<span class="val">{fontSize}pt</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">Rotation</span>
				<input type="range" min={0} max={90} bind:value={rotation} class="slider flex-1" aria-label="Rotation" />
				<span class="val">{rotation}°</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">Position</span>
				<div class="flex gap-2">
					<button class="btn text-sm px-3 py-1.5 {position === 'center' ? 'highlight' : ''}" onclick={() => position = 'center'}>Center</button>
					<button class="btn text-sm px-3 py-1.5 {position === 'tile' ? 'highlight' : ''}" onclick={() => position = 'tile'}>Tile</button>
				</div>
			</div>
		</div>

		<button class="btn highlight" disabled={processing || !text.trim()} onclick={apply}>
			{processing ? 'Applying…' : 'Apply to all pages'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>Save watermarked PDF</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style>
	.wm-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.wm-header { display: flex; align-items: center; gap: 0.75rem; }
	.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 5rem; flex-shrink: 0; }
	.opt-input { border-radius: 0.5rem; padding: 0.375rem 0.75rem; font-size: 0.875rem; border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg); flex: 1; }
	.opt-input:focus { outline: 1.5px solid var(--accent); }
	.slider { height: 6px; appearance: none; border-radius: 9999px; cursor: pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.val { font-size: 0.8125rem; color: var(--fg-muted); width: 2.5rem; text-align: right; flex-shrink: 0; }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.preview-wrap { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
	.preview-canvas { max-width: 100%; max-height: 28rem; border-radius: 0.5rem; box-shadow: var(--shadow-panel); }
	.page-nav { display: flex; align-items: center; gap: 0.75rem; }
	.nav-btn {
		display: flex; align-items: center; justify-content: center;
		width: 1.75rem; height: 1.75rem; border-radius: 0.375rem;
		border: 1px solid var(--bg-separator); background: var(--bg-panel);
		cursor: pointer; color: inherit;
	}
	.nav-btn:hover { background: var(--bg-panel-alt); }
	.nav-btn:disabled { opacity: 0.3; pointer-events: none; }
</style>
