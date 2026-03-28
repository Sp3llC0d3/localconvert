<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import BeforeAfter from '$lib/components/image/BeforeAfter.svelte';
	import { blurRegion, type BlurRect } from '$lib/image/blur';
	import { loadImage, downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { EyeOffIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBlob = $state<Blob | null>(null);
	let previewUrl = $state('');
	let beforeUrl = $state('');
	let afterUrl = $state('');

	let imgEl = $state<HTMLImageElement | null>(null);
	let containerEl = $state<HTMLDivElement>();
	let displayW = $state(0);
	let displayH = $state(0);
	let scale = $state(1);

	// Blur selection (image pixels)
	let rect = $state<BlurRect>({ x: 0, y: 0, width: 0, height: 0 });
	let radius = $state(15);

	// Drag state
	type DragMode = 'none' | 'draw' | 'move';
	let dragMode = $state<DragMode>('none');
	let dragOrigin = $state({ x: 0, y: 0 });
	let rectAtDragStart = $state<BlurRect>({ x: 0, y: 0, width: 0, height: 0 });

	$effect(() => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		if (beforeUrl) URL.revokeObjectURL(beforeUrl);
		if (afterUrl) URL.revokeObjectURL(afterUrl);
		previewUrl = ''; beforeUrl = ''; afterUrl = '';
		if (files.length === 0) {
			imgEl = null;
			resultBlob = null;
			return;
		}
		previewUrl = URL.createObjectURL(files[0]);
		loadImage(files[0]).then((img) => {
			imgEl = img;
			resultBlob = null;
			const maxW = Math.min(600, window.innerWidth - 48);
			const maxH = 500;
			const fitScale = Math.min(maxW / img.width, maxH / img.height, 1);
			displayW = Math.round(img.width * fitScale);
			displayH = Math.round(img.height * fitScale);
			scale = img.width / displayW;
			// Default selection: center 30%
			const margin = 0.35;
			rect = {
				x: Math.round(img.width * margin),
				y: Math.round(img.height * margin),
				width: Math.round(img.width * (1 - 2 * margin)),
				height: Math.round(img.height * (1 - 2 * margin)),
			};
		});
	});

	// Display-space rect
	const dRect = $derived({
		x: rect.x / scale,
		y: rect.y / scale,
		w: rect.width / scale,
		h: rect.height / scale,
	});

	function getPointerPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
		if (!containerEl) return { x: 0, y: 0 };
		const r = containerEl.getBoundingClientRect();
		const pos = 'touches' in e && e.touches.length > 0 ? e.touches[0] : (e as MouseEvent);
		return { x: pos.clientX - r.left, y: pos.clientY - r.top };
	}

	function isInsideRect(px: number, py: number): boolean {
		return px > dRect.x && px < dRect.x + dRect.w && py > dRect.y && py < dRect.y + dRect.h;
	}

	function onPointerDown(e: MouseEvent | TouchEvent) {
		if ('touches' in e) e.preventDefault();
		const pos = getPointerPos(e);
		if (isInsideRect(pos.x, pos.y)) {
			dragMode = 'move';
			dragOrigin = pos;
			rectAtDragStart = { ...rect };
		} else {
			dragMode = 'draw';
			dragOrigin = pos;
		}
	}

	function onPointerMove(e: MouseEvent | TouchEvent) {
		if (dragMode === 'none') {
			if (containerEl) {
				const pos = getPointerPos(e);
				containerEl.style.cursor = isInsideRect(pos.x, pos.y) ? 'move' : 'crosshair';
			}
			return;
		}
		if ('touches' in e) e.preventDefault();
		const pos = getPointerPos(e);

		if (dragMode === 'move') {
			const dx = (pos.x - dragOrigin.x) * scale;
			const dy = (pos.y - dragOrigin.y) * scale;
			rect = {
				x: Math.max(0, Math.min(imgEl!.width - rect.width, rectAtDragStart.x + dx)),
				y: Math.max(0, Math.min(imgEl!.height - rect.height, rectAtDragStart.y + dy)),
				width: rect.width,
				height: rect.height,
			};
		} else {
			const sx = dragOrigin.x * scale;
			const sy = dragOrigin.y * scale;
			const ex = Math.max(0, Math.min(imgEl!.width, pos.x * scale));
			const ey = Math.max(0, Math.min(imgEl!.height, pos.y * scale));
			rect = {
				x: Math.round(Math.min(sx, ex)),
				y: Math.round(Math.min(sy, ey)),
				width: Math.round(Math.abs(ex - sx)),
				height: Math.round(Math.abs(ey - sy)),
			};
		}
	}

	function onPointerUp() { dragMode = 'none'; }

	async function apply() {
		if (!files[0] || rect.width < 4 || rect.height < 4) {
			error = m['tool_pages.blur.err_area']();
			return;
		}
		error = '';
		processing = true;
		resultBlob = null;
		if (afterUrl) URL.revokeObjectURL(afterUrl);
		if (beforeUrl) URL.revokeObjectURL(beforeUrl);
		try {
			resultBlob = await blurRegion(files[0], rect, radius);
			beforeUrl = URL.createObjectURL(files[0]);
			afterUrl = URL.createObjectURL(resultBlob);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tools_common.failed']();
		}
		processing = false;
	}

	function download() {
		if (!resultBlob) return;
		downloadBlob(resultBlob, getOutputName(files[0].name, 'blurred', 'png'));
	}
