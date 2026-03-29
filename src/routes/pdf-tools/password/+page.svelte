<script lang="ts">
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { protectPdf } from '$lib/pdf/password';
	import { downloadPdf, formatFileSize, getOutputName } from '$lib/pdf/utils';
	import { LockIcon, ShieldCheckIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { m } from '$lib/paraglide/messages';

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
		if (files.length === 0) { error = m['tool_pages.password.err_pdf'](); return; }
		if (!userPassword.trim()) { error = m['tool_pages.password.err_password'](); return; }
		if (userPassword.trim().length < 4) { error = m['tool_pages.password.err_min_length'](); return; }
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
			error = e instanceof Error ? e.message : m['tool_pages.password.err_fail']();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, getOutputName(files[0].name, 'protected', 'pdf'));
	}
</script>

<svelte:head>
	<title>Password Protect PDF — LocalConvert</title>
	<meta name="description" content="Add password protection to any PDF. Set permissions for printing, copying, and editing. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/password/" />
</svelte:head>

<div class="pw-page">
	<ToolPageHeader
		category="pdf"
		title={m['tool_pages.password.title']()}
		description={m['tool_pages.password.desc']()}
		icon={LockIcon}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<PdfUploader bind:files multiple={false} label={m['tools_common.upload_pdf']()} />

	{#if files.length > 0}
		<div class="opt-section">
			<div class="field">
				<label for="pw-user" class="field-label">{m['tool_pages.password.password_label']()}</label>
				<div class="pw-row">
					<input
						id="pw-user"
						type={showPassword ? 'text' : 'password'}
						bind:value={userPassword}
						placeholder={m['tool_pages.password.password_placeholder']()}
						class="field-input"
						autocomplete="new-password"
					/>
					<button class="show-btn" onclick={() => showPassword = !showPassword} type="button">
						{showPassword ? m['tools_common.hide']() : m['tools_common.show']()}
					</button>
				</div>
			</div>

			<label class="flex items-center gap-2 cursor-pointer text-sm">
				<input type="checkbox" bind:checked={useOwnerPassword} />
				{m['tool_pages.password.owner_toggle']()}
			</label>

			{#if useOwnerPassword}
				<div class="field">
					<label for="pw-owner" class="field-label">{m['tool_pages.password.owner_label']()}</label>
					<input
						id="pw-owner"
						type={showPassword ? 'text' : 'password'}
						bind:value={ownerPassword}
						placeholder={m['tool_pages.password.owner_placeholder']()}
						class="field-input"
						autocomplete="new-password"
					/>
					<p class="text-xs text-muted mt-1">{m['tool_pages.password.owner_help']()}</p>
				</div>
			{/if}
		</div>

		<div class="opt-section">
			<p class="field-label">{m['tool_pages.password.permissions_label']()}</p>
			<label class="flex items-center gap-2 cursor-pointer text-sm">
				<input type="checkbox" bind:checked={allowPrinting} />
				{m['tool_pages.password.allow_printing']()}
			</label>
			<label class="flex items-center gap-2 cursor-pointer text-sm">
				<input type="checkbox" bind:checked={allowCopying} />
				{m['tool_pages.password.allow_copying']()}
			</label>
			<label class="flex items-center gap-2 cursor-pointer text-sm">
				<input type="checkbox" bind:checked={allowModifying} />
				{m['tool_pages.password.allow_editing']()}
			</label>
		</div>

		<div class="info-box">
			<ShieldCheckIcon size={16} class="flex-shrink-0 mt-0.5" />
			<p class="text-sm">{m['tool_pages.password.info']()}</p>
		</div>

		<button class="btn highlight" disabled={processing || !userPassword.trim()} onclick={apply}>
			{processing ? m['tool_pages.password.btn_busy']() : m['tool_pages.password.btn']()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{m['tool_pages.password.result']()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{m['tool_pages.password.save']()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
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
