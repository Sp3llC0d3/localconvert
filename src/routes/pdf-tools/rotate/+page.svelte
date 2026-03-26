<script lang="ts">
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import PdfPageThumbnail from '$lib/components/pdf/PdfPageThumbnail.svelte';
	import { rotatePdf } from '$lib/pdf/rotate';
	import { renderAllThumbnails } from '$lib/pdf/thumbnails';
	import { downloadPdf, formatFileSize } from '$lib/pdf/utils';
	import { RotateCwIcon, XIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let thumbs = $state<string[]>([]);
	let selectedPages = $state<Set<number>>(new Set());
	let loadingThumbs = $state(false);
	let processing = $state(false);
	let error = $state('');
	let rotation = $state<90 | 180 | 270>(90);
	let applyTo = $state<'all' | 'selected'>('all');

	$effect(() => {
		if (!browser || files.length === 0) { thumbs = []; selectedPages = new Set(); return; }
		let cancelled = false;
		loadingThumbs = true;
		renderAllThumbnails(files[0], 0.3).then(t => {
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

	async function rotate() {
		error = '';
		processing = true;
		try {
			const indices = applyTo === 'selected' ? [...selectedPages] : undefined;
			const bytes = await rotatePdf(files[0], rotation, indices);
			downloadPdf(bytes, files[0].name.replace(/\.pdf$/i, `_rotated${rotation}.pdf`));
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Rotate failed.';
		}
		processing = false;
	}
</script>

<svelte:head>
	<title>Rotate PDF Pages — LocalConvert</title>
	<meta name="description" content="Rotate individual or all pages in a PDF by 90°, 180°, or 270°. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/rotate/" />
</svelte:head>

<div class="pdf-page">
	<div class="pdf-header">
		<RotateCwIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Rotate Pages</h1>
			<p class="text-sm text-muted">Rotate individual pages or the entire PDF.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

	{#if files.length > 0}
		<!-- Options -->
		<div class="flex flex-wrap items-center gap-4">
			<div class="flex flex-col gap-1">
				<span class="text-xs font-semibold text-muted">Rotation</span>
				<div class="flex gap-2">
					{#each [90, 180, 270] as deg}
						<button
							class="btn text-sm px-3 py-1.5 {rotation === deg ? 'highlight' : ''}"
							onclick={() => rotation = deg as 90 | 180 | 270}
						>{deg}°</button>
					{/each}
				</div>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-xs font-semibold text-muted">Apply to</span>
				<div class="flex gap-2">
					<button
						class="btn text-sm px-3 py-1.5 {applyTo === 'all' ? 'highlight' : ''}"
						onclick={() => applyTo = 'all'}
					>All pages</button>
					<button
						class="btn text-sm px-3 py-1.5 {applyTo === 'selected' ? 'highlight' : ''}"
						onclick={() => applyTo = 'selected'}
					>Selected pages</button>
				</div>
			</div>
		</div>

		{#if loadingThumbs}
			<p class="text-sm text-muted">Loading thumbnails…</p>
		{:else if thumbs.length > 0 && applyTo === 'selected'}
			<div class="thumb-grid">
				{#each thumbs as thumb, i}
					<PdfPageThumbnail
						src={thumb}
						pageNum={i + 1}
						selected={selectedPages.has(i)}
						onclick={() => togglePage(i)}
					/>
				{/each}
			</div>
			<p class="text-xs text-muted">{selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''} selected</p>
		{/if}

		<button class="btn highlight" disabled={processing} onclick={rotate}>
			{processing ? 'Processing…' : `Rotate ${applyTo === 'all' ? 'all pages' : 'selected'} ${rotation}°`}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}
	<p class="text-xs text-muted mt-2">🔒 Your files never leave your device.</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
	.pdf-header { @apply flex items-center gap-3; }
	.thumb-grid { @apply grid gap-3; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }
</style>
