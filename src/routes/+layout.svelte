<script lang="ts">
	import "../app.css";
	import { goto } from "$app/navigation";
	import { blur, duration } from "$lib/animation";
	import { quintOut } from "svelte/easing";
	import { files } from "$lib/store/index.svelte";
	import Logo from "$lib/components/visual/svg/Logo.svelte";
	import { fly } from "svelte/transition";
	import featuredImage from "$lib/assets/VERT_Feature.webp";
	import { PUB_HOSTNAME, PUB_PLAUSIBLE_URL } from "$env/static/public";
	let { children, data } = $props();

	let navWidth = $state(1);
	let shouldGoBack = $state(false);

	const links = $derived<{
		[key: string]: string;
	}>({
		Upload: "/",
		[files.files.length > 0
			? `Convert (${files.files.length})`
			: `Convert`]: "/convert",
		About: "/about",
	});

	const linkCount = $derived(Object.keys(links).length);
	const linkIndex = $derived(
		Object.keys(links).findIndex((link) => links[link] === data.pathname),
	);

	const maybeNavToHome = (e: DragEvent) => {
		if (e.dataTransfer?.types.includes("Files")) {
			e.preventDefault();
			goto("/");
		}
	};
</script>

<svelte:head>
	<title>VERT.sh</title>
	<meta name="theme-color" content="#F2ABEE" />
	<meta property="og:image" content={featuredImage} />
	<meta property="twitter:image" content={featuredImage} />
	{#if PUB_PLAUSIBLE_URL}<script
			defer
			data-domain={PUB_HOSTNAME || "vert.sh"}
			src="{PUB_PLAUSIBLE_URL}/js/script.js"
		></script>{/if}
</svelte:head>

<div
	role="main"
	class="w-full h-full max-w-screen-lg mx-auto p-4"
	ondragenter={maybeNavToHome}
>
	<div class="flex justify-center mb-5 lg:hidden">
		<a
			href="/"
			class="px-6 relative h-16 mr-3 justify-center items-center bg-accent-background fill-accent-foreground rounded-xl md:hidden flex"
		>
			<div class="h-6 w-24 items-center flex justify-center">
				<Logo />
			</div>
		</a>
	</div>

	<div
		class="w-full max-w-screen-md p-1 border-solid border-2 rounded-2xl border-foreground-muted-alt flex mb-10 mx-auto lg:mt-5"
	>
		<div class="md:p-1">
			<a
				href="/"
				class="px-3 relative w-full h-full mr-3 justify-center items-center bg-accent-background fill-accent-foreground rounded-xl md:flex hidden"
			>
				<div class="h-6 w-24 items-center flex justify-center">
					<Logo />
				</div>
			</a>
		</div>

		<div
			bind:clientWidth={navWidth}
			class="w-full flex bg-background relative h-16"
		>
			<div
				class="absolute pointer-events-none top-1 bg-foreground h-[calc(100%-8px)] rounded-xl"
				style="width: {navWidth / linkCount - 8}px; left: {(navWidth /
					linkCount) *
					linkIndex +
					4}px; transition: {duration - 200}ms ease left;"
			></div>
			{#each Object.entries(links) as [name, link] (link)}
				<a
					class="w-1/2 px-2 h-[calc(100%-16px)] mt-2 flex items-center justify-center rounded-xl relative font-display overflow-hidden"
					href={link}
					onclick={() => {
						const keys = Object.keys(links);
						const currentIndex = keys.findIndex(
							(key) => links[key] === data.pathname,
						);
						const nextIndex = keys.findIndex(
							(key) => links[key] === link,
						);
						shouldGoBack = nextIndex < currentIndex;
					}}
				>
					<div class="grid grid-cols-1 grid-rows-1">
						{#key name}
							<span
								class="mix-blend-difference invert col-start-1 row-start-1 text-center"
								in:fly={{
									duration,
									easing: quintOut,
									y: -50,
								}}
								out:fly={{
									duration,
									easing: quintOut,
									y: 50,
								}}
							>
								{name}
							</span>
						{/key}
					</div>
				</a>
			{/each}
		</div>
	</div>
	<div class="w-full max-w-screen-lg grid grid-cols-1 grid-rows-1 relative">
		{#key data.pathname}
			<div class="w-full">
				<div
					class="absolute top-0 left-0 w-full"
					in:blur={{
						duration,
						easing: quintOut,
						blurMultiplier: 12,
						x: {
							start: !shouldGoBack ? 250 : -250,
							end: 0,
						},
						scale: {
							start: 0.75,
							end: 1,
						},
					}}
					out:blur={{
						duration,
						easing: quintOut,
						blurMultiplier: 12,
						x: {
							start: 0,
							end: !shouldGoBack ? -250 : 250,
						},
						scale: {
							start: 1,
							end: 0.75,
						},
					}}
				>
					<div class="pb-20">
						{@render children()}
					</div>
				</div>
			</div>
		{/key}
	</div>
</div>
