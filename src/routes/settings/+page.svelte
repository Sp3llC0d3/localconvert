<script lang="ts">
	import { browser } from "$app/environment";
	import { log } from "$lib/logger";
	import * as Settings from "$lib/sections/settings/index.svelte";
	import { addDialog, removeDialog } from "$lib/store/DialogProvider";
	import { addToast } from "$lib/store/ToastProvider";
	import { SettingsIcon } from "lucide-svelte";
	import { onMount } from "svelte";

	let settings = $state(Settings.Settings.instance.settings);

	let isInitial = $state(true);

	$effect(() => {
		if (!browser) return;
		if (isInitial) {
			isInitial = false;
			return;
		}
		settings;
		const savedSettings = localStorage.getItem("settings");
		if (savedSettings) {
			const parsedSettings = JSON.parse(savedSettings);
			if (parsedSettings === settings) return;
		}

		log(["settings"], "saving settings");
		try {
			Settings.Settings.instance.settings = settings;
			Settings.Settings.instance.save();
		} catch (error) {
			log(["settings", "error"], `failed to save settings: ${error}`);
			addToast("error", "Failed to save settings!");
		}
	});

	onMount(() => {
		const savedSettings = localStorage.getItem("settings");
		if (savedSettings) {
			const parsedSettings = JSON.parse(savedSettings);
			Settings.Settings.instance.settings = {
				...Settings.Settings.instance.settings,
				...parsedSettings,
			};
		}
	});
</script>

<div class="flex flex-col h-full items-center">
	<h1 class="hidden md:block text-[40px] tracking-tight leading-[72px] mb-6">
		<SettingsIcon size="40" class="inline-block -mt-2 mr-2" />
		Settings
	</h1>

	<div
		class="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 p-4 md:px-4 md:py-0"
	>
		<div class="flex flex-col gap-4 flex-1">
			<Settings.Conversion {settings} />
			<Settings.Vertd {settings} />
		</div>

		<div class="flex flex-col gap-4 flex-1">
			<Settings.Appearance />
			<button class="hidden md:block btn btn-primary" onclick={() => {
				const id = addDialog(
					"Test dialog",
					"This is a test dialog",
					[
						{
							text: "Close",
							action: () => {
								addToast("info", "Dialog closed");
							},
						},
					],
					"info"
				);

				const id2 = addDialog(
					"Test 2 dialog",
					"This is a test dialog 2",
					[
						{
							text: "meow",
							action: () => {
								addToast("info", "Dialog 2 closed");
							},
						},
					],
					"success"
				);
		
				console.log(`Dialog ID: ${id}`);
				console.log(`Dialog ID2: ${id2}`);
			}}>Test dialogs</button>
		</div>
	</div>
</div>
