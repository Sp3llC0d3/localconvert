<script lang="ts">
	const __nkm = {'dev_tools.tools.diff_name': dev_tools_tools_diff_name, 'dev_tools.tools.word_count_name': dev_tools_tools_word_count_name, 'dev_tools.tools.json_name': dev_tools_tools_json_name};
	import { tool_pages_markdown_title, tool_pages_markdown_desc, tools_common_back_dev, tool_pages_markdown_preview, tool_pages_json_formatter_btn_copy, tools_common_privacy_note_browser, tool_pages_dev_markdown_seo_faq1_q, tool_pages_dev_markdown_seo_faq1_a, tool_pages_dev_markdown_seo_faq2_q, tool_pages_dev_markdown_seo_faq2_a, dev_tools_tools_diff_name, dev_tools_tools_word_count_name, dev_tools_tools_json_name } from "$lib/paraglide/messages/_barrel.js";
	import { browser } from '$app/environment';
	import { sanitize } from '$lib/util/sanitize';
	import { FileTextIcon, CopyIcon, CheckIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let input = $state('# Hello World\n\nThis is **bold** and *italic* text.\n\n- Item 1\n- Item 2\n\n```js\nconsole.log("hi");\n```');
	let html = $state('');
	let copied = $state(false);

	$effect(() => {
		if (!browser || !input.trim()) { html = ''; return; }
		import('marked').then(({ marked }) => {
			html = marked(input) as string;
		});
	});

	async function copyHtml() {
		if (!html) return;
		try {
			await navigator.clipboard.writeText(html);
			copied = true;
			setTimeout(() => copied = false, 1500);
		} catch {}
	}
</script>

<svelte:head>
	<title>{tool_pages_markdown_title()} — LocalConvert</title>
	<meta name="description" content="Write markdown and see rendered HTML live. Copy HTML output. Free, private, runs in your browser." />
	<link rel="canonical" href="https://localconvert.app/dev-tools/markdown/" />
	<meta property="og:title" content="Markdown Preview — LocalConvert" />
	<meta property="og:description" content="Write markdown and see rendered HTML live. Copy HTML output. Free, private, runs in your browser." />
	<meta property="og:url" content="https://localconvert.app/dev-tools/markdown/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"How to Preview Markdown","step":[{"@type":"HowToStep","text":"Type or paste Markdown text in the editor"},{"@type":"HowToStep","text":"See the rendered HTML preview in real time"},{"@type":"HowToStep","text":"Copy or adjust your Markdown as needed"}]}</script>`}
</svelte:head>

<div class="md-page">
	<ToolPageHeader
		category="dev"
		title={tool_pages_markdown_title()}
		description={tool_pages_markdown_desc()}
		icon={FileTextIcon}
		backHref="/dev-tools/"
		backLabel={tools_common_back_dev()}
	/>

	<div class="panels">
		<div class="panel">
			<label class="panel-label">Markdown</label>
			<textarea bind:value={input} class="code-area" spellcheck="false"></textarea>
		</div>
		<div class="panel">
			<div class="flex items-center justify-between">
				<label class="panel-label">{tool_pages_markdown_preview()}</label>
				{#if html}
					<button class="copy-btn" onclick={copyHtml}>
						{#if copied}<CheckIcon size={14} />{:else}<CopyIcon size={14} />{/if}
						{tool_pages_json_formatter_btn_copy()}
					</button>
				{/if}
			</div>
			<div class="preview-box prose">{@html sanitize(html, ['h1','h2','h3','h4','h5','h6','p','a','b','strong','i','em','ul','ol','li','code','pre','blockquote','br','hr','table','thead','tbody','tr','th','td','del','sup','sub','span','div'])}</div>
		</div>
	</div>

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note_browser()}</p>

	{#if toolSeo['dev-markdown']}
		<ToolSeoBlock
			faqs={toolSeo['dev-markdown'].faqKeys.length >= 4 ? [
				{ q: tool_pages_dev_markdown_seo_faq1_q?.() ?? '', a: tool_pages_dev_markdown_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_dev_markdown_seo_faq2_q?.() ?? '', a: tool_pages_dev_markdown_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['dev-markdown'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.md-page { max-width: 60rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.panels { display: flex; flex-direction: column; gap: 1rem; }
	@media (min-width: 640px) { .panels { flex-direction: row; } .panel { flex: 1; } }
	.panel { display: flex; flex-direction: column; gap: 0.25rem; }
	.panel-label { font-size: 0.75rem; font-weight: 600; color: var(--fg-muted); }
	.code-area {
		width: 100%; min-height: 20rem; padding: 0.75rem; border-radius: 0.5rem; resize: vertical;
		font-family: 'Azeret Mono', monospace; font-size: 0.8125rem; line-height: 1.5;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.code-area:focus { outline: 1.5px solid var(--accent); }
	.preview-box {
		min-height: 20rem; padding: 0.75rem; border-radius: 0.5rem; overflow-y: auto;
		border: 1px solid var(--bg-separator); background: var(--bg-panel); color: var(--fg);
		font-size: 0.875rem; line-height: 1.6;
	}
	.preview-box :global(h1) { font-size: 1.5rem; font-weight: bold; margin: 0.5rem 0; }
	.preview-box :global(h2) { font-size: 1.25rem; font-weight: bold; margin: 0.5rem 0; }
	.preview-box :global(h3) { font-size: 1.1rem; font-weight: bold; margin: 0.5rem 0; }
	.preview-box :global(p) { margin: 0.5rem 0; }
	.preview-box :global(ul), .preview-box :global(ol) { padding-left: 1.5rem; margin: 0.5rem 0; }
	.preview-box :global(code) { background: var(--bg-panel-alt); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.8125rem; }
	.preview-box :global(pre) { background: var(--bg-panel-alt); padding: 0.75rem; border-radius: 0.5rem; overflow-x: auto; margin: 0.5rem 0; }
	.preview-box :global(pre code) { background: none; padding: 0; }
	.preview-box :global(blockquote) { border-left: 3px solid var(--accent); padding-left: 1rem; margin: 0.5rem 0; color: var(--fg-muted); }
	.preview-box :global(a) { color: var(--accent); text-decoration: underline; }
	.copy-btn {
		display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border-radius: 0.375rem;
		font-size: 0.75rem; border: none; background: transparent; cursor: pointer; color: var(--fg-muted);
	}
	.copy-btn:hover { background: var(--bg-panel-alt); color: var(--accent); }
</style>
