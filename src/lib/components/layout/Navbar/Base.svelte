<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/state";
	import { duration, fade } from "$lib/util/animation";
	import {
		effects,
		files,
		goingLeft,
		setTheme,
		updateLocale,
		availableLocales,
	} from "$lib/store/index.svelte";
	import clsx from "clsx";
	import {
		DownloadIcon,
		FileTextIcon,
		GlobeIcon,
		InfoIcon,
		MoonIcon,
		RefreshCw,
		SettingsIcon,
		SunIcon,
		FolderOpen,
		type Icon as IconType,
	} from "lucide-svelte";
	import { quintOut } from "svelte/easing";
	import Panel from "../../visual/Panel.svelte";
	import Logo from "../../visual/svg/Logo.svelte";
	import { beforeNavigate } from "$app/navigation";
	import Tooltip from "$lib/components/visual/Tooltip.svelte";
	import { m } from "$lib/paraglide/messages";
	import { getLocale } from "$lib/paraglide/runtime";
	import { onMount } from "svelte";

	let installPrompt: any = $state((browser && (window as any).__installPrompt) || null);

	let showLangPicker = $state(false);
	let currentLocale = $state("en");
	let langPickerContainer = $state<HTMLDivElement>();

	onMount(() => {
		currentLocale = localStorage.getItem("locale") || getLocale();
	});

	function selectLocale(locale: string) {
		currentLocale = locale;
		updateLocale(locale);
		showLangPicker = false;
	}

	if (browser) {
		window.addEventListener("beforeinstallprompt", (e: Event) => {
			e.preventDefault();
			installPrompt = e;
			(window as any).__installPrompt = e;
		});

		// Check for early-captured prompt every second until found
		const checkPrompt = setInterval(() => {
			if ((window as any).__installPrompt && !installPrompt) {
				installPrompt = (window as any).__installPrompt;
			}
			if (installPrompt) clearInterval(checkPrompt);
		}, 1000);

		// Stop checking after 30 seconds
		setTimeout(() => clearInterval(checkPrompt), 30000);
	}

	async function handleInstall() {
		if (!installPrompt && browser) {
			installPrompt = (window as any).__installPrompt || null;
		}
		if (!installPrompt) return;
		installPrompt.prompt();
		const result = await installPrompt.userChoice;
		if (result.outcome === "accepted") {
			installPrompt = null;
			(window as any).__installPrompt = null;
		}
	}

	const items = $derived<
		{
			name: string;
			url: string;
			activeMatch: (pathname: string) => boolean;
			icon: typeof IconType;
			badge?: number;
		}[]
	>([
		{
			name: m["navbar.upload"](),
			url: "/",
			activeMatch: (pathname) => pathname === "/",
			icon: FolderOpen,
		},
		{
			name: m["navbar.convert"](),
			url: "/convert/",
			activeMatch: (pathname) =>
				pathname === "/convert/" || pathname === "/convert",
			icon: RefreshCw,
			badge: files.files.length,
		},
		{
			name: m["navbar.pdf_tools"](),
			url: "/pdf-tools/",
			activeMatch: (pathname) => pathname.startsWith("/pdf-tools"),
			icon: FileTextIcon,
		},
		{
			name: m["navbar.settings"](),
			url: "/settings/",
			activeMatch: (pathname) => pathname.startsWith("/settings"),
			icon: SettingsIcon,
		},
		{
			name: m["navbar.about"](),
			url: "/about/",
			activeMatch: (pathname) => pathname.startsWith("/about"),
			icon: InfoIcon,
		},
	]);

	let links = $state<HTMLAnchorElement[]>([]);
	let container = $state<HTMLDivElement>();
	let isInitialized = $state(false);

	// measureTick forces linkRects/containerRect to re-read the DOM after
	// installPrompt changes (the flex items shift when the button appears/disappears)
	let measureTick = $state(0);

	$effect(() => {
		void installPrompt; // depend on installPrompt
		setTimeout(() => measureTick++, 15);
	});

	const containerRect = $derived.by(() => {
		void measureTick;
		return container?.getBoundingClientRect();
	});

	const linkRects = $derived.by(() => {
		void measureTick;
		return links.map((l) => l.getBoundingClientRect());
	});

	const selectedIndex = $derived(
		items.findIndex((i) => i.activeMatch(page.url.pathname)),
	);

	const isSecretPage = $derived(selectedIndex === -1);

	$effect(() => {
		if (containerRect && linkRects.length > 0 && links.length > 0) {
			setTimeout(() => {
				isInitialized = true;
			}, 10);
		} else {
			isInitialized = false;
		}
	});

	beforeNavigate((e) => {
		const oldIndex = items.findIndex((i) =>
			i.activeMatch(e.from?.url.pathname || ""),
		);
		const newIndex = items.findIndex((i) =>
			i.activeMatch(e.to?.url.pathname || ""),
		);
		if (newIndex < oldIndex) {
			goingLeft.set(true);
		} else {
			goingLeft.set(false);
		}
	});

	// Close language picker when clicking outside
	$effect(() => {
		if (!showLangPicker) return;
		function handleClick(e: MouseEvent) {
			if (!langPickerContainer?.contains(e.target as Node)) {
				showLangPicker = false;
			}
		}
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') showLangPicker = false;
		}
		window.addEventListener('pointerdown', handleClick);
		window.addEventListener('keydown', handleKey);
		return () => {
			window.removeEventListener('pointerdown', handleClick);
			window.removeEventListener('keydown', handleKey);
		};
	});
