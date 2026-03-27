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
		ImageIcon,
		InfoIcon,
		MoonIcon,
		RefreshCw,
		SettingsIcon,
		SunIcon,
		FolderOpen,
		WrenchIcon,
		ChevronDownIcon,
		type Icon as IconType,
	} from "lucide-svelte";
	import { quintOut } from "svelte/easing";
	import Panel from "../../visual/Panel.svelte";
	import { beforeNavigate } from "$app/navigation";
	import Tooltip from "$lib/components/visual/Tooltip.svelte";
	import { m } from "$lib/paraglide/messages";
	import { getLocale } from "$lib/paraglide/runtime";
	import { onMount } from "svelte";

	let installPrompt: any = $state((browser && (window as any).__installPrompt) || null);

	let showLangPicker = $state(false);
	let showToolsMenu = $state(false);
	let currentLocale = $state("en");
	let langPickerContainer = $state<HTMLDivElement>();
	let toolsMenuContainer = $state<HTMLDivElement>();

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

		const checkPrompt = setInterval(() => {
			if ((window as any).__installPrompt && !installPrompt) {
				installPrompt = (window as any).__installPrompt;
			}
			if (installPrompt) clearInterval(checkPrompt);
		}, 1000);

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

	// Primary nav items (always visible)
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
	]);

	// Tools submenu items
	const toolItems = $derived([
		{
			name: m["navbar.pdf_tools"](),
			url: "/pdf-tools/",
			activeMatch: (pathname: string) => pathname.startsWith("/pdf-tools"),
			icon: FileTextIcon,
		},
		{
			name: m["navbar.image_tools"](),
			url: "/image-tools/",
			activeMatch: (pathname: string) => pathname.startsWith("/image-tools"),
			icon: ImageIcon,
		},
	]);

	const isToolsActive = $derived(
		toolItems.some((t) => t.activeMatch(page.url.pathname)),
	);

	// Secondary nav items
	const secondaryItems = $derived<
		{
			name: string;
			url: string;
			activeMatch: (pathname: string) => boolean;
			icon: typeof IconType;
		}[]
	>([
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

	// All flat items for indicator calculation
	const allItems = $derived([...items, ...toolItems, ...secondaryItems]);

	let links = $state<HTMLElement[]>([]);
	let container = $state<HTMLDivElement>();
	let isInitialized = $state(false);

	let measureTick = $state(0);

	$effect(() => {
		void installPrompt;
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
		allItems.findIndex((i) => i.activeMatch(page.url.pathname)),
	);

	// Map allItems index to links array index
	const selectedLinkIndex = $derived.by(() => {
		if (selectedIndex === -1) return -1;
		const item = allItems[selectedIndex];
		// Primary items: index 0, 1 → links 0, 1
		if (selectedIndex < items.length) return selectedIndex;
		// Tool items: mapped to the Tools button (index 2)
		if (selectedIndex < items.length + toolItems.length) return 2;
		// Secondary items: mapped to links starting after Tools button
		return 3 + (selectedIndex - items.length - toolItems.length);
	});

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
		const oldIndex = allItems.findIndex((i) =>
			i.activeMatch(e.from?.url.pathname || ""),
		);
		const newIndex = allItems.findIndex((i) =>
			i.activeMatch(e.to?.url.pathname || ""),
		);
		if (newIndex < oldIndex) {
			goingLeft.set(true);
		} else {
			goingLeft.set(false);
		}
		showToolsMenu = false;
	});

	// Close popups when clicking outside
	$effect(() => {
		if (!showLangPicker && !showToolsMenu) return;
		function handleClick(e: MouseEvent) {
			if (showLangPicker && !langPickerContainer?.contains(e.target as Node)) {
				showLangPicker = false;
			}
			if (showToolsMenu && !toolsMenuContainer?.contains(e.target as Node)) {
				showToolsMenu = false;
			}
		}
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				showLangPicker = false;
				showToolsMenu = false;
			}
		}
		window.addEventListener('pointerdown', handleClick);
		window.addEventListener('keydown', handleKey);
		return () => {
			window.removeEventListener('pointerdown', handleClick);
			window.removeEventListener('keydown', handleKey);
		};
	});
</script>

