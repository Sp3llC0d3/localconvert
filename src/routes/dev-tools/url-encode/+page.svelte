<script lang="ts">
	const __nkm = {'dev_tools.tools.base64_name': dev_tools_tools_base64_name, 'dev_tools.tools.hash_name': dev_tools_tools_hash_name, 'dev_tools.tools.json_name': dev_tools_tools_json_name};
	import { tool_pages_url_encode_title, tool_pages_url_encode_desc, tools_common_back_dev, tool_pages_base64_btn_encode, tool_pages_base64_btn_decode, tool_pages_json_formatter_btn_copy, tools_common_privacy_note_browser, tool_pages_dev_url_encode_seo_faq1_q, tool_pages_dev_url_encode_seo_faq1_a, tool_pages_dev_url_encode_seo_faq2_q, tool_pages_dev_url_encode_seo_faq2_a, dev_tools_tools_base64_name, dev_tools_tools_hash_name, dev_tools_tools_json_name , navbar_home, navbar_dev_tools, meta_descriptions_dev_url_encode} from "$lib/paraglide/messages/_barrel.js";
	import { localizeHref } from '$lib/paraglide/runtime';
	import { LinkIcon, CopyIcon, CheckIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let mode = $state<'encode' | 'decode'>('encode');
	let input = $state('');
	let output = $state('');
	let error = $state('');
	let copied = $state(false);

	$effect(() => {
		error = '';
		if (!input.trim()) { output = ''; return; }
		try {
			output = mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Invalid input';
			output = '';
		}
	});

	async function copyOutput() {
		if (!output) return;
		try {
			await navigator.clipboard.writeText(output);
			copied = true;
			setTimeout(() => copied = false, 1500);
		} catch {}
	}
</script>

<svelte:head>
	<title>{tool_pages_url_encode_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_dev_url_encode()} />
	<link rel="canonical" href="https://localconvert.app/dev-tools/url-encode/" />
	<meta property="og:title" content="{tool_pages_url_encode_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_dev_url_encode()} />
	<meta property="og:url" content="https://localconvert.app/dev-tools/url-encode/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"How to URL Encode or Decode Text","step":[{"@type":"HowToStep","text":"Paste your text or URL into the input field"},{"@type":"HowToStep","text":"Choose encode or decode mode"},{"@type":"HowToStep","text":"Copy the result from the output field"}]}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":navbar_home(),"item":"https://localconvert.app"+localizeHref("/")},{"@type":"ListItem","position":2,"name":navbar_dev_tools(),"item":"https://localconvert.app"+localizeHref("/dev-tools/")},{"@type":"ListItem","position":3,"name":tool_pages_url_encode_title()}]})}</script>`}
</svelte:head>

<div class="url-page">
	<ToolPageHeader
		category="dev"
		title={tool_pages_url_encode_title()}
		description={tool_pages_url_encode_desc()}
		icon={LinkIcon}
		backHref="/dev-tools/"
		backLabel={tools_common_back_dev()}
	/>

	<div class="flex gap-2">
		<button class="btn text-sm px-3 py-1.5 {mode === 'encode' ? 'highlight' : ''}" onclick={() => { mode = 'encode'; input = ''; }}>{tool_pages_base64_btn_encode()}</button>
		<button class="btn text-sm px-3 py-1.5 {mode === 'decode' ? 'highlight' : ''}" onclick={() => { mode = 'decode'; input = ''; }}>{tool_pages_base64_btn_decode()}</button>
	</div>

	<div class="panel">
		<label class="panel-label">{mode === 'encode' ? 'URL / Text' : 'Encoded URL'}</label>
		<textarea bind:value={input} class="code-area" spellcheck="false" placeholder={mode === 'encode' ? 'https://example.com/path?q=hello world' : 'https%3A%2F%2Fexample.com'}></textarea>
	</div>

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if output}
		<div class="panel">
			<div class="flex items-center justify-between">
				<label class="panel-label">{mode === 'encode' ? 'Encoded' : 'Decoded'}</label>
				<button class="copy-btn" onclick={copyOutput}>
					{#if copied}<CheckIcon size={14} />{:else}<CopyIcon size={14} />{/if}
					{tool_pages_json_formatter_btn_copy()}
				</button>
			</div>
			<textarea readonly value={output} class="code-area out" spellcheck="false"></textarea>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note_browser()}</p>

	{#if toolSeo['dev-url-encode']}
		<ToolSeoBlock
			faqs={toolSeo['dev-url-encode'].faqKeys.length >= 4 ? [
				{ q: tool_pages_dev_url_encode_seo_faq1_q?.() ?? '', a: tool_pages_dev_url_encode_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_dev_url_encode_seo_faq2_q?.() ?? '', a: tool_pages_dev_url_encode_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['dev-url-encode'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.url-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.panel { display: flex; flex-direction: column; gap: 0.25rem; }
	.panel-label { font-size: 0.75rem; font-weight: 600; color: var(--fg-muted); }
	.code-area {
		width: 100%; min-height: 6rem; padding: 0.75rem; border-radius: 0.5rem; resize: vertical;
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
