<script lang="ts">
	import Panel from "$lib/components/visual/Panel.svelte";
	import { MoonIcon, RefreshCwIcon, SunIcon } from "lucide-svelte";

	let value = $state("");
</script>

<Panel class="flex flex-col gap-8 p-6">
	<div class="flex flex-col gap-3">
		<h2 class="text-2xl font-bold">
			<RefreshCwIcon
				size="40"
				class="inline-block -mt-1 mr-2 bg-violet-400 p-2 rounded-full"
				color="black"
			/>
			Appearance
		</h2>
		<div class="flex flex-col gap-8">
			<div class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<p class="text-base font-bold">Brightness theme</p>
					<p class="text-sm opacity-60 font-normal italic">
						Want a sunny flash-bang, or a quiet lonely night?
					</p>
				</div>
				<div class="flex flex-col gap-3 w-full">
					<div class="flex gap-3 w-full">
						<button
							class="btn flex-1 p-4 rounded-lg bg-violet-400 text-black flex items-center justify-center"
						>
							<SunIcon
								size="24"
								class="inline-block mr-2"
							/>
							Light
						</button>

						<button
							class="btn flex-1 p-4 rounded-lg bg-button text-black dynadark:text-white flex items-center justify-center"
						>
							<MoonIcon
								size="24"
								class="inline-block mr-2"
							/>
							Dark
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</Panel>
