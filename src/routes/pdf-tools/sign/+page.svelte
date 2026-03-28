<script lang="ts">
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { signPdf } from '$lib/pdf/sign';
	import { renderAllThumbnails } from '$lib/pdf/thumbnails';
	import { downloadPdf, formatFileSize, getPdfJs } from '$lib/pdf/utils';
	import { PenToolIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { m } from '$lib/paraglide/messages';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	// Signature canvas
	let sigCanvas = $state<HTMLCanvasElement>();
	let drawing = $state(false);
	let hasSignature = $state(false);
	let sigPreviewUrl = $state('');

	// PDF page
	let thumbs = $state<string[]>([]);
	let currentPage = $state(0);
	let pageWidth = $state(612);
	let pageHeight = $state(792);
	let displayW = $state(0);
	let displayH = $state(0);

	// Visual placement
	let placed = $state(false);
	let sigDisplayX = $state(0);
	let sigDisplayY = $state(0);
	let sigDisplayW = $state(120);
	let sigDisplayH = $state(48);
	let dragging = $state<{ offsetX: number; offsetY: number } | null>(null);
	let ghostPos = $state({ x: 0, y: 0 });
	let showGhost = $state(false);

	// Page container ref
	let pageContainer = $state<HTMLDivElement>();

	// Mode
	let mode = $state<'draw' | 'type' | 'upload'>('draw');
	let typedName = $state('');

	$effect(() => {
		if (!browser || files.length === 0) {
			thumbs = [];
			resultBytes = null;
			placed = false;
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
			thumbs = await renderAllThumbnails(files[0], 0.7);
			calcDisplaySize();
		} catch {
			error = m['tools_common.failed_read_pdf']();
		}
	}

	function calcDisplaySize() {
		const maxW = Math.min(600, (typeof window !== 'undefined' ? window.innerWidth : 600) - 48);
		const scale = Math.min(1, maxW / pageWidth);
		displayW = Math.round(pageWidth * scale);
		displayH = Math.round(pageHeight * scale);
	}

	// Signature drawing
	function canvasCoords(e: MouseEvent | TouchEvent): { x: number; y: number } {
		if (!sigCanvas) return { x: 0, y: 0 };
		const rect = sigCanvas.getBoundingClientRect();
		const pos = 'touches' in e && e.touches.length > 0 ? e.touches[0] : (e as MouseEvent);
		return {
			x: (pos.clientX - rect.left) * (sigCanvas.width / rect.width),
			y: (pos.clientY - rect.top) * (sigCanvas.height / rect.height),
		};
	}

	function startDraw(e: MouseEvent | TouchEvent) {
		if (!sigCanvas) return;
		if ('touches' in e) e.preventDefault();
		drawing = true;
		const ctx = sigCanvas.getContext('2d')!;
		const { x, y } = canvasCoords(e);
		ctx.beginPath();
		ctx.moveTo(x, y);
	}

	function doDraw(e: MouseEvent | TouchEvent) {
		if (!drawing || !sigCanvas) return;
		e.preventDefault();
		const ctx = sigCanvas.getContext('2d')!;
		const { x, y } = canvasCoords(e);
		ctx.lineWidth = 2.5;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.strokeStyle = '#000';
		ctx.lineTo(x, y);
		ctx.stroke();
		hasSignature = true;
	}

	function endDraw() {
		drawing = false;
		updateSigPreview();
	}

	function clearSignature() {
		if (!sigCanvas) return;
		const ctx = sigCanvas.getContext('2d')!;
		ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
		hasSignature = false;
		sigPreviewUrl = '';
		placed = false;
	}

	function updateSigPreview() {
		if (!sigCanvas || !hasSignature) return;
		sigPreviewUrl = sigCanvas.toDataURL('image/png');
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
		sigPreviewUrl = sigCanvas.toDataURL('image/png');
	}

	$effect(() => {
		if (mode === 'type' && typedName.trim()) {
			renderTypedSignature();
		}
	});

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
			sigPreviewUrl = sigCanvas!.toDataURL('image/png');
			URL.revokeObjectURL(url);
		};
		img.src = url;
		input.value = '';
	}

	// Page interaction — click to place signature
	function getRelPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
		if (!pageContainer) return { x: 0, y: 0 };
		const rect = pageContainer.getBoundingClientRect();
		const pos = 'touches' in e && e.touches.length > 0 ? e.touches[0] : (e as MouseEvent);
		return { x: pos.clientX - rect.left, y: pos.clientY - rect.top };
	}

	function onPageMouseMove(e: MouseEvent) {
		if (dragging) {
			const pos = getRelPos(e);
			sigDisplayX = Math.max(0, Math.min(displayW - sigDisplayW, pos.x - dragging.offsetX));
			sigDisplayY = Math.max(0, Math.min(displayH - sigDisplayH, pos.y - dragging.offsetY));
			return;
		}
		if (!hasSignature || placed) return;
		ghostPos = getRelPos(e);
		showGhost = true;
	}

	function onPageMouseLeave() {
		showGhost = false;
		dragging = null;
	}

	function onPageClick(e: MouseEvent) {
		if (dragging || !hasSignature) return;
		const pos = getRelPos(e);
		sigDisplayX = Math.max(0, Math.min(displayW - sigDisplayW, pos.x - sigDisplayW / 2));
		sigDisplayY = Math.max(0, Math.min(displayH - sigDisplayH, pos.y - sigDisplayH / 2));
		placed = true;
		showGhost = false;
	}

	function onSigPointerDown(e: MouseEvent | TouchEvent) {
		e.stopPropagation();
		if ('touches' in e) e.preventDefault();
		const pos = getRelPos(e);
		dragging = { offsetX: pos.x - sigDisplayX, offsetY: pos.y - sigDisplayY };
	}

	function onPageMouseUp() {
		dragging = null;
	}

	async function getSignatureBytes(): Promise<Uint8Array> {
		if (!sigCanvas) throw new Error('No signature');
		if (mode === 'type') renderTypedSignature();
		const blob = await new Promise<Blob>((resolve, reject) => {
			sigCanvas!.toBlob((b) => {
				if (!b) return reject(new Error('Failed'));
				resolve(b);
			}, 'image/png');
		});
		return new Uint8Array(await blob.arrayBuffer());
	}

	async function apply() {
		if (!files.length) { error = m['tool_pages.sign.err_pdf'](); return; }
		if (!hasSignature) { error = m['tool_pages.sign.err_sig'](); return; }
		if (!placed) { error = m['tool_pages.sign.err_place'](); return; }

		error = '';
		processing = true;
		resultBytes = null;
		try {
			const sigBytes = await getSignatureBytes();
			const scaleX = pageWidth / displayW;
			const scaleY = pageHeight / displayH;
			const pdfX = sigDisplayX * scaleX;
			const pdfW = sigDisplayW * scaleX;
			const pdfH = sigDisplayH * scaleY;
			const pdfY = pageHeight - (sigDisplayY * scaleY) - pdfH; // flip Y

			resultBytes = await signPdf(files[0], sigBytes, {
				pageIndex: currentPage,
				x: Math.round(pdfX),
				y: Math.round(pdfY),
				width: Math.round(pdfW),
				height: Math.round(pdfH),
			});
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tools_common.failed']();
		}
		processing = false;
	}

	function onKeyDown(e: KeyboardEvent) {
		if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
		if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
			e.preventDefault();
			if (placed) { placed = false; }
		} else if (e.key === 'Escape') {
			if (placed) { placed = false; }
		}
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, files[0].name.replace(/\.pdf$/i, '_signed.pdf'));
	}
