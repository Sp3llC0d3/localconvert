<script lang="ts">
	import ImageUploader from '$lib/components/image/ImageUploader.svelte';
	import { generateMeme } from '$lib/image/meme';
	import { downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { SmileIcon } from 'lucide-svelte';

	let files = $state<File[]>([]);
	let topText = $state('');
	let bottomText = $state('');
	let processing = $state(false);
	let error = $state('');
	let resultBlob = $state<Blob | null>(null);
	let previewUrl = $state('');

	$effect(() => {
		if (files.length > 0) {
			const url = URL.createObjectURL(files[0]);
			previewUrl = url;
			resultBlob = null;
			return () => URL.revokeObjectURL(url);
		} else {
			previewUrl = '';
		}
	});

	async function apply() {
		if (files.length === 0) { error = 'Add an image.'; return; }
		if (!topText.trim() && !bottomText.trim()) { error = 'Enter at least one line of text.'; return; }
		error = '';
		processing = true;
		resultBlob = null;
		try {
			resultBlob = await generateMeme(files[0], { topText, bottomText });
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed.';
		}
		processing = false;
	}

	function download() {
		if (!resultBlob) return;
		downloadBlob(resultBlob, getOutputName(files[0].name, 'meme', 'png'));
	}
</script>

<svelte:head>
	<title>Meme Generator — LocalConvert</title>
	<meta name="description" content="Create memes with custom top and bottom text. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/image-tools/meme/" />
</svelte:head>

<div class="tool-page">
	<a href="/image-tools/" class="text-sm text-muted hover:underline">← Image Tools</a>
	<div class="tool-header">
		<SmileIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Meme Generator</h1>
			<p class="text-sm text-muted">Add top and bottom text to any image.</p>
		</div>
	</div>

	<ImageUploader bind:files label="Drop an image here" />

	{#if previewUrl}
		<img src={previewUrl} alt="Preview" class="preview-img" />
	{/if}

	{#if files.length > 0}
		<div class="opt-section">
			<div class="opt-row">
				<label class="opt-label" for="meme-top">Top text</label>
				<input id="meme-top" type="text" bind:value={topText} placeholder="TOP TEXT" class="opt-input flex-1" maxlength={100} />
			</div>
			<div class="opt-row">
				<label class="opt-label" for="meme-bottom">Bottom text</label>
				<input id="meme-bottom" type="text" bind:value={bottomText} placeholder="BOTTOM TEXT" class="opt-input flex-1" maxlength={100} />
			</div>
		</div>

		<button class="btn highlight" disabled={processing} onclick={apply}>
			{processing ? 'Generating…' : 'Generate meme'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBlob}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! Output: <b>{formatFileSize(resultBlob.size)}</b></p>
			<button class="btn" onclick={download}>Save meme</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style lang="postcss">
	.tool-page { @apply max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6; }
	.tool-header { @apply flex items-center gap-3; }
	.opt-section { @apply flex flex-col gap-4 p-4 rounded-2xl bg-panel shadow-panel; }
	.opt-row { @apply flex items-center gap-4 flex-wrap; }
	.opt-label { @apply text-sm font-semibold w-20 flex-shrink-0; }
	.opt-input { @apply rounded-lg px-3 py-1.5 text-sm border; background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg); border-color: var(--bg-separator); }
	.opt-input:focus { outline: 1.5px solid var(--accent); }
	.result-box { @apply flex flex-col gap-3 p-4 rounded-2xl bg-panel shadow-panel; }
	.preview-img { @apply max-h-64 rounded-xl object-contain mx-auto; }
</style>
