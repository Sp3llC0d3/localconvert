<script lang="ts">
	type Props = {
		class: string;
		items: { [name: string]: string };
	};

	const { class: classList, items }: Props = $props();

	const year = new Date().getFullYear();

	const links = $derived(Object.entries(items));
</script>

<footer class={classList}>
	<div
		class="w-full h-full flex items-center justify-center text-muted gap-3"
	>
		<p>© {year} VERT.</p>
		{#each links as [name, url] (name)}
			<!-- bullet point -->
			<p>•</p>
			<a target="_blank" class="hover:underline" href={url}>{name}</a>
		{/each}
	</div>
</footer>
