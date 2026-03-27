<script lang="ts">
	import Uploader from "$lib/components/functional/Uploader.svelte";
	import { ShieldCheck, Zap, Ban, Code } from "lucide-svelte";

	let { data } = $props();
	const info = $derived(data.info);
	const validFormats = $derived(new Set(data.validFormats));

	const typeLabel: Record<string, string> = {
		image: "Image",
		audio: "Audio",
		video: "Video",
		doc: "Document",
	};

	const features = [
		{ icon: Ban, label: "No server uploads" },
		{ icon: ShieldCheck, label: "100% private" },
		{ icon: Zap, label: "GPU accelerated" },
		{ icon: Code, label: "Open source" },
	];

	const howToSchema = $derived(JSON.stringify({
		"@context": "https://schema.org",
		"@type": "HowTo",
		name: `How to convert to ${info.label}`,
		description: info.description,
		step: [
			{ "@type": "HowToStep", name: "Select your file", text: `Click or drag your file onto the converter. Supported formats: ${info.inputFormats.map(f => f.toUpperCase()).join(", ")}.` },
			{ "@type": "HowToStep", name: `Select ${info.label}`, text: `Choose ${info.label} as the output format in the converter.` },
			{ "@type": "HowToStep", name: "Save", text: `Click Convert, then save your ${info.label} file to your device instantly.` },
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
				name: `Is the ${info.label} converter really free?`,
				acceptedAnswer: { "@type": "Answer", text: "Yes — completely free, no account required, no watermarks, no file size limits. LocalConvert is open source." },
			},
			{
				"@type": "Question",
				name: "Are my files safe?",
				acceptedAnswer: { "@type": "Answer", text: "Your files never leave your browser. All conversion happens using WebAssembly running locally on your device." },
			},
			{
				"@type": "Question",
				name: `What files can I convert to ${info.label}?`,
				acceptedAnswer: { "@type": "Answer", text: `You can convert ${info.inputFormats.map(f => f.toUpperCase()).join(", ")} files to ${info.label}.` },
			},
		],
	}));
</script>

<svelte:head>
	<title>Free {info.label} Converter — LocalConvert</title>
	<meta name="description" content={info.description} />
	<meta property="og:title" content="Free {info.label} Converter — LocalConvert" />
	<meta property="og:description" content={info.description} />
	<link rel="canonical" href="https://localconvert.app/{info.format}-converter/" />
	{@html `<script type="application/ld+json">${howToSchema}</script>`}
	{@html `<script type="application/ld+json">${faqSchema}</script>`}
</svelte:head>

<!-- Hero -->
<section class="converter-hero w-full">
	<div class="max-w-4xl mx-auto px-6 md:px-8 pt-10 md:pt-16 pb-12 md:pb-20 flex flex-col items-center">
		<span class="type-badge mb-5">{typeLabel[info.type]} Converter</span>

		<h1 class="text-3xl md:text-5xl text-center font-display tracking-tight leading-tight mb-4 max-w-2xl">
			{info.headline}
		</h1>
		<p class="text-base md:text-lg text-center text-muted max-w-xl mb-8">
			{info.description}
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
		How to convert to {info.label}
	</h2>
	<ol class="grid grid-cols-1 md:grid-cols-3 gap-4">
		{#each [
			{ n: "1", title: "Choose your file", body: `Click or drag any ${info.inputFormats.slice(0, 3).join(", ").toUpperCase()} file onto the uploader above.` },
			{ n: "2", title: "Pick " + info.label + " format", body: "Select " + info.label + " from the format dropdown in the converter." },
			{ n: "3", title: "Save", body: "Hit the convert button, then save your " + info.label + " file to your device instantly." },
		] as step}
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
		Supported input formats
	</h2>
	<div class="flex flex-wrap justify-center gap-2">
		{#each info.inputFormats as fmt}
			{#if validFormats.has(fmt)}
				<a href="/{fmt}-converter/" class="format-chip">.{fmt.toUpperCase()}</a>
			{:else}
				<span class="format-chip">.{fmt.toUpperCase()}</span>
			{/if}
		{/each}
	</div>
</section>

<!-- FAQ -->
<section class="max-w-4xl mx-auto px-6 md:px-8 py-8 w-full">
	<h2 class="text-2xl md:text-3xl font-display text-center mb-6">FAQ</h2>
	<div class="flex flex-col gap-3 max-w-2xl mx-auto">
		{#each [
			{
				q: `Is the ${info.label} converter really free?`,
				a: `Yes, completely free. No hidden fees, no watermarks, no file size limits. LocalConvert is open source and free forever.`,
			},
			{
				q: `Are my files safe?`,
				a: `Absolutely. Your files never leave your browser. All conversion happens using WebAssembly running locally on your device — no uploads, ever.`,
			},
			{
				q: `What files can I convert to ${info.label}?`,
				a: `You can convert ${info.inputFormats.map(f => f.toUpperCase()).join(", ")} files to ${info.label}.`,
			},
		] as faq}
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
