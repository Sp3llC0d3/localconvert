<script lang="ts">
	const __nkm = {'dev_tools.tools.base64_name': dev_tools_tools_base64_name, 'dev_tools.tools.diff_name': dev_tools_tools_diff_name, 'dev_tools.tools.url_encode_name': dev_tools_tools_url_encode_name};
	import { tool_pages_hash_generator_title, tool_pages_hash_generator_desc, tools_common_back_dev, tool_pages_hash_generator_text_mode, tool_pages_hash_generator_file_mode, tool_pages_hash_generator_text_placeholder, tool_pages_hash_generator_file_placeholder, tool_pages_hash_generator_algorithm, tool_pages_pdf_to_text_copied, tool_pages_json_formatter_btn_copy, tool_pages_hash_generator_computing, tools_common_privacy_note_browser, tool_pages_dev_hash_seo_faq1_q, tool_pages_dev_hash_seo_faq1_a, tool_pages_dev_hash_seo_faq2_q, tool_pages_dev_hash_seo_faq2_a, dev_tools_tools_base64_name, dev_tools_tools_diff_name, dev_tools_tools_url_encode_name , meta_descriptions_dev_hash} from "$lib/paraglide/messages/_barrel.js";
	import { browser } from '$app/environment';
	import { HashIcon, CopyIcon, CheckIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { formatFileSize } from '$lib/image/utils';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let mode = $state<'text' | 'file'>('text');
	let textInput = $state('');
	let file = $state<File | null>(null);
	let algorithm = $state<'SHA-256' | 'SHA-1' | 'SHA-512'>('SHA-256');
	let hashResult = $state('');
	let computing = $state(false);
	let copied = $state(false);

	let fileInput = $state<HTMLInputElement>();

	async function computeHash(data: ArrayBuffer): Promise<string> {
		const hashBuffer = await crypto.subtle.digest(algorithm, data);
		return Array.from(new Uint8Array(hashBuffer))
			.map(b => b.toString(16).padStart(2, '0'))
			.join('');
	}

	async function compute() {
		if (!browser) return;
		computing = true;
		hashResult = '';
		try {
			let data: ArrayBuffer;
			if (mode === 'text') {
				data = new TextEncoder().encode(textInput).buffer as ArrayBuffer;
			} else if (file) {
				data = await file.arrayBuffer();
			} else {
				computing = false;
				return;
			}
			hashResult = await computeHash(data);
		} catch {
			hashResult = 'Error computing hash';
		}
		computing = false;
	}

	// Auto-compute on input change
	$effect(() => {
		void textInput; void algorithm; void file;
		if (mode === 'text' && textInput) compute();
		else if (mode === 'file' && file) compute();
		else hashResult = '';
	});

	async function copyHash() {
		if (!hashResult) return;
		try {
			await navigator.clipboard.writeText(hashResult);
			copied = true;
			setTimeout(() => copied = false, 1500);
		} catch {}
	}

	function onFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files?.[0]) file = input.files[0];
	}
</script>

<svelte:head>
	<title>{tool_pages_hash_generator_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_dev_hash()} />
	<link rel="canonical" href="https://localconvert.app/dev-tools/hash/" />
	<meta property="og:title" content="{tool_pages_hash_generator_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_dev_hash()} />
	<meta property="og:url" content="https://localconvert.app/dev-tools/hash/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"How to Generate a Hash","step":[{"@type":"HowToStep","text":"Enter the text you want to hash"},{"@type":"HowToStep","text":"Select the hash algorithm (MD5, SHA-1, SHA-256, etc.)"},{"@type":"HowToStep","text":"Copy the generated hash value"}]}</script>`}
</svelte:head>

