<script lang="ts">
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { addPageNumbers, type NumberPosition, type NumberFormat } from '$lib/pdf/page-numbers';
	import { downloadPdf, formatFileSize } from '$lib/pdf/utils';
	import { ListOrderedIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let position = $state<NumberPosition>('bottom-center');
	let format = $state<NumberFormat>('plain');
	let startFrom = $state(1);
	let fontSize = $state(12);
	let skipFirst = $state(false);
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	const positions: { value: NumberPosition; label: string }[] = [
		{ value: 'bottom-left', label: 'Bottom left' },
		{ value: 'bottom-center', label: 'Bottom center' },
		{ value: 'bottom-right', label: 'Bottom right' },
		{ value: 'top-left', label: 'Top left' },
		{ value: 'top-center', label: 'Top center' },
		{ value: 'top-right', label: 'Top right' },
	];

	const formats: { value: NumberFormat; label: string }[] = [
		{ value: 'plain', label: '1, 2, 3' },
		{ value: 'page-n', label: 'Page 1' },
		{ value: 'n-of-total', label: '1 / 5' },
		{ value: 'roman', label: 'I, II, III' },
	];

	async function apply() {
		if (files.length === 0) { error = 'Add a PDF file.'; return; }
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await addPageNumbers(files[0], {
				position,
				format,
				startFrom,
				fontSize,
				skipFirstPage: skipFirst,
			});
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed.';
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, files[0].name.replace(/\.pdf$/i, '_numbered.pdf'));
	}
</script>

<svelte:head>
	<title>Add Page Numbers to PDF — LocalConvert</title>
	<meta name="description" content="Add page numbers to any PDF file. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/page-numbers/" />
</svelte:head>

<div class="pdf-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">← PDF Tools</a>
	<div class="pdf-header">
		<ListOrderedIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Add Page Numbers</h1>
			<p class="text-sm text-muted">Add sequential numbering to every page of a PDF.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

	<div class="opt-section">
		<div class="opt-row">
			<span class="opt-label">Position</span>
			<div class="flex gap-2 flex-wrap">
				{#each positions as pos}
					<button
						class="btn text-sm px-3 py-1.5 {position === pos.value ? 'highlight' : ''}"
						onclick={() => position = pos.value}
					>{pos.label}</button>
				{/each}
			</div>
		</div>
		<div class="opt-row">
			<span class="opt-label">Format</span>
			<div class="flex gap-2 flex-wrap">
				{#each formats as fmt}
					<button
						class="btn text-sm px-3 py-1.5 {format === fmt.value ? 'highlight' : ''}"
						onclick={() => format = fmt.value}
					>{fmt.label}</button>
				{/each}
			</div>
		</div>
		<div class="opt-row">
			<span class="opt-label">Font size</span>
			<input type="range" min={8} max={24} bind:value={fontSize} class="quality-slider flex-1" aria-label="Font size" />
			<span class="text-sm text-muted w-10">{fontSize}pt</span>
		</div>
		<div class="opt-row">
			<span class="opt-label">Start from</span>
			<input
				type="number"
				min={1}
				max={9999}
				bind:value={startFrom}
				class="opt-input w-20"
				aria-label="Starting page number"
			/>
		</div>
		<div class="opt-row">
			<label class="flex items-center gap-2 cursor-pointer text-sm">
				<input type="checkbox" bind:checked={skipFirst} />
				Skip first page (e.g. cover page)
			</label>
		</div>
	</div>

	{#if files.length > 0}
		<button class="btn highlight" disabled={processing} onclick={apply}>
			{processing ? 'Adding numbers…' : 'Add page numbers'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! Output: <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>Save numbered PDF</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
	.pdf-header { @apply flex items-center gap-3; }
	.opt-section { @apply flex flex-col gap-4 p-4 rounded-2xl bg-panel shadow-panel; }
	.opt-row { @apply flex items-center gap-4 flex-wrap; }
	.opt-label { @apply text-sm font-semibold w-20 flex-shrink-0; }
	.opt-input { @apply rounded-lg px-3 py-1.5 text-sm border; background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg); border-color: var(--bg-separator); }
	.opt-input:focus { outline: 1.5px solid var(--accent); }
	.quality-slider { @apply h-1.5 appearance-none rounded-full cursor-pointer; background: var(--bg-separator); accent-color: var(--accent); }
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
</style>
