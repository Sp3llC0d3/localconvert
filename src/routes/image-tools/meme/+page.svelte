<script lang="ts">
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import { loadImage, canvasToBlob, downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { SmileIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let topText = $state('');
	let bottomText = $state('');
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
		downloadBlob(resultBlob, getOutputName(files[0].name, 'meme', 'png'));
	}
</script>

<svelte:head>
	<title>Meme Generator — LocalConvert</title>
	<meta name="description" content="Create memes with custom top and bottom text. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/image-tools/meme/" />
</svelte:head>

<div class="tool-page">
	<a href="/image-tools/" class="text-sm text-muted hover:underline">← Image Tools</a>
	<div class="tool-header">
		<SmileIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Meme Generator</h1>
			<p class="text-sm text-muted">Type and see your meme update live.</p>
		</div>
	</div>

	<ImageUploader bind:files label="Drop an image here" />

	{#if imgEl}
		<!-- Live canvas preview -->
		<canvas
			bind:this={previewCanvas}
			class="live-preview"
		></canvas>

		<div class="opt-section">
			<div class="opt-row">
				<label class="opt-label" for="meme-top">Top text</label>
				<input id="meme-top" type="text" bind:value={topText} placeholder="TOP TEXT" class="opt-input flex-1" maxlength={100} />
			</div>
			<div class="opt-row">
				<label class="opt-label" for="meme-bottom">Bottom text</label>
				<input id="meme-bottom" type="text" bind:value={bottomText} placeholder="BOTTOM TEXT" class="opt-input flex-1" maxlength={100} />
			</div>
		</div>

		<button class="btn highlight" onclick={save} disabled={!topText.trim() && !bottomText.trim()}>
			Save meme
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
