<script lang="ts">
	const __nkm = {'image_tools.tools.crop_name': image_tools_tools_crop_name, 'image_tools.tools.rotate_name': image_tools_tools_rotate_name, 'image_tools.tools.batch_name': image_tools_tools_batch_name};
	import { tools_common_failed, tool_pages_filters_brightness, tool_pages_filters_contrast, tool_pages_filters_saturation, tool_pages_filters_sepia, tool_pages_filters_hue, tool_pages_filters_title, tool_pages_filters_desc, tools_common_back_image, tools_common_upload_image, tools_common_reset, tool_pages_filters_save, tools_common_ready, tools_common_download, tools_common_privacy_note, tool_pages_img_filters_seo_faq1_q, tool_pages_img_filters_seo_faq1_a, tool_pages_img_filters_seo_faq2_q, tool_pages_img_filters_seo_faq2_a, image_tools_tools_crop_name, image_tools_tools_rotate_name, image_tools_tools_batch_name , navbar_home, navbar_image_tools, meta_descriptions_image_filters} from "$lib/paraglide/messages/_barrel.js";
	import { localizeHref } from '$lib/paraglide/runtime';
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import BeforeAfter from '$lib/components/image/BeforeAfter.svelte';
	import { buildFilterString, DEFAULT_FILTERS, type FilterOptions } from '$lib/image/filters';
	import { loadImage, canvasToBlob, downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { SlidersHorizontalIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { onDestroy } from 'svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

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
			error = e instanceof Error ? e.message : tools_common_failed();
		}
	}

	function download() {
		if (!resultBlob) return;
		downloadBlob(resultBlob, getOutputName(files[0].name, 'filtered', 'png'));
	}

	const sliders = [
		{ key: 'brightness' as const, label: () => tool_pages_filters_brightness(), min: 0, max: 200, unit: '%' },
		{ key: 'contrast' as const, label: () => tool_pages_filters_contrast(), min: 0, max: 200, unit: '%' },
		{ key: 'saturation' as const, label: () => tool_pages_filters_saturation(), min: 0, max: 200, unit: '%' },
		{ key: 'sepia' as const, label: () => tool_pages_filters_sepia(), min: 0, max: 100, unit: '%' },
		{ key: 'hue' as const, label: () => tool_pages_filters_hue(), min: 0, max: 360, unit: '°' },
	];
</script>

<svelte:head>
	<title>{tool_pages_filters_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_image_filters()} />
	<link rel="canonical" href="https://localconvert.app/image-tools/filters/" />
	<meta property="og:title" content="{tool_pages_filters_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_image_filters()} />
	<meta property="og:url" content="https://localconvert.app/image-tools/filters/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"How to Apply Filters to an Image","step":[{"@type":"HowToStep","text":"Select an image from your device"},{"@type":"HowToStep","text":"Browse and apply visual filters like grayscale, sepia, or blur"},{"@type":"HowToStep","text":"Adjust intensity and save the filtered image"}]}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":navbar_home(),"item":"https://localconvert.app"+localizeHref("/")},{"@type":"ListItem","position":2,"name":navbar_image_tools(),"item":"https://localconvert.app"+localizeHref("/image-tools/")},{"@type":"ListItem","position":3,"name":tool_pages_filters_title()}]})}</script>`}
</svelte:head>

<div class="filter-page">
	<ToolPageHeader
		category="image"
		title={tool_pages_filters_title()}
		description={tool_pages_filters_desc()}
		icon={SlidersHorizontalIcon}
		backHref="/image-tools/"
		backLabel={tools_common_back_image()}
	/>

	<ImageUploader bind:files label={tools_common_upload_image()} />

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
			<button class="btn text-sm px-3 py-1.5" onclick={resetFilters}>{tools_common_reset()}</button>
		</div>

		<button class="btn highlight" onclick={save}>
			{tool_pages_filters_save()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBlob}
		{#if beforeUrl && afterUrl}
			<BeforeAfter beforeSrc={beforeUrl} afterSrc={afterUrl} />
		{/if}
		<div class="result-box">
			<p class="text-sm font-medium">{tools_common_ready()} <b>{formatFileSize(resultBlob.size)}</b></p>
			<button class="btn" onclick={download}>{tools_common_download()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>

	{#if toolSeo['img-filters']}
		<ToolSeoBlock
			faqs={toolSeo['img-filters'].faqKeys.length >= 4 ? [
				{ q: tool_pages_img_filters_seo_faq1_q?.() ?? '', a: tool_pages_img_filters_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_img_filters_seo_faq2_q?.() ?? '', a: tool_pages_img_filters_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['img-filters'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.filter-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 5.5rem; flex-shrink: 0; }
	.slider { height: 6px; appearance: none; border-radius: 9999px; cursor: pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.val { font-size: 0.8125rem; color: var(--fg-muted); width: 2.5rem; text-align: end; flex-shrink: 0; }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.live-preview {
		max-width: 100%; max-height: 24rem; border-radius: 0.75rem;
		object-fit: contain; align-self: center; box-shadow: var(--shadow-panel);
	}
</style>
