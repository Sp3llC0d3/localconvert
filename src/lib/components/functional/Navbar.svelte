<script lang="ts">
	import Panel from "../visual/Panel.svelte";
	import Logo from "../visual/svg/Logo.svelte";
	import clsx from "clsx";
	import { page } from "$app/stores";
	import { MoonIcon, SunIcon } from "lucide-svelte";
	import { theme } from "$lib/store/index.svelte";
	import { blur, duration } from "$lib/animation";
	import { quintOut } from "svelte/easing";

	type Props = {
		items: {
			name: string;
			url: string;
			activeMatch: (pathname: string) => boolean;
			icon: any;
			badge?: number;
		}[];
	};

	let { items }: Props = $props();
</script>

{#snippet link(item: (typeof items)[0])}
	{@const Icon = item.icon}
	<a
		href={item.url}
		aria-label={item.name}
		class={clsx(
			"w-32 h-full rounded-xl flex items-center justify-center gap-3 overflow-hidden",
			{
				"bg-panel-accented": item.activeMatch($page.url.pathname),
			},
		)}
	>
		<div class="grid grid-rows-1 grid-cols-1">
			{#key item.name}
				<div
					class="w-full row-start-1 col-start-1 h-full flex items-center justify-center gap-3"
					in:blur={{
						blurMultiplier: 6,
						duration,
						easing: quintOut,
						y: {
							start: -48,
							end: 0,
						},
					}}
					out:blur={{
						blurMultiplier: 6,
						duration,
						easing: quintOut,
						y: {
							start: 0,
							end: 48,
						},
					}}
				>
					<div class="relative">
						<Icon />
						{#if item.badge}
							<div
								class="absolute -top-1 font-display -right-1 w-fit px-1.5 h-4 rounded-full bg-badge text-on-badge flex items-center justify-center font-medium"
								style="font-size: 0.7rem;"
								transition:blur={{
									blurMultiplier: 4,
									duration,
									easing: quintOut,
									scale: {
										start: 0.5,
										end: 1,
									},
								}}
							>
								{item.badge}
							</div>
						{/if}
					</div>
					<p class=" font-medium">
						{item.name}
					</p>
				</div>
			{/key}
		</div>
	</a>
{/snippet}

<Panel class="w-fit h-20 flex items-center gap-3">
	<div
		class="w-32 h-full bg-accent rounded-xl flex items-center justify-center"
	>
		<div class="h-5 w-full">
			<Logo />
		</div>
	</div>
	{#each items as item (item.url)}
		{@render link(item)}
	{/each}
	<div class="w-0.5 bg-separator h-full"></div>
	<button
		onclick={theme.toggle}
		class="w-14 h-full flex items-center justify-center"
	>
		<SunIcon class="dynadark:hidden block" />
		<MoonIcon class="dynadark:block hidden" />
	</button>
</Panel>
