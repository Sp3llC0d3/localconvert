<script lang="ts">
	import { beforeNavigate, goto } from "$app/navigation";
	import { PUB_HOSTNAME, PUB_PLAUSIBLE_URL } from "$env/static/public";
	import { duration, fade } from "$lib/animation";
	import featuredImage from "$lib/assets/VERT_Feature.webp";
	import Navbar from "$lib/components/functional/Navbar.svelte";
	import Footer from "$lib/components/visual/Footer.svelte";
	import Logo from "$lib/components/visual/svg/Logo.svelte";
	import {
		files,
		gradientColor,
		showGradient,
	} from "$lib/store/index.svelte";
	import {
		InfoIcon,
		RefreshCw,
		SettingsIcon,
		UploadIcon,
	} from "lucide-svelte";
	import { onMount } from "svelte";
	import { quintOut } from "svelte/easing";
	import { writable } from "svelte/store";
	import "../app.scss";
	let { children, data } = $props();

	let shouldGoBack = writable(false);
	let navbar = $state<HTMLDivElement>();
	let hover = $state(false);

	const items = $derived<
		{
			name: string;
			url: string;
			activeMatch: (pathname: string) => boolean;
			icon: any;
			badge?: number;
		}[]
	>([
		{
			name: "Upload",
			url: "/",
			activeMatch: (pathname) => pathname === "/",
			icon: UploadIcon,
		},
		{
			name: "Convert",
			url: "/convert",
			activeMatch: (pathname) => pathname === "/convert",
			icon: RefreshCw,
			badge: files.files.length,
		},
		{
			name: "Settings",
			url: "/settings",
			activeMatch: (pathname) => pathname.startsWith("/settings"),
			icon: SettingsIcon,
		},
		{
			name: "About",
			url: "/about",
			activeMatch: (pathname) => pathname.startsWith("/about"),
			icon: InfoIcon,
		},
	]);

	const maybeNavToHome = (e: DragEvent) => {
		if (e.dataTransfer?.types.includes("Files")) {
			e.preventDefault();
			goto("/");
		}
	};

	onMount(() => {
		const mouseEnter = () => {
			hover = true;
		};

		const mouseLeave = () => {
			hover = false;
		};

		navbar?.addEventListener("mouseenter", mouseEnter);
		navbar?.addEventListener("mouseleave", mouseLeave);
	});

	let goingLeft = $state(false);

	beforeNavigate((e) => {
		const oldIndex = items.findIndex((i) =>
			i.activeMatch(e.from?.url.pathname || ""),
		);
		const newIndex = items.findIndex((i) =>
			i.activeMatch(e.to?.url.pathname || ""),
		);
		if (newIndex < oldIndex) {
			goingLeft = true;
		} else {
			goingLeft = false;
		}
	});
</script>

<svelte:head>
	<title>VERT.sh</title>
	<meta name="theme-color" content="#F2ABEE" />
	<meta property="og:image" content={featuredImage} />
	<meta property="twitter:image" content={featuredImage} />
	{#if PUB_PLAUSIBLE_URL}<script
			defer
			data-domain={PUB_HOSTNAME || "vert.sh"}
			src="{PUB_PLAUSIBLE_URL}/js/script.pageview-props.tagged-events.js"
		></script>{/if}
	<script src="/coi-serviceworker.min.js"></script>
	<script type="module">
		// Apply theme before DOM is loaded
		let theme = localStorage.getItem("theme");
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;

		if (theme !== "light" && theme !== "dark") {
			if (!theme) {
				// first time visitor
				window.addEventListener("load", () => {
					window.plausible("Theme set", {
						props: { theme: prefersDark ? "dark" : "light" },
					});
				});
			}

			// invalid theme or first time visitor, set to default
			theme = prefersDark ? "dark" : "light";
			localStorage.setItem("theme", theme);
		}

		document.documentElement.classList.add(theme);
	</script>
</svelte:head>

<div class="flex flex-col min-h-screen h-full">
	<!-- FIXME: if user resizes between desktop/mobile, highlight of page disappears (only shows on original size) -->
	<!-- FIXME: if user has to scroll in a page, transitioning to a page that fits users viewport makes the elements jump after transition ends -->

	<div>
		<!-- Mobile logo -->
		<div class="flex md:hidden justify-center items-center p-8">
			<div
				class="flex items-center justify-center w-36 h-20 bg-panel p-4 rounded-2xl"
			>
				<div
					class="w-[120px] h-14 bg-accent rounded-xl flex items-center justify-center"
				>
					<div class="h-5 w-full">
						<Logo />
					</div>
				</div>
			</div>
		</div>

		<!-- Desktop navbar -->
		<div class="hidden md:flex p-8 w-screen justify-center z-50">
			<Navbar {items} />
		</div>
	</div>

	<div class="grid grid-rows-1 grid-cols-1 h-full flex-grow">
		{#key data.pathname}
			<div
				class="row-start-1 col-start-1"
				transition:fade={{
					duration,
					easing: quintOut,
				}}
			>
				<div class="flex flex-col h-full pb-36 md:pb-0">
					{@render children()}
				</div>
			</div>
		{/key}
	</div>

	<div>
		<div
			class="hidden md:block w-full h-14 border-t border-separator relative mt-12"
		>
			<Footer
				class="w-full h-full"
				items={{
					"Privacy policy": "#",
					"Source code": "https://github.com/not-nullptr/VERT",
					"Discord server": "https://discord.gg/kqevGxYPak",
				}}
			/>
		</div>

		<!-- Mobile navbar -->
		<div
			class="fixed md:hidden bottom-0 left-0 w-screen p-8 justify-center z-50"
		>
			<div class="flex flex-col justify-center items-center">
				<Navbar {items} />
			</div>
		</div>
	</div>
</div>

<!-- Gradients placed here to prevent it overlapping in transitions -->
{#if $showGradient}
	{#if data.pathname === "/"}
		<div
			id="gradient-bg"
			class="fixed top-0 left-0 w-screen h-screen -z-40 pointer-events-none"
			style="background: var(--bg-gradient);"
		></div>
	{:else if data.pathname === "/convert"}
		<div
			id="gradient-bg"
			class="fixed top-0 left-0 w-screen h-screen -z-40 pointer-events-none"
			style="background: var(--bg-gradient-{$gradientColor || 'pink'});"
		></div>
	{:else if data.pathname === "/settings"}
		<div
			id="gradient-bg"
			class="fixed top-0 left-0 w-screen h-screen -z-40 pointer-events-none"
			style="background: var(--bg-gradient-blue);"
		></div>
	{:else if data.pathname === "/about"}
		<div
			id="gradient-bg"
			class="fixed top-0 left-0 w-screen h-screen -z-40 pointer-events-none"
			style="background: var(--bg-gradient-pink);"
		></div>
	{/if}
{/if}
