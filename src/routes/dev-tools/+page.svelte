<script lang="ts">
	import { CodeIcon, BracesIcon, HashIcon, Binary, FileTextIcon, GitCompareArrowsIcon, TypeIcon, LinkIcon, ShieldCheckIcon } from 'lucide-svelte';
	import { m } from '$lib/paraglide/messages';

	const categories = $derived([
		{
			label: m['dev_tools.categories.format'](),
			tools: [
				{ href: '/dev-tools/json/', icon: BracesIcon, name: m['dev_tools.tools.json_name'](), desc: m['dev_tools.tools.json_desc']() },
				{ href: '/dev-tools/base64/', icon: Binary, name: m['dev_tools.tools.base64_name'](), desc: m['dev_tools.tools.base64_desc']() },
				{ href: '/dev-tools/url-encode/', icon: LinkIcon, name: m['dev_tools.tools.url_encode_name'](), desc: m['dev_tools.tools.url_encode_desc']() },
				{ href: '/dev-tools/css-minify/', icon: CodeIcon, name: m['dev_tools.tools.css_minify_name'](), desc: m['dev_tools.tools.css_minify_desc']() },
			],
		},
		{
			label: m['dev_tools.categories.analyze'](),
			tools: [
				{ href: '/dev-tools/hash/', icon: HashIcon, name: m['dev_tools.tools.hash_name'](), desc: m['dev_tools.tools.hash_desc']() },
				{ href: '/dev-tools/diff/', icon: GitCompareArrowsIcon, name: m['dev_tools.tools.diff_name'](), desc: m['dev_tools.tools.diff_desc']() },
				{ href: '/dev-tools/word-count/', icon: TypeIcon, name: m['dev_tools.tools.word_count_name'](), desc: m['dev_tools.tools.word_count_desc']() },
				{ href: '/dev-tools/markdown/', icon: FileTextIcon, name: m['dev_tools.tools.markdown_name'](), desc: m['dev_tools.tools.markdown_desc']() },
			],
		},
	]);
</script>

<svelte:head>
	<title>Developer Tools — LocalConvert</title>
	<meta name="description" content="Free browser-based developer tools. JSON formatter, hash generator, Base64 encoder. No uploads, no server." />
	<link rel="canonical" href="https://localconvert.app/dev-tools/" />
	<meta property="og:title" content="Developer Tools — LocalConvert" />
	<meta property="og:description" content="Free browser-based developer tools. JSON formatter, hash generator, Base64 encoder. No uploads, no server." />
	<meta property="og:url" content="https://localconvert.app/dev-tools/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"SoftwareApplication","name":"LocalConvert Developer Tools","url":"https://localconvert.app/dev-tools/","applicationCategory":"DeveloperApplication","operatingSystem":"Any (browser-based)","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"description":"Free browser-based developer tools — JSON formatter, hash generator, Base64 encoder, and more. No uploads, no server."}</script>`}
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
	<!-- Accent line -->
	<div class="accent-line accent-line--purple"></div>

	<div class="flex flex-col items-center text-center gap-4">
		<div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background: var(--accent-purple); color: var(--fg-on-accent)">
			<CodeIcon size={28} />
		</div>
		<div class="flex items-center gap-3">
			<h1 class="text-4xl md:text-5xl font-display tracking-tight">{m['dev_tools.title']()}</h1>
			<span class="tool-count tool-count--purple">8</span>
		</div>
		<p class="text-lg max-w-xl" style="color: var(--fg-muted)">{m['dev_tools.subtitle']()}</p>
		<div class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style="background: var(--bg-badge); color: var(--fg-on-badge)">
			<ShieldCheckIcon size={14} />
			{m['dev_tools.badge']()}
		</div>
	</div>

	{#each categories as cat}
		<section class="flex flex-col gap-4">
			<h2 class="text-xl font-semibold">{cat.label}</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{#each cat.tools as tool}
					{@const Icon = tool.icon}
					<a href={tool.href} class="tool-card">
						<div class="tool-icon">
							<Icon size={20} />
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="tool-name">{tool.name}</span>
							<span class="tool-desc">{tool.desc}</span>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/each}
</div>

<style>
	.tool-card {
		display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 1rem;
		background: var(--bg-panel); box-shadow: var(--shadow-panel); transition: background 0.15s;
	}
	.tool-card:hover { background: var(--bg-panel-alt, var(--bg-panel)); }
	.tool-icon {
		width: 2.5rem; height: 2.5rem; border-radius: 0.75rem;
		display: flex; align-items: center; justify-content: center; flex-shrink: 0;
		background: var(--accent-purple); color: var(--fg-on-accent);
	}
	.tool-name { font-weight: 600; font-size: 0.875rem; }
	.tool-desc { font-size: 0.75rem; color: var(--fg-muted); }

	.accent-line {
		height: 3px;
		border-radius: 2px;
		width: 100%;
	}
	.accent-line--purple { background: var(--accent-purple); }

	.tool-count {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		padding: 3px 10px;
		border-radius: 9999px;
		flex-shrink: 0;
	}
	.tool-count--purple { background: hsla(258, 68%, 62%, 0.12); color: var(--accent-purple); }
</style>
