<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { LinkIcon, CopyIcon, CheckIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';

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
	<title>URL Encode / Decode — LocalConvert</title>
	<meta name="description" content="Encode and decode URLs. Free, private, runs in your browser." />
	<link rel="canonical" href="https://localconvert.app/dev-tools/url-encode/" />
</svelte:head>

<div class="url-page">
	<ToolPageHeader
		category="dev"
		title={m['tool_pages.url_encode.title']()}
		description={m['tool_pages.url_encode.desc']()}
		icon={LinkIcon}
		backHref="/dev-tools/"
		backLabel={m['tools_common.back_dev']()}
	/>

	<div class="flex gap-2">
		<button class="btn text-sm px-3 py-1.5 {mode === 'encode' ? 'highlight' : ''}" onclick={() => { mode = 'encode'; input = ''; }}>{m['tool_pages.base64.btn_encode']()}</button>
		<button class="btn text-sm px-3 py-1.5 {mode === 'decode' ? 'highlight' : ''}" onclick={() => { mode = 'decode'; input = ''; }}>{m['tool_pages.base64.btn_decode']()}</button>
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
					{m['tool_pages.json_formatter.btn_copy']()}
				</button>
			</div>
			<textarea readonly value={output} class="code-area out" spellcheck="false"></textarea>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note_browser']()}</p>
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
