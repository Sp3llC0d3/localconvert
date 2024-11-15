<script lang="ts">
	import { blur, duration, flip, transition } from "$lib/animation";
	import { ChevronDown } from "lucide-svelte";
	import { onMount } from "svelte";
	import { quintOut } from "svelte/easing";
	import { fade } from "svelte/transition";

	type Props = {
		options: string[];
		selected?: string;
		onselect?: (option: string) => void;
	};

	let {
		options,
		selected = $bindable(options[0]),
		onselect,
	}: Props = $props();

	let open = $state(false);
	let hover = $state(false);
	let isUp = $state(false);
	let dropdown = $state<HTMLDivElement>();

	const toggle = () => {
		open = !open;
	};

	const select = (option: string) => {
		const oldIndex = options.indexOf(selected || "");
		const newIndex = options.indexOf(option);
		isUp = oldIndex > newIndex;
		selected = option;
		onselect?.(option);
		toggle();
	};

	onMount(() => {
		const click = (e: MouseEvent) => {
			if (dropdown && !dropdown.contains(e.target as Node)) {
				open = false;
			}
		};

		window.addEventListener("click", click);
		return () => window.removeEventListener("click", click);
	});
</script>

<div class="relative w-full min-w-fit" bind:this={dropdown}>
	<button
		class="font-display w-full min-w-fit justify-between overflow-hidden relative cursor-pointer px-3 bg-button flex items-center rounded-full p-2 focus:!outline-none"
		onclick={toggle}
		onmouseenter={() => (hover = true)}
		onmouseleave={() => (hover = false)}
	>
		<!-- <p>{selected}</p> -->
		<div class="grid grid-cols-1 grid-rows-1 w-fit text-left flex-grow-0">
			{#key selected}
				<p
					in:blur={{
						duration,
						easing: quintOut,
						blurMultiplier: 6,
						scale: {
							start: 0.9,
							end: 1,
						},
						y: {
							start: isUp ? -50 : 50,
							end: 0,
						},
					}}
					out:blur={{
						duration,
						easing: quintOut,
						blurMultiplier: 6,
						scale: {
							start: 1,
							end: 0.9,
						},
						y: {
							start: 0,
							end: isUp ? 50 : -50,
						},
					}}
					class="col-start-1 row-start-1 text-left"
				>
					{selected}
				</p>
			{/key}
			{#each options as option}
				<p
					class="col-start-1 row-start-1 invisible pointer-events-none"
				>
					{option}
				</p>
			{/each}
		</div>
		<ChevronDown
			class="w-4 h-4 ml-4 mt-0.5 flex-shrink-0"
			style="transform: rotate({open
				? 180
				: 0}deg); transition: transform {duration}ms {transition};"
		/>
	</button>
	{#if open}
		<div
			style={hover ? "will-change: opacity, blur, transform" : ""}
			transition:blur={{
				duration,
				easing: quintOut,
				blurMultiplier: 6,
				scale: {
					start: 0.9,
					end: 1,
				},
				y: {
					start: -10,
					end: 0,
				},
				origin: "top center",
			}}
			class="w-full shadow-xl bg-panel-alt shadow-black/25 absolute overflow-hidden top-full mt-1 left-0 z-50 bg-background rounded-xl"
		>
			{#each options as option}
				<button
					class="w-full p-2 px-4 text-left hover:bg-panel"
					onclick={() => select(option)}
				>
					{option}
				</button>
			{/each}
		</div>
	{/if}
</div>
