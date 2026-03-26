<script lang="ts">
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { addWatermark } from '$lib/pdf/watermark';
	import { downloadPdf, formatFileSize } from '$lib/pdf/utils';
	import { PenLineIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let text = $state('CONFIDENTIAL');
	let opacity = $state(30);
	let fontSize = $state(60);
	let rotation = $state(45);
	let position = $state<'center' | 'tile'>('center');
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

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

<div class="pdf-page">
	<div class="pdf-header">
		<PenLineIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Add Watermark</h1>
			<p class="text-sm text-muted">Stamp text on every page of a PDF.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

	<div class="opt-section">
		<div class="opt-row">
			<label class="opt-label" for="wm-text">Text</label>
			<input
				id="wm-text"
				type="text"
				bind:value={text}
				placeholder="CONFIDENTIAL"
				class="opt-input flex-1"
				maxlength={80}
			/>
		</div>
		<div class="opt-row">
			<span class="opt-label">Opacity</span>
			<input type="range" min={5} max={80} bind:value={opacity} class="quality-slider flex-1" />
			<span class="text-sm text-muted w-8">{opacity}%</span>
		</div>
		<div class="opt-row">
			<span class="opt-label">Font size</span>
			<input type="range" min={20} max={120} bind:value={fontSize} class="quality-slider flex-1" />
			<span class="text-sm text-muted w-10">{fontSize}pt</span>
		</div>
		<div class="opt-row">
			<span class="opt-label">Rotation</span>
			<input type="range" min={0} max={90} bind:value={rotation} class="quality-slider flex-1" />
			<span class="text-sm text-muted w-8">{rotation}°</span>
		</div>
		<div class="opt-row">
			<span class="opt-label">Position</span>
			<div class="flex gap-2">
				<button class="btn text-sm px-3 py-1.5 {position === 'center' ? 'highlight' : ''}" onclick={() => position = 'center'}>Center</button>
				<button class="btn text-sm px-3 py-1.5 {position === 'tile' ? 'highlight' : ''}" onclick={() => position = 'tile'}>Tile</button>
			</div>
		</div>
	</div>

	{#if files.length > 0}
		<button class="btn highlight" disabled={processing} onclick={apply}>
			{processing ? 'Applying…' : 'Apply watermark'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! Output: <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>Download watermarked.pdf</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">🔒 Your files never leave your device.</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
	.pdf-header { @apply flex items-center gap-3; }
	.opt-section { @apply flex flex-col gap-4 p-4 rounded-2xl bg-panel shadow-panel; }
	.opt-row { @apply flex items-center gap-4 flex-wrap; }
	.opt-label { @apply text-sm font-semibold w-20 flex-shrink-0; }
	.opt-input { @apply rounded-lg px-3 py-1.5 text-sm border; background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg); border-color: var(--bg-separator); }
	.opt-input:focus { outline: 1.5px solid var(--accent); }
	.quality-slider { @apply h-1.5 appearance-none rounded-full cursor-pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
</style>
