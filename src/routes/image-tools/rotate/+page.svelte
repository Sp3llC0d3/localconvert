<script lang="ts">
	const __nkm = {'image_tools.tools.crop_name': image_tools_tools_crop_name, 'image_tools.tools.filters_name': image_tools_tools_filters_name, 'image_tools.tools.batch_name': image_tools_tools_batch_name};
	import { tools_common_failed, tool_pages_rotate_image_title, tool_pages_rotate_image_desc, tools_common_back_image, tools_common_upload_image, tools_common_angle, tool_pages_rotate_image_save, tools_common_ready, tools_common_download, tools_common_privacy_note, tool_pages_img_rotate_seo_faq1_q, tool_pages_img_rotate_seo_faq1_a, tool_pages_img_rotate_seo_faq2_q, tool_pages_img_rotate_seo_faq2_a, image_tools_tools_crop_name, image_tools_tools_filters_name, image_tools_tools_batch_name } from "$lib/paraglide/messages/_barrel.js";
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import BeforeAfter from '$lib/components/image/BeforeAfter.svelte';
	import { loadImage, canvasToBlob, downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { RotateCwIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { onDestroy } from 'svelte';
	import type { RotationAngle } from '$lib/image/rotate';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let angle = $state<RotationAngle>(90);
	let error = $state('');
	let resultBlob = $state<Blob | null>(null);
	let beforeUrl = $state('');
	let afterUrl = $state('');

	let imgEl = $state<HTMLImageElement | null>(null);
	let previewCanvas = $state<HTMLCanvasElement>();
	let rafId: number | null = null;

	$effect(() => {
		if (beforeUrl) { URL.revokeObjectURL(beforeUrl); beforeUrl = ''; }
		if (afterUrl) { URL.revokeObjectURL(afterUrl); afterUrl = ''; }
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

	onDestroy(() => { if (rafId !== null) cancelAnimationFrame(rafId); });

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
		downloadBlob(resultBlob, getOutputName(files[0].name, 'rotated', 'png'));
	}
</script>

<svelte:head>
	<title>Rotate Image — LocalConvert</title>
	<meta name="description" content="Rotate images 90°, 180°, or 270°. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/image-tools/rotate/" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org", "@type": "HowTo", "name": "How to Rotate an Image",
		"step": [
			{"@type": "HowToStep", "text": "Select an image file from your device"},
			{"@type": "HowToStep", "text": "Choose rotation angle: 90°, 180°, or 270°"},
			{"@type": "HowToStep", "text": "Save the rotated image"}
		]
	})}</script>`}
	<meta property="og:title" content="Rotate Image — LocalConvert" />
	<meta property="og:description" content="Rotate images 90°, 180°, or 270°. Free, private, no uploads — runs entirely in your browser." />
	<meta property="og:url" content="https://localconvert.app/image-tools/rotate/" />
</svelte:head>

<div class="tool-page">
	<ToolPageHeader
		category="image"
		title={tool_pages_rotate_image_title()}
		description={tool_pages_rotate_image_desc()}
		icon={RotateCwIcon}
		backHref="/image-tools/"
		backLabel={tools_common_back_image()}
	/>

	<ImageUploader bind:files label={tools_common_upload_image()} />

	{#if imgEl}
		<canvas bind:this={previewCanvas} class="live-preview"></canvas>

		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">{tools_common_angle()}</span>
				<div class="flex gap-2 flex-wrap">
					{#each [90, 180, 270] as a}
						<button class="btn text-sm px-4 py-1.5 {angle === a ? 'highlight' : ''}" onclick={() => angle = a as RotationAngle}>{a}°</button>
					{/each}
				</div>
			</div>
		</div>

		<button class="btn highlight" onclick={save}>
			{tool_pages_rotate_image_save()}
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

	{#if toolSeo['img-rotate']}
		<ToolSeoBlock
			faqs={toolSeo['img-rotate'].faqKeys.length >= 4 ? [
				{ q: tool_pages_img_rotate_seo_faq1_q?.() ?? '', a: tool_pages_img_rotate_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_img_rotate_seo_faq2_q?.() ?? '', a: tool_pages_img_rotate_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['img-rotate'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.tool-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
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
