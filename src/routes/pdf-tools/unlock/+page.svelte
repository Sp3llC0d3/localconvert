<script lang="ts">
	const __nkm = {'pdf_tools.tools.password_name': pdf_tools_tools_password_name, 'pdf_tools.tools.metadata_name': pdf_tools_tools_metadata_name, 'pdf_tools.tools.edit_name': pdf_tools_tools_edit_name};
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { unlockPdf } from '$lib/pdf/unlock';
	import { downloadPdf, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { LockOpenIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { tool_pages_unlock_err_pdf, tool_pages_unlock_err_fail, tool_pages_unlock_title, tool_pages_unlock_desc, tools_common_back_pdf, tools_common_upload_pdf_protected, tool_pages_unlock_info, tool_pages_unlock_password_label, tool_pages_unlock_password_placeholder, tool_pages_unlock_password_hint, tool_pages_unlock_btn_busy, tool_pages_unlock_btn, tool_pages_unlock_result, tool_pages_unlock_save, tools_common_privacy_note, tool_pages_unlock_seo_faq1_q, tool_pages_unlock_seo_faq1_a, tool_pages_unlock_seo_faq2_q, tool_pages_unlock_seo_faq2_a, pdf_tools_tools_password_name, pdf_tools_tools_metadata_name, pdf_tools_tools_edit_name , navbar_home, navbar_pdf_tools, meta_descriptions_pdf_unlock} from "$lib/paraglide/messages/_barrel.js";
	import { localizeHref } from '$lib/paraglide/runtime';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

	let files = $state<File[]>([]);
	let password = $state('');
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	$effect(() => {
		void files;
		resultBytes = null;
		error = '';
	});

	async function apply() {
		if (files.length === 0) { error = tool_pages_unlock_err_pdf(); return; }
		error = '';
		processing = true;
		resultBytes = null;
		try {
			resultBytes = await unlockPdf(files[0], password);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tool_pages_unlock_err_fail();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, getOutputName(files[0].name, 'unlocked', 'pdf'));
	}
</script>

<svelte:head>
	<title>{tool_pages_unlock_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_pdf_unlock()} />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/unlock/" />
	<meta property="og:title" content="{tool_pages_unlock_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_pdf_unlock()} />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/unlock/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Unlock a PDF","step":[{"@type":"HowToStep","text":"Select a password-protected PDF"},{"@type":"HowToStep","text":"Enter the current password"},{"@type":"HowToStep","text":"Click unlock to remove protection"},{"@type":"HowToStep","text":"Save the unlocked PDF"}]})}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":navbar_home(),"item":"https://localconvert.app"+localizeHref("/")},{"@type":"ListItem","position":2,"name":navbar_pdf_tools(),"item":"https://localconvert.app"+localizeHref("/pdf-tools/")},{"@type":"ListItem","position":3,"name":tool_pages_unlock_title()}]})}</script>`}
</svelte:head>

<div class="unlock-page">
	<ToolPageHeader
		category="pdf"
		title={tool_pages_unlock_title()}
		description={tool_pages_unlock_desc()}
		icon={LockOpenIcon}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<PdfUploader bind:files multiple={false} label={tools_common_upload_pdf_protected()} />

	{#if files.length > 0}
		<div class="info-box">
			<p class="text-sm">{tool_pages_unlock_info()}</p>
		</div>

		<div class="opt-section">
			<label class="text-sm font-medium">{tool_pages_unlock_password_label()}</label>
			<input
				type="password"
				bind:value={password}
				placeholder={tool_pages_unlock_password_placeholder()}
				class="pwd-input"
			/>
			<p class="text-xs text-muted">{tool_pages_unlock_password_hint()}</p>
		</div>

		<button class="btn highlight" disabled={processing} onclick={apply}>
			{processing ? tool_pages_unlock_btn_busy() : tool_pages_unlock_btn()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{tool_pages_unlock_result()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{tool_pages_unlock_save()}</button>
		</div>
	{/if}

	
	{#if toolSeo['unlock']}
		<ToolSeoBlock
			faqs={toolSeo['unlock'].faqKeys.length >= 4 ? [
				{ q: tool_pages_unlock_seo_faq1_q?.() ?? '', a: tool_pages_unlock_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_unlock_seo_faq2_q?.() ?? '', a: tool_pages_unlock_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['unlock'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>
</div>

<style>
	.unlock-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.info-box { padding: 0.75rem 1rem; border-radius: 0.75rem; background: var(--bg-panel-alt); color: var(--fg-muted); }
	.opt-section { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }
	.pwd-input {
		width: 100%; padding: 0.6rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.pwd-input:focus { outline: 1.5px solid var(--accent); }
</style>
