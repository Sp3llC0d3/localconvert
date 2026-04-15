<script lang="ts">
	import { validateImageSize } from '$lib/image/utils';
	import { upload_uploader_browse } from "$lib/paraglide/messages/_barrel.js";
	import { dropping } from '$lib/store/index.svelte';

	type Props = {
		files: File[];
		multiple?: boolean;
		label?: string;
		class?: string;
	};

	let {
		files = $bindable([]),
		multiple = false,
		label = 'Drop an image here or click to select',
		class: classList = '',
	}: Props = $props();

	let input = $state<HTMLInputElement>();
	let dragging = $state(false);
	let warnings = $state<string[]>([]);

	function processFiles(raw: FileList | null) {
		if (!raw) return;
		const arr = Array.from(raw).filter((f) => f.type.startsWith('image/'));
		if (arr.length === 0) return;
		const newWarnings: string[] = [];
		const valid: File[] = [];
		for (const f of arr) {
			const { ok, warning } = validateImageSize(f);
			if (!ok) { newWarnings.push(`${f.name}: ${warning}`); continue; }
			if (warning) newWarnings.push(`${f.name}: ${warning}`);
			valid.push(f);
		}
		warnings = newWarnings;
		if (valid.length === 0) return;
		if (multiple) {
			files = [...files, ...valid];
		} else {
			files = valid.slice(0, 1);
		}
		if (input) input.value = '';
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragging = false;
		dropping.set(false);
		processFiles(e.dataTransfer?.files ?? null);
	}
</script>

<input
	bind:this={input}
	type="file"
	accept="image/*"
	{multiple}
	class="hidden"
	onchange={(e) => processFiles((e.target as HTMLInputElement).files)}
/>

<button
	type="button"
	class="img-drop-zone {classList} {dragging ? 'dragging' : ''}"
	onclick={() => input?.click()}
	ondragover={(e) => { e.preventDefault(); dragging = true; }}
	ondragleave={() => dragging = false}
	ondrop={onDrop}
>
	<svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
		<path d="M12 16V8m0 0-3 3m3-3 3 3M20 16.5A3.5 3.5 0 0 0 16.5 13H15a5 5 0 1 0-9.9 1"/>
	</svg>
	<p class="drop-label">{label}</p>
	<p class="drop-sub">{upload_uploader_browse()}</p>
</button>

{#if warnings.length > 0}
	<div class="warn-list">
		{#each warnings as w}
			<p class="warn-text">{w}</p>
		{/each}
	</div>
{/if}

<style lang="postcss">
	.img-drop-zone {
		@apply w-full flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-10 px-6 cursor-pointer transition-colors;
		border-color: var(--bg-separator);
		background: var(--bg-panel);
	}

	.img-drop-zone:hover,
	.img-drop-zone.dragging {
		border-color: var(--accent);
		background: var(--bg-panel-alt, var(--bg-panel));
	}

	.drop-icon {
		@apply w-10 h-10;
		color: var(--fg-muted);
	}

	.drop-label {
		@apply text-sm font-medium;
	}

	.drop-sub {
		@apply text-xs;
		color: var(--fg-muted);
	}

	.warn-list {
		@apply mt-2 flex flex-col gap-1;
	}

	.warn-text {
		@apply text-xs;
		color: hsl(35, 90%, 45%);
	}
</style>
