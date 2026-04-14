<script lang="ts">
	import { m } from '$lib/paraglide/messages';
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
			error = m['tool_pages.from_docx.invalid_file']();
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
			error = e instanceof Error ? e.message : m['tools_common.failed']();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes || !file) return;
		downloadPdf(resultBytes, file.name.replace(/\.(docx|doc)$/i, '.pdf'));
	}
</script>

<svelte:head>
	<title>Word to PDF — LocalConvert</title>
	<meta name="description" content="Convert Word documents (DOCX, DOC) to PDF. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/from-docx/" />
	<meta property="og:title" content="Word to PDF — LocalConvert" />
	<meta property="og:description" content="Convert Word documents (DOCX, DOC) to PDF. Free, private, no uploads — runs entirely in your browser." />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/from-docx/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Convert Word to PDF","step":[{"@type":"HowToStep","text":"Select a DOCX or DOC file"},{"@type":"HowToStep","text":"Click convert to create the PDF"},{"@type":"HowToStep","text":"Review the conversion result"},{"@type":"HowToStep","text":"Save the PDF file"}]})}</script>`}
</svelte:head>

<div class="docx-page">
	<ToolPageHeader
		category="pdf"
		icon={FileTextIcon}
		title={m['tool_pages.from_docx.title']()}
		description={m['tool_pages.from_docx.desc']()}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<PdfUploader bind:files multiple={false} accept=".docx,.doc" label={m['tool_pages.from_docx.drop_hint']()} />

	{#if file}
		{#if processing}
			<div class="flex flex-col gap-2">
				<p class="text-sm text-muted">{m['tools_common.converting_progress']({ progress })}</p>
				<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--bg-separator)">
					<div class="h-full rounded-full transition-all" style="background: var(--accent); width: {progress}%"></div>
				</div>
			</div>
		{/if}

		<button class="btn highlight" disabled={processing} onclick={convert}>
			{processing ? m['tools_common.converting_progress']({ progress }) : m['tools_common.convert_to_pdf']()}
		</button>

		<p class="disclaimer">ⓘ {m['tool_pages.from_docx.disclaimer']()}</p>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">
				{m['tools_common.output']()} <b>{formatFileSize(resultBytes.byteLength)}</b>
			</p>
			<button class="btn" onclick={download}>{m['tools_common.save_pdf']()}</button>
		</div>
	{/if}

	
	{#if toolSeo['from-docx']}
		<ToolSeoBlock
			faqs={toolSeo['from-docx'].faqKeys.length >= 4 ? [
				{ q: (m as any)[toolSeo['from-docx'].faqKeys[0]]?.() ?? '', a: (m as any)[toolSeo['from-docx'].faqKeys[1]]?.() ?? '' },
				{ q: (m as any)[toolSeo['from-docx'].faqKeys[2]]?.() ?? '', a: (m as any)[toolSeo['from-docx'].faqKeys[3]]?.() ?? '' },
			] : []}
			relatedTools={toolSeo['from-docx'].related.map(r => ({ href: r.href, name: (m as any)[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style>
	.docx-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.disclaimer { font-size: 0.8rem; color: var(--fg-muted); margin: 0; line-height: 1.5; }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
</style>
