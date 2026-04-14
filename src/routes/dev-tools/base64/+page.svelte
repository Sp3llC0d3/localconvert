<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { Binary, CopyIcon, CheckIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { formatFileSize } from '$lib/image/utils';

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
</svelte:head>

<div class="b64-page">
	<ToolPageHeader
		category="dev"
		title={m['tool_pages.base64.title']()}
		description={m['tool_pages.base64.desc']()}
		icon={Binary}
		backHref="/dev-tools/"
		backLabel={m['tools_common.back_dev']()}
	/>

	<!-- Mode toggle -->
	<div class="flex gap-2">
		<button class="btn text-sm px-3 py-1.5 {mode === 'encode' ? 'highlight' : ''}" onclick={() => { mode = 'encode'; input = ''; output = ''; file = null; }}>{m['tool_pages.base64.btn_encode']()}</button>
		<button class="btn text-sm px-3 py-1.5 {mode === 'decode' ? 'highlight' : ''}" onclick={() => { mode = 'decode'; input = ''; output = ''; file = null; }}>{m['tool_pages.base64.btn_decode']()}</button>
	</div>

	<!-- Text input -->
	<div class="panel">
		<label class="panel-label">{mode === 'encode' ? m['tool_pages.base64.input_text']() : m['tool_pages.base64.input_base64']()}</label>
		<textarea bind:value={input} class="code-area" spellcheck="false" placeholder={mode === 'encode' ? 'Hello, World!' : 'SGVsbG8sIFdvcmxkIQ=='}></textarea>
	</div>

	<!-- File encode option -->
	{#if mode === 'encode'}
		<div class="flex items-center gap-3">
			<span class="text-xs text-muted">{m['tool_pages.base64.or_file']()}</span>
			<button class="btn text-sm px-3 py-1.5" onclick={() => fileInput?.click()}>{m['tool_pages.base64.select_file']()}</button>
			<input bind:this={fileInput} type="file" class="hidden" onchange={onFileSelect} />
			{#if file}<span class="text-xs text-muted">{file.name} ({formatFileSize(file.size)})</span>{/if}
		</div>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	<!-- Output -->
	{#if output}
		<div class="panel">
			<div class="flex items-center justify-between">
				<label class="panel-label">{mode === 'encode' ? 'Base64' : m['tool_pages.base64.decoded']()}</label>
				<button class="copy-btn" onclick={copyOutput}>
					{#if copied}<CheckIcon size={14} />{:else}<CopyIcon size={14} />{/if}
					{copied ? m['tool_pages.pdf_to_text.copied']() : m['tool_pages.json_formatter.btn_copy']()}
				</button>
			</div>
			<textarea readonly value={output} class="code-area out" spellcheck="false"></textarea>
			<p class="text-xs text-muted">{output.length.toLocaleString()} characters</p>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note_browser']()}</p>
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
