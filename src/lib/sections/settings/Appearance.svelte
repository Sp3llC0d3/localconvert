<script lang="ts">
	import Panel from "$lib/components/visual/Panel.svelte";
	import { theme } from "$lib/store/index.svelte";
	import { MoonIcon, PaletteIcon, SunIcon } from "lucide-svelte";

	let lightElement: HTMLButtonElement;
	let darkElement: HTMLButtonElement;

	function setDark(dark: boolean) {
		theme.dark = dark;

		if (dark) {
			lightElement.classList.remove("bg-accent-purple");
			darkElement.classList.add("bg-accent-purple");
		} else {
			darkElement.classList.remove("bg-accent-purple");
			lightElement.classList.add("bg-accent-purple");
		}
	}

	$effect(() => {
		if (theme.dark) {
			lightElement.classList.remove("bg-accent-purple");
			darkElement.classList.add("bg-accent-purple");
		} else {
			darkElement.classList.remove("bg-accent-purple");
			lightElement.classList.add("bg-accent-purple");
		}
	});
</script>

<Panel class="flex flex-col gap-8 p-6">
	<div class="flex flex-col gap-3">
		<h2 class="text-2xl font-bold">
			<PaletteIcon
				size="40"
				class="inline-block -mt-1 mr-2 bg-accent-purple p-2 rounded-full"
				color="black"
			/>
			Appearance
		</h2>
		<div class="flex flex-col gap-8">
			<div class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<p class="text-base font-bold">Brightness theme</p>
					<p class="text-sm text-muted font-normal italic">
						Want a sunny flash-bang, or a quiet lonely night?
					</p>
				</div>
				<div class="flex flex-col gap-3 w-full">
					<div class="flex gap-3 w-full">
						<button
							bind:this={lightElement}
							onclick={() => setDark(false)}
							class="btn flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
						>
							<SunIcon size="24" class="inline-block mr-2" />
							Light
						</button>

						<button
							bind:this={darkElement}
							onclick={() => setDark(true)}
							class="btn flex-1 p-4 rounded-lg text-black flex items-center justify-center"
						>
							<MoonIcon size="24" class="inline-block mr-2" />
							Dark
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</Panel>
