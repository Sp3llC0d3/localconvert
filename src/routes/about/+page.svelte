<script lang="ts">
	import * as About from "$lib/sections/about";
	import { InfoIcon } from "lucide-svelte";
	import { m } from "$lib/paraglide/messages";
</script>

<div class="flex flex-col h-full items-center">
	<h1 class="text-2xl md:text-[40px] tracking-tight md:leading-[72px] leading-tight mb-4 md:mb-6">
		<InfoIcon size="40" class="inline-block -mt-2 mr-2" />
		{m["about.title"]()}
	</h1>

	<div
		class="w-full max-w-4xl flex flex-col md:flex-row gap-4 p-4 md:px-4 md:py-0"
	>
		<div class="flex flex-col gap-4 flex-1">
			<About.Why />
		</div>

		<div class="flex flex-col gap-4 flex-1">
			<About.Resources />
			<About.Credits />
		</div>
	</div>
</div>
