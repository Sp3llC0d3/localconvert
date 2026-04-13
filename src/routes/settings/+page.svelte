<script lang="ts">
	import { browser } from "$app/environment";
	import { log } from "$lib/util/logger";
	import * as Settings from "$lib/sections/settings/index.svelte";
	import { SlidersHorizontalIcon, PaletteIcon, ShieldIcon } from "lucide-svelte";
	import { onMount } from "svelte";
	import { m } from "$lib/paraglide/messages";
	import { ToastManager } from "$lib/util/toast.svelte";

	let settings = $state(Settings.Settings.instance.settings);

	let isInitial = $state(true);

	$effect(() => {
		if (!browser) return;
		if (isInitial) {
			isInitial = false;
			return;
		}

		const savedSettings = localStorage.getItem("settings");
		if (savedSettings) {
			const parsedSettings = JSON.parse(savedSettings);
			if (JSON.stringify(parsedSettings) === JSON.stringify(settings))
				return;
		}

		try {
			Settings.Settings.instance.settings = settings;
			Settings.Settings.instance.save();
			log(["settings"], "saving settings");
		} catch (error) {
			log(["settings", "error"], `failed to save settings: ${error}`);
			ToastManager.add({
				type: "error",
				message: m["settings.errors.save_failed"](),
			});
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
			settings = Settings.Settings.instance.settings;
		}
	});
</script>

<svelte:head>
	<title>{m["settings.title"]()} — LocalConvert</title>
</svelte:head>

<div class="settings-page">
	<!-- ═══ HERO ═══ -->
	<header class="settings-hero fade-in-up">
		<span class="settings-label">{m["settings.title"]()}</span>
		<p class="settings-subtitle">{m["settings.subtitle"]()}</p>
	</header>

	<!-- ═══ SECTIONS ═══ -->
	<div class="settings-sections">
		<section class="settings-card fade-in-up fade-delay-1" style="z-index: 3;">
			<div class="settings-card-head">
				<span class="settings-card-num">01</span>
				<div class="settings-card-icon settings-card-icon--conversion">
					<SlidersHorizontalIcon size="18" strokeWidth={2.2} />
				</div>
				<h2>{m["settings.conversion.title"]()}</h2>
			</div>
			<div class="settings-card-body">
				<Settings.Conversion bind:settings />
			</div>
		</section>

		<section class="settings-card fade-in-up fade-delay-2" style="z-index: 2;">
			<div class="settings-card-head">
				<span class="settings-card-num">02</span>
				<div class="settings-card-icon settings-card-icon--appearance">
					<PaletteIcon size="18" strokeWidth={2.2} />
				</div>
				<h2>{m["settings.appearance.title"]()}</h2>
			</div>
			<div class="settings-card-body">
				<Settings.Appearance />
			</div>
		</section>

		<section class="settings-card fade-in-up fade-delay-3" style="z-index: 1;">
			<div class="settings-card-head">
				<span class="settings-card-num">03</span>
				<div class="settings-card-icon settings-card-icon--privacy">
					<ShieldIcon size="18" strokeWidth={2.2} />
				</div>
				<h2>{m["settings.privacy.title"]()}</h2>
			</div>
			<div class="settings-card-body">
				<Settings.Privacy bind:settings />
			</div>
		</section>
	</div>
</div>

<style>
	.settings-page {
		max-width: 700px;
		margin: 0 auto;
		padding: 2rem 1rem 5rem;
	}

	/* ── Hero ── */
	.settings-hero {
		margin-bottom: 2.5rem;
	}

	.settings-label {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--accent);
		display: block;
		margin-bottom: 0.4rem;
	}

	.settings-subtitle {
		font-family: var(--font-body);
		font-size: 1.1rem;
		color: var(--fg-muted);
		font-weight: 400;
		margin: 0;
	}

	/* ── Sections ── */
	.settings-sections {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		position: relative;
		z-index: 0; /* contain stacking context so cards never escape above navbar */
	}

	.settings-card {
		background: var(--bg-panel);
		border-radius: 1.25rem;
		box-shadow: var(--shadow-panel);
		position: relative;
	}

	/* ── Card header ── */
	.settings-card-head {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1.15rem 1.5rem;
		border-bottom: 1px solid var(--bg-separator);
	}

	.settings-card-num {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--fg-muted);
		letter-spacing: 0.05em;
		opacity: 0.6;
		min-width: 1.25rem;
	}

	.settings-card-icon {
		width: 34px;
		height: 34px;
		border-radius: 9px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-on-accent);
		flex-shrink: 0;
	}

	.settings-card-icon--conversion { background: var(--accent-green); }
	.settings-card-icon--appearance { background: var(--accent-blue); }
	.settings-card-icon--privacy    { background: var(--accent-purple); }

	.settings-card-head h2 {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		margin: 0;
	}

	/* ── Card body ── */
	.settings-card-body {
		padding: 1.5rem;
	}

	/* ── Mobile ── */
	@media (max-width: 640px) {
		.settings-page {
			padding: 1.25rem 0.75rem 4rem;
		}

		.settings-card-head {
			padding: 1rem 1.25rem;
		}

		.settings-card-body {
			padding: 1.25rem;
		}
	}
</style>
