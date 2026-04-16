<script lang="ts">
	const __nkm = {'image_tools.tools.filters_name': image_tools_tools_filters_name, 'image_tools.tools.rotate_name': image_tools_tools_rotate_name, 'image_tools.tools.crop_name': image_tools_tools_crop_name};
	import { tool_pages_batch_err_images, tool_pages_batch_err_text, tool_pages_batch_err_watermark, tools_common_failed, tool_pages_batch_title, tool_pages_batch_desc, tools_common_back_image, tools_common_upload_images, tools_common_images_selected, tools_common_operation, tools_common_rotate, tools_common_watermark, tools_common_crop, tools_common_meme, tools_common_angle, tools_common_text, tools_common_opacity, tools_common_font_size, tools_common_position, tools_common_center, tools_common_tile, tool_pages_batch_trim, tool_pages_batch_trim_help, tool_pages_meme_top_text, tool_pages_meme_bottom_text, tool_pages_batch_btn_busy, tool_pages_batch_btn, tools_common_results_ready, tools_common_save_all, tools_common_save, tools_common_privacy_note, tool_pages_img_batch_seo_faq1_q, tool_pages_img_batch_seo_faq1_a, tool_pages_img_batch_seo_faq2_q, tool_pages_img_batch_seo_faq2_a, image_tools_tools_filters_name, image_tools_tools_rotate_name, image_tools_tools_crop_name, aria_remove_file, aria_opacity, aria_font_size, aria_crop_percentage, aria_meme_top_text, aria_meme_bottom_text , navbar_home, navbar_image_tools, meta_descriptions_image_batch} from "$lib/paraglide/messages/_barrel.js";
	import { localizeHref } from '$lib/paraglide/runtime';
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import { rotateImage, type RotationAngle } from '$lib/image/rotate';
	import { watermarkImage } from '$lib/image/watermark';
	import { cropImage } from '$lib/image/crop';
	import { generateMeme } from '$lib/image/meme';
	import { downloadBlob, formatFileSize, getOutputName, loadImage } from '$lib/image/utils';
	import { LayersIcon, XIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let operation = $state<'rotate' | 'watermark' | 'crop' | 'meme'>('rotate');
	let processing = $state(false);
	let progress = $state(0);
	let error = $state('');
	let results = $state<{ name: string; blob: Blob }[]>([]);

	// Rotate options
	let rotateAngle = $state<RotationAngle>(90);

	// Watermark options
	let wmText = $state('CONFIDENTIAL');
	let wmOpacity = $state(30);
	let wmFontSize = $state(48);
	let wmPosition = $state<'center' | 'tile'>('center');

	// Crop options
	let cropPercent = $state(10); // % to trim from each edge

	// Meme options
	let memeTop = $state('');
	let memeBottom = $state('');

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
		results = [];
	}

	async function applyAll() {
		if (files.length === 0) { error = tool_pages_batch_err_images(); return; }
		if (operation === 'meme' && !memeTop.trim() && !memeBottom.trim()) { error = tool_pages_batch_err_text(); return; }
		if (operation === 'watermark' && !wmText.trim()) { error = tool_pages_batch_err_watermark(); return; }
		error = '';
		processing = true;
		progress = 0;
		results = [];

		const output: { name: string; blob: Blob }[] = [];

		for (let i = 0; i < files.length; i++) {
			try {
				let blob: Blob;
				let suffix: string;
				if (operation === 'rotate') {
					blob = await rotateImage(files[i], rotateAngle);
					suffix = `rotated${rotateAngle}`;
				} else if (operation === 'watermark') {
					blob = await watermarkImage(files[i], {
						text: wmText,
						opacity: wmOpacity / 100,
						fontSize: wmFontSize,
						position: wmPosition,
					});
					suffix = 'watermarked';
				} else if (operation === 'crop') {
					const img = await loadImage(files[i]);
					const margin = cropPercent / 100;
					blob = await cropImage(files[i], {
						x: Math.round(img.width * margin),
						y: Math.round(img.height * margin),
						width: Math.round(img.width * (1 - 2 * margin)),
						height: Math.round(img.height * (1 - 2 * margin)),
					});
					suffix = 'cropped';
				} else {
					blob = await generateMeme(files[i], { topText: memeTop, bottomText: memeBottom });
					suffix = 'meme';
				}
				output.push({ name: getOutputName(files[i].name, suffix, 'png'), blob });
			} catch {
				output.push({ name: `${files[i].name} — ${tools_common_failed()}`, blob: new Blob([]) });
			}
			progress = i + 1;
		}

		results = output;
		processing = false;
	}

	function downloadOne(r: { name: string; blob: Blob }) {
		if (r.blob.size === 0) return;
		downloadBlob(r.blob, r.name);
	}

	async function downloadAll() {
		for (const r of results) {
			if (r.blob.size > 0) {
				downloadBlob(r.blob, r.name);
				await new Promise((resolve) => setTimeout(resolve, 300));
			}
		}
	}