</script>

<svelte:head>
	<title>Blur Region — LocalConvert</title>
	<meta name="description" content="Blur a region of any image for privacy. Draw a rectangle to blur faces, text, or sensitive areas. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/image-tools/blur/" />
</svelte:head>

<div class="blur-page">
	<ToolPageHeader
		category="image"
		title={m['tool_pages.blur.title']()}
		description={m['tool_pages.blur.desc']()}
		icon={EyeOffIcon}
		backHref="/image-tools/"
		backLabel={m['tools_common.back_image']()}
	/>

	<ImageUploader bind:files label={m['tools_common.upload_image']()} />

	{#if imgEl}
		<!-- Radius slider -->
		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">{m['tool_pages.blur.radius']()}</span>
				<input type="range" min={1} max={30} bind:value={radius} class="slider flex-1" aria-label="Blur radius" />
				<span class="val">{radius}px</span>
			</div>
		</div>

		<!-- Interactive preview -->
		<div class="preview-wrap">
			<div
				bind:this={containerEl}
				class="preview-container"
				style="width: {displayW}px; max-width: 100%; height: {displayH}px;"
				onmousedown={onPointerDown}
				onmousemove={onPointerMove}
				onmouseup={onPointerUp}
				onmouseleave={onPointerUp}
				ontouchstart={onPointerDown}
				ontouchmove={onPointerMove}
				ontouchend={onPointerUp}
				ontouchcancel={onPointerUp}
				role="application"
				aria-label="Draw rectangle to blur"
			>
				<img src={previewUrl} alt="Source" class="preview-img" draggable="false" />

				<!-- Selection overlay -->
				<div class="blur-selection" style="left: {dRect.x}px; top: {dRect.y}px; width: {dRect.w}px; height: {dRect.h}px;">
					<div class="blur-label">blur</div>
				</div>

				<!-- Border -->
				<div class="blur-border" style="left: {dRect.x}px; top: {dRect.y}px; width: {dRect.w}px; height: {dRect.h}px;"></div>
			</div>
			<p class="text-xs text-muted mt-2">{rect.width} × {rect.height} px — {m['tool_pages.blur.help']()}</p>
		</div>

		<button class="btn highlight" disabled={processing || rect.width < 4} onclick={apply}>
			{processing ? m['tool_pages.blur.btn_busy']() : m['tool_pages.blur.btn']()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBlob}
		{#if beforeUrl && afterUrl}
			<BeforeAfter beforeSrc={beforeUrl} afterSrc={afterUrl} />
		{/if}
		<div class="result-box">
			<p class="text-sm font-medium">{m['tools_common.ready']()} <b>{formatFileSize(resultBlob.size)}</b></p>
			<button class="btn" onclick={download}>{m['tools_common.download']()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style>
	.blur-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 4rem; flex-shrink: 0; }
	.slider { height: 6px; appearance: none; border-radius: 9999px; cursor: pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.val { font-size: 0.8125rem; color: var(--fg-muted); width: 2.5rem; text-align: right; flex-shrink: 0; }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }

	.preview-wrap { display: flex; flex-direction: column; align-items: center; }
	.preview-container {
		position: relative; user-select: none; -webkit-user-select: none; touch-action: none;
		border-radius: 0.5rem; overflow: hidden; box-shadow: var(--shadow-panel); cursor: crosshair;
	}
	.preview-img { display: block; width: 100%; height: 100%; pointer-events: none; }

	.blur-selection {
		position: absolute; pointer-events: none;
		background: rgba(255, 0, 0, 0.12);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}
	.blur-label {
		position: absolute; top: 4px; left: 4px;
		font-size: 0.5625rem; font-weight: 700; text-transform: uppercase;
		padding: 1px 5px; border-radius: 3px;
		background: rgba(220, 50, 50, 0.7); color: white;
	}
	.blur-border {
		position: absolute; pointer-events: none;
		border: 2px dashed rgba(220, 50, 50, 0.6);
	}
</style>
