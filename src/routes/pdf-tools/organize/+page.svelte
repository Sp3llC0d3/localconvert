<script lang="ts">
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { organizePdf } from '$lib/pdf/organize';
	import { renderAllThumbnails } from '$lib/pdf/thumbnails';
	import { downloadPdf } from '$lib/pdf/utils';
	import { LayoutGridIcon, Trash2Icon, ArrowUpIcon, ArrowDownIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let thumbs = $state<string[]>([]);
	/** order[i] = original 0-indexed page number at position i */
	let order = $state<number[]>([]);
	let loadingThumbs = $state(false);
	let thumbProgress = $state(0);
	let processing = $state(false);
	let error = $state('');

	$effect(() => {
		if (!browser || files.length === 0) { thumbs = []; order = []; return; }
		loadingThumbs = true;
		thumbProgress = 0;
		renderAllThumbnails(files[0], 0.3, (done, total) => {
			thumbProgress = Math.round((done / total) * 100);
		}).then(t => {
			thumbs = t;
			order = t.map((_, i) => i);
			loadingThumbs = false;
		}).catch(e => { error = e.message; loadingThumbs = false; });
	});

	function moveUp(i: number) {
		if (i === 0) return;
		const arr = [...order];
		[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
		order = arr;
	}

	function moveDown(i: number) {
		if (i === order.length - 1) return;
		const arr = [...order];
		[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
		order = arr;
	}

	function deletePage(i: number) {
		order = order.filter((_, idx) => idx !== i);
	}

	async function save() {
		if (order.length === 0) { error = 'No pages remaining.'; return; }
		error = '';
		processing = true;
		try {
			const bytes = await organizePdf(files[0], order);
			downloadPdf(bytes, files[0].name.replace(/\.pdf$/i, '_organized.pdf'));
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed.';
		}
		processing = false;
	}
</script>

<svelte:head>
	<title>Organize PDF Pages — LocalConvert</title>
</svelte:head>

<div class="pdf-page">
	<div class="pdf-header">
		<LayoutGridIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Organize Pages</h1>
			<p class="text-sm text-muted">Reorder or delete pages. Use arrows to move pages up or down.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

	{#if loadingThumbs}
		<div class="flex flex-col gap-2">
			<p class="text-sm text-muted">Loading thumbnails… {thumbProgress}%</p>
			<div class="h-1.5 rounded-full bg-separator overflow-hidden">
				<div class="h-full bg-accent transition-all" style="width: {thumbProgress}%"></div>
			</div>
		</div>
	{:else if order.length > 0}
		<div class="org-list">
			{#each order as origIdx, i}
				<div class="org-row">
					<img src={thumbs[origIdx]} alt="Page {origIdx + 1}" class="org-thumb" />
					<span class="text-sm flex-1">Page {origIdx + 1}</span>
					<div class="flex gap-1">
						<button class="icon-btn" onclick={() => moveUp(i)} disabled={i === 0}><ArrowUpIcon size={14} /></button>
						<button class="icon-btn" onclick={() => moveDown(i)} disabled={i === order.length - 1}><ArrowDownIcon size={14} /></button>
						<button class="icon-btn text-failure" onclick={() => deletePage(i)}><Trash2Icon size={14} /></button>
					</div>
				</div>
			{/each}
		</div>

		<p class="text-xs text-muted">{order.length} page{order.length !== 1 ? 's' : ''} remaining</p>

		<button class="btn highlight" disabled={processing} onclick={save}>
			{processing ? 'Saving…' : 'Download organized PDF'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}
	<p class="text-xs text-muted mt-2">🔒 Your files never leave your device.</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
	.pdf-header { @apply flex items-center gap-3; }

	.org-list { @apply flex flex-col gap-2; }
	.org-row {
		@apply flex items-center gap-3 px-4 py-2 rounded-xl bg-panel shadow-panel;
	}
	.org-thumb {
		@apply w-10 h-14 object-contain rounded-md flex-shrink-0;
	}
	.icon-btn {
		@apply w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:bg-separator transition-colors;
	}
	.icon-btn:disabled {
		@apply opacity-30 cursor-not-allowed;
	}
</style>
