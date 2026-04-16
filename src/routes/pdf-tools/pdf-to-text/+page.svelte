<script lang="ts">
	const __nkm = {'pdf_tools.tools.to_docx_name': pdf_tools_tools_to_docx_name, 'pdf_tools.tools.pdf_to_ppt_name': pdf_tools_tools_pdf_to_ppt_name, 'pdf_tools.tools.edit_name': pdf_tools_tools_edit_name};
	import { tool_pages_pdf_to_text_no_text, tools_common_failed, tool_pages_pdf_to_text_title, tool_pages_pdf_to_text_desc, tools_common_back_pdf, tools_common_upload_pdf, tool_pages_pdf_to_text_btn_busy, tool_pages_pdf_to_text_btn, tool_pages_pdf_to_text_result, tool_pages_pdf_to_text_copied, tool_pages_pdf_to_text_copy, tool_pages_pdf_to_text_download_txt, tools_common_privacy_note, tool_pages_pdf_to_text_seo_faq1_q, tool_pages_pdf_to_text_seo_faq1_a, tool_pages_pdf_to_text_seo_faq2_q, tool_pages_pdf_to_text_seo_faq2_a, pdf_tools_tools_to_docx_name, pdf_tools_tools_pdf_to_ppt_name, pdf_tools_tools_edit_name , navbar_home, navbar_pdf_tools, meta_descriptions_pdf_pdf_to_text} from "$lib/paraglide/messages/_barrel.js";
	import { localizeHref } from '$lib/paraglide/runtime';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { pdfToText } from '$lib/pdf/pdf-to-text';
	import { downloadBlob, getOutputName } from '$lib/pdf/utils';
	import { FileTextIcon, CopyIcon, CheckIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let progress = $state(0);
	let total = $state(0);
	let error = $state('');
	let text = $state('');
	let copied = $state(false);

	$effect(() => {
		void files;
		text = '';
		error = '';
	});

	async function extract() {
		if (files.length === 0) return;
		error = '';
		processing = true;
		progress = 0;
		text = '';
		try {
			text = await pdfToText(files[0], (d, t) => { progress = d; total = t; });
			if (!text.trim()) error = tool_pages_pdf_to_text_no_text();
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tools_common_failed();
		}
		processing = false;
	}

	async function copyText() {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => copied = false, 1500);
		} catch { /* may fail in insecure context */ }
	}

	function downloadTxt() {
		const blob = new Blob([text], { type: 'text/plain' });
		downloadBlob(blob, getOutputName(files[0].name, '', 'txt'));
	}
</script>

<svelte:head>
	<title>{tool_pages_pdf_to_text_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_pdf_pdf_to_text()} />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/pdf-to-text/" />
	<meta property="og:title" content="{tool_pages_pdf_to_text_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_pdf_pdf_to_text()} />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/pdf-to-text/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Extract Text from a PDF","step":[{"@type":"HowToStep","text":"Select a PDF file"},{"@type":"HowToStep","text":"Click extract to pull all text content"},{"@type":"HowToStep","text":"Copy the text or save as .txt file"},{"@type":"HowToStep","text":"Use the extracted text anywhere"}]})}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":navbar_home(),"item":"https://localconvert.app"+localizeHref("/")},{"@type":"ListItem","position":2,"name":navbar_pdf_tools(),"item":"https://localconvert.app"+localizeHref("/pdf-tools/")},{"@type":"ListItem","position":3,"name":tool_pages_pdf_to_text_title()}]})}</script>`}
</svelte:head>

<div class="text-page">
	<ToolPageHeader
		category="pdf"
		title={tool_pages_pdf_to_text_title()}
		description={tool_pages_pdf_to_text_desc()}
		icon={FileTextIcon}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<PdfUploader bind:files multiple={false} label={tools_common_upload_pdf()} />

	{#if files.length > 0 && !text}
		<button class="btn highlight" disabled={processing} onclick={extract}>
			{processing ? tool_pages_pdf_to_text_btn_busy({ progress, total }) : tool_pages_pdf_to_text_btn()}
		</button>

		{#if processing}
			<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--bg-separator)">
				<div class="h-full rounded-full transition-all" style="background: var(--accent); width: {total > 0 ? (progress / total * 100) : 0}%"></div>
			</div>
		{/if}
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if text}
		<div class="result-section">
			<div class="flex items-center justify-between gap-2 flex-wrap">
				<p class="text-sm font-semibold">{tool_pages_pdf_to_text_result({ chars: text.length })}</p>
				<div class="flex gap-2">
					<button class="btn text-sm px-3 py-1.5" onclick={copyText}>
						{#if copied}<CheckIcon size={14} />{:else}<CopyIcon size={14} />{/if}
						{copied ? tool_pages_pdf_to_text_copied() : tool_pages_pdf_to_text_copy()}
					</button>
					<button class="btn text-sm px-3 py-1.5" onclick={downloadTxt}>
						{tool_pages_pdf_to_text_download_txt()}
					</button>
				</div>
			</div>
			<textarea readonly class="text-output" value={text}></textarea>
		</div>
	{/if}

	
	{#if toolSeo['pdf-to-text']}
		<ToolSeoBlock
			faqs={toolSeo['pdf-to-text'].faqKeys.length >= 4 ? [
				{ q: tool_pages_pdf_to_text_seo_faq1_q?.() ?? '', a: tool_pages_pdf_to_text_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_pdf_to_text_seo_faq2_q?.() ?? '', a: tool_pages_pdf_to_text_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['pdf-to-text'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>
</div>

<style>
	.text-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.result-section { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.text-output {
		width: 100%; min-height: 16rem; max-height: 32rem; padding: 0.75rem; border-radius: 0.5rem;
		font-family: 'Lexend', sans-serif; font-size: 0.8125rem; line-height: 1.6; resize: vertical;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
</style>
