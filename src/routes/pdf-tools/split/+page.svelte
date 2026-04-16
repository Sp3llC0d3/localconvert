<script lang="ts">
	const __nkm = {'pdf_tools.tools.merge_name': pdf_tools_tools_merge_name, 'pdf_tools.tools.organize_name': pdf_tools_tools_organize_name, 'pdf_tools.tools.pdf_to_images_name': pdf_tools_tools_pdf_to_images_name};
	import { tool_pages_split_err_extract, tool_pages_split_err_select, tool_pages_split_err_fail, tool_pages_split_title, tool_pages_split_desc, tools_common_back_pdf, tools_common_upload_pdf, tool_pages_split_select_pages, tool_pages_split_split_all, tools_common_clear, tools_common_loading_thumbs, tools_common_pages_selected, tool_pages_split_help, tool_pages_split_btn_busy, tool_pages_split_download_selected, tools_common_privacy_note, tool_pages_split_seo_faq1_q, tool_pages_split_seo_faq1_a, tool_pages_split_seo_faq2_q, tool_pages_split_seo_faq2_a, pdf_tools_tools_merge_name, pdf_tools_tools_organize_name, pdf_tools_tools_pdf_to_images_name , meta_descriptions_pdf_split} from "$lib/paraglide/messages/_barrel.js";
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import PdfPageThumbnail from '$lib/components/pdf/PdfPageThumbnail.svelte';
	import { splitPdf, splitAllPages } from '$lib/pdf/split';
	import { renderAllThumbnails } from '$lib/pdf/thumbnails';
	import { downloadPdf, downloadBlob, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { ScissorsIcon, XIcon, DownloadIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let thumbs = $state<string[]>([]);
	let selectedPages = $state<Set<number>>(new Set());
	let loadingThumbs = $state(false);
	let thumbProgress = $state(0);
	let processing = $state(false);
	let error = $state('');
	let mode = $state<'select' | 'all'>('select');

	$effect(() => {
		if (!browser || files.length === 0) {
			thumbs = [];
			selectedPages = new Set();
			return;
		}
		let cancelled = false;
		loadingThumbs = true;
		thumbProgress = 0;
		renderAllThumbnails(files[0], 0.3, (done, total) => {
			if (!cancelled) thumbProgress = Math.round((done / total) * 100);
		}).then(t => {
			if (!cancelled) { thumbs = t; loadingThumbs = false; }
		}).catch(e => {
			if (!cancelled) { error = e.message; loadingThumbs = false; }
		});
		return () => { cancelled = true; };
	});

	function togglePage(i: number) {
		const s = new Set(selectedPages);
		if (s.has(i)) s.delete(i); else s.add(i);
		selectedPages = s;
	}

	async function downloadSinglePage(pageIndex: number) {
		try {
			const bytes = await splitPdf(files[0], [pageIndex]);
			downloadPdf(bytes, getOutputName(files[0].name, `page${pageIndex + 1}`, 'pdf'));
		} catch {
			error = tool_pages_split_err_extract();
		}
	}

	async function doSplit() {
		error = '';
		processing = true;
		try {
			if (mode === 'all') {
				const pages = await splitAllPages(files[0]);
				// download as zip if multiple
				if (pages.length === 1) {
					downloadPdf(pages[0].bytes, getOutputName(files[0].name, 'page1', 'pdf'));
				} else {
					const { createZip } = await import('$lib/util/zip');
					const fileObjs = pages.map(p => new File([p.bytes], p.name));
					const zip = await createZip(fileObjs);
					downloadBlob(new Blob([zip], { type: 'application/zip' }), getOutputName(files[0].name, 'pages', 'zip'));
				}
			} else {
				if (selectedPages.size === 0) { error = tool_pages_split_err_select(); processing = false; return; }
				const indices = [...selectedPages].sort((a, b) => a - b);
				const bytes = await splitPdf(files[0], indices);
				downloadPdf(bytes, getOutputName(files[0].name, `pages_${indices.map(i => i + 1).join('-')}`, 'pdf'));
			}
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tool_pages_split_err_fail();
		}
		processing = false;
	}
</script>

<svelte:head>
	<title>{tool_pages_split_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_pdf_split()} />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/split/" />
	<meta property="og:title" content="{tool_pages_split_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_pdf_split()} />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/split/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Split a PDF","step":[{"@type":"HowToStep","text":"Select a PDF file"},{"@type":"HowToStep","text":"Choose which pages to extract"},{"@type":"HowToStep","text":"Click split to separate pages"},{"@type":"HowToStep","text":"Save the split PDFs"}]})}</script>`}
</svelte:head>

<div class="pdf-page">
	<ToolPageHeader
		category="pdf"
		title={tool_pages_split_title()}
		description={tool_pages_split_desc()}
		icon={ScissorsIcon}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<PdfUploader bind:files multiple={false} label={tools_common_upload_pdf()} />

	{#if files.length > 0}
		<div class="flex items-center gap-2 flex-wrap">
			<button
				class="btn text-sm px-4 py-2 {mode === 'select' ? 'highlight' : ''}"
				onclick={() => mode = 'select'}
			>{tool_pages_split_select_pages()}</button>
			<button
				class="btn text-sm px-4 py-2 {mode === 'all' ? 'highlight' : ''}"
				onclick={() => mode = 'all'}
			>{tool_pages_split_split_all()}</button>
			<button class="icon-btn ms-2" onclick={() => { files = []; thumbs = []; selectedPages = new Set(); }}>
				<XIcon size={14} />
				<span class="text-xs ms-1">{tools_common_clear()}</span>
			</button>
		</div>

		{#if loadingThumbs}
			<div class="flex flex-col gap-2">
				<p class="text-sm text-muted">{tools_common_loading_thumbs()} {thumbProgress}%</p>
				<div class="h-1.5 rounded-full bg-separator overflow-hidden">
					<div class="h-full bg-accent transition-all" style="width: {thumbProgress}%"></div>
				</div>
			</div>
		{:else if thumbs.length > 0 && mode === 'select'}
			<div class="thumb-grid">
				{#each thumbs as thumb, i}
					<div class="thumb-wrap">
						<PdfPageThumbnail
							src={thumb}
							pageNum={i + 1}
							selected={selectedPages.has(i)}
							onclick={() => togglePage(i)}
						/>
						<button
							class="page-dl-btn"
							onclick={(e) => { e.stopPropagation(); downloadSinglePage(i); }}
							aria-label="Download page {i + 1}"
						>
							<DownloadIcon size={12} />
						</button>
					</div>
				{/each}
			</div>
			<p class="text-xs text-muted">{tools_common_pages_selected({ count: selectedPages.size })} — {tool_pages_split_help()}</p>
		{/if}

		<button class="btn highlight" disabled={processing} onclick={doSplit}>
			{processing ? tool_pages_split_btn_busy() : mode === 'all' ? tool_pages_split_split_all() : tool_pages_split_download_selected()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}
	
	{#if toolSeo['split']}
		<ToolSeoBlock
			faqs={toolSeo['split'].faqKeys.length >= 4 ? [
				{ q: tool_pages_split_seo_faq1_q?.() ?? '', a: tool_pages_split_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_split_seo_faq2_q?.() ?? '', a: tool_pages_split_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['split'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
.icon-btn { @apply flex items-center px-3 py-1.5 rounded-lg text-muted hover:bg-separator transition-colors text-sm; }
	.thumb-grid { @apply grid gap-3; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }
	.thumb-wrap { position: relative; }
	.page-dl-btn {
		position: absolute; bottom: 4px; right: 4px; z-index: 10;
		display: flex; align-items: center; justify-content: center;
		width: 22px; height: 22px; border-radius: 50%;
		background: var(--accent); color: var(--fg-on-accent);
		border: none; cursor: pointer; opacity: 0.7;
		box-shadow: 0 1px 3px rgba(0,0,0,0.3);
		transition: opacity 0.15s;
	}
	.page-dl-btn:hover { opacity: 1; }
</style>
