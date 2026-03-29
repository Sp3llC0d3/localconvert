<script lang="ts">
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { addPageNumbers, type NumberPosition, type NumberFormat } from '$lib/pdf/page-numbers';
	import { loadPdfDocument, renderDocPageToCanvas, type PdfDocProxy } from '$lib/pdf/preview';
	import { downloadPdf, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { ListOrderedIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { onDestroy } from 'svelte';
	import { m } from '$lib/paraglide/messages';

	let files = $state<File[]>([]);
	let position = $state<NumberPosition>('bottom-center');
	let format = $state<NumberFormat>('plain');
	let startFrom = $state(1);
	let fontSize = $state(12);
	let skipFirst = $state(false);
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

	const positions = $derived<{ value: NumberPosition; label: string }[]>([
		{ value: 'bottom-left', label: m['tool_pages.page_numbers.bottom_left']() },
		{ value: 'bottom-center', label: m['tool_pages.page_numbers.bottom_center']() },
		{ value: 'bottom-right', label: m['tool_pages.page_numbers.bottom_right']() },
		{ value: 'top-left', label: m['tool_pages.page_numbers.top_left']() },
		{ value: 'top-center', label: m['tool_pages.page_numbers.top_center']() },
		{ value: 'top-right', label: m['tool_pages.page_numbers.top_right']() },
	]);

	const formats: { value: NumberFormat; label: string }[] = [
		{ value: 'plain', label: '1, 2, 3' },
		{ value: 'page-n', label: 'Page 1' },
		{ value: 'n-of-total', label: '1 / 5' },
		{ value: 'roman', label: 'I, II, III' },
	];

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
			error = m['tools_common.failed_read_pdf']();
		}
	}

	async function renderCurrentPage() {
		if (!previewCanvas || !pdfDoc) return;
		const dims = await renderDocPageToCanvas(pdfDoc, currentPage, previewCanvas, 0.5);
		pageWidth = dims.width;
		pageHeight = dims.height;
		const ctx = previewCanvas.getContext('2d')!;
		baseImageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
		drawNumberOverlay();
	}

	// Live preview
	$effect(() => {
		void position; void format; void startFrom; void fontSize; void skipFirst;
		if (!previewCanvas || !baseImageData) return;
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			drawNumberOverlay();
			rafId = null;
		});
	});

	onDestroy(() => {
		if (rafId !== null) cancelAnimationFrame(rafId);
		pdfDoc?.destroy();
	});

	function toRoman(num: number): string {
		const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
		const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
		let result = '';
		for (let i = 0; i < vals.length; i++) {
			while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
		}
		return result;
	}

	function getLabel(): string {
		const pageIdx = currentPage - (skipFirst ? 1 : 0);
		if (skipFirst && currentPage === 1) return '';
		const num = pageIdx + startFrom - 1;
		const total = pageCount - (skipFirst ? 1 : 0) + startFrom - 1;
		switch (format) {
			case 'page-n': return `Page ${num}`;
			case 'n-of-total': return `${num} / ${total}`;
			case 'roman': return toRoman(num);
			default: return `${num}`;
		}
	}

	function drawNumberOverlay() {
		if (!previewCanvas || !baseImageData) return;
		const ctx = previewCanvas.getContext('2d')!;
		ctx.putImageData(baseImageData, 0, 0);

		const label = getLabel();
		if (!label) return;

		const scale = previewCanvas.width / pageWidth;
		const scaledFontSize = fontSize * scale;
		const margin = 36 * scale;

		ctx.font = `${scaledFontSize}px sans-serif`;
		ctx.fillStyle = '#000000';
		let x: number;
		let y: number;

		if (position.includes('left')) {
			ctx.textAlign = 'left';
			x = margin;
		} else if (position.includes('right')) {
			ctx.textAlign = 'right';
			x = previewCanvas.width - margin;
		} else {
			ctx.textAlign = 'center';
			x = previewCanvas.width / 2;
		}

		if (position.startsWith('top')) {
			y = margin + scaledFontSize;
		} else {
			y = previewCanvas.height - margin;
		}

		ctx.fillText(label, x, y);
	}

	function prevPage() {
		if (currentPage > 1) { currentPage--; renderCurrentPage(); }
	}
	function nextPage() {
		if (currentPage < pageCount) { currentPage++; renderCurrentPage(); }
	}

	async function apply() {
		if (files.length === 0) return;
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await addPageNumbers(files[0], {
				position, format, startFrom, fontSize,
				skipFirstPage: skipFirst,
			});
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tools_common.failed']();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, getOutputName(files[0].name, 'numbered', 'pdf'));
	}
