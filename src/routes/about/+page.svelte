<script lang="ts">
	import { GITHUB_URL, GITHUB_URL_VERT, CONTACT_EMAIL } from "$lib/util/consts";
	import { about_title, about_hero_title, about_why_description, about_stats_tools, about_stats_format_conversions, about_stats_languages, about_stats_bytes_uploaded, about_principles_label, about_principles_p1_title, about_principles_p1_desc, about_principles_p2_title, about_principles_p2_desc, about_principles_p3_title, about_principles_p3_desc, about_inside_label, about_inside_title, landing_toolkit_pdf_title, landing_toolkit_pdf_count, landing_toolkit_image_title, landing_toolkit_image_count, landing_toolkit_dev_title, landing_toolkit_dev_count, about_stack_label, about_stack_title, about_stack_imagemagick, about_stack_ffmpeg, about_stack_webcodecs, about_stack_pandoc, about_stack_pdflib, about_stack_sveltekit, about_credits_title, about_origin_title, about_origin_description, about_credit_groups_engines, about_credit_groups_engines_ffmpeg, about_credit_groups_engines_imagemagick, about_credit_groups_engines_pandoc, about_credit_groups_engines_mediabunny, about_credit_groups_engines_webdemuxer, about_credit_groups_pdf_toolkit, about_credit_groups_pdf_pdflib, about_credit_groups_pdf_pdfjs, about_credit_groups_pdf_encrypt, about_credit_groups_pdf_pptx, about_credit_groups_tool_libs, about_credit_groups_tool_qrcode, about_credit_groups_tool_marked, about_credit_groups_framework, about_credit_groups_fw_sveltekit, about_credit_groups_fw_tailwind, about_credit_groups_fw_lucide, about_credit_groups_fw_paraglide, about_links_source_code, about_links_privacy_policy , meta_descriptions_about} from "$lib/paraglide/messages/_barrel.js";
	import { localizeHref } from "$lib/paraglide/runtime";
	import { sanitize } from "$lib/util/sanitize";
	import { GithubIcon, MailIcon, ShieldIcon, ExternalLinkIcon, ZapIcon, FileTextIcon, ImageIcon, CodeIcon, ArrowRight } from "lucide-svelte";
</script>

<svelte:head>
	<title>{about_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_about()} />
	<link rel="canonical" href="https://localconvert.app/about/" />
	<meta property="og:title" content="{about_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_about()} />
	<meta property="og:url" content="https://localconvert.app/about/" />
</svelte:head>

