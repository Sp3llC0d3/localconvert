<script lang="ts">
	const __nkm = {'pdf_tools.tools.grayscale_name': pdf_tools_tools_grayscale_name, 'pdf_tools.tools.merge_name': pdf_tools_tools_merge_name, 'pdf_tools.tools.from_docx_name': pdf_tools_tools_from_docx_name};
	import { tool_pages_compress_preset_low, tool_pages_compress_preset_low_desc, tool_pages_compress_preset_med, tool_pages_compress_preset_med_desc, tool_pages_compress_preset_high, tool_pages_compress_preset_high_desc, tool_pages_compress_err_fail, tool_pages_compress_title, tool_pages_compress_desc, tools_common_back_pdf, tool_pages_compress_note, tool_pages_compress_warning, tools_common_upload_pdf, tool_pages_compress_jpeg_quality, tool_pages_compress_input, tool_pages_compress_btn_busy, tool_pages_compress_btn, tools_common_output, tool_pages_compress_saved, tool_pages_compress_original, tool_pages_compress_compressed, tool_pages_compress_save, tools_common_privacy_note, tool_pages_compress_seo_faq1_q, tool_pages_compress_seo_faq1_a, tool_pages_compress_seo_faq2_q, tool_pages_compress_seo_faq2_a, pdf_tools_tools_grayscale_name, pdf_tools_tools_merge_name, pdf_tools_tools_from_docx_name , navbar_home, navbar_pdf_tools, meta_descriptions_pdf_compress} from "$lib/paraglide/messages/_barrel.js";
	import { localizeHref } from '$lib/paraglide/runtime';
	import { browser } from '$app/environment';
	import { sanitize } from '$lib/util/sanitize';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { compressPdf } from '$lib/pdf/compress';
	import { renderPageToCanvas } from '$lib/pdf/preview';
	import { downloadPdf, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { ZapIcon, AlertTriangleIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { tick } from 'svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let quality = $state(60); // 60 = medium
	let processing = $state(false);
	let progress = $state(0);
	let total = $state(0);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	// Before/after comparison
	let origCanvas = $state<HTMLCanvasElement>();
	let compCanvas = $state<HTMLCanvasElement>();
	let compareView = $state<'original' | 'compressed'>('compressed');

	const presets = $derived([
		{ label: tool_pages_compress_preset_low(), value: 90, desc: tool_pages_compress_preset_low_desc() },
		{ label: tool_pages_compress_preset_med(), value: 60, desc: tool_pages_compress_preset_med_desc() },
		{ label: tool_pages_compress_preset_high(), value: 30, desc: tool_pages_compress_preset_high_desc() },
	]);

	async function compress() {
		if (!browser || files.length === 0) return;
		error = '';
		processing = true;
		resultBytes = null;
		progress = 0;
		total = 0;
		try {
			resultBytes = await compressPdf(
				files[0],
				quality / 100,
				1.5,
				(p, t) => { progress = p; total = t; }
			);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tool_pages_compress_err_fail();
		}
		processing = false;

		// Wait for DOM to mount the canvases, then render comparison
		if (resultBytes) {
			await tick();
			renderComparison();
		}
	}

	async function renderComparison() {
		if (!origCanvas || !compCanvas || !resultBytes || !files[0]) return;
		try {
			await renderPageToCanvas(files[0], 1, origCanvas, 0.4);
			const compFile = new File(
				[resultBytes.buffer.slice(resultBytes.byteOffset, resultBytes.byteOffset + resultBytes.byteLength)],
				'compressed.pdf',
				{ type: 'application/pdf' },
			);
			await renderPageToCanvas(compFile, 1, compCanvas, 0.4);
		} catch {
			// Comparison is optional, don't fail
		}
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, getOutputName(files[0].name, 'compressed', 'pdf'));
	}

	const savings = $derived.by(() => {
		if (!resultBytes || !files[0]) return null;
		const saved = files[0].size - resultBytes.byteLength;
		const pct = Math.round((saved / files[0].size) * 100);
		return { saved, pct };
	});
</script>

<svelte:head>
	<title>{tool_pages_compress_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_pdf_compress()} />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/compress/" />
	<meta property="og:title" content="{tool_pages_compress_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_pdf_compress()} />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/compress/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Compress a PDF","step":[{"@type":"HowToStep","text":"Select a PDF file"},{"@type":"HowToStep","text":"Choose the compression quality level"},{"@type":"HowToStep","text":"Click compress to reduce file size"},{"@type":"HowToStep","text":"Save the compressed PDF"}]})}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":navbar_home(),"item":"https://localconvert.app"+localizeHref("/")},{"@type":"ListItem","position":2,"name":navbar_pdf_tools(),"item":"https://localconvert.app"+localizeHref("/pdf-tools/")},{"@type":"ListItem","position":3,"name":tool_pages_compress_title()}]})}</script>`}
