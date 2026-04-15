<script lang="ts">
	const __nkm = {'image_tools.tools.meme_name': image_tools_tools_meme_name, 'image_tools.tools.crop_name': image_tools_tools_crop_name, 'image_tools.tools.batch_name': image_tools_tools_batch_name};
	import { tools_common_failed, tool_pages_watermark_image_title, tool_pages_watermark_image_desc, tools_common_back_image, tools_common_upload_image, tools_common_text, tools_common_opacity, tools_common_font_size, tools_common_rotation, tools_common_position, tools_common_center, tools_common_tile, tool_pages_watermark_image_save, tools_common_ready, tools_common_download, tools_common_privacy_note, tool_pages_img_watermark_seo_faq1_q, tool_pages_img_watermark_seo_faq1_a, tool_pages_img_watermark_seo_faq2_q, tool_pages_img_watermark_seo_faq2_a, image_tools_tools_meme_name, image_tools_tools_crop_name, image_tools_tools_batch_name, aria_watermark_placeholder, aria_opacity, aria_font_size, aria_rotation } from "$lib/paraglide/messages/_barrel.js";
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import BeforeAfter from '$lib/components/image/BeforeAfter.svelte';
	import { loadImage, canvasToBlob, downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { DropletIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { onDestroy } from 'svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let text = $state('CONFIDENTIAL');
	let opacity = $state(30);
	let fontSize = $state(48);
	let rotation = $state(-30);
	let position = $state<'center' | 'tile'>('center');
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

	// Live preview: redraw on every option change
	$effect(() => {
		void text; void opacity; void fontSize; void rotation; void position;
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

		ctx.drawImage(imgEl, 0, 0);
		if (!text.trim()) return;

		ctx.globalAlpha = opacity / 100;
		ctx.fillStyle = '#888888';
		ctx.font = `bold ${fontSize}px sans-serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		if (position === 'tile') {
			const metric = ctx.measureText(text);
			const tileW = metric.width + 80;
			const tileH = fontSize * 3;
			for (let y = -imgEl.height; y < imgEl.height * 2; y += tileH) {
				for (let x = -imgEl.width; x < imgEl.width * 2; x += tileW) {
					ctx.save();
					ctx.translate(x, y);
					ctx.rotate((rotation * Math.PI) / 180);
					ctx.fillText(text, 0, 0);
					ctx.restore();
				}
			}
		} else {
			ctx.save();
			ctx.translate(imgEl.width / 2, imgEl.height / 2);
			ctx.rotate((rotation * Math.PI) / 180);
			ctx.fillText(text, 0, 0);
			ctx.restore();
		}
		ctx.globalAlpha = 1;
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
		downloadBlob(resultBlob, getOutputName(files[0].name, 'watermarked', 'png'));
	}
</script>

<svelte:head>
	<title>{tool_pages_watermark_image_title()} — LocalConvert</title>
	<meta name="description" content="Add text watermarks to images. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/image-tools/watermark/" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org", "@type": "HowTo", "name": "How to Add a Watermark to an Image",
		"step": [
			{"@type": "HowToStep", "text": "Select an image file from your device"},
			{"@type": "HowToStep", "text": "Enter watermark text and adjust opacity, size, and rotation"},
			{"@type": "HowToStep", "text": "Choose center or tiled placement"},
			{"@type": "HowToStep", "text": "Save the watermarked image"}
		]
	})}</script>`}
	<meta property="og:title" content="Watermark Image — LocalConvert" />
	<meta property="og:description" content="Add text watermarks to images. Free, private, no uploads — runs entirely in your browser." />
	<meta property="og:url" content="https://localconvert.app/image-tools/watermark/" />
</svelte:head>

<div class="tool-page">
	<ToolPageHeader
		category="image"
		title={tool_pages_watermark_image_title()}
		description={tool_pages_watermark_image_desc()}
		icon={DropletIcon}
		backHref="/image-tools/"
		backLabel={tools_common_back_image()}
	/>

	<ImageUploader bind:files label={tools_common_upload_image()} />

	{#if imgEl}
		<canvas bind:this={previewCanvas} class="live-preview"></canvas>

		<div class="opt-section">
			<div class="opt-row">
				<label class="opt-label" for="wm-text">{tools_common_text()}</label>
				<input id="wm-text" type="text" bind:value={text} placeholder={aria_watermark_placeholder()} class="opt-input flex-1" maxlength={80} />
			</div>
			<div class="opt-row">
				<span class="opt-label">{tools_common_opacity()}</span>
				<input type="range" min={5} max={80} bind:value={opacity} class="slider flex-1" aria-label={aria_opacity()} />
				<span class="val">{opacity}%</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">{tools_common_font_size()}</span>
				<input type="range" min={16} max={120} bind:value={fontSize} class="slider flex-1" aria-label={aria_font_size()} />
				<span class="val">{fontSize}px</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">{tools_common_rotation()}</span>
				<input type="range" min={-90} max={90} bind:value={rotation} class="slider flex-1" aria-label={aria_rotation()} />
				<span class="val">{rotation}°</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">{tools_common_position()}</span>
				<div class="flex gap-2">
					<button class="btn text-sm px-3 py-1.5 {position === 'center' ? 'highlight' : ''}" onclick={() => position = 'center'}>{tools_common_center()}</button>
					<button class="btn text-sm px-3 py-1.5 {position === 'tile' ? 'highlight' : ''}" onclick={() => position = 'tile'}>{tools_common_tile()}</button>
				</div>
			</div>
		</div>

		<button class="btn highlight" onclick={save} disabled={!text.trim()}>
			{tool_pages_watermark_image_save()}
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

	{#if toolSeo['img-watermark']}
		<ToolSeoBlock
			faqs={toolSeo['img-watermark'].faqKeys.length >= 4 ? [
				{ q: tool_pages_img_watermark_seo_faq1_q?.() ?? '', a: tool_pages_img_watermark_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_img_watermark_seo_faq2_q?.() ?? '', a: tool_pages_img_watermark_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['img-watermark'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.tool-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 5rem; flex-shrink: 0; }
	.opt-input { border-radius: 0.5rem; padding: 0.375rem 0.75rem; font-size: 0.875rem; border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg); }
	.opt-input:focus { outline: 1.5px solid var(--accent); }
	.slider { height: 6px; appearance: none; border-radius: 9999px; cursor: pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.val { font-size: 0.8125rem; color: var(--fg-muted); width: 2.5rem; text-align: end; flex-shrink: 0; }
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