<div class="about-page">

	<!-- ═══ HERO ═══ -->
	<section class="about-hero">
		<span class="about-mono-label">{about_title()}</span>
		<h1 class="about-title">{about_hero_title()}</h1>
		<p class="about-lead">
			{@html sanitize(about_why_description())}
		</p>
	</section>

	<!-- ═══ NUMBERS ═══ -->
	<section class="about-numbers">
		<div class="about-stat">
			<span class="about-stat-number">39</span>
			<span class="about-stat-label">{about_stats_tools()}</span>
		</div>
		<div class="about-stat-sep"></div>
		<div class="about-stat">
			<span class="about-stat-number">200+</span>
			<span class="about-stat-label">{about_stats_format_conversions()}</span>
		</div>
		<div class="about-stat-sep"></div>
		<div class="about-stat">
			<span class="about-stat-number">28</span>
			<span class="about-stat-label">{about_stats_languages()}</span>
		</div>
		<div class="about-stat-sep"></div>
		<div class="about-stat">
			<span class="about-stat-number">0</span>
			<span class="about-stat-label">{about_stats_bytes_uploaded()}</span>
		</div>
	</section>

	<!-- ═══ PRINCIPLES ═══ -->
	<section class="about-section">
		<span class="about-mono-label">{about_principles_label()}</span>
		<div class="about-principles">
			<div class="about-principle">
				<span class="about-principle-num">01</span>
				<div>
					<h3 class="about-principle-title">{about_principles_p1_title()}</h3>
					<p class="about-principle-desc">{about_principles_p1_desc()}</p>
				</div>
			</div>
			<div class="about-principle">
				<span class="about-principle-num">02</span>
				<div>
					<h3 class="about-principle-title">{about_principles_p2_title()}</h3>
					<p class="about-principle-desc">{about_principles_p2_desc()}</p>
				</div>
			</div>
			<div class="about-principle">
				<span class="about-principle-num">03</span>
				<div>
					<h3 class="about-principle-title">{about_principles_p3_title()}</h3>
					<p class="about-principle-desc">{about_principles_p3_desc()}</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══ WHAT'S INSIDE ═══ -->
	<section class="about-section">
		<span class="about-mono-label">{about_inside_label()}</span>
		<h2 class="about-section-title">{about_inside_title()}</h2>

		<div class="about-tools-grid">
			<a href={localizeHref("/pdf-tools/")} class="about-tool-card" style="--tool-color: var(--accent-green)">
				<FileTextIcon size={20} />
				<div>
					<span class="about-tool-name">{landing_toolkit_pdf_title()}</span>
					<span class="about-tool-count">{landing_toolkit_pdf_count()}</span>
				</div>
				<ArrowRight size={14} class="about-tool-arrow icon-flip" />
			</a>
			<a href={localizeHref("/image-tools/")} class="about-tool-card" style="--tool-color: var(--accent-blue)">
				<ImageIcon size={20} />
				<div>
					<span class="about-tool-name">{landing_toolkit_image_title()}</span>
					<span class="about-tool-count">{landing_toolkit_image_count()}</span>
				</div>
				<ArrowRight size={14} class="about-tool-arrow icon-flip" />
			</a>
			<a href={localizeHref("/dev-tools/")} class="about-tool-card" style="--tool-color: var(--accent-purple)">
				<CodeIcon size={20} />
				<div>
					<span class="about-tool-name">{landing_toolkit_dev_title()}</span>
					<span class="about-tool-count">{landing_toolkit_dev_count()}</span>
				</div>
				<ArrowRight size={14} class="about-tool-arrow icon-flip" />
			</a>
		</div>
	</section>

	<!-- ═══ TECH STACK ═══ -->
	<section class="about-section">
		<span class="about-mono-label">{about_stack_label()}</span>
		<h2 class="about-section-title">{about_stack_title()}</h2>

		<div class="about-stack">
			<div class="about-stack-item"><span class="about-stack-name">ImageMagick</span><span class="about-stack-line"></span><span class="about-stack-role">{about_stack_imagemagick()}</span></div>
			<div class="about-stack-item"><span class="about-stack-name">FFmpeg</span><span class="about-stack-line"></span><span class="about-stack-role">{about_stack_ffmpeg()}</span></div>
			<div class="about-stack-item"><span class="about-stack-name">WebCodecs <ZapIcon size={11} class="about-stack-gpu" /></span><span class="about-stack-line"></span><span class="about-stack-role">{about_stack_webcodecs()}</span></div>
			<div class="about-stack-item"><span class="about-stack-name">Pandoc</span><span class="about-stack-line"></span><span class="about-stack-role">{about_stack_pandoc()}</span></div>
			<div class="about-stack-item"><span class="about-stack-name">pdf-lib + pdf.js</span><span class="about-stack-line"></span><span class="about-stack-role">{about_stack_pdflib()}</span></div>
			<div class="about-stack-item"><span class="about-stack-name">SvelteKit</span><span class="about-stack-line"></span><span class="about-stack-role">{about_stack_sveltekit()}</span></div>
		</div>
	</section>

	<!-- ═══ CREDITS ═══ -->
	<section class="about-section">
		<span class="about-mono-label">{about_credits_title()}</span>

		<div class="about-credits">
			<div class="about-credit-block">
				<h3 class="about-credit-heading">{about_origin_title()}</h3>
				<p class="about-credit-text">{about_origin_description()}</p>
			</div>

			<div class="about-credit-block">
				<h3 class="about-credit-heading">{about_credit_groups_engines()}</h3>
				<div class="about-stack about-stack--compact">
					<div class="about-stack-item"><span class="about-stack-name">FFmpeg</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_engines_ffmpeg()}</span></div>
					<div class="about-stack-item"><span class="about-stack-name">ImageMagick</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_engines_imagemagick()}</span></div>
					<div class="about-stack-item"><span class="about-stack-name">Pandoc</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_engines_pandoc()}</span></div>
					<div class="about-stack-item"><span class="about-stack-name">Mediabunny</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_engines_mediabunny()}</span></div>
					<div class="about-stack-item"><span class="about-stack-name">web-demuxer</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_engines_webdemuxer()}</span></div>
				</div>
			</div>

			<div class="about-credit-block">
				<h3 class="about-credit-heading">{about_credit_groups_pdf_toolkit()}</h3>
				<div class="about-stack about-stack--compact">
					<div class="about-stack-item"><span class="about-stack-name">pdf-lib</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_pdf_pdflib()}</span></div>
					<div class="about-stack-item"><span class="about-stack-name">pdfjs-dist</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_pdf_pdfjs()}</span></div>
					<div class="about-stack-item"><span class="about-stack-name">pdf-lib-plus-encrypt</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_pdf_encrypt()}</span></div>
					<div class="about-stack-item"><span class="about-stack-name">pptxgenjs</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_pdf_pptx()}</span></div>
				</div>
			</div>

			<div class="about-credit-block">
				<h3 class="about-credit-heading">{about_credit_groups_tool_libs()}</h3>
				<div class="about-stack about-stack--compact">
					<div class="about-stack-item"><span class="about-stack-name">qrcode</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_tool_qrcode()}</span></div>
					<div class="about-stack-item"><span class="about-stack-name">marked</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_tool_marked()}</span></div>
				</div>
			</div>

			<div class="about-credit-block">
				<h3 class="about-credit-heading">{about_credit_groups_framework()}</h3>
				<div class="about-stack about-stack--compact">
					<div class="about-stack-item"><span class="about-stack-name">SvelteKit</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_fw_sveltekit()}</span></div>
					<div class="about-stack-item"><span class="about-stack-name">Tailwind CSS</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_fw_tailwind()}</span></div>
					<div class="about-stack-item"><span class="about-stack-name">Lucide</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_fw_lucide()}</span></div>
					<div class="about-stack-item"><span class="about-stack-name">Paraglide-JS</span><span class="about-stack-line"></span><span class="about-stack-role">{about_credit_groups_fw_paraglide()}</span></div>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══ LINKS ═══ -->
	<section class="about-section about-links-section">
		<div class="about-links">
			<a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" class="about-link">
				<GithubIcon size={18} />
				<span>{about_links_source_code()}</span>
				<ExternalLinkIcon size={12} class="about-link-ext" />
			</a>
			<a href="mailto:{CONTACT_EMAIL}" class="about-link">
				<MailIcon size={18} />
				<span>{CONTACT_EMAIL}</span>
				<ExternalLinkIcon size={12} class="about-link-ext" />
			</a>
			<a href={localizeHref("/privacy/")} class="about-link">
				<ShieldIcon size={18} />
				<span>{about_links_privacy_policy()}</span>
				<ArrowRight size={12} class="about-link-ext icon-flip" />
			</a>
		</div>
	</section>

