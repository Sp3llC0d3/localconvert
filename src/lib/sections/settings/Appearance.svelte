<script lang="ts">
	import {
		theme,
		effects,
		setEffects,
		setTheme,
		availableLocales,
	} from "$lib/store/index.svelte";
	import {
		MoonIcon,
		XIcon,
		CheckIcon,
		SunIcon,
	} from "lucide-svelte";
	import { onMount, onDestroy } from "svelte";
	import { settings_appearance_brightness_theme, settings_appearance_brightness_description, settings_appearance_light, settings_appearance_dark, settings_appearance_effect_settings, settings_appearance_effect_description, settings_appearance_enable, settings_appearance_disable, settings_language_title, settings_language_description } from "$lib/paraglide/messages/_barrel.js";
	import { getLocale, setLocale } from "$lib/paraglide/runtime";
	import Dropdown from "$lib/components/functional/Dropdown.svelte";

	let currentLocale = $state("en");

	const getLanguageDisplayName = (locale: string) => {
		try {
			return availableLocales[locale as keyof typeof availableLocales];
		} catch {
			return locale.toUpperCase();
		}
	};

	const languageOptions = Object.keys(availableLocales).map((locale) =>
		getLanguageDisplayName(locale),
	);

	let lightElement: HTMLButtonElement;
	let darkElement: HTMLButtonElement;
	let enableEffectsElement: HTMLButtonElement;
	let disableEffectsElement: HTMLButtonElement;

	let effectsUnsubscribe: () => void;
	let themeUnsubscribe: () => void;

	const updateEffectsClasses = (value: boolean) => {
		if (value) {
			enableEffectsElement.classList.add("selected");
			disableEffectsElement.classList.remove("selected");
		} else {
			disableEffectsElement.classList.add("selected");
			enableEffectsElement.classList.remove("selected");
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
		effectsUnsubscribe = effects.subscribe(updateEffectsClasses);
		themeUnsubscribe = theme.subscribe(updateThemeClasses);

		currentLocale = localStorage.getItem("locale") || getLocale();
	});

	onDestroy(() => {
		if (effectsUnsubscribe) effectsUnsubscribe();
		if (themeUnsubscribe) themeUnsubscribe();
	});

	$effect(() => {
		updateEffectsClasses($effects);
		updateThemeClasses($theme);
	});

	function handleLanguageChange(selectedLanguage: string) {
		const selectedLocale = Object.keys(availableLocales).find(
			(locale) => getLanguageDisplayName(locale) === selectedLanguage,
		);

		if (selectedLocale && selectedLocale !== currentLocale) {
			currentLocale = selectedLocale;
			setLocale(selectedLocale as any);
		}
	}
</script>

<div class="flex flex-col gap-8">
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<p class="text-base font-bold">
				{settings_appearance_brightness_theme()}
			</p>
			<p class="text-sm text-muted font-normal italic">
				{settings_appearance_brightness_description()}
			</p>
		</div>
		<div class="flex gap-3 w-full">
			<button
				bind:this={lightElement}
				onclick={() => setTheme("light")}
				class="btn {$effects
					? ''
					: '!scale-100'} flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
			>
				<SunIcon size="24" class="inline-block me-2" />
				{settings_appearance_light()}
			</button>

			<button
				bind:this={darkElement}
				onclick={() => setTheme("dark")}
				class="btn {$effects
					? ''
					: '!scale-100'} flex-1 p-4 rounded-lg text-black flex items-center justify-center"
			>
				<MoonIcon size="24" class="inline-block me-2" />
				{settings_appearance_dark()}
			</button>
		</div>
	</div>

	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<p class="text-base font-bold">
				{settings_appearance_effect_settings()}
			</p>
			<p class="text-sm text-muted font-normal italic">
				{settings_appearance_effect_description()}
			</p>
		</div>
		<div class="flex gap-3 w-full">
			<button
				bind:this={enableEffectsElement}
				onclick={() => setEffects(true)}
				class="btn {$effects
					? ''
					: '!scale-100'} flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
			>
				<CheckIcon size="24" class="inline-block me-2" />
				{settings_appearance_enable()}
			</button>

			<button
				bind:this={disableEffectsElement}
				onclick={() => setEffects(false)}
				class="btn {$effects
					? ''
					: '!scale-100'} flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
			>
				<XIcon size="24" class="inline-block me-2" />
				{settings_appearance_disable()}
			</button>
		</div>
	</div>

	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<p class="text-base font-bold">
				{settings_language_title()}
				{#if currentLocale !== "en"} (Language){/if}
			</p>
			<p class="text-sm text-muted font-normal italic">
				{settings_language_description()}
			</p>
		</div>
		<div class="flex flex-col gap-3 w-full">
			<Dropdown
				options={languageOptions}
				settingsStyle
				selected={getLanguageDisplayName(currentLocale)}
				onselect={handleLanguageChange}
			/>
		</div>
	</div>
</div>
