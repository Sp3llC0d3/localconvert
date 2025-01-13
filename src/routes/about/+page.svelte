<script lang="ts">
	import { error } from "$lib/logger";
	import * as About from "$lib/sections/about";
	import { InfoIcon } from "lucide-svelte";
	import { onMount } from "svelte";

	interface Donator {
		name: string;
		amount?: string | number;
		avatar: string;
	}

	interface Contributor {
		name: string;
		github: string;
		avatar: string;
		role?: string;
	}

	// const donors: Donator[] = [];

	const mainContribs: Contributor[] = [
		{
			name: "nullptr",
			github: "https://github.com/not-nullptr",
			role: "Lead developer; conversion backend, UI implementation",
			avatar: "https://avatars.githubusercontent.com/u/62841684?v=4",
		},
		{
			name: "Realmy",
			github: "https://github.com/RealmyTheMan",
			role: "Lead designer; logo and branding, user interface design",
			avatar: "https://avatars.githubusercontent.com/u/163438634?v=4",
		},
		{
			name: "JovannMC",
			github: "https://github.com/JovannMC",
			role: "Developer; UI implementation",
			avatar: "https://avatars.githubusercontent.com/u/45893380?v=4",
		},
	];

	let ghContribs: Contributor[] = [];

	onMount(async () => {
		// Fetch GitHub contributors
		// TODO: cache it, so we don't have to fetch it every time the page is loaded
		try {
			const response = await fetch(
				"https://api.github.com/repos/not-nullptr/VERT/contributors",
			);
			if (!response.ok) {
				throw new Error(`HTTP error, status: ${response.status}`);
			}
			const allContribs = await response.json();

			// Filter out main contributors
			const mainContribNames = mainContribs.map((contrib) =>
				contrib.github.split("/").pop(),
			);
			ghContribs = allContribs
				.filter(
					(contrib: { login: string }) =>
						!mainContribNames.includes(contrib.login),
				)
				.map(
					(contrib: {
						login: string;
						avatar_url: string;
						html_url: string;
					}) => ({
						name: contrib.login,
						avatar: contrib.avatar_url,
						github: contrib.html_url,
					}),
				);
		} catch (e) {
			error(["general"], `Error fetching GitHub contributors: ${e}`);
		}
	});
</script>

<div class="flex flex-col h-full items-center">
	<h1 class="hidden md:block text-[40px] tracking-tight leading-[72px] mb-6">
		<InfoIcon size="40" class="inline-block -mt-2 mr-2" />
		About
	</h1>

	<div
		class="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 p-4 md:px-4 md:py-0"
	>
		<!-- Why VERT? & Credits -->
		<div class="flex flex-col gap-4 flex-1">
			<About.Why />
		</div>

		<!-- Resources & Donate to VERT -->
		<div class="flex flex-col gap-4 flex-1">
			<About.Resources />
			<About.Credits {mainContribs} {ghContribs} />
			<!-- <About.Donate /> -->
		</div>
	</div>
</div>
