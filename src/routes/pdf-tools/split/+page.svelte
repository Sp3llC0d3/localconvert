<script lang="ts">
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import PdfPageThumbnail from '$lib/components/pdf/PdfPageThumbnail.svelte';
	import { splitPdf, splitAllPages } from '$lib/pdf/split';
	import { renderAllThumbnails } from '$lib/pdf/thumbnails';
	import { downloadPdf, downloadBlob, formatFileSize } from '$lib/pdf/utils';
	import { ScissorsIcon, XIcon, DownloadIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let thumbs = $state<string[]>([]);
	let selectedPages = $state<Set<number>>(new Set());
	let loadingThumbs = $state(false);
	let thumbProgress = $state(0);
	let processing = $state(false);
	let error = $state('');
	let mode = $state<'select' | 'all'>('select');

	$effect(() => {
		if (!browser || files.length === 0) {
			thumbs = [];
			selectedPages = new Set();
			return;
		}
		let cancelled = false;
		loadingThumbs = true;
		thumbProgress = 0;
		renderAllThumbnails(files[0], 0.3, (done, total) => {
			if (!cancelled) thumbProgress = Math.round((done / total) * 100);
		}).then(t => {
			if (!cancelled) { thumbs = t; loadingThumbs = false; }
		}).catch(e => {
			if (!cancelled) { error = e.message; loadingThumbs = false; }
		});
		return () => { cancelled = true; };
	});

	function togglePage(i: number) {
		const s = new Set(selectedPages);
		if (s.has(i)) s.delete(i); else s.add(i);
		selectedPages = s;
	}

	async function downloadSinglePage(pageIndex: number) {
		try {
			const bytes = await splitPdf(files[0], [pageIndex]);
			const baseName = files[0].name.replace(/\.pdf$/i, '');
			downloadPdf(bytes, `${baseName}_page${pageIndex + 1}.pdf`);
		} catch {
			error = 'Failed to extract page.';
		}
	}

	async function doSplit() {
		error = '';
		processing = true;
		try {
			if (mode === 'all') {
				const pages = await splitAllPages(files[0]);
				// download as zip if multiple
				if (pages.length === 1) {
					downloadPdf(pages[0].bytes, pages[0].name);
				} else {
					const { createZip } = await import('$lib/util/zip');
					const fileObjs = pages.map(p => new File([p.bytes], p.name));
					const zip = await createZip(fileObjs);
					downloadBlob(new Blob([zip], { type: 'application/zip' }), files[0].name.replace(/\.pdf$/i, '_pages.zip'));
				}
			} else {
				if (selectedPages.size === 0) { error = 'Select at least one page.'; processing = false; return; }
				const indices = [...selectedPages].sort((a, b) => a - b);
				const bytes = await splitPdf(files[0], indices);
				const name = files[0].name.replace(/\.pdf$/i, `_pages_${indices.map(i => i + 1).join('-')}.pdf`);
				downloadPdf(bytes, name);
			}
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Split failed.';
		}
		processing = false;
	}
</script>

<svelte:head>
	<title>Split PDF — LocalConvert</title>
	<meta name="description" content="Split a PDF into individual pages or extract a page range. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/split/" />
</svelte:head>

<div class="pdf-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">← PDF Tools</a>
	<div class="pdf-header">
		<ScissorsIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Split PDF</h1>
			<p class="text-sm text-muted">Extract pages or split every page into its own file.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

	{#if files.length > 0}
		<div class="flex items-center gap-2 flex-wrap">
			<button
				class="btn text-sm px-4 py-2 {mode === 'select' ? 'highlight' : ''}"
				onclick={() => mode = 'select'}
			>Select pages</button>
			<button
				class="btn text-sm px-4 py-2 {mode === 'all' ? 'highlight' : ''}"
				onclick={() => mode = 'all'}
			>Split all pages</button>
			<button class="icon-btn ml-2" onclick={() => { files = []; thumbs = []; selectedPages = new Set(); }}>
				<XIcon size={14} />
				<span class="text-xs ml-1">Clear</span>
			</button>
		</div>

		{#if loadingThumbs}
			<div class="flex flex-col gap-2">
				<p class="text-sm text-muted">Loading thumbnails… {thumbProgress}%</p>
				<div class="h-1.5 rounded-full bg-separator overflow-hidden">
					<div class="h-full bg-accent transition-all" style="width: {thumbProgress}%"></div>
				</div>
			</div>
		{:else if thumbs.length > 0 && mode === 'select'}
			<div class="thumb-grid">
				{#each thumbs as thumb, i}
					<div class="thumb-wrap">
						<PdfPageThumbnail
							src={thumb}
							pageNum={i + 1}
							selected={selectedPages.has(i)}
							onclick={() => togglePage(i)}
						/>
						<button
							class="page-dl-btn"
							onclick={(e) => { e.stopPropagation(); downloadSinglePage(i); }}
							aria-label="Download page {i + 1}"
						>
							<DownloadIcon size={12} />
						</button>
					</div>
				{/each}
			</div>
			<p class="text-xs text-muted">{selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''} selected — click to toggle, arrow to download</p>
		{/if}

		<button class="btn highlight" disabled={processing} onclick={doSplit}>
			{processing ? 'Processing…' : mode === 'all' ? 'Split all pages' : 'Download selected pages'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}
	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
	.pdf-header { @apply flex items-center gap-3; }
	.icon-btn { @apply flex items-center px-3 py-1.5 rounded-lg text-muted hover:bg-separator transition-colors text-sm; }
	.thumb-grid { @apply grid gap-3; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }
	.thumb-wrap { position: relative; }
	.page-dl-btn {
		position: absolute; bottom: 4px; right: 4px; z-index: 10;
		display: flex; align-items: center; justify-content: center;
		width: 22px; height: 22px; border-radius: 50%;
		background: var(--accent); color: var(--fg-on-accent);
		border: none; cursor: pointer; opacity: 0.7;
		box-shadow: 0 1px 3px rgba(0,0,0,0.3);
		transition: opacity 0.15s;
	}
	.page-dl-btn:hover { opacity: 1; }
</style>
