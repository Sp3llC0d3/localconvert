<script lang="ts">
	import { GITHUB_URL } from "$lib/util/consts";
	import { footer_tagline, footer_pdf_tools_count, footer_image_tools_count, footer_dev_tools_count, footer_source_code, footer_privacy_policy, footer_copyright } from "$lib/paraglide/messages/_barrel.js";

	const year = new Date().getFullYear();
</script>

<footer class="footer-wrap">
	<div class="footer-inner">
		<!-- Brand -->
		<div class="footer-brand">
			<span class="footer-name">LocalConvert</span>
			<span class="footer-tagline">{footer_tagline()}</span>
		</div>

		<!-- Tool categories -->
		<nav class="footer-tools" aria-label="Tool categories">
			<a href="/pdf-tools/" class="footer-tool-link">
				<span class="category-dot category-dot--pdf"></span>
				{footer_pdf_tools_count()}
			</a>
			<a href="/image-tools/" class="footer-tool-link">
				<span class="category-dot category-dot--image"></span>
				{footer_image_tools_count()}
			</a>
			<a href="/dev-tools/" class="footer-tool-link">
				<span class="category-dot category-dot--dev"></span>
				{footer_dev_tools_count()}
			</a>
		</nav>

		<!-- Links -->
		<div class="footer-links">
			<a class="footer-link" href={GITHUB_URL} target="_blank">
				{footer_source_code()}
			</a>
			<span class="footer-sep">&bull;</span>
			<a class="footer-link" href="/privacy/">
				{footer_privacy_policy()}
			</a>
		</div>
	</div>

	<!-- Copyright -->
	<div class="footer-copyright">
		{footer_copyright({ year })}
	</div>

	<div
		class="absolute bottom-0 left-0 w-full h-24 -z-10 pointer-events-none"
		style="background: linear-gradient(to bottom, transparent, var(--bg) 100%)"
	></div>
</footer>

<style lang="postcss">
.footer-wrap {
	@apply w-full border-t border-separator static md:fixed md:bottom-0;
	padding: 1rem 1.5rem 0.75rem;
	position: relative;
	background: var(--bg);
}

.footer-inner {
	@apply max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6;
}

.footer-brand {
	@apply flex items-center gap-2;
}

.footer-name {
	font-family: var(--font-display);
	font-size: 0.8rem;
	font-weight: 700;
	letter-spacing: -0.03em;
	color: var(--fg);
}

.footer-tagline {
	font-size: 0.7rem;
	color: var(--fg-muted);
	font-weight: 400;
}

.footer-tools {
	@apply flex items-center gap-4 flex-wrap justify-center;
}

.footer-tool-link {
	@apply flex items-center gap-1.5 text-muted font-normal no-underline;
	font-size: 0.7rem;
	transition: color 0.15s ease;
}

.footer-tool-link:hover {
	color: var(--fg);
}

.footer-links {
	@apply flex items-center gap-2 text-muted;
	font-size: 0.7rem;
}

.footer-link {
	@apply font-normal no-underline;
	color: var(--fg-muted);
	transition: color 0.15s ease;
}

.footer-link:hover {
	color: var(--fg);
	text-decoration: underline;
}

.footer-sep {
	@apply text-muted;
	font-size: 0.5rem;
}

.footer-copyright {
	@apply text-center mt-2;
	font-size: 0.6rem;
	color: var(--fg-muted);
	opacity: 0.7;
}
</style>
