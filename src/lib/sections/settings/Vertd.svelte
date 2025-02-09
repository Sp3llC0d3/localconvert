<script lang="ts">
	import { browser } from "$app/environment";
	import FancyTextInput from "$lib/components/functional/FancyInput.svelte";
	import Panel from "$lib/components/visual/Panel.svelte";
	import { GITHUB_URL_VERTD } from "$lib/consts";
	import { RefreshCwIcon, SaveAllIcon, ServerIcon } from "lucide-svelte";
	import type { Settings } from "./index.svelte";

	const { settings }: { settings: Settings } = $props();
</script>

<Panel class="flex flex-col gap-8 p-6">
	<div class="flex flex-col gap-3">
		<h2 class="text-2xl font-bold">
			<ServerIcon
				size="40"
				class="inline-block -mt-1 mr-2 bg-accent-red p-2 rounded-full overflow-visible"
				color="black"
			/>
			<code>vertd</code>
		</h2>
		<div class="flex flex-col gap-8">
			<div class="flex flex-col gap-4">
				<p class="text-sm text-muted font-normal">
					VERT allows fully functional video conversion via the
					<code>vertd</code> project. It acts as an FFmpeg wrapper on
					a given server, allowing for GPU accelerated local* video
					conversion. We currently don't provide our own instance due
					to upkeep costs of servers with the necessary hardware for
					speedy conversion. You can host your own instance by
					downloading the binaries
					<a href={GITHUB_URL_VERTD} target="_blank">here</a>.
				</p>
				<div class="flex flex-col gap-2">
					<p class="text-base font-bold">Instance URL</p>
					<input
						type="text"
						placeholder="http://localhost:24153"
						bind:value={settings.settings.vertdURL}
					/>
				</div>
			</div>
		</div>
	</div>
</Panel>
