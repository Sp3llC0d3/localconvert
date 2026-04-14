<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { pdfToPpt } from '$lib/pdf/pdf-to-ppt';
	import { downloadBlob, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { PresentationIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';

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
			error = e instanceof Error ? e.message : m['tools_common.failed']();
		}
		processing = false;
	}

	function download() {
		if (!resultBlob) return;
		downloadBlob(resultBlob, getOutputName(files[0].name, '', 'pptx'));
	}
</script>

<svelte:head>
	<title>PDF to PowerPoint — LocalConvert</title>
	<meta name="description" content="Convert PDF to PowerPoint presentation. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/pdf-to-ppt/" />
	<meta property="og:title" content="PDF to PowerPoint — LocalConvert" />
	<meta property="og:description" content="Convert PDF to PowerPoint presentation. Free, private, no uploads — runs entirely in your browser." />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/pdf-to-ppt/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Convert PDF to PowerPoint","step":[{"@type":"HowToStep","text":"Select a PDF file"},{"@type":"HowToStep","text":"Each page becomes a presentation slide"},{"@type":"HowToStep","text":"Click convert to create the PPTX"},{"@type":"HowToStep","text":"Save the PowerPoint file"}]})}</script>`}
</svelte:head>

<div class="pdf-page">
	<ToolPageHeader
		category="pdf"
		title={m['tool_pages.pdf_to_ppt.title']()}
		description={m['tool_pages.pdf_to_ppt.desc']()}
		icon={PresentationIcon}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<PdfUploader bind:files multiple={false} label={m['tools_common.upload_pdf']()} />

	<div class="opt-section">
		<div class="opt-row">
			<span class="opt-label">{m['tool_pages.pdf_to_ppt.slide_size']()}</span>
			<div class="flex gap-2">
				<button class="btn text-sm px-3 py-1.5 {slideSize === '16:9' ? 'highlight' : ''}" onclick={() => slideSize = '16:9'}>{m['tool_pages.pdf_to_ppt.widescreen']()}</button>
				<button class="btn text-sm px-3 py-1.5 {slideSize === '4:3' ? 'highlight' : ''}" onclick={() => slideSize = '4:3'}>{m['tool_pages.pdf_to_ppt.standard']()}</button>
			</div>
		</div>
	</div>

	{#if files.length > 0}
		<button class="btn highlight" disabled={processing} onclick={convert}>
			{processing ? m['tool_pages.pdf_to_ppt.btn_busy']({ progress, total }) : m['tool_pages.pdf_to_ppt.btn']()}
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
			<p class="text-sm font-medium">{m['tools_common.ready']()} {m['tools_common.output']()} <b>{formatFileSize(resultBlob.size)}</b></p>
			<button class="btn" onclick={download}>{m['tool_pages.pdf_to_ppt.save']()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
.opt-section { @apply flex flex-col gap-4 p-4 rounded-2xl bg-panel shadow-panel; }
	.opt-row { @apply flex items-center gap-4 flex-wrap; }
	.opt-label { @apply text-sm font-semibold w-20 flex-shrink-0; }
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
</style>
