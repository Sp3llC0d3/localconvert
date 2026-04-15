<script lang="ts">
	const __nkm = {'pdf_tools.tools.merge_name': pdf_tools_tools_merge_name, 'pdf_tools.tools.split_name': pdf_tools_tools_split_name, 'pdf_tools.tools.rotate_name': pdf_tools_tools_rotate_name};
	import { tool_pages_organize_no_pages, tools_common_failed, tool_pages_organize_title, tool_pages_organize_desc, tools_common_back_pdf, tools_common_upload_pdf, tools_common_loading_thumbs, tool_pages_organize_drag_reorder, tool_pages_organize_move_up, tool_pages_organize_move_down, tool_pages_organize_delete_page, tools_common_pages_remaining, tool_pages_organize_btn_busy, tool_pages_organize_btn, tools_common_privacy_note, tool_pages_organize_seo_faq1_q, tool_pages_organize_seo_faq1_a, tool_pages_organize_seo_faq2_q, tool_pages_organize_seo_faq2_a, pdf_tools_tools_merge_name, pdf_tools_tools_split_name, pdf_tools_tools_rotate_name } from "$lib/paraglide/messages/_barrel.js";
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { organizePdf } from '$lib/pdf/organize';
	import { renderAllThumbnails } from '$lib/pdf/thumbnails';
	import { downloadPdf, getOutputName } from '$lib/pdf/utils';
	import { LayoutGridIcon, Trash2Icon, ArrowUpIcon, ArrowDownIcon, GripVerticalIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { dndzone } from 'svelte-dnd-action';
	import ToolSeoBlock from '$lib/components/layout/ToolSeoBlock.svelte';
	import { toolSeo } from '$lib/data/tool-seo';

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
		if (items.length === 0) { error = tool_pages_organize_no_pages(); return; }
		error = '';
		processing = true;
		try {
			const order = items.map(item => item.origIdx);
			const bytes = await organizePdf(files[0], order);
			downloadPdf(bytes, getOutputName(files[0].name, 'organized', 'pdf'));
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : tools_common_failed();
		}
		processing = false;
	}
</script>

<svelte:head>
	<title>Organize PDF Pages — LocalConvert</title>
	<meta name="description" content="Drag and drop to reorder PDF pages. Delete unwanted pages. Free, private, no uploads — runs entirely in your browser." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/organize/" />
	<meta property="og:title" content="Organize PDF Pages — LocalConvert" />
	<meta property="og:description" content="Drag and drop to reorder PDF pages. Delete unwanted pages. Free, private, no uploads — runs entirely in your browser." />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/organize/" />
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":"How to Organize PDF Pages","step":[{"@type":"HowToStep","text":"Select a PDF file"},{"@type":"HowToStep","text":"Drag and drop pages to reorder them"},{"@type":"HowToStep","text":"Delete any unwanted pages"},{"@type":"HowToStep","text":"Save the organized PDF"}]})}</script>`}
</svelte:head>

<div class="pdf-page">
	<ToolPageHeader
		category="pdf"
		title={tool_pages_organize_title()}
		description={tool_pages_organize_desc()}
		icon={LayoutGridIcon}
		backHref="/pdf-tools/"
		backLabel={tools_common_back_pdf()}
	/>

	<PdfUploader bind:files multiple={false} label={tools_common_upload_pdf()} />

	{#if loadingThumbs}
		<div class="flex flex-col gap-2">
			<p class="text-sm text-muted">{tools_common_loading_thumbs()} {thumbProgress}%</p>
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
					<div class="drag-handle" aria-label={tool_pages_organize_drag_reorder()}>
						<GripVerticalIcon size={16} />
					</div>
					<img src={thumbs[item.origIdx]} alt="Page {item.origIdx + 1}" class="org-thumb" />
					<span class="text-sm flex-1">Page {item.origIdx + 1}</span>
					<div class="flex gap-1">
						<button class="icon-btn" onclick={() => moveUp(i)} disabled={i === 0} aria-label={tool_pages_organize_move_up()}>
							<ArrowUpIcon size={14} />
						</button>
						<button class="icon-btn" onclick={() => moveDown(i)} disabled={i === items.length - 1} aria-label={tool_pages_organize_move_down()}>
							<ArrowDownIcon size={14} />
						</button>
						<button class="icon-btn del-btn" onclick={() => deletePage(i)} aria-label={tool_pages_organize_delete_page()}>
							<Trash2Icon size={14} />
						</button>
					</div>
				</div>
			{/each}
		</div>

		<p class="text-xs text-muted">{tools_common_pages_remaining({ count: items.length })}</p>

		<button class="btn highlight" disabled={processing} onclick={save}>
			{processing ? tool_pages_organize_btn_busy() : tool_pages_organize_btn()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}
	
	{#if toolSeo['organize']}
		<ToolSeoBlock
			faqs={toolSeo['organize'].faqKeys.length >= 4 ? [
				{ q: tool_pages_organize_seo_faq1_q?.() ?? '', a: tool_pages_organize_seo_faq1_a?.() ?? '' },
				{ q: tool_pages_organize_seo_faq2_q?.() ?? '', a: tool_pages_organize_seo_faq2_a?.() ?? '' },
			] : []}
			relatedTools={toolSeo['organize'].related.map(r => ({ href: r.href, name: __nkm[r.nameKey]?.() ?? '', icon: r.icon }))}
		/>
	{/if}

	<p class="text-xs text-muted mt-2">{tools_common_privacy_note()}</p>
</div>

<style>
	.pdf-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
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
