<script lang="ts">
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { unlockPdf } from '$lib/pdf/unlock';
	import { downloadPdf, formatFileSize } from '$lib/pdf/utils';
	import { UnlockIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	$effect(() => {
		void files;
		resultBytes = null;
		error = '';
	});

	async function apply() {
		if (files.length === 0) { error = 'Add a PDF file.'; return; }
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await unlockPdf(files[0]);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to unlock. The file may not be encrypted or uses unsupported encryption.';
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, files[0].name.replace(/\.pdf$/i, '_unlocked.pdf'));
	}
</script>

<svelte:head>
	<title>Unlock PDF — LocalConvert</title>
	<meta name="description" content="Remove password protection from PDF files. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/unlock/" />
</svelte:head>

<div class="unlock-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">← PDF Tools</a>
	<div class="unlock-header">
		<UnlockIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Unlock PDF</h1>
			<p class="text-sm text-muted">Remove password protection from a PDF file.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a password-protected PDF" />

	{#if files.length > 0}
		<div class="info-box">
			<p class="text-sm">This tool removes restrictions (printing, copying, editing) from PDFs. It works with most permission-locked files. Files with strong open-password encryption may not be supported.</p>
		</div>

		<button class="btn highlight" disabled={processing} onclick={apply}>
			{processing ? 'Unlocking…' : 'Unlock PDF'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">Unlocked! <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>Save unlocked PDF</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style>
	.unlock-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.unlock-header { display: flex; align-items: center; gap: 0.75rem; }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.info-box { padding: 0.75rem 1rem; border-radius: 0.75rem; background: var(--bg-panel-alt); color: var(--fg-muted); }
</style>
