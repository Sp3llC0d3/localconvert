<script lang="ts">
	import Navbar from "./Base.svelte";
</script>

<div class="md:hidden mb-[6rem]">
	<!-- Spacer so footer content isn't hidden behind the fixed navbar -->
</div>
<div class="fixed md:hidden bottom-0 left-0 w-screen px-3 pb-3 justify-center z-100">
	<div class="flex flex-col justify-center items-center">
		<Navbar />
	</div>
</div>
