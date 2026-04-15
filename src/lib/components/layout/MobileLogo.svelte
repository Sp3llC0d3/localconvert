<script>
	import Logo from "$lib/components/visual/svg/Logo.svelte";
	import { localizeHref } from "$lib/paraglide/runtime";
</script>

<div class="flex justify-center items-center pb-6 md:pb-0 pt-4 md:pt-0">
	<a
		class="flex items-center justify-center p-1.5 md:p-1 rounded-2xl md:rounded-xl"
		href={localizeHref("/")}
	>
		<div
			class="h-16 md:h-12 bg-accent rounded-2xl md:rounded-xl flex items-center justify-center px-5 md:px-4 text-white dynadark:text-black"
		>
			<div class="w-52 md:w-44 h-7 md:h-6">
				<Logo />
			</div>
		</div>
	</a>
</div>
