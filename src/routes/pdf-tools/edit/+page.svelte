<script lang="ts">
	import { browser } from '$app/environment';
	import PdfUploader from '$lib/components/pdf/PdfUploader.svelte';
	import { editPdf, type PdfEdit, type TextEdit } from '$lib/pdf/edit';
	import { renderAllThumbnails } from '$lib/pdf/thumbnails';
	import { downloadPdf, formatFileSize, getOutputName, getPdfJs } from '$lib/pdf/utils';
	import { EditIcon, Trash2Icon, UploadIcon } from 'lucide-svelte';
	import ToolPageHeader from '$lib/components/layout/ToolPageHeader.svelte';
	import { m } from '$lib/paraglide/messages';

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
		fontFamily: string;
	}

	let elements = $state<PlacedText[]>([]);
	let selectedId = $state<string | null>(null);
	let newText = $state('Type here');
	let newFontSize = $state(14);
	let newColor = $state('#000000');
	let newFontFamily = $state('sans-serif');
	let customFontName = $state('');
	let fontInput = $state<HTMLInputElement>();

	const builtinFonts = [
		{ label: 'Default', value: 'sans-serif' },
		{ label: 'Serif', value: 'serif' },
		{ label: 'Monospace', value: 'monospace' },
	];

	async function uploadFont(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.[0]) return;
		const file = input.files[0];
		const buffer = await file.arrayBuffer();
		const name = 'CustomEditFont';
		try {
			const face = new FontFace(name, buffer);
			await face.load();
			document.fonts.add(face);
			newFontFamily = `"${name}"`;
			customFontName = file.name;
		} catch {
			error = 'Failed to load font.';
		}
		input.value = '';
	}


	// Ghost preview (follows cursor before placing)
	let ghostPos = $state({ x: 0, y: 0 });
	let showGhost = $state(false);

	// Dragging
	let dragging = $state<{ id: string; offsetX: number; offsetY: number } | null>(null);
	let suppressNextClick = $state(false);

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
			thumbs = await renderAllThumbnails(files[0], 0.7);
			calcDisplaySize();
		} catch {
			error = m['tools_common.failed_read_pdf']();
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
		if (suppressNextClick) { suppressNextClick = false; return; }
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
			fontFamily: newFontFamily,
		}];
		selectedId = elements[elements.length - 1].id;
	}

	// Element drag
	function onElementPointerDown(e: MouseEvent, el: PlacedText) {
		e.stopPropagation();
		suppressNextClick = true;
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
		}
	}

	function removeElement(id: string) {
		elements = elements.filter((el) => el.id !== id);
		if (selectedId === id) selectedId = null;
	}

	async function apply() {
		if (files.length === 0 || elements.length === 0) {
			error = elements.length === 0 ? m['tool_pages.edit.err_text']() : m['tool_pages.edit.err_pdf']();
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
				fontFamily: el.fontFamily,
			}));
			resultBytes = await editPdf(files[0], currentPage, pdfEdits);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : m['tools_common.failed']();
		}
		processing = false;
	}

	function download() {
		if (!resultBytes) return;
		downloadPdf(resultBytes, getOutputName(files[0].name, 'edited', 'pdf'));
	}
</script>

<svelte:head>
	<title>Edit PDF — LocalConvert</title>
	<meta name="description" content="Click anywhere on a PDF page to add text. Drag to reposition. Free, private, no uploads." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/edit/" />
</svelte:head>

