<script lang="ts">
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import { loadImage, canvasToBlob, downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { DropletIcon } from 'lucide-svelte';
	import { onDestroy } from 'svelte';

	let files = $state<File[]>([]);
	let text = $state('CONFIDENTIAL');
	let opacity = $state(30);
	let fontSize = $state(48);
	let rotation = $state(-30);
	let position = $state<'center' | 'tile'>('center');
	let error = $state('');
	let resultBlob = $state<Blob | null>(null);

	let imgEl = $state<HTMLImageElement | null>(null);
	let previewCanvas = $state<HTMLCanvasElement>();
	let rafId: number | null = null;

	$effect(() => {
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
		if (!previewCanvas) return;
		error = '';
		try {
			resultBlob = await canvasToBlob(previewCanvas, 'png');
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed.';
		}
	}

	function download() {
		if (!resultBlob) return;
		downloadBlob(resultBlob, getOutputName(files[0].name, 'watermarked', 'png'));
	}
</script>

<svelte:head>
	<title>Watermark Image — LocalConvert</title>
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
</svelte:head>

<div class="tool-page">
	<a href="/image-tools/" class="text-sm text-muted hover:underline">← Image Tools</a>
	<div class="tool-header">
		<DropletIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Watermark Image</h1>
			<p class="text-sm text-muted">Adjust settings and see the watermark update live.</p>
		</div>
	</div>

	<ImageUploader bind:files label="Drop an image here" />

	{#if imgEl}
		<canvas bind:this={previewCanvas} class="live-preview"></canvas>

		<div class="opt-section">
			<div class="opt-row">
				<label class="opt-label" for="wm-text">Text</label>
				<input id="wm-text" type="text" bind:value={text} placeholder="CONFIDENTIAL" class="opt-input flex-1" maxlength={80} />
			</div>
			<div class="opt-row">
				<span class="opt-label">Opacity</span>
				<input type="range" min={5} max={80} bind:value={opacity} class="slider flex-1" aria-label="Opacity" />
				<span class="val">{opacity}%</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">Font size</span>
				<input type="range" min={16} max={120} bind:value={fontSize} class="slider flex-1" aria-label="Font size" />
				<span class="val">{fontSize}px</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">Rotation</span>
				<input type="range" min={-90} max={90} bind:value={rotation} class="slider flex-1" aria-label="Rotation" />
				<span class="val">{rotation}°</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">Position</span>
				<div class="flex gap-2">
					<button class="btn text-sm px-3 py-1.5 {position === 'center' ? 'highlight' : ''}" onclick={() => position = 'center'}>Center</button>
					<button class="btn text-sm px-3 py-1.5 {position === 'tile' ? 'highlight' : ''}" onclick={() => position = 'tile'}>Tile</button>
				</div>
			</div>
		</div>

		<button class="btn highlight" onclick={save} disabled={!text.trim()}>
			Save watermarked image
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBlob}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! <b>{formatFileSize(resultBlob.size)}</b></p>
			<button class="btn" onclick={download}>Download</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style>
	.tool-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.tool-header { display: flex; align-items: center; gap: 0.75rem; }
	.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 5rem; flex-shrink: 0; }
	.opt-input { border-radius: 0.5rem; padding: 0.375rem 0.75rem; font-size: 0.875rem; border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg); }
	.opt-input:focus { outline: 1.5px solid var(--accent); }
	.slider { height: 6px; appearance: none; border-radius: 9999px; cursor: pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.val { font-size: 0.8125rem; color: var(--fg-muted); width: 2.5rem; text-align: right; flex-shrink: 0; }
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
