<script lang="ts">
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import { rotateImage, type RotationAngle } from '$lib/image/rotate';
	import { watermarkImage } from '$lib/image/watermark';
	import { cropImage } from '$lib/image/crop';
	import { generateMeme } from '$lib/image/meme';
	import { downloadBlob, formatFileSize, getOutputName, loadImage } from '$lib/image/utils';
	import { LayersIcon, XIcon } from 'lucide-svelte';

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
		if (files.length === 0) { error = 'Add images first.'; return; }
		if (operation === 'meme' && !memeTop.trim() && !memeBottom.trim()) { error = 'Enter at least one line of text.'; return; }
		if (operation === 'watermark' && !wmText.trim()) { error = 'Enter watermark text.'; return; }
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
				output.push({ name: `${files[i].name} — failed`, blob: new Blob([]) });
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
</svelte:head>

<div class="batch-page">
	<a href="/image-tools/" class="text-sm text-muted hover:underline">← Image Tools</a>
	<div class="batch-header">
		<LayersIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Batch Processing</h1>
			<p class="text-sm text-muted">Apply the same operation to multiple images at once.</p>
		</div>
	</div>

	<ImageUploader bind:files multiple={true} label="Drop multiple images here" />

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
			<p class="text-xs text-muted">{files.length} image{files.length !== 1 ? 's' : ''} selected</p>
		</div>

		<!-- Operation selector -->
		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">Operation</span>
				<div class="flex gap-2 flex-wrap">
					<button class="btn text-sm px-3 py-1.5 {operation === 'rotate' ? 'highlight' : ''}" onclick={() => operation = 'rotate'}>Rotate</button>
					<button class="btn text-sm px-3 py-1.5 {operation === 'watermark' ? 'highlight' : ''}" onclick={() => operation = 'watermark'}>Watermark</button>
					<button class="btn text-sm px-3 py-1.5 {operation === 'crop' ? 'highlight' : ''}" onclick={() => operation = 'crop'}>Crop</button>
					<button class="btn text-sm px-3 py-1.5 {operation === 'meme' ? 'highlight' : ''}" onclick={() => operation = 'meme'}>Meme</button>
				</div>
			</div>

			{#if operation === 'rotate'}
				<div class="opt-row">
					<span class="opt-label">Angle</span>
					<div class="flex gap-2">
						{#each [90, 180, 270] as a}
							<button class="btn text-sm px-3 py-1.5 {rotateAngle === a ? 'highlight' : ''}" onclick={() => rotateAngle = a as RotationAngle}>{a}°</button>
						{/each}
					</div>
				</div>
			{:else if operation === 'watermark'}
				<div class="opt-row">
					<label class="opt-label" for="batch-wm">Text</label>
					<input id="batch-wm" type="text" bind:value={wmText} class="opt-input" maxlength={80} />
				</div>
				<div class="opt-row">
					<span class="opt-label">Opacity</span>
					<input type="range" min={5} max={80} bind:value={wmOpacity} class="slider flex-1" aria-label="Opacity" />
					<span class="val">{wmOpacity}%</span>
				</div>
				<div class="opt-row">
					<span class="opt-label">Font size</span>
					<input type="range" min={16} max={120} bind:value={wmFontSize} class="slider flex-1" aria-label="Font size" />
					<span class="val">{wmFontSize}px</span>
				</div>
				<div class="opt-row">
					<span class="opt-label">Position</span>
					<div class="flex gap-2">
						<button class="btn text-sm px-3 py-1.5 {wmPosition === 'center' ? 'highlight' : ''}" onclick={() => wmPosition = 'center'}>Center</button>
						<button class="btn text-sm px-3 py-1.5 {wmPosition === 'tile' ? 'highlight' : ''}" onclick={() => wmPosition = 'tile'}>Tile</button>
					</div>
				</div>
			{:else if operation === 'crop'}
				<div class="opt-row">
					<span class="opt-label">Trim</span>
					<input type="range" min={1} max={40} bind:value={cropPercent} class="slider flex-1" aria-label="Crop percentage" />
					<span class="val">{cropPercent}%</span>
				</div>
				<p class="text-xs text-muted">Trims {cropPercent}% from each edge of every image.</p>
			{:else if operation === 'meme'}
				<div class="opt-row">
					<label class="opt-label" for="batch-meme-top">Top text</label>
					<input id="batch-meme-top" type="text" bind:value={memeTop} placeholder="TOP TEXT" class="opt-input" maxlength={100} />
				</div>
				<div class="opt-row">
					<label class="opt-label" for="batch-meme-btm">Bottom</label>
					<input id="batch-meme-btm" type="text" bind:value={memeBottom} placeholder="BOTTOM TEXT" class="opt-input" maxlength={100} />
				</div>
			{/if}
		</div>

		<button class="btn highlight" disabled={processing} onclick={applyAll}>
			{processing ? `Processing ${progress} / ${files.length}…` : `Process ${files.length} image${files.length !== 1 ? 's' : ''}`}
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
				<p class="text-sm font-semibold">{results.filter(r => r.blob.size > 0).length} results ready</p>
				<button class="btn text-sm px-3 py-1.5" onclick={downloadAll}>Save all</button>
			</div>
			{#each results as r}
				<div class="file-row">
					<span class="text-sm truncate flex-1">{r.name}</span>
					<span class="text-xs text-muted">{r.blob.size > 0 ? formatFileSize(r.blob.size) : 'failed'}</span>
					{#if r.blob.size > 0}
						<button class="text-xs text-accent hover:underline" onclick={() => downloadOne(r)}>Save</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style>
	.batch-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.batch-header { display: flex; align-items: center; gap: 0.75rem; }
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
