<script lang="ts">
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { unlockPdf } from '$lib/pdf/unlock';
	import { downloadPdf, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { LockOpenIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { m } from '$lib/paraglide/messages';

	let files = $state<File[]>([]);
	let password = $state('');
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	$effect(() => {
		void files;
		resultBytes = null;
		error = '';
	});

	async function apply() {
		if (files.length === 0) { error = m['tool_pages.unlock.err_pdf'](); return; }
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await unlockPdf(files[0], password);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tool_pages.unlock.err_fail']();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, getOutputName(files[0].name, 'unlocked', 'pdf'));
	}
</script>

<svelte:head>
	<title>Unlock PDF — LocalConvert</title>
	<meta name="description" content="Remove password protection from PDF files. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/unlock/" />
	<meta property="og:title" content="Unlock PDF — LocalConvert" />
	<meta property="og:description" content="Remove password protection from PDF files. Free, private, no uploads — runs entirely in your browser." />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/unlock/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Unlock a PDF","step":[{"@type":"HowToStep","text":"Select a password-protected PDF"},{"@type":"HowToStep","text":"Enter the current password"},{"@type":"HowToStep","text":"Click unlock to remove protection"},{"@type":"HowToStep","text":"Save the unlocked PDF"}]})}</script>`}
</svelte:head>

<div class="unlock-page">
	<ToolPageHeader
		category="pdf"
		title={m['tool_pages.unlock.title']()}
		description={m['tool_pages.unlock.desc']()}
		icon={LockOpenIcon}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<PdfUploader bind:files multiple={false} label={m['tools_common.upload_pdf_protected']()} />

	{#if files.length > 0}
		<div class="info-box">
			<p class="text-sm">{m['tool_pages.unlock.info']()}</p>
		</div>

		<div class="opt-section">
			<label class="text-sm font-medium">{m['tool_pages.unlock.password_label']()}</label>
			<input
				type="password"
				bind:value={password}
				placeholder={m['tool_pages.unlock.password_placeholder']()}
				class="pwd-input"
			/>
			<p class="text-xs text-muted">{m['tool_pages.unlock.password_hint']()}</p>
		</div>

		<button class="btn highlight" disabled={processing} onclick={apply}>
			{processing ? m['tool_pages.unlock.btn_busy']() : m['tool_pages.unlock.btn']()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{m['tool_pages.unlock.result']()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{m['tool_pages.unlock.save']()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style>
	.unlock-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.info-box { padding: 0.75rem 1rem; border-radius: 0.75rem; background: var(--bg-panel-alt); color: var(--fg-muted); }
	.opt-section { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.pwd-input {
		width: 100%; padding: 0.6rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.pwd-input:focus { outline: 1.5px solid var(--accent); }
</style>
