<script lang="ts">
	import "../app.scss";
	import { goto } from "$app/navigation";
	import { blur, duration } from "$lib/animation";
	import { quintOut } from "svelte/easing";
	import { files, theme } from "$lib/store/index.svelte";
	import Logo from "$lib/components/visual/svg/Logo.svelte";
	import featuredImage from "$lib/assets/VERT_Feature.webp";
	import {
		PUB_ENV,
		PUB_HOSTNAME,
		PUB_PLAUSIBLE_URL,
	} from "$env/static/public";
	import FancyMenu from "$lib/components/functional/FancyMenu.svelte";
	import { writable } from "svelte/store";
	import {
		InfoIcon,
		MoonIcon,
		RefreshCw,
		SettingsIcon,
		SunIcon,
		UploadIcon,
	} from "lucide-svelte";
	import { browser } from "$app/environment";
	import JSCookie from "js-cookie";
	import { onMount } from "svelte";
	import Panel from "$lib/components/visual/Panel.svelte";
	import Navbar from "$lib/components/functional/Navbar.svelte";
	import Footer from "$lib/components/visual/Footer.svelte";
	import { page } from "$app/stores";
	import ConversionPanel from "$lib/components/functional/ConversionPanel.svelte";
	import { fade } from "svelte/transition";
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
</svelte:head>

<div class="absolute top-8 left-0 w-screen flex justify-center z-50">
	<div class="flex flex-col gap-4">
		<Navbar {items} />
		{#if items
			.find((i) => i.url === "/convert")
			?.activeMatch($page.url.pathname)}
			<div
				in:blur={{
					blurMultiplier: 8,
					duration: duration + 50,
					delay: 50,
					easing: quintOut,
					y: {
						start: -24,
						end: 0,
					},
					scale: {
						start: 0.95,
						end: 1,
					},
				}}
				out:blur={{
					blurMultiplier: 8,
					duration,
					easing: quintOut,
					y: {
						start: 0,
						end: 24,
					},
					scale: {
						start: 1,
						end: 1.05,
					},
				}}
			>
				<ConversionPanel />
			</div>
		{/if}
	</div>
</div>

<div class="min-h-screen grid grid-rows-1 grid-cols-1">
	{#key data.pathname}
		<div
			class="row-start-1 col-start-1"
			in:blur={{
				blurMultiplier: 8,
				duration,
				easing: quintOut,
			}}
			out:blur={{
				blurMultiplier: 8,
				duration,
				easing: quintOut,
			}}
		>
			{@render children()}
		</div>
	{/key}
</div>

<div class="-mt-14 w-full h-14 border-t border-separator relative z-50">
	<Footer
		class="w-full h-full"
		items={{
			"Privacy Policy": "#",
			"Source Code": "#",
			"Discord Server": "#",
		}}
	/>
</div>
