<script lang="ts">
	import { privacy_title, privacy_summary_title, privacy_summary_description, privacy_conversions_title, privacy_conversions_description, privacy_donations_title, privacy_donations_description, privacy_conversion_errors_title, privacy_conversion_errors_description, privacy_conversion_errors_list_job_id, privacy_conversion_errors_list_format_from, privacy_conversion_errors_list_format_to, privacy_conversion_errors_list_stderr, privacy_conversion_errors_list_video, privacy_conversion_errors_footer, privacy_analytics_title, privacy_analytics_description, privacy_local_storage_title, privacy_local_storage_description, privacy_contact_title, privacy_contact_description, privacy_last_updated } from "$lib/paraglide/messages/_barrel.js";
	import { link } from "$lib/store/index.svelte";
	import { sanitize } from "$lib/util/sanitize";
	import { ShieldCheckIcon } from "lucide-svelte";
</script>

<svelte:head>
	<title>{privacy_title()} — LocalConvert</title>
	<meta name="description" content="LocalConvert is 100% private. Your files never leave your device — all processing happens in your browser. No uploads, no tracking, no accounts." />
	<link rel="canonical" href="https://localconvert.app/privacy/" />
</svelte:head>

<div class="flex flex-col h-full items-center">
	<h1 class="text-2xl md:text-[40px] tracking-tight md:leading-[72px] leading-tight mb-4 md:mb-6">
		<ShieldCheckIcon size="40" class="inline-block -mt-2 mr-2" />
		{privacy_title()}
	</h1>

	<div
		class="w-full max-w-4xl flex flex-col gap-4 p-4 md:px-4 md:py-0"
	>
		<div class="bg-panel rounded-2xl p-6 shadow-panel text-lg font-normal">
			<h2 class="text-2xl mb-3">{privacy_summary_title()}</h2>
			<p class="mb-4">
				{@html sanitize(
					link(
						["vert_link"],
						privacy_summary_description(),
						["https://github.com/VERT-sh/VERT"],
						[true],
					),
				)}
			</p>

			<h2 class="text-2xl mb-3">{privacy_conversions_title()}</h2>
			<p class="mb-4">
				{@html sanitize(privacy_conversions_description())}
			</p>

			<h2 class="text-2xl mb-3">{privacy_donations_title()}</h2>
			<p class="mb-4">
				{@html sanitize(
					link(
						["about_link", "stripe_link"],
						privacy_donations_description(),
						["/about/", "https://stripe.com/docs/disputes/prevention/advanced-fraud-detection"],
						[false, true],
					),
				)}
			</p>

			<h2 class="text-2xl mb-3">
				{privacy_conversion_errors_title()}
			</h2>
			<div class="mb-4">
				{privacy_conversion_errors_description()}
				<ul class="list-disc list-inside mt-2 mb-2">
					<li>{privacy_conversion_errors_list_job_id()}</li>
					<li>{privacy_conversion_errors_list_format_from()}</li>
					<li>{privacy_conversion_errors_list_format_to()}</li>
					<li>{privacy_conversion_errors_list_stderr()}</li>
					<li>{privacy_conversion_errors_list_video()}</li>
				</ul>
				{privacy_conversion_errors_footer()}
			</div>

			<h3 class="text-xl mt-4 mb-2">{privacy_analytics_title()}</h3>
			<p class="mb-4">
				{@html sanitize(
					link(
						["settings_link", "plausible_link"],
						privacy_analytics_description(),
						[
							"/settings",
							"https://www.cloudflare.com/web-analytics/",
						],
						[false, true],
					),
				)}
			</p>

			<h3 class="text-xl mt-4 mb-2">
				{privacy_local_storage_title()}
			</h3>
			<p class="mb-4">
				{@html sanitize(
					link(
						["settings_link"],
						privacy_local_storage_description(),
						["/settings/"],
						[false],
					),
				)}
			</p>

			<h3 class="text-xl mt-4 mb-2">{privacy_contact_title()}</h3>
			<p class="mb-0">
				{@html sanitize(
					link(
						["email_link"],
						privacy_contact_description(),
						["mailto:hello@localconvert.app"],
						[false],
					),
				)}
			</p>

			<p class="text-sm text-muted mt-6">{privacy_last_updated()}</p>
		</div>
	</div>
</div>
