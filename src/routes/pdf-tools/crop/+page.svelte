<script lang="ts">
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { cropPdf, type PdfCropBox } from '$lib/pdf/crop';
	import { renderAllThumbnails } from '$lib/pdf/thumbnails';
	import { downloadPdf, formatFileSize, getPdfJs } from '$lib/pdf/utils';
	import { CropIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	// Page info
	let pageCount = $state(0);
	let pageWidth = $state(0);
	let pageHeight = $state(0);
	let thumbUrl = $state('');
	let scale = $state(1);

	// Crop margins (PDF points from each edge)
	let marginLeft = $state(36);
	let marginRight = $state(36);
	let marginTop = $state(36);
	let marginBottom = $state(36);
	let applyToAll = $state(true);

	$effect(() => {
		if (!browser || files.length === 0) {
			thumbUrl = '';
			pageCount = 0;
			resultBytes = null;
			return;
		}
		loadPageInfo();
	});

	async function loadPageInfo() {
		try {
			const pdfjs = await getPdfJs();
			const buf = await files[0].arrayBuffer();
			const doc = await pdfjs.getDocument({ data: buf }).promise;
			pageCount = doc.numPages;
			const page = await doc.getPage(1);
			const vp = page.getViewport({ scale: 1 });
			pageWidth = Math.round(vp.width);
			pageHeight = Math.round(vp.height);

			// Render thumbnail
			const thumbs = await renderAllThumbnails(files[0], 0.4);
			if (thumbs.length > 0) thumbUrl = thumbs[0];

			// Fit preview
			scale = Math.min(1, 500 / pageWidth);
		} catch {
			error = 'Failed to read PDF.';
		}
	}

	function getCropBox(): PdfCropBox {
		return {
			left: marginLeft,
			bottom: marginBottom,
			right: pageWidth - marginRight,
			top: pageHeight - marginTop,
		};
	}

	async function apply() {
		if (files.length === 0) return;
		const box = getCropBox();
		if (box.right <= box.left || box.top <= box.bottom) {
			error = 'Margins are too large — no area left.';
			return;
		}
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await cropPdf(
				files[0],
				box,
				applyToAll ? undefined : [0],
			);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed.';
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, files[0].name.replace(/\.pdf$/i, '_cropped.pdf'));
	}
</script>

<svelte:head>
	<title>Crop PDF — LocalConvert</title>
	<meta name="description" content="Crop PDF margins and trim whitespace. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/crop/" />
</svelte:head>

<div class="pdf-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">← PDF Tools</a>
	<div class="pdf-header">
		<CropIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Crop PDF</h1>
			<p class="text-sm text-muted">Trim margins from PDF pages.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

	{#if thumbUrl && pageWidth > 0}
		<div class="flex flex-col items-center gap-2">
			<div class="preview-wrap" style="width: {pageWidth * scale}px; height: {pageHeight * scale}px;">
				<img src={thumbUrl} alt="Page preview" class="preview-img" />
				<div
					class="crop-overlay"
					style="
						left: {marginLeft * scale}px;
						top: {marginTop * scale}px;
						right: {marginRight * scale}px;
						bottom: {marginBottom * scale}px;
					"
				></div>
			</div>
			<p class="text-xs text-muted">{pageWidth} × {pageHeight} pt — {pageCount} page{pageCount > 1 ? 's' : ''}</p>
		</div>

		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">Left</span>
				<input type="number" min={0} max={pageWidth / 2} bind:value={marginLeft} class="opt-input w-20" aria-label="Left margin" />
				<span class="opt-label">Right</span>
				<input type="number" min={0} max={pageWidth / 2} bind:value={marginRight} class="opt-input w-20" aria-label="Right margin" />
			</div>
			<div class="opt-row">
				<span class="opt-label">Top</span>
				<input type="number" min={0} max={pageHeight / 2} bind:value={marginTop} class="opt-input w-20" aria-label="Top margin" />
				<span class="opt-label">Bottom</span>
				<input type="number" min={0} max={pageHeight / 2} bind:value={marginBottom} class="opt-input w-20" aria-label="Bottom margin" />
			</div>
			{#if pageCount > 1}
				<div class="opt-row">
					<label class="flex items-center gap-2 cursor-pointer text-sm">
						<input type="checkbox" bind:checked={applyToAll} />
						Apply to all pages
					</label>
				</div>
			{/if}
		</div>

		<button class="btn highlight" disabled={processing} onclick={apply}>
			{processing ? 'Cropping…' : 'Crop PDF'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! Output: <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>Save cropped PDF</button>
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
	.preview-wrap { @apply relative rounded-lg overflow-hidden border; border-color: var(--bg-separator); }
	.preview-img { @apply w-full h-full object-contain; }
	.crop-overlay {
		@apply absolute;
		border: 2px dashed var(--accent);
		background: hsla(162, 72%, 28%, 0.08);
	}
</style>
