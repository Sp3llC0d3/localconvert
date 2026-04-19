<script lang="ts">
	import { fade, fly } from "$lib/util/animation";
	import {
		BanIcon,
		CheckIcon,
		InfoIcon,
		TriangleAlert,
		XIcon,
	} from "lucide-svelte";
	import { quintOut } from "svelte/easing";
	import { ToastManager } from "$lib/util/toast.svelte";
	import { aria_close } from "$lib/paraglide/messages/_barrel.js";
	import type { ToastProps } from "$lib/util/toast.svelte";
	import type { SvelteComponent } from "svelte";
	import clsx from "clsx";
	import type { Toast as ToastType } from "$lib/util/toast.svelte";

	const props: {
		toast: ToastType<unknown>;
	} = $props();

	const { id, type, message, durations } = props.toast;

	const additional =
		"additional" in props.toast ? props.toast.additional : {};

	const colors = {
		success: "purple",
		error: "red",
		info: "blue",
		warning: "pink",
	};

	const Icons = {
		success: CheckIcon,
		error: BanIcon,
		info: InfoIcon,
		warning: TriangleAlert,
	};

	let color = $derived(colors[type]);
	let Icon = $derived(Icons[type]);

	let msg = $state<SvelteComponent<ToastProps>>();
	const title = $derived(((msg as any)?.title as string) ?? "");

	// intentionally unused. this is so tailwind can generate the css for these colours as it doesn't detect if it's dynamically loaded
	// this would lead to the colours not being generated in the final css file by tailwind
	const colourVariants = [
		"border-accent-base-alt",
		"border-accent-red-alt",
		"border-accent-purple-alt",
		"border-accent-blue-alt",
	];
</script>

<div
	class="flex flex-col max-w-[100%] md:max-w-md p-4 gap-2 bg-accent-{color} border-accent-{color}-alt border-s-4 rounded-lg shadow-md"
	in:fly={{
		duration: durations.enter,
		easing: quintOut,
		x: 0,
		y: 100,
	}}
	out:fade={{
		duration: durations.exit,
		easing: quintOut,
	}}
>
	<div class="flex flex-row items-center justify-between w-full gap-4">
		<div class="flex items-center gap-2">
			<Icon
				class="w-6 h-6 text-black flex-shrink-0"
				size="24"
				stroke="2"
				fill="none"
			/>
			<p
				class={clsx("text-black whitespace-pre-wrap", {
					"font-normal": !title,
				})}
			>
				{title || message}
			</p>
		</div>
		<button
			class="text-gray-600 hover:text-black flex-shrink-0 min-w-11 min-h-11 flex items-center justify-center rounded focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
			onclick={() => ToastManager.remove(id)}
			aria-label={aria_close()}
		>
			<XIcon size="16" />
		</button>
	</div>
	{#if typeof message !== "string"}
		{@const MessageComponent = message}
		<div class="font-normal">
			<MessageComponent
				bind:this={msg}
				{durations}
				{id}
				{message}
				{type}
				{additional}
			/>
		</div>
	{/if}
</div>
