<script lang="ts">
	import Uploader from '$lib/components/functional/Uploader.svelte';
	import privacyBadge from '$lib/assets/privacy-badge.png';
	import { ShieldCheck, Zap, Ban, Code, Check } from 'lucide-svelte';

	let { data } = $props();
	const from = $derived(data.from);
	const to = $derived(data.to);
	const fromMeta = $derived(data.fromMeta);
	const toMeta = $derived(data.toMeta);
	const headline = $derived(data.headline);
	const description = $derived(data.description);
	const metaDescription = $derived(data.metaDescription);

	const fromLabel = $derived(fromMeta.label);
	const toLabel = $derived(toMeta.label);
	const FROM = $derived(from.toUpperCase());
	const TO = $derived(to.toUpperCase());

	const canonicalUrl = $derived(`https://localconvert.app/${from}-to-${to}/`);

	const features = [
		{ icon: Ban, label: 'No server uploads' },
		{ icon: ShieldCheck, label: '100% private' },
		{ icon: Zap, label: 'GPU accelerated' },
		{ icon: Code, label: 'Open source' },
	];

	// JSON-LD structured data
	const howToSchema = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'HowTo',
		name: `How to convert ${fromLabel} to ${toLabel}`,
		description: `Convert ${FROM} files to ${TO} format for free, directly in your browser.`,
		step: [
			{
				'@type': 'HowToStep',
				name: 'Upload your file',
				text: `Click or drag your ${FROM} file onto the uploader.`,
			},
			{
				'@type': 'HowToStep',
				name: `Select ${toLabel} format`,
				text: `The converter will automatically set the output to ${toLabel}. Adjust if needed.`,
			},
			{
				'@type': 'HowToStep',
				name: 'Download the result',
				text: `Click Convert, then download your ${TO} file instantly.`,
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
				name: `Is the ${fromLabel} to ${toLabel} converter really free?`,
				acceptedAnswer: {
					'@type': 'Answer',
					text: `Yes — completely free, no account required, no watermarks, no file size limits. LocalConvert is open source.`,
				},
			},
			{
				'@type': 'Question',
				name: `Are my ${FROM} files safe?`,
				acceptedAnswer: {
					'@type': 'Answer',
					text: `Your files never leave your browser. All ${FROM} to ${TO} conversion happens using WebAssembly running locally on your device.`,
				},
			},
			{
				'@type': 'Question',
				name: `How long does ${fromLabel} to ${toLabel} conversion take?`,
				acceptedAnswer: {
					'@type': 'Answer',
					text: `Most conversions complete in seconds. Larger files may take a little longer depending on your device.`,
				},
			},
		],
	}));
</script>

<svelte:head>
	<title>{headline}</title>
	<meta name="description" content={metaDescription} />
	<meta property="og:title" content={headline} />
	<meta property="og:description" content={metaDescription} />
	<link rel="canonical" href={canonicalUrl} />
	<!-- JSON-LD -->
	{@html `<script type="application/ld+json">${howToSchema}</script>`}
	{@html `<script type="application/ld+json">${faqSchema}</script>`}
</svelte:head>

<!-- Hero -->
<section class="converter-hero w-full">
	<div class="max-w-4xl mx-auto px-6 md:px-8 pt-10 md:pt-16 pb-12 md:pb-20 flex flex-col items-center">
		<!-- breadcrumb badge -->
		<span class="type-badge mb-5">{fromLabel} → {toLabel} Converter</span>

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
<section class="max-w-4xl mx-auto px-6 md:px-8 py-12 w-full">
	<h2 class="text-2xl md:text-3xl font-display text-center mb-8">
		How to convert {fromLabel} to {toLabel}
	</h2>
	<ol class="grid grid-cols-1 md:grid-cols-3 gap-4">
		{#each [
			{ n: '1', title: `Upload your ${FROM} file`, body: `Click or drag your ${FROM} file onto the upload zone above.` },
			{ n: '2', title: `Convert to ${TO}`, body: `The output format is pre-set to ${toLabel}. Click the convert button to process your file.` },
			{ n: '3', title: 'Download instantly', body: `Your converted ${TO} file is ready to download — no email, no waiting.` },
		] as step}
			<li class="step-card">
				<span class="step-num">{step.n}</span>
				<h3 class="font-semibold text-base mb-1">{step.title}</h3>
				<p class="text-sm text-muted">{step.body}</p>
			</li>
		{/each}
	</ol>
</section>

<!-- Privacy -->
<section class="privacy-strip w-full py-10 md:py-14">
	<div class="max-w-4xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center gap-8">
		<img src={privacyBadge} alt="Privacy badge" class="w-28 h-28 object-contain flex-shrink-0" />
		<div>
			<h2 class="text-xl md:text-2xl font-display mb-3">Your {FROM} files never leave your device</h2>
			<ul class="flex flex-col gap-2">
				{#each [
					`All ${FROM} to ${TO} conversion runs in your browser via WebAssembly`,
					'No server uploads — your files are never transmitted',
					'No account needed, no file size limits, completely free',
				] as point}
					<li class="flex items-start gap-2 text-sm">
						<span class="check-icon flex-shrink-0 mt-0.5"><Check size="14" /></span>
						{point}
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<!-- FAQ -->
<section class="max-w-4xl mx-auto px-6 md:px-8 py-12 w-full">
	<h2 class="text-2xl md:text-3xl font-display text-center mb-6">
		{fromLabel} to {toLabel} — FAQ
	</h2>
	<div class="flex flex-col gap-3 max-w-2xl mx-auto">
		{#each [
			{
				q: `Is the ${fromLabel} to ${toLabel} converter really free?`,
				a: `Yes, completely free. No hidden fees, no watermarks, no file size limits. LocalConvert is open source and free forever.`,
			},
			{
				q: `Are my ${FROM} files safe?`,
				a: `Absolutely. Your files never leave your browser. All ${FROM} to ${TO} conversion happens using WebAssembly running locally on your device — no uploads, ever.`,
			},
			{
				q: `How long does ${fromLabel} to ${toLabel} conversion take?`,
				a: `Most conversions finish in seconds. Larger files may take a little longer depending on your device's speed and memory.`,
			},
			{
				q: `What's the difference between ${fromLabel} and ${toLabel}?`,
				a: `${fromLabel} is ${fromMeta.desc}. ${toLabel} is ${toMeta.desc}.`,
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
	.privacy-strip { background: var(--bg-panel); }
	.check-icon {
		@apply flex items-center justify-center w-5 h-5 rounded-full;
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
