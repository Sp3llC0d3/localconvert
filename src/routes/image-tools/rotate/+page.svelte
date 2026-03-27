<script lang="ts">
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import { loadImage, canvasToBlob, downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { RotateCwIcon } from 'lucide-svelte';
	import type { RotationAngle } from '$lib/image/rotate';

	let files = $state<File[]>([]);
	let angle = $state<RotationAngle>(90);
	let error = $state('');
	let resultBlob = $state<Blob | null>(null);

	let imgEl = $state<HTMLImageElement | null>(null);
	let previewCanvas = $state<HTMLCanvasElement>();
	let rafId: number | null = null;

	$effect(() => {
		if (files.length === 0) {
			imgEl = null;
			resultBlob = null;
			return;
		}
		loadImage(files[0]).then((img) => {
			imgEl = img;
			resultBlob = null;
		});
	});

	// Live preview: redraw on angle change
	$effect(() => {
		void angle;
		if (!imgEl || !previewCanvas) return;
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			drawPreview();
			rafId = null;
		});
	});

	function drawPreview() {
		if (!previewCanvas || !imgEl) return;
		const ctx = previewCanvas.getContext('2d')!;
		const swap = angle === 90 || angle === 270;
		previewCanvas.width = swap ? imgEl.height : imgEl.width;
		previewCanvas.height = swap ? imgEl.width : imgEl.height;
		ctx.translate(previewCanvas.width / 2, previewCanvas.height / 2);
		ctx.rotate((angle * Math.PI) / 180);
		ctx.drawImage(imgEl, -imgEl.width / 2, -imgEl.height / 2);
	}

	async function save() {
		if (!previewCanvas) return;
		error = '';
		try {
			resultBlob = await canvasToBlob(previewCanvas, 'png');
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed.';
		}
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
			<p class="text-sm text-muted">Pick an angle and see the result instantly.</p>
		</div>
	</div>

	<ImageUploader bind:files label="Drop an image here" />

	{#if imgEl}
		<canvas bind:this={previewCanvas} class="live-preview"></canvas>

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

		<button class="btn highlight" onclick={save}>
			Save rotated image
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBlob}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! <b>{formatFileSize(resultBlob.size)}</b></p>
			<button class="btn" onclick={download}>Download</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style>
	.tool-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.tool-header { display: flex; align-items: center; gap: 0.75rem; }
	.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 5rem; flex-shrink: 0; }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.live-preview {
		max-width: 100%;
		max-height: 24rem;
		border-radius: 0.75rem;
		object-fit: contain;
		align-self: center;
		box-shadow: var(--shadow-panel);
	}
</style>
