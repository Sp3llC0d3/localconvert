<script lang="ts">
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { editPdf, type PdfEdit, type TextEdit } from '$lib/pdf/edit';
	import { renderAllThumbnails } from '$lib/pdf/thumbnails';
	import { downloadPdf, formatFileSize, getPdfJs } from '$lib/pdf/utils';
	import { EditIcon, Trash2Icon, Undo2Icon, Redo2Icon } from 'lucide-svelte';
	import { createHistory } from '$lib/util/history.svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let resultBytes = $state<Uint8Array | null>(null);

	// Page info
	let thumbs = $state<string[]>([]);
	let currentPage = $state(0);
	let pageWidth = $state(612);
	let pageHeight = $state(792);
	let displayW = $state(0);
	let displayH = $state(0);

	// Edit state
	interface PlacedText {
		id: string;
		text: string;
		x: number; // PDF points from left
		y: number; // PDF points from bottom
		fontSize: number;
		color: string;
	}

	let elements = $state<PlacedText[]>([]);
	let selectedId = $state<string | null>(null);
	let newText = $state('Type here');
	let newFontSize = $state(14);
	let newColor = $state('#000000');

	// Undo/redo
	const history = createHistory<PlacedText[]>([]);

	function pushHistory() {
		history.push(elements.map((e) => ({ ...e })));
	}

	function doUndo() {
		const state = history.undo();
		if (state) { elements = state; selectedId = null; }
	}

	function doRedo() {
		const state = history.redo();
		if (state) { elements = state; selectedId = null; }
	}

	// Ghost preview (follows cursor before placing)
	let ghostPos = $state({ x: 0, y: 0 });
	let showGhost = $state(false);

	// Dragging
	let dragging = $state<{ id: string; offsetX: number; offsetY: number } | null>(null);

	// Page container ref
	let pageContainer = $state<HTMLDivElement>();

	$effect(() => {
		if (!browser || files.length === 0) {
			thumbs = [];
			elements = [];
			resultBytes = null;
			return;
		}
		loadPdf();
	});

	async function loadPdf() {
		try {
			const pdfjs = await getPdfJs();
			const buf = await files[0].arrayBuffer();
			const doc = await pdfjs.getDocument({ data: buf }).promise;
			const page = await doc.getPage(1);
			const vp = page.getViewport({ scale: 1 });
			pageWidth = Math.round(vp.width);
			pageHeight = Math.round(vp.height);
			currentPage = 0;
			// Render at higher quality for the interactive preview
			thumbs = await renderAllThumbnails(files[0], 1.0);
			calcDisplaySize();
		} catch {
			error = 'Failed to read PDF.';
		}
	}

	function calcDisplaySize() {
		const maxW = Math.min(600, (typeof window !== 'undefined' ? window.innerWidth : 600) - 48);
		const scale = Math.min(1, maxW / pageWidth);
		displayW = Math.round(pageWidth * scale);
		displayH = Math.round(pageHeight * scale);
	}

	// Convert display px to PDF points
	function toPdfCoords(displayX: number, displayY: number): { x: number; y: number } {
		const scaleX = pageWidth / displayW;
		const scaleY = pageHeight / displayH;
		return {
			x: Math.round(displayX * scaleX),
			y: Math.round(pageHeight - displayY * scaleY), // flip Y: PDF origin is bottom-left
		};
	}

	// Convert PDF points to display px
	function toDisplayCoords(pdfX: number, pdfY: number): { x: number; y: number } {
		const scaleX = displayW / pageWidth;
		const scaleY = displayH / pageHeight;
		return {
			x: pdfX * scaleX,
			y: (pageHeight - pdfY) * scaleY, // flip Y back
		};
	}

	function hexToRgb(hex: string): [number, number, number] {
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;
		return [r, g, b];
	}

	function getRelPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
		if (!pageContainer) return { x: 0, y: 0 };
		const rect = pageContainer.getBoundingClientRect();
		const pos = 'touches' in e && e.touches.length > 0 ? e.touches[0] : (e as MouseEvent);
		return {
			x: pos.clientX - rect.left,
			y: pos.clientY - rect.top,
		};
	}

	// Ghost follows cursor
	function onPageMouseMove(e: MouseEvent) {
		if (dragging) {
			// Drag element
			const pos = getRelPos(e);
			const pdf = toPdfCoords(pos.x - dragging.offsetX, pos.y - dragging.offsetY);
			const el = elements.find((el) => el.id === dragging.id);
			if (el) {
				el.x = pdf.x;
				el.y = pdf.y;
			}
			return;
		}
		if (!newText.trim()) return;
		const pos = getRelPos(e);
		ghostPos = { x: pos.x, y: pos.y };
		showGhost = true;
	}

	function onPageMouseLeave() {
		showGhost = false;
		if (dragging) dragging = null;
	}

	// Click to place text
	function onPageClick(e: MouseEvent) {
		if (dragging) return;
		if (!newText.trim()) return;
		const pos = getRelPos(e);
		const pdf = toPdfCoords(pos.x, pos.y);

		elements = [...elements, {
			id: crypto.randomUUID(),
			text: newText.trim(),
			x: pdf.x,
			y: pdf.y,
			fontSize: newFontSize,
			color: newColor,
		}];
		selectedId = elements[elements.length - 1].id;
		pushHistory();
	}

	// Element drag
	function onElementPointerDown(e: MouseEvent, el: PlacedText) {
		e.stopPropagation();
		selectedId = el.id;
		const pos = getRelPos(e);
		const disp = toDisplayCoords(el.x, el.y);
		dragging = {
			id: el.id,
			offsetX: pos.x - disp.x,
			offsetY: pos.y - disp.y,
		};
		showGhost = false;
	}

	function onPageMouseUp() {
		if (dragging) {
			dragging = null;
			pushHistory();
		}
	}

	function removeElement(id: string) {
		elements = elements.filter((el) => el.id !== id);
		if (selectedId === id) selectedId = null;
		pushHistory();
	}

	// Keyboard shortcuts
	function onKeyDown(e: KeyboardEvent) {
		// Ignore if typing in an input
		if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

		if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
			e.preventDefault();
			doUndo();
		} else if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
			e.preventDefault();
			doRedo();
		} else if (e.key === 'Escape') {
			selectedId = null;
		} else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
			e.preventDefault();
			removeElement(selectedId);
		} else if (selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
			e.preventDefault();
			const el = elements.find((el) => el.id === selectedId);
			if (!el) return;
			const step = e.shiftKey ? 10 : 1;
			if (e.key === 'ArrowUp') el.y += step;    // PDF Y increases upward
			if (e.key === 'ArrowDown') el.y -= step;
			if (e.key === 'ArrowLeft') el.x -= step;
			if (e.key === 'ArrowRight') el.x += step;
		}
	}

	async function apply() {
		if (files.length === 0 || elements.length === 0) {
			error = elements.length === 0 ? 'Click on the page to place text.' : 'Add a PDF.';
			return;
		}
		error = '';
		processing = true;
		resultBytes = null;
		try {
			const pdfEdits: PdfEdit[] = elements.map((el) => ({
				type: 'text' as const,
				text: el.text,
				x: el.x,
				y: el.y,
				fontSize: el.fontSize,
				color: hexToRgb(el.color),
			}));
			resultBytes = await editPdf(files[0], currentPage, pdfEdits);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed.';
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, files[0].name.replace(/\.pdf$/i, '_edited.pdf'));
	}
