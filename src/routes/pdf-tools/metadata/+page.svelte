<script lang="ts">
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { getMetadata, updateMetadata, type PdfMetadata } from '$lib/pdf/metadata';
	import { downloadPdf, formatFileSize } from '$lib/pdf/utils';
	import { FileTextIcon } from 'lucide-svelte';

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
			const m = await getMetadata(files[0]);
			meta = m;
			title = m.title;
			author = m.author;
			subject = m.subject;
			keywords = m.keywords;
			creator = m.creator;
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to read metadata.';
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
			error = e instanceof Error ? e.message : 'Failed to update metadata.';
		}
		saving = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, files[0].name.replace(/\.pdf$/i, '_metadata.pdf'));
	}
</script>

<svelte:head>
	<title>Edit PDF Metadata — LocalConvert</title>
	<meta name="description" content="View and edit PDF metadata — title, author, subject, keywords. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/metadata/" />
</svelte:head>

<div class="pdf-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">← PDF Tools</a>
	<div class="pdf-header">
		<FileTextIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Edit Metadata</h1>
			<p class="text-sm text-muted">View and edit title, author, and other PDF properties.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

	{#if loading}
		<p class="text-sm text-muted">Reading metadata…</p>
	{/if}

	{#if meta}
		<div class="opt-section">
			<div class="field">
				<label for="meta-title" class="field-label">Title</label>
				<input id="meta-title" type="text" bind:value={title} class="field-input" />
			</div>
			<div class="field">
				<label for="meta-author" class="field-label">Author</label>
				<input id="meta-author" type="text" bind:value={author} class="field-input" />
			</div>
			<div class="field">
				<label for="meta-subject" class="field-label">Subject</label>
				<input id="meta-subject" type="text" bind:value={subject} class="field-input" />
			</div>
			<div class="field">
				<label for="meta-keywords" class="field-label">Keywords</label>
				<input id="meta-keywords" type="text" bind:value={keywords} placeholder="keyword1, keyword2" class="field-input" />
			</div>
			<div class="field">
				<label for="meta-creator" class="field-label">Creator</label>
				<input id="meta-creator" type="text" bind:value={creator} class="field-input" />
			</div>

			<!-- Read-only fields -->
			<div class="flex flex-col gap-1 pt-2 border-t" style="border-color: var(--bg-separator)">
				<p class="text-xs text-muted">Producer: {meta.producer || '—'}</p>
				<p class="text-xs text-muted">Created: {meta.creationDate || '—'}</p>
				<p class="text-xs text-muted">Modified: {meta.modificationDate || '—'}</p>
			</div>
		</div>

		<button class="btn highlight" disabled={saving} onclick={save}>
			{saving ? 'Saving…' : 'Save metadata'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! Output: <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>Save updated PDF</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
	.pdf-header { @apply flex items-center gap-3; }
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
