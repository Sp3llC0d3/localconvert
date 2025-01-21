<script lang="ts">
	import Panel from "$lib/components/visual/Panel.svelte";
	import { setMotion, setTheme } from "$lib/store/index.svelte";
	import {
		MoonIcon,
		PaletteIcon,
		PauseIcon,
		PlayIcon,
		SunIcon,
	} from "lucide-svelte";
	import { onMount } from "svelte";

	let lightElement: HTMLButtonElement;
	let darkElement: HTMLButtonElement;
	let enableMotionElement: HTMLButtonElement;
	let disableMotionElement: HTMLButtonElement;

	function setDark(dark: boolean) {
		document.documentElement.classList.remove("light", "dark");

		if (dark) {
			lightElement.classList.remove("selected");
			darkElement.classList.add("selected");
			setTheme("dark");
		} else {
			darkElement.classList.remove("selected");
			lightElement.classList.add("selected");
			setTheme("light");
		}
	}

	function setAnimation(motion: boolean) {
		if (motion) {
			enableMotionElement.classList.add("selected");
			disableMotionElement.classList.remove("selected");
			setMotion(true);
		} else {
			disableMotionElement.classList.add("selected");
			enableMotionElement.classList.remove("selected");
			setMotion(false);
		}
	}

	onMount(() => {
		const updateTheme = () => {
			const list = document.documentElement.classList;
			if (list.contains("dark")) {
				lightElement.classList.remove("selected");
				darkElement.classList.add("selected");
			} else {
				darkElement.classList.remove("selected");
				lightElement.classList.add("selected");
			}
		};

		updateTheme();

		if (localStorage.getItem("motion") === "true") {
			enableMotionElement.classList.add("selected");
			disableMotionElement.classList.remove("selected");
		} else {
			disableMotionElement.classList.add("selected");
			enableMotionElement.classList.remove("selected");
		}

		// use MutationObserver to check when theme is changed (<html> class changes)
		const observer = new MutationObserver(updateTheme);

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
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
							onclick={() => setAnimation(true)}
							class="btn flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
						>
							<PlayIcon size="24" class="inline-block mr-2" />
							Enable animations
						</button>

						<button
							bind:this={disableMotionElement}
							onclick={() => setAnimation(false)}
							class="btn flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
						>
							<PauseIcon size="24" class="inline-block mr-2" />
							Disable animations
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</Panel>
