<script lang="ts">
	const __nkm = {'pdf_tools.tools.compress_name': pdf_tools_tools_compress_name, 'pdf_tools.tools.password_name': pdf_tools_tools_password_name, 'pdf_tools.tools.unlock_name': pdf_tools_tools_unlock_name};
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { getMetadata, updateMetadata, type PdfMetadata } from '$lib/pdf/metadata';
	import { downloadPdf, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { FileTextIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { tool_pages_metadata_err_read, tool_pages_metadata_err_update, tool_pages_metadata_title, tool_pages_metadata_desc, tools_common_back_pdf, tools_common_upload_pdf, tool_pages_metadata_reading, tool_pages_metadata_field_title, tool_pages_metadata_field_author, tool_pages_metadata_field_subject, tool_pages_metadata_field_keywords, tool_pages_metadata_keywords_placeholder, tool_pages_metadata_field_creator, tool_pages_metadata_producer, tool_pages_metadata_none, tool_pages_metadata_created, tool_pages_metadata_modified, tool_pages_metadata_btn_busy, tool_pages_metadata_btn, tools_common_ready, tools_common_output, tool_pages_metadata_save, tools_common_privacy_note, tool_pages_metadata_seo_faq1_q, tool_pages_metadata_seo_faq1_a, tool_pages_metadata_seo_faq2_q, tool_pages_metadata_seo_faq2_a, pdf_tools_tools_compress_name, pdf_tools_tools_password_name, pdf_tools_tools_unlock_name } from "$lib/paraglide/messages/_barrel.js";
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let meta = $state<PdfMetadata | null>(null);
	let loading = $state(false);
	let saving = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	// Editable fields
	let title = $state('');
	let author = $state('');
	let subject = $state('');
	let keywords = $state('');
	let creator = $state('');

	$effect(() => {
		if (files.length === 0) {
			meta = null;
			resultBytes = null;
			return;
		}
		loadMeta();
	});

	async function loadMeta() {
		loading = true;
		error = '';
		meta = null;
		resultBytes = null;
		try {
			const result = await getMetadata(files[0]);
			meta = result;
			title = result.title;
			author = result.author;
			subject = result.subject;
			keywords = result.keywords;
			creator = result.creator;
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tool_pages_metadata_err_read();
		}
		loading = false;
	}

	async function save() {
		if (files.length === 0) return;
		saving = true;
		error = '';
		resultBytes = null;
		try {
			resultBytes = await updateMetadata(files[0], {
				title,
				author,
				subject,
				keywords,
				creator,
			});
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tool_pages_metadata_err_update();
		}
		saving = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, getOutputName(files[0].name, 'metadata', 'pdf'));
	}
</script>

<svelte:head>
	<title>Edit PDF Metadata — LocalConvert</title>
	<meta name="description" content="View and edit PDF metadata — title, author, subject, keywords. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/metadata/" />
	<meta property="og:title" content="Edit PDF Metadata — LocalConvert" />
	<meta property="og:description" content="View and edit PDF metadata — title, author, subject, keywords. Free, private, no uploads." />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/metadata/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Edit PDF Metadata","step":[{"@type":"HowToStep","text":"Select a PDF file"},{"@type":"HowToStep","text":"Edit the title, author, and other properties"},{"@type":"HowToStep","text":"Review the changes"},{"@type":"HowToStep","text":"Save the updated PDF"}]})}</script>`}
</svelte:head>

<div class="pdf-page">
	<ToolPageHeader
		category="pdf"
		title={tool_pages_metadata_title()}
		description={tool_pages_metadata_desc()}
		icon={FileTextIcon}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<PdfUploader bind:files multiple={false} label={tools_common_upload_pdf()} />

	{#if loading}
		<p class="text-sm text-muted">{tool_pages_metadata_reading()}</p>
	{/if}

	{#if meta}
		<div class="opt-section">
			<div class="field">
				<label for="meta-title" class="field-label">{tool_pages_metadata_field_title()}</label>
				<input id="meta-title" type="text" bind:value={title} class="field-input" />
			</div>
			<div class="field">
				<label for="meta-author" class="field-label">{tool_pages_metadata_field_author()}</label>
				<input id="meta-author" type="text" bind:value={author} class="field-input" />
			</div>
			<div class="field">
				<label for="meta-subject" class="field-label">{tool_pages_metadata_field_subject()}</label>
				<input id="meta-subject" type="text" bind:value={subject} class="field-input" />
			</div>
			<div class="field">
				<label for="meta-keywords" class="field-label">{tool_pages_metadata_field_keywords()}</label>
				<input id="meta-keywords" type="text" bind:value={keywords} placeholder={tool_pages_metadata_keywords_placeholder()} class="field-input" />
			</div>
			<div class="field">
				<label for="meta-creator" class="field-label">{tool_pages_metadata_field_creator()}</label>
				<input id="meta-creator" type="text" bind:value={creator} class="field-input" />
			</div>

			<!-- Read-only fields -->
			<div class="flex flex-col gap-1 pt-2 border-t" style="border-color: var(--bg-separator)">
				<p class="text-xs text-muted">{tool_pages_metadata_producer()} {meta.producer || tool_pages_metadata_none()}</p>
				<p class="text-xs text-muted">{tool_pages_metadata_created()} {meta.creationDate || tool_pages_metadata_none()}</p>
				<p class="text-xs text-muted">{tool_pages_metadata_modified()} {meta.modificationDate || tool_pages_metadata_none()}</p>
			</div>
		</div>

		<button class="btn highlight" disabled={saving} onclick={save}>
			{saving ? tool_pages_metadata_btn_busy() : tool_pages_metadata_btn()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{tools_common_ready()} {tools_common_output()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{tool_pages_metadata_save()}</button>
		</div>
	{/if}

	
	{#if toolSeo['metadata']}
		<ToolSeoBlock
			faqs={toolSeo['metadata'].faqKeys.length >= 4 ? [
				{ q: tool_pages_metadata_seo_faq1_q?.() ?? '', a: tool_pages_metadata_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_metadata_seo_faq2_q?.() ?? '', a: tool_pages_metadata_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['metadata'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
.opt-section { @apply flex flex-col gap-4 p-4 rounded-2xl bg-panel shadow-panel; }
	.field { @apply flex flex-col gap-1; }
	.field-label { @apply text-sm font-semibold; }
	.field-input {
		@apply rounded-lg px-3 py-2 text-sm border;
		background: var(--bg-panel-alt, var(--bg-panel));
		color: var(--fg);
		border-color: var(--bg-separator);
	}
	.field-input:focus { outline: 1.5px solid var(--accent); }
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
</style>
