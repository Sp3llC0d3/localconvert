<script lang="ts">
	const __nkm = {'pdf_tools.tools.organize_name': pdf_tools_tools_organize_name, 'pdf_tools.tools.crop_name': pdf_tools_tools_crop_name, 'pdf_tools.tools.page_numbers_name': pdf_tools_tools_page_numbers_name};
	import { tool_pages_rotate_pdf_err_fail, tool_pages_rotate_pdf_title, tool_pages_rotate_pdf_desc, tools_common_back_pdf, tools_common_upload_pdf, tool_pages_rotate_pdf_rotation, tool_pages_rotate_pdf_apply_to, tool_pages_rotate_pdf_all_pages, tool_pages_rotate_pdf_selected_pages, tools_common_loading_thumbs, tools_common_pages_selected, tool_pages_rotate_pdf_help, tool_pages_rotate_pdf_btn_busy, tools_common_rotate, tools_common_privacy_note, tool_pages_rotate_seo_faq1_q, tool_pages_rotate_seo_faq1_a, tool_pages_rotate_seo_faq2_q, tool_pages_rotate_seo_faq2_a, pdf_tools_tools_organize_name, pdf_tools_tools_crop_name, pdf_tools_tools_page_numbers_name } from "$lib/paraglide/messages/_barrel.js";
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import PdfPageThumbnail from '$lib/components/pdf/PdfPageThumbnail.svelte';
	import { rotatePdf } from '$lib/pdf/rotate';
	import { renderAllThumbnails } from '$lib/pdf/thumbnails';
	import { downloadPdf, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { RotateCwIcon, XIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let thumbs = $state<string[]>([]);
	let selectedPages = $state<Set<number>>(new Set());
	let loadingThumbs = $state(false);
	let processing = $state(false);
	let error = $state('');
	let rotation = $state<90 | 180 | 270>(90);
	let applyTo = $state<'all' | 'selected'>('all');

	$effect(() => {
		if (!browser || files.length === 0) { thumbs = []; selectedPages = new Set(); return; }
		let cancelled = false;
		loadingThumbs = true;
		renderAllThumbnails(files[0], 0.3).then(t => {
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

	async function rotate() {
		error = '';
		processing = true;
		try {
			const indices = applyTo === 'selected' ? [...selectedPages] : undefined;
			const bytes = await rotatePdf(files[0], rotation, indices);
			downloadPdf(bytes, getOutputName(files[0].name, `rotated${rotation}`, 'pdf'));
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tool_pages_rotate_pdf_err_fail();
		}
		processing = false;
	}
</script>

<svelte:head>
	<title>{tool_pages_rotate_pdf_title()} — LocalConvert</title>
	<meta name="description" content="Rotate individual or all pages in a PDF by 90°, 180°, or 270°. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/rotate/" />
	<meta property="og:title" content="Rotate PDF Pages — LocalConvert" />
	<meta property="og:description" content="Rotate individual or all pages in a PDF by 90°, 180°, or 270°. Free, private, no uploads — runs entirely in your browser." />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/rotate/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Rotate PDF Pages","step":[{"@type":"HowToStep","text":"Select a PDF file"},{"@type":"HowToStep","text":"Choose the rotation angle (90°, 180°, 270°)"},{"@type":"HowToStep","text":"Apply rotation to selected or all pages"},{"@type":"HowToStep","text":"Save the rotated PDF"}]})}</script>`}
</svelte:head>

<div class="pdf-page">
	<ToolPageHeader
		category="pdf"
		title={tool_pages_rotate_pdf_title()}
		description={tool_pages_rotate_pdf_desc()}
		icon={RotateCwIcon}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<PdfUploader bind:files multiple={false} label={tools_common_upload_pdf()} />

	{#if files.length > 0}
		<!-- Options -->
		<div class="flex flex-wrap items-center gap-4">
			<div class="flex flex-col gap-1">
				<span class="text-xs font-semibold text-muted">{tool_pages_rotate_pdf_rotation()}</span>
				<div class="flex gap-2">
					{#each [90, 180, 270] as deg}
						<button
							class="btn text-sm px-3 py-1.5 {rotation === deg ? 'highlight' : ''}"
							onclick={() => rotation = deg as 90 | 180 | 270}
						>{deg}°</button>
					{/each}
				</div>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-xs font-semibold text-muted">{tool_pages_rotate_pdf_apply_to()}</span>
				<div class="flex gap-2">
					<button
						class="btn text-sm px-3 py-1.5 {applyTo === 'all' ? 'highlight' : ''}"
						onclick={() => applyTo = 'all'}
					>{tool_pages_rotate_pdf_all_pages()}</button>
					<button
						class="btn text-sm px-3 py-1.5 {applyTo === 'selected' ? 'highlight' : ''}"
						onclick={() => applyTo = 'selected'}
					>{tool_pages_rotate_pdf_selected_pages()}</button>
				</div>
			</div>
		</div>

		{#if loadingThumbs}
			<p class="text-sm text-muted">{tools_common_loading_thumbs()}</p>
		{:else if thumbs.length > 0}
			<div class="thumb-grid">
				{#each thumbs as thumb, i}
					{@const shouldRotate = applyTo === 'all' || selectedPages.has(i)}
					<div
						class="thumb-wrapper"
						onclick={() => { if (applyTo === 'selected') togglePage(i); }}
						role={applyTo === 'selected' ? 'button' : undefined}
					>
						<PdfPageThumbnail
							src={thumb}
							pageNum={i + 1}
							selected={applyTo === 'selected' && selectedPages.has(i)}
						/>
						{#if shouldRotate}
							<div class="rotate-indicator" style="transform: rotate({rotation}deg);">↻</div>
						{/if}
					</div>
				{/each}
			</div>
			{#if applyTo === 'selected'}
				<p class="text-xs text-muted">{tools_common_pages_selected({ count: selectedPages.size })} — {tool_pages_rotate_pdf_help()}</p>
			{/if}
		{/if}

		<button class="btn highlight" disabled={processing} onclick={rotate}>
			{processing ? tool_pages_rotate_pdf_btn_busy() : `${tools_common_rotate()} ${applyTo === 'all' ? tool_pages_rotate_pdf_all_pages() : tool_pages_rotate_pdf_selected_pages()} ${rotation}°`}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}
	
	{#if toolSeo['rotate']}
		<ToolSeoBlock
			faqs={toolSeo['rotate'].faqKeys.length >= 4 ? [
				{ q: tool_pages_rotate_seo_faq1_q?.() ?? '', a: tool_pages_rotate_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_rotate_seo_faq2_q?.() ?? '', a: tool_pages_rotate_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['rotate'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
.thumb-grid { @apply grid gap-3; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }
	.thumb-wrapper { position: relative; }
	.thumb-wrapper[role="button"] { cursor: pointer; }
	.rotate-indicator {
		position: absolute; top: 4px; right: 4px;
		width: 22px; height: 22px; border-radius: 50%;
		background: var(--accent); color: var(--fg-on-accent);
		display: flex; align-items: center; justify-content: center;
		font-size: 12px; font-weight: bold;
		transition: transform 0.2s ease;
		box-shadow: 0 1px 3px rgba(0,0,0,0.3);
	}
</style>
