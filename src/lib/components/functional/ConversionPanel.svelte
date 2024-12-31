<script lang="ts">
	import { files } from "$lib/store/index.svelte";
	import { FolderArchiveIcon, RefreshCw } from "lucide-svelte";
	import Panel from "../visual/Panel.svelte";
	import Dropdown from "./Dropdown.svelte";
</script>

<Panel class="w-full h-20 flex items-center justify-between">
	<div class="flex items-center gap-2.5">
		<button
			onclick={() => files.convertAll()}
			class="btn highlight flex gap-3"
			disabled={!files.ready}
		>
			<RefreshCw size="24" />
			<p>Convert all</p>
		</button>
		<button
			class="btn flex gap-3"
			disabled={!files.ready || !files.results}
			onclick={() => files.downloadAll()}
		>
			<FolderArchiveIcon size="24" />
			<p>Download all as .zip</p>
		</button>
	</div>
	<div class="flex items-center gap-2">
		{#if files.requiredConverters.length === 1}
			<p class="whitespace-nowrap">Set all to</p>
			<Dropdown
				onselect={(r) => files.files.forEach((f) => {
					f.to = r;
					f.result = null;
				})}
				options={files.files[0]?.converter?.supportedFormats || []}
			/>
		{/if}
	</div>
</Panel>
