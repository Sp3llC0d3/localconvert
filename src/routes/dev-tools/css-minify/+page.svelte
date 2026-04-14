<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { CodeIcon, CopyIcon, CheckIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let input = $state('body {\n  margin: 0;\n  padding: 0;\n  /* Reset styles */\n  font-family: sans-serif;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n}');
	let output = $state('');
	let copied = $state(false);

	function minify() {
		let css = input;
		// Remove comments
		css = css.replace(/\/\*[\s\S]*?\*\//g, '');
		// Remove newlines and extra whitespace
		css = css.replace(/\s+/g, ' ');
		// Remove space around { } : ; ,
		css = css.replace(/\s*\{\s*/g, '{');
		css = css.replace(/\s*\}\s*/g, '}');
		css = css.replace(/\s*:\s*/g, ':');
		css = css.replace(/\s*;\s*/g, ';');
		css = css.replace(/\s*,\s*/g, ',');
		// Remove trailing semicolons before }
		css = css.replace(/;}/g, '}');
		output = css.trim();
	}

	async function copyOutput() {
		if (!output) return;
		try {
			await navigator.clipboard.writeText(output);
			copied = true;
			setTimeout(() => copied = false, 1500);
		} catch {}
	}

	const savings = $derived.by(() => {
		if (!output || !input) return null;
		const saved = input.length - output.length;
		const pct = input.length > 0 ? Math.round((saved / input.length) * 100) : 0;
		return { saved, pct };
	});
</script>

<svelte:head>
	<title>CSS Minifier — LocalConvert</title>
	<meta name="description" content="Minify CSS by removing comments and whitespace. Free, private, runs in your browser." />
	<link rel="canonical" href="https://localconvert.app/dev-tools/css-minify/" />
	<meta property="og:title" content="CSS Minifier — LocalConvert" />
	<meta property="og:description" content="Minify CSS by removing comments and whitespace. Free, private, runs in your browser." />
	<meta property="og:url" content="https://localconvert.app/dev-tools/css-minify/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"How to Minify CSS","step":[{"@type":"HowToStep","text":"Paste your CSS code into the editor"},{"@type":"HowToStep","text":"Click minify to remove whitespace and comments"},{"@type":"HowToStep","text":"Copy the minified CSS output"}]}</script>`}
</svelte:head>

<div class="css-page">
	<ToolPageHeader
		category="dev"
		title={m['tool_pages.css_minify.title']()}
		description={m['tool_pages.css_minify.desc']()}
		icon={CodeIcon}
		backHref="/dev-tools/"
		backLabel={m['tools_common.back_dev']()}
	/>

	<div class="panel">
		<label class="panel-label">{m['tool_pages.css_minify.input_label']()}</label>
		<textarea bind:value={input} class="code-area" spellcheck="false"></textarea>
		<p class="text-xs text-muted">{input.length.toLocaleString()} characters</p>
	</div>

	<button class="btn highlight" onclick={minify} disabled={!input.trim()}>{m['tool_pages.css_minify.btn']()}</button>

	{#if output}
		<div class="panel">
			<div class="flex items-center justify-between">
				<label class="panel-label">{m['tool_pages.css_minify.output_label']()}</label>
				<button class="copy-btn" onclick={copyOutput}>
					{#if copied}<CheckIcon size={14} />{:else}<CopyIcon size={14} />{/if}
					{m['tool_pages.json_formatter.btn_copy']()}
				</button>
			</div>
			<textarea readonly value={output} class="code-area out" spellcheck="false"></textarea>
			{#if savings}
				<p class="text-xs text-muted">
					{output.length.toLocaleString()} characters — {m['tool_pages.css_minify.saved']({ pct: savings.pct })}
				</p>
			{/if}
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note_browser']()}</p>

	{#if toolSeo['dev-css-minify']}
		<ToolSeoBlock
			faqs={toolSeo['dev-css-minify'].faqKeys.length >= 4 ? [
				{ q: (m as any)[toolSeo['dev-css-minify'].faqKeys[0]]?.() ?? '', a: (m as any)[toolSeo['dev-css-minify'].faqKeys[1]]?.() ?? '' },
				{ q: (m as any)[toolSeo['dev-css-minify'].faqKeys[2]]?.() ?? '', a: (m as any)[toolSeo['dev-css-minify'].faqKeys[3]]?.() ?? '' },
			] : []}
			relatedTools={toolSeo['dev-css-minify'].related.map(r => ({ href: r.href, name: (m as any)[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.css-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.panel { display: flex; flex-direction: column; gap: 0.25rem; }
	.panel-label { font-size: 0.75rem; font-weight: 600; color: var(--fg-muted); }
	.code-area {
		width: 100%; min-height: 10rem; padding: 0.75rem; border-radius: 0.5rem; resize: vertical;
		font-family: 'Azeret Mono', monospace; font-size: 0.8125rem; line-height: 1.5;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.code-area:focus { outline: 1.5px solid var(--accent); }
	.code-area.out { background: var(--bg-panel); }
	.copy-btn {
		display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border-radius: 0.375rem;
		font-size: 0.75rem; border: none; background: transparent; cursor: pointer; color: var(--fg-muted);
	}
	.copy-btn:hover { background: var(--bg-panel-alt); color: var(--accent); }
</style>
