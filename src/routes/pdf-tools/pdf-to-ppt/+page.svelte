<script lang="ts">
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { pdfToPpt } from '$lib/pdf/pdf-to-ppt';
	import { downloadBlob, formatFileSize } from '$lib/pdf/utils';
	import { PresentationIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let slideSize = $state<'16:9' | '4:3'>('16:9');
	let processing = $state(false);
	let progress = $state(0);
	let total = $state(0);
	let error = $state('');
	let resultBlob = $state<Blob | null>(null);

	async function convert() {
		if (files.length === 0) return;
		error = '';
		processing = true;
		progress = 0;
		total = 0;
		resultBlob = null;
		try {
			resultBlob = await pdfToPpt(files[0], slideSize, (cur, tot) => {
				progress = cur;
				total = tot;
			});
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed.';
		}
		processing = false;
	}

	function download() {
		if (!resultBlob) return;
		downloadBlob(resultBlob, files[0].name.replace(/\.pdf$/i, '.pptx'));
	}
</script>

<svelte:head>
	<title>PDF to PowerPoint — LocalConvert</title>
	<meta name="description" content="Convert PDF to PowerPoint presentation. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/pdf-to-ppt/" />
</svelte:head>

<div class="pdf-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">← PDF Tools</a>
	<div class="pdf-header">
		<PresentationIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">PDF to PowerPoint</h1>
			<p class="text-sm text-muted">Convert each PDF page into a presentation slide.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

	<div class="opt-section">
		<div class="opt-row">
			<span class="opt-label">Slide size</span>
			<div class="flex gap-2">
				<button class="btn text-sm px-3 py-1.5 {slideSize === '16:9' ? 'highlight' : ''}" onclick={() => slideSize = '16:9'}>16:9 Widescreen</button>
				<button class="btn text-sm px-3 py-1.5 {slideSize === '4:3' ? 'highlight' : ''}" onclick={() => slideSize = '4:3'}>4:3 Standard</button>
			</div>
		</div>
	</div>

	{#if files.length > 0}
		<button class="btn highlight" disabled={processing} onclick={convert}>
			{processing ? `Converting page ${progress} of ${total}…` : 'Convert to PPTX'}
		</button>
	{/if}

	{#if processing && total > 0}
		<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--bg-separator)">
			<div class="h-full rounded-full transition-all" style="background: var(--accent); width: {(progress / total) * 100}%"></div>
		</div>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBlob}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! Output: <b>{formatFileSize(resultBlob.size)}</b></p>
			<button class="btn" onclick={download}>Save PPTX</button>
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
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
</style>
