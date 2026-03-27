<script lang="ts">
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { signPdf } from '$lib/pdf/sign';
	import { renderAllThumbnails } from '$lib/pdf/thumbnails';
	import { downloadPdf, formatFileSize, getPdfJs } from '$lib/pdf/utils';
	import { PenToolIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	// Signature drawing
	let sigCanvas = $state<HTMLCanvasElement>();
	let drawing = $state(false);
	let hasSignature = $state(false);

	// PDF page info
	let thumbs = $state<string[]>([]);
	let currentPage = $state(0);
	let pageWidth = $state(612);
	let pageHeight = $state(792);

	// Placement
	let sigX = $state(50);
	let sigY = $state(50);
	let sigW = $state(200);
	let sigH = $state(80);

	// Mode
	let mode = $state<'draw' | 'type' | 'upload'>('draw');
	let typedName = $state('');

	$effect(() => {
		if (!browser || files.length === 0) {
			thumbs = [];
			resultBytes = null;
			return;
		}
		loadPdf();
	});

	async function loadPdf() {
		try {
			const pdfjs = await getPdfJs();
			const buf = await files[0].arrayBuffer();
			const doc = await pdfjs.getDocument({ data: buf }).promise;
			const page = await doc.getPage(1);
			const vp = page.getViewport({ scale: 1 });
			pageWidth = Math.round(vp.width);
			pageHeight = Math.round(vp.height);
			currentPage = 0;
			thumbs = await renderAllThumbnails(files[0], 0.5);
		} catch {
			error = 'Failed to read PDF.';
		}
	}

	// Drawing handlers
	function startDraw(e: MouseEvent | TouchEvent) {
		if (!sigCanvas) return;
		drawing = true;
		const ctx = sigCanvas.getContext('2d')!;
		const rect = sigCanvas.getBoundingClientRect();
		const pos = 'touches' in e ? e.touches[0] : e;
		ctx.beginPath();
		ctx.moveTo(pos.clientX - rect.left, pos.clientY - rect.top);
	}

	function doDraw(e: MouseEvent | TouchEvent) {
		if (!drawing || !sigCanvas) return;
		e.preventDefault();
		const ctx = sigCanvas.getContext('2d')!;
		const rect = sigCanvas.getBoundingClientRect();
		const pos = 'touches' in e ? e.touches[0] : e;
		ctx.lineWidth = 2.5;
		ctx.lineCap = 'round';
		ctx.strokeStyle = '#000';
		ctx.lineTo(pos.clientX - rect.left, pos.clientY - rect.top);
		ctx.stroke();
		hasSignature = true;
	}

	function endDraw() {
		drawing = false;
	}

	function clearSignature() {
		if (!sigCanvas) return;
		const ctx = sigCanvas.getContext('2d')!;
		ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
		hasSignature = false;
	}

	function renderTypedSignature() {
		if (!sigCanvas || !typedName.trim()) return;
		const ctx = sigCanvas.getContext('2d')!;
		ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
		ctx.font = 'italic 32px "Georgia", "Times New Roman", serif';
		ctx.fillStyle = '#000';
		ctx.textBaseline = 'middle';
		ctx.fillText(typedName, 10, sigCanvas.height / 2);
		hasSignature = true;
	}

	async function getSignatureBytes(): Promise<Uint8Array> {
		if (!sigCanvas) throw new Error('No signature');

		if (mode === 'type') renderTypedSignature();

		const blob = await new Promise<Blob>((resolve, reject) => {
			sigCanvas!.toBlob((b) => {
				if (!b) return reject(new Error('Failed to export signature'));
				resolve(b);
			}, 'image/png');
		});
		return new Uint8Array(await blob.arrayBuffer());
	}

	async function apply() {
		if (files.length === 0) { error = 'Add a PDF file.'; return; }
		if (!hasSignature && mode !== 'type') { error = 'Draw or type a signature first.'; return; }
		if (mode === 'type' && !typedName.trim()) { error = 'Enter your name.'; return; }

		error = '';
		processing = true;
		resultBytes = null;
		try {
			const sigBytes = await getSignatureBytes();
			// Convert placement from visual top-left to PDF bottom-left
			resultBytes = await signPdf(files[0], sigBytes, {
				pageIndex: currentPage,
				x: sigX,
				y: pageHeight - sigY - sigH,
				width: sigW,
				height: sigH,
			});
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed.';
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, files[0].name.replace(/\.pdf$/i, '_signed.pdf'));
	}

	async function handleUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.[0] || !sigCanvas) return;
		const img = new Image();
		const url = URL.createObjectURL(input.files[0]);
		img.onload = () => {
			const ctx = sigCanvas!.getContext('2d')!;
			ctx.clearRect(0, 0, sigCanvas!.width, sigCanvas!.height);
			const scale = Math.min(sigCanvas!.width / img.width, sigCanvas!.height / img.height);
			const w = img.width * scale;
			const h = img.height * scale;
			ctx.drawImage(img, (sigCanvas!.width - w) / 2, (sigCanvas!.height - h) / 2, w, h);
			hasSignature = true;
			URL.revokeObjectURL(url);
		};
		img.src = url;
		input.value = '';
	}
