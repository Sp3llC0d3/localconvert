<script lang="ts">
	type Props = {
		src: string;
		pageNum: number;
		selected?: boolean;
		onclick?: () => void;
		label?: string;
	};

	const { src, pageNum, selected = false, onclick, label }: Props = $props();
</script>

<button
	type="button"
	class="thumb-btn {selected ? 'selected' : ''}"
	{onclick}
>
	<img {src} alt="Page {pageNum}" class="thumb-img" />
	<span class="thumb-label">{label ?? `Page ${pageNum}`}</span>
</button>

<style lang="postcss">
	.thumb-btn {
		@apply flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-colors cursor-pointer;
		border-color: var(--bg-separator);
		background: var(--bg-panel);
	}

	.thumb-btn:hover {
		border-color: var(--accent);
	}

	.thumb-btn.selected {
		border-color: var(--accent);
		background: var(--bg-badge);
	}

	.thumb-img {
		@apply rounded-lg w-full object-contain shadow-sm;
		max-height: 160px;
	}

	.thumb-label {
		@apply text-xs font-medium;
		color: var(--fg-muted);
	}
</style>
