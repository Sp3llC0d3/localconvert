<script lang="ts">
	import { onMount } from "svelte";
	import { goto, beforeNavigate, afterNavigate } from "$app/navigation";

	import { VERT_NAME } from "$lib/util/consts.js";
	import { browser } from "$app/environment";
	import * as Layout from "$lib/components/layout";
	import * as Navbar from "$lib/components/layout/Navbar";
	import featuredImage from "$lib/assets/og-image.png";
	import { Settings } from "$lib/sections/settings/index.svelte";
	import {
		files,
		isMobile,
		effects,
		theme,
		dropping,
		locale,
	} from "$lib/store/index.svelte";
	import "$lib/css/app.scss";
	import { initStores as initAnimStores } from "$lib/util/animation.js";
	import { ToastManager } from "$lib/util/toast.svelte.js";
	import { toast_insecure_context } from "$lib/paraglide/messages/_barrel.js";
	import { log } from "$lib/util/logger.js";
	import { commandPalette } from "$lib/store/commandPalette.svelte";
	import { loadFontForLocale } from "$lib/util/fonts.js";
	import { localizeHref, deLocalizeHref, getLocale, locales } from "$lib/paraglide/runtime";
	import { page } from "$app/state";

	let { children, data } = $props();
	let scrollPositions = new Map<string, number>();

	beforeNavigate((nav) => {
		if (!nav.from || !$isMobile) return;
		scrollPositions.set(nav.from.url.pathname, window.scrollY);
	});

	afterNavigate((nav) => {
		if (!$isMobile) return;
		const scrollY = nav.to
			? scrollPositions.get(nav.to.url.pathname) || 0
			: 0;
		window.scrollTo(0, scrollY);
	});

	const dropFiles = async (e: DragEvent) => {
		e.preventDefault();
		dropping.set(false);
		const oldLength = files.files.length;
		await files.add(e.dataTransfer?.files);
		if (oldLength !== files.files.length) goto(localizeHref("/convert/"));
	};

	const handleDrag = (e: DragEvent, drag: boolean) => {
		e.preventDefault();
		dropping.set(drag);
	};

	const handlePaste = (e: ClipboardEvent) => {
		const clipboardData = e.clipboardData;
		if (!clipboardData || !clipboardData.files.length) return;
		e.preventDefault();
		const oldLength = files.files.length;
		files.add(clipboardData.files);
		if (oldLength !== files.files.length) goto(localizeHref("/convert/"));
	};

	onMount(() => {
		initAnimStores();

		const handleResize = () => {
			isMobile.set(window.innerWidth <= 768);
		};

		isMobile.set(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		window.addEventListener("paste", handlePaste);

		const handleCmdK = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				commandPalette.toggle();
			}
		};
		window.addEventListener("keydown", handleCmdK);

		effects.set(localStorage.getItem("effects") !== "false");
		theme.set(
			(localStorage.getItem("theme") as "light" | "dark") || "light",
		);
		// Locale is determined by URL (via Paraglide URL strategy).
		// Just load the correct font for the current locale.
		loadFontForLocale(getLocale());

		Settings.instance.load();

		if (!window.isSecureContext) {
			log(["layout"], "Insecure context (HTTP) detected, some features may not work as expected.");
			ToastManager.add({
				type: "warning",
				message: toast_insecure_context(),
				disappearing: false,
			});
		}

		return () => {
			window.removeEventListener("paste", handlePaste);
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("keydown", handleCmdK);
		};
	});

</script>

<svelte:head>
	<title>{VERT_NAME}</title>
	<meta name="theme-color" content="#0F6E56" />
	<meta
		name="title"
		content="{VERT_NAME} — Free, Private Toolkit for Files & Code"
	/>
	<meta
		name="description"
		content="39 tools for PDFs, images, and developer workflows — all running in your browser. No uploads, no accounts, no file size limits. Free and open source."
	/>
	<meta property="og:url" content="https://localconvert.app" />
	<meta property="og:type" content="website" />
	<meta
		property="og:title"
		content="{VERT_NAME} — Free, Private Toolkit for Files & Code"
	/>
	<meta
		property="og:description"
		content="39 tools for PDFs, images, and developer workflows — all running in your browser. No uploads, no accounts, no file size limits. Free and open source."
	/>
	<meta property="og:image" content={featuredImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:domain" content="localconvert.app" />
	<meta property="twitter:url" content="https://localconvert.app" />
	<meta
		property="twitter:title"
		content="{VERT_NAME} — Free, Private Toolkit for Files & Code"
	/>
	<meta
		property="twitter:description"
		content="39 tools for PDFs, images, and developer workflows — all running in your browser. No uploads, no accounts, no file size limits. Free and open source."
	/>
	<meta property="twitter:image" content={featuredImage} />
	{#each locales as loc}
		<link rel="alternate" hreflang={loc} href="https://localconvert.app{localizeHref(deLocalizeHref(page.url.pathname), { locale: loc })}" />
	{/each}
	<link rel="alternate" hreflang="x-default" href="https://localconvert.app{deLocalizeHref(page.url.pathname)}" />
	<link rel="manifest" href="/manifest.json" />
	<link rel="search" type="application/opensearchdescription+xml" title="LocalConvert" href="/opensearch.xml" />
	{#if data.isAprilFools}
		<style>
			* {
				font-family: "Comic Sans MS", "Comic Sans", cursive !important;
			}
		</style>
	{/if}
</svelte:head>

{#key $locale}
	<a href="#main-content" class="skip-link">Skip to main content</a>
	<div
		class="flex flex-col min-h-screen h-full w-full overflow-x-hidden"
		ondrop={dropFiles}
		ondragenter={(e) => handleDrag(e, true)}
		ondragover={(e) => handleDrag(e, true)}
		ondragleave={(e) => handleDrag(e, false)}
		role="region"
	>
		<Layout.UploadRegion />

		<div>
			<Layout.MobileLogo />
			<Navbar.Desktop />
		</div>

		<main id="main-content" class="flex-grow flex flex-col">
			<Layout.PageContent {children} />
		</main>

		<Layout.Toasts />
		<Layout.Dialogs />
		<Layout.IOSInstallBanner />
		<Layout.CommandPalette />

		<div>
			<Layout.Footer />
			<Navbar.Mobile />
		</div>
	</div>
{/key}

<Layout.Gradients />