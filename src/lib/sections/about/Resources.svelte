<script lang="ts">
	import Panel from "$lib/components/visual/Panel.svelte";
	import { GithubIcon, LinkIcon, MessageCircleMoreIcon } from "lucide-svelte";
</script>

<Panel class="flex flex-col gap-4 p-6">
	<h2 class="text-2xl font-bold flex items-center">
		<div
			class="rounded-full bg-violet-400 p-2 inline-block mr-3 w-10 h-10"
		>
			<LinkIcon />
		</div>
		Resources
	</h2>
	<div class="flex gap-3">
		<a
			href="https://discord.gg/kqevGxYPak"
			target="_blank"
			rel="noopener noreferrer"
			class="btn flex-1 gap-2 p-4 rounded-full bg-button text-black dynadark:text-white flex items-center justify-center"
		>
			<MessageCircleMoreIcon size="24" class="inline-block mr-2" />
			Discord server
		</a>
		<a
			href="https://github.com/not-nullptr/VERT"
			target="_blank"
			rel="noopener noreferrer"
			class="btn flex-1 gap-2 p-4 rounded-full bg-button text-black dynadark:text-white flex items-center justify-center"
		>
			<GithubIcon size="24" class="inline-block mr-2" />
			Source code
		</a>
	</div>
</Panel>
