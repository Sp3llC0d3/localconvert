<script lang="ts">
	import { validateImageSize } from '$lib/image/utils';
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
		multiple = false,
		accept = 'image/*',
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
	{accept}
	{multiple}
	class="hidden"
	onchange={(e) => processFiles((e.target as HTMLInputElement).files)}
/>

<button
	type="button"
	class="idz {classList}"
	class:idz--active={dragging}
	onclick={() => input?.click()}
	ondragover={(e) => { e.preventDefault(); dragging = true; }}
	ondragleave={() => dragging = false}
	ondrop={onDrop}
>
	<div class="idz-icon-ring">
		<svg class="idz-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
			<path d="M12 2C14 3 18 5 20 6v8c0 3-2.5 6-8 8-5.5-2-8-5-8-8V6c2-1 6-3 8-4Z" opacity="0.1" fill="currentColor" />
			<path d="M12 2C14 3 18 5 20 6v8c0 3-2.5 6-8 8-5.5-2-8-5-8-8V6c2-1 6-3 8-4Z" />
			<line x1="8" y1="10" x2="15" y2="10" />
			<polyline points="13,8 15,10 13,12" />
			<line x1="16" y1="14" x2="9" y2="14" />
			<polyline points="11,12 9,14 11,16" />
		</svg>
	</div>
	<p class="idz-label">{label}</p>
	<p class="idz-sub">{upload_uploader_browse()}</p>
</button>

{#if warnings.length > 0}
	<div class="idz-warnings">
		{#each warnings as w}
			<p class="idz-warn">{w}</p>
		{/each}
	</div>
{/if}

<style lang="postcss">
	/* ── Base ── */
	.idz {
		@apply w-full flex flex-col items-center justify-center cursor-pointer;
		border: 2px dashed var(--bg-separator);
		border-radius: 1.25rem;
		background: var(--bg-panel);
		box-shadow: var(--shadow-panel);
		padding: 2.5rem 2rem;
		gap: 1.25rem;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}

	/* ── Hover ── */
	.idz:hover {
		border-color: var(--accent);
		box-shadow: var(--shadow-panel), 0 0 0 1px color-mix(in srgb, var(--accent) 15%, transparent);
	}

	.idz:hover .idz-icon-ring {
		border-color: color-mix(in srgb, var(--accent) 30%, transparent);
		background: color-mix(in srgb, var(--accent) 6%, transparent);
	}

	.idz:hover .idz-icon {
		color: var(--accent);
	}

	/* ── Active drag ── */
	.idz--active {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 4%, var(--bg-panel));
		box-shadow: var(--shadow-panel), 0 0 0 3px color-mix(in srgb, var(--accent) 10%, transparent);
	}

	.idz--active .idz-icon-ring {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 12%, transparent);
	}

	.idz--active .idz-icon {
		color: var(--accent);
	}

	/* ── Icon ring ── */
	.idz-icon-ring {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 1rem;
		border: 1.5px solid var(--bg-separator);
		background: transparent;
		transition: border-color 0.2s ease, background 0.2s ease;
	}

	.idz-icon {
		width: 1.75rem;
		height: 1.75rem;
		color: var(--fg-muted);
		transition: color 0.2s ease;
		flex-shrink: 0;
	}

	/* ── Text ── */
	.idz-label {
		@apply text-sm font-medium;
		color: var(--fg);
	}

	.idz-sub {
		@apply text-xs;
		color: var(--fg-muted);
	}

	/* ── Warnings ── */
	.idz-warnings {
		@apply mt-2 flex flex-col gap-1;
	}

	.idz-warn {
		@apply text-xs;
		color: hsl(35, 85%, 50%);
	}
</style>
