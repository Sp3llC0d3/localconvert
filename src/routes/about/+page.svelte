<script lang="ts">
	import Panel from "$lib/components/visual/Panel.svelte";
	import {
		CalendarHeartIcon,
		GithubIcon,
		HandCoinsIcon,
		HeartHandshakeIcon,
		HeartIcon,
		InfoIcon,
		LinkIcon,
		MessageCircleMoreIcon,
		MessageCircleQuestionIcon,
		WalletIcon,
	} from "lucide-svelte";

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

{#snippet donor(name: string, amount: number | string, avatar: string)}
	<div class="flex items-center bg-button rounded-full overflow-hidden">
		<img
			src={avatar}
			alt={name}
			title={name}
			class="w-9 h-9 rounded-full"
		/>
		<p class="text-sm text-black dynadark:text-white px-4">${amount}</p>
	</div>
{/snippet}

{#snippet contributor(name: string, role: string, avatar: string)}
	<div class="flex items-center gap-4">
		<img
			src={avatar}
			alt={name}
			title={name}
			class="w-14 h-14 rounded-full"
		/>
		<div class="flex flex-col gap-1">
			<p class="text-xl font-semibold">{name}</p>
			<p class="text-sm font-normal text-muted">{role}</p>
		</div>
	</div>
{/snippet}

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
			<!-- Why VERT? -->
			<Panel class="flex flex-col gap-3 p-6">
				<h2 class="text-2xl font-bold">
					<MessageCircleQuestionIcon
						size="40"
						class="inline-block -mt-1 mr-2 bg-accent p-1.5 rounded-full"
						color="black"
					/>
					Why VERT?
				</h2>
				<p class="text-lg font-normal">
					<b>File converters have always disappointed us.</b> They're
					ugly, riddled with ads, and most importantly; slow. We
					decided to solve this problem once and for all by making an
					alternative that solves all those problems, and then some.<br
					/>
					<br />
					All your files are converted completely on—device, which means
					that there's no delay between sending and receiving the file
					from a server, and that we never get to snoop on the files you
					convert.
				</p>
			</Panel>

			<!-- Credits -->
			<Panel class="flex flex-col gap-8 p-6">
				<h2 class="text-2xl font-bold">
					<HeartHandshakeIcon
						size="40"
						class="inline-block -mt-1 mr-2 bg-blue-300 p-1.5 rounded-full"
						color="black"
					/>
					Credits
				</h2>

				<!-- Main Contributors -->
				<div class="flex flex-col gap-4">
					<div class="flex flex-row flex-wrap gap-2">
						{#each mainContribs as contrib}
							{@const { name, role, avatar } = contrib}
							{@render contributor(name, role, avatar)}
						{/each}
					</div>
				</div>

				<!-- GitHub Contributors -->
				<div class="flex flex-col gap-4">
					<div class="flex flex-col gap-1">
						<h2 class="text-base font-bold">GitHub Contributors</h2>
						<p class="text-sm text-muted font-normal">
							Big thanks to all these people for helping out!
							<a
								class="text-blue-500 font-normal"
								href="https://github.com/not-nullptr/VERT"
								target="_blank"
								rel="noopener noreferrer"
							>
								Want to help too?
							</a>
						</p>
					</div>
					<div class="flex flex-row flex-wrap gap-2">
						{#each ghContribs as contrib}
							{@const { name, avatar } = contrib}
							<img
								src={avatar}
								alt={name}
								title={name}
								class="w-10 h-10 rounded-full"
							/>
						{/each}
					</div>
				</div>
			</Panel>
		</div>

		<!-- Resources & Donate to VERT -->
		<div class="flex flex-col gap-4 flex-1">
			<!-- Resources -->
			<Panel class="flex flex-col gap-4 p-6">
				<h2 class="text-2xl font-bold">
					<LinkIcon
						size="40"
						class="inline-block -mt-1 mr-2 bg-violet-400 bg- p-1.5 rounded-full"
						color="black"
					/>
					Resources
				</h2>
				<div class="flex gap-3">
					<a
						href="https://discord.gg/kqevGxYPak"
						target="_blank"
						rel="noopener noreferrer"
						class="flex-1 gap-2 p-4 rounded-full bg-button text-black dynadark:text-white flex items-center justify-center"
					>
						<MessageCircleMoreIcon
							size="24"
							class="inline-block mr-2"
						/>
						Discord Server
					</a>
					<a
						href="https://github.com/not-nullptr/VERT"
						target="_blank"
						rel="noopener noreferrer"
						class="flex-1 gap-2 p-4 rounded-full bg-button text-black dynadark:text-white flex items-center justify-center"
					>
						<GithubIcon size="24" class="inline-block mr-2" />
						Source Code
					</a>
				</div>
			</Panel>

			<!-- Donate to VERT -->
			<Panel class="flex flex-col gap-8 p-6">
				<div class="flex flex-col gap-3">
					<h2 class="text-2xl font-bold">
						<HeartIcon
							size="40"
							class="inline-block -mt-1 mr-2 bg-rose-300 p-1.5 rounded-full"
							color="black"
						/>
						Donate to VERT
					</h2>
					<p class="text-base font-normal">
						With your support, we can keep maintaining and improving
						VERT.
					</p>
				</div>

				<div class="flex flex-col gap-3 w-full">
					<div class="flex gap-2 w-full">
						<button
							class="flex-1 p-4 rounded-lg bg-rose-300 text-black flex items-center justify-center"
						>
							<HandCoinsIcon
								size="24"
								class="inline-block mr-2"
							/>
							One-time
						</button>

						<button
							class="flex-1 p-4 rounded-lg bg-button text-black dynadark:text-white flex items-center justify-center"
						>
							<CalendarHeartIcon
								size="24"
								class="inline-block mr-2"
							/>
							Monthly
						</button>
					</div>
					<div class="flex gap-3 w-full">
						<button
							class="bg-rose-300 text-black p-4 rounded-lg flex-1"
							>$1 USD</button
						>
						<button
							class="bg-button text-black dynadark:text-white p-4 rounded-lg flex-1"
							>$5 USD</button
						>
						<button
							class="bg-button text-black dynadark:text-white p-4 rounded-lg flex-1"
							>$10 USD</button
						>
						<div class="relative flex items-center flex-[2]">
							<span class="absolute left-3 text-gray-500">$</span>
							<input
								type="number"
								class="pl-8 pr-2 rounded-lg border border-gray-300 dynadark:border-gray-500 w-full h-full bg-button text-black dynadark:text-white"
								placeholder="Custom"
							/>
						</div>
					</div>
				</div>

				<div class="flex flex-row justify-center w-full">
					<p class="text-muted text-sm flex-[4] flex items-center">
						Payments and subscription management <br /> are handled through
						Liberapay
					</p>

					<button
						class="flex-1 p-3 rounded-3xl bg-rose-300 text-black flex items-center justify-center"
					>
						<WalletIcon size="24" class="inline-block mr-2" />
						Pay Now
					</button>
				</div>

				<!-- top donors -->
				<div class="flex flex-col gap-4">
					<div class="flex flex-col gap-1">
						<h2 class="text-base font-bold">Our top donors</h2>
						<p class="text-base text-muted font-normal">
							People like these fuel the things we love to do.
							Thank you so much!
						</p>
					</div>

					<div class="flex flex-row flex-wrap gap-2">
						{#each donors as dono}
							{@const { name, amount, avatar } = dono}
							{@render donor(name, amount, avatar)}
						{/each}
					</div>
				</div>
			</Panel>
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
