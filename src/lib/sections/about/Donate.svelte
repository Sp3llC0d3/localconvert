<script lang="ts">
	import Panel from "$lib/components/visual/Panel.svelte";
	import { HeartIcon } from "lucide-svelte";
	import { m } from "$lib/paraglide/messages";
</script>

<Panel>
	<div class="flex flex-col items-center gap-4 py-8">
		<HeartIcon size={32} class="text-muted" />
		<h3 class="text-lg font-semibold">{m["about.donate.title"]()}</h3>
		<p class="text-sm text-muted text-center max-w-md">
			Donations are not available yet. Thank you for your support!
		</p>
	</div>
</Panel>
