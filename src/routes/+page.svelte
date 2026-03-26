<script lang="ts">
	import Uploader from "$lib/components/functional/Uploader.svelte";
	import Tooltip from "$lib/components/visual/Tooltip.svelte";
	import { converters } from "$lib/converters";
	import clsx from "clsx";
	import { AudioLines, BookText, Check, Film, Image, ShieldCheck, Code, Zap, Ban } from "lucide-svelte";
	import { m } from "$lib/paraglide/messages";
	import { OverlayScrollbarsComponent } from "overlayscrollbars-svelte";
	import { browser } from "$app/environment";
	import "overlayscrollbars/overlayscrollbars.css";
	import { onMount } from "svelte";
	import type { WorkerStatus } from "$lib/converters/converter.svelte";
	import { sanitize } from "$lib/store/index.svelte";

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
			status: WorkerStatus;
		};
	} = $derived.by(() => {
		const output: {
			[key: string]: {
				formats: string;
				icon: typeof Image;
				title: string;
				status: WorkerStatus;
			};
		} = {
			Images: {
				formats: getSupportedFormats("imagemagick"),
				icon: Image,
				title: m["upload.cards.images"](),
				status:
					converters.find((c) => c.name === "imagemagick")?.status ||
					"not-ready",
			},
			Audio: {
				formats: getSupportedFormats("ffmpeg", true),
				icon: AudioLines,
				title: m["upload.cards.audio"](),
				status:
					converters.find((c) => c.name === "ffmpeg")?.status ||
					"not-ready",
			},
			Video: {
				formats: getSupportedFormats("ffmpeg", false),
				icon: Film,
				title: m["upload.cards.video"](),
				status:
					converters.find((c) => c.name === "ffmpeg")?.status ||
					"not-ready",
			},
			Documents: {
				formats: getSupportedFormats("pandoc"),
				icon: BookText,
				title: m["upload.cards.documents"](),
				status:
					converters.find((c) => c.name === "pandoc")?.status ||
					"not-ready",
			},
		};

		return output;
	});

	const getTooltip = (format: string) => {
		const converter = converters.find((c) =>
			c.supportedFormats.some((sf) => sf.name === format),
		);

		const formatInfo = converter?.supportedFormats.find(
			(sf) => sf.name === format,
		);

		if (formatInfo) {
			const direction = formatInfo.fromSupported
				? m["upload.tooltip.direction_input"]()
				: m["upload.tooltip.direction_output"]();
			return m["upload.tooltip.partial_support"]({ direction });
		}
		return "";
	};

	const getStatusText = (status: WorkerStatus) => {
		switch (status) {
			case "downloading":
				return m["upload.cards.status.downloading"]();
			case "ready":
				return m["upload.cards.status.ready"]();
			default:
				return m["upload.cards.status.not_ready"]();
		}
	};

	let scrollContainers: HTMLElement[] = $state([]);
	// svelte-ignore state_referenced_locally
	let showBlur = $state(Array(Object.keys(worker).length).fill(false));

	onMount(() => {
		const handleResize = () => {
			for (let i = 0; i < scrollContainers.length; i++) {
				const container = scrollContainers[i];
				if (!container) return;
				showBlur[i] = container.scrollHeight > container.clientHeight;
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	});

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
	<meta name="description" content="Free, private file converter. Convert images, audio, video, and documents in your browser — no uploads, no accounts, no file size limits. Completely open source." />
	{@html `<script type="application/ld+json">${softwareSchema}</script>`}
	{@html `<script type="application/ld+json">${websiteSchema}</script>`}
</svelte:head>

<!-- ═══════════════════════════════════════════════════════
     HERO SECTION
═══════════════════════════════════════════════════════ -->
<section class="hero-section relative w-full overflow-hidden">
	<div class="hero-bg absolute inset-0 bg-cover bg-center bg-no-repeat"></div>
	<div class="hero-overlay absolute inset-0"></div>

	<div class="relative max-w-6xl mx-auto px-6 md:px-8 pt-12 md:pt-20 pb-20 md:pb-28 flex flex-col items-center">
		<!-- Feature pills -->
		<div class="flex flex-wrap justify-center gap-2 mb-8">
			{#each pills as pill}
				{@const Icon = pill.icon}
				<span class="pill">
					<Icon size="14" />
					{pill.label}
				</span>
			{/each}
		</div>

		<!-- Headline -->
		<h1 class="text-3xl md:text-6xl text-center font-display tracking-tight leading-tight md:leading-[1.15] mb-5 max-w-3xl">
			{m["upload.title"]()}
		</h1>
		<p class="text-lg md:text-xl text-center max-w-2xl mb-10 dynadark:text-muted text-muted">
			{m["upload.subtitle"]()}
		</p>

		<!-- Uploader -->
		<div class="w-full max-w-xl h-44 md:h-56">
			<Uploader class="w-full h-full" />
		</div>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════
     HOW IT WORKS
═══════════════════════════════════════════════════════ -->
<section class="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-24 w-full">
	<h2 class="text-3xl md:text-4xl text-center mb-12">{m["landing.how_it_works.title"]()}</h2>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
		{#each steps as step, i}
			<div class="step-card">
				<div class="step-number">{i + 1}</div>
				<img src={step.img} alt={step.title} class="step-img" />
				<h3 class="text-xl font-semibold mt-5 mb-2">{step.title}</h3>
				<p class="text-sm font-normal text-muted">{step.desc}</p>
			</div>
		{/each}
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════
     SUPPORTED FORMATS
═══════════════════════════════════════════════════════ -->
<section class="max-w-6xl mx-auto px-6 md:px-8 pb-16 md:pb-24 w-full">
	<h2 class="text-3xl md:text-4xl text-center mb-10">{m["landing.formats.title"]()}</h2>

	<div class="flex gap-4 md:flex-row flex-col">
		{#if browser}
			{#each Object.entries(worker) as [key, s], i}
				{@const Icon = s.icon}
				<div class="file-category-card w-full flex flex-col gap-4">
					<div class="file-category-card-inner">
						<div
							class={clsx("icon-container", {
								"bg-accent-blue": key === "Images",
								"bg-accent-purple": key === "Audio",
								"bg-accent-green": key === "Documents",
								"bg-accent-red": key === "Video",
							})}
						>
							<Icon size="20" />
						</div>
						<span>{s.title}</span>
					</div>

					<div class="file-category-card-content flex-grow relative">
						<OverlayScrollbarsComponent
							options={{
								scrollbars: {
									autoHide: "move",
									autoHideDelay: 1500,
								},
							}}
							defer
						>
							<div
								class="flex flex-col gap-4 h-[12.25rem] relative"
								bind:this={scrollContainers[i]}
							>
								<p class="flex items-center justify-center gap-2">
									<Check size="20" />
									{m["upload.cards.local_supported"]()}
								</p>
								<p>
									{@html sanitize(m["upload.cards.status.text"]({
										status: getStatusText(s.status),
									}))}
								</p>
								<div class="flex flex-col items-center relative">
									<b>{m["upload.cards.supported_formats"]()}&nbsp;</b>
									<p class="flex flex-wrap justify-center leading-tight px-2">
										{#each s.formats.split(", ") as format, index}
											{@const isPartial = format.endsWith("*")}
											{@const formatName = isPartial ? format.slice(0, -1) : format}
											<span class="text-sm font-normal flex items-center relative">
												{#if isPartial}
													<Tooltip text={getTooltip(formatName)}>
														{formatName}<span class="text-red-500">*</span>
													</Tooltip>
												{:else}
													{formatName}
												{/if}
												{#if index < s.formats.split(", ").length - 1}
													<span>,&nbsp;</span>
												{/if}
											</span>
										{/each}
									</p>
								</div>
							</div>
						</OverlayScrollbarsComponent>
						{#if showBlur[i]}
							<div
								class="absolute left-0 bottom-0 w-full h-10 pointer-events-none"
								style={`background: linear-gradient(to top, var(--bg-panel), transparent 100%);`}
							></div>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════
     PRIVACY SECTION
═══════════════════════════════════════════════════════ -->
<section class="privacy-section w-full py-16 md:py-20">
	<div class="max-w-6xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center gap-8 md:gap-16">
		<div class="flex-shrink-0">
			<img
				src={privacyBadge}
				alt="Privacy badge"
				class="w-32 h-32 md:w-52 md:h-52 object-contain"
			/>
		</div>
		<div>
			<h2 class="text-3xl md:text-4xl mb-6">{m["landing.privacy.title"]()}</h2>
			<ul class="flex flex-col gap-4">
				{#each [m["landing.privacy.point1"](), m["landing.privacy.point2"](), m["landing.privacy.point3"]()] as point}
					<li class="flex items-start gap-3">
						<span class="privacy-check-icon flex-shrink-0 mt-0.5">
							<Check size="18" />
						</span>
						<span class="text-lg font-normal">{point}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<!-- ═══════════════════════════════════════════════════════
     FAQ SECTION
═══════════════════════════════════════════════════════ -->
<section class="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-24 w-full">
	<h2 class="text-3xl md:text-4xl text-center mb-10">{m["landing.faq.title"]()}</h2>

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
	/* ── Hero ── */
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
		background: linear-gradient(
			to bottom,
			hsla(0, 0%, 7%, 0.45) 0%,
			var(--bg) 100%
		);
	}

	:global(.light) .hero-overlay {
		background: linear-gradient(
			to bottom,
			hsl(158, 60%, 88%) 0%,
			var(--bg) 65%
		);
	}

	@media (prefers-color-scheme: light) {
		:global(:root:not(.dark)) .hero-overlay {
			background: linear-gradient(
				to bottom,
				hsl(158, 60%, 88%) 0%,
				var(--bg) 65%
			);
		}
	}

	/* ── Pills ── */
	.pill {
		@apply flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium;
		background-color: var(--bg-badge);
		color: var(--fg-on-badge);
	}

	/* ── How It Works ── */
	.step-card {
		@apply bg-panel rounded-2xl p-6 shadow-panel text-center flex flex-col items-center relative;
	}

	.step-number {
		@apply absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold;
		background-color: var(--bg-badge);
		color: var(--fg-on-badge);
	}

	.step-img {
		@apply w-full max-w-[12rem] h-44 object-contain mx-auto;
	}

	/* ── Format cards (kept from original) ── */
	.file-category-card {
		@apply bg-panel rounded-2xl p-5 shadow-panel relative;
	}

	.file-category-card p {
		@apply font-normal text-center text-sm;
	}

	.file-category-card-inner {
		@apply flex items-center justify-center gap-3 text-xl;
	}

	.file-category-card-content {
		@apply flex flex-col text-center justify-between;
	}

	.icon-container {
		@apply p-2 rounded-full text-on-accent;
	}

	/* ── Privacy section ── */
	.privacy-section {
		background-color: var(--bg-panel);
	}

	.privacy-check-icon {
		@apply flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0;
		background-color: var(--bg-badge);
		color: var(--fg-on-badge);
	}

	/* ── FAQ ── */
	.faq-item {
		@apply bg-panel rounded-2xl shadow-panel overflow-hidden;
	}

	.faq-question {
		@apply flex items-center justify-between gap-4 px-6 py-4 cursor-pointer select-none list-none;
		font-size: 1rem;
		font-weight: 600;
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
		color: var(--fg-muted);
	}
</style>
