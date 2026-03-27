<script lang="ts">
	import Panel from "$lib/components/visual/Panel.svelte";
	import { HeartIcon } from "lucide-svelte";
	import { m } from "$lib/paraglide/messages";
	import { sanitize } from "$lib/store/index.svelte";
	import { GITHUB_URL_VERT } from "$lib/util/consts";
</script>

<Panel class="flex flex-col gap-3 p-6">
	<h2 class="text-2xl font-bold flex items-center">
		<div
			class="rounded-full bg-accent p-2 inline-block mr-3 w-10 h-10 text-on-accent"
		>
			<HeartIcon />
		</div>
		{m["about.credits.title"]()}
	</h2>

	<div class="flex flex-col gap-4 text-lg font-normal">
		<div>
			<b>{m["about.credits.libraries"]()}</b>
			<p>
				{@html sanitize(m["about.credits.libraries_description"]())}
			</p>
		</div>

		<div>
			<b>Based on VERT.sh</b>
			<p>
				LocalConvert is built on top of <a href={GITHUB_URL_VERT} target="_blank" rel="noopener noreferrer" class="underline">VERT.sh</a>,
				an open-source file converter licensed under AGPL-3.0. We're grateful to the VERT team for building the foundation that makes this possible.
			</p>
		</div>
	</div>
</Panel>
