<script lang="ts">
	import Uploader from "$lib/components/functional/Uploader.svelte";
	import clsx from "clsx";
	import { Check, ShieldCheck, Code, Ban, ChevronDown, FileText, Palette, Wrench, ZapIcon } from "lucide-svelte";
	import { m } from "$lib/paraglide/messages";
	import FormatExplorer from "$lib/components/functional/FormatExplorer.svelte";

	import privacyBadge from "$lib/assets/privacy-badge.png";

	const pills = [
		{ icon: Ban, label: m["landing.pills.no_uploads"]() },
		{ icon: Wrench, label: m["landing.pills.tools_count"]() },
		{ icon: Code, label: m["landing.pills.open_source"]() },
		{ icon: ShieldCheck, label: m["landing.pills.works_locally"]() },
	];

	const toolkitCategories = [
		{
			title: m["landing.toolkit.pdf_title"](),
			desc: m["landing.toolkit.pdf_desc"](),
			count: m["landing.toolkit.pdf_count"](),
			href: "/pdf-tools/",
			color: "green" as const,
			icon: FileText,
		},
		{
			title: m["landing.toolkit.image_title"](),
			desc: m["landing.toolkit.image_desc"](),
			count: m["landing.toolkit.image_count"](),
			href: "/image-tools/",
			color: "blue" as const,
			icon: Palette,
		},
		{
			title: m["landing.toolkit.dev_title"](),
			desc: m["landing.toolkit.dev_desc"](),
			count: m["landing.toolkit.dev_count"](),
			href: "/dev-tools/",
			color: "purple" as const,
			icon: Code,
		},
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
		description: "Free, private toolkit with 36 tools for PDFs, images, and developer workflows — all running in your browser. No uploads, no server.",
		url: "https://localconvert.app",
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		featureList: [
			"No server uploads \u2014 100% local processing",
			"18 PDF tools (merge, split, compress, watermark, sign, edit, and more)",
			"10 image tools (crop, resize, filters, blur, watermark, meme generator)",
			"8 developer tools (JSON formatter, hash generator, Base64, diff, markdown)",
			"200+ format conversions (images, audio, video, documents)",
			"Works offline as a PWA",
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
	<title>LocalConvert — Free, Private Toolkit for Files & Code</title>
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

<!-- ═══ TOOLKIT ═══ -->
<section class="section-wrapper">
	<div class="section-inner">
		<div class="section-label">{m["landing.toolkit.label"]()}</div>
		<h2 class="section-headline">{m["landing.toolkit.title"]()}</h2>

		<div class="toolkit-grid">
			{#each toolkitCategories as cat, i}
				{@const Icon = cat.icon}
				<a href={cat.href} class={clsx("toolkit-card", `toolkit-card--${cat.color}`, "fade-in-up", i === 0 && "fade-delay-1", i === 1 && "fade-delay-2", i === 2 && "fade-delay-3")}>
					<div class="toolkit-card-header">
						<div class={clsx("toolkit-icon", `toolkit-icon--${cat.color}`)}>
							<Icon size="20" />
						</div>
						<span class={clsx("toolkit-count", `toolkit-count--${cat.color}`)}>{cat.count}</span>
					</div>
					<h3 class="toolkit-title">{cat.title}</h3>
					<p class="toolkit-desc">{cat.desc}</p>
					<span class="toolkit-explore">
						{m["landing.toolkit.explore"]()}
					</span>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- ═══ FORMATS ═══ -->
<section class="section-wrapper section-alt">
	<div class="section-inner">
		<div class="section-label">{m["landing.formats.label"]()}</div>
		<h2 class="section-headline">{m["landing.formats.title"]()}</h2>

		<FormatExplorer />

		<div class="flex justify-center mt-6">
			<a href="/formats/" class="formats-link">
				See all formats &rarr;
			</a>
		</div>
	</div>
</section>

<!-- ═══ GPU CALLOUT ═══ -->
<section class="section-wrapper">
	<div class="section-inner">
		<div class="gpu-callout">
			<div class="gpu-callout-left">
				<div class="gpu-callout-icon">
					<ZapIcon size={20} />
				</div>
				<div class="gpu-callout-text">
					<span class="gpu-callout-badge">{m["landing.gpu.badge"]()}</span>
					<h3 class="gpu-callout-title">{m["landing.gpu.title"]()}</h3>
					<p class="gpu-callout-desc">
						{m["landing.gpu.desc"]()}
					</p>
				</div>
			</div>

			<!-- Schematic -->
			<div class="gpu-schematic">
				<!-- Full GPU formats (bidirectional) -->
				<div class="gpu-group">
					<span class="gpu-group-label">
						<ZapIcon size={9} />
						{m["landing.gpu.full_label"]()}
					</span>
					<div class="gpu-format-ring">
						{#each ['MP4', 'WebM', 'MOV', 'M4V', '3GP'] as fmt, i}
							<span class="gpu-format gpu-format--full">{fmt}</span>
							{#if i < 4}<span class="gpu-arrow">⇄</span>{/if}
						{/each}
					</div>
				</div>

				<!-- Input-only GPU formats -->
				<div class="gpu-group">
					<span class="gpu-group-label gpu-group-label--muted">
						<ZapIcon size={9} />
						{m["landing.gpu.input_label"]()}
					</span>
					<div class="gpu-format-ring">
						{#each ['MKV', 'AVI', 'FLV', 'TS', 'WMV', 'OGG', 'OGV'] as fmt}
							<span class="gpu-format gpu-format--input">{fmt}</span>
						{/each}
					</div>
				</div>
			</div>
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
			<div class="section-label privacy-label">{m["landing.privacy.label"]()}</div>
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
		<div class="section-label">{m["landing.faq.label"]()}</div>
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
	max-width: 560px;
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
	font-size: 0.85rem;
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

/* ── Toolkit ── */
.toolkit-grid {
	@apply grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6;
}

.toolkit-card {
	@apply relative overflow-hidden rounded-2xl p-6 flex flex-col gap-3;
	background: var(--bg-panel);
	box-shadow: var(--shadow-panel);
	border: 1px solid var(--bg-separator);
	transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
	text-decoration: none;
	color: var(--fg);
}

.toolkit-card::before {
	content: '';
	position: absolute;
	top: 0; left: 0; right: 0;
	height: 3px;
	border-radius: 2px 2px 0 0;
}

.toolkit-card--green::before { background: var(--accent-green); }
.toolkit-card--blue::before  { background: var(--accent-blue); }
.toolkit-card--purple::before { background: var(--accent-purple); }

.toolkit-card:hover {
	transform: translateY(-4px);
	box-shadow: var(--shadow-panel), 0 16px 40px hsla(162, 40%, 20%, 0.12);
}

.toolkit-card--green:hover { border-color: var(--accent-green); }
.toolkit-card--blue:hover  { border-color: var(--accent-blue); }
.toolkit-card--purple:hover { border-color: var(--accent-purple); }

:global(.dark) .toolkit-card:hover {
	box-shadow: var(--shadow-panel), 0 16px 48px hsla(20, 15%, 0%, 0.5);
}

.toolkit-card-header {
	@apply flex items-center justify-between;
}

.toolkit-icon {
	@apply w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0;
	color: white;
}

.toolkit-icon--green  { background: var(--accent-green); }
.toolkit-icon--blue   { background: var(--accent-blue); }
.toolkit-icon--purple { background: var(--accent-purple); }

.toolkit-count {
	font-family: var(--font-mono);
	font-size: 0.7rem;
	font-weight: 700;
	letter-spacing: 0.06em;
	padding: 3px 10px;
	border-radius: 9999px;
}

.toolkit-count--green  { background: hsla(158, 65%, 37%, 0.12); color: var(--accent-green); }
.toolkit-count--blue   { background: hsla(217, 82%, 58%, 0.12); color: var(--accent-blue); }
.toolkit-count--purple { background: hsla(258, 68%, 62%, 0.12); color: var(--accent-purple); }

.toolkit-title {
	font-family: var(--font-display);
	font-size: 1.1rem;
	font-weight: 700;
	letter-spacing: -0.03em;
	color: var(--fg);
	margin-top: 0.25rem;
}

.toolkit-desc {
	font-size: 0.875rem;
	font-weight: 400;
	color: var(--fg-muted);
	line-height: 1.65;
}

.toolkit-explore {
	font-family: var(--font-mono);
	font-size: 0.75rem;
	font-weight: 700;
	letter-spacing: 0.02em;
	color: var(--fg-muted);
	margin-top: auto;
	padding-top: 0.5rem;
	transition: color 0.15s ease;
}

.toolkit-card:hover .toolkit-explore {
	color: var(--fg);
}

/* ── Formats link ── */
.formats-link {
	font-family: var(--font-mono);
	font-size: 0.8rem;
	font-weight: 700;
	letter-spacing: 0.02em;
	color: var(--fg-muted);
	text-decoration: none;
	transition: color 0.15s ease;
}

.formats-link:hover {
	color: var(--accent);
}

/* ── GPU Callout ── */
.gpu-callout {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	padding: 1.5rem;
	border-radius: 1rem;
	background: var(--bg-panel);
	border: 1px solid var(--bg-separator);
	border-left: 3px solid var(--accent-red);
	box-shadow: var(--shadow-panel);
}

@media (min-width: 768px) {
	.gpu-callout {
		flex-direction: row;
		align-items: flex-start;
	}
}

.gpu-callout-left {
	display: flex;
	gap: 1rem;
	flex-shrink: 0;
}

@media (min-width: 768px) {
	.gpu-callout-left { max-width: 20rem; }
}

.gpu-callout-icon {
	width: 2.75rem;
	height: 2.75rem;
	border-radius: 0.75rem;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	background: hsla(14, 80%, 60%, 0.1);
	color: var(--accent-red);
}

.gpu-callout-text {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
}

.gpu-callout-badge {
	font-family: var(--font-mono);
	font-size: 0.75rem;
	font-weight: 700;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--accent-red);
	opacity: 0.85;
}

.gpu-callout-title {
	font-family: var(--font-display);
	font-size: 1rem;
	font-weight: 700;
	letter-spacing: -0.02em;
	color: var(--fg);
}

.gpu-callout-desc {
	font-size: 0.8125rem;
	font-weight: 400;
	line-height: 1.65;
	color: var(--fg-muted);
}

.gpu-inline-badge {
	display: inline-flex;
	align-items: center;
	gap: 1px;
	padding: 0 3px;
	border-radius: 3px;
	background: hsla(14, 80%, 60%, 0.1);
	color: var(--accent-red);
	vertical-align: middle;
}

/* ── GPU Schematic ── */
.gpu-schematic {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	min-width: 0;
}

@media (min-width: 768px) {
	.gpu-schematic {
		border-left: 1px solid var(--bg-separator);
		padding-left: 1.5rem;
	}
}

.gpu-group {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.gpu-group-label {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	font-family: var(--font-mono);
	font-size: 0.5625rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: var(--accent-red);
}

.gpu-group-label--muted {
	color: var(--fg-muted);
}

.gpu-format-ring {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.25rem;
}

.gpu-format {
	font-family: var(--font-mono);
	font-size: 0.625rem;
	font-weight: 700;
	letter-spacing: 0.06em;
	padding: 3px 8px;
	border-radius: 5px;
}

.gpu-format--full {
	background: hsla(14, 80%, 60%, 0.12);
	color: var(--accent-red);
	border: 1px solid hsla(14, 80%, 60%, 0.2);
}

.gpu-format--input {
	background: var(--bg-panel-highlight);
	color: var(--fg-muted);
	border: 1px solid var(--bg-separator);
}

.gpu-arrow {
	font-size: 0.625rem;
	color: var(--accent-red);
	opacity: 0.5;
}

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
