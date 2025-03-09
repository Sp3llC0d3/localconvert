<script lang="ts">
	import { effects, files, isMobile } from "$lib/store/index.svelte";
	import { FolderArchiveIcon, RefreshCw, Trash2Icon } from "lucide-svelte";
	import Panel from "../visual/Panel.svelte";
	import Dropdown from "./Dropdown.svelte";
	import Tooltip from "../visual/Tooltip.svelte";
</script>

<Panel
	class="w-full h-auto flex items-center justify-between flex-col md:flex-row gap-4"
>
	<div class="flex items-center flex-col md:flex-row gap-2.5 max-md:w-full">
		<button
			onclick={() => files.convertAll()}
			class="btn {$effects
				? ''
				: '!scale-100'} highlight flex gap-3 max-md:w-full"
			disabled={!files.ready}
		>
			<RefreshCw size="24" />
			<p>Convert all</p>
		</button>
		<button
			class="btn {$effects ? '' : '!scale-100'} flex gap-3 max-md:w-full"
			disabled={!files.ready || !files.results}
			onclick={() => files.downloadAll()}
		>
			<FolderArchiveIcon size="24" />
			<p>Download all as .zip</p>
		</button>
		{#if $isMobile}
			<button
				class="btn p-4 {$effects
					? ''
					: '!scale-100'} flex gap-3 max-md:w-full"
				disabled={files.files.length === 0}
				onclick={() => (files.files = [])}
			>
				<Trash2Icon size="24" />
				<p>Remove all files</p>
			</button>
		{:else}
			<Tooltip text="Remove all files" position="right">
				<button
					class="btn p-4 {$effects
						? ''
						: '!scale-100'} flex gap-3 max-md:w-full"
					disabled={files.files.length === 0}
					onclick={() => (files.files = [])}
				>
					<Trash2Icon size="24" />
				</button>
			</Tooltip>
		{/if}
	</div>
	<div class="w-full bg-separator h-0.5 flex md:hidden"></div>
	<div class="flex items-center gap-2">
		<p class="whitespace-nowrap text-xl">Set all to</p>
		{#if files.requiredConverters.length === 1}
			<!-- cannot convert to svg or heif -->
			{@const supported =
				files.files[0]?.converter?.supportedFormats?.filter(
					(format) => format !== ".svg" && format !== ".heif",
				)}
			<Dropdown
				onselect={(r) =>
					files.files.forEach((f) => {
						f.to = r;
						f.result = null;
					})}
				options={supported || []}
			/>
		{:else}
			<Dropdown options={["N/A"]} disabled />
		{/if}
	</div>
</Panel>
