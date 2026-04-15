<script lang="ts">
	import clsx from "clsx";
	import { onMount } from "svelte";
	import { effects, files } from "$lib/store/index.svelte";
	import { goto } from "$app/navigation";
	import { upload_uploader_to_convert, upload_uploader_drop, upload_uploader_or, upload_uploader_click_browse, upload_uploader_add_more } from "$lib/paraglide/messages/_barrel.js";

	type Props = {
		class?: string;
		redirectSuffix?: string;
		compact?: boolean;
	};

	const { class: classList, redirectSuffix = "", compact = false }: Props = $props();

	let uploaderButton = $state<HTMLButtonElement>();
	let fileInput = $state<HTMLInputElement>();
	let isDragOver = $state(false);

	const uploadFiles = async () => {
		if (!fileInput) return;
		fileInput.click();
	};

	const handleFileChange = async (e: Event) => {
		if (!fileInput) return;
		const oldLength = files.files.length;
		await files.add(fileInput.files);
		if (oldLength !== files.files.length) goto(`/convert${redirectSuffix}`);
	};

	onMount(() => {
		const onEnter = (e: Event) => { e.preventDefault(); isDragOver = true; };
		const onLeave = (e: Event) => { e.preventDefault(); isDragOver = false; };
		const onDrop  = async (e: DragEvent) => {
			e.preventDefault();
			isDragOver = false;
			const oldLength = files.files.length;
			await files.add(e.dataTransfer?.files ?? null);
			if (oldLength !== files.files.length) goto(`/convert${redirectSuffix}`);
		};

		uploaderButton?.addEventListener("dragover",  onEnter);
		uploaderButton?.addEventListener("dragenter", onEnter);
		uploaderButton?.addEventListener("dragleave", onLeave);
		uploaderButton?.addEventListener("drop",      onDrop);

		return () => {
			uploaderButton?.removeEventListener("dragover",  onEnter);
			uploaderButton?.removeEventListener("dragenter", onEnter);
			uploaderButton?.removeEventListener("dragleave", onLeave);
			uploaderButton?.removeEventListener("drop",      onDrop);
		};
	});
</script>

<input
	bind:this={fileInput}
	type="file"
	multiple
	class="hidden"
	onchange={handleFileChange}
/>

<button
	onclick={uploadFiles}
	bind:this={uploaderButton}
	class={clsx(
		`${$effects ? "hover:scale-[1.02] active:scale-100" : ""} duration-200 ${classList}`,
		"dz",
		compact && "dz--compact",
		isDragOver && "dz--active",
	)}
	aria-label="To convert, drop or click to browse"
>
	{#if !compact}
		<!-- Full layout: icon above, text below -->
		<div class="dz-icon-ring">
			<svg class="dz-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 2C14 3 18 5 20 6v8c0 3-2.5 6-8 8-5.5-2-8-5-8-8V6c2-1 6-3 8-4Z" opacity="0.1" fill="currentColor" />
				<path d="M12 2C14 3 18 5 20 6v8c0 3-2.5 6-8 8-5.5-2-8-5-8-8V6c2-1 6-3 8-4Z" />
				<line x1="8" y1="10" x2="15" y2="10" />
				<polyline points="13,8 15,10 13,12" />
				<line x1="16" y1="14" x2="9" y2="14" />
				<polyline points="11,12 9,14 11,16" />
			</svg>
		</div>

		<p class="dz-text">
			<span class="dz-action">{upload_uploader_to_convert()}</span>
			<span class="dz-sep">&mdash;</span>
			<span class="dz-method">{upload_uploader_drop()}</span> {upload_uploader_or()} <span class="dz-method">{upload_uploader_click_browse()}</span>
		</p>
	{:else}
		<!-- Compact: horizontal single line -->
		<svg class="dz-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
			<path d="M12 2C14 3 18 5 20 6v8c0 3-2.5 6-8 8-5.5-2-8-5-8-8V6c2-1 6-3 8-4Z" opacity="0.1" fill="currentColor" />
			<path d="M12 2C14 3 18 5 20 6v8c0 3-2.5 6-8 8-5.5-2-8-5-8-8V6c2-1 6-3 8-4Z" />
			<line x1="8" y1="10" x2="15" y2="10" />
			<polyline points="13,8 15,10 13,12" />
			<line x1="16" y1="14" x2="9" y2="14" />
			<polyline points="11,12 9,14 11,16" />
		</svg>
		<span class="dz-text-compact">{upload_uploader_add_more()}</span>
	{/if}
</button>

<style lang="postcss">
	/* ── Base ── */
	.dz {
		@apply w-full flex flex-col items-center justify-center cursor-pointer;
		border: 2px dashed var(--bg-separator);
		border-radius: 1.25rem;
		background: var(--bg-panel);
		box-shadow: var(--shadow-panel);
		padding: 2.5rem 2rem;
		gap: 1.25rem;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}

	/* ── Compact variant ── */
	.dz--compact {
		flex-direction: row;
		padding: 1rem 1.5rem;
		gap: 0.75rem;
	}

	/* ── Hover ── */
	.dz:hover {
		border-color: var(--accent);
		box-shadow: var(--shadow-panel), 0 0 0 1px color-mix(in srgb, var(--accent) 15%, transparent);
	}

	.dz:hover .dz-icon-ring {
		border-color: color-mix(in srgb, var(--accent) 30%, transparent);
		background: color-mix(in srgb, var(--accent) 6%, transparent);
	}

	.dz:hover .dz-icon,
	.dz:hover .dz-icon-sm {
		color: var(--accent);
	}

	.dz:hover .dz-action {
		color: var(--accent);
	}

	/* ── Active drag ── */
	.dz--active {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 4%, var(--bg-panel));
		box-shadow: var(--shadow-panel), 0 0 0 3px color-mix(in srgb, var(--accent) 10%, transparent);
	}

	.dz--active .dz-icon-ring {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 12%, transparent);
	}

	.dz--active .dz-icon {
		color: var(--accent);
	}

	/* ── Icon ring (full mode) ── */
	.dz-icon-ring {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 1rem;
		border: 1.5px solid var(--bg-separator);
		background: transparent;
		transition: border-color 0.2s ease, background 0.2s ease;
	}

	.dz-icon {
		width: 1.75rem;
		height: 1.75rem;
		color: var(--fg-muted);
		transition: color 0.2s ease;
		flex-shrink: 0;
	}

	/* ── Small icon (compact) ── */
	.dz-icon-sm {
		width: 1.25rem;
		height: 1.25rem;
		color: var(--fg-muted);
		transition: color 0.2s ease;
		flex-shrink: 0;
	}

	/* ── Text line ── */
	.dz-text {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 500;
		letter-spacing: 0.01em;
		color: var(--fg-muted);
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.4em;
		flex-wrap: wrap;
		justify-content: center;
	}

	.dz-action {
		font-weight: 700;
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 0.75rem;
		transition: color 0.2s ease;
	}

	.dz-sep {
		opacity: 0.35;
	}

	.dz-method {
		color: var(--fg);
	}

	/* ── Compact text ── */
	.dz-text-compact {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.01em;
		color: var(--fg-muted);
	}
</style>
