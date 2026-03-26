<script lang="ts">
	import Uploader from "$lib/components/functional/Uploader.svelte";
	import { converters } from "$lib/converters";
	import clsx from "clsx";
	import { AudioLines, BookText, Check, Film, Image, ShieldCheck, Code, Zap, Ban } from "lucide-svelte";
	import { m } from "$lib/paraglide/messages";
	import { browser } from "$app/environment";

	import step1 from "$lib/assets/steps/step-1-choose.png";
	import step2 from "$lib/assets/steps/step-2-convert.png";
	import step3 from "$lib/assets/steps/step-3-download.png";
	import privacyBadge from "$lib/assets/privacy-badge.png";

	const getSupportedFormats = (name: string, nativeOnly?: boolean) =>
		converters
			.find((c) => c.name === name)
			?.supportedFormats.filter((f) => (nativeOnly === undefined ? true : nativeOnly ? f.isNative : !f.isNative))
			.map(
				(f) =>
					`${f.name}${f.fromSupported && f.toSupported ? "" : "*"}`,
			)
			.join(", ") || "none";

	const worker: {
		[key: string]: {
			formats: string;
			icon: typeof Image;
			title: string;
		};
	} = $derived.by(() => ({
		Images: {
			formats: getSupportedFormats("imagemagick"),
			icon: Image,
			title: m["upload.cards.images"](),
		},
		Audio: {
			formats: getSupportedFormats("ffmpeg", true),
			icon: AudioLines,
			title: m["upload.cards.audio"](),
		},
		Video: {
			formats: getSupportedFormats("ffmpeg", false),
			icon: Film,
			title: m["upload.cards.video"](),
		},
		Documents: {
			formats: getSupportedFormats("pandoc"),
			icon: BookText,
			title: m["upload.cards.documents"](),
		},
	}));

	const pills = [
		{ icon: Ban, label: m["landing.pills.no_uploads"]() },
		{ icon: Zap, label: m["landing.pills.gpu"]() },
		{ icon: Code, label: m["landing.pills.open_source"]() },
		{ icon: ShieldCheck, label: m["landing.pills.no_limit"]() },
	];

	const steps = [
		{ img: step1, title: m["landing.how_it_works.step1_title"](), desc: m["landing.how_it_works.step1_desc"]() },
		{ img: step2, title: m["landing.how_it_works.step2_title"](), desc: m["landing.how_it_works.step2_desc"]() },
		{ img: step3, title: m["landing.how_it_works.step3_title"](), desc: m["landing.how_it_works.step3_desc"]() },
	];

	const faqs = [
		{ q: m["landing.faq.q1"](), a: m["landing.faq.a1"]() },
		{ q: m["landing.faq.q2"](), a: m["landing.faq.a2"]() },
		{ q: m["landing.faq.q3"](), a: m["landing.faq.a3"]() },
		{ q: m["landing.faq.q4"](), a: m["landing.faq.a4"]() },
		{ q: m["landing.faq.q5"](), a: m["landing.faq.a5"]() },
	];

	const softwareSchema = JSON.stringify({
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "LocalConvert",
		applicationCategory: "UtilitiesApplication",
		operatingSystem: "Web",
		description: "Free, private file converter that runs entirely in your browser. Convert images, audio, video, and documents — no uploads, no server.",
		url: "https://localconvert.app",
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		featureList: [
			"No server uploads — 100% local processing",
			"Image conversion (JPG, PNG, WEBP, AVIF, ICO, GIF, TIFF, SVG, HEIC)",
			"Audio conversion (MP3, WAV, FLAC, OGG, AAC)",
			"Video conversion (MP4, WEBM, MKV, AVI, MOV) with GPU acceleration",
			"Document conversion (DOCX, HTML, Markdown, EPUB)",
			"PDF tools (merge, split, rotate, compress, watermark)",
		],
	});

	const websiteSchema = JSON.stringify({
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "LocalConvert",
		url: "https://localconvert.app",
		potentialAction: {
			"@type": "SearchAction",
			target: { "@type": "EntryPoint", urlTemplate: "https://localconvert.app/{search_term_string}-converter/" },
			"query-input": "required name=search_term_string",
		},
	});
