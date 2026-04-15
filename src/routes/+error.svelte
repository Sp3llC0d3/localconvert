<script lang="ts">
	import { page } from "$app/state";
	import error404 from "$lib/assets/errors/error-404.png";
	import errorConversion from "$lib/assets/errors/error-conversion.png";
	import { page_titles_not_found, page_titles_error } from "$lib/paraglide/messages/_barrel.js";
</script>

<svelte:head>
	<title>{page.status === 404 ? page_titles_not_found() : page_titles_error()} — LocalConvert</title>
</svelte:head>

<div class="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6 py-16">
	<img
		src={page.status === 404 ? error404 : errorConversion}
		alt=""
		class="w-44 h-44 object-contain"
	/>
	<div class="flex flex-col items-center gap-3 max-w-md">
		<h1 class="text-4xl font-display font-bold">
			{page.status === 404 ? "Page not found" : "Something went wrong"}
		</h1>
		<p class="text-muted text-lg">
			{#if page.status === 404}
				The page you're looking for doesn't exist.
			{:else}
				{page.error?.message || "An unexpected error occurred."}
			{/if}
		</p>
		<a href="/" class="btn mt-4 px-8 py-3 text-base">Go Home</a>
	</div>
</div>
