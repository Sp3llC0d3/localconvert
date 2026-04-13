<script lang="ts">
	import Navbar from "./Base.svelte";
</script>

<div class="hidden md:flex p-6 w-screen justify-center sticky top-0 z-[60] nav-sticky">
	<Navbar />
</div>

<style>
	.nav-sticky {
		background: var(--bg);
	}
</style>
