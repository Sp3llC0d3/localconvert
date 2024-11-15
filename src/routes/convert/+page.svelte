<script lang="ts">
	import Dropdown from "$lib/components/functional/Dropdown.svelte";
	import Panel from "$lib/components/visual/Panel.svelte";
	import ProgressBar from "$lib/components/visual/ProgressBar.svelte";
	import { files } from "$lib/store/index.svelte";
	import { VertFile } from "$lib/types";
	import {
		Disc2Icon,
		DownloadIcon,
		ImageIcon,
		RotateCwIcon,
		XIcon,
	} from "lucide-svelte";
</script>

{#snippet fileItem(file: VertFile, index: number)}
	{@const isAudio = file.converter?.name === "ffmpeg" || false}
	<Panel class="p-5 flex flex-col min-w-0 gap-4 relative">
		<div class="flex-shrink-0 h-8 w-full flex items-center gap-2">
			{#if isAudio}
				<Disc2Icon size="24" class="flex-shrink-0" />
			{:else}
				<ImageIcon size="24" class="flex-shrink-0" />
			{/if}
			<div class="flex-grow">
				{#if file.processing}
					<ProgressBar
						min={0}
						max={100}
						progress={file.converter?.reportsProgress
							? file.progress
							: null}
					/>
				{:else}
					<h2
						class="text-xl font-body overflow-hidden text-ellipsis whitespace-nowrap"
					>
						{file.name}
					</h2>
				{/if}
			</div>
			<button
				class="flex-shrink-0 w-8 rounded-full hover:bg-panel-alt h-full flex items-center justify-center"
				onclick={() =>
					(files.files = files.files.filter((_, i) => i !== index))}
			>
				<XIcon size="24" class="text-muted" />
			</button>
		</div>
		<div class="flex gap-4 w-full h-full overflow-hidden relative">
			<div class="w-1/2 h-full overflow-hidden rounded-xl">
				<img
					class="object-cover w-full h-full"
					src={file.blobUrl}
					alt={file.name}
				/>
			</div>
		</div>
		<div
			class="absolute top-16 right-0 mr-4 pl-2 h-[calc(100%-83px)] w-[calc(50%-32px)] pr-4 pb-5"
		>
			<div
				class="w-full h-full flex flex-col gap-2 items-center justify-center"
			>
				<Dropdown
					options={file.converter?.supportedFormats || []}
					bind:selected={file.to}
				/>
				<div class="w-full flex items-center justify-around">
					<button
						class="btn p-0 w-14 h-14"
						disabled={!files.ready}
						onclick={file.convert}
					>
						<RotateCwIcon size="24" />
					</button>
					<button
						class="btn p-0 w-14 h-14"
						onclick={file.download}
						disabled={!file.result}
					>
						<DownloadIcon size="24" />
					</button>
				</div>
			</div>
		</div>
	</Panel>
{/snippet}

<div class="w-full h-full flex justify-center pt-60 pb-20">
	<div
		class="w-[794px] grid"
		style="grid-template-columns: repeat(2, 1fr); grid-auto-rows: 240px; gap: 16px"
	>
		{#each files.files as file, i (file.id)}
			{@render fileItem(file, i)}
		{/each}
	</div>
</div>
