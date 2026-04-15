<script lang="ts">
	import Panel from "$lib/components/visual/Panel.svelte";
	import { CONTACT_EMAIL, GITHUB_URL } from "$lib/util/consts";
	import { effects } from "$lib/store/index.svelte";
	import {
		GithubIcon,
		LinkIcon,
		MailIcon,
		ShieldIcon,
	} from "lucide-svelte";
	import { about_resources_title, about_resources_source, about_resources_email, footer_privacy_policy } from "$lib/paraglide/messages/_barrel.js";
	import { localizeHref } from "$lib/paraglide/runtime";
</script>

<Panel class="flex flex-col gap-4 p-6">
	<h2 class="text-2xl font-bold flex items-center">
		<div
			class="rounded-full bg-accent p-2 inline-block mr-3 w-10 h-10 text-on-accent"
		>
			<LinkIcon />
		</div>
		{about_resources_title()}
	</h2>
	<div class="flex flex-wrap gap-3">
		<a
			href={GITHUB_URL}
			target="_blank"
			rel="noopener noreferrer"
			class="btn {$effects
				? ''
				: '!scale-100'} flex-1 gap-2 p-4 rounded-full bg-button text-black dynadark:text-white flex items-center justify-center"
		>
			<GithubIcon size="20" class="inline-block mr-2" />
			{about_resources_source()}
		</a>
		<a
			href="mailto:{CONTACT_EMAIL}"
			target="_blank"
			rel="noopener noreferrer"
			class="btn {$effects
				? ''
				: '!scale-100'} flex-1 gap-2 p-4 rounded-full bg-button text-black dynadark:text-white flex items-center justify-center"
		>
			<MailIcon size="20" class="inline-block mr-2" />
			{about_resources_email()}
		</a>
		<a
			href={localizeHref("/privacy/")}
			class="btn {$effects
				? ''
				: '!scale-100'} flex-1 gap-2 p-4 rounded-full bg-button text-black dynadark:text-white flex items-center justify-center"
		>
			<ShieldIcon size="20" class="inline-block mr-2" />
			{footer_privacy_policy()}
		</a>
	</div>
</Panel>