</script>

<svelte:window onkeydown={onKeyDown} />

<svelte:head>
	<title>Sign PDF — LocalConvert</title>
	<meta name="description" content="Add your signature to any PDF. Draw, type, or upload — then click to place. Free, private." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/sign/" />
</svelte:head>

<div class="sign-page">
	<ToolPageHeader
		category="pdf"
		title={m['tool_pages.sign.title']()}
		description={m['tool_pages.sign.desc']()}
		icon={PenToolIcon}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<PdfUploader bind:files multiple={false} label={m['tools_common.upload_pdf']()} />

	{#if thumbs.length > 0 && displayW > 0}
		<!-- Step 1: Create signature -->
		<div class="step-section">
			<p class="step-label">{m['tool_pages.sign.step1']()}</p>
			<div class="flex gap-2 mb-2">
				<button class="btn text-sm px-3 py-1.5 {mode === 'draw' ? 'highlight' : ''}" onclick={() => { mode = 'draw'; clearSignature(); }}>{m['tool_pages.sign.draw']()}</button>
				<button class="btn text-sm px-3 py-1.5 {mode === 'type' ? 'highlight' : ''}" onclick={() => { mode = 'type'; clearSignature(); }}>{m['tool_pages.sign.type']()}</button>
				<button class="btn text-sm px-3 py-1.5 {mode === 'upload' ? 'highlight' : ''}" onclick={() => { mode = 'upload'; clearSignature(); }}>{m['tool_pages.sign.upload']()}</button>
			</div>

			{#if mode === 'draw'}
				<canvas
					bind:this={sigCanvas}
					width={400} height={120}
					class="sig-canvas"
					onmousedown={startDraw}
					onmousemove={doDraw}
					onmouseup={endDraw}
					onmouseleave={endDraw}
					ontouchstart={startDraw}
					ontouchmove={doDraw}
					ontouchend={endDraw}
				></canvas>
				<button class="text-xs text-muted hover:underline self-end" onclick={clearSignature}>{m['tools_common.clear']()}</button>
			{:else if mode === 'type'}
				<input
					type="text" bind:value={typedName} placeholder={m['tool_pages.sign.your_name']()}
					class="sig-text-input"
				/>
				<canvas bind:this={sigCanvas} width={400} height={120} class="hidden"></canvas>
			{:else}
				<input type="file" accept="image/*" onchange={handleUpload} class="text-sm" />
				<canvas bind:this={sigCanvas} width={400} height={120} class="sig-canvas" style="pointer-events: none;"></canvas>
			{/if}
		</div>

		<!-- Step 2: Place on page -->
		{#if hasSignature}
			<div class="step-section">
				<p class="step-label">{m['tool_pages.sign.step2']()}</p>

				{#if thumbs.length > 1}
					<div class="flex gap-2 flex-wrap mb-2">
						{#each thumbs as _, i}
							<button class="btn text-sm px-3 py-1.5 {currentPage === i ? 'highlight' : ''}" onclick={() => { currentPage = i; placed = false; }}>
								Page {i + 1}
							</button>
						{/each}
					</div>
				{/if}

				<div class="page-workspace">
					<div
						bind:this={pageContainer}
						class="page-container"
						style="width: {displayW}px; max-width: 100%; height: {displayH}px;"
						onmousemove={onPageMouseMove}
						onmouseleave={onPageMouseLeave}
						onmouseup={onPageMouseUp}
						onclick={onPageClick}
						role="application"
						aria-label={m['tool_pages.sign.click_place']()}
					>
						<img src={thumbs[currentPage]} alt="Page {currentPage + 1}" class="page-img" draggable="false" />

						<!-- Ghost (follows cursor before placement) -->
						{#if showGhost && !placed && sigPreviewUrl}
							<img
								src={sigPreviewUrl}
								alt=""
								class="sig-ghost"
								style="left: {ghostPos.x - sigDisplayW / 2}px; top: {ghostPos.y - sigDisplayH / 2}px; width: {sigDisplayW}px; height: {sigDisplayH}px;"
							/>
						{/if}

						<!-- Placed signature -->
						{#if placed && sigPreviewUrl}
							<img
								src={sigPreviewUrl}
								alt="Signature"
								class="sig-placed"
								style="left: {sigDisplayX}px; top: {sigDisplayY}px; width: {sigDisplayW}px; height: {sigDisplayH}px;"
								onmousedown={onSigPointerDown}
								ontouchstart={onSigPointerDown}
								draggable="false"
							/>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		{#if placed}
			<button class="btn highlight" disabled={processing} onclick={apply}>
				{processing ? m['tool_pages.sign.btn_busy']() : m['tool_pages.sign.save']()}
			</button>
		{/if}
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{m['tools_common.ready']()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{m['tools_common.download']()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style>
	.sign-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }

	.step-section {
		display: flex; flex-direction: column; gap: 0.75rem;
		padding: 1rem; border-radius: 1rem;
		background: var(--bg-panel); box-shadow: var(--shadow-panel);
	}
	.step-label { font-size: 0.8125rem; font-weight: 600; }

	/* Signature canvas */
	.sig-canvas {
		width: 100%; max-width: 400px; height: 120px;
		border: 2px dashed var(--bg-separator); border-radius: 0.5rem;
		background: white; cursor: crosshair; touch-action: none;
	}
	.sig-text-input {
		padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 1.25rem;
		font-style: italic; font-family: "Georgia", "Times New Roman", serif;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.sig-text-input:focus { outline: 1.5px solid var(--accent); }

	/* Page workspace */
	.page-workspace { display: flex; flex-direction: column; align-items: center; }
	.page-container {
		position: relative; cursor: crosshair; user-select: none; -webkit-user-select: none;
		border-radius: 0.5rem; overflow: hidden; box-shadow: var(--shadow-panel);
	}
	.page-img { display: block; width: 100%; height: 100%; pointer-events: none; }

	/* Ghost signature */
	.sig-ghost {
		position: absolute; pointer-events: none; opacity: 0.35;
		object-fit: contain;
	}

	/* Placed signature */
	.sig-placed {
		position: absolute; cursor: move; object-fit: contain;
		border: 2px solid var(--accent);
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.15);
		transition: box-shadow 0.1s ease;
	}
	.sig-placed:hover {
		box-shadow: 0 4px 16px rgba(0,0,0,0.25);
	}
</style>
