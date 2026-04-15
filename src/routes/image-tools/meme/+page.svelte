<script lang="ts">
	const __nkm = {'image_tools.tools.watermark_name': image_tools_tools_watermark_name, 'image_tools.tools.filters_name': image_tools_tools_filters_name, 'image_tools.tools.crop_name': image_tools_tools_crop_name};
	import { tools_common_failed, tool_pages_meme_title, tool_pages_meme_desc, tools_common_back_image, tools_common_upload_image, tool_pages_meme_top_text, tool_pages_meme_bottom_text, tool_pages_meme_save, tools_common_ready, tools_common_download, tools_common_privacy_note, tool_pages_img_meme_seo_faq1_q, tool_pages_img_meme_seo_faq1_a, tool_pages_img_meme_seo_faq2_q, tool_pages_img_meme_seo_faq2_a, image_tools_tools_watermark_name, image_tools_tools_filters_name, image_tools_tools_crop_name } from "$lib/paraglide/messages/_barrel.js";
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import BeforeAfter from '$lib/components/image/BeforeAfter.svelte';
	import { loadImage, canvasToBlob, downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { SmileIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { onDestroy } from 'svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let topText = $state('');
	let bottomText = $state('');
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

	// Live preview: redraw on every text change
	$effect(() => {
		void topText;
		void bottomText;
		if (!imgEl || !previewCanvas) return;
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			drawPreview();
			rafId = null;
		});
	});

	onDestroy(() => { if (rafId !== null) cancelAnimationFrame(rafId); });

	function drawMemeText(ctx: CanvasRenderingContext2D, text: string, y: number, maxWidth: number) {
		const upper = text.toUpperCase();
		let fontSize = Math.min(maxWidth / 8, 72);
		ctx.font = `bold ${fontSize}px Impact, "Arial Black", sans-serif`;
		while (ctx.measureText(upper).width > maxWidth * 0.9 && fontSize > 16) {
			fontSize -= 2;
			ctx.font = `bold ${fontSize}px Impact, "Arial Black", sans-serif`;
		}
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.lineWidth = fontSize / 8;
		ctx.strokeStyle = '#000000';
		ctx.fillStyle = '#ffffff';
		ctx.lineJoin = 'round';
		ctx.strokeText(upper, maxWidth / 2, y);
		ctx.fillText(upper, maxWidth / 2, y);
	}

	function drawPreview() {
		if (!previewCanvas || !imgEl) return;
		const ctx = previewCanvas.getContext('2d')!;
		previewCanvas.width = imgEl.width;
		previewCanvas.height = imgEl.height;
		ctx.drawImage(imgEl, 0, 0);
		if (topText.trim()) {
			drawMemeText(ctx, topText, imgEl.height * 0.08 + 20, imgEl.width);
		}
		if (bottomText.trim()) {
			drawMemeText(ctx, bottomText, imgEl.height * 0.92 - 20, imgEl.width);
		}
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
		downloadBlob(resultBlob, getOutputName(files[0].name, 'meme', 'png'));
	}
</script>

<svelte:head>
	<title>Meme Generator — LocalConvert</title>
	<meta name="description" content="Create memes with custom top and bottom text. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/image-tools/meme/" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org", "@type": "HowTo", "name": "How to Create a Meme",
		"step": [
			{"@type": "HowToStep", "text": "Select an image to use as the meme background"},
			{"@type": "HowToStep", "text": "Enter top and bottom text"},
			{"@type": "HowToStep", "text": "Preview the meme live and save it"}
		]
	})}</script>`}
	<meta property="og:title" content="Meme Generator — LocalConvert" />
	<meta property="og:description" content="Create memes with custom top and bottom text. Free, private, no uploads — runs entirely in your browser." />
	<meta property="og:url" content="https://localconvert.app/image-tools/meme/" />
</svelte:head>

<div class="tool-page">
	<ToolPageHeader
		category="image"
		title={tool_pages_meme_title()}
		description={tool_pages_meme_desc()}
		icon={SmileIcon}
		backHref="/image-tools/"
		backLabel={tools_common_back_image()}
	/>

	<ImageUploader bind:files label={tools_common_upload_image()} />

	{#if imgEl}
		<!-- Live canvas preview -->
		<canvas
			bind:this={previewCanvas}
			class="live-preview"
		></canvas>

		<div class="opt-section">
			<div class="opt-row">
				<label class="opt-label" for="meme-top">{tool_pages_meme_top_text()}</label>
				<input id="meme-top" type="text" bind:value={topText} placeholder="TOP TEXT" class="opt-input flex-1" maxlength={100} />
			</div>
			<div class="opt-row">
				<label class="opt-label" for="meme-bottom">{tool_pages_meme_bottom_text()}</label>
				<input id="meme-bottom" type="text" bind:value={bottomText} placeholder="BOTTOM TEXT" class="opt-input flex-1" maxlength={100} />
			</div>
		</div>

		<button class="btn highlight" onclick={save} disabled={!topText.trim() && !bottomText.trim()}>
			{tool_pages_meme_save()}
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

	{#if toolSeo['img-meme']}
		<ToolSeoBlock
			faqs={toolSeo['img-meme'].faqKeys.length >= 4 ? [
				{ q: tool_pages_img_meme_seo_faq1_q?.() ?? '', a: tool_pages_img_meme_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_img_meme_seo_faq2_q?.() ?? '', a: tool_pages_img_meme_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['img-meme'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.tool-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 5rem; flex-shrink: 0; }
	.opt-input { border-radius: 0.5rem; padding: 0.375rem 0.75rem; font-size: 0.875rem; border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg); flex: 1; }
	.opt-input:focus { outline: 1.5px solid var(--accent); }
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
