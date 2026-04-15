<script lang="ts">
	const __nkm = {'dev_tools.tools.json_name': dev_tools_tools_json_name, 'dev_tools.tools.word_count_name': dev_tools_tools_word_count_name, 'dev_tools.tools.markdown_name': dev_tools_tools_markdown_name};
	import { tool_pages_diff_title, tool_pages_diff_desc, tools_common_back_dev, tool_pages_diff_original, tool_pages_diff_modified, tool_pages_diff_btn, tools_common_privacy_note_browser, tool_pages_dev_diff_seo_faq1_q, tool_pages_dev_diff_seo_faq1_a, tool_pages_dev_diff_seo_faq2_q, tool_pages_dev_diff_seo_faq2_a, dev_tools_tools_json_name, dev_tools_tools_word_count_name, dev_tools_tools_markdown_name } from "$lib/paraglide/messages/_barrel.js";
	import { GitCompareArrowsIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let textA = $state('Hello World\nThis is line 2\nLine three here\nFourth line');
	let textB = $state('Hello World\nThis line was changed\nLine three here\nFourth line\nNew fifth line');
	let diffResult = $state<{ type: 'same' | 'add' | 'remove'; text: string }[]>([]);

	function compare() {
		const linesA = textA.split('\n');
		const linesB = textB.split('\n');
		const result: typeof diffResult = [];

		// Simple line-by-line diff using LCS
		const lcs = computeLCS(linesA, linesB);
		let ia = 0, ib = 0, il = 0;

		while (ia < linesA.length || ib < linesB.length) {
			if (il < lcs.length && ia < linesA.length && linesA[ia] === lcs[il]) {
				// Skip any lines in B before this LCS match
				while (ib < linesB.length && linesB[ib] !== lcs[il]) {
					result.push({ type: 'add', text: linesB[ib] });
					ib++;
				}
				result.push({ type: 'same', text: linesA[ia] });
				ia++; ib++; il++;
			} else if (ia < linesA.length && (il >= lcs.length || linesA[ia] !== lcs[il])) {
				result.push({ type: 'remove', text: linesA[ia] });
				ia++;
			} else if (ib < linesB.length) {
				result.push({ type: 'add', text: linesB[ib] });
				ib++;
			}
		}

		diffResult = result;
	}

	function computeLCS(a: string[], b: string[]): string[] {
		const m = a.length, n = b.length;
		const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
		for (let i = 1; i <= m; i++) {
			for (let j = 1; j <= n; j++) {
				dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
			}
		}
		const result: string[] = [];
		let i = m, j = n;
		while (i > 0 && j > 0) {
			if (a[i - 1] === b[j - 1]) { result.unshift(a[i - 1]); i--; j--; }
			else if (dp[i - 1][j] > dp[i][j - 1]) i--;
			else j--;
		}
		return result;
	}
</script>

<svelte:head>
	<title>{tool_pages_diff_title()} — LocalConvert</title>
	<meta name="description" content="Compare two texts and see the differences highlighted. Free, private, runs in your browser." />
	<link rel="canonical" href="https://localconvert.app/dev-tools/diff/" />
	<meta property="og:title" content="Text Diff — LocalConvert" />
	<meta property="og:description" content="Compare two texts and see the differences highlighted. Free, private, runs in your browser." />
	<meta property="og:url" content="https://localconvert.app/dev-tools/diff/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"How to Compare Text Online","step":[{"@type":"HowToStep","text":"Paste the original text on the left side"},{"@type":"HowToStep","text":"Paste the modified text on the right side"},{"@type":"HowToStep","text":"View highlighted differences between the two texts"}]}</script>`}
</svelte:head>

<div class="diff-page">
	<ToolPageHeader
		category="dev"
		title={tool_pages_diff_title()}
		description={tool_pages_diff_desc()}
		icon={GitCompareArrowsIcon}
		backHref="/dev-tools/"
		backLabel={tools_common_back_dev()}
	/>

	<div class="panels">
		<div class="panel">
			<label class="panel-label">{tool_pages_diff_original()}</label>
			<textarea bind:value={textA} class="code-area" spellcheck="false"></textarea>
		</div>
		<div class="panel">
			<label class="panel-label">{tool_pages_diff_modified()}</label>
			<textarea bind:value={textB} class="code-area" spellcheck="false"></textarea>
		</div>
	</div>

	<button class="btn highlight" onclick={compare}>{tool_pages_diff_btn()}</button>

	{#if diffResult.length > 0}
		<div class="diff-output">
			{#each diffResult as line, i}
				<div class="diff-line {line.type}">
					<span class="line-num">{i + 1}</span>
					<span class="line-prefix">{line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}</span>
					<span class="line-text">{line.text || '\u00A0'}</span>
				</div>
			{/each}
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note_browser()}</p>

	{#if toolSeo['dev-diff']}
		<ToolSeoBlock
			faqs={toolSeo['dev-diff'].faqKeys.length >= 4 ? [
				{ q: tool_pages_dev_diff_seo_faq1_q?.() ?? '', a: tool_pages_dev_diff_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_dev_diff_seo_faq2_q?.() ?? '', a: tool_pages_dev_diff_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['dev-diff'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.diff-page { max-width: 60rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.panels { display: flex; flex-direction: column; gap: 1rem; }
	@media (min-width: 640px) { .panels { flex-direction: row; } .panel { flex: 1; } }
	.panel { display: flex; flex-direction: column; gap: 0.25rem; }
	.panel-label { font-size: 0.75rem; font-weight: 600; color: var(--fg-muted); }
	.code-area {
		width: 100%; min-height: 12rem; padding: 0.75rem; border-radius: 0.5rem; resize: vertical;
		font-family: 'Azeret Mono', monospace; font-size: 0.8125rem; line-height: 1.5;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.code-area:focus { outline: 1.5px solid var(--accent); }
	.diff-output {
		border-radius: 0.5rem; overflow: hidden; border: 1px solid var(--bg-separator);
		font-family: 'Azeret Mono', monospace; font-size: 0.8125rem;
	}
	.diff-line { display: flex; padding: 0.125rem 0.5rem; }
	.diff-line.same { background: var(--bg-panel); }
	.diff-line.add { background: hsla(140, 60%, 40%, 0.15); }
	.diff-line.remove { background: hsla(0, 60%, 45%, 0.15); }
	.line-num { width: 2rem; color: var(--fg-muted); text-align: end; margin-inline-end: 0.5rem; flex-shrink: 0; }
	.line-prefix { width: 1rem; font-weight: bold; flex-shrink: 0; }
	.diff-line.add .line-prefix { color: hsl(140, 60%, 40%); }
	.diff-line.remove .line-prefix { color: hsl(0, 60%, 45%); }
	.line-text { flex: 1; white-space: pre-wrap; word-break: break-all; }
</style>
