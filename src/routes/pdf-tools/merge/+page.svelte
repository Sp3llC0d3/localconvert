<script lang="ts">
	const __nkm = {'pdf_tools.tools.split_name': pdf_tools_tools_split_name, 'pdf_tools.tools.organize_name': pdf_tools_tools_organize_name, 'pdf_tools.tools.compress_name': pdf_tools_tools_compress_name};
	import { tool_pages_merge_err_min, tool_pages_merge_err_fail, tool_pages_merge_title, tool_pages_merge_desc, tools_common_back_pdf, tools_common_upload_pdfs, tool_pages_merge_btn_busy, tool_pages_merge_btn, tools_common_ready, tools_common_output, tool_pages_merge_save, tools_common_privacy_note, tool_pages_merge_seo_faq1_q, tool_pages_merge_seo_faq1_a, tool_pages_merge_seo_faq2_q, tool_pages_merge_seo_faq2_a, pdf_tools_tools_split_name, pdf_tools_tools_organize_name, pdf_tools_tools_compress_name } from "$lib/paraglide/messages/_barrel.js";
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { mergePdfs } from '$lib/pdf/merge';
	import { downloadPdf, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { XIcon, GitMergeIcon, GripVerticalIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	let dragIndex = $state<number | null>(null);

	function removeFile(i: number) {
		files = files.filter((_, idx) => idx !== i);
		resultBytes = null;
	}

	function onDragStart(i: number) { dragIndex = i; }
	function onDragOver(e: DragEvent, i: number) {
		e.preventDefault();
		if (dragIndex === null || dragIndex === i) return;
		const arr = [...files];
		const [moved] = arr.splice(dragIndex, 1);
		arr.splice(i, 0, moved);
		files = arr;
		dragIndex = i;
	}
	function onDragEnd() { dragIndex = null; }

	async function merge() {
		if (files.length < 2) { error = tool_pages_merge_err_min(); return; }
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await mergePdfs(files);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tool_pages_merge_err_fail();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, getOutputName(files[0]?.name ?? 'merged', 'merged', 'pdf'));
	}
</script>

<svelte:head>
	<title>{tool_pages_merge_title()} — LocalConvert</title>
	<meta name="description" content="Combine multiple PDF files into one. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/merge/" />
	<meta property="og:title" content="Merge PDF — LocalConvert" />
	<meta property="og:description" content="Combine multiple PDF files into one. Free, private, no uploads — runs entirely in your browser." />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/merge/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Merge PDF Files","step":[{"@type":"HowToStep","text":"Select multiple PDF files"},{"@type":"HowToStep","text":"Arrange them in the desired order"},{"@type":"HowToStep","text":"Click merge to combine into one PDF"},{"@type":"HowToStep","text":"Save the merged PDF"}]})}</script>`}
</svelte:head>

<div class="pdf-page">
	<ToolPageHeader
		category="pdf"
		title={tool_pages_merge_title()}
		description={tool_pages_merge_desc()}
		icon={GitMergeIcon}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<PdfUploader bind:files label={tools_common_upload_pdfs()} />

	{#if files.length > 0}
		<ul class="file-list">
			{#each files as f, i}
				<li
					class="file-row"
					draggable="true"
					ondragstart={() => onDragStart(i)}
					ondragover={(e) => onDragOver(e, i)}
					ondragend={onDragEnd}
				>
					<GripVerticalIcon size={16} class="text-muted cursor-grab flex-shrink-0" />
					<span class="flex-1 text-sm truncate">{f.name}</span>
					<span class="text-xs text-muted">{formatFileSize(f.size)}</span>
					<button onclick={() => removeFile(i)} class="icon-btn"><XIcon size={14} /></button>
				</li>
			{/each}
		</ul>

		<button class="btn highlight" disabled={processing} onclick={merge}>
			{processing ? tool_pages_merge_btn_busy() : tool_pages_merge_btn()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{tools_common_ready()} {tools_common_output()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{tool_pages_merge_save()}</button>
		</div>
	{/if}

	
	{#if toolSeo['merge']}
		<ToolSeoBlock
			faqs={toolSeo['merge'].faqKeys.length >= 4 ? [
				{ q: tool_pages_merge_seo_faq1_q?.() ?? '', a: tool_pages_merge_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_merge_seo_faq2_q?.() ?? '', a: tool_pages_merge_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['merge'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
.file-list { @apply flex flex-col gap-2; }
	.file-row { @apply flex items-center gap-3 px-4 py-3 rounded-xl bg-panel shadow-panel; }
	.icon-btn { @apply w-6 h-6 rounded-full flex items-center justify-center text-muted hover:bg-separator transition-colors; }
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
</style>
