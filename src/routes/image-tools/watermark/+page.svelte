<script lang="ts">
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import { watermarkImage } from '$lib/image/watermark';
	import { downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { DropletIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let text = $state('CONFIDENTIAL');
	let opacity = $state(30);
	let fontSize = $state(48);
	let rotation = $state(-30);
	let position = $state<'center' | 'tile'>('center');
	let processing = $state(false);
	let error = $state('');
	let resultBlob = $state<Blob | null>(null);
	let previewUrl = $state('');

	$effect(() => {
		if (files.length > 0) {
			const url = URL.createObjectURL(files[0]);
			previewUrl = url;
			resultBlob = null;
			return () => URL.revokeObjectURL(url);
		} else {
			previewUrl = '';
		}
	});

	async function apply() {
		if (files.length === 0) { error = 'Add an image.'; return; }
		if (!text.trim()) { error = 'Enter watermark text.'; return; }
		error = '';
		processing = true;
		resultBlob = null;
		try {
			resultBlob = await watermarkImage(files[0], {
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
		if (!resultBlob) return;
		downloadBlob(resultBlob, getOutputName(files[0].name, 'watermarked', 'png'));
	}
</script>

<svelte:head>
	<title>Watermark Image — LocalConvert</title>
	<meta name="description" content="Add text watermarks to images. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/image-tools/watermark/" />
</svelte:head>

<div class="tool-page">
	<a href="/image-tools/" class="text-sm text-muted hover:underline">← Image Tools</a>
	<div class="tool-header">
		<DropletIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Watermark Image</h1>
			<p class="text-sm text-muted">Stamp text on any image.</p>
		</div>
	</div>

	<ImageUploader bind:files label="Drop an image here" />

	{#if previewUrl}
		<img src={previewUrl} alt="Preview" class="preview-img" />
	{/if}

	<div class="opt-section">
		<div class="opt-row">
			<label class="opt-label" for="wm-text">Text</label>
			<input id="wm-text" type="text" bind:value={text} placeholder="CONFIDENTIAL" class="opt-input flex-1" maxlength={80} />
		</div>
		<div class="opt-row">
			<span class="opt-label">Opacity</span>
			<input type="range" min={5} max={80} bind:value={opacity} class="quality-slider flex-1" aria-label="Opacity" />
			<span class="text-sm text-muted w-8">{opacity}%</span>
		</div>
		<div class="opt-row">
			<span class="opt-label">Font size</span>
			<input type="range" min={16} max={120} bind:value={fontSize} class="quality-slider flex-1" aria-label="Font size" />
			<span class="text-sm text-muted w-10">{fontSize}px</span>
		</div>
		<div class="opt-row">
			<span class="opt-label">Rotation</span>
			<input type="range" min={-90} max={90} bind:value={rotation} class="quality-slider flex-1" aria-label="Rotation" />
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

	{#if resultBlob}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! Output: <b>{formatFileSize(resultBlob.size)}</b></p>
			<button class="btn" onclick={download}>Save watermarked image</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style lang="postcss">
	.tool-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
	.tool-header { @apply flex items-center gap-3; }
	.opt-section { @apply flex flex-col gap-4 p-4 rounded-2xl bg-panel shadow-panel; }
	.opt-row { @apply flex items-center gap-4 flex-wrap; }
	.opt-label { @apply text-sm font-semibold w-20 flex-shrink-0; }
	.opt-input { @apply rounded-lg px-3 py-1.5 text-sm border; background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg); border-color: var(--bg-separator); }
	.opt-input:focus { outline: 1.5px solid var(--accent); }
	.quality-slider { @apply h-1.5 appearance-none rounded-full cursor-pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
	.preview-img { @apply max-h-64 rounded-xl object-contain mx-auto; }
</style>
