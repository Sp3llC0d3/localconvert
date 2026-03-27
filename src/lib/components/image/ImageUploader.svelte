<script lang="ts">
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

	function processFiles(raw: FileList | null) {
		if (!raw) return;
		const arr = Array.from(raw).filter((f) => f.type.startsWith('image/'));
		if (arr.length === 0) return;
		if (multiple) {
			files = [...files, ...arr];
		} else {
			files = arr.slice(0, 1);
		}
		if (input) input.value = '';
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
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
	<p class="drop-sub">or click to browse</p>
</button>

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
</style>
