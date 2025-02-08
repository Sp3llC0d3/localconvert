<script lang="ts">
	import { browser } from "$app/environment";
	import FancyTextInput from "$lib/components/functional/FancyInput.svelte";
	import Panel from "$lib/components/visual/Panel.svelte";
	import { log } from "$lib/logger";
	import { RefreshCwIcon, SaveAllIcon } from "lucide-svelte";
	import { onMount } from "svelte";

	let filenameFormat = "VERT_%name%";

	function save() {
		log(["settings"], "Saving settings");
		if (!browser) return;
		localStorage.setItem("filenameFormat", filenameFormat);
		log(["settings"], `Saving filename format: ${filenameFormat}`);
	}

	onMount(() => {
		const format = localStorage.getItem("filenameFormat");
		if (format) filenameFormat = format;
	});
</script>

<Panel class="flex flex-col gap-8 p-6">
	<div class="flex flex-col gap-3">
		<h2 class="text-2xl font-bold">
			<RefreshCwIcon
				size="40"
				class="inline-block -mt-1 mr-2 bg-accent p-2 rounded-full"
				color="black"
			/>
			Conversion
		</h2>
		<div class="flex flex-col gap-8">
			<div class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<p class="text-base font-bold">File name format</p>
					<p class="text-sm text-muted font-normal">
						This will determine the name of the file on download, <span
							class="font-bold italic"
							>not including the file extension.</span
						>
						You can put these following templates in the format, which
						will be replaced with the relevant information:
						<span class="font-bold">%name%</span>
						for the original file name,
						<span class="font-bold">%extension%</span>
						for the original file extension, and
						<span class="font-bold">%date%</span>
						for a date string of when the file was converted.
					</p>
				</div>
				<FancyTextInput
					placeholder="VERT_%name%"
					bind:value={filenameFormat}
					extension=".ext"
					type="text"
				/>
			</div>

			<div class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<p class="text-base font-bold">Second option</p>
					<p class="text-sm text-muted font-normal">
						This is just a sample option. This should not show up on
						the live website. JOVANN, DO NOT ADD THIS TO THE LIVE
						WEBSITE. PLEASE. JOVANN!!!!
					</p>
				</div>
			</div>

			<div class="flex justify-end">
				<button
					onclick={save}
					class="w-fit btn px-6 py-4 bg-accent text-black flex items-center justify-center"
				>
					<SaveAllIcon size="24" class="inline-block mr-2" />
					Save
				</button>
			</div>
		</div>
	</div>
</Panel>
