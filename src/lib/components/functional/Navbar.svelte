<script lang="ts">
	import { onMount, type SvelteComponentTyped } from "svelte";
	import Panel from "../visual/Panel.svelte";
	import Logo from "../visual/svg/Logo.svelte";
	import clsx from "clsx";
	import { page } from "$app/stores";
	import { MoonIcon, SunIcon } from "lucide-svelte";
	import { theme } from "$lib/store/index.svelte";

	type Props = {
		items: {
			name: string;
			url: string;
			activeMatch: (pathname: string) => boolean;
			icon: any;
		}[];
	};

	let { items }: Props = $props();
</script>

<Panel class="w-fit h-20 flex items-center gap-3">
	<div
		class="w-32 h-full bg-accent rounded-xl flex items-center justify-center"
	>
		<div class="h-5 w-full">
			<Logo />
		</div>
	</div>
	{#each items as item (item.url)}
		{@const Icon = item.icon}
		<a
			href={item.url}
			aria-label={item.name}
			class={clsx(
				"w-32 h-full rounded-xl flex items-center justify-center gap-3",
				{
					"bg-panel-accented": item.activeMatch($page.url.pathname),
				},
			)}
		>
			<Icon />
			<p>{item.name}</p>
		</a>
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
