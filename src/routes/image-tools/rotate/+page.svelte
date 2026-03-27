<script lang="ts">
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import { rotateImage, type RotationAngle } from '$lib/image/rotate';
	import { downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { RotateCwIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let angle = $state<RotationAngle>(90);
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
		if (files.length === 0) return;
		error = '';
		processing = true;
		resultBlob = null;
		try {
			resultBlob = await rotateImage(files[0], angle);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed.';
		}
		processing = false;
	}

	function download() {
		if (!resultBlob) return;
		downloadBlob(resultBlob, getOutputName(files[0].name, 'rotated', 'png'));
	}
</script>

<svelte:head>
	<title>Rotate Image — LocalConvert</title>
	<meta name="description" content="Rotate images 90°, 180°, or 270°. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/image-tools/rotate/" />
</svelte:head>

<div class="tool-page">
	<a href="/image-tools/" class="text-sm text-muted hover:underline">← Image Tools</a>
	<div class="tool-header">
		<RotateCwIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Rotate Image</h1>
			<p class="text-sm text-muted">Rotate an image by 90°, 180°, or 270°.</p>
		</div>
	</div>

	<ImageUploader bind:files label="Drop an image here" />

	{#if previewUrl}
		<img src={previewUrl} alt="Preview" class="preview-img" />
	{/if}

	<div class="opt-section">
		<div class="opt-row">
			<span class="opt-label">Angle</span>
			<div class="flex gap-2 flex-wrap">
				{#each [90, 180, 270] as a}
					<button class="btn text-sm px-4 py-1.5 {angle === a ? 'highlight' : ''}" onclick={() => angle = a as RotationAngle}>{a}°</button>
				{/each}
			</div>
		</div>
	</div>

	{#if files.length > 0}
		<button class="btn highlight" disabled={processing} onclick={apply}>
			{processing ? 'Rotating…' : 'Rotate image'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBlob}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! Output: <b>{formatFileSize(resultBlob.size)}</b></p>
			<button class="btn" onclick={download}>Save rotated image</button>
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
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
	.preview-img { @apply max-h-64 rounded-xl object-contain mx-auto; }
</style>
