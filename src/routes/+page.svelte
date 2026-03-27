<script lang="ts">
	import Uploader from "$lib/components/functional/Uploader.svelte";
	import { converters } from "$lib/converters";
	import clsx from "clsx";
	import { AudioLines, BookText, Check, Film, Image, ShieldCheck, Code, Zap, Ban, ChevronDown } from "lucide-svelte";
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
			.map((f) => `${f.name}${f.fromSupported && f.toSupported ? "" : "*"}`)
			.join(", ") || "none";

	const worker: {
		[key: string]: {
			formats: string;
			icon: typeof Image;
			title: string;
			color: string;
		};
	} = $derived.by(() => ({
		Images: {
			formats: getSupportedFormats("imagemagick"),
			icon: Image,
			title: m["upload.cards.images"](),
			color: "blue",
		},
		Audio: {
			formats: getSupportedFormats("ffmpeg", true),
			icon: AudioLines,
			title: m["upload.cards.audio"](),
			color: "purple",
		},
		Video: {
			formats: getSupportedFormats("ffmpeg", false),
			icon: Film,
			title: m["upload.cards.video"](),
			color: "red",
		},
		Documents: {
			formats: getSupportedFormats("pandoc"),
			icon: BookText,
			title: m["upload.cards.documents"](),
			color: "green",
		},
	}));

	const pills = [
		{ icon: Ban, label: m["landing.pills.no_uploads"]() },
		{ icon: Zap, label: m["landing.pills.gpu"]() },
		{ icon: Code, label: m["landing.pills.open_source"]() },
		{ icon: ShieldCheck, label: m["landing.pills.no_limit"]() },
	];

	const steps = [
		{ img: step1, title: m["landing.how_it_works.step1_title"](), desc: m["landing.how_it_works.step1_desc"](), n: "01" },
		{ img: step2, title: m["landing.how_it_works.step2_title"](), desc: m["landing.how_it_works.step2_desc"](), n: "02" },
		{ img: step3, title: m["landing.how_it_works.step3_title"](), desc: m["landing.how_it_works.step3_desc"](), n: "03" },
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

<!-- ═══ HERO ═══ -->
<section class="hero-section relative w-full overflow-hidden">
	<div class="hero-bg absolute inset-0"></div>
	<div class="hero-overlay absolute inset-0"></div>

	<div class="relative max-w-5xl mx-auto px-6 md:px-8 pt-14 md:pt-24 pb-20 md:pb-32 flex flex-col items-center">

		<!-- Pills -->
		<div class="flex flex-wrap justify-center gap-2 mb-8 hero-animate">
			{#each pills as pill}
				{@const Icon = pill.icon}
				<span class="pill">
					<Icon size="12" strokeWidth={2.5} />
					{pill.label}
				</span>
			{/each}
		</div>

		<!-- Headline -->
		<h1 class="hero-headline hero-animate delay-1">
			{m["upload.title"]()}
		</h1>

		<!-- Uploader -->
		<div class="w-full max-w-2xl mt-10 mb-6 hero-animate delay-2">
			<div class="uploader-shell">
				<Uploader class="w-full h-44 md:h-56" />
			</div>
		</div>

		<!-- Subtitle -->
		<p class="hero-subhead hero-animate delay-3">
			{m["upload.subtitle"]()}
		</p>
	</div>
</section>

<!-- ═══ HOW IT WORKS ═══ -->
<section class="section-wrapper">
	<div class="section-inner">
		<div class="section-label">How it works</div>
		<h2 class="section-headline">{m["landing.how_it_works.title"]()}</h2>

		<div class="steps-grid">
			{#each steps as step, i}
				<div class="step-card">
					<span class="step-bg-number">{step.n}</span>
					<img src={step.img} alt={step.title} class="step-img" />
					<div class="step-meta">
						<span class="step-index">Step {step.n}</span>
						<h3 class="step-title">{step.title}</h3>
						<p class="step-desc">{step.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ═══ FORMATS ═══ -->
<section class="section-wrapper section-alt">
	<div class="section-inner">
		<div class="section-label">Capabilities</div>
		<h2 class="section-headline">{m["landing.formats.title"]()}</h2>

		<div class="formats-grid">
			{#if browser}
				{#each Object.entries(worker) as [key, s]}
					{@const Icon = s.icon}
					<div class={clsx("format-card", `format-card--${s.color}`)}>
						<div class="format-card-header">
							<div class={clsx("format-icon", `format-icon--${s.color}`)}>
								<Icon size="16" />
							</div>
							<span class="format-title">{s.title}</span>
						</div>
						<div class="format-chips">
							{#each s.formats.replace(/\*/g, "").split(", ") as fmt}
								<span class={clsx("format-chip", `format-chip--${s.color}`)}>{fmt.toUpperCase()}</span>
							{/each}
						</div>
					</div>
				{/each}
			{:else}
				{#each [["Images","blue"],["Audio","purple"],["Video","red"],["Documents","green"]] as [label, color]}
					<div class={clsx("format-card opacity-50", `format-card--${color}`)}>
						<div class="format-card-header">
							<span class="format-title">{label}</span>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</section>

<!-- ═══ PRIVACY ═══ -->
<section class="privacy-section">
	<div class="privacy-inner max-w-5xl mx-auto px-6 md:px-8">
		<div class="privacy-badge-wrap">
			<img src={privacyBadge} alt="Privacy badge" class="privacy-badge" />
		</div>
		<div class="privacy-content">
			<div class="section-label privacy-label">Privacy first</div>
			<h2 class="privacy-headline">{m["landing.privacy.title"]()}</h2>
			<ul class="privacy-list">
				{#each [m["landing.privacy.point1"](), m["landing.privacy.point2"](), m["landing.privacy.point3"]()] as point}
					<li class="privacy-item">
						<span class="privacy-check">
							<Check size="14" strokeWidth={3} />
						</span>
						<span class="privacy-text">{point}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<!-- ═══ FAQ ═══ -->
<section class="section-wrapper">
	<div class="section-inner">
		<div class="section-label">Questions</div>
		<h2 class="section-headline">{m["landing.faq.title"]()}</h2>

		<div class="faq-list">
			{#each faqs as faq}
				<details class="faq-item">
					<summary class="faq-q">
						<span>{faq.q}</span>
						<span class="faq-icon"><ChevronDown size="18" /></span>
					</summary>
					<p class="faq-a">{faq.a}</p>
				</details>
			{/each}
		</div>
	</div>
</section>

<style lang="postcss">
/* ── Reveal animation ── */
@keyframes revealUp {
	from { opacity: 0; transform: translateY(20px); }
	to   { opacity: 1; transform: translateY(0); }
}

.hero-animate { animation: revealUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) both; }
.delay-1 { animation-delay: 0.08s; }
.delay-2 { animation-delay: 0.18s; }
.delay-3 { animation-delay: 0.30s; }

/* ── Hero ── */
.hero-section {
	min-height: 70vh;
	display: flex;
	align-items: center;
}

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
		radial-gradient(ellipse 80% 50% at 50% -5%, hsla(162, 65%, 45%, 0.38) 0%, transparent 62%),
		linear-gradient(to bottom, hsla(20, 8%, 5%, 0.12) 0%, var(--bg) 88%);
}

:global(.light) .hero-overlay {
	background:
		radial-gradient(ellipse 80% 45% at 50% -8%, hsl(162, 55%, 88%) 0%, transparent 58%),
		linear-gradient(to bottom, transparent 0%, var(--bg) 80%);
}

@media (prefers-color-scheme: light) {
	:global(:root:not(.dark)) .hero-overlay {
		background:
			radial-gradient(ellipse 80% 45% at 50% -8%, hsl(162, 55%, 88%) 0%, transparent 58%),
			linear-gradient(to bottom, transparent 0%, var(--bg) 80%);
	}
}

.hero-headline {
	font-family: var(--font-display);
	font-size: clamp(2rem, 5.5vw, 4.75rem);
	font-weight: 700;
	text-align: center;
	letter-spacing: -0.04em;
	line-height: 1.05;
	max-width: 900px;
}

.hero-subhead {
	font-size: clamp(0.875rem, 1.6vw, 1rem);
	text-align: center;
	color: var(--fg-muted);
	max-width: 500px;
	font-weight: 400;
	line-height: 1.75;
}

/* Uploader shell with scan line */
.uploader-shell {
	position: relative;
	border-radius: 1.25rem;
	overflow: hidden;
}

.uploader-shell::after {
	content: '';
	position: absolute;
	inset: -2px;
	border-radius: 1.35rem;
	background: radial-gradient(ellipse at center, hsla(162, 65%, 48%, 0.18) 0%, transparent 70%);
	pointer-events: none;
	z-index: 0;
}

:global(.light) .uploader-shell::after {
	display: none;
}

@media (prefers-color-scheme: light) {
	:global(:root:not(.dark)) .uploader-shell::after {
		display: none;
	}
}

.uploader-shell > :global(*) {
	position: relative;
	z-index: 1;
}

/* Pills */
.pill {
	@apply flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold;
	background: var(--bg-badge);
	color: var(--fg-on-badge);
	letter-spacing: 0.01em;
	border: 1px solid hsla(162, 40%, 35%, 0.15);
}

:global(.dark) .pill {
	border-color: hsla(162, 40%, 60%, 0.15);
}

@media (prefers-color-scheme: dark) {
	:global(:root:not(.light)) .pill {
		border-color: hsla(162, 40%, 60%, 0.15);
	}
}

/* ── Sections ── */
.section-wrapper {
	@apply w-full py-16 md:py-24;
}

.section-alt {
	background: linear-gradient(to bottom, var(--bg-panel-highlight), transparent);
}

.section-inner {
	@apply max-w-5xl mx-auto px-6 md:px-8;
}

.section-label {
	font-family: var(--font-mono);
	font-size: 0.7rem;
	font-weight: 700;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: var(--fg-accent, var(--accent));
	margin-bottom: 0.75rem;
	opacity: 0.85;
}

.section-headline {
	font-family: var(--font-display);
	font-size: clamp(1.75rem, 3.5vw, 2.75rem);
	font-weight: 700;
	letter-spacing: -0.04em;
	line-height: 1.1;
	margin-bottom: 2.5rem;
}

/* ── Steps ── */
.steps-grid {
	@apply grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6;
}

.step-card {
	@apply relative overflow-hidden rounded-2xl p-6 flex flex-col gap-4;
	background: var(--bg-panel);
	box-shadow: var(--shadow-panel);
	border: 1px solid var(--bg-separator);
	transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.step-card:hover {
	transform: translateY(-4px);
	box-shadow: var(--shadow-panel), 0 16px 40px hsla(162, 40%, 20%, 0.1);
}

:global(.dark) .step-card:hover {
	box-shadow: 0 16px 48px hsla(218, 30%, 0%, 0.4);
}

.step-bg-number {
	position: absolute;
	top: -0.5rem;
	right: 0.75rem;
	font-family: var(--font-display);
	font-size: 6rem;
	font-weight: 700;
	line-height: 1;
	color: var(--bg-separator);
	letter-spacing: -0.06em;
	pointer-events: none;
	user-select: none;
}

.step-img {
	@apply w-full max-w-[10rem] h-40 object-contain mx-auto;
	position: relative;
	z-index: 1;
}

.step-meta {
	@apply flex flex-col gap-1;
	position: relative;
	z-index: 1;
}

.step-index {
	font-family: var(--font-mono);
	font-size: 0.65rem;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--accent);
	opacity: 0.8;
}

.step-title {
	font-family: var(--font-display);
	font-size: 1.1rem;
	font-weight: 700;
	letter-spacing: -0.03em;
	color: var(--fg);
}

.step-desc {
	font-size: 0.875rem;
	font-weight: 400;
	color: var(--fg-muted);
	line-height: 1.65;
	margin-top: 0.25rem;
}

/* ── Formats ── */
.formats-grid {
	@apply grid grid-cols-1 sm:grid-cols-2 gap-4;
}

.format-card {
	@apply rounded-2xl p-5 flex flex-col gap-4;
	background: var(--bg-panel);
	box-shadow: var(--shadow-panel);
	border: 1px solid var(--bg-separator);
	position: relative;
	overflow: hidden;
	transition: transform 0.2s ease, border-color 0.2s ease;
}

.format-card::before {
	content: '';
	position: absolute;
	top: 0; left: 0; right: 0;
	height: 3px;
	border-radius: 2px 2px 0 0;
}

.format-card--blue::before  { background: var(--accent-blue); }
.format-card--purple::before { background: var(--accent-purple); }
.format-card--red::before   { background: var(--accent-red); }
.format-card--green::before { background: var(--accent-green); }

.format-card:hover {
	transform: translateY(-2px);
}

.format-card--blue:hover  { border-color: var(--accent-blue); }
.format-card--purple:hover { border-color: var(--accent-purple); }
.format-card--red:hover   { border-color: var(--accent-red); }
.format-card--green:hover { border-color: var(--accent-green); }

.format-card-header {
	@apply flex items-center gap-3;
}

.format-icon {
	@apply w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0;
	color: white;
}

.format-icon--blue   { background: var(--accent-blue); }
.format-icon--purple { background: var(--accent-purple); }
.format-icon--red    { background: var(--accent-red); }
.format-icon--green  { background: var(--accent-green); }

.format-title {
	font-family: var(--font-display);
	font-size: 0.9rem;
	font-weight: 700;
	letter-spacing: -0.025em;
	color: var(--fg);
}

.format-chips {
	@apply flex flex-wrap gap-1.5;
}

.format-chip {
	font-family: var(--font-mono);
	font-size: 0.62rem;
	font-weight: 700;
	letter-spacing: 0.06em;
	padding: 2px 7px;
	border-radius: 5px;
	background: var(--bg-panel-highlight);
	color: var(--fg-muted);
	transition: background-color 0.15s ease, color 0.15s ease;
}

.format-card--blue:hover  .format-chip { background: hsla(217, 82%, 58%, 0.12); color: var(--accent-blue); }
.format-card--purple:hover .format-chip { background: hsla(258, 68%, 62%, 0.12); color: var(--accent-purple); }
.format-card--red:hover   .format-chip { background: hsla(14, 80%, 60%, 0.12); color: var(--accent-red); }
.format-card--green:hover .format-chip { background: hsla(158, 65%, 37%, 0.12); color: var(--accent-green); }

/* ── Privacy ── */
.privacy-section {
	@apply w-full py-16 md:py-20;
	background: var(--accent);
	position: relative;
	overflow: hidden;
}

.privacy-section::before {
	content: '';
	position: absolute;
	inset: 0;
	background:
		radial-gradient(ellipse 60% 80% at 0% 50%, hsla(0,0%,0%,0.12) 0%, transparent 60%),
		radial-gradient(ellipse 40% 60% at 100% 20%, hsla(0,0%,100%,0.06) 0%, transparent 50%);
	pointer-events: none;
}

.privacy-inner {
	@apply flex flex-col md:flex-row items-center gap-10 md:gap-14;
	position: relative;
}

.privacy-badge-wrap {
	@apply flex-shrink-0;
}

.privacy-badge {
	@apply w-28 h-28 md:w-44 md:h-44 object-contain;
	filter: drop-shadow(0 8px 24px hsla(0,0%,0%,0.25));
}

.privacy-content {
	@apply flex flex-col;
}

.privacy-label {
	color: hsla(0, 0%, 100%, 0.6);
}

.privacy-headline {
	font-family: var(--font-display);
	font-size: clamp(1.75rem, 3.5vw, 2.75rem);
	font-weight: 700;
	letter-spacing: -0.04em;
	line-height: 1.1;
	color: var(--fg-on-accent);
	margin-bottom: 1.5rem;
}

.privacy-list {
	@apply flex flex-col gap-4;
}

.privacy-item {
	@apply flex items-start gap-3;
}

.privacy-check {
	@apply flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5;
	background: hsla(0, 0%, 100%, 0.2);
	color: var(--fg-on-accent);
}

.privacy-text {
	font-size: 1rem;
	font-weight: 400;
	line-height: 1.65;
	color: var(--fg-on-accent);
	opacity: 0.9;
}

/* ── FAQ ── */
.faq-list {
	@apply flex flex-col gap-3 max-w-3xl;
}

.faq-item {
	@apply rounded-xl overflow-hidden;
	background: var(--bg-panel);
	box-shadow: var(--shadow-panel);
	border: 1px solid var(--bg-separator);
	transition: border-color 0.2s ease;
}

.faq-item[open] {
	border-color: hsla(162, 40%, 40%, 0.3);
}

.faq-q {
	@apply flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none list-none;
	font-size: 0.9375rem;
	font-weight: 600;
	color: var(--fg);
	transition: background-color 0.15s ease;
}

.faq-q:hover {
	background: var(--bg-panel-highlight);
}

.faq-q::-webkit-details-marker { display: none; }

.faq-icon {
	@apply flex-shrink-0 transition-transform duration-200;
	color: var(--fg-muted);
}

details[open] .faq-icon {
	transform: rotate(180deg);
	color: var(--accent);
}

.faq-a {
	@apply px-5 pb-5 text-sm font-normal leading-relaxed;
	padding-top: 0.875rem;
	color: var(--fg-muted);
	border-top: 1px solid var(--bg-separator);
}
</style>
