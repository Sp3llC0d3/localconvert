<script lang="ts">
	import Uploader from '$lib/components/functional/Uploader.svelte';
	import { ShieldCheck, Zap, Ban, Code } from 'lucide-svelte';
	import {
		meta_descriptions_format_pair,
		meta_descriptions_format_pair_video_audio,
		navbar_home,
		navbar_convert,
		format_pair_headline,
		format_pair_description_default,
		format_pair_description_video_audio,
		format_pair_type_badge,
		format_pair_how_to_heading,
		format_pair_step_select_title,
		format_pair_step_select_body,
		format_pair_step_convert_title,
		format_pair_step_convert_body,
		format_pair_step_save_title,
		format_pair_step_save_body,
		format_pair_faq_heading,
		format_pair_faq_q_free,
		format_pair_faq_a_free,
		format_pair_faq_q_safe,
		format_pair_faq_a_safe,
		format_pair_faq_q_time,
		format_pair_faq_a_time,
		format_pair_faq_q_difference,
		format_pair_faq_a_difference,
		feature_no_uploads,
		feature_private,
		feature_gpu,
		feature_open_source,
	} from '$lib/paraglide/messages/_barrel.js';
	import * as M from '$lib/paraglide/messages/_barrel.js';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { data } = $props();
	const from = $derived(data.from);
	const to = $derived(data.to);
	const fromMeta = $derived(data.fromMeta);
	const toMeta = $derived(data.toMeta);

	const fromLabel = $derived(fromMeta.label);
	const toLabel = $derived(toMeta.label);
	const FROM = $derived(from.toUpperCase());
	const TO = $derived(to.toUpperCase());

	// Per-format descriptive blurbs ("a widely-used lossy image format, ideal for photos")
	// — keyed by format slug; falls back to empty string if a format has no entry.
	const formatDesc = (fmt: string): string => {
		const fn = (M as Record<string, undefined | (() => string)>)[`format_desc_${fmt}`];
		return fn ? fn() : '';
	};
	const fromDesc = $derived(formatDesc(from));
	const toDesc = $derived(formatDesc(to));

	const canonicalUrl = $derived(`https://localconvert.app/${from}-to-${to}/`);
	const isVideoToAudio = $derived(fromMeta.type === 'video' && toMeta.type === 'audio');

	const headline = $derived(format_pair_headline({ fromLabel, toLabel }));
	const description = $derived(
		isVideoToAudio
			? format_pair_description_video_audio({ fromLabel, toLabel })
			: format_pair_description_default({ fromLabel, toLabel, fromDesc, toDesc })
	);
	const i18nMetaDesc = $derived(
		isVideoToAudio
			? meta_descriptions_format_pair_video_audio({ from: fromLabel, to: toLabel })
			: meta_descriptions_format_pair({ from: fromLabel, to: toLabel, FROM, TO })
	);

	const features = $derived([
		{ icon: Ban, label: feature_no_uploads() },
		{ icon: ShieldCheck, label: feature_private() },
		{ icon: Zap, label: feature_gpu() },
		{ icon: Code, label: feature_open_source() },
	]);

	// JSON-LD structured data — re-evaluated on locale change via $derived
	const howToSchema = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'HowTo',
		name: format_pair_how_to_heading({ fromLabel, toLabel }),
		description,
		step: [
			{
				'@type': 'HowToStep',
				name: format_pair_step_select_title({ FROM }),
				text: format_pair_step_select_body({ FROM }),
			},
			{
				'@type': 'HowToStep',
				name: format_pair_step_convert_title({ TO }),
				text: format_pair_step_convert_body({ toLabel }),
			},
			{
				'@type': 'HowToStep',
				name: format_pair_step_save_title(),
				text: format_pair_step_save_body({ TO }),
			},
		],
		tool: [{ '@type': 'HowToTool', name: 'LocalConvert' }],
		totalTime: 'PT1M',
	}));

	const faqSchema = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: format_pair_faq_q_free({ fromLabel, toLabel }),
				acceptedAnswer: { '@type': 'Answer', text: format_pair_faq_a_free() },
			},
			{
				'@type': 'Question',
				name: format_pair_faq_q_safe({ FROM }),
				acceptedAnswer: { '@type': 'Answer', text: format_pair_faq_a_safe({ FROM, TO }) },
			},
			{
				'@type': 'Question',
				name: format_pair_faq_q_time({ fromLabel, toLabel }),
				acceptedAnswer: { '@type': 'Answer', text: format_pair_faq_a_time() },
			},
			{
				'@type': 'Question',
				name: format_pair_faq_q_difference({ fromLabel, toLabel }),
				acceptedAnswer: { '@type': 'Answer', text: format_pair_faq_a_difference({ fromLabel, toLabel, fromDesc, toDesc }) },
			},
		],
	}));

	const steps = $derived([
		{ n: '1', title: format_pair_step_select_title({ FROM }), body: format_pair_step_select_body({ FROM }) },
		{ n: '2', title: format_pair_step_convert_title({ TO }), body: format_pair_step_convert_body({ toLabel }) },
		{ n: '3', title: format_pair_step_save_title(), body: format_pair_step_save_body({ TO }) },
	]);

	const faqs = $derived([
		{ q: format_pair_faq_q_free({ fromLabel, toLabel }), a: format_pair_faq_a_free() },
		{ q: format_pair_faq_q_safe({ FROM }), a: format_pair_faq_a_safe({ FROM, TO }) },
		{ q: format_pair_faq_q_time({ fromLabel, toLabel }), a: format_pair_faq_a_time() },
		{ q: format_pair_faq_q_difference({ fromLabel, toLabel }), a: format_pair_faq_a_difference({ fromLabel, toLabel, fromDesc, toDesc }) },
	]);