</script>

<svelte:window onkeydown={onKeyDown} />

<svelte:head>
	<title>Edit PDF — LocalConvert</title>
	<meta name="description" content="Click anywhere on a PDF page to add text. Drag to reposition. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/edit/" />
</svelte:head>

<div class="edit-page">
	<a href="/pdf-tools/" class="text-sm text-muted hover:underline">← PDF Tools</a>
	<div class="edit-header">
		<EditIcon size={28} />
		<div>
			<h1 class="text-2xl font-semibold">Edit PDF</h1>
			<p class="text-sm text-muted">Click on the page to place text. Drag to reposition.</p>
		</div>
	</div>

	<PdfUploader bind:files multiple={false} label="Add a PDF file" />

	{#if thumbs.length > 0 && displayW > 0}
		<!-- Text input bar -->
		<div class="text-bar">
			<input
				type="text"
				bind:value={newText}
				placeholder="Text to place…"
				class="text-input"
			/>
			<input type="number" min={6} max={72} bind:value={newFontSize} class="size-input" aria-label="Font size" />
			<span class="text-xs text-muted">pt</span>
			<input type="color" bind:value={newColor} class="color-input" aria-label="Text color" />
			<div class="hist-btns">
				<button class="hist-btn" onclick={doUndo} disabled={!history.canUndo} aria-label="Undo (Ctrl+Z)">
					<Undo2Icon size={16} />
				</button>
				<button class="hist-btn" onclick={doRedo} disabled={!history.canRedo} aria-label="Redo (Ctrl+Shift+Z)">
					<Redo2Icon size={16} />
				</button>
			</div>
		</div>
		<p class="text-xs text-muted">Ctrl+Z undo · Del remove · Arrow keys nudge · Esc deselect</p>

		<!-- Page selector -->
		{#if thumbs.length > 1}
			<div class="flex gap-2 flex-wrap">
				{#each thumbs as _, i}
					<button class="btn text-sm px-3 py-1.5 {currentPage === i ? 'highlight' : ''}" onclick={() => { currentPage = i; elements = []; }}>
						Page {i + 1}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Interactive page preview -->
		<div class="page-workspace">
			<div
				bind:this={pageContainer}
				class="page-container"
				style="width: {displayW}px; max-width: 100%; height: {displayH}px;"
				onmousemove={onPageMouseMove}
				onmouseleave={onPageMouseLeave}
				onmouseup={onPageMouseUp}
				onclick={onPageClick}
				role="application"
				aria-label="PDF page editor"
			>
				<!-- Rendered page -->
				<img src={thumbs[currentPage]} alt="Page {currentPage + 1}" class="page-img" draggable="false" />

				<!-- Ghost preview (follows cursor) -->
				{#if showGhost && newText.trim() && !dragging}
					<div
						class="ghost-text"
						style="left: {ghostPos.x}px; top: {ghostPos.y}px; font-size: {newFontSize * (displayW / pageWidth)}px; color: {newColor};"
					>
						{newText}
					</div>
				{/if}

				<!-- Placed elements -->
				{#each elements as el (el.id)}
					{@const disp = toDisplayCoords(el.x, el.y)}
					<div
						class="placed-text"
						class:selected={selectedId === el.id}
						style="left: {disp.x}px; top: {disp.y}px; font-size: {el.fontSize * (displayW / pageWidth)}px; color: {el.color};"
						onmousedown={(e) => onElementPointerDown(e, el)}
						role="button"
						tabindex="0"
					>
						{el.text}
						{#if selectedId === el.id}
							<button
								class="delete-btn"
								onclick={(e) => { e.stopPropagation(); removeElement(el.id); }}
								aria-label="Remove text"
							>
								<Trash2Icon size={12} />
							</button>
						{/if}
					</div>
				{/each}
			</div>
			<p class="text-xs text-muted mt-2">{elements.length} element{elements.length !== 1 ? 's' : ''} placed</p>
		</div>

		<button class="btn highlight" disabled={processing || elements.length === 0} onclick={apply}>
			{processing ? 'Applying…' : 'Save edited PDF'}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">Ready! <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>Download</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">✓ Your files never leave your device.</p>
</div>

<style>
	.edit-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
	.edit-header { display: flex; align-items: center; gap: 0.75rem; }
	.result-box { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border-radius: 1rem; background: var(--bg-panel); box-shadow: var(--shadow-panel); }

	/* Text input bar */
	.text-bar {
		display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border-radius: 1rem;
		background: var(--bg-panel); box-shadow: var(--shadow-panel); flex-wrap: wrap;
	}
	.text-input {
		flex: 1; min-width: 8rem; padding: 0.375rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.text-input:focus { outline: 1.5px solid var(--accent); }
	.size-input {
		width: 3.5rem; padding: 0.375rem 0.5rem; border-radius: 0.5rem; font-size: 0.8125rem; text-align: center;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
	}
	.size-input:focus { outline: 1.5px solid var(--accent); }
	.color-input { width: 2rem; height: 2rem; border-radius: 0.375rem; cursor: pointer; border: 1px solid var(--bg-separator); padding: 0; }
	.hist-btns { display: flex; gap: 0.25rem; margin-left: auto; }
	.hist-btn {
		display: flex; align-items: center; justify-content: center;
		width: 2rem; height: 2rem; border-radius: 0.375rem;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel));
		cursor: pointer; color: inherit; transition: background 0.1s;
	}
	.hist-btn:hover:not(:disabled) { background: var(--bg-panel-highlight); }
	.hist-btn:disabled { opacity: 0.3; cursor: default; }

	/* Page workspace */
	.page-workspace { display: flex; flex-direction: column; align-items: center; }
	.page-container {
		position: relative; cursor: crosshair; user-select: none; -webkit-user-select: none;
		border-radius: 0.5rem; overflow: hidden; box-shadow: var(--shadow-panel);
	}
	.page-img { display: block; width: 100%; height: 100%; pointer-events: none; }

	/* Ghost preview */
	.ghost-text {
		position: absolute; pointer-events: none; opacity: 0.4;
		white-space: nowrap; font-family: sans-serif; font-weight: normal;
		transform: translateY(-100%);
	}

	/* Placed text elements */
	.placed-text {
		position: absolute; cursor: move; white-space: nowrap;
		font-family: sans-serif; font-weight: normal;
		padding: 1px 3px; border-radius: 2px;
		transform: translateY(-100%);
		transition: box-shadow 0.1s ease;
	}
	.placed-text:hover { box-shadow: 0 0 0 1.5px var(--accent); }
	.placed-text.selected { box-shadow: 0 0 0 2px var(--accent); background: rgba(15, 110, 86, 0.08); }

	/* Delete button on selected element */
	.delete-btn {
		position: absolute; top: -10px; right: -10px;
		width: 20px; height: 20px; border-radius: 50%;
		background: var(--fg-failure, #e53e3e); color: white;
		display: flex; align-items: center; justify-content: center;
		border: none; cursor: pointer; padding: 0;
		box-shadow: 0 1px 3px rgba(0,0,0,0.3);
	}
	.delete-btn:hover { transform: scale(1.15); }
</style>
