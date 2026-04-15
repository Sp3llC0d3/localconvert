<script lang="ts">
	const __nkm = {'dev_tools.tools.url_encode_name': dev_tools_tools_url_encode_name, 'dev_tools.tools.hash_name': dev_tools_tools_hash_name, 'dev_tools.tools.json_name': dev_tools_tools_json_name};
	import { tool_pages_base64_title, tool_pages_base64_desc, tools_common_back_dev, tool_pages_base64_btn_encode, tool_pages_base64_btn_decode, tool_pages_base64_input_text, tool_pages_base64_input_base64, tool_pages_base64_or_file, tool_pages_base64_select_file, tool_pages_base64_decoded, tool_pages_pdf_to_text_copied, tool_pages_json_formatter_btn_copy, tools_common_privacy_note_browser, tool_pages_dev_base64_seo_faq1_q, tool_pages_dev_base64_seo_faq1_a, tool_pages_dev_base64_seo_faq2_q, tool_pages_dev_base64_seo_faq2_a, dev_tools_tools_url_encode_name, dev_tools_tools_hash_name, dev_tools_tools_json_name } from "$lib/paraglide/messages/_barrel.js";
	import { Binary, CopyIcon, CheckIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { formatFileSize } from '$lib/image/utils';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let mode = $state<'encode' | 'decode'>('encode');
	let input = $state('');
	let output = $state('');
	let error = $state('');
	let copied = $state(false);
	let file = $state<File | null>(null);
	let fileInput = $state<HTMLInputElement>();

	function encode() {
		error = '';
		try {
			output = btoa(unescape(encodeURIComponent(input)));
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Encoding failed';
			output = '';
		}
	}

	function decode() {
		error = '';
		try {
			output = decodeURIComponent(escape(atob(input)));
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Invalid Base64';
			output = '';
		}
	}

	async function encodeFile() {
		if (!file) return;
		error = '';
		const reader = new FileReader();
		reader.onload = () => {
			output = (reader.result as string).split(',')[1] || '';
		};
		reader.onerror = () => { error = 'Failed to read file'; };
		reader.readAsDataURL(file);
	}

	function onFileSelect(e: Event) {
		const el = e.target as HTMLInputElement;
		if (el.files?.[0]) { file = el.files[0]; encodeFile(); }
	}

	$effect(() => {
		if (mode === 'encode' && input.trim()) encode();
		else if (mode === 'decode' && input.trim()) decode();
		else { output = ''; error = ''; }
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
	<title>Base64 Encode / Decode — LocalConvert</title>
	<meta name="description" content="Encode and decode Base64 strings. Convert files to Base64. Free, private, runs in your browser." />
	<link rel="canonical" href="https://localconvert.app/dev-tools/base64/" />
	<meta property="og:title" content="Base64 Encode / Decode — LocalConvert" />
	<meta property="og:description" content="Encode and decode Base64 strings. Convert files to Base64. Free, private, runs in your browser." />
	<meta property="og:url" content="https://localconvert.app/dev-tools/base64/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"How to Encode or Decode Base64","step":[{"@type":"HowToStep","text":"Paste your text or data into the input field"},{"@type":"HowToStep","text":"Choose encode or decode mode"},{"@type":"HowToStep","text":"Copy the result from the output field"}]}</script>`}
</svelte:head>

<div class="b64-page">
	<ToolPageHeader
		category="dev"
		title={tool_pages_base64_title()}
		description={tool_pages_base64_desc()}
		icon={Binary}
		backHref="/dev-tools/"
		backLabel={tools_common_back_dev()}
	/>

	<!-- Mode toggle -->
	<div class="flex gap-2">
		<button class="btn text-sm px-3 py-1.5 {mode === 'encode' ? 'highlight' : ''}" onclick={() => { mode = 'encode'; input = ''; output = ''; file = null; }}>{tool_pages_base64_btn_encode()}</button>
		<button class="btn text-sm px-3 py-1.5 {mode === 'decode' ? 'highlight' : ''}" onclick={() => { mode = 'decode'; input = ''; output = ''; file = null; }}>{tool_pages_base64_btn_decode()}</button>
	</div>

	<!-- Text input -->
	<div class="panel">
		<label class="panel-label">{mode === 'encode' ? tool_pages_base64_input_text() : tool_pages_base64_input_base64()}</label>
		<textarea bind:value={input} class="code-area" spellcheck="false" placeholder={mode === 'encode' ? 'Hello, World!' : 'SGVsbG8sIFdvcmxkIQ=='}></textarea>
	</div>

	<!-- File encode option -->
	{#if mode === 'encode'}
		<div class="flex items-center gap-3">
			<span class="text-xs text-muted">{tool_pages_base64_or_file()}</span>
			<button class="btn text-sm px-3 py-1.5" onclick={() => fileInput?.click()}>{tool_pages_base64_select_file()}</button>
			<input bind:this={fileInput} type="file" class="hidden" onchange={onFileSelect} />
			{#if file}<span class="text-xs text-muted">{file.name} ({formatFileSize(file.size)})</span>{/if}
		</div>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	<!-- Output -->
	{#if output}
		<div class="panel">
			<div class="flex items-center justify-between">
				<label class="panel-label">{mode === 'encode' ? 'Base64' : tool_pages_base64_decoded()}</label>
				<button class="copy-btn" onclick={copyOutput}>
					{#if copied}<CheckIcon size={14} />{:else}<CopyIcon size={14} />{/if}
					{copied ? tool_pages_pdf_to_text_copied() : tool_pages_json_formatter_btn_copy()}
				</button>
			</div>
			<textarea readonly value={output} class="code-area out" spellcheck="false"></textarea>
			<p class="text-xs text-muted">{output.length.toLocaleString()} characters</p>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note_browser()}</p>

	{#if toolSeo['dev-base64']}
		<ToolSeoBlock
			faqs={toolSeo['dev-base64'].faqKeys.length >= 4 ? [
				{ q: tool_pages_dev_base64_seo_faq1_q?.() ?? '', a: tool_pages_dev_base64_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_dev_base64_seo_faq2_q?.() ?? '', a: tool_pages_dev_base64_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['dev-base64'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.b64-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.panel { display: flex; flex-direction: column; gap: 0.25rem; }
	.panel-label { font-size: 0.75rem; font-weight: 600; color: var(--fg-muted); }
	.code-area {
		width: 100%; min-height: 8rem; padding: 0.75rem; border-radius: 0.5rem; resize: vertical;
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
