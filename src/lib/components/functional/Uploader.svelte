<script lang="ts">
	import clsx from "clsx";
	import { onMount } from "svelte";
	import { effects, files } from "$lib/store/index.svelte";
	import { goto } from "$app/navigation";
	import { m } from "$lib/paraglide/messages";

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

	const handleFileChange = (e: Event) => {
		if (!fileInput) return;
		const oldLength = files.files.length;
		files.add(fileInput.files);
		if (oldLength !== files.files.length) goto(`/convert${redirectSuffix}`);
	};

	onMount(() => {
		const onEnter = (e: Event) => { e.preventDefault(); isDragOver = true; };
		const onLeave = (e: Event) => { e.preventDefault(); isDragOver = false; };
		const onDrop  = (e: DragEvent) => {
			e.preventDefault();
			isDragOver = false;
			const oldLength = files.files.length;
			files.add(e.dataTransfer?.files ?? null);
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
		"drop-zone",
		compact && "drop-zone--compact",
		isDragOver && "drop-zone--active",
	)}
	aria-label={m["upload.uploader.text"]({ action: m["upload.uploader.convert"]() })}
>
	<!-- Shield + arrows brand mark -->
	<svg class="drop-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
		<path d="M12 2C14 3 18 5 20 6v8c0 3-2.5 6-8 8-5.5-2-8-5-8-8V6c2-1 6-3 8-4Z" opacity="0.08" fill="currentColor" />
		<path d="M12 2C14 3 18 5 20 6v8c0 3-2.5 6-8 8-5.5-2-8-5-8-8V6c2-1 6-3 8-4Z" />
		<line x1="8" y1="10" x2="15" y2="10" />
		<polyline points="13,8 15,10 13,12" />
		<line x1="16" y1="14" x2="9" y2="14" />
		<polyline points="11,12 9,14 11,16" />
	</svg>

	{#if !compact}
		<p class="drop-zone-label">{m["upload.uploader.text"]({ action: m["upload.uploader.convert"]() })}</p>
		<p class="drop-zone-hint">{m["upload.uploader.browse"]()}</p>
	{:else}
		<p class="drop-zone-hint">{m["upload.uploader.browse"]()}</p>
	{/if}
</button>

<style lang="postcss">
	.drop-zone {
		@apply w-full flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all;
		border: 2px dashed var(--bg-separator);
		border-radius: 1.25rem;
		background: var(--bg-panel);
		box-shadow: var(--shadow-panel);
		padding: 2.5rem 1.5rem;
	}

	.drop-zone--compact {
		padding: 1.25rem 1rem;
		gap: 1rem;
		flex-direction: row;
	}

	.drop-zone--compact .drop-zone-icon {
		width: 1.75rem;
		height: 1.75rem;
	}

	/* Hover — border glows accent */
	.drop-zone:hover {
		border-color: var(--accent);
		box-shadow: var(--shadow-panel), 0 0 0 1px color-mix(in srgb, var(--accent) 15%, transparent);
	}

	/* Active drag — accent fill + stronger glow */
	.drop-zone--active {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 5%, var(--bg-panel));
		box-shadow: var(--shadow-panel), 0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent);
	}

	.drop-zone--active .drop-zone-icon {
		color: var(--accent);
	}

	.drop-zone-icon {
		width: 2.75rem;
		height: 2.75rem;
		color: var(--fg-muted);
		transition: color 0.15s ease;
		flex-shrink: 0;
	}

	.drop-zone:hover .drop-zone-icon {
		color: var(--accent);
	}

	.drop-zone-label {
		font-family: var(--font-body);
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--fg);
		margin: 0;
	}

	.drop-zone-hint {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: var(--fg-muted);
		margin: 0;
	}
</style>
