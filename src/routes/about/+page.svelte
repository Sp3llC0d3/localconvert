<script lang="ts">
	import * as About from "$lib/sections/about";
	import { InfoIcon } from "lucide-svelte";

	const donors = [
		{
			name: "John Doe",
			amount: "5",
			avatar: "https://avatars.githubusercontent.com/u/45893380?v=4",
		},
		{
			name: "John Smith",
			amount: "1",
			avatar: "https://avatars.githubusercontent.com/u/62841684?v=4",
		},
		{
			name: "Jane Doe",
			amount: "10",
			avatar: "https://avatars.githubusercontent.com/u/163438634?v=4",
		},
		{
			name: "John Smith",
			amount: "1",
			avatar: "https://avatars.githubusercontent.com/u/62841684?v=4",
		},
		{
			name: "John Doe",
			amount: "5",
			avatar: "https://avatars.githubusercontent.com/u/45893380?v=4",
		},
		{
			name: "John Smith",
			amount: "1",
			avatar: "https://avatars.githubusercontent.com/u/62841684?v=4",
		},
		{
			name: "Jane Doe",
			amount: "10",
			avatar: "https://avatars.githubusercontent.com/u/163438634?v=4",
		},
		{
			name: "John Smith",
			amount: "1",
			avatar: "https://avatars.githubusercontent.com/u/62841684?v=4",
		},
	];

	const mainContribs = [
		{
			name: "nullptr",
			role: "Lead developer; conversion backend, UI implementation",
			avatar: "https://avatars.githubusercontent.com/u/62841684?v=4",
		},
		{
			name: "Realmy",
			role: "Lead designer; logo and branding, user interface design",
			avatar: "https://avatars.githubusercontent.com/u/163438634?v=4",
		},
		{
			name: "JovannMC",
			role: "Developer; lorem ipsum, UI implementation",
			avatar: "https://avatars.githubusercontent.com/u/45893380?v=4",
		},
	];

	const ghContribs = [
		{
			name: "John Doe",
			avatar: "https://avatars.githubusercontent.com/u/45893380?v=4",
		},
		{
			name: "John Smith",
			avatar: "https://avatars.githubusercontent.com/u/62841684?v=4",
		},
		{
			name: "Jane Doe",
			avatar: "https://avatars.githubusercontent.com/u/163438634?v=4",
		},
		{
			name: "John Smith",
			avatar: "https://avatars.githubusercontent.com/u/62841684?v=4",
		},
		{
			name: "John Doe",
			avatar: "https://avatars.githubusercontent.com/u/45893380?v=4",
		},
		{
			name: "John Smith",
			avatar: "https://avatars.githubusercontent.com/u/62841684?v=4",
		},
		{
			name: "Jane Doe",
			avatar: "https://avatars.githubusercontent.com/u/163438634?v=4",
		},
		{
			name: "John Smith",
			avatar: "https://avatars.githubusercontent.com/u/62841684?v=4",
		},
	];
</script>

<div class="flex flex-col h-full items-center blur-in">
	<h1
		class="text-3xl tracking-tight leading-[72px] mb-6"
		style:--delay="20ms"
	>
		<InfoIcon size="40" class="inline-block -mt-2 mr-2" />
		About
	</h1>

	<div class="w-full max-w-[1280px] flex flex-row gap-4">
		<!-- Why VERT? & Credits -->
		<div class="flex flex-col gap-4 flex-1">
			<About.Why />
			<About.Credits {mainContribs} {ghContribs} />
		</div>

		<!-- Resources & Donate to VERT -->
		<div class="flex flex-col gap-4 flex-1">
			<About.Resources />
			<About.Donate {donors} />
		</div>
	</div>
</div>

<style>
	@keyframes blur-in {
		0% {
			filter: blur(8px);
			transform: translateY(-8px) scale(0.9);
			opacity: 0;
		}
		100% {
			filter: blur(0);
			transform: translateY(0) scale(1);
			opacity: 1;
		}
	}

	.blur-in {
		animation: blur-in 0.75s var(--transition) var(--delay, 0ms) forwards;
		opacity: 0;
	}
</style>
