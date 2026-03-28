<script lang="ts">
	import { goto } from '$app/navigation';
	import { SearchIcon, FileTextIcon, ImageIcon, CodeIcon, RefreshCw } from 'lucide-svelte';
	import { fade } from '$lib/util/animation';
	import { commandPalette } from '$lib/store/commandPalette.svelte';

	let query = $state('');
	let selectedIndex = $state(0);
	let inputEl = $state<HTMLInputElement>();

	$effect(() => {
		if (commandPalette.open) {
			query = '';
			selectedIndex = 0;
			requestAnimationFrame(() => inputEl?.focus());
		}
	});

	const categoryIcons = { pdf: FileTextIcon, image: ImageIcon, dev: CodeIcon, convert: RefreshCw };
	const categoryColors = { pdf: 'var(--accent-green)', image: 'var(--accent-blue)', dev: 'var(--accent-purple)', convert: 'var(--accent)' };

	const allTools: { name: string; desc: string; href: string; category: 'pdf' | 'image' | 'dev' | 'convert' }[] = [
		// PDF Tools
		{ name: 'Merge PDF', desc: 'Combine multiple PDFs', href: '/pdf-tools/merge/', category: 'pdf' },
		{ name: 'Split PDF', desc: 'Extract pages from a PDF', href: '/pdf-tools/split/', category: 'pdf' },
		{ name: 'Rotate PDF', desc: 'Rotate PDF pages', href: '/pdf-tools/rotate/', category: 'pdf' },
		{ name: 'Organize Pages', desc: 'Reorder PDF pages', href: '/pdf-tools/organize/', category: 'pdf' },
		{ name: 'Compress PDF', desc: 'Reduce PDF file size', href: '/pdf-tools/compress/', category: 'pdf' },
		{ name: 'Watermark PDF', desc: 'Add text watermark', href: '/pdf-tools/watermark/', category: 'pdf' },
		{ name: 'Page Numbers', desc: 'Add page numbers to PDF', href: '/pdf-tools/page-numbers/', category: 'pdf' },
		{ name: 'Edit Metadata', desc: 'Edit PDF properties', href: '/pdf-tools/metadata/', category: 'pdf' },
		{ name: 'Crop PDF', desc: 'Trim PDF margins', href: '/pdf-tools/crop/', category: 'pdf' },
		{ name: 'Sign PDF', desc: 'Add signature to PDF', href: '/pdf-tools/sign/', category: 'pdf' },
		{ name: 'Edit PDF', desc: 'Add text to PDF pages', href: '/pdf-tools/edit/', category: 'pdf' },
		{ name: 'Password Protect', desc: 'Encrypt PDF with password', href: '/pdf-tools/password/', category: 'pdf' },
		{ name: 'Unlock PDF', desc: 'Remove PDF password', href: '/pdf-tools/unlock/', category: 'pdf' },
		{ name: 'Images to PDF', desc: 'Convert images to PDF', href: '/pdf-tools/images-to-pdf/', category: 'pdf' },
		{ name: 'PDF to Images', desc: 'Extract pages as images', href: '/pdf-tools/pdf-to-images/', category: 'pdf' },
		{ name: 'PDF to PowerPoint', desc: 'Convert PDF to slides', href: '/pdf-tools/pdf-to-ppt/', category: 'pdf' },
		{ name: 'PDF to Text', desc: 'Extract text from PDF', href: '/pdf-tools/pdf-to-text/', category: 'pdf' },
		{ name: 'Grayscale PDF', desc: 'Convert PDF to grayscale', href: '/pdf-tools/grayscale/', category: 'pdf' },
		// Image Tools
		{ name: 'Rotate Image', desc: 'Rotate by 90/180/270', href: '/image-tools/rotate/', category: 'image' },
		{ name: 'Crop Image', desc: 'Crop with handles or circle', href: '/image-tools/crop/', category: 'image' },
		{ name: 'Watermark Image', desc: 'Add text watermark', href: '/image-tools/watermark/', category: 'image' },
		{ name: 'Meme Generator', desc: 'Add meme text to image', href: '/image-tools/meme/', category: 'image' },
		{ name: 'Batch Processing', desc: 'Process multiple images', href: '/image-tools/batch/', category: 'image' },
		{ name: 'QR Code Generator', desc: 'Generate QR codes', href: '/image-tools/qr/', category: 'image' },
		{ name: 'Color Picker', desc: 'Pick colors from image', href: '/image-tools/color-picker/', category: 'image' },
		{ name: 'Blur Region', desc: 'Blur part of an image', href: '/image-tools/blur/', category: 'image' },
		{ name: 'Image Filters', desc: 'Brightness, contrast, sepia', href: '/image-tools/filters/', category: 'image' },
		{ name: 'Video to GIF', desc: 'Convert video to GIF', href: '/image-tools/video-to-gif/', category: 'image' },
		// Dev Tools
		{ name: 'JSON Formatter', desc: 'Format and validate JSON', href: '/dev-tools/json/', category: 'dev' },
		{ name: 'Hash Generator', desc: 'SHA-256, SHA-1, SHA-512', href: '/dev-tools/hash/', category: 'dev' },
		{ name: 'Base64 Encode/Decode', desc: 'Encode or decode Base64', href: '/dev-tools/base64/', category: 'dev' },
		{ name: 'Markdown Preview', desc: 'Live markdown to HTML', href: '/dev-tools/markdown/', category: 'dev' },
		{ name: 'Text Diff', desc: 'Compare two texts', href: '/dev-tools/diff/', category: 'dev' },
		{ name: 'Word Counter', desc: 'Words, chars, reading time', href: '/dev-tools/word-count/', category: 'dev' },
		{ name: 'URL Encode/Decode', desc: 'Encode or decode URLs', href: '/dev-tools/url-encode/', category: 'dev' },
		{ name: 'CSS Minifier', desc: 'Minify CSS code', href: '/dev-tools/css-minify/', category: 'dev' },
		// Pages
		{ name: 'File Converter', desc: 'Convert 200+ formats', href: '/convert', category: 'convert' },
		{ name: 'PDF Tools', desc: '18 PDF tools', href: '/pdf-tools/', category: 'pdf' },
		{ name: 'Image Tools', desc: '10 image tools', href: '/image-tools/', category: 'image' },
		{ name: 'Developer Tools', desc: '8 dev tools', href: '/dev-tools/', category: 'dev' },
	];

	const filtered = $derived(
		query.trim() === ''
			? allTools
			: allTools.filter(t =>
				t.name.toLowerCase().includes(query.toLowerCase()) ||
				t.desc.toLowerCase().includes(query.toLowerCase())
			)
	);

	$effect(() => {
		// Reset selection when filtered results change
		if (filtered) selectedIndex = 0;
	});

	function navigate(href: string) {
		commandPalette.close();
		query = '';
		goto(href);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') { commandPalette.close(); return; }
		if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1); return; }
		if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = Math.max(selectedIndex - 1, 0); return; }
		if (e.key === 'Enter' && filtered[selectedIndex]) { navigate(filtered[selectedIndex].href); return; }
	}
