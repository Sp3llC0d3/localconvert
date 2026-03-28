<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { imagesToPdf } from '$lib/pdf/images-to-pdf';
	import { downloadPdf, formatFileSize } from '$lib/pdf/utils';
	import { ImageIcon, XIcon, GripVerticalIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	let dragIndex = $state<number | null>(null);

	// Generate object URL previews — computed fresh whenever files changes,
	// cleanup previous set via $effect return value
	const previews = $derived(files.map(f => URL.createObjectURL(f)));

	$effect(() => {
		const urls = previews;
		return () => urls.forEach(u => URL.revokeObjectURL(u));
	});

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

	async function convert() {
		if (files.length === 0) { error = m['tool_pages.images_to_pdf.err_min'](); return; }
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await imagesToPdf(files);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tool_pages.images_to_pdf.err_fail']();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, 'images.pdf');
	}
</script>

<svelte:head>
	<title>Images to PDF — LocalConvert</title>
	<meta name="description" content="Convert JPG, PNG, or WEBP images into a single PDF file. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/images-to-pdf/" />
</svelte:head>

<div class="pdf-page">
	<ToolPageHeader
		category="pdf"
		title={m['tool_pages.images_to_pdf.title']()}
		description={m['tool_pages.images_to_pdf.desc']()}
		icon={ImageIcon}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<PdfUploader
		bind:files
		accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
		label={m['tools_common.upload_images_pdf']()}
	/>

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
					{#if previews[i]}
						<img src={previews[i]} alt={f.name} class="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
					{/if}
					<span class="flex-1 text-sm truncate">{f.name}</span>
					<span class="text-xs text-muted">{formatFileSize(f.size)}</span>
					<button onclick={() => removeFile(i)} class="icon-btn"><XIcon size={14} /></button>
				</li>
			{/each}
		</ul>

		<button class="btn highlight" disabled={processing} onclick={convert}>
			{processing ? m['tool_pages.images_to_pdf.btn_busy']() : m['tool_pages.images_to_pdf.btn']()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{m['tools_common.ready']()} {m['tools_common.output']()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{m['tool_pages.images_to_pdf.save']()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
.file-list { @apply flex flex-col gap-2; }
	.file-row { @apply flex items-center gap-3 px-4 py-3 rounded-xl bg-panel shadow-panel; }
	.icon-btn { @apply w-6 h-6 rounded-full flex items-center justify-center text-muted hover:bg-separator transition-colors; }
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
</style>
