<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { browser } from '$app/environment';
	import { videoToGif } from '$lib/converters/video-to-gif';
	import { downloadBlob, formatFileSize, getOutputName } from '$lib/image/utils';
	import { dropping } from '$lib/store/index.svelte';
	import { FilmIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';

	let files = $state<File[]>([]);
	let fileInput = $state<HTMLInputElement>();
	let fps = $state(10);
	let width = $state(0);
	let startTime = $state(0);
	let duration = $state(0);
	let processing = $state(false);
	let progress = $state(0);
	let error = $state('');
	let resultBlob = $state<Blob | null>(null);
	let previewUrl = $state('');

	$effect(() => {
		void files; // track files for cleanup
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	});

	$effect(() => {
		if (files.length === 0) return;
		// Reset state on new file
		resultBlob = null;
		previewUrl = '';
		error = '';
	});

	function onFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files?.[0]) files = [input.files[0]];
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dropping.set(false);
		const f = e.dataTransfer?.files;
		if (f?.[0] && f[0].type.startsWith('video/')) files = [f[0]];
	}

	async function convert() {
		if (!browser || files.length === 0) return;
		error = '';
		processing = true;
		progress = 0;
		resultBlob = null;
		try {
			resultBlob = await videoToGif(files[0], { fps, width: width || undefined, startTime, duration: duration || undefined }, (pct) => { progress = pct; });
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			previewUrl = URL.createObjectURL(resultBlob);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tools_common.failed']();
		}
		processing = false;
	}

	function download() {
		if (!resultBlob) return;
		downloadBlob(resultBlob, getOutputName(files[0].name, '', 'gif'));
	}
</script>

<svelte:head>
	<title>Video to GIF — LocalConvert</title>
	<meta name="description" content="Convert any video to animated GIF. Adjust FPS, size, and duration. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/image-tools/video-to-gif/" />
	<meta property="og:title" content="Video to GIF — LocalConvert" />
	<meta property="og:description" content="Convert any video to animated GIF. Adjust FPS, size, and duration. Free, private, no uploads." />
	<meta property="og:url" content="https://localconvert.app/image-tools/video-to-gif/" />
</svelte:head>

<div class="gif-page">
	<ToolPageHeader
		category="image"
		title={m['tool_pages.video_to_gif.title']()}
		description={m['tool_pages.video_to_gif.desc']()}
		icon={FilmIcon}
		backHref="/image-tools/"
		backLabel={m['tools_common.back_image']()}
	/>

	<!-- File upload -->
	<input bind:this={fileInput} type="file" accept="video/*" class="hidden" onchange={onFileSelect} />
	<button
		class="drop-zone"
		onclick={() => fileInput?.click()}
		ondragover={(e) => e.preventDefault()}
		ondrop={onDrop}
	>
		{#if files.length > 0}
			<p class="text-sm font-medium">{files[0].name}</p>
			<p class="text-xs text-muted">{formatFileSize(files[0].size)}</p>
		{:else}
			<p class="text-sm">{m['tool_pages.video_to_gif.upload']()}</p>
			<p class="text-xs text-muted">{m['upload.uploader.browse']()}</p>
		{/if}
	</button>

	{#if files.length > 0}
		<div class="opt-section">
			<div class="opt-row">
				<span class="opt-label">FPS</span>
				<div class="flex gap-2">
					{#each [5, 10, 15, 20] as f}
						<button class="btn text-sm px-3 py-1.5 {fps === f ? 'highlight' : ''}" onclick={() => fps = f}>{f}</button>
					{/each}
				</div>
			</div>
			<div class="opt-row">
				<span class="opt-label">{m['tool_pages.video_to_gif.width']()}</span>
				<div class="flex gap-2">
					{#each [{ label: 'Original', value: 0 }, { label: '480px', value: 480 }, { label: '320px', value: 320 }, { label: '240px', value: 240 }] as w}
						<button class="btn text-sm px-3 py-1.5 {width === w.value ? 'highlight' : ''}" onclick={() => width = w.value}>{w.label}</button>
					{/each}
				</div>
			</div>
			<div class="opt-row">
				<span class="opt-label">{m['tool_pages.video_to_gif.start']()}</span>
				<input type="number" min={0} step={0.5} bind:value={startTime} class="num-input" aria-label="Start time" />
				<span class="text-xs text-muted">sec</span>
			</div>
			<div class="opt-row">
				<span class="opt-label">{m['tool_pages.video_to_gif.duration']()}</span>
				<input type="number" min={0} step={0.5} bind:value={duration} class="num-input" aria-label="Duration" />
				<span class="text-xs text-muted">sec (0 = full)</span>
			</div>
		</div>

		<button class="btn highlight" disabled={processing} onclick={convert}>
			{processing ? `${m['tool_pages.video_to_gif.btn_busy']()} ${progress}%` : m['tool_pages.video_to_gif.btn']()}
		</button>

		{#if processing}
			<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--bg-separator)">
				<div class="h-full rounded-full transition-all" style="background: var(--accent); width: {progress}%"></div>
			</div>
		{/if}
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBlob && previewUrl}
		<div class="result-section">
			<img src={previewUrl} alt="GIF preview" class="gif-preview" />
			<div class="result-box">
				<p class="text-sm font-medium">{m['tools_common.ready']()} <b>{formatFileSize(resultBlob.size)}</b></p>
				<button class="btn" onclick={download}>{m['tool_pages.video_to_gif.save']()}</button>
			</div>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style>
	.gif-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.drop-zone {
		width: 100%; padding: 2.5rem 1.5rem; border-radius: 1rem; border: 2px dashed var(--bg-separator);
		display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
		cursor: pointer; background: var(--bg-panel); transition: border-color 0.15s;
	}
	.drop-zone:hover { border-color: var(--accent); }
	.opt-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.opt-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
	.opt-label { font-size: 0.8125rem; font-weight: 600; width: 4.5rem; flex-shrink: 0; }
	.num-input {
		width: 5rem; padding: 0.375rem 0.5rem; border-radius: 0.5rem; font-size: 0.875rem;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.num-input:focus { outline: 1.5px solid var(--accent); }
	.result-section { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
	.gif-preview { max-width: 100%; max-height: 20rem; border-radius: 0.75rem; box-shadow: var(--shadow-panel); }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); width: 100%; }
</style>
