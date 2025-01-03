<script lang="ts">
	import { beforeNavigate, goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { PUB_HOSTNAME, PUB_PLAUSIBLE_URL } from "$env/static/public";
	import { blur, duration } from "$lib/animation";
	import featuredImage from "$lib/assets/VERT_Feature.webp";
	import ConversionPanel from "$lib/components/functional/ConversionPanel.svelte";
	import Navbar from "$lib/components/functional/Navbar.svelte";
	import Footer from "$lib/components/visual/Footer.svelte";
	import Logo from "$lib/components/visual/svg/Logo.svelte";
	import { files } from "$lib/store/index.svelte";
	import {
		InfoIcon,
		RefreshCw,
		SettingsIcon,
		UploadIcon,
	} from "lucide-svelte";
	import { onMount } from "svelte";
	import { quintOut } from "svelte/easing";
	import { writable } from "svelte/store";
	import { fade } from "svelte/transition";
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
</svelte:head>

<div class="flex flex-col h-screen">
	<!-- FIXME: if user resizes between desktop/mobile, highlight of page disappears (only shows on original size) -->

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

	<div class="grid grid-rows-1 grid-cols-1 h-full">
		{#key data.pathname}
			<div
				class="row-start-1 col-start-1"
				in:blur={{
					blurMultiplier: 8,
					duration,
					easing: quintOut,
					x: {
						start: goingLeft ? -100 : 100,
						end: 0,
					},
					y: {
						start: 72,
						end: 0,
					},
					origin: "top center",
				}}
				out:blur={{
					blurMultiplier: 8,
					duration,
					easing: quintOut,
					x: {
						start: 0,
						end: goingLeft ? 100 : -100,
					},
					y: {
						start: 0,
						end: 72,
					},
					origin: "top center",
				}}
			>
				<div class="flex flex-col h-full">
					<div class="flex-grow">
						{@render children()}
					</div>
					<div
						class="hidden md:block w-full h-14 border-t border-separator relative"
					>
						<Footer
							class="w-full h-full"
							items={{
								"Privacy policy": "#",
								"Source code":
									"https://github.com/not-nullptr/VERT",
								"Discord server":
									"https://discord.gg/kqevGxYPak",
							}}
						/>
					</div>
				</div>
			</div>
		{/key}
	</div>

	<!-- Mobile navbar -->
	<div
		class="fixed md:hidden bottom-0 left-0 w-screen p-8 justify-center z-50"
	>
		<div class="flex flex-col justify-center items-center gap-4">
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
					class="w-full"
				>
					<ConversionPanel />
				</div>
			{/if}
			<Navbar {items} />
		</div>
	</div>
</div>

{#if data.pathname === "/"}
	<div
		transition:fade={{
			duration,
			easing: quintOut,
		}}
		class="fixed top-0 left-0 w-screen h-screen -z-40 pointer-events-none"
		style="background: var(--bg-gradient);"
	></div>
{/if}
