<script lang="ts">
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import { cropImage, type CropRect } from '$lib/image/crop';
	import { loadImage, downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { CropIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBlob = $state<Blob | null>(null);
	let previewUrl = $state('');

	let imgEl = $state<HTMLImageElement | null>(null);
	let containerEl = $state<HTMLDivElement>();
	let displayW = $state(0);
	let displayH = $state(0);
	let scale = $state(1); // ratio: image pixels / display pixels

	// Crop in image pixels
	let crop = $state<CropRect>({ x: 0, y: 0, width: 0, height: 0 });

	// Interaction state
	type DragMode = 'none' | 'draw' | 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
	let dragMode = $state<DragMode>('none');
	let dragOrigin = $state({ x: 0, y: 0 });
	let cropAtDragStart = $state<CropRect>({ x: 0, y: 0, width: 0, height: 0 });

	// Aspect ratio
	let aspectRatio = $state<string>('free');
	const ratios: { label: string; value: string }[] = [
		{ label: 'Free', value: 'free' },
		{ label: '1:1', value: '1' },
		{ label: '4:3', value: '1.333' },
		{ label: '16:9', value: '1.778' },
		{ label: '3:2', value: '1.5' },
	];

	$effect(() => {
		if (files.length === 0) {
			imgEl = null;
			previewUrl = '';
			resultBlob = null;
			return;
		}
		const url = URL.createObjectURL(files[0]);
		previewUrl = url;
		resultBlob = null;

		loadImage(files[0]).then((img) => {
			imgEl = img;
			const maxW = Math.min(600, window.innerWidth - 48);
			const maxH = 500;
			const fitScale = Math.min(maxW / img.width, maxH / img.height, 1);
			displayW = Math.round(img.width * fitScale);
			displayH = Math.round(img.height * fitScale);
			scale = img.width / displayW;
			// Default crop: centered 80%
			const margin = 0.1;
			crop = {
				x: Math.round(img.width * margin),
				y: Math.round(img.height * margin),
				width: Math.round(img.width * (1 - 2 * margin)),
				height: Math.round(img.height * (1 - 2 * margin)),
			};
		});

		return () => URL.revokeObjectURL(url);
	});

	// Display-space crop (for CSS positioning)
	const dCrop = $derived({
		x: crop.x / scale,
		y: crop.y / scale,
		w: crop.width / scale,
		h: crop.height / scale,
	});

	const handleSize = 10;

	function getPointerPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
		const pos = 'touches' in e && e.touches.length > 0 ? e.touches[0] : (e as MouseEvent);
		if (!containerEl) return { x: 0, y: 0 };
		const rect = containerEl.getBoundingClientRect();
		return {
			x: pos.clientX - rect.left,
			y: pos.clientY - rect.top,
		};
	}

	function clampCrop(c: CropRect): CropRect {
		if (!imgEl) return c;
		let { x, y, width, height } = c;
		width = Math.max(10, Math.min(width, imgEl.width));
		height = Math.max(10, Math.min(height, imgEl.height));
		x = Math.max(0, Math.min(x, imgEl.width - width));
		y = Math.max(0, Math.min(y, imgEl.height - height));
		return { x, y, width, height };
	}

	function enforceRatio(c: CropRect, anchor: 'se' | 'sw' | 'ne' | 'nw' | 'center'): CropRect {
		if (aspectRatio === 'free') return c;
		const ratio = parseFloat(aspectRatio);
		let { x, y, width, height } = c;
		// Adjust height to match ratio
		const newH = Math.round(width / ratio);
		if (anchor === 'nw' || anchor === 'ne') {
			y = y + height - newH;
		}
		height = newH;
		return { x, y, width, height };
	}

	function hitTest(px: number, py: number): DragMode {
		const h = handleSize / 2;
		const cx = dCrop.x, cy = dCrop.y, cw = dCrop.w, ch = dCrop.h;

		// Corner handles
		if (Math.abs(px - cx) < h && Math.abs(py - cy) < h) return 'nw';
		if (Math.abs(px - (cx + cw)) < h && Math.abs(py - cy) < h) return 'ne';
		if (Math.abs(px - cx) < h && Math.abs(py - (cy + ch)) < h) return 'sw';
		if (Math.abs(px - (cx + cw)) < h && Math.abs(py - (cy + ch)) < h) return 'se';

		// Edge handles
		if (Math.abs(px - cx) < h && py > cy && py < cy + ch) return 'w';
		if (Math.abs(px - (cx + cw)) < h && py > cy && py < cy + ch) return 'e';
		if (Math.abs(py - cy) < h && px > cx && px < cx + cw) return 'n';
		if (Math.abs(py - (cy + ch)) < h && px > cx && px < cx + cw) return 's';

		// Inside = move
		if (px > cx && px < cx + cw && py > cy && py < cy + ch) return 'move';

		return 'draw';
	}

	function getCursor(mode: DragMode): string {
		switch (mode) {
			case 'nw': case 'se': return 'nwse-resize';
			case 'ne': case 'sw': return 'nesw-resize';
			case 'n': case 's': return 'ns-resize';
			case 'e': case 'w': return 'ew-resize';
			case 'move': return 'move';
			default: return 'crosshair';
		}
	}

	function onPointerDown(e: MouseEvent | TouchEvent) {
		if ('touches' in e) e.preventDefault();
		const pos = getPointerPos(e);
		dragMode = hitTest(pos.x, pos.y);
		dragOrigin = pos;
		cropAtDragStart = { ...crop };

		if (dragMode === 'draw') {
			crop = {
				x: Math.round(pos.x * scale),
				y: Math.round(pos.y * scale),
				width: 0,
				height: 0,
			};
		}
	}

	function onPointerMove(e: MouseEvent | TouchEvent) {
		if (dragMode === 'none') {
			// Update cursor
			if (containerEl) {
				const pos = getPointerPos(e);
				containerEl.style.cursor = getCursor(hitTest(pos.x, pos.y));
			}
			return;
		}
		if ('touches' in e) e.preventDefault();
		const pos = getPointerPos(e);
		const dx = (pos.x - dragOrigin.x) * scale;
		const dy = (pos.y - dragOrigin.y) * scale;
		const s = cropAtDragStart;

		let newCrop: CropRect;

		switch (dragMode) {
			case 'move':
				newCrop = { x: s.x + dx, y: s.y + dy, width: s.width, height: s.height };
				break;
			case 'draw':
			case 'se':
				newCrop = dragMode === 'draw'
					? { x: crop.x, y: crop.y, width: Math.round(dx), height: Math.round(dy) }
					: { x: s.x, y: s.y, width: s.width + dx, height: s.height + dy };
				newCrop = enforceRatio(newCrop, 'se');
				break;
			case 'sw':
				newCrop = { x: s.x + dx, y: s.y, width: s.width - dx, height: s.height + dy };
				newCrop = enforceRatio(newCrop, 'sw');
				break;
			case 'ne':
				newCrop = { x: s.x, y: s.y + dy, width: s.width + dx, height: s.height - dy };
				newCrop = enforceRatio(newCrop, 'ne');
				break;
			case 'nw':
				newCrop = { x: s.x + dx, y: s.y + dy, width: s.width - dx, height: s.height - dy };
				newCrop = enforceRatio(newCrop, 'nw');
				break;
			case 'n':
				newCrop = { x: s.x, y: s.y + dy, width: s.width, height: s.height - dy };
				break;
			case 's':
				newCrop = { x: s.x, y: s.y, width: s.width, height: s.height + dy };
				break;
			case 'w':
				newCrop = { x: s.x + dx, y: s.y, width: s.width - dx, height: s.height };
				break;
			case 'e':
				newCrop = { x: s.x, y: s.y, width: s.width, height: s.height };
				newCrop.width = s.width + dx;
				break;
			default:
				return;
		}

		crop = clampCrop({
			x: Math.round(newCrop.x),
			y: Math.round(newCrop.y),
			width: Math.round(Math.abs(newCrop.width)),
			height: Math.round(Math.abs(newCrop.height)),
		});
	}

	function onPointerUp() {
		dragMode = 'none';
	}

	function resetCrop() {
		if (!imgEl) return;
		crop = { x: 0, y: 0, width: imgEl.width, height: imgEl.height };
	}

	async function apply() {
		if (files.length === 0 || crop.width < 4 || crop.height < 4) {
			error = 'Select a crop area on the image.';
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
	<meta name="description" content="Crop images with interactive handles. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/image-tools/crop/" />
</svelte:head>

<div class="tool-page">
	<a href="/image-tools/" class="text-sm text-muted hover:underline">← Image Tools</a>
	<div class="tool-header">
		<CropIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Crop Image</h1>
			<p class="text-sm text-muted">Drag corners, edges, or draw a new selection.</p>
		</div>
	</div>

	<ImageUploader bind:files label="Drop an image here" />

	{#if imgEl && previewUrl}
		<!-- Aspect ratio presets -->
		<div class="flex gap-2 flex-wrap">
			{#each ratios as r}
				<button
					class="btn text-sm px-3 py-1.5 {aspectRatio === r.value ? 'highlight' : ''}"
					onclick={() => { aspectRatio = r.value; }}
				>{r.label}</button>
			{/each}
			<button class="btn text-sm px-3 py-1.5" onclick={resetCrop}>Reset</button>
		</div>

		<!-- Crop workspace -->
		<div class="crop-workspace">
			<div
				bind:this={containerEl}
				class="crop-container"
				style="width: {displayW}px; height: {displayH}px;"
				onmousedown={onPointerDown}
				onmousemove={onPointerMove}
				onmouseup={onPointerUp}
				onmouseleave={onPointerUp}
				ontouchstart={onPointerDown}
				ontouchmove={onPointerMove}
				ontouchend={onPointerUp}
				ontouchcancel={onPointerUp}
				role="application"
				aria-label="Image crop selection"
			>
				<!-- Full image -->
				<img src={previewUrl} alt="Source" class="crop-img" draggable="false" />

				<!-- Dark overlay (4 regions around the crop) -->
				<div class="crop-shade" style="top: 0; left: 0; right: 0; height: {dCrop.y}px;"></div>
				<div class="crop-shade" style="top: {dCrop.y}px; left: 0; width: {dCrop.x}px; height: {dCrop.h}px;"></div>
				<div class="crop-shade" style="top: {dCrop.y}px; right: 0; left: {dCrop.x + dCrop.w}px; height: {dCrop.h}px;"></div>
				<div class="crop-shade" style="top: {dCrop.y + dCrop.h}px; left: 0; right: 0; bottom: 0;"></div>

				<!-- Crop border -->
				<div
					class="crop-border"
					style="left: {dCrop.x}px; top: {dCrop.y}px; width: {dCrop.w}px; height: {dCrop.h}px;"
				>
					<!-- Rule of thirds grid -->
					<div class="grid-line" style="left: 33.33%; top: 0; width: 1px; height: 100%;"></div>
					<div class="grid-line" style="left: 66.66%; top: 0; width: 1px; height: 100%;"></div>
					<div class="grid-line" style="top: 33.33%; left: 0; height: 1px; width: 100%;"></div>
					<div class="grid-line" style="top: 66.66%; left: 0; height: 1px; width: 100%;"></div>
				</div>

				<!-- Corner handles -->
				<div class="crop-handle nw" style="left: {dCrop.x - 5}px; top: {dCrop.y - 5}px;"></div>
				<div class="crop-handle ne" style="left: {dCrop.x + dCrop.w - 5}px; top: {dCrop.y - 5}px;"></div>
				<div class="crop-handle sw" style="left: {dCrop.x - 5}px; top: {dCrop.y + dCrop.h - 5}px;"></div>
				<div class="crop-handle se" style="left: {dCrop.x + dCrop.w - 5}px; top: {dCrop.y + dCrop.h - 5}px;"></div>

				<!-- Edge handles -->
				<div class="crop-handle-edge n" style="left: {dCrop.x + dCrop.w / 2 - 12}px; top: {dCrop.y - 3}px;"></div>
				<div class="crop-handle-edge s" style="left: {dCrop.x + dCrop.w / 2 - 12}px; top: {dCrop.y + dCrop.h - 3}px;"></div>
				<div class="crop-handle-edge w" style="left: {dCrop.x - 3}px; top: {dCrop.y + dCrop.h / 2 - 12}px;"></div>
				<div class="crop-handle-edge e" style="left: {dCrop.x + dCrop.w - 3}px; top: {dCrop.y + dCrop.h / 2 - 12}px;"></div>
			</div>

			<!-- Dimensions -->
			<p class="text-xs text-muted mt-2 text-center">{crop.width} × {crop.height} px</p>
		</div>

		<button class="btn highlight" disabled={processing || crop.width < 4} onclick={apply}>
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

<style>
	.tool-page {
		max-width: 42rem;
		margin: 0 auto;
		padding: 2.5rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.tool-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.result-box {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: 1rem;
		background: var(--bg-panel);
		box-shadow: var(--shadow-panel);
	}

	/* ── Crop workspace ── */
	.crop-workspace {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.crop-container {
		position: relative;
		user-select: none;
		-webkit-user-select: none;
		touch-action: none;
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: var(--shadow-panel);
	}

	.crop-img {
		display: block;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	/* ── Dark overlay regions ── */
	.crop-shade {
		position: absolute;
		background: rgba(0, 0, 0, 0.45);
		pointer-events: none;
	}

	/* ── Crop border ── */
	.crop-border {
		position: absolute;
		border: 2px solid rgba(255, 255, 255, 0.85);
		pointer-events: none;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
	}

	/* ── Rule of thirds grid ── */
	.grid-line {
		position: absolute;
		background: rgba(255, 255, 255, 0.25);
		pointer-events: none;
	}

	/* ── Corner handles ── */
	.crop-handle {
		position: absolute;
		width: 10px;
		height: 10px;
		background: white;
		border: 2px solid var(--accent, #0F6E56);
		border-radius: 2px;
		pointer-events: none;
		z-index: 10;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	/* ── Edge handles ── */
	.crop-handle-edge {
		position: absolute;
		pointer-events: none;
		z-index: 10;
		background: white;
		border: 1.5px solid var(--accent, #0F6E56);
		border-radius: 2px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
	}

	.crop-handle-edge.n,
	.crop-handle-edge.s {
		width: 24px;
		height: 6px;
	}

	.crop-handle-edge.w,
	.crop-handle-edge.e {
		width: 6px;
		height: 24px;
	}
</style>
