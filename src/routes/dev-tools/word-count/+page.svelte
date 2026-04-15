<script lang="ts">
	const __nkm = {'dev_tools.tools.diff_name': dev_tools_tools_diff_name, 'dev_tools.tools.markdown_name': dev_tools_tools_markdown_name, 'dev_tools.tools.json_name': dev_tools_tools_json_name};
	import { tool_pages_word_count_title, tool_pages_word_count_desc, tools_common_back_dev, tool_pages_word_count_placeholder, tool_pages_word_count_words, tool_pages_word_count_characters, tool_pages_word_count_chars_no_spaces, tool_pages_word_count_sentences, tool_pages_word_count_paragraphs, tool_pages_word_count_reading_time, tools_common_privacy_note_browser, tool_pages_dev_word_count_seo_faq1_q, tool_pages_dev_word_count_seo_faq1_a, tool_pages_dev_word_count_seo_faq2_q, tool_pages_dev_word_count_seo_faq2_a, dev_tools_tools_diff_name, dev_tools_tools_markdown_name, dev_tools_tools_json_name } from "$lib/paraglide/messages/_barrel.js";
	import { TypeIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let text = $state('');

	const stats = $derived.by(() => {
		const t = text;
		const chars = t.length;
		const charsNoSpaces = t.replace(/\s/g, '').length;
		const words = t.trim() ? t.trim().split(/\s+/).length : 0;
		const sentences = t.trim() ? (t.match(/[.!?]+/g) || []).length || (words > 0 ? 1 : 0) : 0;
		const paragraphs = t.trim() ? t.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
		const readingTime = Math.max(1, Math.ceil(words / 200)); // ~200 wpm
		return { chars, charsNoSpaces, words, sentences, paragraphs, readingTime };
	});
</script>

<svelte:head>
	<title>Word Counter — LocalConvert</title>
	<meta name="description" content="Count words, characters, sentences, and estimate reading time. Free, private, runs in your browser." />
	<link rel="canonical" href="https://localconvert.app/dev-tools/word-count/" />
	<meta property="og:title" content="Word Counter — LocalConvert" />
	<meta property="og:description" content="Count words, characters, sentences, and estimate reading time. Free, private, runs in your browser." />
	<meta property="og:url" content="https://localconvert.app/dev-tools/word-count/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"How to Count Words Online","step":[{"@type":"HowToStep","text":"Paste or type your text into the editor"},{"@type":"HowToStep","text":"View word count, character count, and reading time instantly"},{"@type":"HowToStep","text":"Use the stats to check document requirements"}]}</script>`}
</svelte:head>

<div class="wc-page">
	<ToolPageHeader
		category="dev"
		title={tool_pages_word_count_title()}
		description={tool_pages_word_count_desc()}
		icon={TypeIcon}
		backHref="/dev-tools/"
		backLabel={tools_common_back_dev()}
	/>

	<textarea bind:value={text} class="text-area" placeholder={tool_pages_word_count_placeholder()} spellcheck="false"></textarea>

	<div class="stats-grid">
		<div class="stat-card">
			<span class="stat-value">{stats.words}</span>
			<span class="stat-label">{tool_pages_word_count_words()}</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{stats.chars}</span>
			<span class="stat-label">{tool_pages_word_count_characters()}</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{stats.charsNoSpaces}</span>
			<span class="stat-label">{tool_pages_word_count_chars_no_spaces()}</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{stats.sentences}</span>
			<span class="stat-label">{tool_pages_word_count_sentences()}</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{stats.paragraphs}</span>
			<span class="stat-label">{tool_pages_word_count_paragraphs()}</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{stats.readingTime}</span>
			<span class="stat-label">{tool_pages_word_count_reading_time()}</span>
		</div>
	</div>

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note_browser()}</p>

	{#if toolSeo['dev-word-count']}
		<ToolSeoBlock
			faqs={toolSeo['dev-word-count'].faqKeys.length >= 4 ? [
				{ q: tool_pages_dev_word_count_seo_faq1_q?.() ?? '', a: tool_pages_dev_word_count_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_dev_word_count_seo_faq2_q?.() ?? '', a: tool_pages_dev_word_count_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['dev-word-count'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.wc-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.text-area {
		width: 100%; min-height: 14rem; padding: 0.75rem; border-radius: 0.5rem; resize: vertical;
		font-size: 0.875rem; line-height: 1.6;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.text-area:focus { outline: 1.5px solid var(--accent); }
	.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
	@media (max-width: 480px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
	.stat-card {
		display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
		padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel);
	}
	.stat-value { font-size: 1.5rem; font-weight: 700; font-family: 'Azeret Mono', monospace; }
	.stat-label { font-size: 0.6875rem; font-weight: 600; color: var(--fg-muted); text-transform: uppercase; letter-spacing: 0.05em; }
</style>
