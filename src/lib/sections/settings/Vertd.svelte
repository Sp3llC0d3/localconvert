<script lang="ts">
	import Panel from "$lib/components/visual/Panel.svelte";
	import { GITHUB_URL_VERTD } from "$lib/consts";
	import { ServerIcon } from "lucide-svelte";
	import type { Settings } from "./index.svelte";
	import clsx from "clsx";
	import Dropdown from "$lib/components/functional/Dropdown.svelte";

	let vertdCommit = $state<string | null>(null);
	let abortController: AbortController | null = null;

	const { settings }: { settings: Settings } = $props();

	$effect(() => {
		if (settings.settings.vertdURL) {
			if (abortController) abortController.abort();
			abortController = new AbortController();
			const { signal } = abortController;

			vertdCommit = "loading";
			fetch(`${settings.settings.vertdURL}/api/version`, { signal })
				.then((res) => {
					if (!res.ok) throw new Error("bad response");
					return res.json();
				})
				.then((data) => {
					vertdCommit = data.data;
				})
				.catch((err) => {
					if (err.name !== "AbortError") vertdCommit = null;
				});
		} else {
			if (abortController) abortController.abort();
			vertdCommit = null;
		}
	});
</script>

<Panel class="flex flex-col gap-8 p-6">
	<div class="flex flex-col gap-3">
		<h2 class="text-2xl font-bold">
			<ServerIcon
				size="40"
				class="inline-block -mt-1 mr-2 bg-accent-red p-2 rounded-full overflow-visible"
				color="black"
			/>
			Converting Video
		</h2>
		<p
			class={clsx("text-sm font-normal", {
				"text-failure": vertdCommit === null,
				"text-green-700 dynadark:text-green-300": vertdCommit !== null,
				"!text-muted": vertdCommit === "loading",
			})}
		>
			status: {vertdCommit
				? vertdCommit === "loading"
					? "loading..."
					: `available, commit id ${vertdCommit}`
				: "unavailable (is the url right?)"}
		</p>
		<div class="flex flex-col gap-8">
			<div class="flex flex-col gap-4">
				<p class="text-sm text-muted font-normal">
					The <code>vertd</code> project is a server wrapper for FFmpeg.
					This allows you to convert videos through the convenience of
					VERT's web interface, while still being able to harness the power
					of your GPU to do it as quickly as possible.
				</p>
				<p class="text-sm text-muted font-normal">
					We currently don't provide an hosted instance due to the
					upkeep costs. However, it's quite easy to host one on your
					own PC or server if you know what you're doing. You can
					download the server binaries <a
						href={GITHUB_URL_VERTD}
						target="_blank">here</a
					>. The process of setting this up will become easier in the
					future, so stay tuned!
				</p>
				<div class="flex flex-col gap-2">
					<p class="text-base font-bold">Instance URL</p>
					<input
						type="text"
						placeholder="Example: http://localhost:24153"
						bind:value={settings.settings.vertdURL}
					/>
				</div>
				<div class="flex flex-col gap-4">
					<div class="flex flex-col gap-2">
						<p class="text-base font-bold">Conversion speed</p>
						<p class="text-sm text-muted font-normal">
							This describes the tradeoff between speed and
							quality. Faster speeds will result in lower quality,
							but will get the job done quicker.
						</p>
					</div>
					<!-- <select
						bind:value={settings.settings.vertdSpeed}
						class="w-1/2 dropdown"
					>
						<option value="verySlow">Very Slow</option>
						<option value="slower">Slower</option>
						<option value="slow">Slow</option>
						<option value="medium">Medium</option>
						<option value="fast">Fast</option>
						<option value="ultraFast">Ultra Fast</option>
					</select> -->
					<Dropdown
						options={[
							"Very Slow",
							"Slower",
							"Slow",
							"Medium",
							"Fast",
							"Ultra Fast",
						]}
						settingsStyle
						onselect={(selected) => {
							switch (selected) {
								case "Very Slow":
									settings.settings.vertdSpeed = "verySlow";
									break;
								case "Slower":
									settings.settings.vertdSpeed = "slower";
									break;
								case "Slow":
									settings.settings.vertdSpeed = "slow";
									break;
								case "Medium":
									settings.settings.vertdSpeed = "medium";
									break;
								case "Fast":
									settings.settings.vertdSpeed = "fast";
									break;
								case "Ultra Fast":
									settings.settings.vertdSpeed = "ultraFast";
									break;
							}
						}}
					/>
				</div>
			</div>
		</div>
	</div>
</Panel>
