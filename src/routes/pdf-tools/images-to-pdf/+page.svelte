<script lang="ts">
	const __nkm = {'pdf_tools.tools.pdf_to_images_name': pdf_tools_tools_pdf_to_images_name, 'pdf_tools.tools.compress_name': pdf_tools_tools_compress_name, 'pdf_tools.tools.merge_name': pdf_tools_tools_merge_name};
	import { tool_pages_images_to_pdf_err_min, tool_pages_images_to_pdf_err_fail, tool_pages_images_to_pdf_title, tool_pages_images_to_pdf_desc, tools_common_back_pdf, tools_common_upload_images_pdf, tool_pages_images_to_pdf_btn_busy, tool_pages_images_to_pdf_btn, tools_common_ready, tools_common_output, tool_pages_images_to_pdf_save, tools_common_privacy_note, tool_pages_images_to_pdf_seo_faq1_q, tool_pages_images_to_pdf_seo_faq1_a, tool_pages_images_to_pdf_seo_faq2_q, tool_pages_images_to_pdf_seo_faq2_a, pdf_tools_tools_pdf_to_images_name, pdf_tools_tools_compress_name, pdf_tools_tools_merge_name , meta_descriptions_pdf_images_to_pdf} from "$lib/paraglide/messages/_barrel.js";
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { imagesToPdf } from '$lib/pdf/images-to-pdf';
	import { downloadPdf, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { ImageIcon, XIcon, GripVerticalIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	let dragIndex = $state<number | null>(null);

	// Generate object URL previews — computed fresh whenever files changes,
	// cleanup previous set via $effect return value
	const previews = $derived(files.map(f => URL.createObjectURL(f)));

	$effect(() => {
		const urls = previews;
		return () => urls.forEach(u => URL.revokeObjectURL(u));
	});

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

	async function convert() {
		if (files.length === 0) { error = tool_pages_images_to_pdf_err_min(); return; }
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await imagesToPdf(files);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tool_pages_images_to_pdf_err_fail();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, getOutputName('images', '', 'pdf'));
	}
</script>

<svelte:head>
	<title>{tool_pages_images_to_pdf_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_pdf_images_to_pdf()} />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/images-to-pdf/" />
	<meta property="og:title" content="{tool_pages_images_to_pdf_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_pdf_images_to_pdf()} />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/images-to-pdf/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Convert Images to PDF","step":[{"@type":"HowToStep","text":"Select one or more image files (JPG, PNG, WEBP)"},{"@type":"HowToStep","text":"Arrange images in the desired order"},{"@type":"HowToStep","text":"Click convert to create the PDF"},{"@type":"HowToStep","text":"Save the PDF file"}]})}</script>`}
</svelte:head>

<div class="pdf-page">
	<ToolPageHeader
		category="pdf"
		title={tool_pages_images_to_pdf_title()}
		description={tool_pages_images_to_pdf_desc()}
		icon={ImageIcon}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<PdfUploader
		bind:files
		accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
		label={tools_common_upload_images_pdf()}
	/>

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
					{#if previews[i]}
						<img src={previews[i]} alt={f.name} class="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
					{/if}
					<span class="flex-1 text-sm truncate">{f.name}</span>
					<span class="text-xs text-muted">{formatFileSize(f.size)}</span>
					<button onclick={() => removeFile(i)} class="icon-btn"><XIcon size={14} /></button>
				</li>
			{/each}
		</ul>

		<button class="btn highlight" disabled={processing} onclick={convert}>
			{processing ? tool_pages_images_to_pdf_btn_busy() : tool_pages_images_to_pdf_btn()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{tools_common_ready()} {tools_common_output()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{tool_pages_images_to_pdf_save()}</button>
		</div>
	{/if}

	
	{#if toolSeo['images-to-pdf']}
		<ToolSeoBlock
			faqs={toolSeo['images-to-pdf'].faqKeys.length >= 4 ? [
				{ q: tool_pages_images_to_pdf_seo_faq1_q?.() ?? '', a: tool_pages_images_to_pdf_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_images_to_pdf_seo_faq2_q?.() ?? '', a: tool_pages_images_to_pdf_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['images-to-pdf'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
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