<div class="edit-page">
	<ToolPageHeader
		category="pdf"
		title={m['tool_pages.edit.title']()}
		description={m['tool_pages.edit.desc']()}
		icon={EditIcon}
		backHref="/pdf-tools/"
		backLabel={m['tools_common.back_pdf']()}
	/>

	<PdfUploader bind:files multiple={false} label={m['tools_common.upload_pdf']()} />

	{#if thumbs.length > 0 && displayW > 0}
		<!-- Text input bar -->
		<div class="text-bar">
			<input
				type="text"
				bind:value={newText}
				placeholder={m['tool_pages.edit.placeholder']()}
				class="text-input"
			/>
			<input type="number" min={6} max={72} bind:value={newFontSize} class="size-input" aria-label="Font size" />
			<span class="text-xs text-muted">pt</span>
			<input type="color" bind:value={newColor} class="color-input" aria-label="Text color" />
			<div class="font-controls">
				<select class="font-select" bind:value={newFontFamily}>
					{#each builtinFonts as f}
						<option value={f.value}>{f.label}</option>
					{/each}
					{#if customFontName}
						<option value='"CustomEditFont"'>{customFontName}</option>
					{/if}
				</select>
				<input bind:this={fontInput} type="file" accept=".ttf,.otf,.woff,.woff2" class="hidden" onchange={uploadFont} />
				<button class="upload-font-btn" onclick={() => fontInput?.click()} title="Upload custom font">
					<UploadIcon size={14} />
				</button>
			</div>
		</div>

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
				aria-label={m['tool_pages.edit.aria_editor']()}
			>
				<!-- Rendered page -->
				<img src={thumbs[currentPage]} alt="Page {currentPage + 1}" class="page-img" draggable="false" />

				<!-- Ghost preview (follows cursor) -->
				{#if showGhost && newText.trim() && !dragging}
					<div
						class="ghost-text"
						style="left: {ghostPos.x}px; top: {ghostPos.y}px; font-size: {newFontSize * (displayW / pageWidth)}px; color: {newColor}; font-family: {newFontFamily};"
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
						style="left: {disp.x}px; top: {disp.y}px; font-size: {el.fontSize * (displayW / pageWidth)}px; color: {el.color}; font-family: {el.fontFamily};"
						onmousedown={(e) => onElementPointerDown(e, el)}
						role="button"
						tabindex="0"
					>
						{el.text}
						{#if selectedId === el.id}
							<button
								class="delete-btn"
								onmousedown={(e) => { e.stopPropagation(); suppressNextClick = true; }}
								onclick={(e) => { e.stopPropagation(); removeElement(el.id); }}
								aria-label={m['tool_pages.edit.remove_text']()}
							>
								<Trash2Icon size={12} />
							</button>
						{/if}
					</div>
				{/each}
			</div>
			<p class="text-xs text-muted mt-2">{m['tool_pages.edit.elements_placed']({ count: elements.length })}</p>
		</div>

		<button class="btn highlight" disabled={processing || elements.length === 0} onclick={apply}>
			{processing ? m['tool_pages.edit.btn_busy']() : m['tool_pages.edit.save']()}
		</button>
	{/if}

	{#if error}<p class="text-sm text-failure">{error}</p>{/if}

	{#if resultBytes}
		<div class="result-box">
			<p class="text-sm font-medium">{m['tools_common.ready']()} <b>{formatFileSize(resultBytes.byteLength)}</b></p>
			<button class="btn" onclick={download}>{m['tools_common.download']()}</button>
		</div>
	{/if}

	<p class="text-xs text-muted mt-2">{m['tools_common.privacy_note']()}</p>
</div>

<style>
	.edit-page { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
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

	/* Font controls */
	.font-controls { display: flex; align-items: center; gap: 0.375rem; }
	.font-select {
		width: 6rem; padding: 0.375rem 0.375rem; border-radius: 0.5rem; font-size: 0.75rem;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel)); color: var(--fg);
		cursor: pointer; appearance: auto;
	}
	.font-select:focus { outline: 1.5px solid var(--accent); }
	.upload-font-btn {
		display: flex; align-items: center; justify-content: center;
		width: 2rem; height: 2rem; border-radius: 0.375rem; flex-shrink: 0;
		border: 1px solid var(--bg-separator); background: var(--bg-panel-alt, var(--bg-panel));
		cursor: pointer; color: var(--fg-muted); transition: color 0.15s;
	}
	.upload-font-btn:hover { color: var(--accent); border-color: var(--accent); }

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
		white-space: nowrap; font-weight: normal;
		transform: translateY(-100%);
	}

	/* Placed text elements */
	.placed-text {
		position: absolute; cursor: move; white-space: nowrap;
		font-weight: normal;
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
