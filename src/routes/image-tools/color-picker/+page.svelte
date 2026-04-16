<script lang="ts">
	const __nkm = {'image_tools.tools.filters_name': image_tools_tools_filters_name, 'image_tools.tools.crop_name': image_tools_tools_crop_name, 'dev_tools.tools.css_minify_name': dev_tools_tools_css_minify_name};
	import { tool_pages_color_picker_title, tool_pages_color_picker_desc, tools_common_back_image, tools_common_upload_image, tools_common_privacy_note, tool_pages_img_color_picker_seo_faq1_q, tool_pages_img_color_picker_seo_faq1_a, tool_pages_img_color_picker_seo_faq2_q, tool_pages_img_color_picker_seo_faq2_a, image_tools_tools_filters_name, image_tools_tools_crop_name, dev_tools_tools_css_minify_name , navbar_home, navbar_image_tools, meta_descriptions_image_color_picker} from "$lib/paraglide/messages/_barrel.js";
	import { localizeHref } from '$lib/paraglide/runtime';
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import { loadImage } from '$lib/image/utils';
	import { PipetteIcon, CopyIcon, CheckIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let imgEl = $state<HTMLImageElement | null>(null);
	let canvasEl = $state<HTMLCanvasElement>();
	let displayW = $state(0);
	let displayH = $state(0);

	let pickedColor = $state<{ hex: string; rgb: string; hsl: string } | null>(null);
	let cursorColor = $state('');
	let cursorPos = $state({ x: 0, y: 0 });
	let showCursor = $state(false);
	let copiedLabel = $state('');

	$effect(() => {
		if (files.length === 0) {
			imgEl = null;
			pickedColor = null;
			return;
		}
		loadImage(files[0]).then((img) => {
			imgEl = img;
			pickedColor = null;
			const maxW = Math.min(600, window.innerWidth - 48);
			const maxH = 500;
			const scale = Math.min(maxW / img.width, maxH / img.height, 1);
			displayW = Math.round(img.width * scale);
			displayH = Math.round(img.height * scale);
			drawCanvas();
		});
	});

	function drawCanvas() {
		if (!canvasEl || !imgEl) return;
		canvasEl.width = imgEl.width;
		canvasEl.height = imgEl.height;
		const ctx = canvasEl.getContext('2d')!;
		ctx.drawImage(imgEl, 0, 0);
	}

	function getColorAt(e: MouseEvent): { r: number; g: number; b: number } | null {
		if (!canvasEl || !imgEl) return null;
		const rect = canvasEl.getBoundingClientRect();
		const scaleX = imgEl.width / rect.width;
		const scaleY = imgEl.height / rect.height;
		const x = Math.round((e.clientX - rect.left) * scaleX);
		const y = Math.round((e.clientY - rect.top) * scaleY);
		if (x < 0 || y < 0 || x >= imgEl.width || y >= imgEl.height) return null;
		const ctx = canvasEl.getContext('2d')!;
		const data = ctx.getImageData(x, y, 1, 1).data;
		return { r: data[0], g: data[1], b: data[2] };
	}

	function toHex(r: number, g: number, b: number): string {
		return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
	}

	function toHsl(r: number, g: number, b: number): string {
		const rn = r / 255, gn = g / 255, bn = b / 255;
		const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
		const l = (max + min) / 2;
		if (max === min) return `hsl(0, 0%, ${Math.round(l * 100)}%)`;
		const d = max - min;
		const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		let h = 0;
		if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
		else if (max === gn) h = ((bn - rn) / d + 2) / 6;
		else h = ((rn - gn) / d + 4) / 6;
		return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
	}

	function onMove(e: MouseEvent) {
		const c = getColorAt(e);
		if (!c) { showCursor = false; return; }
		showCursor = true;
		cursorColor = toHex(c.r, c.g, c.b);
		const rect = canvasEl!.getBoundingClientRect();
		cursorPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
	}

	function onClick(e: MouseEvent) {
		const c = getColorAt(e);
		if (!c) return;
		pickedColor = {
			hex: toHex(c.r, c.g, c.b),
			rgb: `rgb(${c.r}, ${c.g}, ${c.b})`,
			hsl: toHsl(c.r, c.g, c.b),
		};
		copiedLabel = '';
	}

	function onLeave() { showCursor = false; }

	async function copyColor(label: string, text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copiedLabel = label;
			setTimeout(() => copiedLabel = '', 1500);
		} catch { /* clipboard API may fail in insecure context */ }
	}
</script>