</div>

<style>
	.about-page {
		max-width: 48rem;
		margin: 0 auto;
		padding: 2rem 1.5rem 5rem;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	/* ── Shared ── */
	.about-mono-label {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent);
		opacity: 0.8;
		display: block;
		margin-bottom: 0.75rem;
	}

	.about-section {
		padding: 3rem 0;
		border-top: 1px solid var(--bg-separator);
	}

	.about-section-title {
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 3vw, 1.75rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.15;
		margin-bottom: 1.75rem;
	}

	/* ── Hero ── */
	.about-hero {
		padding: 2rem 0 3rem;
	}

	.about-title {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 4.5vw, 2.5rem);
		font-weight: 700;
		letter-spacing: -0.04em;
		line-height: 1.1;
		margin-bottom: 1.5rem;
	}

	.about-lead {
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.75;
		color: var(--fg-muted);
		max-width: 38rem;
	}

	.about-lead :global(b) {
		color: var(--fg);
		font-weight: 600;
	}

	/* ── Numbers ── */
	.about-numbers {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1.5rem;
		padding: 2rem 1.5rem;
		border-radius: 1rem;
		background: var(--bg-panel);
		box-shadow: var(--shadow-panel);
		border: 1px solid var(--bg-separator);
		margin-bottom: 0.5rem;
	}

	.about-stat {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		flex: 1;
		min-width: 5rem;
	}

	.about-stat-number {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 5vw, 2.75rem);
		font-weight: 700;
		letter-spacing: -0.04em;
		line-height: 1;
		color: var(--accent);
	}

	.about-stat-label {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-muted);
	}

	.about-stat-sep {
		width: 1px;
		height: 2.5rem;
		background: var(--bg-separator);
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.about-stat-sep { display: none; }
		.about-numbers { gap: 1rem; }
	}

	/* ── Principles ── */
	.about-principles {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.about-principle {
		display: flex;
		gap: 1.25rem;
		align-items: flex-start;
	}

	.about-principle-num {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--bg-separator);
		line-height: 1;
		flex-shrink: 0;
		width: 2.5rem;
		padding-top: 0.125rem;
	}

	.about-principle-title {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin-bottom: 0.25rem;
	}

	.about-principle-desc {
		font-size: 0.875rem;
		font-weight: 400;
		line-height: 1.65;
		color: var(--fg-muted);
	}

	/* ── Tool cards ── */
	.about-tools-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.about-tool-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		border-radius: 0.75rem;
		background: var(--bg-panel);
		border: 1px solid var(--bg-separator);
		color: var(--tool-color);
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.about-tool-card:hover {
		border-color: var(--tool-color);
		background: var(--bg-panel-highlight);
	}

	.about-tool-card div {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.about-tool-name {
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--fg);
	}

	.about-tool-count {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--fg-muted);
	}

	:global(.about-tool-arrow) {
		color: var(--fg-muted);
		flex-shrink: 0;
		transition: transform 0.15s ease;
	}

	.about-tool-card:hover :global(.about-tool-arrow) {
		transform: translateX(3px);
		color: var(--tool-color);
	}

	/* ── Tech stack ── */
	.about-stack {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.about-stack-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.about-stack-name {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		color: var(--fg);
		white-space: nowrap;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	:global(.about-stack-gpu) {
		color: var(--accent-red);
	}

	.about-stack-line {
		flex: 1;
		height: 1px;
		background: var(--bg-separator);
		min-width: 1rem;
	}

	.about-stack-role {
		font-size: 0.75rem;
		color: var(--fg-muted);
		font-weight: 400;
		white-space: nowrap;
	}

	.about-stack--compact {
		gap: 0.5rem;
	}

	.about-stack--compact .about-stack-name {
		font-size: 0.75rem;
	}

	.about-stack--compact .about-stack-role {
		font-size: 0.6875rem;
	}

	@media (max-width: 480px) {
		.about-stack-item { flex-wrap: wrap; }
		.about-stack-line { display: none; }
		.about-stack-role { font-size: 0.6875rem; }
	}

	/* ── Credits ── */
	.about-credits {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.about-credit-block {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.about-credit-heading {
		font-family: var(--font-display);
		font-size: clamp(1.125rem, 2.5vw, 1.5rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.15;
	}

	.about-credit-text {
		font-size: 0.875rem;
		font-weight: 400;
		line-height: 1.65;
		color: var(--fg-muted);
	}

	.about-credit-text :global(a) {
		color: var(--accent);
		text-decoration: underline;
	}

	/* ── Links ── */
	.about-links-section {
		border-bottom: none;
	}

	.about-links {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.about-link {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		background: var(--bg-panel);
		border: 1px solid var(--bg-separator);
		color: var(--fg);
		text-decoration: none;
		font-size: 0.8125rem;
		font-weight: 600;
		transition: all 0.15s ease;
	}

	.about-link:hover {
		background: var(--bg-panel-highlight);
		border-color: var(--accent);
	}

	.about-link span {
		flex: 1;
	}

	:global(.about-link-ext) {
		color: var(--fg-muted);
		flex-shrink: 0;
	}

	.about-link:hover :global(.about-link-ext) {
		color: var(--accent);
	}
</style>
