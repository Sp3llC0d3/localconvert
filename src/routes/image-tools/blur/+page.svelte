<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import BeforeAfter from '$lib/components/image/BeforeAfter.svelte';
	import { blurRegions, type BlurRegion } from '$lib/image/blur';
	import { loadImage, downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { EyeOffIcon, Trash2Icon, XIcon, CheckIcon } from 'lucide-svelte';
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

	// Tool state
	let shapeMode = $state<'rect' | 'ellipse'>('rect');
	let radius = $state(15);
	let regions = $state<BlurRegion[]>([]);
	let selectedId = $state<string | null>(null);

	// Interaction state
	type DragMode = 'none' | 'draw' | 'move' | 'resize';
	let dragMode = $state<DragMode>('none');
	let dragOrigin = $state({ x: 0, y: 0 });
	let resizeHandle = $state('');
	let dragRegionSnap = $state<BlurRegion | null>(null);

	// File loading
	$effect(() => {
		void files;
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			if (beforeUrl) URL.revokeObjectURL(beforeUrl);
			if (afterUrl) URL.revokeObjectURL(afterUrl);
		};
	});

	$effect(() => {
		if (files.length === 0) {
			imgEl = null;
			resultBlob = null;
			previewUrl = '';
			beforeUrl = '';
			afterUrl = '';
			regions = [];
			selectedId = null;
			return;
		}
		resultBlob = null;
		beforeUrl = '';
		afterUrl = '';
		regions = [];
		selectedId = null;
		previewUrl = URL.createObjectURL(files[0]);
		loadImage(files[0]).then((img) => {
			imgEl = img;
			const maxW = Math.min(600, window.innerWidth - 48);
			const maxH = 500;
			const fitScale = Math.min(maxW / img.width, maxH / img.height, 1);
			displayW = Math.round(img.width * fitScale);
			displayH = Math.round(img.height * fitScale);
			scale = img.width / displayW;
		});
	});

	// Derived display rects for all regions
	const displayRegions = $derived(regions.map(r => ({
		...r,
		dx: r.x / scale,
		dy: r.y / scale,
		dw: r.width / scale,
		dh: r.height / scale,
	})));

	// ── Pointer helpers ──

	function getPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
		if (!containerEl) return { x: 0, y: 0 };
		const rect = containerEl.getBoundingClientRect();
		const pos = 'touches' in e && e.touches.length > 0 ? e.touches[0] : (e as MouseEvent);
		return { x: pos.clientX - rect.left, y: pos.clientY - rect.top };
	}

	function toImg(dx: number, dy: number) {
		return { x: dx * scale, y: dy * scale };
	}

	// ── Hit testing ──

	const HANDLE_SIZE = 6; // display px

	type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

	function getHandles(dr: { dx: number; dy: number; dw: number; dh: number; type: string }): { id: HandleId; cx: number; cy: number }[] {
		const { dx, dy, dw, dh, type } = dr;
		if (type === 'ellipse') {
			return [
				{ id: 'n',  cx: dx + dw / 2, cy: dy },
				{ id: 'e',  cx: dx + dw,     cy: dy + dh / 2 },
				{ id: 's',  cx: dx + dw / 2, cy: dy + dh },
				{ id: 'w',  cx: dx,           cy: dy + dh / 2 },
			];
		}
		return [
			{ id: 'nw', cx: dx,           cy: dy },
			{ id: 'n',  cx: dx + dw / 2, cy: dy },
			{ id: 'ne', cx: dx + dw,      cy: dy },
			{ id: 'e',  cx: dx + dw,      cy: dy + dh / 2 },
			{ id: 'se', cx: dx + dw,      cy: dy + dh },
			{ id: 's',  cx: dx + dw / 2, cy: dy + dh },
			{ id: 'sw', cx: dx,           cy: dy + dh },
			{ id: 'w',  cx: dx,           cy: dy + dh / 2 },
		];
	}

	function hitHandle(px: number, py: number): HandleId | null {
		if (!selectedId) return null;
		const dr = displayRegions.find(r => r.id === selectedId);
		if (!dr) return null;
		const pad = HANDLE_SIZE + 4;
		for (const h of getHandles(dr)) {
			if (Math.abs(px - h.cx) < pad && Math.abs(py - h.cy) < pad) return h.id;
		}
		return null;
	}

	function hitRegion(px: number, py: number): string | null {
		// Check in reverse order (topmost first)
		for (let i = displayRegions.length - 1; i >= 0; i--) {
			const r = displayRegions[i];
			if (r.type === 'ellipse') {
				const cx = r.dx + r.dw / 2, cy = r.dy + r.dh / 2;
				const rx = r.dw / 2, ry = r.dh / 2;
				if (rx > 0 && ry > 0 && ((px - cx) ** 2 / rx ** 2 + (py - cy) ** 2 / ry ** 2) <= 1) return r.id;
			} else {
				if (px >= r.dx && px <= r.dx + r.dw && py >= r.dy && py <= r.dy + r.dh) return r.id;
			}
		}
		return null;
	}

	// ── Cursor ──

	function updateCursor(px: number, py: number) {
		if (!containerEl) return;
		const h = hitHandle(px, py);
		if (h) {
			const cursors: Record<string, string> = {
				nw: 'nwse-resize', ne: 'nesw-resize', se: 'nwse-resize', sw: 'nesw-resize',
				n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
			};
			containerEl.style.cursor = cursors[h] || 'move';
			return;
		}
		if (hitRegion(px, py)) {
			containerEl.style.cursor = 'move';
			return;
		}
		containerEl.style.cursor = 'crosshair';
	}

	// ── Pointer events ──

	function onPointerDown(e: MouseEvent | TouchEvent) {
		if ('touches' in e) e.preventDefault();
		const pos = getPos(e);
		dragOrigin = pos;

		// 1. Handle resize
		const handle = hitHandle(pos.x, pos.y);
		if (handle && selectedId) {
			dragMode = 'resize';
			resizeHandle = handle;
			const r = regions.find(r => r.id === selectedId)!;
			dragRegionSnap = { ...r };
			return;
		}

		// 2. Hit existing region → select + move
		const hitId = hitRegion(pos.x, pos.y);
		if (hitId) {
			selectedId = hitId;
			dragMode = 'move';
			const r = regions.find(r => r.id === hitId)!;
			dragRegionSnap = { ...r };
			return;
		}

		// 3. Empty area → draw new
		selectedId = null;
		dragMode = 'draw';
		const imgPos = toImg(pos.x, pos.y);
		const newRegion: BlurRegion = {
			id: crypto.randomUUID(),
			type: shapeMode,
			x: imgPos.x,
			y: imgPos.y,
			width: 0,
			height: 0,
			opacity: 1,
		};
		regions = [...regions, newRegion];
		selectedId = newRegion.id;
	}

	function onPointerMove(e: MouseEvent | TouchEvent) {
		if (dragMode === 'none') {
			const pos = getPos(e);
			updateCursor(pos.x, pos.y);
			return;
		}
		if ('touches' in e) e.preventDefault();
		const pos = getPos(e);

		if (dragMode === 'draw') {
			const origin = toImg(dragOrigin.x, dragOrigin.y);
			const current = toImg(pos.x, pos.y);
			const ix = Math.max(0, Math.min(imgEl!.width, current.x));
			const iy = Math.max(0, Math.min(imgEl!.height, current.y));
			const r = regions.find(r => r.id === selectedId);
			if (r) {
				r.x = Math.min(origin.x, ix);
				r.y = Math.min(origin.y, iy);
				r.width = Math.abs(ix - origin.x);
				r.height = Math.abs(iy - origin.y);
			}
		} else if (dragMode === 'move' && dragRegionSnap) {
			const dx = (pos.x - dragOrigin.x) * scale;
			const dy = (pos.y - dragOrigin.y) * scale;
			const r = regions.find(r => r.id === selectedId);
			if (r) {
				r.x = Math.max(0, Math.min(imgEl!.width - r.width, dragRegionSnap.x + dx));
				r.y = Math.max(0, Math.min(imgEl!.height - r.height, dragRegionSnap.y + dy));
			}
		} else if (dragMode === 'resize' && dragRegionSnap) {
			const dx = (pos.x - dragOrigin.x) * scale;
			const dy = (pos.y - dragOrigin.y) * scale;
			const r = regions.find(r => r.id === selectedId);
			if (!r) return;
			const s = dragRegionSnap;
			const h = resizeHandle;

			let nx = s.x, ny = s.y, nw = s.width, nh = s.height;

			if (h.includes('w')) { nx = s.x + dx; nw = s.width - dx; }
			if (h.includes('e')) { nw = s.width + dx; }
			if (h.includes('n')) { ny = s.y + dy; nh = s.height - dy; }
			if (h.includes('s')) { nh = s.height + dy; }

			// Prevent negative sizes (flip)
			if (nw < 0) { nx += nw; nw = -nw; }
			if (nh < 0) { ny += nh; nh = -nh; }

			// Clamp to image
			nx = Math.max(0, nx);
			ny = Math.max(0, ny);
			nw = Math.min(imgEl!.width - nx, nw);
			nh = Math.min(imgEl!.height - ny, nh);

			r.x = nx; r.y = ny; r.width = nw; r.height = nh;
		}
	}

	function onPointerUp() {
		if (dragMode === 'draw') {
			// Remove too-small regions
			const r = regions.find(r => r.id === selectedId);
			if (r && (r.width < 10 || r.height < 10)) {
				regions = regions.filter(rr => rr.id !== r.id);
				selectedId = null;
			}
		}
		dragMode = 'none';
		dragRegionSnap = null;
	}

	// ── Actions ──

	function deleteRegion(id: string) {
		regions = regions.filter(r => r.id !== id);
		if (selectedId === id) selectedId = null;
	}

	function clearAll() {
		regions = [];
		selectedId = null;
	}

	async function apply() {
		if (!files[0] || regions.length === 0) {
			error = m['tool_pages.blur.err_area']();
			return;
		}
		error = '';
		processing = true;
		resultBlob = null;
		if (afterUrl) URL.revokeObjectURL(afterUrl);
		if (beforeUrl) URL.revokeObjectURL(beforeUrl);
		try {
			resultBlob = await blurRegions(files[0], regions, radius);
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
	<meta name="description" content="Blur regions of any image for privacy. Rectangle or ellipse shapes, multiple regions, adjustable strength. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/image-tools/blur/" />
	<meta property="og:title" content="Blur Region — LocalConvert" />
	<meta property="og:description" content="Blur regions of any image for privacy. Rectangle or ellipse shapes, multiple regions, adjustable strength. Free, private, no uploads." />
	<meta property="og:url" content="https://localconvert.app/image-tools/blur/" />
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
		<!-- Controls -->
		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">{m['tool_pages.blur.shape']()}</span>
				<div class="shape-btns">
					<button class="shape-btn" class:active={shapeMode === 'rect'} onclick={() => shapeMode = 'rect'}>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="10" rx="1"/></svg>
						Rectangle
					</button>
					<button class="shape-btn" class:active={shapeMode === 'ellipse'} onclick={() => shapeMode = 'ellipse'}>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="8" cy="8" rx="6" ry="5"/></svg>
						Ellipse
					</button>
				</div>
			</div>
			<div class="opt-row">
				<span class="opt-label">{m['tool_pages.blur.radius']()}</span>
				<input type="range" min={1} max={40} bind:value={radius} class="slider flex-1" aria-label="Blur radius" />
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
				aria-label="Draw regions to blur"
			>
				<img src={previewUrl} alt="Source" class="preview-img" draggable="false" />

				<!-- Region overlays -->
				{#each displayRegions as dr (dr.id)}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="blur-overlay"
						style="
							left: {dr.dx}px; top: {dr.dy}px;
							width: {dr.dw}px; height: {dr.dh}px;
							backdrop-filter: blur({radius}px);
							-webkit-backdrop-filter: blur({radius}px);
							border-radius: {dr.type === 'ellipse' ? '50%' : '0'};
						"
						onmousedown={(e) => { e.stopPropagation(); selectedId = dr.id; dragMode = 'move'; dragOrigin = getPos(e); dragRegionSnap = { ...regions.find(r => r.id === dr.id)! }; }}
					>
						{#if selectedId === dr.id}
							<div class="region-actions">
								<button class="region-btn region-delete" onmousedown={(e) => e.stopPropagation()} onclick={(e) => { e.stopPropagation(); deleteRegion(dr.id); }}>
									<XIcon size={10} />
								</button>
								<button class="region-btn region-confirm" onmousedown={(e) => e.stopPropagation()} onclick={(e) => { e.stopPropagation(); selectedId = null; }}>
									<CheckIcon size={10} />
								</button>
							</div>
						{/if}
					</div>

					<!-- Border -->
					<div
						class="blur-border"
						style="
							left: {dr.dx}px; top: {dr.dy}px;
							width: {dr.dw}px; height: {dr.dh}px;
							border-radius: {dr.type === 'ellipse' ? '50%' : '0'};
						"
					></div>

					<!-- Resize handles (selected only) -->
					{#if selectedId === dr.id}
						{#each getHandles(dr) as handle}
							<div
								class="resize-handle"
								style="left: {handle.cx - HANDLE_SIZE / 2}px; top: {handle.cy - HANDLE_SIZE / 2}px; width: {HANDLE_SIZE}px; height: {HANDLE_SIZE}px;"
							></div>
						{/each}
					{/if}
				{/each}
			</div>

			<div class="preview-info">
				<p class="text-xs text-muted">{regions.length} {regions.length === 1 ? 'region' : 'regions'} — {m['tool_pages.blur.help']()}</p>
				{#if regions.length > 0}
					<button class="clear-btn" onclick={clearAll}>
						<Trash2Icon size={12} />
						Clear all
					</button>
				{/if}
			</div>
		</div>

		<button class="btn highlight" disabled={processing || regions.length === 0} onclick={apply}>
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

	/* Shape buttons */
	.shape-btns { display: flex; gap: 0.375rem; }
	.shape-btn {
		display: flex; align-items: center; gap: 0.375rem;
		padding: 0.375rem 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600;
		border: 1.5px solid var(--bg-separator); background: var(--bg-panel-highlight);
		cursor: pointer; color: var(--fg); transition: border-color 0.15s, background 0.15s;
	}
	.shape-btn:hover { border-color: var(--accent); }
	.shape-btn.active { border-color: var(--accent); background: var(--bg-badge); color: var(--accent); }

	/* Preview */
	.preview-wrap { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
	.preview-container {
		position: relative; user-select: none; -webkit-user-select: none; touch-action: none;
		border-radius: 0.5rem; overflow: hidden; box-shadow: var(--shadow-panel); cursor: crosshair;
	}
	.preview-img { display: block; width: 100%; height: 100%; pointer-events: none; }
	.preview-info { display: flex; align-items: center; gap: 0.75rem; width: 100%; }

	/* Blur overlays */
	.blur-overlay {
		position: absolute; pointer-events: auto; cursor: move;
	}
	.blur-border {
		position: absolute; pointer-events: none;
		border: 1.5px dashed rgba(220, 50, 50, 0.4);
	}

	/* Region action buttons */
	.region-actions {
		position: absolute; top: -10px; right: -10px;
		display: flex; gap: 3px; z-index: 2;
	}
	.region-btn {
		width: 18px; height: 18px; border-radius: 50%;
		display: flex; align-items: center; justify-content: center;
		border: none; cursor: pointer; padding: 0; color: white;
		box-shadow: 0 1px 3px rgba(0,0,0,0.3);
	}
	.region-btn:hover { transform: scale(1.15); }
	.region-confirm { background: var(--accent); }
	.region-delete { background: var(--fg-failure, #e53e3e); }

	/* Resize handles */
	.resize-handle {
		position: absolute;
		background: white; border: 1.5px solid rgba(220, 50, 50, 0.7);
		border-radius: 1px; pointer-events: none; z-index: 1;
	}

	/* Clear button */
	.clear-btn {
		display: flex; align-items: center; gap: 0.25rem; margin-left: auto;
		padding: 0.25rem 0.5rem; border-radius: 0.375rem; font-size: 0.7rem;
		border: none; background: transparent; cursor: pointer; color: var(--fg-muted);
	}
	.clear-btn:hover { color: var(--fg-failure); }
</style>
