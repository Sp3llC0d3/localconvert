<script lang="ts">
	import { CodeIcon, BracesIcon, HashIcon, Binary, FileTextIcon, GitCompareArrowsIcon, TypeIcon, LinkIcon, ShieldCheckIcon } from 'lucide-svelte';
	import { m } from '$lib/paraglide/messages';

	const tools = [
		{ href: '/dev-tools/json/', icon: BracesIcon, name: m['dev_tools.tools.json_name'](), desc: m['dev_tools.tools.json_desc']() },
		{ href: '/dev-tools/hash/', icon: HashIcon, name: m['dev_tools.tools.hash_name'](), desc: m['dev_tools.tools.hash_desc']() },
		{ href: '/dev-tools/base64/', icon: Binary, name: m['dev_tools.tools.base64_name'](), desc: m['dev_tools.tools.base64_desc']() },
		{ href: '/dev-tools/markdown/', icon: FileTextIcon, name: m['dev_tools.tools.markdown_name'](), desc: m['dev_tools.tools.markdown_desc']() },
		{ href: '/dev-tools/diff/', icon: GitCompareArrowsIcon, name: m['dev_tools.tools.diff_name'](), desc: m['dev_tools.tools.diff_desc']() },
		{ href: '/dev-tools/word-count/', icon: TypeIcon, name: m['dev_tools.tools.word_count_name'](), desc: m['dev_tools.tools.word_count_desc']() },
		{ href: '/dev-tools/url-encode/', icon: LinkIcon, name: m['dev_tools.tools.url_encode_name'](), desc: m['dev_tools.tools.url_encode_desc']() },
		{ href: '/dev-tools/css-minify/', icon: CodeIcon, name: m['dev_tools.tools.css_minify_name'](), desc: m['dev_tools.tools.css_minify_desc']() },
	];
</script>

<svelte:head>
	<title>Developer Tools — LocalConvert</title>
	<meta name="description" content="Free browser-based developer tools. JSON formatter, hash generator, Base64 encoder. No uploads, no server." />
	<link rel="canonical" href="https://localconvert.app/dev-tools/" />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
	<div class="flex flex-col items-center text-center gap-4">
		<div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background: var(--accent-purple); color: var(--fg-on-accent)">
			<CodeIcon size={28} />
		</div>
		<h1 class="text-4xl md:text-5xl font-display tracking-tight">{m['dev_tools.title']()}</h1>
		<p class="text-lg max-w-xl" style="color: var(--fg-muted)">{m['dev_tools.subtitle']()}</p>
		<div class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style="background: var(--bg-badge); color: var(--fg-on-badge)">
			<ShieldCheckIcon size={14} />
			{m['dev_tools.badge']()}
		</div>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
		{#each tools as tool}
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
</style>