<svelte:head>
	<title>{tool_pages_color_picker_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_image_color_picker()} />
	<link rel="canonical" href="https://localconvert.app/image-tools/color-picker/" />
	<meta property="og:title" content="{tool_pages_color_picker_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_image_color_picker()} />
	<meta property="og:url" content="https://localconvert.app/image-tools/color-picker/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"How to Pick Colors from an Image","step":[{"@type":"HowToStep","text":"Select an image from your device"},{"@type":"HowToStep","text":"Click anywhere on the image to pick a color"},{"@type":"HowToStep","text":"Copy the color code in HEX, RGB, or HSL format"}]}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":navbar_home(),"item":"https://localconvert.app"+localizeHref("/")},{"@type":"ListItem","position":2,"name":navbar_image_tools(),"item":"https://localconvert.app"+localizeHref("/image-tools/")},{"@type":"ListItem","position":3,"name":tool_pages_color_picker_title()}]})}</script>`}
</svelte:head>

<div class="picker-page">
	<ToolPageHeader
		category="image"
		title={tool_pages_color_picker_title()}
		description={tool_pages_color_picker_desc()}
		icon={PipetteIcon}
		backHref="/image-tools/"
		backLabel={tools_common_back_image()}
	/>

	<ImageUploader bind:files label={tools_common_upload_image()} />

	{#if imgEl}
		<div class="canvas-wrap" dir="ltr">
			<canvas
				bind:this={canvasEl}
				class="picker-canvas"
				style="width: {displayW}px; height: {displayH}px;"
				onmousemove={onMove}
				onclick={onClick}
				onmouseleave={onLeave}
			></canvas>
			{#if showCursor}
				<div
					class="cursor-preview"
					style="left: {cursorPos.x + 16}px; top: {cursorPos.y - 40}px; background: {cursorColor};"
				>
					<span class="cursor-hex">{cursorColor}</span>
				</div>
			{/if}
		</div>
	{/if}

	{#if pickedColor}
		<div class="color-result">
			<div class="color-swatch" style="background: {pickedColor.hex};"></div>
			<div class="color-values">
				{#each [{ label: 'HEX', value: pickedColor.hex }, { label: 'RGB', value: pickedColor.rgb }, { label: 'HSL', value: pickedColor.hsl }] as cv}
					<div class="color-row">
						<span class="color-label">{cv.label}</span>
						<code class="color-code">{cv.value}</code>
						<button class="copy-btn" onclick={() => copyColor(cv.label, cv.value)} aria-label="Copy {cv.label}">
							{#if copiedLabel === cv.label}
								<CheckIcon size={14} />
							{:else}
								<CopyIcon size={14} />
							{/if}
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>

	{#if toolSeo['img-color-picker']}
		<ToolSeoBlock
			faqs={toolSeo['img-color-picker'].faqKeys.length >= 4 ? [
				{ q: tool_pages_img_color_picker_seo_faq1_q?.() ?? '', a: tool_pages_img_color_picker_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_img_color_picker_seo_faq2_q?.() ?? '', a: tool_pages_img_color_picker_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['img-color-picker'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.picker-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.canvas-wrap { position: relative; display: flex; flex-direction: column; align-items: center; }
	.picker-canvas { border-radius: 0.75rem; cursor: crosshair; box-shadow: var(--shadow-panel); }

	.cursor-preview {
		position: absolute; pointer-events: none; z-index: 10;
		width: 32px; height: 32px; border-radius: 50%;
		border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
		display: flex; align-items: flex-end; justify-content: center;
	}
	.cursor-hex {
		position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
		font-size: 0.625rem; font-weight: 600; padding: 1px 5px; border-radius: 3px;
		background: rgba(0,0,0,0.7); color: white; white-space: nowrap;
	}

	.color-result {
		display: flex; gap: 1rem; padding: 1rem; border-radius: 1rem;
		background: var(--bg-panel); box-shadow: var(--shadow-panel);
	}
	.color-swatch {
		width: 4rem; height: 4rem; border-radius: 0.75rem; flex-shrink: 0;
		border: 1px solid var(--bg-separator);
	}
	.color-values { display: flex; flex-direction: column; gap: 0.375rem; flex: 1; }
	.color-row { display: flex; align-items: center; gap: 0.5rem; }
	.color-label { font-size: 0.6875rem; font-weight: 700; width: 2rem; color: var(--fg-muted); }
	.color-code { font-size: 0.8125rem; flex: 1; color: var(--fg); }
	.copy-btn {
		display: flex; align-items: center; justify-content: center;
		width: 1.5rem; height: 1.5rem; border: none; background: transparent;
		cursor: pointer; color: var(--fg-muted); border-radius: 0.25rem;
	}
	.copy-btn:hover { background: var(--bg-panel-alt); color: var(--accent); }
</style>
