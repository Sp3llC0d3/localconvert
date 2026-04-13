<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { convertPdfToDocx } from '$lib/pdf/to-docx';
	import { downloadBlob, formatFileSize } from '$lib/pdf/utils';
	import { FileOutputIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';

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
			error = e instanceof Error ? e.message : m['tools_common.failed']();
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
	<title>PDF to Word — LocalConvert</title>
	<meta name="description" content="Convert PDF to editable Word (DOCX) files. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/to-docx/" />
</svelte:head>

<div class="todocx-page">
	<ToolPageHeader
		category="pdf"
		icon={FileOutputIcon}
		title={m['tool_pages.to_docx.title']()}
		description={m['tool_pages.to_docx.desc']()}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<PdfUploader bind:files multiple={false} label={m['tools_common.upload_pdf']()} />

	{#if file}
		<div class="limitation-box">
			<p class="limitation-title">ℹ️ {m['tool_pages.to_docx.expect_title']()}</p>
			<ul>
				<li>{m['tool_pages.to_docx.expect_text']()}</li>
				<li>{m['tool_pages.to_docx.expect_headings']()}</li>
				<li>{m['tool_pages.to_docx.expect_tables']()}</li>
				<li>{m['tool_pages.to_docx.expect_scanned']()}</li>
			</ul>
		</div>

		{#if processing}
			<div class="flex flex-col gap-2">
				<p class="text-sm text-muted">{m['tool_pages.to_docx.progress_label']({ progress })}</p>
				<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--bg-separator)">
					<div class="h-full rounded-full transition-all" style="background: var(--accent); width: {progress}%"></div>
				</div>
			</div>
		{/if}

		<button class="btn highlight" disabled={processing} onclick={convert}>
			{processing ? m['tool_pages.to_docx.progress_label']({ progress }) : m['tool_pages.to_docx.btn']()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">
				{m['tools_common.output']()} <b>{formatFileSize(resultBytes.byteLength)}</b>
			</p>
			<button class="btn" onclick={download}>{m['tool_pages.to_docx.save']()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
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
	ul { margin: 0; padding-left: 1.2rem; }
	li { color: var(--fg-muted); }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
</style>
