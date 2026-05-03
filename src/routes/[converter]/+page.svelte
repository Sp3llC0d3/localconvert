<script lang="ts">
	import Uploader from "$lib/components/functional/Uploader.svelte";
	import { localizeHref } from "$lib/paraglide/runtime";
	import { ShieldCheck, Zap, Ban, Code } from "lucide-svelte";
	import {
		meta_descriptions_converter_jpg, meta_descriptions_converter_png, meta_descriptions_converter_webp,
		meta_descriptions_converter_gif, meta_descriptions_converter_bmp, meta_descriptions_converter_tiff,
		meta_descriptions_converter_svg, meta_descriptions_converter_avif, meta_descriptions_converter_ico,
		meta_descriptions_converter_mp3, meta_descriptions_converter_wav, meta_descriptions_converter_ogg,
		meta_descriptions_converter_flac, meta_descriptions_converter_aac, meta_descriptions_converter_mp4,
		meta_descriptions_converter_webm, meta_descriptions_converter_mkv, meta_descriptions_converter_avi,
		meta_descriptions_converter_mov, meta_descriptions_converter_docx, meta_descriptions_converter_md,
		meta_descriptions_converter_html, meta_descriptions_converter_epub, meta_descriptions_converter_odt,
		meta_descriptions_converter_headline,
		navbar_home, navbar_convert,
		converter_page_type_badge,
		converter_page_how_to_heading,
		converter_page_step_choose_title,
		converter_page_step_choose_body,
		converter_page_step_pick_title,
		converter_page_step_pick_body,
		converter_page_step_save_title,
		converter_page_step_save_body,
		converter_page_supported_inputs_heading,
		converter_page_faq_heading,
		converter_page_faq_q_free,
		converter_page_faq_a_free,
		converter_page_faq_q_safe,
		converter_page_faq_a_safe,
		converter_page_faq_q_inputs,
		converter_page_faq_a_inputs,
		format_type_image,
		format_type_audio,
		format_type_video,
		format_type_doc,
		feature_no_uploads,
		feature_private,
		feature_gpu,
		feature_open_source,
	} from "$lib/paraglide/messages/_barrel.js";

	let { data } = $props();
	const info = $derived(data.info);
	const validFormats = $derived(new Set(data.validFormats));

	const converterDescriptions: Record<string, () => string> = {
		jpg: meta_descriptions_converter_jpg, png: meta_descriptions_converter_png, webp: meta_descriptions_converter_webp,
		gif: meta_descriptions_converter_gif, bmp: meta_descriptions_converter_bmp, tiff: meta_descriptions_converter_tiff,
		svg: meta_descriptions_converter_svg, avif: meta_descriptions_converter_avif, ico: meta_descriptions_converter_ico,
		mp3: meta_descriptions_converter_mp3, wav: meta_descriptions_converter_wav, ogg: meta_descriptions_converter_ogg,
		flac: meta_descriptions_converter_flac, aac: meta_descriptions_converter_aac, mp4: meta_descriptions_converter_mp4,
		webm: meta_descriptions_converter_webm, mkv: meta_descriptions_converter_mkv, avi: meta_descriptions_converter_avi,
		mov: meta_descriptions_converter_mov, docx: meta_descriptions_converter_docx, md: meta_descriptions_converter_md,
		html: meta_descriptions_converter_html, epub: meta_descriptions_converter_epub, odt: meta_descriptions_converter_odt,
	};

	const converterDesc = $derived(converterDescriptions[info.format]?.() ?? "");
	const converterTitle = $derived(meta_descriptions_converter_headline({ format: info.label }));

	// Hero h1: same translated string as <title>; previously sourced from English info.headline.
	const headline = $derived(converterTitle);
	// Hero description: reuse existing translated meta-description key.
	const description = $derived(converterDesc);

	// Localized type badge label ("Image", "Audio", "Video", "Document").
	const typeLabelMap: Record<string, () => string> = {
		image: format_type_image,
		audio: format_type_audio,
		video: format_type_video,
		doc: format_type_doc,
	};
	const typeLabel = $derived(typeLabelMap[info.type]?.() ?? "");

	// "JPG, PNG, WEBP" — top 3 input formats for step body interpolation.
	const topInputs = $derived(info.inputFormats.slice(0, 3).join(", ").toUpperCase());
	// "JPG, PNG, WEBP, ..." — full list for FAQ inputs answer.
	const inputFormats = $derived(info.inputFormats.map((f: string) => f.toUpperCase()).join(", "));

	const features = $derived([
		{ icon: Ban, label: feature_no_uploads() },
		{ icon: ShieldCheck, label: feature_private() },
		{ icon: Zap, label: feature_gpu() },
		{ icon: Code, label: feature_open_source() },
	]);

	const howToSchema = $derived(JSON.stringify({
		"@context": "https://schema.org",
		"@type": "HowTo",
		name: converter_page_how_to_heading({ label: info.label }),
		description,
		step: [
			{
				"@type": "HowToStep",
				name: converter_page_step_choose_title(),
				text: converter_page_step_choose_body({ topInputs }),
			},
			{
				"@type": "HowToStep",
				name: converter_page_step_pick_title({ label: info.label }),
				text: converter_page_step_pick_body({ label: info.label }),
			},
			{
				"@type": "HowToStep",
				name: converter_page_step_save_title(),
				text: converter_page_step_save_body({ label: info.label }),
			},
		],
		tool: [{ "@type": "HowToTool", name: "LocalConvert" }],
		totalTime: "PT1M",
	}));

	const faqSchema = $derived(JSON.stringify({
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: [
			{
				"@type": "Question",
				name: converter_page_faq_q_free({ label: info.label }),
				acceptedAnswer: { "@type": "Answer", text: converter_page_faq_a_free() },
			},
			{
				"@type": "Question",
				name: converter_page_faq_q_safe(),
				acceptedAnswer: { "@type": "Answer", text: converter_page_faq_a_safe() },
			},
			{
				"@type": "Question",
				name: converter_page_faq_q_inputs({ label: info.label }),
				acceptedAnswer: { "@type": "Answer", text: converter_page_faq_a_inputs({ label: info.label, inputFormats }) },
			},
		],
	}));

	const steps = $derived([
		{ n: "1", title: converter_page_step_choose_title(), body: converter_page_step_choose_body({ topInputs }) },
		{ n: "2", title: converter_page_step_pick_title({ label: info.label }), body: converter_page_step_pick_body({ label: info.label }) },
		{ n: "3", title: converter_page_step_save_title(), body: converter_page_step_save_body({ label: info.label }) },
	]);

	const faqs = $derived([
		{ q: converter_page_faq_q_free({ label: info.label }), a: converter_page_faq_a_free() },
		{ q: converter_page_faq_q_safe(), a: converter_page_faq_a_safe() },
		{ q: converter_page_faq_q_inputs({ label: info.label }), a: converter_page_faq_a_inputs({ label: info.label, inputFormats }) },
	]);
