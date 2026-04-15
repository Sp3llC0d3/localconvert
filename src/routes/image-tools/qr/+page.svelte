<script lang="ts">
	const __nkm = {'image_tools.tools.color_picker_name': image_tools_tools_color_picker_name, 'image_tools.tools.watermark_name': image_tools_tools_watermark_name, 'dev_tools.tools.base64_name': dev_tools_tools_base64_name};
	import { tools_common_failed, tool_pages_qr_low, tool_pages_qr_medium, tool_pages_qr_quartile, tool_pages_qr_high, tool_pages_qr_title, tool_pages_qr_desc, tools_common_back_image, tool_pages_qr_text_url, tools_common_size, tools_common_foreground, tools_common_background, tool_pages_qr_error_correction, tool_pages_qr_save, tools_common_ready, tool_pages_qr_save_file, tools_common_privacy_note_browser, tool_pages_img_qr_seo_faq1_q, tool_pages_img_qr_seo_faq1_a, tool_pages_img_qr_seo_faq2_q, tool_pages_img_qr_seo_faq2_a, image_tools_tools_color_picker_name, image_tools_tools_watermark_name, dev_tools_tools_base64_name } from "$lib/paraglide/messages/_barrel.js";
	import { browser } from '$app/environment';
	import { canvasToBlob, downloadBlob, getOutputName } from '$lib/image/utils';
	import { QrCodeIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { onDestroy } from 'svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let text = $state('https://localconvert.app');
	let size = $state(300);
	let fgColor = $state('#000000');
	let bgColor = $state('#ffffff');
	let errorLevel = $state<'L' | 'M' | 'Q' | 'H'>('M');
	let error = $state('');
	let resultBlob = $state<Blob | null>(null);

	let previewCanvas = $state<HTMLCanvasElement>();
	let rafId: number | null = null;

	// Live preview + clear stale result on any change
	$effect(() => {
		void text; void size; void fgColor; void bgColor; void errorLevel;
		resultBlob = null;
		if (!browser || !previewCanvas || !text.trim()) return;
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			renderQR();
			rafId = null;
		});
	});

	onDestroy(() => { if (rafId !== null) cancelAnimationFrame(rafId); });

	async function renderQR() {
		if (!previewCanvas || !text.trim()) return;
		try {
			const QRCode = (await import('qrcode')).default;
			await QRCode.toCanvas(previewCanvas, text, {
				width: size,
				margin: 2,
				color: { dark: fgColor, light: bgColor },
				errorCorrectionLevel: errorLevel,
			});
			error = '';
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tools_common_failed();
		}
	}

	async function save() {
		if (!previewCanvas) return;
		try {
			resultBlob = await canvasToBlob(previewCanvas, 'png');
		} catch {
			error = tools_common_failed();
		}
	}

	function download() {
		if (!resultBlob) return;
		downloadBlob(resultBlob, getOutputName('qrcode', '', 'png'));
	}

	const levels = [
		{ value: 'L' as const, label: tool_pages_qr_low() },
		{ value: 'M' as const, label: tool_pages_qr_medium() },
		{ value: 'Q' as const, label: tool_pages_qr_quartile() },
		{ value: 'H' as const, label: tool_pages_qr_high() },
	];
</script>

<svelte:head>
	<title>QR Code Generator — LocalConvert</title>
	<meta name="description" content="Generate QR codes from text or URLs. Customize colors, size, and error correction. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/image-tools/qr/" />
	<meta property="og:title" content="QR Code Generator — LocalConvert" />
	<meta property="og:description" content="Generate QR codes from text or URLs. Customize colors, size, and error correction. Free, private, no uploads." />
	<meta property="og:url" content="https://localconvert.app/image-tools/qr/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"How to Generate a QR Code","step":[{"@type":"HowToStep","text":"Enter the text or URL you want to encode"},{"@type":"HowToStep","text":"Customize the size and error correction level"},{"@type":"HowToStep","text":"Save the QR code as an image"}]}</script>`}
</svelte:head>

<div class="qr-page">
	<ToolPageHeader
		category="image"
		title={tool_pages_qr_title()}
		description={tool_pages_qr_desc()}
		icon={QrCodeIcon}
		backHref="/image-tools/"
		backLabel={tools_common_back_image()}
	/>

	<!-- Preview -->
	<div class="preview-wrap">
		<canvas bind:this={previewCanvas} class="qr-canvas"></canvas>
	</div>

	<!-- Options -->
	<div class="opt-section">
		<div class="field">
			<label for="qr-text" class="field-label">{tool_pages_qr_text_url()}</label>
			<input id="qr-text" type="text" bind:value={text} placeholder="https://example.com" class="field-input" />
		</div>
		<div class="opt-row">
			<span class="opt-label">{tools_common_size()}</span>
			<input type="range" min={100} max={800} step={50} bind:value={size} class="slider flex-1" aria-label="QR code size" />
			<span class="val">{size}px</span>
		</div>
		<div class="opt-row">
			<span class="opt-label">{tools_common_foreground()}</span>
			<input type="color" bind:value={fgColor} class="color-input" aria-label="Foreground color" />
			<span class="opt-label">{tools_common_background()}</span>
			<input type="color" bind:value={bgColor} class="color-input" aria-label="Background color" />
		</div>
		<div class="opt-row">
			<span class="opt-label">{tool_pages_qr_error_correction()}</span>
			<div class="flex gap-2 flex-wrap">
				{#each levels as lvl}
					<button class="btn text-xs px-2.5 py-1 {errorLevel === lvl.value ? 'highlight' : ''}" onclick={() => errorLevel = lvl.value}>{lvl.label}</button>
				{/each}
			</div>
		</div>
	</div>

	<button class="btn highlight" disabled={!text.trim()} onclick={save}>
		{tool_pages_qr_save()}
	</button>

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBlob}
		<div class="result-box">
			<p class="text-sm font-medium">{tools_common_ready()}</p>
			<button class="btn" onclick={download}>{tool_pages_qr_save_file()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note_browser()}</p>

	{#if toolSeo['img-qr']}
		<ToolSeoBlock
			faqs={toolSeo['img-qr'].faqKeys.length >= 4 ? [
				{ q: tool_pages_img_qr_seo_faq1_q?.() ?? '', a: tool_pages_img_qr_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_img_qr_seo_faq2_q?.() ?? '', a: tool_pages_img_qr_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['img-qr'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.qr-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.preview-wrap { display: flex; justify-content: center; }
	.qr-canvas { border-radius: 0.75rem; box-shadow: var(--shadow-panel); }
	.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 5rem; flex-shrink: 0; }
	.field { display: flex; flex-direction: column; gap: 0.25rem; }
	.field-label { font-size: 0.8125rem; font-weight: 600; }
	.field-input {
		padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; width: 100%;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.field-input:focus { outline: 1.5px solid var(--accent); }
	.slider { height: 6px; appearance: none; border-radius: 9999px; cursor: pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.val { font-size: 0.8125rem; color: var(--fg-muted); width: 2.5rem; text-align: right; flex-shrink: 0; }
	.color-input { width: 2rem; height: 2rem; border-radius: 0.375rem; cursor: pointer; border: 1px solid var(--bg-separator); padding: 0; }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
</style>
