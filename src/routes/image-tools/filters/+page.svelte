<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import BeforeAfter from '$lib/components/image/BeforeAfter.svelte';
	import { buildFilterString, DEFAULT_FILTERS, type FilterOptions } from '$lib/image/filters';
	import { loadImage, canvasToBlob, downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { SlidersHorizontalIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { onDestroy } from 'svelte';

	let files = $state<File[]>([]);
	let error = $state('');
	let resultBlob = $state<Blob | null>(null);
	let beforeUrl = $state('');
	let afterUrl = $state('');

	let imgEl = $state<HTMLImageElement | null>(null);
	let previewCanvas = $state<HTMLCanvasElement>();
	let rafId: number | null = null;

	let filters = $state<FilterOptions>({ ...DEFAULT_FILTERS });

	$effect(() => {
		if (beforeUrl) URL.revokeObjectURL(beforeUrl);
		if (afterUrl) URL.revokeObjectURL(afterUrl);
		beforeUrl = ''; afterUrl = '';
		if (files.length === 0) {
			imgEl = null;
			resultBlob = null;
			return;
		}
		loadImage(files[0]).then((img) => {
			imgEl = img;
			resultBlob = null;
			filters = { ...DEFAULT_FILTERS };
		});
	});

	// Live preview
	$effect(() => {
		void filters.brightness; void filters.contrast; void filters.saturation; void filters.sepia; void filters.hue;
		if (!imgEl || !previewCanvas) return;
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			drawPreview();
			rafId = null;
		});
	});

	onDestroy(() => { if (rafId !== null) cancelAnimationFrame(rafId); });

	function drawPreview() {
		if (!previewCanvas || !imgEl) return;
		const ctx = previewCanvas.getContext('2d')!;
		previewCanvas.width = imgEl.width;
		previewCanvas.height = imgEl.height;
		ctx.filter = buildFilterString(filters);
		ctx.drawImage(imgEl, 0, 0);
	}

	function resetFilters() {
		filters = { ...DEFAULT_FILTERS };
	}

	async function save() {
		if (!previewCanvas || !files[0]) return;
		error = '';
		if (afterUrl) URL.revokeObjectURL(afterUrl);
		if (beforeUrl) URL.revokeObjectURL(beforeUrl);
		try {
			resultBlob = await canvasToBlob(previewCanvas, 'png');
			beforeUrl = URL.createObjectURL(files[0]);
			afterUrl = URL.createObjectURL(resultBlob);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tools_common.failed']();
		}
	}

	function download() {
		if (!resultBlob) return;
		downloadBlob(resultBlob, getOutputName(files[0].name, 'filtered', 'png'));
	}

	const sliders = [
		{ key: 'brightness' as const, label: () => m['tool_pages.filters.brightness'](), min: 0, max: 200, unit: '%' },
		{ key: 'contrast' as const, label: () => m['tool_pages.filters.contrast'](), min: 0, max: 200, unit: '%' },
		{ key: 'saturation' as const, label: () => m['tool_pages.filters.saturation'](), min: 0, max: 200, unit: '%' },
		{ key: 'sepia' as const, label: () => m['tool_pages.filters.sepia'](), min: 0, max: 100, unit: '%' },
		{ key: 'hue' as const, label: () => m['tool_pages.filters.hue'](), min: 0, max: 360, unit: '°' },
	];
</script>

<svelte:head>
	<title>Image Filters — LocalConvert</title>
	<meta name="description" content="Adjust brightness, contrast, saturation, sepia, and hue of any image. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/image-tools/filters/" />
</svelte:head>

<div class="filter-page">
	<ToolPageHeader
		category="image"
		title={m['tool_pages.filters.title']()}
		description={m['tool_pages.filters.desc']()}
		icon={SlidersHorizontalIcon}
		backHref="/image-tools/"
		backLabel={m['tools_common.back_image']()}
	/>

	<ImageUploader bind:files label={m['tools_common.upload_image']()} />

	{#if imgEl}
		<canvas bind:this={previewCanvas} class="live-preview"></canvas>

		<div class="opt-section">
			{#each sliders as s}
				<div class="opt-row">
					<span class="opt-label">{s.label()}</span>
					<input type="range" min={s.min} max={s.max} bind:value={filters[s.key]} class="slider flex-1" aria-label={s.label()} />
					<span class="val">{filters[s.key]}{s.unit}</span>
				</div>
			{/each}
			<button class="btn text-sm px-3 py-1.5" onclick={resetFilters}>{m['tools_common.reset']()}</button>
		</div>

		<button class="btn highlight" onclick={save}>
			{m['tool_pages.filters.save']()}
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
	.filter-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 5.5rem; flex-shrink: 0; }
	.slider { height: 6px; appearance: none; border-radius: 9999px; cursor: pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.val { font-size: 0.8125rem; color: var(--fg-muted); width: 2.5rem; text-align: right; flex-shrink: 0; }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.live-preview {
		max-width: 100%; max-height: 24rem; border-radius: 0.75rem;
		object-fit: contain; align-self: center; box-shadow: var(--shadow-panel);
	}
</style>