</script>

{#if commandPalette.open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="palette-backdrop"
		onclick={() => commandPalette.close()}
		onkeydown={onKeydown}
		transition:fade={{ duration: 120 }}
	></div>

	<!-- Palette -->
	<div class="palette" role="dialog" aria-label="Search tools" transition:fade={{ duration: 120 }}>
		<div class="palette-input-wrap">
			<SearchIcon size={16} class="palette-input-icon" />
			<input
				bind:this={inputEl}
				bind:value={query}
				onkeydown={onKeydown}
				type="text"
				placeholder="Search tools..."
				class="palette-input"
				autocomplete="off"
				spellcheck="false"
			/>
			<button class="palette-close" onclick={() => commandPalette.close()} aria-label="Close">
				<span class="palette-kbd">ESC</span>
			</button>
		</div>

		<div class="palette-results">
			{#each filtered.slice(0, 12) as tool, i}
				{@const Icon = categoryIcons[tool.category]}
				<button
					class="palette-item"
					class:palette-item--active={i === selectedIndex}
					onclick={() => navigate(tool.href)}
					onmouseenter={() => selectedIndex = i}
				>
					<span class="palette-dot" style="background: {categoryColors[tool.category]}"></span>
					<div class="palette-item-text">
						<span class="palette-item-name">{tool.name}</span>
						<span class="palette-item-desc">{tool.desc}</span>
					</div>
				</button>
			{/each}
			{#if filtered.length === 0}
				<div class="palette-empty">No tools found</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.palette-backdrop {
		position: fixed;
		inset: 0;
		z-index: 200;
		background: hsla(0, 0%, 0%, 0.4);
		backdrop-filter: blur(4px);
	}

	.palette {
		position: fixed;
		z-index: 201;
		top: 15%;
		left: 50%;
		transform: translateX(-50%);
		width: min(90vw, 32rem);
		background: var(--bg-panel);
		border-radius: 1rem;
		box-shadow: 0 24px 80px hsla(0, 0%, 0%, 0.35), 0 0 0 1px var(--bg-separator);
		overflow: hidden;
	}

	.palette-input-wrap {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--bg-separator);
	}

	:global(.palette-input-icon) {
		color: var(--fg-muted);
		flex-shrink: 0;
	}

	.palette-input {
		flex: 1;
		background: none;
		border: none;
		outline: none;
		font-size: 0.9375rem;
		font-weight: 400;
		color: var(--fg);
		font-family: var(--font-body);
	}

	.palette-input::placeholder {
		color: var(--fg-muted);
	}

	.palette-close {
		flex-shrink: 0;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
	}

	.palette-kbd {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 4px;
		background: var(--bg-panel-highlight);
		color: var(--fg-muted);
		border: 1px solid var(--bg-separator);
	}

	.palette-results {
		max-height: 24rem;
		overflow-y: auto;
		padding: 0.375rem;
	}

	.palette-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s;
		color: var(--fg);
	}

	.palette-item--active {
		background: var(--bg-panel-highlight);
	}

	.palette-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 9999px;
		flex-shrink: 0;
	}

	.palette-item-text {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.palette-item-name {
		font-size: 0.8125rem;
		font-weight: 600;
	}

	.palette-item-desc {
		font-size: 0.6875rem;
		color: var(--fg-muted);
		font-weight: 400;
	}

	.palette-empty {
		padding: 2rem 1rem;
		text-align: center;
		font-size: 0.8125rem;
		color: var(--fg-muted);
	}
</style>