<div class="hash-page">
	<ToolPageHeader
		category="dev"
		title={tool_pages_hash_generator_title()}
		description={tool_pages_hash_generator_desc()}
		icon={HashIcon}
		backHref="/dev-tools/"
		backLabel={tools_common_back_dev()}
	/>

	<!-- Mode toggle -->
	<div class="flex gap-2">
		<button class="btn text-sm px-3 py-1.5 {mode === 'text' ? 'highlight' : ''}" onclick={() => { mode = 'text'; file = null; }}>{tool_pages_hash_generator_text_mode()}</button>
		<button class="btn text-sm px-3 py-1.5 {mode === 'file' ? 'highlight' : ''}" onclick={() => { mode = 'file'; textInput = ''; }}>{tool_pages_hash_generator_file_mode()}</button>
	</div>

	<!-- Input -->
	{#if mode === 'text'}
		<textarea bind:value={textInput} class="text-area" placeholder={tool_pages_hash_generator_text_placeholder()} spellcheck="false"></textarea>
	{:else}
		<div class="file-zone" onclick={() => fileInput?.click()}>
			<input bind:this={fileInput} type="file" class="hidden" onchange={onFileSelect} />
			{#if file}
				<p class="text-sm font-medium">{file.name}</p>
				<p class="text-xs text-muted">{formatFileSize(file.size)}</p>
			{:else}
				<p class="text-sm text-muted">{tool_pages_hash_generator_file_placeholder()}</p>
			{/if}
		</div>
	{/if}

	<!-- Algorithm -->
	<div class="flex items-center gap-3 flex-wrap">
		<span class="text-sm font-semibold">{tool_pages_hash_generator_algorithm()}</span>
		{#each ['SHA-256', 'SHA-1', 'SHA-512'] as algo}
			<button class="btn text-sm px-3 py-1.5 {algorithm === algo ? 'highlight' : ''}" onclick={() => algorithm = algo as typeof algorithm}>{algo}</button>
		{/each}
	</div>

	<!-- Result -->
	{#if hashResult}
		<div class="result-box">
			<div class="flex items-center justify-between gap-2">
				<span class="text-xs font-semibold text-muted">{algorithm}</span>
				<button class="copy-btn" onclick={copyHash}>
					{#if copied}<CheckIcon size={14} />{:else}<CopyIcon size={14} />{/if}
					{copied ? tool_pages_pdf_to_text_copied() : tool_pages_json_formatter_btn_copy()}
				</button>
			</div>
			<code class="hash-output">{hashResult}</code>
		</div>
	{/if}

	{#if computing}<p class="text-sm text-muted">{tool_pages_hash_generator_computing()}</p>{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note_browser()}</p>

	{#if toolSeo['dev-hash']}
		<ToolSeoBlock
			faqs={toolSeo['dev-hash'].faqKeys.length >= 4 ? [
				{ q: tool_pages_dev_hash_seo_faq1_q?.() ?? '', a: tool_pages_dev_hash_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_dev_hash_seo_faq2_q?.() ?? '', a: tool_pages_dev_hash_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['dev-hash'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}
</div>

<style>
	.hash-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.text-area {
		width: 100%; min-height: 8rem; padding: 0.75rem; border-radius: 0.5rem; resize: vertical;
		font-family: 'Azeret Mono', monospace; font-size: 0.8125rem; line-height: 1.5;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.text-area:focus { outline: 1.5px solid var(--accent); }
	.file-zone {
		padding: 2rem; border-radius: 1rem; border: 2px dashed var(--bg-separator);
		display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
		cursor: pointer; transition: border-color 0.15s;
	}
	.file-zone:hover { border-color: var(--accent); }
	.result-box { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.hash-output {
		font-family: 'Azeret Mono', monospace; font-size: 0.75rem; word-break: break-all;
		padding: 0.5rem; border-radius: 0.375rem; background: var(--bg-panel-alt); color: var(--fg);
	}
	.copy-btn {
		display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border-radius: 0.375rem;
		font-size: 0.75rem; border: none; background: transparent; cursor: pointer; color: var(--fg-muted);
	}
	.copy-btn:hover { background: var(--bg-panel-alt); color: var(--accent); }
</style>
