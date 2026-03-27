<script lang="ts">
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { editPdf, type PdfEdit, type TextEdit } from '$lib/pdf/edit';
	import { renderAllThumbnails } from '$lib/pdf/thumbnails';
	import { downloadPdf, formatFileSize, getPdfJs } from '$lib/pdf/utils';
	import { EditIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	// Page info
	let thumbs = $state<string[]>([]);
	let currentPage = $state(0);
	let pageWidth = $state(612);
	let pageHeight = $state(792);

	// Edit entries
	let edits = $state<TextEdit[]>([]);
	let newText = $state('');
	let newX = $state(50);
	let newY = $state(700);
	let newFontSize = $state(14);
	let newColor = $state('#000000');

	$effect(() => {
		if (!browser || files.length === 0) {
			thumbs = [];
			edits = [];
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

	function hexToRgb(hex: string): [number, number, number] {
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;
		return [r, g, b];
	}

	function addTextEdit() {
		if (!newText.trim()) return;
		edits = [...edits, {
			type: 'text',
			text: newText.trim(),
			x: newX,
			y: newY,
			fontSize: newFontSize,
			color: hexToRgb(newColor),
		}];
		newText = '';
	}

	function removeEdit(index: number) {
		edits = edits.filter((_, i) => i !== index);
	}

	async function apply() {
		if (files.length === 0) { error = 'Add a PDF file.'; return; }
		if (edits.length === 0) { error = 'Add at least one text element.'; return; }
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await editPdf(files[0], currentPage, edits as PdfEdit[]);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed.';
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, files[0].name.replace(/\.pdf$/i, '_edited.pdf'));
	}
</script>

<svelte:head>
	<title>Edit PDF — LocalConvert</title>
	<meta name="description" content="Add text to PDF pages. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/edit/" />
</svelte:head>

<div class="pdf-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">← PDF Tools</a>
	<div class="pdf-header">
		<EditIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Edit PDF</h1>
			<p class="text-sm text-muted">Add text to any page of a PDF.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

	{#if thumbs.length > 0}
		<!-- Page preview -->
		{#if thumbs[currentPage]}
			<div class="flex flex-col items-center gap-2">
				<img src={thumbs[currentPage]} alt="Page {currentPage + 1}" class="page-preview" />
				<p class="text-xs text-muted">Page {currentPage + 1} — {pageWidth} × {pageHeight} pt</p>
			</div>
		{/if}

		<!-- Page selector -->
		{#if thumbs.length > 1}
			<div class="flex gap-2 flex-wrap">
				{#each thumbs as _, i}
					<button class="btn text-sm px-3 py-1.5 {currentPage === i ? 'highlight' : ''}" onclick={() => currentPage = i}>
						Page {i + 1}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Add text -->
		<div class="opt-section">
			<p class="text-sm font-semibold">Add text</p>
			<div class="opt-row">
				<input type="text" bind:value={newText} placeholder="Enter text…" class="opt-input flex-1" />
			</div>
			<div class="opt-row">
				<span class="opt-label">X</span>
				<input type="number" min={0} max={pageWidth} bind:value={newX} class="opt-input w-20" aria-label="X position" />
				<span class="opt-label">Y</span>
				<input type="number" min={0} max={pageHeight} bind:value={newY} class="opt-input w-20" aria-label="Y position" />
			</div>
			<div class="opt-row">
				<span class="opt-label">Size</span>
				<input type="number" min={6} max={72} bind:value={newFontSize} class="opt-input w-20" aria-label="Font size" />
				<span class="opt-label">Color</span>
				<input type="color" bind:value={newColor} class="w-8 h-8 rounded cursor-pointer" aria-label="Text color" />
			</div>
			<button class="btn text-sm px-4 py-1.5" onclick={addTextEdit}>+ Add text</button>
		</div>

		<!-- Edit list -->
		{#if edits.length > 0}
			<div class="opt-section">
				<p class="text-sm font-semibold">Elements ({edits.length})</p>
				{#each edits as edit, i}
					<div class="flex items-center justify-between gap-2 text-sm">
						<span class="truncate flex-1">"{edit.text}" at ({edit.x}, {edit.y})</span>
						<button class="text-xs text-muted hover:text-failure" onclick={() => removeEdit(i)} aria-label="Remove element">✕</button>
					</div>
				{/each}
			</div>
		{/if}

		<button class="btn highlight" disabled={processing || edits.length === 0} onclick={apply}>
			{processing ? 'Applying…' : 'Apply edits'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! Output: <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>Save edited PDF</button>
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
	.page-preview { @apply max-h-72 rounded-xl object-contain mx-auto border; border-color: var(--bg-separator); }
</style>
