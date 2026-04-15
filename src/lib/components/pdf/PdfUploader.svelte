<script lang="ts">
	import { validateFileSize } from '$lib/pdf/utils';
	import { upload_uploader_browse } from "$lib/paraglide/messages/_barrel.js";
	import { dropping } from '$lib/store/index.svelte';

	type Props = {
		files: File[];
		multiple?: boolean;
		accept?: string;
		label?: string;
		class?: string;
	};

	let {
		files = $bindable([]),
		multiple = true,
		accept = '.pdf',
		label = 'Drop PDF files here or click to select',
		class: classList = '',
	}: Props = $props();

	let input = $state<HTMLInputElement>();
	let dragging = $state(false);
	let warnings = $state<string[]>([]);

	function processFiles(raw: FileList | null) {
		if (!raw) return;
		const arr = Array.from(raw);
		const newWarnings: string[] = [];
		const valid: File[] = [];
		for (const f of arr) {
			const { ok, warning } = validateFileSize(f);
			if (!ok) { newWarnings.push(`${f.name}: ${warning}`); continue; }
			if (warning) newWarnings.push(`${f.name}: ${warning}`);
			valid.push(f);
		}
		warnings = newWarnings;
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
	{accept}
	{multiple}
	class="hidden"
	onchange={(e) => processFiles((e.target as HTMLInputElement).files)}
/>

<button
	type="button"
	class="pdf-drop-zone {classList} {dragging ? 'dragging' : ''}"
	onclick={() => input?.click()}
	ondragover={(e) => { e.preventDefault(); dragging = true; }}
	ondragleave={() => dragging = false}
	ondrop={onDrop}
>
	<svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
		<path d="M12 2C14 3 18 5 20 6v8c0 3-2.5 6-8 8-5.5-2-8-5-8-8V6c2-1 6-3 8-4Z" opacity="0.12" fill="currentColor" />
		<path d="M12 2C14 3 18 5 20 6v8c0 3-2.5 6-8 8-5.5-2-8-5-8-8V6c2-1 6-3 8-4Z" />
		<line x1="8" y1="10" x2="15" y2="10" />
		<polyline points="13,8 15,10 13,12" />
		<line x1="16" y1="14" x2="9" y2="14" />
		<polyline points="11,12 9,14 11,16" />
	</svg>
	<p class="drop-label">{label}</p>
	<p class="drop-sub">{upload_uploader_browse()}</p>
</button>

{#if warnings.length > 0}
	<div class="mt-2 flex flex-col gap-1">
		{#each warnings as w}
			<p class="text-xs text-yellow-500">{w}</p>
		{/each}
	</div>
{/if}

<style lang="postcss">
	.pdf-drop-zone {
		@apply w-full flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-10 px-6 cursor-pointer transition-colors;
		border-color: var(--bg-separator);
		background: var(--bg-panel);
	}

	.pdf-drop-zone:hover,
	.pdf-drop-zone.dragging {
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
</style>
