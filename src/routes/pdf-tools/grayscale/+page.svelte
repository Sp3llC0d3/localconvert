<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { grayscalePdf } from '$lib/pdf/grayscale';
	import { renderPageToCanvas } from '$lib/pdf/preview';
	import { downloadPdf, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { PaletteIcon, AlertTriangleIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { tick } from 'svelte';

	let files = $state<File[]>([]);
	let quality = $state(85);
	let processing = $state(false);
	let progress = $state(0);
	let total = $state(0);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	// Before/after
	let origCanvas = $state<HTMLCanvasElement>();
	let grayCanvas = $state<HTMLCanvasElement>();
	let compareView = $state<'original' | 'grayscale'>('grayscale');

	$effect(() => {
		void files;
		resultBytes = null;
		error = '';
	});

	async function convert() {
		if (!browser || files.length === 0) return;
		error = '';
		processing = true;
		resultBytes = null;
		progress = 0;
		try {
			resultBytes = await grayscalePdf(
				files[0],
				quality / 100,
				1.5,
				(p, t) => { progress = p; total = t; },
			);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tools_common.failed']();
		}
		processing = false;

		if (resultBytes) {
			await tick();
			renderComparison();
		}
	}

	async function renderComparison() {
		if (!origCanvas || !grayCanvas || !resultBytes || !files[0]) return;
		try {
			await renderPageToCanvas(files[0], 1, origCanvas, 0.4);
			const grayFile = new File(
				[resultBytes.buffer.slice(resultBytes.byteOffset, resultBytes.byteOffset + resultBytes.byteLength)],
				'grayscale.pdf',
				{ type: 'application/pdf' },
			);
			await renderPageToCanvas(grayFile, 1, grayCanvas, 0.4);
		} catch { /* comparison optional */ }
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, getOutputName(files[0].name, 'grayscale', 'pdf'));
	}

	const savings = $derived.by(() => {
		if (!resultBytes || !files[0]) return null;
		const saved = files[0].size - resultBytes.byteLength;
		const pct = Math.round((saved / files[0].size) * 100);
		return { saved, pct };
	});
</script>

<svelte:head>
	<title>PDF to Grayscale — LocalConvert</title>
	<meta name="description" content="Convert PDF pages to black and white. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/grayscale/" />
</svelte:head>

<div class="gray-page">
	<ToolPageHeader
		category="pdf"
		title={m['tool_pages.grayscale.title']()}
		description={m['tool_pages.grayscale.desc']()}
		icon={PaletteIcon}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<div class="warn-box">
		<AlertTriangleIcon size={16} class="flex-shrink-0 mt-0.5" />
		<p class="text-sm">{m['tool_pages.grayscale.warning']()}</p>
	</div>

	<PdfUploader bind:files multiple={false} label={m['tools_common.upload_pdf']()} />

	{#if files.length > 0}
		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">{m['tools_common.quality']()}</span>
				<input type="range" min={30} max={95} bind:value={quality} class="slider flex-1" aria-label="Quality" />
				<span class="val">{quality}%</span>
			</div>
			<p class="text-xs text-muted">{m['tools_common.input']()}: <b>{formatFileSize(files[0].size)}</b></p>
		</div>

		{#if processing}
			<div class="flex flex-col gap-2">
				<p class="text-sm text-muted">{m['tool_pages.grayscale.btn_busy']({ progress, total })}</p>
				<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--bg-separator)">
					<div class="h-full rounded-full transition-all" style="background: var(--accent); width: {total > 0 ? (progress / total * 100) : 0}%"></div>
				</div>
			</div>
		{/if}

		<button class="btn highlight" disabled={processing} onclick={convert}>
			{processing ? m['tool_pages.grayscale.btn_busy']({ progress, total }) : m['tool_pages.grayscale.btn']()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">
				{m['tools_common.output']()} <b>{formatFileSize(resultBytes.byteLength)}</b>
				{#if savings && savings.saved > 0}
					— {m['tool_pages.compress.saved']()} <b>{formatFileSize(savings.saved)}</b> ({savings.pct}%)
				{/if}
			</p>

			<div class="compare-section">
				<div class="compare-toggle">
					<button class="comp-btn {compareView === 'original' ? 'active' : ''}" onclick={() => compareView = 'original'}>{m['tool_pages.compress.original']()}</button>
					<button class="comp-btn {compareView === 'grayscale' ? 'active' : ''}" onclick={() => compareView = 'grayscale'}>{m['tool_pages.grayscale.grayscale']()}</button>
				</div>
				<div class="compare-canvas-wrap">
					<canvas bind:this={origCanvas} class="compare-canvas" class:comp-hidden={compareView !== 'original'}></canvas>
					<canvas bind:this={grayCanvas} class="compare-canvas" class:comp-hidden={compareView !== 'grayscale'}></canvas>
				</div>
			</div>

			<button class="btn" onclick={download}>{m['tool_pages.grayscale.save']()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style>
	.gray-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.warn-box {
		display: flex; gap: 0.75rem; padding: 1rem; border-radius: 1rem;
		color: hsl(35, 90%, 45%); background: color-mix(in srgb, var(--bg-panel) 85%, transparent);
		border: 1px solid currentColor;
	}
	.opt-section { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 4rem; flex-shrink: 0; }
	.slider { height: 6px; appearance: none; border-radius: 9999px; cursor: pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.val { font-size: 0.8125rem; color: var(--fg-muted); width: 2.5rem; text-align: right; flex-shrink: 0; }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.compare-section { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
	.compare-toggle { display: flex; gap: 0.25rem; padding: 0.25rem; border-radius: 0.5rem; background: var(--bg-panel-alt); }
	.comp-btn {
		padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 500;
		border: none; background: transparent; color: var(--fg-muted); cursor: pointer;
	}
	.comp-btn.active { background: var(--bg-panel); color: var(--fg); box-shadow: var(--shadow-panel); }
	.compare-canvas-wrap { display: flex; justify-content: center; }
	.compare-canvas { max-width: 100%; max-height: 20rem; border-radius: 0.375rem; }
	.comp-hidden { display: none; }
</style>
