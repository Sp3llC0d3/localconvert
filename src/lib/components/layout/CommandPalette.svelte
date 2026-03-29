<script lang="ts">
	import { goto } from '$app/navigation';
	import { SearchIcon } from 'lucide-svelte';
	import { fade } from '$lib/util/animation';
	import { commandPalette } from '$lib/store/commandPalette.svelte';
	import { m } from '$lib/paraglide/messages';

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

	const categoryColors = { pdf: 'var(--accent-green)', image: 'var(--accent-blue)', dev: 'var(--accent-purple)', convert: 'var(--accent)' };

	// Build tool list from i18n — reactive so it updates on language change
	const allTools = $derived.by(() => {
		const tools: { name: string; desc: string; href: string; category: 'pdf' | 'image' | 'dev' | 'convert' }[] = [
			// PDF Tools
			{ name: m['pdf_tools.tools.merge_name'](), desc: m['pdf_tools.tools.merge_desc'](), href: '/pdf-tools/merge/', category: 'pdf' },
			{ name: m['pdf_tools.tools.split_name'](), desc: m['pdf_tools.tools.split_desc'](), href: '/pdf-tools/split/', category: 'pdf' },
			{ name: m['pdf_tools.tools.rotate_name'](), desc: m['pdf_tools.tools.rotate_desc'](), href: '/pdf-tools/rotate/', category: 'pdf' },
			{ name: m['pdf_tools.tools.organize_name'](), desc: m['pdf_tools.tools.organize_desc'](), href: '/pdf-tools/organize/', category: 'pdf' },
			{ name: m['pdf_tools.tools.compress_name'](), desc: m['pdf_tools.tools.compress_desc'](), href: '/pdf-tools/compress/', category: 'pdf' },
			{ name: m['pdf_tools.tools.watermark_name'](), desc: m['pdf_tools.tools.watermark_desc'](), href: '/pdf-tools/watermark/', category: 'pdf' },
			{ name: m['pdf_tools.tools.page_numbers_name'](), desc: m['pdf_tools.tools.page_numbers_desc'](), href: '/pdf-tools/page-numbers/', category: 'pdf' },
			{ name: m['pdf_tools.tools.metadata_name'](), desc: m['pdf_tools.tools.metadata_desc'](), href: '/pdf-tools/metadata/', category: 'pdf' },
			{ name: m['pdf_tools.tools.crop_name'](), desc: m['pdf_tools.tools.crop_desc'](), href: '/pdf-tools/crop/', category: 'pdf' },
			{ name: m['pdf_tools.tools.sign_name'](), desc: m['pdf_tools.tools.sign_desc'](), href: '/pdf-tools/sign/', category: 'pdf' },
			{ name: m['pdf_tools.tools.edit_name'](), desc: m['pdf_tools.tools.edit_desc'](), href: '/pdf-tools/edit/', category: 'pdf' },
			{ name: m['pdf_tools.tools.password_name'](), desc: m['pdf_tools.tools.password_desc'](), href: '/pdf-tools/password/', category: 'pdf' },
			{ name: m['pdf_tools.tools.unlock_name'](), desc: m['pdf_tools.tools.unlock_desc'](), href: '/pdf-tools/unlock/', category: 'pdf' },
			{ name: m['pdf_tools.tools.images_to_pdf_name'](), desc: m['pdf_tools.tools.images_to_pdf_desc'](), href: '/pdf-tools/images-to-pdf/', category: 'pdf' },
			{ name: m['pdf_tools.tools.pdf_to_images_name'](), desc: m['pdf_tools.tools.pdf_to_images_desc'](), href: '/pdf-tools/pdf-to-images/', category: 'pdf' },
			{ name: m['pdf_tools.tools.pdf_to_ppt_name'](), desc: m['pdf_tools.tools.pdf_to_ppt_desc'](), href: '/pdf-tools/pdf-to-ppt/', category: 'pdf' },
			{ name: m['pdf_tools.tools.pdf_to_text_name'](), desc: m['pdf_tools.tools.pdf_to_text_desc'](), href: '/pdf-tools/pdf-to-text/', category: 'pdf' },
			{ name: m['pdf_tools.tools.grayscale_name'](), desc: m['pdf_tools.tools.grayscale_desc'](), href: '/pdf-tools/grayscale/', category: 'pdf' },
			// Image Tools
			{ name: m['image_tools.tools.rotate_name'](), desc: m['image_tools.tools.rotate_desc'](), href: '/image-tools/rotate/', category: 'image' },
			{ name: m['image_tools.tools.crop_name'](), desc: m['image_tools.tools.crop_desc'](), href: '/image-tools/crop/', category: 'image' },
			{ name: m['image_tools.tools.watermark_name'](), desc: m['image_tools.tools.watermark_desc'](), href: '/image-tools/watermark/', category: 'image' },
			{ name: m['image_tools.tools.meme_name'](), desc: m['image_tools.tools.meme_desc'](), href: '/image-tools/meme/', category: 'image' },
			{ name: m['image_tools.tools.batch_name'](), desc: m['image_tools.tools.batch_desc'](), href: '/image-tools/batch/', category: 'image' },
			{ name: m['image_tools.tools.qr_name'](), desc: m['image_tools.tools.qr_desc'](), href: '/image-tools/qr/', category: 'image' },
			{ name: m['image_tools.tools.color_picker_name'](), desc: m['image_tools.tools.color_picker_desc'](), href: '/image-tools/color-picker/', category: 'image' },
			{ name: m['image_tools.tools.blur_name'](), desc: m['image_tools.tools.blur_desc'](), href: '/image-tools/blur/', category: 'image' },
			{ name: m['image_tools.tools.filters_name'](), desc: m['image_tools.tools.filters_desc'](), href: '/image-tools/filters/', category: 'image' },
			{ name: m['image_tools.tools.video_to_gif_name'](), desc: m['image_tools.tools.video_to_gif_desc'](), href: '/image-tools/video-to-gif/', category: 'image' },
			// Dev Tools
			{ name: m['dev_tools.tools.json_name'](), desc: m['dev_tools.tools.json_desc'](), href: '/dev-tools/json/', category: 'dev' },
			{ name: m['dev_tools.tools.hash_name'](), desc: m['dev_tools.tools.hash_desc'](), href: '/dev-tools/hash/', category: 'dev' },
			{ name: m['dev_tools.tools.base64_name'](), desc: m['dev_tools.tools.base64_desc'](), href: '/dev-tools/base64/', category: 'dev' },
			{ name: m['dev_tools.tools.markdown_name'](), desc: m['dev_tools.tools.markdown_desc'](), href: '/dev-tools/markdown/', category: 'dev' },
			{ name: m['dev_tools.tools.diff_name'](), desc: m['dev_tools.tools.diff_desc'](), href: '/dev-tools/diff/', category: 'dev' },
			{ name: m['dev_tools.tools.word_count_name'](), desc: m['dev_tools.tools.word_count_desc'](), href: '/dev-tools/word-count/', category: 'dev' },
			{ name: m['dev_tools.tools.url_encode_name'](), desc: m['dev_tools.tools.url_encode_desc'](), href: '/dev-tools/url-encode/', category: 'dev' },
			{ name: m['dev_tools.tools.css_minify_name'](), desc: m['dev_tools.tools.css_minify_desc'](), href: '/dev-tools/css-minify/', category: 'dev' },
			// Pages
			{ name: m['command_palette.converter_name'](), desc: m['command_palette.converter_desc'](), href: '/convert', category: 'convert' },
			{ name: m['footer.pdf_tools_count'](), desc: m['pdf_tools.badge'](), href: '/pdf-tools/', category: 'pdf' },
			{ name: m['footer.image_tools_count'](), desc: m['image_tools.badge'](), href: '/image-tools/', category: 'image' },
			{ name: m['footer.dev_tools_count'](), desc: m['dev_tools.badge'](), href: '/dev-tools/', category: 'dev' },
		];
		return tools;
	});

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
	<div class="palette" role="dialog" aria-label={m['command_palette.placeholder']()} transition:fade={{ duration: 120 }}>
		<div class="palette-input-wrap">
			<SearchIcon size={16} class="palette-input-icon" />
			<input
				bind:this={inputEl}
				bind:value={query}
				onkeydown={onKeydown}
				type="text"
				placeholder={m['command_palette.placeholder']()}
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
				<div class="palette-empty">{m['command_palette.no_results']()}</div>
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
		background: none !important;
		border: none !important;
		outline: none !important;
		padding: 0 !important;
		font-size: 0.9375rem;
		font-weight: 400;
		color: var(--fg);
		font-family: var(--font-body);
	}

	.palette-input:focus {
		outline: none !important;
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
