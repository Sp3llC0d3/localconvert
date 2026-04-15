<script lang="ts">
	const __nkm = {'dev_tools.tools.css_minify_name': dev_tools_tools_css_minify_name, 'dev_tools.tools.diff_name': dev_tools_tools_diff_name, 'dev_tools.tools.base64_name': dev_tools_tools_base64_name};
	import { tool_pages_json_formatter_title, tool_pages_json_formatter_desc, tools_common_back_dev, tool_pages_json_formatter_input_label, tool_pages_json_formatter_output_label, tool_pages_json_formatter_btn_format, tool_pages_json_formatter_btn_minify, tool_pages_pdf_to_text_copied, tool_pages_json_formatter_btn_copy, tool_pages_json_formatter_indent, tools_common_privacy_note_browser, tool_pages_dev_json_seo_faq1_q, tool_pages_dev_json_seo_faq1_a, tool_pages_dev_json_seo_faq2_q, tool_pages_dev_json_seo_faq2_a, dev_tools_tools_css_minify_name, dev_tools_tools_diff_name, dev_tools_tools_base64_name } from "$lib/paraglide/messages/_barrel.js";
	import { BracesIcon, CopyIcon, CheckIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let input = $state('{\n  "name": "LocalConvert",\n  "version": 1\n}');
	let output = $state('');
	let error = $state('');
	let indent = $state(2);
	let copied = $state(false);

	function format() {
		try {
			const parsed = JSON.parse(input);
			output = JSON.stringify(parsed, null, indent);
			error = '';
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Invalid JSON';
			output = '';
		}
	}

	function minify() {
		try {
			const parsed = JSON.parse(input);
			output = JSON.stringify(parsed);
			error = '';
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Invalid JSON';
			output = '';
		}
	}

	async function copyOutput() {
		if (!output) return;
		try {
			await navigator.clipboard.writeText(output);
			copied = true;
			setTimeout(() => copied = false, 1500);
		} catch {}
	}

	// Live validation — clear stale output on input change
	$effect(() => {
		output = '';
		if (!input.trim()) { error = ''; return; }
		try {
			JSON.parse(input);
			error = '';
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Invalid JSON';
		}
	});
</script>

<svelte:head>
	<title>{tool_pages_json_formatter_title()} — LocalConvert</title>
	<meta name="description" content="Format, minify, and validate JSON online. Free, private, runs in your browser." />
	<link rel="canonical" href="https://localconvert.app/dev-tools/json/" />
	<meta property="og:title" content="JSON Formatter — LocalConvert" />
	<meta property="og:description" content="Format, minify, and validate JSON online. Free, private, runs in your browser." />
	<meta property="og:url" content="https://localconvert.app/dev-tools/json/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"How to Format JSON Online","step":[{"@type":"HowToStep","text":"Paste your JSON data into the editor"},{"@type":"HowToStep","text":"Click format to beautify with proper indentation"},{"@type":"HowToStep","text":"Copy the formatted JSON or minify it"}]}</script>`}
</svelte:head>

<div class="json-page">
	<ToolPageHeader
		category="dev"
		title={tool_pages_json_formatter_title()}
		description={tool_pages_json_formatter_desc()}
		icon={BracesIcon}
		backHref="/dev-tools/"
		backLabel={tools_common_back_dev()}
	/>

	<div class="panels">
		<div class="panel">
			<label class="panel-label" for="json-input">{tool_pages_json_formatter_input_label()}</label>
			<textarea id="json-input" bind:value={input} class="code-area" spellcheck="false" autocomplete="off"></textarea>
		</div>
		{#if output}
			<div class="panel">
				<label class="panel-label">{tool_pages_json_formatter_output_label()}</label>
				<textarea readonly value={output} class="code-area" spellcheck="false"></textarea>
			</div>
		{/if}
	</div>

	{#if error}
		<p class="text-sm text-failure">{error}</p>
	{:else if input.trim()}
		<p class="text-xs" style="color: var(--accent);">✓ Valid JSON</p>
	{/if}

	<div class="btn-row">
		<button class="btn highlight" onclick={format}>{tool_pages_json_formatter_btn_format()}</button>
		<button class="btn" onclick={minify}>{tool_pages_json_formatter_btn_minify()}</button>
		{#if output}
			<button class="btn" onclick={copyOutput}>
				{#if copied}<CheckIcon size={14} />{:else}<CopyIcon size={14} />{/if}
				{copied ? tool_pages_pdf_to_text_copied() : tool_pages_json_formatter_btn_copy()}
			</button>
		{/if}
		<div class="flex items-center gap-2 ms-auto">
			<span class="text-xs text-muted">{tool_pages_json_formatter_indent()}</span>
			{#each [2, 4] as n}
				<button class="btn text-xs px-2 py-1 {indent === n ? 'highlight' : ''}" onclick={() => indent = n}>{n}</button>
			{/each}
		</div>
	</div>

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note_browser()}</p>

	{#if toolSeo['dev-json']}
		<ToolSeoBlock
			faqs={toolSeo['dev-json'].faqKeys.length >= 4 ? [
				{ q: tool_pages_dev_json_seo_faq1_q?.() ?? '', a: tool_pages_dev_json_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_dev_json_seo_faq2_q?.() ?? '', a: tool_pages_dev_json_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['dev-json'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.json-page { max-width: 52rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.panels { display: flex; flex-direction: column; gap: 1rem; }
	@media (min-width: 640px) { .panels { flex-direction: row; } .panel { flex: 1; } }
	.panel { display: flex; flex-direction: column; gap: 0.25rem; }
	.panel-label { font-size: 0.75rem; font-weight: 600; color: var(--fg-muted); }
	.code-area {
		width: 100%; min-height: 14rem; padding: 0.75rem; border-radius: 0.5rem; resize: vertical;
		font-family: 'Azeret Mono', monospace; font-size: 0.8125rem; line-height: 1.5; tab-size: 2;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.code-area:focus { outline: 1.5px solid var(--accent); }
	.btn-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
</style>
