<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { pdfToImages } from '$lib/pdf/pdf-to-images';
	import { downloadBlob, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { FileDownIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';

	let files = $state<File[]>([]);
	let format = $state<'image/jpeg' | 'image/png'>('image/jpeg');
	let quality = $state(92);
	let scale = $state(2);
	let processing = $state(false);
	let progress = $state(0);
	let total = $state(0);
	let error = $state('');
	let done = $state(false);

	async function convert() {
		if (!browser || files.length === 0) return;
		error = '';
		processing = true;
		done = false;
		progress = 0;
		total = 0;
		try {
			const results = await pdfToImages(
				files[0],
				format,
				quality / 100,
				scale,
				(p, t) => { progress = p; total = t; }
			);
			// zip if multiple pages
			if (results.length === 1) {
				const ext = format === 'image/png' ? 'png' : 'jpg';
				downloadBlob(results[0].blob, getOutputName(files[0].name, '', ext));
			} else {
				const { createZip } = await import('$lib/util/zip');
				const fileObjs = results.map(r => new File([r.blob], r.filename));
				const zip = await createZip(fileObjs);
				downloadBlob(new Blob([zip], { type: 'application/zip' }), getOutputName(files[0].name, 'images', 'zip'));
			}
			done = true;
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tool_pages.pdf_to_images.err_fail']();
		}
		processing = false;
	}
</script>

<svelte:head>
	<title>PDF to Images — LocalConvert</title>
	<meta name="description" content="Export each PDF page as a JPG or PNG image. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/pdf-to-images/" />
</svelte:head>

<div class="pdf-page">
	<ToolPageHeader
		category="pdf"
		title={m['tool_pages.pdf_to_images.title']()}
		description={m['tool_pages.pdf_to_images.desc']()}
		icon={FileDownIcon}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<PdfUploader bind:files multiple={false} label={m['tools_common.upload_pdf']()} />

	{#if files.length > 0}
		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">{m['tools_common.format']()}</span>
				<div class="flex gap-2">
					<button class="btn text-sm px-3 py-1.5 {format === 'image/jpeg' ? 'highlight' : ''}" onclick={() => format = 'image/jpeg'}>JPG</button>
					<button class="btn text-sm px-3 py-1.5 {format === 'image/png' ? 'highlight' : ''}" onclick={() => format = 'image/png'}>PNG</button>
				</div>
			</div>
			{#if format === 'image/jpeg'}
				<div class="opt-row">
					<span class="opt-label">{m['tools_common.quality']()}</span>
					<input type="range" min={10} max={100} bind:value={quality} class="quality-slider flex-1" />
					<span class="text-sm text-muted w-10">{quality}%</span>
				</div>
			{/if}
			<div class="opt-row">
				<span class="opt-label">{m['tool_pages.pdf_to_images.resolution']()}</span>
				<div class="flex gap-2">
					{#each [[1, '1×'], [1.5, '1.5×'], [2, '2×'], [3, '3×']] as [val, label]}
						<button class="btn text-sm px-3 py-1.5 {scale === val ? 'highlight' : ''}" onclick={() => scale = val as number}>{label}</button>
					{/each}
				</div>
			</div>
		</div>

		{#if processing}
			<div class="flex flex-col gap-2">
				<p class="text-sm text-muted">{m['tool_pages.pdf_to_images.btn_busy']({ progress, total })}</p>
				<div class="h-1.5 rounded-full bg-separator overflow-hidden">
					<div class="h-full bg-accent transition-all" style="width: {total > 0 ? (progress/total*100) : 0}%"></div>
				</div>
			</div>
		{/if}

		<button class="btn highlight" disabled={processing} onclick={convert}>
			{processing ? m['tool_pages.pdf_to_images.btn_busy']({ progress, total }) : m['tool_pages.pdf_to_images.btn']()}
		</button>

		{#if done}
			<p class="text-sm font-medium text-accent">✓ {m['tools_common.ready']()}</p>
		{/if}
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}
	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style lang="postcss">
	.pdf-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
.opt-section { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
	.opt-row { @apply flex items-center gap-4 flex-wrap; }
	.opt-label { @apply text-sm font-semibold w-20 flex-shrink-0; }
	.quality-slider { @apply h-1.5 appearance-none rounded-full cursor-pointer; background: var(--bg-separator); accent-color: var(--accent); }
</style>
