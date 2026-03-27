<script lang="ts">
	import { browser } from '$app/environment';
	import { canvasToBlob, downloadBlob } from '$lib/image/utils';
	import { QrCodeIcon } from 'lucide-svelte';
	import { onDestroy } from 'svelte';

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
			error = e instanceof Error ? e.message : 'Failed to generate QR code.';
		}
	}

	async function save() {
		if (!previewCanvas) return;
		try {
			resultBlob = await canvasToBlob(previewCanvas, 'png');
		} catch {
			error = 'Failed to export.';
		}
	}

	function download() {
		if (!resultBlob) return;
		downloadBlob(resultBlob, 'qrcode.png');
	}

	const levels = [
		{ value: 'L' as const, label: 'Low (7%)' },
		{ value: 'M' as const, label: 'Medium (15%)' },
		{ value: 'Q' as const, label: 'Quartile (25%)' },
		{ value: 'H' as const, label: 'High (30%)' },
	];
</script>

<svelte:head>
	<title>QR Code Generator — LocalConvert</title>
	<meta name="description" content="Generate QR codes from text or URLs. Customize colors, size, and error correction. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/image-tools/qr/" />
</svelte:head>

<div class="qr-page">
	<a href="/image-tools/" class="text-sm text-muted hover:underline">← Image Tools</a>
	<div class="qr-header">
		<QrCodeIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">QR Code Generator</h1>
			<p class="text-sm text-muted">Generate a QR code and see it update live.</p>
		</div>
	</div>

	<!-- Preview -->
	<div class="preview-wrap">
		<canvas bind:this={previewCanvas} class="qr-canvas"></canvas>
	</div>

	<!-- Options -->
	<div class="opt-section">
		<div class="field">
			<label for="qr-text" class="field-label">Text or URL</label>
			<input id="qr-text" type="text" bind:value={text} placeholder="https://example.com" class="field-input" />
		</div>
		<div class="opt-row">
			<span class="opt-label">Size</span>
			<input type="range" min={100} max={800} step={50} bind:value={size} class="slider flex-1" aria-label="QR code size" />
			<span class="val">{size}px</span>
		</div>
		<div class="opt-row">
			<span class="opt-label">Foreground</span>
			<input type="color" bind:value={fgColor} class="color-input" aria-label="Foreground color" />
			<span class="opt-label">Background</span>
			<input type="color" bind:value={bgColor} class="color-input" aria-label="Background color" />
		</div>
		<div class="opt-row">
			<span class="opt-label">Error correction</span>
			<div class="flex gap-2 flex-wrap">
				{#each levels as lvl}
					<button class="btn text-xs px-2.5 py-1 {errorLevel === lvl.value ? 'highlight' : ''}" onclick={() => errorLevel = lvl.value}>{lvl.label}</button>
				{/each}
			</div>
		</div>
	</div>

	<button class="btn highlight" disabled={!text.trim()} onclick={save}>
		Save QR code
	</button>

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBlob}
		<div class="result-box">
			<p class="text-sm font-medium">Ready!</p>
			<button class="btn" onclick={download}>Download qrcode.png</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Generated entirely in your browser.</p>
</div>

<style>
	.qr-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.qr-header { display: flex; align-items: center; gap: 0.75rem; }
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
