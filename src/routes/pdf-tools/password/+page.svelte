<script lang="ts">
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { protectPdf } from '$lib/pdf/password';
	import { downloadPdf, formatFileSize } from '$lib/pdf/utils';
	import { LockIcon, ShieldCheckIcon } from 'lucide-svelte';

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

	async function apply() {
		if (files.length === 0) { error = 'Add a PDF file.'; return; }
		if (!userPassword.trim()) { error = 'Enter a password.'; return; }
		if (userPassword.length < 4) { error = 'Password must be at least 4 characters.'; return; }
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
			error = e instanceof Error ? e.message : 'Encryption failed.';
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, files[0].name.replace(/\.pdf$/i, '_protected.pdf'));
	}
</script>

<svelte:head>
	<title>Password Protect PDF — LocalConvert</title>
	<meta name="description" content="Add password protection to any PDF. Set permissions for printing, copying, and editing. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/password/" />
</svelte:head>

<div class="pw-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">← PDF Tools</a>
	<div class="pw-header">
		<LockIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Password Protect PDF</h1>
			<p class="text-sm text-muted">Encrypt a PDF with a password and set access permissions.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

	{#if files.length > 0}
		<div class="opt-section">
			<div class="field">
				<label for="pw-user" class="field-label">Password</label>
				<div class="pw-row">
					<input
						id="pw-user"
						type={showPassword ? 'text' : 'password'}
						bind:value={userPassword}
						placeholder="Enter password…"
						class="field-input"
						autocomplete="new-password"
					/>
					<button class="show-btn" onclick={() => showPassword = !showPassword} type="button">
						{showPassword ? 'Hide' : 'Show'}
					</button>
				</div>
			</div>

			<label class="flex items-center gap-2 cursor-pointer text-sm">
				<input type="checkbox" bind:checked={useOwnerPassword} />
				Set a separate owner password
			</label>

			{#if useOwnerPassword}
				<div class="field">
					<label for="pw-owner" class="field-label">Owner password</label>
					<input
						id="pw-owner"
						type={showPassword ? 'text' : 'password'}
						bind:value={ownerPassword}
						placeholder="Owner password…"
						class="field-input"
						autocomplete="new-password"
					/>
					<p class="text-xs text-muted mt-1">Owner password grants full access. User password enforces the permissions below.</p>
				</div>
			{/if}
		</div>

		<div class="opt-section">
			<p class="field-label">Permissions (for users opening with the password)</p>
			<label class="flex items-center gap-2 cursor-pointer text-sm">
				<input type="checkbox" bind:checked={allowPrinting} />
				Allow printing
			</label>
			<label class="flex items-center gap-2 cursor-pointer text-sm">
				<input type="checkbox" bind:checked={allowCopying} />
				Allow copying text
			</label>
			<label class="flex items-center gap-2 cursor-pointer text-sm">
				<input type="checkbox" bind:checked={allowModifying} />
				Allow editing / annotating
			</label>
		</div>

		<div class="info-box">
			<ShieldCheckIcon size={16} class="flex-shrink-0 mt-0.5" />
			<p class="text-sm">Encryption happens entirely in your browser. Your password and file never leave your device.</p>
		</div>

		<button class="btn highlight" disabled={processing || !userPassword.trim()} onclick={apply}>
			{processing ? 'Encrypting…' : 'Protect PDF'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">Protected! <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>Save protected PDF</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style>
	.pw-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.pw-header { display: flex; align-items: center; gap: 0.75rem; }
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