</script>

<svelte:head>
	<title>LocalConvert — Free, Private File Converter</title>
	<link rel="canonical" href="https://localconvert.app/" />
	{@html `<script type="application/ld+json">${softwareSchema}</script>`}
	{@html `<script type="application/ld+json">${websiteSchema}</script>`}
</svelte:head>

<!-- ═══════════════════════════════════════════════════════
     HERO SECTION
═══════════════════════════════════════════════════════ -->
<section class="hero-section relative w-full overflow-hidden">
	<div class="hero-bg absolute inset-0 bg-cover bg-center bg-no-repeat"></div>
	<div class="hero-overlay absolute inset-0"></div>

	<div class="relative max-w-5xl mx-auto px-6 md:px-8 pt-12 md:pt-20 pb-16 md:pb-24 flex flex-col items-center">

		<!-- Feature pills -->
		<div class="flex flex-wrap justify-center gap-2 mb-7 hero-animate">
			{#each pills as pill}
				{@const Icon = pill.icon}
				<span class="pill">
					<Icon size="14" />
					{pill.label}
				</span>
			{/each}
		</div>

		<!-- Headline — push it BIG -->
		<h1 class="hero-headline hero-animate delay-1">
			{m["upload.title"]()}
		</h1>

		<!-- Uploader — primary CTA -->
		<div class="w-full max-w-2xl mt-8 mb-5 hero-animate delay-2">
			<div class="uploader-glow">
				<Uploader class="w-full h-44 md:h-56" />
			</div>
		</div>

		<!-- Subtitle sits below the uploader -->
		<p class="hero-subhead hero-animate delay-3">
			{m["upload.subtitle"]()}
		</p>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════
     HOW IT WORKS
═══════════════════════════════════════════════════════ -->
<section class="max-w-5xl mx-auto px-6 md:px-8 py-16 md:py-24 w-full">
	<h2 class="section-headline">{m["landing.how_it_works.title"]()}</h2>

	<div class="steps-grid">
		{#each steps as step, i}
			<div class="step-card">
				<div class="step-number">{i + 1}</div>
				<img src={step.img} alt={step.title} class="step-img" />
				<h3 class="text-xl font-semibold mt-5 mb-2">{step.title}</h3>
				<p class="text-sm font-normal text-muted leading-relaxed">{step.desc}</p>
			</div>
		{/each}
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════
     SUPPORTED FORMATS
═══════════════════════════════════════════════════════ -->
<section class="max-w-5xl mx-auto px-6 md:px-8 pb-16 md:pb-24 w-full">
	<h2 class="section-headline">{m["landing.formats.title"]()}</h2>

	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		{#if browser}
			{#each Object.entries(worker) as [key, s]}
				{@const Icon = s.icon}
				<div class="file-category-card">
					<div class="file-category-card-inner">
						<div
							class={clsx("icon-container", {
								"bg-accent-blue": key === "Images",
								"bg-accent-purple": key === "Audio",
								"bg-accent-green": key === "Documents",
								"bg-accent-red": key === "Video",
							})}
						>
							<Icon size="18" />
						</div>
						<span class="font-semibold text-sm">{s.title}</span>
					</div>
					<div class="flex flex-wrap gap-1">
						{#each s.formats.replace(/\*/g, "").split(", ") as fmt}
							<span class="format-chip">{fmt.toUpperCase()}</span>
						{/each}
					</div>
				</div>
			{/each}
		{:else}
			{#each ["Images", "Audio", "Video", "Documents"] as label}
				<div class="file-category-card opacity-50">
					<div class="file-category-card-inner">
						<span class="font-semibold text-sm">{label}</span>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════
     PRIVACY SECTION — full-bleed accent statement
═══════════════════════════════════════════════════════ -->
<section class="privacy-section w-full py-16 md:py-20">
	<div class="max-w-5xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center gap-8 md:gap-16">
		<div class="flex-shrink-0">
			<img
				src={privacyBadge}
				alt="Privacy badge"
				class="w-32 h-32 md:w-52 md:h-52 object-contain"
			/>
		</div>
		<div>
			<h2 class="privacy-headline">{m["landing.privacy.title"]()}</h2>
			<ul class="flex flex-col gap-4 mt-6">
				{#each [m["landing.privacy.point1"](), m["landing.privacy.point2"](), m["landing.privacy.point3"]()] as point}
					<li class="flex items-start gap-3">
						<span class="privacy-check-icon flex-shrink-0 mt-0.5">
							<Check size="16" />
						</span>
						<span class="text-lg font-normal leading-relaxed privacy-text">{point}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════
     FAQ SECTION
═══════════════════════════════════════════════════════ -->
<section class="max-w-5xl mx-auto px-6 md:px-8 py-16 md:py-24 w-full">
	<h2 class="section-headline">{m["landing.faq.title"]()}</h2>

	<div class="faq-list flex flex-col gap-3 max-w-3xl mx-auto">
		{#each faqs as faq}
			<details class="faq-item">
				<summary class="faq-question">
					<span>{faq.q}</span>
					<span class="faq-chevron">
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</span>
				</summary>
				<p class="faq-answer">{faq.a}</p>
			</details>
		{/each}
	</div>
</section>

<style lang="postcss">
	/* ── Hero Reveal Animations ── */
	@keyframes revealUp {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.hero-animate {
		animation: revealUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	.delay-1 { animation-delay: 0.1s; }
	.delay-2 { animation-delay: 0.22s; }
	.delay-3 { animation-delay: 0.36s; }

	/* ── Hero Background ── */
	.hero-bg {
		background-image: url('/bg-dark.png');
		background-size: cover;
		background-position: center top;
	}

	:global(.light) .hero-bg {
		background-image: none;
	}

	@media (prefers-color-scheme: light) {
		:global(:root:not(.dark)) .hero-bg {
			background-image: none;
		}
	}

	.hero-overlay {
		background:
			radial-gradient(ellipse 90% 55% at 50% 0%, hsla(158, 65%, 40%, 0.42) 0%, transparent 65%),
			linear-gradient(to bottom, hsla(0, 0%, 7%, 0.2) 0%, var(--bg) 88%);
	}

	:global(.light) .hero-overlay {
		background:
			radial-gradient(ellipse 90% 50% at 50% -5%, hsl(158, 60%, 87%) 0%, transparent 62%),
			linear-gradient(to bottom, transparent 0%, var(--bg) 75%);
	}

	@media (prefers-color-scheme: light) {
		:global(:root:not(.dark)) .hero-overlay {
			background:
				radial-gradient(ellipse 90% 50% at 50% -5%, hsl(158, 60%, 87%) 0%, transparent 62%),
				linear-gradient(to bottom, transparent 0%, var(--bg) 75%);
		}
	}

	/* ── Hero Typography ── */
	.hero-headline {
		font-family: var(--font-display);
		font-size: clamp(1.9rem, 5.5vw, 4.5rem);
		font-weight: 700;
		text-align: center;
		letter-spacing: -0.038em;
		line-height: 1.07;
		margin-bottom: 0;
		max-width: 880px;
	}

	.hero-subhead {
		font-size: clamp(0.9rem, 1.75vw, 1.05rem);
		text-align: center;
		color: var(--fg-muted);
		max-width: 540px;
		font-weight: 400;
		line-height: 1.7;
		margin-top: 0.25rem;
	}

	/* ── Uploader Glow (dark mode only) ── */
	.uploader-glow {
		position: relative;
	}

	.uploader-glow::before {
		content: '';
		position: absolute;
		inset: -28px;
		background: radial-gradient(ellipse at center, hsla(158, 65%, 45%, 0.2) 0%, transparent 72%);
		pointer-events: none;
		z-index: 0;
		border-radius: 2rem;
	}

	:global(.light) .uploader-glow::before {
		display: none;
	}

	@media (prefers-color-scheme: light) {
		:global(:root:not(.dark)) .uploader-glow::before {
			display: none;
		}
	}

	.uploader-glow > :global(*) {
		position: relative;
		z-index: 1;
	}

	/* ── Pills ── */
	.pill {
		@apply flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium;
		background-color: var(--bg-badge);
		color: var(--fg-on-badge);
	}

	/* ── Section Headlines ── */
	.section-headline {
		@apply text-3xl md:text-4xl text-center mb-10 md:mb-12;
		letter-spacing: -0.025em;
	}

	/* ── How It Works ── */
	.steps-grid {
		@apply grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8;
	}

	.step-card {
		@apply bg-panel rounded-2xl p-6 shadow-panel text-center flex flex-col items-center relative;
		border: 1px solid var(--bg-separator);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.step-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 12px 36px hsla(0, 0%, 0%, 0.12);
	}

	.step-number {
		@apply absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold;
		background-color: var(--bg-badge);
		color: var(--fg-on-badge);
	}

	.step-img {
		@apply w-full max-w-[12rem] h-44 object-contain mx-auto;
	}

	/* ── Format Cards ── */
	.file-category-card {
		@apply bg-panel rounded-2xl p-5 shadow-panel flex flex-col gap-3;
		border: 1px solid var(--bg-separator);
		transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.file-category-card:hover {
		transform: translateY(-2px);
		border-color: var(--accent);
		box-shadow: 0 6px 24px hsla(0, 0%, 0%, 0.1);
	}

	.file-category-card-inner {
		@apply flex items-center gap-3;
	}

	.icon-container {
		@apply p-2 rounded-full text-on-accent flex-shrink-0;
	}

	.format-chip {
		font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		padding: 2px 6px;
		border-radius: 4px;
		background: var(--bg-panel-highlight);
		color: var(--fg-muted);
		transition: background-color 0.15s ease, color 0.15s ease;
	}

	.file-category-card:hover .format-chip {
		background: var(--bg-badge);
		color: var(--fg-on-badge);
	}

	/* ── Privacy Section — accent background ── */
	.privacy-section {
		background-color: var(--accent);
	}

	.privacy-headline {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 3rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.1;
		color: var(--fg-on-accent);
	}

	.privacy-text {
		color: var(--fg-on-accent);
		opacity: 0.92;
	}

	.privacy-check-icon {
		@apply flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0;
		background-color: hsla(0, 0%, 100%, 0.22);
		color: var(--fg-on-accent);
	}

	/* ── FAQ ── */
	.faq-item {
		@apply bg-panel rounded-2xl shadow-panel overflow-hidden;
		border: 1px solid var(--bg-separator);
	}

	.faq-question {
		@apply flex items-center justify-between gap-4 px-6 py-4 cursor-pointer select-none list-none;
		font-size: 1rem;
		font-weight: 600;
		transition: background-color 0.15s ease;
	}

	.faq-question:hover {
		background-color: var(--bg-panel-highlight);
	}

	.faq-question::-webkit-details-marker {
		display: none;
	}

	.faq-chevron {
		@apply flex-shrink-0 transition-transform duration-200;
		color: var(--fg-muted);
	}

	details[open] .faq-chevron {
		transform: rotate(180deg);
	}

	.faq-answer {
		@apply px-6 pb-5 text-sm font-normal leading-relaxed;
		padding-top: 1rem;
		color: var(--fg-muted);
		border-top: 1px solid var(--bg-separator);
	}
</style>