</script>

{#snippet link(item: (typeof items)[0], index: number)}
	{@const Icon = item.icon}
	<a
		bind:this={links[index]}
		href={item.url}
		aria-label={item.name}
		class={clsx(
			"min-w-0 md:min-w-32 h-full relative z-10 rounded-xl flex flex-1 items-center justify-center gap-3 overflow-hidden",
			{
				"bg-panel-highlight":
					item.activeMatch(page.url.pathname) && !browser,
			},
		)}
		draggable={false}
	>
		<div class="grid grid-rows-1 grid-cols-1">
			{#key item.name}
				<div
					class="w-full row-start-1 col-start-1 h-full flex items-center justify-center gap-3"
					in:fade={{
						duration,
						easing: quintOut,
					}}
					out:fade={{
						duration,
						easing: quintOut,
					}}
				>
					<div class="relative">
						<Icon />
						{#if item.badge}
							<div
								class="absolute overflow-hidden grid grid-rows-1 grid-cols-1 -top-1 font-display -right-1 w-fit px-1.5 h-4 rounded-full bg-badge text-on-badge font-medium"
								style="font-size: 0.7rem;"
								transition:fade={{
									duration,
									easing: quintOut,
								}}
							>
								{#key item.badge}
									<div
										class="flex items-center justify-center w-full h-full col-start-1 row-start-1"
										in:fade={{
											duration,
											easing: quintOut,
										}}
										out:fade={{
											duration,
											easing: quintOut,
										}}
									>
										{item.badge}
									</div>
								{/key}
							</div>
						{/if}
					</div>
					<p
						class="font-medium hidden hyphens-auto break-all md:flex min-w-0"
					>
						{item.name}
					</p>
				</div>
			{/key}
		</div>
	</a>
{/snippet}

<div bind:this={container}>
	<Panel class="max-w-[1100px] w-screen h-20 flex items-center gap-0 md:gap-3 relative">
		{@const linkRect = linkRects.at(selectedIndex) || linkRects[0]}
		{#if linkRect && isInitialized}
			<div
				class="absolute bg-panel-highlight rounded-xl"
				style="width: {linkRect.width}px; height: {linkRect.height}px; top: {linkRect.top -
					(containerRect?.top || 0)}px; left: {linkRect.left -
					(containerRect?.left || 0)}px; opacity: {isSecretPage
					? 0
					: 1}; {$effects
					? `transition: left var(--transition) ${duration}ms, top var(--transition) ${duration}ms, opacity var(--transition) ${duration}ms;`
					: ''}"
			></div>
		{/if}
		<a
			class="w-28 h-full bg-accent rounded-xl items-center justify-center hidden md:flex"
			href="/"
		>
			<div class="h-5 w-full">
				<Logo />
			</div>
		</a>
		{#each items as item, i (item.url)}
			{@render link(item, i)}
		{/each}
		<div class="w-0.5 bg-separator h-full hidden md:flex"></div>
		<Tooltip text={m["navbar.toggle_theme"]()} position="right">
			<button
				onclick={() => {
					const isDark =
						document.documentElement.classList.contains("dark");
					setTheme(isDark ? "light" : "dark");
				}}
				class="w-14 h-full items-center justify-center hidden md:flex"
			>
				<SunIcon class="dynadark:hidden block" />
				<MoonIcon class="dynadark:block hidden" />
			</button>
		</Tooltip>
		<div class="w-0.5 bg-separator h-full flex"></div>
		<div class="relative flex" bind:this={langPickerContainer}>
			<button
				onclick={() => (showLangPicker = !showLangPicker)}
				class="w-14 h-full items-center justify-center flex"
				class:text-accent={showLangPicker}
				aria-label="Select language"
			>
				<GlobeIcon size={20} />
			</button>
			{#if showLangPicker}
				<div
					class="lang-popover absolute bottom-full right-0 mb-2 md:top-full md:bottom-auto md:mt-2 md:mb-0 z-50 rounded-xl shadow-lg p-3 grid grid-cols-3 gap-1.5 w-64"
					style="background: var(--bg-panel); border: 1px solid var(--bg-separator);"
				>
					{#each Object.entries(availableLocales) as [locale, name]}
						<button
							onclick={() => selectLocale(locale)}
							class="lang-btn px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-center truncate"
							class:lang-active={currentLocale === locale}
						>
							{name}
						</button>
					{/each}
				</div>
			{/if}
		</div>
		{#if installPrompt}
			<div class="w-0.5 bg-separator h-full hidden md:flex"></div>
			<button
				onclick={handleInstall}
				class="h-full items-center justify-center gap-2 flex px-3 text-sm font-medium hover:text-accent transition-colors"
			>
				<DownloadIcon size={18} />
				<span class="hidden md:inline">Install App</span>
			</button>
		{/if}
	</Panel>
</div>

<style>
	.lang-btn {
		background: transparent;
		color: var(--fg);
	}
	.lang-btn:hover {
		background: var(--bg-panel-alt, var(--bg-separator));
	}
	.lang-btn.lang-active {
		background: var(--accent);
		color: var(--fg-on-accent);
		font-weight: 600;
	}
</style>