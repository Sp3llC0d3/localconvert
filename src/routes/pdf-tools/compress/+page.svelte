<script lang="ts">
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { compressPdf } from '$lib/pdf/compress';
	import { downloadPdf, formatFileSize } from '$lib/pdf/utils';
	import { ZapIcon, AlertTriangleIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let quality = $state(60); // 60 = medium
	let processing = $state(false);
	let progress = $state(0);
	let total = $state(0);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	const presets = [
		{ label: 'Low compression', value: 90, desc: '~20–40% smaller, great quality' },
		{ label: 'Medium', value: 60, desc: '~50–70% smaller, good quality' },
		{ label: 'High compression', value: 30, desc: '~70–90% smaller, visible loss' },
	];

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
			error = e instanceof Error ? e.message : 'Compression failed.';
		}
		processing = false;
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
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">← PDF Tools</a>
	<div class="pdf-header">
		<ZapIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Compress PDF</h1>
			<p class="text-sm text-muted">Reduce file size by re-rendering each page as JPEG.</p>
		</div>
	</div>

	<!-- Warning banner -->
	<div class="warn-box">
		<AlertTriangleIcon size={16} class="flex-shrink-0 mt-0.5" />
		<p class="text-sm">
			<b>Note:</b> Compressed PDFs have image-only pages. Text will <b>not</b> be selectable, and links/forms will be removed.
		</p>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

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
				<span class="text-sm text-muted w-20">JPEG quality</span>
				<input type="range" min={10} max={95} bind:value={quality} class="quality-slider flex-1" />
				<span class="text-sm text-muted w-8">{quality}%</span>
			</div>
			<p class="text-xs text-muted">Input: <b>{formatFileSize(files[0].size)}</b></p>
		</div>

		{#if processing}
			<div class="flex flex-col gap-2">
				<p class="text-sm text-muted">Compressing page {progress} of {total}…</p>
				<div class="h-1.5 rounded-full bg-separator overflow-hidden">
					<div class="h-full bg-accent transition-all" style="width: {total > 0 ? (progress/total*100) : 0}%"></div>
				</div>
			</div>
		{/if}

		<button class="btn highlight" disabled={processing} onclick={compress}>
			{processing ? 'Compressing…' : 'Compress PDF'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">
				Output: <b>{formatFileSize(resultBytes.byteLength)}</b>
				{#if savings && savings.saved > 0}
					— saved <b>{formatFileSize(savings.saved)}</b> ({savings.pct}%)
				{/if}
			</p>
			<button class="btn" onclick={download}>Download compressed.pdf</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
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
</style>
