<script lang="ts">
	const __nkm = {'pdf_tools.tools.sign_name': pdf_tools_tools_sign_name, 'pdf_tools.tools.page_numbers_name': pdf_tools_tools_page_numbers_name, 'pdf_tools.tools.edit_name': pdf_tools_tools_edit_name};
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { addWatermark } from '$lib/pdf/watermark';
	import { loadPdfDocument, renderDocPageToCanvas, type PdfDocProxy } from '$lib/pdf/preview';
	import { downloadPdf, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { PenLineIcon, ChevronLeftIcon, ChevronRightIcon, UploadIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { onDestroy } from 'svelte';
	import { tools_common_failed_read_pdf, tools_common_upload_pdf, tool_pages_watermark_pdf_err_text, tools_common_failed, tool_pages_watermark_pdf_title, tool_pages_watermark_pdf_desc, tools_common_back_pdf, tools_common_page_of, tools_common_text, tools_common_font, tools_common_color, tools_common_opacity, tools_common_font_size, tools_common_rotation, tools_common_position, tools_common_center, tools_common_tile, tool_pages_watermark_pdf_btn_busy, tool_pages_watermark_pdf_btn, tools_common_ready, tool_pages_watermark_pdf_save, tools_common_privacy_note, tool_pages_watermark_seo_faq1_q, tool_pages_watermark_seo_faq1_a, tool_pages_watermark_seo_faq2_q, tool_pages_watermark_seo_faq2_a, pdf_tools_tools_sign_name, pdf_tools_tools_page_numbers_name, pdf_tools_tools_edit_name, aria_watermark_placeholder, aria_upload_custom_font, aria_previous_page, aria_next_page, aria_watermark_color, aria_opacity, aria_font_size, aria_rotation , meta_descriptions_pdf_watermark} from "$lib/paraglide/messages/_barrel.js";
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let text = $state('CONFIDENTIAL');
	let opacity = $state(30);
	let fontSize = $state(60);
	let rotation = $state(45);
	let color = $state('#888888');
	let position = $state<'center' | 'tile'>('center');
	let fontFamily = $state('sans-serif');
	let customFontName = $state('');
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	// Font options
	const builtinFonts = [
		{ label: 'Default', value: 'sans-serif' },
		{ label: 'Serif', value: 'serif' },
		{ label: 'Monospace', value: 'monospace' },
	];

	let fontInput = $state<HTMLInputElement>();

	async function uploadFont(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.[0]) return;
		const file = input.files[0];
		const buffer = await file.arrayBuffer();
		const name = 'CustomWatermarkFont';
		try {
			const face = new FontFace(name, buffer);
			await face.load();
			document.fonts.add(face);
			fontFamily = `"${name}"`;
			customFontName = file.name;
		} catch {
			error = 'Failed to load font.';
		}
		input.value = '';
	}

	// Preview state
	let previewCanvas = $state<HTMLCanvasElement>();
	let pageCount = $state(0);
	let currentPage = $state(1);
	let pageWidth = $state(0);
	let pageHeight = $state(0);
	let baseImageData = $state<ImageData | null>(null);
	let pdfDoc = $state<PdfDocProxy | null>(null);
	let rafId: number | null = null;
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

	async function loadFile(file: File) {
		pdfDoc?.destroy();
		pdfDoc = null;
		error = '';
		try {
			const doc = await loadPdfDocument(file);
			if (lastFileRef !== file) { doc.destroy(); return; }
			pdfDoc = doc;
			pageCount = doc.numPages;
			currentPage = 1;
			await renderCurrentPage();
		} catch {
			if (lastFileRef !== file) return;
			error = tools_common_failed_read_pdf();
		}
	}

	async function renderCurrentPage() {
		if (!pdfDoc) return;
		if (!previewCanvas) {
			await new Promise((r) => requestAnimationFrame(r));
			if (!previewCanvas || !pdfDoc) return;
		}
		const dims = await renderDocPageToCanvas(pdfDoc, currentPage, previewCanvas, 0.5);
		pageWidth = dims.width;
		pageHeight = dims.height;
		const ctx = previewCanvas.getContext('2d')!;
		baseImageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
		drawWatermarkOverlay();
	}

	// Live preview: redraw watermark on every option change
	$effect(() => {
		void text; void opacity; void fontSize; void rotation; void position; void color; void fontFamily;
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

		// Restore base page
		ctx.putImageData(baseImageData, 0, 0);

		if (!text.trim()) return;

		const pxScale = previewCanvas.width / pageWidth;
		const scaledFontSize = fontSize * pxScale;

		ctx.globalAlpha = opacity / 100;
		ctx.fillStyle = color;
		ctx.font = `bold ${scaledFontSize}px ${fontFamily}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		const cw = previewCanvas.width;
		const ch = previewCanvas.height;

		if (position === 'tile') {
			const metric = ctx.measureText(text);
			const tileW = metric.width + 60 * pxScale;
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
		if (files.length === 0) { error = tools_common_upload_pdf(); return; }
		if (!text.trim()) { error = tool_pages_watermark_pdf_err_text(); return; }
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
				color,
				fontFamily,
			});
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tools_common_failed();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, getOutputName(files[0].name, 'watermarked', 'pdf'));
	}
</script>

<svelte:head>
	<title>{tool_pages_watermark_pdf_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_pdf_watermark()} />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/watermark/" />
	<meta property="og:title" content="{tool_pages_watermark_pdf_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_pdf_watermark()} />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/watermark/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Add a Watermark to a PDF","step":[{"@type":"HowToStep","text":"Select a PDF file"},{"@type":"HowToStep","text":"Enter watermark text and adjust settings"},{"@type":"HowToStep","text":"Preview the watermark placement"},{"@type":"HowToStep","text":"Save the watermarked PDF"}]})}</script>`}
</svelte:head>

<div class="wm-page">
	<ToolPageHeader
		category="pdf"
		title={tool_pages_watermark_pdf_title()}
		description={tool_pages_watermark_pdf_desc()}
		icon={PenLineIcon}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<PdfUploader bind:files multiple={false} label={tools_common_upload_pdf()} />

	{#if files.length > 0}
		<!-- Live preview -->
		<div class="preview-wrap">
			<canvas bind:this={previewCanvas} class="preview-canvas"></canvas>
			{#if pageCount > 1}
				<div class="page-nav">
					<button class="nav-btn" onclick={prevPage} disabled={currentPage <= 1} aria-label={aria_previous_page()}>
						<ChevronLeftIcon size={16} class="icon-flip" />
					</button>
					<span class="text-xs text-muted">{tools_common_page_of({ currentPage, pageCount })}</span>
					<button class="nav-btn" onclick={nextPage} disabled={currentPage >= pageCount} aria-label={aria_next_page()}>
						<ChevronRightIcon size={16} class="icon-flip" />
					</button>
				</div>
			{/if}
		</div>

		<!-- Options -->
		<div class="opt-section">
			<div class="opt-row">
				<label class="opt-label" for="wm-text">{tools_common_text()}</label>
				<input id="wm-text" type="text" bind:value={text} placeholder={aria_watermark_placeholder()} class="opt-input" maxlength={80} />
			</div>

			<div class="opt-row">
				<span class="opt-label">{tools_common_font()}</span>
				<div class="font-controls">
					<select class="font-select" bind:value={fontFamily}>
						{#each builtinFonts as f}
							<option value={f.value}>{f.label}</option>
						{/each}
						{#if customFontName}
							<option value='"CustomWatermarkFont"'>{customFontName}</option>
						{/if}
					</select>
					<input bind:this={fontInput} type="file" accept=".ttf,.otf,.woff,.woff2" class="hidden" onchange={uploadFont} />
					<button class="upload-font-btn" onclick={() => fontInput?.click()} title={aria_upload_custom_font()}>
						<UploadIcon size={14} />
					</button>
				</div>
			</div>

			<div class="opt-row">
				<span class="opt-label">{tools_common_color()}</span>
				<input type="color" bind:value={color} class="color-input" aria-label={aria_watermark_color()} />
				<span class="text-xs text-muted">{color}</span>
			</div>

			<div class="opt-row">
				<span class="opt-label">{tools_common_opacity()}</span>
				<input type="range" min={5} max={80} bind:value={opacity} class="slider flex-1" aria-label={aria_opacity()} />
				<span class="val">{opacity}%</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">{tools_common_font_size()}</span>
				<input type="range" min={20} max={120} bind:value={fontSize} class="slider flex-1" aria-label={aria_font_size()} />
				<span class="val">{fontSize}pt</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">{tools_common_rotation()}</span>
				<input type="range" min={0} max={90} bind:value={rotation} class="slider flex-1" aria-label={aria_rotation()} />
				<span class="val">{rotation}°</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">{tools_common_position()}</span>
				<div class="flex gap-2">
					<button class="btn text-sm px-3 py-1.5 {position === 'center' ? 'highlight' : ''}" onclick={() => position = 'center'}>{tools_common_center()}</button>
					<button class="btn text-sm px-3 py-1.5 {position === 'tile' ? 'highlight' : ''}" onclick={() => position = 'tile'}>{tools_common_tile()}</button>
				</div>
			</div>
		</div>

		<button class="btn highlight" disabled={processing || !text.trim()} onclick={apply}>
			{processing ? tool_pages_watermark_pdf_btn_busy() : tool_pages_watermark_pdf_btn()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{tools_common_ready()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{tool_pages_watermark_pdf_save()}</button>
		</div>
	{/if}

	
	{#if toolSeo['watermark']}
		<ToolSeoBlock
			faqs={toolSeo['watermark'].faqKeys.length >= 4 ? [
				{ q: tool_pages_watermark_seo_faq1_q?.() ?? '', a: tool_pages_watermark_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_watermark_seo_faq2_q?.() ?? '', a: tool_pages_watermark_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['watermark'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>
</div>

<style>
	.wm-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 5rem; flex-shrink: 0; }
	.opt-input { border-radius: 0.5rem; padding: 0.375rem 0.75rem; font-size: 0.875rem; border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg); flex: 1; }
	.opt-input:focus { outline: 1.5px solid var(--accent); }
	.slider { height: 6px; appearance: none; border-radius: 9999px; cursor: pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.val { font-size: 0.8125rem; color: var(--fg-muted); width: 2.5rem; text-align: end; flex-shrink: 0; }
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

	/* Font controls */
	.font-controls { display: flex; align-items: center; gap: 0.375rem; flex: 1; }
	.font-select {
		flex: 1; padding: 0.375rem 0.5rem; border-radius: 0.5rem; font-size: 0.8125rem;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
		cursor: pointer; appearance: auto;
	}
	.font-select:focus { outline: 1.5px solid var(--accent); }
	.upload-font-btn {
		display: flex; align-items: center; justify-content: center;
		width: 2rem; height: 2rem; border-radius: 0.375rem; flex-shrink: 0;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel));
		cursor: pointer; color: var(--fg-muted); transition: color 0.15s;
	}
	.upload-font-btn:hover { color: var(--accent); border-color: var(--accent); }

	/* Color input */
	.color-input {
		width: 2rem; height: 2rem; border-radius: 0.375rem; cursor: pointer;
		border: 1px solid var(--bg-separator); padding: 0;
	}
</style>