</script>

<svelte:head>
	<title>Sign PDF — LocalConvert</title>
	<meta name="description" content="Add your signature to any PDF. Draw, type, or upload. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/sign/" />
</svelte:head>

<div class="pdf-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">← PDF Tools</a>
	<div class="pdf-header">
		<PenToolIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Sign PDF</h1>
			<p class="text-sm text-muted">Draw, type, or upload a signature and place it on a PDF page.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

	{#if thumbs.length > 0}
		<!-- Signature input -->
		<div class="opt-section">
			<div class="flex gap-2 mb-2">
				<button class="btn text-sm px-3 py-1.5 {mode === 'draw' ? 'highlight' : ''}" onclick={() => { mode = 'draw'; clearSignature(); }}>Draw</button>
				<button class="btn text-sm px-3 py-1.5 {mode === 'type' ? 'highlight' : ''}" onclick={() => { mode = 'type'; clearSignature(); }}>Type</button>
				<button class="btn text-sm px-3 py-1.5 {mode === 'upload' ? 'highlight' : ''}" onclick={() => { mode = 'upload'; clearSignature(); }}>Upload</button>
			</div>

			{#if mode === 'draw'}
				<canvas
					bind:this={sigCanvas}
					width={400}
					height={120}
					class="sig-canvas"
					onmousedown={startDraw}
					onmousemove={doDraw}
					onmouseup={endDraw}
					onmouseleave={endDraw}
					ontouchstart={startDraw}
					ontouchmove={doDraw}
					ontouchend={endDraw}
				></canvas>
				<button class="text-xs text-muted hover:underline self-end" onclick={clearSignature}>Clear</button>
			{:else if mode === 'type'}
				<input
					type="text"
					bind:value={typedName}
					placeholder="Your name"
					class="opt-input w-full"
					oninput={() => { hasSignature = typedName.trim().length > 0; }}
				/>
				<canvas bind:this={sigCanvas} width={400} height={120} class="hidden"></canvas>
			{:else}
				<input type="file" accept="image/*" onchange={handleUpload} class="text-sm" />
				<canvas bind:this={sigCanvas} width={400} height={120} class="sig-canvas pointer-events-none"></canvas>
			{/if}
		</div>

		<!-- Page selector -->
		{#if thumbs.length > 1}
			<div class="opt-section">
				<span class="text-sm font-semibold">Place on page:</span>
				<div class="flex gap-2 flex-wrap">
					{#each thumbs as thumb, i}
						<button class="thumb-btn {currentPage === i ? 'active' : ''}" onclick={() => currentPage = i}>
							<img src={thumb} alt="Page {i + 1}" class="thumb-img" />
							<span class="text-xs">{i + 1}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Position -->
		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">X</span>
				<input type="number" min={0} max={pageWidth} bind:value={sigX} class="opt-input w-20" aria-label="X position" />
				<span class="opt-label">Y</span>
				<input type="number" min={0} max={pageHeight} bind:value={sigY} class="opt-input w-20" aria-label="Y position" />
			</div>
			<div class="opt-row">
				<span class="opt-label">Width</span>
				<input type="number" min={20} max={pageWidth} bind:value={sigW} class="opt-input w-20" aria-label="Signature width" />
				<span class="opt-label">Height</span>
				<input type="number" min={10} max={pageHeight} bind:value={sigH} class="opt-input w-20" aria-label="Signature height" />
			</div>
		</div>

		<button class="btn highlight" disabled={processing} onclick={apply}>
			{processing ? 'Signing…' : 'Sign PDF'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! Output: <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>Save signed PDF</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
	.pdf-header { @apply flex items-center gap-3; }
	.opt-section { @apply flex flex-col gap-4 p-4 rounded-2xl bg-panel shadow-panel; }
	.opt-row { @apply flex items-center gap-4 flex-wrap; }
	.opt-label { @apply text-sm font-semibold w-16 flex-shrink-0; }
	.opt-input { @apply rounded-lg px-3 py-1.5 text-sm border; background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg); border-color: var(--bg-separator); }
	.opt-input:focus { outline: 1.5px solid var(--accent); }
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
	.sig-canvas {
		@apply w-full rounded-lg cursor-crosshair;
		max-width: 400px;
		height: 120px;
		border: 2px dashed var(--bg-separator);
		background: white;
		touch-action: none;
	}
	.thumb-btn {
		@apply flex flex-col items-center gap-1 p-1 rounded-lg transition-colors cursor-pointer;
		border: 2px solid transparent;
	}
	.thumb-btn.active { border-color: var(--accent); }
	.thumb-img { @apply w-16 h-20 object-contain rounded; }
</style>
