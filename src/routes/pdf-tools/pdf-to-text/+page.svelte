<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { pdfToText } from '$lib/pdf/pdf-to-text';
	import { downloadBlob, getOutputName } from '$lib/pdf/utils';
	import { FileTextIcon, CopyIcon, CheckIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';

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
			if (!text.trim()) error = m['tool_pages.pdf_to_text.no_text']();
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tools_common.failed']();
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
	<title>PDF to Text — LocalConvert</title>
	<meta name="description" content="Extract text from any PDF file. Copy or download as .txt. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/pdf-to-text/" />
</svelte:head>

<div class="text-page">
	<ToolPageHeader
		category="pdf"
		title={m['tool_pages.pdf_to_text.title']()}
		description={m['tool_pages.pdf_to_text.desc']()}
		icon={FileTextIcon}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<PdfUploader bind:files multiple={false} label={m['tools_common.upload_pdf']()} />

	{#if files.length > 0 && !text}
		<button class="btn highlight" disabled={processing} onclick={extract}>
			{processing ? m['tool_pages.pdf_to_text.btn_busy']({ progress, total }) : m['tool_pages.pdf_to_text.btn']()}
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
				<p class="text-sm font-semibold">{m['tool_pages.pdf_to_text.result']({ chars: text.length })}</p>
				<div class="flex gap-2">
					<button class="btn text-sm px-3 py-1.5" onclick={copyText}>
						{#if copied}<CheckIcon size={14} />{:else}<CopyIcon size={14} />{/if}
						{copied ? m['tool_pages.pdf_to_text.copied']() : m['tool_pages.pdf_to_text.copy']()}
					</button>
					<button class="btn text-sm px-3 py-1.5" onclick={downloadTxt}>
						{m['tool_pages.pdf_to_text.download_txt']()}
					</button>
				</div>
			</div>
			<textarea readonly class="text-output" value={text}></textarea>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
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