{#snippet navLink(item: { name: string; url: string; activeMatch: (p: string) => boolean; icon: typeof IconType; badge?: number }, index: number)}
	{@const Icon = item.icon}
	<a
		bind:this={links[index]}
		href={item.url}
		aria-label={item.name}
		class={clsx(
			"nav-link",
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
					class="w-full row-start-1 col-start-1 h-full flex items-center justify-center gap-2.5"
					in:fade={{ duration, easing: quintOut }}
					out:fade={{ duration, easing: quintOut }}
				>
					<div class="relative">
						<Icon size={20} />
						{#if item.badge}
							<div
								class="absolute overflow-hidden grid grid-rows-1 grid-cols-1 -top-1.5 font-display -right-2 w-fit px-1.5 h-4 rounded-full bg-badge text-on-badge font-medium"
								style="font-size: 0.65rem;"
								transition:fade={{ duration, easing: quintOut }}
							>
								{#key item.badge}
									<div
										class="flex items-center justify-center w-full h-full col-start-1 row-start-1"
										in:fade={{ duration, easing: quintOut }}
										out:fade={{ duration, easing: quintOut }}
									>
										{item.badge}
									</div>
								{/key}
							</div>
						{/if}
					</div>
					<span class="nav-label">{item.name}</span>
				</div>
			{/key}
		</div>
	</a>
{/snippet}

<div bind:this={container}>
	<Panel class="max-w-[960px] w-screen h-[4.5rem] md:h-[4.25rem] flex items-center gap-0 md:gap-1 relative">
		{@const linkRect = linkRects.at(selectedLinkIndex) || linkRects[0]}
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

		<!-- Primary items -->
		{#each items as item, i (item.url)}
			{@render navLink(item, i)}
		{/each}

		<!-- Tools dropdown -->
		<div
			bind:this={toolsMenuContainer}
			class="nav-link-wrap"
		>
			<button
				bind:this={links[items.length]}
				onclick={() => { showToolsMenu = !showToolsMenu; showLangPicker = false; }}
				aria-label="Tools"
				class={clsx("nav-link nav-tools-btn", {
					"bg-panel-highlight": isToolsActive && !browser,
				})}
			>
				<div class="flex items-center justify-center gap-2">
					<WrenchIcon size={20} />
					<span class="nav-label">{m["navbar.tools"]()}</span>
					<ChevronDownIcon size={14} class="hidden md:block transition-transform {showToolsMenu ? 'rotate-180' : ''}" />
				</div>
			</button>
			{#if showToolsMenu}
				<div
					class="tools-popover"
					transition:fade={{ duration: 120 }}
				>
					{#each toolItems as tool}
						{@const ToolIcon = tool.icon}
						<a
							href={tool.url}
							class="tools-item"
							class:tools-active={tool.activeMatch(page.url.pathname)}
							onclick={() => showToolsMenu = false}
						>
							<ToolIcon size={18} />
							<span>{tool.name}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Secondary items -->
		{#each secondaryItems as item, i (item.url)}
			{@render navLink(item, items.length + 1 + i)}
		{/each}

		<!-- Separator -->
		<div class="nav-sep hidden md:flex"></div>

		<!-- Theme toggle -->
		<Tooltip text={m["navbar.toggle_theme"]()} position="right">
			<button
				onclick={() => {
					const isDark = document.documentElement.classList.contains("dark");
					setTheme(isDark ? "light" : "dark");
				}}
				class="nav-action hidden md:flex"
				aria-label={m["navbar.toggle_theme"]()}
			>
				<SunIcon size={18} class="dynadark:hidden block" />
				<MoonIcon size={18} class="dynadark:block hidden" />
			</button>
		</Tooltip>

		<!-- Language picker -->
		<div class="nav-sep"></div>
		<div class="relative flex" bind:this={langPickerContainer}>
			<button
				onclick={() => { showLangPicker = !showLangPicker; showToolsMenu = false; }}
				class="nav-action"
				class:text-accent={showLangPicker}
				aria-label="Select language"
			>
				<GlobeIcon size={18} />
			</button>
			{#if showLangPicker}
				<div
					class="lang-popover"
					transition:fade={{ duration: 120 }}
				>
					{#each Object.entries(availableLocales) as [locale, name]}
						<button
							onclick={() => selectLocale(locale)}
							class="lang-btn"
							class:lang-active={currentLocale === locale}
							aria-label="Select {name}"
						>
							{name}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Install button -->
		{#if installPrompt}
			<div class="nav-sep hidden md:flex"></div>
			<button
				onclick={handleInstall}
				class="nav-install"
				aria-label="Install app"
			>
				<DownloadIcon size={16} />
				<span class="hidden md:inline">Install</span>
			</button>
		{/if}
	</Panel>
</div>

<style>
	/* ── Nav link wrapper (for Tools dropdown container) ── */
	.nav-link-wrap {
		display: flex;
		flex: 1;
		min-width: 0;
		height: 100%;
		position: relative;
	}

	@media (min-width: 768px) {
		.nav-link-wrap {
			min-width: 5.5rem;
			flex: 1 1 auto;
		}
	}

	/* ── Nav links ── */
	.nav-link {
		display: flex;
		flex: 1;
		min-width: 0;
		height: 100%;
		position: relative;
		z-index: 10;
		border-radius: 0.75rem;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		transition: color 0.15s ease;
	}

	.nav-link:hover {
		color: var(--accent);
	}

	@media (min-width: 768px) {
		.nav-link {
			min-width: 5.5rem;
			flex: 1 1 auto;
		}
	}

	/* ── Nav labels (hidden on mobile) ── */
	.nav-label {
		display: none;
		font-weight: 500;
		font-size: 0.8125rem;
		white-space: nowrap;
	}

	@media (min-width: 768px) {
		.nav-label {
			display: block;
		}
	}

	/* ── Tools dropdown button ── */
	.nav-tools-btn {
		cursor: pointer;
		border: none;
		background: none;
	}

	/* ── Tools popover ── */
	.tools-popover {
		position: absolute;
		z-index: 50;
		bottom: calc(100% + 0.5rem);
		left: 50%;
		transform: translateX(-50%);
		background: var(--bg-panel);
		border: 1px solid var(--bg-separator);
		border-radius: 0.75rem;
		box-shadow: var(--shadow-panel);
		padding: 0.375rem;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 10.5rem;
	}

	@media (min-width: 768px) {
		.tools-popover {
			bottom: auto;
			top: calc(100% + 0.5rem);
		}
	}

	.tools-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--fg);
		text-decoration: none;
		transition: background-color 0.12s ease;
	}

	.tools-item:hover {
		background: var(--bg-panel-alt, var(--bg-separator));
	}

	.tools-item.tools-active {
		background: var(--accent);
		color: var(--fg-on-accent);
	}

	/* ── Separator ── */
	.nav-sep {
		width: 1px;
		height: 100%;
		background: var(--bg-separator);
		flex-shrink: 0;
	}

	/* ── Action buttons (theme, language) ── */
	.nav-action {
		display: flex;
		width: 2.75rem;
		height: 100%;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		cursor: pointer;
		border: none;
		background: none;
		color: inherit;
		transition: color 0.15s ease;
	}

	.nav-action:hover {
		color: var(--accent);
	}

	/* ── Install button ── */
	.nav-install {
		display: flex;
		height: 100%;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		padding: 0 0.75rem;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		border: none;
		background: none;
		color: inherit;
		transition: color 0.15s ease;
		flex-shrink: 0;
	}

	.nav-install:hover {
		color: var(--accent);
	}

	/* ── Language popover ── */
	.lang-popover {
		position: absolute;
		z-index: 50;
		bottom: calc(100% + 0.5rem);
		right: 0;
		background: var(--bg-panel);
		border: 1px solid var(--bg-separator);
		border-radius: 0.75rem;
		box-shadow: var(--shadow-panel);
		padding: 0.75rem;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.375rem;
		width: 16rem;
	}

	@media (min-width: 768px) {
		.lang-popover {
			bottom: auto;
			top: calc(100% + 0.5rem);
		}
	}

	.lang-btn {
		padding: 0.375rem 0.5rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		text-align: center;
		cursor: pointer;
		border: none;
		background: transparent;
		color: var(--fg);
		transition: background-color 0.12s ease;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