</script>

<svelte:head>
	<title>{tool_pages_batch_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_image_batch()} />
	<link rel="canonical" href="https://localconvert.app/image-tools/batch/" />
	<meta property="og:title" content="{tool_pages_batch_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_image_batch()} />
	<meta property="og:url" content="https://localconvert.app/image-tools/batch/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"How to Batch Process Images","step":[{"@type":"HowToStep","text":"Select multiple images from your device"},{"@type":"HowToStep","text":"Choose the output format and quality settings"},{"@type":"HowToStep","text":"Process all images at once and save the results"}]}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":navbar_home(),"item":"https://localconvert.app"+localizeHref("/")},{"@type":"ListItem","position":2,"name":navbar_image_tools(),"item":"https://localconvert.app"+localizeHref("/image-tools/")},{"@type":"ListItem","position":3,"name":tool_pages_batch_title()}]})}</script>`}
</svelte:head>

<div class="batch-page">
	<ToolPageHeader
		category="image"
		title={tool_pages_batch_title()}
		description={tool_pages_batch_desc()}
		icon={LayersIcon}
		backHref="/image-tools/"
		backLabel={tools_common_back_image()}
	/>

	<ImageUploader bind:files multiple={true} label={tools_common_upload_images()} />

	{#if files.length > 0}
		<!-- File list -->
		<div class="file-list">
			{#each files as file, i}
				<div class="file-row">
					<span class="text-sm truncate flex-1">{file.name}</span>
					<span class="text-xs text-muted">{formatFileSize(file.size)}</span>
					<button class="remove-btn" onclick={() => removeFile(i)} aria-label={aria_remove_file()}>
						<XIcon size={14} />
					</button>
				</div>
			{/each}
			<p class="text-xs text-muted">{tools_common_images_selected({ count: files.length })}</p>
		</div>

		<!-- Operation selector -->
		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">{tools_common_operation()}</span>
				<div class="flex gap-2 flex-wrap">
					<button class="btn text-sm px-3 py-1.5 {operation === 'rotate' ? 'highlight' : ''}" onclick={() => operation = 'rotate'}>{tools_common_rotate()}</button>
					<button class="btn text-sm px-3 py-1.5 {operation === 'watermark' ? 'highlight' : ''}" onclick={() => operation = 'watermark'}>{tools_common_watermark()}</button>
					<button class="btn text-sm px-3 py-1.5 {operation === 'crop' ? 'highlight' : ''}" onclick={() => operation = 'crop'}>{tools_common_crop()}</button>
					<button class="btn text-sm px-3 py-1.5 {operation === 'meme' ? 'highlight' : ''}" onclick={() => operation = 'meme'}>{tools_common_meme()}</button>
				</div>
			</div>

			{#if operation === 'rotate'}
				<div class="opt-row">
					<span class="opt-label">{tools_common_angle()}</span>
					<div class="flex gap-2">
						{#each [90, 180, 270] as a}
							<button class="btn text-sm px-3 py-1.5 {rotateAngle === a ? 'highlight' : ''}" onclick={() => rotateAngle = a as RotationAngle}>{a}°</button>
						{/each}
					</div>
				</div>
			{:else if operation === 'watermark'}
				<div class="opt-row">
					<label class="opt-label" for="batch-wm">{tools_common_text()}</label>
					<input id="batch-wm" type="text" bind:value={wmText} class="opt-input" maxlength={80} />
				</div>
				<div class="opt-row">
					<span class="opt-label">{tools_common_opacity()}</span>
					<input type="range" min={5} max={80} bind:value={wmOpacity} class="slider flex-1" aria-label={aria_opacity()} />
					<span class="val">{wmOpacity}%</span>
				</div>
				<div class="opt-row">
					<span class="opt-label">{tools_common_font_size()}</span>
					<input type="range" min={16} max={120} bind:value={wmFontSize} class="slider flex-1" aria-label={aria_font_size()} />
					<span class="val">{wmFontSize}px</span>
				</div>
				<div class="opt-row">
					<span class="opt-label">{tools_common_position()}</span>
					<div class="flex gap-2">
						<button class="btn text-sm px-3 py-1.5 {wmPosition === 'center' ? 'highlight' : ''}" onclick={() => wmPosition = 'center'}>{tools_common_center()}</button>
						<button class="btn text-sm px-3 py-1.5 {wmPosition === 'tile' ? 'highlight' : ''}" onclick={() => wmPosition = 'tile'}>{tools_common_tile()}</button>
					</div>
				</div>
			{:else if operation === 'crop'}
				<div class="opt-row">
					<span class="opt-label">{tool_pages_batch_trim()}</span>
					<input type="range" min={1} max={40} bind:value={cropPercent} class="slider flex-1" aria-label={aria_crop_percentage()} />
					<span class="val">{cropPercent}%</span>
				</div>
				<p class="text-xs text-muted">{tool_pages_batch_trim_help({ percent: cropPercent })}</p>
			{:else if operation === 'meme'}
				<div class="opt-row">
					<label class="opt-label" for="batch-meme-top">{tool_pages_meme_top_text()}</label>
					<input id="batch-meme-top" type="text" bind:value={memeTop} placeholder={aria_meme_top_text()} class="opt-input" maxlength={100} />
				</div>
				<div class="opt-row">
					<label class="opt-label" for="batch-meme-btm">{tool_pages_meme_bottom_text()}</label>
					<input id="batch-meme-btm" type="text" bind:value={memeBottom} placeholder={aria_meme_bottom_text()} class="opt-input" maxlength={100} />
				</div>
			{/if}
		</div>

		<button class="btn highlight" disabled={processing} onclick={applyAll}>
			{processing ? tool_pages_batch_btn_busy({ progress, total: files.length }) : tool_pages_batch_btn({ count: files.length })}
		</button>

		{#if processing}
			<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--bg-separator)">
				<div class="h-full rounded-full transition-all" style="background: var(--accent); width: {(progress / files.length) * 100}%"></div>
			</div>
		{/if}
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if results.length > 0}
		<div class="result-section">
			<div class="flex items-center justify-between">
				<p class="text-sm font-semibold">{tools_common_results_ready({ count: results.filter(r => r.blob.size > 0).length })}</p>
				<button class="btn text-sm px-3 py-1.5" onclick={downloadAll}>{tools_common_save_all()}</button>
			</div>
			{#each results as r}
				<div class="file-row">
					<span class="text-sm truncate flex-1">{r.name}</span>
					<span class="text-xs text-muted">{r.blob.size > 0 ? formatFileSize(r.blob.size) : tools_common_failed()}</span>
					{#if r.blob.size > 0}
						<button class="text-xs text-accent hover:underline" onclick={() => downloadOne(r)}>{tools_common_save()}</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>

	{#if toolSeo['img-batch']}
		<ToolSeoBlock
			faqs={toolSeo['img-batch'].faqKeys.length >= 4 ? [
				{ q: tool_pages_img_batch_seo_faq1_q?.() ?? '', a: tool_pages_img_batch_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_img_batch_seo_faq2_q?.() ?? '', a: tool_pages_img_batch_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['img-batch'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.batch-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 4.5rem; flex-shrink: 0; }
	.opt-input {
		flex: 1; padding: 0.375rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.opt-input:focus { outline: 1.5px solid var(--accent); }
	.slider { height: 6px; appearance: none; border-radius: 9999px; cursor: pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.val { font-size: 0.8125rem; color: var(--fg-muted); width: 2.5rem; text-align: end; flex-shrink: 0; }
	.file-list { display: flex; flex-direction: column; gap: 0.375rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.file-row { display: flex; align-items: center; gap: 0.5rem; }
	.remove-btn {
		display: flex; align-items: center; justify-content: center;
		width: 1.25rem; height: 1.25rem; border-radius: 50%; border: none;
		background: transparent; cursor: pointer; color: var(--fg-muted);
	}
	.remove-btn:hover { color: var(--fg-failure, #e53e3e); }
	.result-section { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
</style>
