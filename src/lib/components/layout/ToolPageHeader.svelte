<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		category: 'pdf' | 'image' | 'dev';
		title: string;
		description: string;
		icon: Component<{ size?: number }>;
		backHref: string;
		backLabel: string;
	}

	const { category, title, description, icon: Icon, backHref, backLabel }: Props = $props();

	const accentMap = {
		pdf: 'var(--accent-green)',
		image: 'var(--accent-blue)',
		dev: 'var(--accent-purple)',
	};
</script>

<a href={backHref} class="text-sm text-muted hover:underline">{backLabel}</a>
<div class="tool-page-header">
	<div class="tool-page-icon" style="background: {accentMap[category]}">
		<Icon size={28} />
	</div>
	<div>
		<h1 class="text-2xl font-semibold">{title}</h1>
		<p class="text-sm text-muted">{description}</p>
	</div>
</div>

<style>
	.tool-page-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.tool-page-icon {
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--fg-on-accent);
	}
</style>
