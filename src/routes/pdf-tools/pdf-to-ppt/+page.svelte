<script lang="ts">
	const __nkm = {'pdf_tools.tools.to_docx_name': pdf_tools_tools_to_docx_name, 'pdf_tools.tools.pdf_to_text_name': pdf_tools_tools_pdf_to_text_name, 'pdf_tools.tools.pdf_to_images_name': pdf_tools_tools_pdf_to_images_name};
	import { tools_common_failed, tool_pages_pdf_to_ppt_title, tool_pages_pdf_to_ppt_desc, tools_common_back_pdf, tools_common_upload_pdf, tool_pages_pdf_to_ppt_slide_size, tool_pages_pdf_to_ppt_widescreen, tool_pages_pdf_to_ppt_standard, tool_pages_pdf_to_ppt_btn_busy, tool_pages_pdf_to_ppt_btn, tools_common_ready, tools_common_output, tool_pages_pdf_to_ppt_save, tools_common_privacy_note, tool_pages_pdf_to_ppt_seo_faq1_q, tool_pages_pdf_to_ppt_seo_faq1_a, tool_pages_pdf_to_ppt_seo_faq2_q, tool_pages_pdf_to_ppt_seo_faq2_a, pdf_tools_tools_to_docx_name, pdf_tools_tools_pdf_to_text_name, pdf_tools_tools_pdf_to_images_name } from "$lib/paraglide/messages/_barrel.js";
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { pdfToPpt } from '$lib/pdf/pdf-to-ppt';
	import { downloadBlob, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { PresentationIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

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
			error = e instanceof Error ? e.message : tools_common_failed();
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
		title={tool_pages_pdf_to_ppt_title()}
		description={tool_pages_pdf_to_ppt_desc()}
		icon={PresentationIcon}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<PdfUploader bind:files multiple={false} label={tools_common_upload_pdf()} />

	<div class="opt-section">
		<div class="opt-row">
			<span class="opt-label">{tool_pages_pdf_to_ppt_slide_size()}</span>
			<div class="flex gap-2">
				<button class="btn text-sm px-3 py-1.5 {slideSize === '16:9' ? 'highlight' : ''}" onclick={() => slideSize = '16:9'}>{tool_pages_pdf_to_ppt_widescreen()}</button>
				<button class="btn text-sm px-3 py-1.5 {slideSize === '4:3' ? 'highlight' : ''}" onclick={() => slideSize = '4:3'}>{tool_pages_pdf_to_ppt_standard()}</button>
			</div>
		</div>
	</div>

	{#if files.length > 0}
		<button class="btn highlight" disabled={processing} onclick={convert}>
			{processing ? tool_pages_pdf_to_ppt_btn_busy({ progress, total }) : tool_pages_pdf_to_ppt_btn()}
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
			<p class="text-sm font-medium">{tools_common_ready()} {tools_common_output()} <b>{formatFileSize(resultBlob.size)}</b></p>
			<button class="btn" onclick={download}>{tool_pages_pdf_to_ppt_save()}</button>
		</div>
	{/if}

	
	{#if toolSeo['pdf-to-ppt']}
		<ToolSeoBlock
			faqs={toolSeo['pdf-to-ppt'].faqKeys.length >= 4 ? [
				{ q: tool_pages_pdf_to_ppt_seo_faq1_q?.() ?? '', a: tool_pages_pdf_to_ppt_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_pdf_to_ppt_seo_faq2_q?.() ?? '', a: tool_pages_pdf_to_ppt_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['pdf-to-ppt'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
.opt-section { @apply flex flex-col gap-4 p-4 rounded-2xl bg-panel shadow-panel; }
	.opt-row { @apply flex items-center gap-4 flex-wrap; }
	.opt-label { @apply text-sm font-semibold w-20 flex-shrink-0; }
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
</style>
