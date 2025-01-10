<script lang="ts">
	import { duration, fade } from "$lib/animation";
	import ConversionPanel from "$lib/components/functional/ConversionPanel.svelte";
	import Dropdown from "$lib/components/functional/Dropdown.svelte";
	import Uploader from "$lib/components/functional/Uploader.svelte";
	import ProgressiveBlur from "$lib/components/visual/effects/ProgressiveBlur.svelte";
	import Panel from "$lib/components/visual/Panel.svelte";
	import ProgressBar from "$lib/components/visual/ProgressBar.svelte";
	import { files } from "$lib/store/index.svelte";
	import { VertFile } from "$lib/types";
	import {
		Disc2Icon,
		DownloadIcon,
		FileQuestionIcon,
		ImageIcon,
		RotateCwIcon,
		XIcon,
	} from "lucide-svelte";
	import { quintOut } from "svelte/easing";
</script>

{#snippet fileItem(file: VertFile, index: number)}
	{@const isAudio = file.converter?.name === "ffmpeg" || false}
	<Panel class="p-5 flex flex-col min-w-0 gap-4 relative">
		<div class="flex-shrink-0 h-8 w-full flex items-center gap-2">
			{#if !file.converter}
				<FileQuestionIcon size="24" class="flex-shrink-0" />
			{:else if isAudio}
				<Disc2Icon size="24" class="flex-shrink-0" />
			{:else}
				<ImageIcon size="24" class="flex-shrink-0" />
			{/if}
			<div class="flex-grow overflow-hidden">
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
		{#if !file.converter}
			<div
				class="h-full flex flex-col text-center justify-center text-red-600"
			>
				<p class="font-body font-bold">We can't convert this file.</p>
				<p class="font-normal">
					Only image and audio files are supported
				</p>
			</div>
		{:else}
			<div class="flex flex-row justify-between">
				<div
					class="flex gap-4 w-full h-[152px] overflow-hidden relative"
				>
					<div class="w-1/2 h-full overflow-hidden rounded-xl">
						<img
							class="object-cover w-full h-full"
							src={file.blobUrl}
							alt={file.name}
						/>
					</div>
				</div>
				<div
					class="absolute top-16 right-0 mr-4 pl-2 h-[calc(100%-83px)] w-[calc(50%-38px)] pr-4 pb-1 flex items-center justify-center aspect-square"
				>
					<div
						class="w-[122px] h-fit flex flex-col gap-2 items-center justify-center"
					>
						<Dropdown
							options={file.converter?.supportedFormats || []}
							bind:selected={file.to}
							onselect={() => file.result && (file.result = null)}
						/>
						<div class="w-full flex items-center justify-between">
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
			</div>
		{/if}
	</Panel>
{/snippet}

<div class="flex flex-col justify-center items-center gap-8 -mt-4 px-4 md:p-0">
	<div class="max-w-[796px] w-full">
		<ConversionPanel />
	</div>

	<div
		class="w-full max-w-[794px] grid grid-cols-1 md:grid-cols-2 auto-rows-[240px] gap-4 md:p-0"
	>
		<Uploader class="w-full h-full" />
		{#each files.files as file, i (file.id)}
			{@render fileItem(file, i)}
		{/each}
	</div>
</div>

<div
	class="fixed w-screen h-screen opacity-75 overflow-hidden top-0 left-0 -z-50 pointer-events-none grid grid-cols-1 grid-rows-1"
>
	{#if files.files.length === 1 && files.files[0].blobUrl}
		<div
			class="w-full relative"
			transition:fade={{
				duration,
				easing: quintOut,
			}}
		>
			<img
				class="object-cover w-full h-full blur-xs"
				src={files.files[0].blobUrl}
				alt={files.files[0].name}
			/>
			<div class="absolute bottom-0 left-0 w-full h-full">
				<ProgressiveBlur
					direction="bottom"
					endIntensity={256}
					iterations={8}
					fadeTo="var(--bg)"
				/>
			</div>
		</div>
	{/if}
</div>