</script>

<svelte:head>
	<title>{headline}</title>
	<meta name="description" content={i18nMetaDesc} />
	<meta property="og:title" content={headline} />
	<meta property="og:description" content={i18nMetaDesc} />
	<link rel="canonical" href={canonicalUrl} />
	<!-- JSON-LD -->
	{@html `<script type="application/ld+json">${howToSchema}</script>`}
	{@html `<script type="application/ld+json">${faqSchema}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":navbar_home(),"item":"https://localconvert.app"+localizeHref("/")},{"@type":"ListItem","position":2,"name":navbar_convert(),"item":"https://localconvert.app"+localizeHref("/convert/")},{"@type":"ListItem","position":3,"name":`${fromLabel} → ${toLabel}`}]})}</script>`}
</svelte:head>

<!-- Hero -->
<section class="converter-hero w-full">
	<div class="max-w-4xl mx-auto px-6 md:px-8 pt-10 md:pt-16 pb-12 md:pb-20 flex flex-col items-center">
		<!-- breadcrumb badge -->
		<span class="type-badge mb-5">{format_pair_type_badge({ fromLabel, toLabel })}</span>

		<h1 class="text-3xl md:text-5xl text-center font-display tracking-tight leading-tight mb-4 max-w-2xl">
			{headline}
		</h1>
		<p class="text-base md:text-lg text-center text-muted max-w-xl mb-8">
			{description}
		</p>

		<div class="flex flex-wrap justify-center gap-2 mb-8">
			{#each features as f}
				{@const Icon = f.icon}
				<span class="pill"><Icon size="13" />{f.label}</span>
			{/each}
		</div>

		<div class="w-full max-w-lg h-52">
			<Uploader class="w-full h-full" redirectSuffix="?to={to}" />
		</div>
	</div>
</section>

<!-- How to convert -->
<section class="max-w-4xl mx-auto px-6 md:px-8 py-8 w-full">
	<h2 class="text-2xl md:text-3xl font-display text-center mb-8">
		{format_pair_how_to_heading({ fromLabel, toLabel })}
	</h2>
	<ol class="grid grid-cols-1 md:grid-cols-3 gap-4">
		{#each steps as step}
			<li class="step-card">
				<span class="step-num">{step.n}</span>
				<h3 class="font-semibold text-base mb-1">{step.title}</h3>
				<p class="text-sm text-muted">{step.body}</p>
			</li>
		{/each}
	</ol>
</section>

<!-- FAQ -->
<section class="max-w-4xl mx-auto px-6 md:px-8 py-8 w-full">
	<h2 class="text-2xl md:text-3xl font-display text-center mb-6">
		{format_pair_faq_heading({ fromLabel, toLabel })}
	</h2>
	<div class="flex flex-col gap-3 max-w-2xl mx-auto">
		{#each faqs as faq}
			<details class="faq-item">
				<summary class="faq-q">
					<span>{faq.q}</span>
					<svg class="faq-chevron" width="18" height="18" viewBox="0 0 20 20" fill="none">
						<path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</summary>
				<p class="faq-a">{faq.a}</p>
			</details>
		{/each}
	</div>
</section>

<style lang="postcss">
	.converter-hero {
		background: linear-gradient(to bottom, var(--bg-panel) 0%, var(--bg) 100%);
	}
	.type-badge {
		@apply text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full;
		background: var(--bg-badge);
		color: var(--fg-on-badge);
	}
	.pill {
		@apply flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium;
		background: var(--bg-badge);
		color: var(--fg-on-badge);
	}
	.step-card {
		@apply bg-panel rounded-2xl p-5 shadow-panel flex flex-col gap-1 relative;
	}
	.step-num {
		@apply w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold mb-2;
		background: var(--bg-badge);
		color: var(--fg-on-badge);
	}
	.faq-item { @apply bg-panel rounded-2xl shadow-panel overflow-hidden; }
	.faq-q {
		@apply flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none list-none font-semibold text-sm;
	}
	.faq-q::-webkit-details-marker { display: none; }
	.faq-chevron { @apply flex-shrink-0 transition-transform duration-200; color: var(--fg-muted); }
	details[open] .faq-chevron { transform: rotate(180deg); }
	.faq-a { @apply px-5 pb-4 text-sm leading-relaxed; color: var(--fg-muted); }
</style>
