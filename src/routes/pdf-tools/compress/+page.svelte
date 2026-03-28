<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { compressPdf } from '$lib/pdf/compress';
	import { renderPageToCanvas } from '$lib/pdf/preview';
	import { downloadPdf, formatFileSize } from '$lib/pdf/utils';
	import { ZapIcon, AlertTriangleIcon } from 'lucide-svelte';
	import { tick } from 'svelte';

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
		{ label: m['tool_pages.compress.preset_low'](), value: 90, desc: m['tool_pages.compress.preset_low_desc']() },
		{ label: m['tool_pages.compress.preset_med'](), value: 60, desc: m['tool_pages.compress.preset_med_desc']() },
		{ label: m['tool_pages.compress.preset_high'](), value: 30, desc: m['tool_pages.compress.preset_high_desc']() },
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
			error = e instanceof Error ? e.message : m['tool_pages.compress.err_fail']();
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
		downloadPdf(resultBytes, files[0].name.replace(/\.pdf$/i, '_compressed.pdf'));
	}

	const savings = $derived.by(() => {
		if (!resultBytes || !files[0]) return null;
		const saved = files[0].size - resultBytes.byteLength;
		const pct = Math.round((saved / files[0].size) * 100);
		return { saved, pct };
	});
</script>

<svelte:head>
	<title>Compress PDF — LocalConvert</title>
	<meta name="description" content="Reduce PDF file size by re-rendering pages at a lower quality. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/compress/" />
</svelte:head>

<div class="pdf-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">{m['tools_common.back_pdf']()}</a>
	<div class="pdf-header">
		<ZapIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">{m['tool_pages.compress.title']()}</h1>
			<p class="text-sm text-muted">{m['tool_pages.compress.desc']()}</p>
		</div>
	</div>

	<!-- Warning banner -->
	<div class="warn-box">
		<AlertTriangleIcon size={16} class="flex-shrink-0 mt-0.5" />
		<p class="text-sm">
			<b>{m['tool_pages.compress.note']()}</b> {@html m['tool_pages.compress.warning']()}
		</p>
	</div>

	<PdfUploader bind:files multiple={false} label={m['tools_common.upload_pdf']()} />

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
				<span class="text-sm text-muted w-20">{m['tool_pages.compress.jpeg_quality']()}</span>
				<input type="range" min={10} max={95} bind:value={quality} class="quality-slider flex-1" />
				<span class="text-sm text-muted w-8">{quality}%</span>
			</div>
			<p class="text-xs text-muted">{m['tool_pages.compress.input']()} <b>{formatFileSize(files[0].size)}</b></p>
		</div>

		{#if processing}
			<div class="flex flex-col gap-2">
				<p class="text-sm text-muted">{m['tool_pages.compress.btn_busy']({ progress, total })}</p>
				<div class="h-1.5 rounded-full bg-separator overflow-hidden">
					<div class="h-full bg-accent transition-all" style="width: {total > 0 ? (progress/total*100) : 0}%"></div>
				</div>
			</div>
		{/if}

		<button class="btn highlight" disabled={processing} onclick={compress}>
			{processing ? m['tool_pages.compress.btn_busy']({ progress, total }) : m['tool_pages.compress.btn']()}
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

			<!-- Before/after comparison -->
			<div class="compare-section">
				<div class="compare-toggle">
					<button class="comp-btn {compareView === 'original' ? 'active' : ''}" onclick={() => compareView = 'original'}>{m['tool_pages.compress.original']()}</button>
					<button class="comp-btn {compareView === 'compressed' ? 'active' : ''}" onclick={() => compareView = 'compressed'}>{m['tool_pages.compress.compressed']()}</button>
				</div>
				<div class="compare-canvas-wrap">
					<canvas bind:this={origCanvas} class="compare-canvas" class:compare-hidden={compareView !== 'original'}></canvas>
					<canvas bind:this={compCanvas} class="compare-canvas" class:compare-hidden={compareView !== 'compressed'}></canvas>
				</div>
			</div>

			<button class="btn" onclick={download}>{m['tool_pages.compress.save']()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
	.pdf-header { @apply flex items-center gap-3; }
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
