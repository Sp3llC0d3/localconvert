<script lang="ts">
	const __nkm = {'pdf_tools.tools.to_docx_name': pdf_tools_tools_to_docx_name, 'pdf_tools.tools.from_xlsx_name': pdf_tools_tools_from_xlsx_name, 'pdf_tools.tools.compress_name': pdf_tools_tools_compress_name};
	import { tool_pages_from_docx_invalid_file, tools_common_failed, tool_pages_from_docx_title, tool_pages_from_docx_desc, tools_common_back_pdf, tool_pages_from_docx_drop_hint, tools_common_converting_progress, tools_common_convert_to_pdf, tool_pages_from_docx_disclaimer, tools_common_output, tools_common_save_pdf, tools_common_privacy_note, tool_pages_from_docx_seo_faq1_q, tool_pages_from_docx_seo_faq1_a, tool_pages_from_docx_seo_faq2_q, tool_pages_from_docx_seo_faq2_a, pdf_tools_tools_to_docx_name, pdf_tools_tools_from_xlsx_name, pdf_tools_tools_compress_name , navbar_home, navbar_pdf_tools, meta_descriptions_pdf_from_docx} from "$lib/paraglide/messages/_barrel.js";
	import { localizeHref } from '$lib/paraglide/runtime';
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { convertDocxToPdf } from '$lib/pdf/from-docx';
	import { downloadPdf, formatFileSize } from '$lib/pdf/utils';
	import { FileTextIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let progress = $state(0);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	let file = $derived(files[0] ?? null);

	$effect(() => {
		void files;
		resultBytes = null;
		error = '';
	});

	async function convert() {
		if (!browser || !file) return;
		if (!file.name.match(/\.(docx|doc)$/i)) {
			error = tool_pages_from_docx_invalid_file();
			return;
		}
		error = '';
		processing = true;
		resultBytes = null;
		progress = 0;
		try {
			resultBytes = await convertDocxToPdf(file, {
				onProgress: (p) => { progress = Math.round(p * 100); },
			});
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tools_common_failed();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes || !file) return;
		downloadPdf(resultBytes, file.name.replace(/\.(docx|doc)$/i, '.pdf'));
	}
</script>

<svelte:head>
	<title>{tool_pages_from_docx_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_pdf_from_docx()} />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/from-docx/" />
	<meta property="og:title" content="{tool_pages_from_docx_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_pdf_from_docx()} />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/from-docx/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Convert Word to PDF","step":[{"@type":"HowToStep","text":"Select a DOCX or DOC file"},{"@type":"HowToStep","text":"Click convert to create the PDF"},{"@type":"HowToStep","text":"Review the conversion result"},{"@type":"HowToStep","text":"Save the PDF file"}]})}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":navbar_home(),"item":"https://localconvert.app"+localizeHref("/")},{"@type":"ListItem","position":2,"name":navbar_pdf_tools(),"item":"https://localconvert.app"+localizeHref("/pdf-tools/")},{"@type":"ListItem","position":3,"name":tool_pages_from_docx_title()}]})}</script>`}
</svelte:head>

<div class="docx-page">
	<ToolPageHeader
		category="pdf"
		icon={FileTextIcon}
		title={tool_pages_from_docx_title()}
		description={tool_pages_from_docx_desc()}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<PdfUploader bind:files multiple={false} accept=".docx,.doc" label={tool_pages_from_docx_drop_hint()} />

	{#if file}
		{#if processing}
			<div class="flex flex-col gap-2">
				<p class="text-sm text-muted">{tools_common_converting_progress({ progress })}</p>
				<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--bg-separator)">
					<div class="h-full rounded-full transition-all" style="background: var(--accent); width: {progress}%"></div>
				</div>
			</div>
		{/if}

		<button class="btn highlight" disabled={processing} onclick={convert}>
			{processing ? tools_common_converting_progress({ progress }) : tools_common_convert_to_pdf()}
		</button>

		<p class="disclaimer">ⓘ {tool_pages_from_docx_disclaimer()}</p>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">
				{tools_common_output()} <b>{formatFileSize(resultBytes.byteLength)}</b>
			</p>
			<button class="btn" onclick={download}>{tools_common_save_pdf()}</button>
		</div>
	{/if}

	
	{#if toolSeo['from-docx']}
		<ToolSeoBlock
			faqs={toolSeo['from-docx'].faqKeys.length >= 4 ? [
				{ q: tool_pages_from_docx_seo_faq1_q?.() ?? '', a: tool_pages_from_docx_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_from_docx_seo_faq2_q?.() ?? '', a: tool_pages_from_docx_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['from-docx'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>
</div>

<style>
	.docx-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.disclaimer { font-size: 0.8rem; color: var(--fg-muted); margin: 0; line-height: 1.5; }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
</style>
