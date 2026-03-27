<script lang="ts">
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import { cropImage, type CropRect } from '$lib/image/crop';
	import { loadImage, downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { CropIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBlob = $state<Blob | null>(null);

	let canvasEl = $state<HTMLCanvasElement>();
	let imgEl = $state<HTMLImageElement | null>(null);
	let scale = $state(1);

	// Crop selection state (in image pixels)
	let crop = $state<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
	let dragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });

	$effect(() => {
		if (files.length === 0) {
			imgEl = null;
			resultBlob = null;
			return;
		}
		loadImage(files[0]).then((img) => {
			imgEl = img;
			// Fit canvas to container (max 600px wide)
			const maxW = 600;
			scale = img.width > maxW ? maxW / img.width : 1;
			crop = { x: 0, y: 0, width: img.width, height: img.height };
			resultBlob = null;
			drawPreview();
		});
	});

	function drawPreview() {
		if (!canvasEl || !imgEl) return;
		const ctx = canvasEl.getContext('2d')!;
		canvasEl.width = imgEl.width * scale;
		canvasEl.height = imgEl.height * scale;

		// Draw full image dimmed
		ctx.globalAlpha = 0.3;
		ctx.drawImage(imgEl, 0, 0, canvasEl.width, canvasEl.height);

		// Draw crop area bright
		ctx.globalAlpha = 1;
		ctx.drawImage(
			imgEl,
			crop.x, crop.y, crop.width, crop.height,
			crop.x * scale, crop.y * scale, crop.width * scale, crop.height * scale,
		);

		// Draw crop border
		ctx.strokeStyle = '#0F6E56';
		ctx.lineWidth = 2;
		ctx.setLineDash([6, 3]);
		ctx.strokeRect(crop.x * scale, crop.y * scale, crop.width * scale, crop.height * scale);
		ctx.setLineDash([]);
	}

	$effect(() => {
		void crop;
		drawPreview();
	});

	function getPointerPos(e: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
		if ('touches' in e && e.touches.length > 0) return e.touches[0];
		return e as MouseEvent;
	}

	function onPointerDown(e: MouseEvent | TouchEvent) {
		if (!canvasEl) return;
		if ('touches' in e) e.preventDefault();
		const pos = getPointerPos(e);
		const rect = canvasEl.getBoundingClientRect();
		dragStart = {
			x: (pos.clientX - rect.left) / scale,
			y: (pos.clientY - rect.top) / scale,
		};
		dragging = true;
	}

	function onPointerMove(e: MouseEvent | TouchEvent) {
		if (!dragging || !canvasEl || !imgEl) return;
		if ('touches' in e) e.preventDefault();
		const pos = getPointerPos(e);
		const rect = canvasEl.getBoundingClientRect();
		const mx = Math.max(0, Math.min(imgEl.width, (pos.clientX - rect.left) / scale));
		const my = Math.max(0, Math.min(imgEl.height, (pos.clientY - rect.top) / scale));

		crop = {
			x: Math.round(Math.min(dragStart.x, mx)),
			y: Math.round(Math.min(dragStart.y, my)),
			width: Math.round(Math.abs(mx - dragStart.x)),
			height: Math.round(Math.abs(my - dragStart.y)),
		};
	}

	function onPointerUp() {
		dragging = false;
	}

	async function apply() {
		if (files.length === 0 || crop.width < 1 || crop.height < 1) {
			error = 'Draw a crop area on the image.';
			return;
		}
		error = '';
		processing = true;
		resultBlob = null;
		try {
			resultBlob = await cropImage(files[0], crop);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed.';
		}
		processing = false;
	}

	function download() {
		if (!resultBlob) return;
		downloadBlob(resultBlob, getOutputName(files[0].name, 'cropped', 'png'));
	}
</script>

<svelte:head>
	<title>Crop Image — LocalConvert</title>
	<meta name="description" content="Crop images by drawing a selection. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/image-tools/crop/" />
</svelte:head>

<div class="tool-page">
	<a href="/image-tools/" class="text-sm text-muted hover:underline">← Image Tools</a>
	<div class="tool-header">
		<CropIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Crop Image</h1>
			<p class="text-sm text-muted">Draw a rectangle to crop any area of the image.</p>
		</div>
	</div>

	<ImageUploader bind:files label="Drop an image here" />

	{#if imgEl}
		<div class="canvas-wrap">
			<canvas
				bind:this={canvasEl}
				class="crop-canvas"
				aria-label="Image crop selection"
				onmousedown={onPointerDown}
				onmousemove={onPointerMove}
				onmouseup={onPointerUp}
				onmouseleave={onPointerUp}
				ontouchstart={onPointerDown}
				ontouchmove={onPointerMove}
				ontouchend={onPointerUp}
				ontouchcancel={onPointerUp}
			></canvas>
			<p class="text-xs text-muted mt-1">Click and drag to select crop area — {crop.width} × {crop.height} px</p>
		</div>

		<button class="btn highlight" disabled={processing || crop.width < 1} onclick={apply}>
			{processing ? 'Cropping…' : 'Crop image'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBlob}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! Output: <b>{formatFileSize(resultBlob.size)}</b></p>
			<button class="btn" onclick={download}>Save cropped image</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style lang="postcss">
	.tool-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
	.tool-header { @apply flex items-center gap-3; }
	.canvas-wrap { @apply flex flex-col items-center; }
	.crop-canvas { @apply rounded-xl cursor-crosshair max-w-full; border: 1px solid var(--bg-separator); touch-action: none; }
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
</style>
