<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { organizePdf } from '$lib/pdf/organize';
	import { renderAllThumbnails } from '$lib/pdf/thumbnails';
	import { downloadPdf } from '$lib/pdf/utils';
	import { LayoutGridIcon, Trash2Icon, ArrowUpIcon, ArrowDownIcon, GripVerticalIcon } from 'lucide-svelte';
	import { dndzone } from 'svelte-dnd-action';

	let files = $state<File[]>([]);
	let thumbs = $state<string[]>([]);
	let items = $state<{ id: number; origIdx: number }[]>([]);
	let loadingThumbs = $state(false);
	let thumbProgress = $state(0);
	let processing = $state(false);
	let error = $state('');

	$effect(() => {
		if (!browser || files.length === 0) { thumbs = []; items = []; return; }
		let cancelled = false;
		loadingThumbs = true;
		thumbProgress = 0;
		renderAllThumbnails(files[0], 0.3, (done, total) => {
			if (!cancelled) thumbProgress = Math.round((done / total) * 100);
		}).then(t => {
			if (!cancelled) {
				thumbs = t;
				items = t.map((_, i) => ({ id: i + 1, origIdx: i }));
				loadingThumbs = false;
			}
		}).catch(e => {
			if (!cancelled) { error = e.message; loadingThumbs = false; }
		});
		return () => { cancelled = true; };
	});

	function handleDndConsider(e: CustomEvent<{ items: typeof items }>) {
		items = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<{ items: typeof items }>) {
		items = e.detail.items;
	}

	function moveUp(i: number) {
		if (i === 0) return;
		const arr = [...items];
		[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
		items = arr;
	}

	function moveDown(i: number) {
		if (i === items.length - 1) return;
		const arr = [...items];
		[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
		items = arr;
	}

	function deletePage(i: number) {
		items = items.filter((_, idx) => idx !== i);
	}

	async function save() {
		if (items.length === 0) { error = m['tool_pages.organize.no_pages'](); return; }
		error = '';
		processing = true;
		try {
			const order = items.map(item => item.origIdx);
			const bytes = await organizePdf(files[0], order);
			downloadPdf(bytes, files[0].name.replace(/\.pdf$/i, '_organized.pdf'));
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tools_common.failed']();
		}
		processing = false;
	}
</script>

<svelte:head>
	<title>Organize PDF Pages — LocalConvert</title>
	<meta name="description" content="Drag and drop to reorder PDF pages. Delete unwanted pages. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/organize/" />
</svelte:head>

<div class="pdf-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">{m['tools_common.back_pdf']()}</a>
	<div class="pdf-header">
		<LayoutGridIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">{m['tool_pages.organize.title']()}</h1>
			<p class="text-sm text-muted">{m['tool_pages.organize.desc']()}</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label={m['tools_common.upload_pdf']()} />

	{#if loadingThumbs}
		<div class="flex flex-col gap-2">
			<p class="text-sm text-muted">{m['tools_common.loading_thumbs']()} {thumbProgress}%</p>
			<div class="h-1.5 rounded-full bg-separator overflow-hidden">
				<div class="h-full bg-accent transition-all" style="width: {thumbProgress}%"></div>
			</div>
		</div>
	{:else if items.length > 0}
		<div
			class="org-list"
			use:dndzone={{ items, flipDurationMs: 200, dropTargetStyle: { outline: '2px dashed var(--accent)', borderRadius: '0.75rem' } }}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
		>
			{#each items as item, i (item.id)}
				<div class="org-row" aria-label="Page {item.origIdx + 1}">
					<div class="drag-handle" aria-label={m['tool_pages.organize.drag_reorder']()}>
						<GripVerticalIcon size={16} />
					</div>
					<img src={thumbs[item.origIdx]} alt="Page {item.origIdx + 1}" class="org-thumb" />
					<span class="text-sm flex-1">Page {item.origIdx + 1}</span>
					<div class="flex gap-1">
						<button class="icon-btn" onclick={() => moveUp(i)} disabled={i === 0} aria-label="Move up">
							<ArrowUpIcon size={14} />
						</button>
						<button class="icon-btn" onclick={() => moveDown(i)} disabled={i === items.length - 1} aria-label="Move down">
							<ArrowDownIcon size={14} />
						</button>
						<button class="icon-btn del-btn" onclick={() => deletePage(i)} aria-label="Delete page">
							<Trash2Icon size={14} />
						</button>
					</div>
				</div>
			{/each}
		</div>

		<p class="text-xs text-muted">{m['tools_common.pages_remaining']({ count: items.length })}</p>

		<button class="btn highlight" disabled={processing} onclick={save}>
			{processing ? m['tool_pages.organize.btn_busy']() : m['tool_pages.organize.btn']()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}
	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style>
	.pdf-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.pdf-header { display: flex; align-items: center; gap: 0.75rem; }

	.org-list { display: flex; flex-direction: column; gap: 0.5rem; }
	.org-row {
		display: flex; align-items: center; gap: 0.75rem;
		padding: 0.5rem 1rem; border-radius: 0.75rem;
		background: var(--bg-panel); box-shadow: var(--shadow-panel);
		cursor: grab; user-select: none; touch-action: manipulation;
	}
	.org-row:active { cursor: grabbing; }

	.drag-handle {
		display: flex; align-items: center; color: var(--fg-muted);
		cursor: grab; flex-shrink: 0;
	}
	.drag-handle:active { cursor: grabbing; }

	.org-thumb {
		width: 2.5rem; height: 3.5rem; object-fit: contain;
		border-radius: 0.375rem; flex-shrink: 0;
		border: 1px solid var(--bg-separator);
	}

	.icon-btn {
		width: 1.75rem; height: 1.75rem; border-radius: 0.5rem;
		display: flex; align-items: center; justify-content: center;
		border: none; background: transparent; cursor: pointer;
		color: var(--fg-muted); transition: background 0.1s;
	}
	.icon-btn:hover { background: var(--bg-panel-alt); }
	.icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
	.del-btn:hover { color: var(--fg-failure, #e53e3e); }
</style>