</script>

<svelte:head>
	<title>{converterTitle} — LocalConvert</title>
	<meta name="description" content={converterDesc} />
	<meta property="og:title" content="{converterTitle} — LocalConvert" />
	<meta property="og:description" content={converterDesc} />
	<link rel="canonical" href="https://localconvert.app/{info.format}-converter/" />
	{@html `<script type="application/ld+json">${howToSchema}</script>`}
	{@html `<script type="application/ld+json">${faqSchema}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":navbar_home(),"item":"https://localconvert.app"+localizeHref("/")},{"@type":"ListItem","position":2,"name":navbar_convert(),"item":"https://localconvert.app"+localizeHref("/convert/")},{"@type":"ListItem","position":3,"name":converterTitle}]})}</script>`}
</svelte:head>

<!-- Hero -->
<section class="converter-hero w-full">
	<div class="max-w-4xl mx-auto px-6 md:px-8 pt-10 md:pt-16 pb-12 md:pb-20 flex flex-col items-center">
		<span class="type-badge mb-5">{converter_page_type_badge({ typeLabel })}</span>

		<h1 class="text-3xl md:text-5xl text-center font-display tracking-tight leading-tight mb-4 max-w-2xl">
			{headline}
		</h1>
		<p class="text-base md:text-lg text-center text-muted max-w-xl mb-8">
			{description}
		</p>

		<!-- Feature pills -->
		<div class="flex flex-wrap justify-center gap-2 mb-8">
			{#each features as f}
				{@const Icon = f.icon}
				<span class="pill"><Icon size="13" />{f.label}</span>
			{/each}
		</div>

		<!-- Uploader -->
		<div class="w-full max-w-lg h-52">
			<Uploader class="w-full h-full" redirectSuffix="?to={info.format}" />
		</div>
	</div>
</section>

<!-- How to convert -->
<section class="max-w-4xl mx-auto px-6 md:px-8 py-8 w-full">
	<h2 class="text-2xl md:text-3xl font-display text-center mb-8">
		{converter_page_how_to_heading({ label: info.label })}
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

<!-- Supported input formats -->
<section class="max-w-4xl mx-auto px-6 md:px-8 pb-8 w-full">
	<h2 class="text-2xl md:text-3xl font-display text-center mb-6">
		{converter_page_supported_inputs_heading()}
	</h2>
	<div class="flex flex-wrap justify-center gap-2">
		{#each info.inputFormats as fmt}
			{#if validFormats.has(fmt)}
				<a href={localizeHref(`/${fmt}-converter/`)} class="format-chip">.{fmt.toUpperCase()}</a>
			{:else}
				<span class="format-chip">.{fmt.toUpperCase()}</span>
			{/if}
		{/each}
	</div>
</section>

<!-- FAQ -->
<section class="max-w-4xl mx-auto px-6 md:px-8 py-8 w-full">
	<h2 class="text-2xl md:text-3xl font-display text-center mb-6">{converter_page_faq_heading()}</h2>
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
	/* Hero */
	.converter-hero {
		background: linear-gradient(to bottom, var(--bg-panel) 0%, var(--bg) 100%);
	}

	.type-badge {
		@apply text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full;
		background: var(--bg-badge);
		color: var(--fg-on-badge);
	}

	/* Pills */
	.pill {
		@apply flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium;
		background: var(--bg-badge);
		color: var(--fg-on-badge);
	}

	/* Steps */
	.step-card {
		@apply bg-panel rounded-2xl p-5 shadow-panel flex flex-col gap-1 relative;
	}

	.step-num {
		@apply w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold mb-2;
		background: var(--bg-badge);
		color: var(--fg-on-badge);
	}

	/* Format chips */
	.format-chip {
		@apply px-3 py-1.5 rounded-full text-sm font-medium transition-colors;
		background: var(--bg-panel);
		color: var(--fg);
		border: 1px solid var(--bg-separator);
	}

	.format-chip:hover {
		background: var(--bg-panel-highlight);
	}

	/* FAQ */
	.faq-item {
		@apply bg-panel rounded-2xl shadow-panel overflow-hidden;
	}

	.faq-q {
		@apply flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none list-none font-semibold text-sm;
	}

	.faq-q::-webkit-details-marker {
		display: none;
	}

	.faq-chevron {
		@apply flex-shrink-0 transition-transform duration-200;
		color: var(--fg-muted);
	}

	details[open] .faq-chevron {
		transform: rotate(180deg);
	}

	.faq-a {
		@apply px-5 pb-4 text-sm leading-relaxed;
		color: var(--fg-muted);
	}
</style>