</svelte:head>

<div class="pdf-page">
	<ToolPageHeader
		category="pdf"
		title={tool_pages_compress_title()}
		description={tool_pages_compress_desc()}
		icon={ZapIcon}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<!-- Warning banner -->
	<div class="warn-box">
		<AlertTriangleIcon size={16} class="flex-shrink-0 mt-0.5" />
		<p class="text-sm">
			<b>{tool_pages_compress_note()}</b> {@html sanitize(tool_pages_compress_warning())}
		</p>
	</div>

	<PdfUploader bind:files multiple={false} label={tools_common_upload_pdf()} />

	{#if files.length > 0}
		<div class="opt-section">
			<div class="flex gap-2 flex-wrap">
				{#each presets as p}
					<button
						class="preset-btn {quality === p.value ? 'selected' : ''}"
						onclick={() => quality = p.value}
					>
						<span class="font-semibold text-sm">{p.label}</span>
						<span class="text-xs text-muted">{p.desc}</span>
					</button>
				{/each}
			</div>
			<div class="flex items-center gap-3 mt-2">
				<span class="text-sm text-muted w-20">{tool_pages_compress_jpeg_quality()}</span>
				<input type="range" min={10} max={95} bind:value={quality} class="quality-slider flex-1" />
				<span class="text-sm text-muted w-8">{quality}%</span>
			</div>
			<p class="text-xs text-muted">{tool_pages_compress_input()} <b>{formatFileSize(files[0].size)}</b></p>
		</div>

		{#if processing}
			<div class="flex flex-col gap-2">
				<p class="text-sm text-muted">{tool_pages_compress_btn_busy({ progress, total })}</p>
				<div class="h-1.5 rounded-full bg-separator overflow-hidden">
					<div class="h-full bg-accent transition-all" style="width: {total > 0 ? (progress/total*100) : 0}%"></div>
				</div>
			</div>
		{/if}

		<button class="btn highlight" disabled={processing} onclick={compress}>
			{processing ? tool_pages_compress_btn_busy({ progress, total }) : tool_pages_compress_btn()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">
				{tools_common_output()} <b>{formatFileSize(resultBytes.byteLength)}</b>
				{#if savings && savings.saved > 0}
					— {tool_pages_compress_saved()} <b>{formatFileSize(savings.saved)}</b> ({savings.pct}%)
				{/if}
			</p>

			<!-- Before/after comparison -->
			<div class="compare-section">
				<div class="compare-toggle">
					<button class="comp-btn {compareView === 'original' ? 'active' : ''}" onclick={() => compareView = 'original'}>{tool_pages_compress_original()}</button>
					<button class="comp-btn {compareView === 'compressed' ? 'active' : ''}" onclick={() => compareView = 'compressed'}>{tool_pages_compress_compressed()}</button>
				</div>
				<div class="compare-canvas-wrap">
					<canvas bind:this={origCanvas} class="compare-canvas" class:compare-hidden={compareView !== 'original'}></canvas>
					<canvas bind:this={compCanvas} class="compare-canvas" class:compare-hidden={compareView !== 'compressed'}></canvas>
				</div>
			</div>

			<button class="btn" onclick={download}>{tool_pages_compress_save()}</button>
		</div>
	{/if}

	
	{#if toolSeo['compress']}
		<ToolSeoBlock
			faqs={toolSeo['compress'].faqKeys.length >= 4 ? [
				{ q: tool_pages_compress_seo_faq1_q?.() ?? '', a: tool_pages_compress_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_compress_seo_faq2_q?.() ?? '', a: tool_pages_compress_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['compress'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
.warn-box { @apply flex gap-3 p-4 rounded-2xl text-yellow-600 dark:text-yellow-400; background: color-mix(in srgb, var(--bg-panel) 85%, transparent); border: 1px solid currentColor; }
	.opt-section { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
	.preset-btn { @apply flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border-2 transition-colors; border-color: var(--bg-separator); }
	.preset-btn.selected { border-color: var(--accent); background: var(--bg-badge); }
	.quality-slider { @apply h-1.5 appearance-none rounded-full cursor-pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
	.compare-section { @apply flex flex-col items-center gap-2; }
	.compare-toggle { @apply flex gap-1 p-1 rounded-lg; background: var(--bg-panel-alt); }
	.comp-btn {
		@apply px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors;
		border: none; background: transparent; color: var(--fg-muted);
	}
	.comp-btn.active { background: var(--bg-panel); color: var(--fg); box-shadow: var(--shadow-panel); }
	.compare-canvas-wrap { @apply flex justify-center; }
	.compare-canvas { max-width: 100%; max-height: 20rem; border-radius: 0.375rem; }
	.compare-hidden { display: none; }
</style>
