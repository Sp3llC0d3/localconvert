<script lang="ts">
	import Panel from "$lib/components/visual/Panel.svelte";
	import { MessageCircleQuestionIcon } from "lucide-svelte";
	import { about_why_title, about_why_description } from "$lib/paraglide/messages/_barrel.js";
	import { sanitize } from "$lib/util/sanitize";
</script>

<Panel class="flex flex-col gap-3 p-6">
	<h2 class="text-2xl font-bold flex items-center">
		<div
			class="rounded-full bg-accent p-2 inline-block mr-3 w-10 h-10 text-on-accent"
		>
			<MessageCircleQuestionIcon />
		</div>
		{about_why_title()}
	</h2>
	<p class="text-lg font-normal">
		{@html sanitize(about_why_description())}
	</p>
</Panel>
