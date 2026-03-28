<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { TypeIcon } from 'lucide-svelte';

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
</svelte:head>

<div class="wc-page">
	<a href="/dev-tools/" class="text-sm text-muted hover:underline">{m['tools_common.back_dev']()}</a>
	<div class="wc-header">
		<TypeIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">{m['tool_pages.word_count.title']()}</h1>
			<p class="text-sm text-muted">{m['tool_pages.word_count.desc']()}</p>
		</div>
	</div>

	<textarea bind:value={text} class="text-area" placeholder={m['tool_pages.word_count.placeholder']()} spellcheck="false"></textarea>

	<div class="stats-grid">
		<div class="stat-card">
			<span class="stat-value">{stats.words}</span>
			<span class="stat-label">{m['tool_pages.word_count.words']()}</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{stats.chars}</span>
			<span class="stat-label">{m['tool_pages.word_count.characters']()}</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{stats.charsNoSpaces}</span>
			<span class="stat-label">{m['tool_pages.word_count.chars_no_spaces']()}</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{stats.sentences}</span>
			<span class="stat-label">{m['tool_pages.word_count.sentences']()}</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{stats.paragraphs}</span>
			<span class="stat-label">{m['tool_pages.word_count.paragraphs']()}</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{stats.readingTime}</span>
			<span class="stat-label">{m['tool_pages.word_count.reading_time']()}</span>
		</div>
	</div>

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note_browser']()}</p>
</div>

<style>
	.wc-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.wc-header { display: flex; align-items: center; gap: 0.75rem; }
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