</script>

<svelte:head>
	<title>Add Page Numbers to PDF — LocalConvert</title>
	<meta name="description" content="Add page numbers to any PDF file. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/page-numbers/" />
</svelte:head>

<div class="pn-page">
	<ToolPageHeader
		category="pdf"
		title={m['tool_pages.page_numbers.title']()}
		description={m['tool_pages.page_numbers.desc']()}
		icon={ListOrderedIcon}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<PdfUploader bind:files multiple={false} label={m['tools_common.upload_pdf']()} />

	{#if files.length > 0}
		<!-- Live preview -->
		<div class="preview-wrap">
			<canvas bind:this={previewCanvas} class="preview-canvas"></canvas>
			{#if pageCount > 1}
				<div class="page-nav">
					<button class="nav-btn" onclick={prevPage} disabled={currentPage <= 1} aria-label="Previous page">
						<ChevronLeftIcon size={16} />
					</button>
					<span class="text-xs text-muted">{m['tools_common.page_of']({ currentPage, pageCount })}</span>
					<button class="nav-btn" onclick={nextPage} disabled={currentPage >= pageCount} aria-label="Next page">
						<ChevronRightIcon size={16} />
					</button>
				</div>
			{/if}
		</div>

		<!-- Options -->
		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">{m['tool_pages.page_numbers.position']()}</span>
				<div class="flex gap-2 flex-wrap">
					{#each positions as pos}
						<button class="btn text-sm px-3 py-1.5 {position === pos.value ? 'highlight' : ''}" onclick={() => position = pos.value}>{pos.label}</button>
					{/each}
				</div>
			</div>
			<div class="opt-row">
				<span class="opt-label">{m['tools_common.format']()}</span>
				<div class="flex gap-2 flex-wrap">
					{#each formats as fmt}
						<button class="btn text-sm px-3 py-1.5 {format === fmt.value ? 'highlight' : ''}" onclick={() => format = fmt.value}>{fmt.label}</button>
					{/each}
				</div>
			</div>
			<div class="opt-row">
				<span class="opt-label">{m['tools_common.font_size']()}</span>
				<input type="range" min={8} max={24} bind:value={fontSize} class="slider flex-1" aria-label="Font size" />
				<span class="val">{fontSize}pt</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">{m['tool_pages.page_numbers.start_from']()}</span>
				<input type="number" min={1} max={9999} bind:value={startFrom} class="num-input" aria-label="Starting page number" />
			</div>
			<div class="opt-row">
				<label class="flex items-center gap-2 cursor-pointer text-sm">
					<input type="checkbox" bind:checked={skipFirst} />
					{m['tool_pages.page_numbers.skip_first']()}
				</label>
			</div>
		</div>

		<button class="btn highlight" disabled={processing} onclick={apply}>
			{processing ? m['tool_pages.page_numbers.btn_busy']() : m['tool_pages.page_numbers.btn']()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{m['tools_common.ready']()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{m['tool_pages.page_numbers.save']()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style>
	.pn-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 5rem; flex-shrink: 0; }
	.slider { height: 6px; appearance: none; border-radius: 9999px; cursor: pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.val { font-size: 0.8125rem; color: var(--fg-muted); width: 2.5rem; text-align: right; flex-shrink: 0; }
	.num-input {
		width: 5rem; padding: 0.375rem 0.5rem; border-radius: 0.5rem; font-size: 0.875rem;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.num-input:focus { outline: 1.5px solid var(--accent); }
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
