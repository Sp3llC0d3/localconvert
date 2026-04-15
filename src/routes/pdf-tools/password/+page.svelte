<script lang="ts">
	const __nkm = {'pdf_tools.tools.unlock_name': pdf_tools_tools_unlock_name, 'pdf_tools.tools.metadata_name': pdf_tools_tools_metadata_name, 'pdf_tools.tools.compress_name': pdf_tools_tools_compress_name};
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { protectPdf } from '$lib/pdf/password';
	import { downloadPdf, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { LockIcon, ShieldCheckIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { tool_pages_password_err_pdf, tool_pages_password_err_password, tool_pages_password_err_min_length, tool_pages_password_err_fail, tool_pages_password_title, tool_pages_password_desc, tools_common_back_pdf, tools_common_upload_pdf, tool_pages_password_password_label, tool_pages_password_password_placeholder, tools_common_hide, tools_common_show, tool_pages_password_owner_toggle, tool_pages_password_owner_label, tool_pages_password_owner_placeholder, tool_pages_password_owner_help, tool_pages_password_permissions_label, tool_pages_password_allow_printing, tool_pages_password_allow_copying, tool_pages_password_allow_editing, tool_pages_password_info, tool_pages_password_btn_busy, tool_pages_password_btn, tool_pages_password_result, tool_pages_password_save, tools_common_privacy_note, tool_pages_password_seo_faq1_q, tool_pages_password_seo_faq1_a, tool_pages_password_seo_faq2_q, tool_pages_password_seo_faq2_a, pdf_tools_tools_unlock_name, pdf_tools_tools_metadata_name, pdf_tools_tools_compress_name } from "$lib/paraglide/messages/_barrel.js";
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let userPassword = $state('');
	let ownerPassword = $state('');
	let useOwnerPassword = $state(false);
	let allowPrinting = $state(true);
	let allowCopying = $state(false);
	let allowModifying = $state(false);
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);
	let showPassword = $state(false);

	// Clear result when file changes
	$effect(() => {
		void files;
		resultBytes = null;
		error = '';
	});

	async function apply() {
		if (files.length === 0) { error = tool_pages_password_err_pdf(); return; }
		if (!userPassword.trim()) { error = tool_pages_password_err_password(); return; }
		if (userPassword.trim().length < 4) { error = tool_pages_password_err_min_length(); return; }
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await protectPdf(files[0], {
				userPassword: userPassword.trim(),
				ownerPassword: useOwnerPassword && ownerPassword.trim() ? ownerPassword.trim() : undefined,
				permissions: {
					printing: allowPrinting ? 'highResolution' : false,
					copying: allowCopying,
					modifying: allowModifying,
					annotating: allowModifying,
				},
			});
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tool_pages_password_err_fail();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, getOutputName(files[0].name, 'protected', 'pdf'));
	}
</script>

<svelte:head>
	<title>{tool_pages_password_title()} — LocalConvert</title>
	<meta name="description" content="Add password protection to any PDF. Set permissions for printing, copying, and editing. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/password/" />
	<meta property="og:title" content="Password Protect PDF — LocalConvert" />
	<meta property="og:description" content="Add password protection to any PDF. Set permissions for printing, copying, and editing. Free, private, no uploads." />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/password/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Password Protect a PDF","step":[{"@type":"HowToStep","text":"Select a PDF file"},{"@type":"HowToStep","text":"Enter a password for encryption"},{"@type":"HowToStep","text":"Choose permission settings"},{"@type":"HowToStep","text":"Save the protected PDF"}]})}</script>`}
</svelte:head>

<div class="pw-page">
	<ToolPageHeader
		category="pdf"
		title={tool_pages_password_title()}
		description={tool_pages_password_desc()}
		icon={LockIcon}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<PdfUploader bind:files multiple={false} label={tools_common_upload_pdf()} />

	{#if files.length > 0}
		<div class="opt-section">
			<div class="field">
				<label for="pw-user" class="field-label">{tool_pages_password_password_label()}</label>
				<div class="pw-row">
					<input
						id="pw-user"
						type={showPassword ? 'text' : 'password'}
						bind:value={userPassword}
						placeholder={tool_pages_password_password_placeholder()}
						class="field-input"
						autocomplete="new-password"
					/>
					<button class="show-btn" onclick={() => showPassword = !showPassword} type="button">
						{showPassword ? tools_common_hide() : tools_common_show()}
					</button>
				</div>
			</div>

			<label class="flex items-center gap-2 cursor-pointer text-sm">
				<input type="checkbox" bind:checked={useOwnerPassword} />
				{tool_pages_password_owner_toggle()}
			</label>

			{#if useOwnerPassword}
				<div class="field">
					<label for="pw-owner" class="field-label">{tool_pages_password_owner_label()}</label>
					<input
						id="pw-owner"
						type={showPassword ? 'text' : 'password'}
						bind:value={ownerPassword}
						placeholder={tool_pages_password_owner_placeholder()}
						class="field-input"
						autocomplete="new-password"
					/>
					<p class="text-xs text-muted mt-1">{tool_pages_password_owner_help()}</p>
				</div>
			{/if}
		</div>

		<div class="opt-section">
			<p class="field-label">{tool_pages_password_permissions_label()}</p>
			<label class="flex items-center gap-2 cursor-pointer text-sm">
				<input type="checkbox" bind:checked={allowPrinting} />
				{tool_pages_password_allow_printing()}
			</label>
			<label class="flex items-center gap-2 cursor-pointer text-sm">
				<input type="checkbox" bind:checked={allowCopying} />
				{tool_pages_password_allow_copying()}
			</label>
			<label class="flex items-center gap-2 cursor-pointer text-sm">
				<input type="checkbox" bind:checked={allowModifying} />
				{tool_pages_password_allow_editing()}
			</label>
		</div>

		<div class="info-box">
			<ShieldCheckIcon size={16} class="flex-shrink-0 mt-0.5" />
			<p class="text-sm">{tool_pages_password_info()}</p>
		</div>

		<button class="btn highlight" disabled={processing || !userPassword.trim()} onclick={apply}>
			{processing ? tool_pages_password_btn_busy() : tool_pages_password_btn()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{tool_pages_password_result()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{tool_pages_password_save()}</button>
		</div>
	{/if}

	
	{#if toolSeo['password']}
		<ToolSeoBlock
			faqs={toolSeo['password'].faqKeys.length >= 4 ? [
				{ q: tool_pages_password_seo_faq1_q?.() ?? '', a: tool_pages_password_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_password_seo_faq2_q?.() ?? '', a: tool_pages_password_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['password'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>
</div>

<style>
	.pw-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.opt-section { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.field { display: flex; flex-direction: column; gap: 0.25rem; }
	.field-label { font-size: 0.8125rem; font-weight: 600; }
	.field-input {
		padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg); width: 100%;
	}
	.field-input:focus { outline: 1.5px solid var(--accent); }
	.pw-row { display: flex; gap: 0.5rem; }
	.show-btn {
		padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 500;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt); color: var(--fg);
		cursor: pointer; white-space: nowrap;
	}
	.show-btn:hover { background: var(--bg-panel-highlight); }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.info-box {
		display: flex; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.75rem;
		background: var(--bg-badge); color: var(--fg-on-badge); font-size: 0.8125rem;
	}
</style>
