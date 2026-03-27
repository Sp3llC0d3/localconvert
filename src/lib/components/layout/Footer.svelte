<script lang="ts">
	import { GITHUB_URL } from "$lib/util/consts";
	import { m } from "$lib/paraglide/messages";

	const year = new Date().getFullYear();
</script>

<footer
	class="w-full h-14 border-t border-separator static md:fixed md:bottom-0"
>
	<div
		class="w-full h-full flex items-center justify-center text-muted gap-3 relative"
	>
		<p>{m["footer.copyright"]({ year })}</p>
		<p>&bull;</p>
		<a
			class="hover:underline font-normal"
			href={GITHUB_URL}
			target="_blank"
		>
			{m["footer.source_code"]()}
		</a>
		<p>&bull;</p>
		<a
			class="hover:underline font-normal"
			href="/privacy/"
		>
			{m["footer.privacy_policy"]()}
		</a>
	</div>

	<div
		class="absolute bottom-0 left-0 w-full h-24 -z-10 pointer-events-none"
		style="background: linear-gradient(to bottom, transparent, var(--bg) 100%)"
	></div>
</footer>
