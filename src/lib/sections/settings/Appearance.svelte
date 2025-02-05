<script lang="ts">
	import Panel from "$lib/components/visual/Panel.svelte";
	import {
		theme,
		motion,
		setMotion,
		setTheme,
	} from "$lib/store/index.svelte";
	import {
		MoonIcon,
		PaletteIcon,
		PauseIcon,
		PlayIcon,
		SunIcon,
	} from "lucide-svelte";
	import { onMount, onDestroy } from "svelte";

	let lightElement: HTMLButtonElement;
	let darkElement: HTMLButtonElement;
	let enableMotionElement: HTMLButtonElement;
	let disableMotionElement: HTMLButtonElement;

	let motionUnsubscribe: () => void;
	let themeUnsubscribe: () => void;

	const updateMotionClasses = (value: boolean) => {
		if (value) {
			enableMotionElement.classList.add("selected");
			disableMotionElement.classList.remove("selected");
		} else {
			disableMotionElement.classList.add("selected");
			enableMotionElement.classList.remove("selected");
		}
	};

	const updateThemeClasses = (value: string) => {
		document.documentElement.classList.remove("light", "dark");
		document.documentElement.classList.add(value);

		if (value === "dark") {
			darkElement.classList.add("selected");
			lightElement.classList.remove("selected");
		} else {
			lightElement.classList.add("selected");
			darkElement.classList.remove("selected");
		}
	};

	onMount(() => {
		motionUnsubscribe = motion.subscribe(updateMotionClasses);
		themeUnsubscribe = theme.subscribe(updateThemeClasses);
	});

	onDestroy(() => {
		if (motionUnsubscribe) motionUnsubscribe();
		if (themeUnsubscribe) themeUnsubscribe();
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
							onclick={() => setTheme("light")}
							class="btn flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
						>
							<SunIcon size="24" class="inline-block mr-2" />
							Light
						</button>

						<button
							bind:this={darkElement}
							onclick={() => setTheme("dark")}
							class="btn flex-1 p-4 rounded-lg text-black flex items-center justify-center"
						>
							<MoonIcon size="24" class="inline-block mr-2" />
							Dark
						</button>
					</div>
				</div>
			</div>
			<div class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<p class="text-base font-bold">Motion settings</p>
					<p class="text-sm text-muted font-normal italic">
						Would you like fancy animations, or a more static
						experience?
					</p>
				</div>
				<div class="flex flex-col gap-3 w-full">
					<div class="flex gap-3 w-full">
						<button
							bind:this={enableMotionElement}
							onclick={() => setMotion(true)}
							class="btn flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
						>
							<PlayIcon size="24" class="inline-block mr-2" />
							Enable
						</button>

						<button
							bind:this={disableMotionElement}
							onclick={() => setMotion(false)}
							class="btn flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
						>
							<PauseIcon size="24" class="inline-block mr-2" />
							Disable
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</Panel>
