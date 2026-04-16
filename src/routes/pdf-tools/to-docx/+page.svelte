<script lang="ts">
	const __nkm = {'pdf_tools.tools.from_docx_name': pdf_tools_tools_from_docx_name, 'pdf_tools.tools.pdf_to_text_name': pdf_tools_tools_pdf_to_text_name, 'pdf_tools.tools.pdf_to_ppt_name': pdf_tools_tools_pdf_to_ppt_name};
	import { tools_common_failed, tool_pages_to_docx_title, tool_pages_to_docx_desc, tools_common_back_pdf, tools_common_upload_pdf, tool_pages_to_docx_expect_title, tool_pages_to_docx_expect_text, tool_pages_to_docx_expect_headings, tool_pages_to_docx_expect_tables, tool_pages_to_docx_expect_scanned, tool_pages_to_docx_progress_label, tool_pages_to_docx_btn, tools_common_output, tool_pages_to_docx_save, tools_common_privacy_note, tool_pages_to_docx_seo_faq1_q, tool_pages_to_docx_seo_faq1_a, tool_pages_to_docx_seo_faq2_q, tool_pages_to_docx_seo_faq2_a, pdf_tools_tools_from_docx_name, pdf_tools_tools_pdf_to_text_name, pdf_tools_tools_pdf_to_ppt_name , navbar_home, navbar_pdf_tools, meta_descriptions_pdf_to_docx} from "$lib/paraglide/messages/_barrel.js";
	import { localizeHref } from '$lib/paraglide/runtime';
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { convertPdfToDocx } from '$lib/pdf/to-docx';
	import { downloadBlob, formatFileSize } from '$lib/pdf/utils';
	import { FileOutputIcon } from 'lucide-svelte';
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
		error = '';
		processing = true;
		resultBytes = null;
		progress = 0;
		try {
			resultBytes = await convertPdfToDocx(file, {
				onProgress: (p) => { progress = Math.round(p * 100); },
			});
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tools_common_failed();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes || !file) return;
		const blob = new Blob(
			[resultBytes.buffer.slice(resultBytes.byteOffset, resultBytes.byteOffset + resultBytes.byteLength)],
			{ type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
		);
		downloadBlob(blob, file.name.replace(/\.pdf$/i, '.docx'));
	}
</script>

<svelte:head>
	<title>{tool_pages_to_docx_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_pdf_to_docx()} />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/to-docx/" />
	<meta property="og:title" content="{tool_pages_to_docx_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_pdf_to_docx()} />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/to-docx/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Convert PDF to Word","step":[{"@type":"HowToStep","text":"Select a PDF file"},{"@type":"HowToStep","text":"Click convert to extract text as DOCX"},{"@type":"HowToStep","text":"Review the converted document"},{"@type":"HowToStep","text":"Save the Word file"}]})}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":navbar_home(),"item":"https://localconvert.app"+localizeHref("/")},{"@type":"ListItem","position":2,"name":navbar_pdf_tools(),"item":"https://localconvert.app"+localizeHref("/pdf-tools/")},{"@type":"ListItem","position":3,"name":tool_pages_to_docx_title()}]})}</script>`}
</svelte:head>

<div class="todocx-page">
	<ToolPageHeader
		category="pdf"
		icon={FileOutputIcon}
		title={tool_pages_to_docx_title()}
		description={tool_pages_to_docx_desc()}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<PdfUploader bind:files multiple={false} label={tools_common_upload_pdf()} />

	{#if file}
		<div class="limitation-box">
			<p class="limitation-title">ℹ️ {tool_pages_to_docx_expect_title()}</p>
			<ul>
				<li>{tool_pages_to_docx_expect_text()}</li>
				<li>{tool_pages_to_docx_expect_headings()}</li>
				<li>{tool_pages_to_docx_expect_tables()}</li>
				<li>{tool_pages_to_docx_expect_scanned()}</li>
			</ul>
		</div>

		{#if processing}
			<div class="flex flex-col gap-2">
				<p class="text-sm text-muted">{tool_pages_to_docx_progress_label({ progress })}</p>
				<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--bg-separator)">
					<div class="h-full rounded-full transition-all" style="background: var(--accent); width: {progress}%"></div>
				</div>
			</div>
		{/if}

		<button class="btn highlight" disabled={processing} onclick={convert}>
			{processing ? tool_pages_to_docx_progress_label({ progress }) : tool_pages_to_docx_btn()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">
				{tools_common_output()} <b>{formatFileSize(resultBytes.byteLength)}</b>
			</p>
			<button class="btn" onclick={download}>{tool_pages_to_docx_save()}</button>
		</div>
	{/if}

	
	{#if toolSeo['to-docx']}
		<ToolSeoBlock
			faqs={toolSeo['to-docx'].faqKeys.length >= 4 ? [
				{ q: tool_pages_to_docx_seo_faq1_q?.() ?? '', a: tool_pages_to_docx_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_to_docx_seo_faq2_q?.() ?? '', a: tool_pages_to_docx_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['to-docx'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>
</div>

<style>
	.todocx-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.limitation-box {
		background: var(--bg-panel);
		border: 1px solid var(--bg-separator);
		border-radius: 1rem;
		padding: 0.9rem 1rem;
		font-size: 0.85rem;
		line-height: 1.6;
		box-shadow: var(--shadow-panel);
	}
	.limitation-title { font-weight: 700; margin: 0 0 0.4rem; }
	ul { margin: 0; padding-inline-start: 1.2rem; }
	li { color: var(--fg-muted); }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
</style>
