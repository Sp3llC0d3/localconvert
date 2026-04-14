<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import { rotateImage, type RotationAngle } from '$lib/image/rotate';
	import { watermarkImage } from '$lib/image/watermark';
	import { cropImage } from '$lib/image/crop';
	import { generateMeme } from '$lib/image/meme';
	import { downloadBlob, formatFileSize, getOutputName, loadImage } from '$lib/image/utils';
	import { LayersIcon, XIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';

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
		if (files.length === 0) { error = m['tool_pages.batch.err_images'](); return; }
		if (operation === 'meme' && !memeTop.trim() && !memeBottom.trim()) { error = m['tool_pages.batch.err_text'](); return; }
		if (operation === 'watermark' && !wmText.trim()) { error = m['tool_pages.batch.err_watermark'](); return; }
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
				output.push({ name: `${files[i].name} — ${m['tools_common.failed']()}`, blob: new Blob([]) });
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
	<title>Batch Image Processing — LocalConvert</title>
	<meta name="description" content="Apply the same operation to multiple images at once. Rotate or watermark in bulk. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/image-tools/batch/" />
	<meta property="og:title" content="Batch Image Processing — LocalConvert" />
	<meta property="og:description" content="Apply the same operation to multiple images at once. Rotate or watermark in bulk. Free, private, no uploads." />
	<meta property="og:url" content="https://localconvert.app/image-tools/batch/" />
</svelte:head>

<div class="batch-page">
	<ToolPageHeader
		category="image"
		title={m['tool_pages.batch.title']()}
		description={m['tool_pages.batch.desc']()}
		icon={LayersIcon}
		backHref="/image-tools/"
		backLabel={m['tools_common.back_image']()}
	/>

	<ImageUploader bind:files multiple={true} label={m['tools_common.upload_images']()} />

	{#if files.length > 0}
		<!-- File list -->
		<div class="file-list">
			{#each files as file, i}
				<div class="file-row">
					<span class="text-sm truncate flex-1">{file.name}</span>
					<span class="text-xs text-muted">{formatFileSize(file.size)}</span>
					<button class="remove-btn" onclick={() => removeFile(i)} aria-label="Remove file">
						<XIcon size={14} />
					</button>
				</div>
			{/each}
			<p class="text-xs text-muted">{m['tools_common.images_selected']({ count: files.length })}</p>
		</div>

		<!-- Operation selector -->
		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">{m['tools_common.operation']()}</span>
				<div class="flex gap-2 flex-wrap">
					<button class="btn text-sm px-3 py-1.5 {operation === 'rotate' ? 'highlight' : ''}" onclick={() => operation = 'rotate'}>{m['tools_common.rotate']()}</button>
					<button class="btn text-sm px-3 py-1.5 {operation === 'watermark' ? 'highlight' : ''}" onclick={() => operation = 'watermark'}>{m['tools_common.watermark']()}</button>
					<button class="btn text-sm px-3 py-1.5 {operation === 'crop' ? 'highlight' : ''}" onclick={() => operation = 'crop'}>{m['tools_common.crop']()}</button>
					<button class="btn text-sm px-3 py-1.5 {operation === 'meme' ? 'highlight' : ''}" onclick={() => operation = 'meme'}>{m['tools_common.meme']()}</button>
				</div>
			</div>

			{#if operation === 'rotate'}
				<div class="opt-row">
					<span class="opt-label">{m['tools_common.angle']()}</span>
					<div class="flex gap-2">
						{#each [90, 180, 270] as a}
							<button class="btn text-sm px-3 py-1.5 {rotateAngle === a ? 'highlight' : ''}" onclick={() => rotateAngle = a as RotationAngle}>{a}°</button>
						{/each}
					</div>
				</div>
			{:else if operation === 'watermark'}
				<div class="opt-row">
					<label class="opt-label" for="batch-wm">{m['tools_common.text']()}</label>
					<input id="batch-wm" type="text" bind:value={wmText} class="opt-input" maxlength={80} />
				</div>
				<div class="opt-row">
					<span class="opt-label">{m['tools_common.opacity']()}</span>
					<input type="range" min={5} max={80} bind:value={wmOpacity} class="slider flex-1" aria-label="Opacity" />
					<span class="val">{wmOpacity}%</span>
				</div>
				<div class="opt-row">
					<span class="opt-label">{m['tools_common.font_size']()}</span>
					<input type="range" min={16} max={120} bind:value={wmFontSize} class="slider flex-1" aria-label="Font size" />
					<span class="val">{wmFontSize}px</span>
				</div>
				<div class="opt-row">
					<span class="opt-label">{m['tools_common.position']()}</span>
					<div class="flex gap-2">
						<button class="btn text-sm px-3 py-1.5 {wmPosition === 'center' ? 'highlight' : ''}" onclick={() => wmPosition = 'center'}>{m['tools_common.center']()}</button>
						<button class="btn text-sm px-3 py-1.5 {wmPosition === 'tile' ? 'highlight' : ''}" onclick={() => wmPosition = 'tile'}>{m['tools_common.tile']()}</button>
					</div>
				</div>
			{:else if operation === 'crop'}
				<div class="opt-row">
					<span class="opt-label">{m['tool_pages.batch.trim']()}</span>
					<input type="range" min={1} max={40} bind:value={cropPercent} class="slider flex-1" aria-label="Crop percentage" />
					<span class="val">{cropPercent}%</span>
				</div>
				<p class="text-xs text-muted">{m['tool_pages.batch.trim_help']({ percent: cropPercent })}</p>
			{:else if operation === 'meme'}
				<div class="opt-row">
					<label class="opt-label" for="batch-meme-top">{m['tool_pages.meme.top_text']()}</label>
					<input id="batch-meme-top" type="text" bind:value={memeTop} placeholder="TOP TEXT" class="opt-input" maxlength={100} />
				</div>
				<div class="opt-row">
					<label class="opt-label" for="batch-meme-btm">{m['tool_pages.meme.bottom_text']()}</label>
					<input id="batch-meme-btm" type="text" bind:value={memeBottom} placeholder="BOTTOM TEXT" class="opt-input" maxlength={100} />
				</div>
			{/if}
		</div>

		<button class="btn highlight" disabled={processing} onclick={applyAll}>
			{processing ? m['tool_pages.batch.btn_busy']({ progress, total: files.length }) : m['tool_pages.batch.btn']({ count: files.length })}
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
				<p class="text-sm font-semibold">{m['tools_common.results_ready']({ count: results.filter(r => r.blob.size > 0).length })}</p>
				<button class="btn text-sm px-3 py-1.5" onclick={downloadAll}>{m['tools_common.save_all']()}</button>
			</div>
			{#each results as r}
				<div class="file-row">
					<span class="text-sm truncate flex-1">{r.name}</span>
					<span class="text-xs text-muted">{r.blob.size > 0 ? formatFileSize(r.blob.size) : m['tools_common.failed']()}</span>
					{#if r.blob.size > 0}
						<button class="text-xs text-accent hover:underline" onclick={() => downloadOne(r)}>{m['tools_common.save']()}</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
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
	.val { font-size: 0.8125rem; color: var(--fg-muted); width: 2.5rem; text-align: right; flex-shrink: 0; }
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
