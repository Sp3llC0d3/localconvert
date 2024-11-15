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
		RotateCw,
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
		}[]
	>([
		{
			name: "Upload",
			url: "/",
			activeMatch: (pathname) => pathname === "/",
			icon: UploadIcon,
		},
		{
			name:
				files.files.length > 0
					? `Convert (${files.files.length})`
					: `Convert`,
			url: "/convert",
			activeMatch: (pathname) => pathname === "/convert",
			icon: RotateCw,
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

<div class="absolute top-8 left-0 w-full flex justify-center">
	<div class="flex flex-col gap-4">
		<Navbar {items} />
		{#if items
			.find((i) => i.url === "/convert")
			?.activeMatch($page.url.pathname)}
			<ConversionPanel />
		{/if}
	</div>
</div>

<div
	class="fixed top-0 left-0 w-screen h-screen -z-50 pointer-events-none"
	style="background: var(--bg-gradient);"
></div>

<div class="min-h-screen">
	{@render children()}
</div>

<div class="-mt-14 -z-50 w-full h-14 border-t border-separator">
	<Footer
		class="w-full h-full"
		items={{
			"Privacy Policy": "#",
			"Source Code": "#",
			"Discord Server": "#",
		}}
	/>
</div>
