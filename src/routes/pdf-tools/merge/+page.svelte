<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { mergePdfs } from '$lib/pdf/merge';
	import { downloadPdf, formatFileSize } from '$lib/pdf/utils';
	import { XIcon, GitMergeIcon, GripVerticalIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	let dragIndex = $state<number | null>(null);

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

	async function merge() {
		if (files.length < 2) { error = m['tool_pages.merge.err_min'](); return; }
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await mergePdfs(files);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tool_pages.merge.err_fail']();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		const name = files[0]?.name.replace(/\.pdf$/i, '') ?? 'merged';
		downloadPdf(resultBytes, `${name}_merged.pdf`);
	}
</script>

<svelte:head>
	<title>Merge PDF — LocalConvert</title>
	<meta name="description" content="Combine multiple PDF files into one. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/merge/" />
</svelte:head>

<div class="pdf-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">{m['tools_common.back_pdf']()}</a>
	<div class="pdf-header">
		<GitMergeIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">{m['tool_pages.merge.title']()}</h1>
			<p class="text-sm text-muted">{m['tool_pages.merge.desc']()}</p>
		</div>
	</div>

	<PdfUploader bind:files label={m['tools_common.upload_pdfs']()} />

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
					<span class="flex-1 text-sm truncate">{f.name}</span>
					<span class="text-xs text-muted">{formatFileSize(f.size)}</span>
					<button onclick={() => removeFile(i)} class="icon-btn"><XIcon size={14} /></button>
				</li>
			{/each}
		</ul>

		<button class="btn highlight" disabled={processing} onclick={merge}>
			{processing ? m['tool_pages.merge.btn_busy']() : m['tool_pages.merge.btn']()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{m['tools_common.ready']()} {m['tools_common.output']()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{m['tool_pages.merge.save']()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
	.pdf-header { @apply flex items-center gap-3; }
	.file-list { @apply flex flex-col gap-2; }
	.file-row { @apply flex items-center gap-3 px-4 py-3 rounded-xl bg-panel shadow-panel; }
	.icon-btn { @apply w-6 h-6 rounded-full flex items-center justify-center text-muted hover:bg-separator transition-colors; }
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
</style>
