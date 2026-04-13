<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { convertXlsxToPdf } from '$lib/pdf/from-xlsx';
	import { downloadPdf, formatFileSize } from '$lib/pdf/utils';
	import { TableIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let progress = $state(0);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);
	let orientation = $state<'landscape' | 'portrait'>('landscape');

	let file = $derived(files[0] ?? null);

	$effect(() => {
		void files;
		resultBytes = null;
		error = '';
	});

	async function convert() {
		if (!browser || !file) return;
		if (!file.name.match(/\.(xlsx|xls|ods|csv)$/i)) {
			error = m['tool_pages.from_xlsx.invalid_file']();
			return;
		}
		error = '';
		processing = true;
		resultBytes = null;
		progress = 0;
		try {
			resultBytes = await convertXlsxToPdf(file, {
				orientation,
				onProgress: (p) => { progress = Math.round(p * 100); },
			});
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tools_common.failed']();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes || !file) return;
		downloadPdf(resultBytes, file.name.replace(/\.(xlsx|xls|ods|csv)$/i, '.pdf'));
	}
</script>

<svelte:head>
	<title>Excel to PDF — LocalConvert</title>
	<meta name="description" content="Convert Excel spreadsheets (XLSX, XLS, ODS, CSV) to PDF. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/from-xlsx/" />
</svelte:head>

<div class="xlsx-page">
	<ToolPageHeader
		category="pdf"
		icon={TableIcon}
		title={m['tool_pages.from_xlsx.title']()}
		description={m['tool_pages.from_xlsx.desc']()}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<PdfUploader bind:files multiple={false} accept=".xlsx,.xls,.ods,.csv" label={m['tool_pages.from_xlsx.drop_hint']()} />

	{#if file}
		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">{m['tool_pages.from_xlsx.page_orientation']()}</span>
				<div class="toggle-group">
					<button
						class="toggle-btn"
						class:active={orientation === 'landscape'}
						onclick={() => orientation = 'landscape'}
					>
						{m['tool_pages.from_xlsx.landscape']()}
					</button>
					<button
						class="toggle-btn"
						class:active={orientation === 'portrait'}
						onclick={() => orientation = 'portrait'}
					>
						{m['tool_pages.from_xlsx.portrait']()}
					</button>
				</div>
			</div>
		</div>

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

		<p class="disclaimer">ⓘ {m['tool_pages.from_xlsx.disclaimer']()}</p>
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

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style>
	.xlsx-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.opt-section { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; flex-shrink: 0; }
	.toggle-group { display: flex; border-radius: 0.75rem; overflow: hidden; border: 1px solid var(--bg-separator); }
	.toggle-btn {
		padding: 0.35rem 0.9rem; font-size: 0.85rem; font-weight: 500;
		cursor: pointer; border: none; background: transparent;
		color: var(--fg-muted); transition: background 0.15s, color 0.15s;
	}
	.toggle-btn.active { background: var(--accent); color: var(--fg-on-accent); }
	.disclaimer { font-size: 0.8rem; color: var(--fg-muted); margin: 0; line-height: 1.5; }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
</style>
