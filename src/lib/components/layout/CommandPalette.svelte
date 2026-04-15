<script lang="ts">
	import { goto } from '$app/navigation';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { SearchIcon } from 'lucide-svelte';
	import { fade } from '$lib/util/animation';
	import { commandPalette } from '$lib/store/commandPalette.svelte';
	import { pdf_tools_tools_merge_name, pdf_tools_tools_merge_desc, pdf_tools_tools_split_name, pdf_tools_tools_split_desc, pdf_tools_tools_rotate_name, pdf_tools_tools_rotate_desc, pdf_tools_tools_organize_name, pdf_tools_tools_organize_desc, pdf_tools_tools_compress_name, pdf_tools_tools_compress_desc, pdf_tools_tools_watermark_name, pdf_tools_tools_watermark_desc, pdf_tools_tools_page_numbers_name, pdf_tools_tools_page_numbers_desc, pdf_tools_tools_metadata_name, pdf_tools_tools_metadata_desc, pdf_tools_tools_crop_name, pdf_tools_tools_crop_desc, pdf_tools_tools_sign_name, pdf_tools_tools_sign_desc, pdf_tools_tools_edit_name, pdf_tools_tools_edit_desc, pdf_tools_tools_password_name, pdf_tools_tools_password_desc, pdf_tools_tools_unlock_name, pdf_tools_tools_unlock_desc, pdf_tools_tools_images_to_pdf_name, pdf_tools_tools_images_to_pdf_desc, pdf_tools_tools_pdf_to_images_name, pdf_tools_tools_pdf_to_images_desc, pdf_tools_tools_pdf_to_ppt_name, pdf_tools_tools_pdf_to_ppt_desc, pdf_tools_tools_pdf_to_text_name, pdf_tools_tools_pdf_to_text_desc, pdf_tools_tools_grayscale_name, pdf_tools_tools_grayscale_desc, pdf_tools_tools_from_docx_name, pdf_tools_tools_from_docx_desc, pdf_tools_tools_from_xlsx_name, pdf_tools_tools_from_xlsx_desc, pdf_tools_tools_to_docx_name, pdf_tools_tools_to_docx_desc, image_tools_tools_rotate_name, image_tools_tools_rotate_desc, image_tools_tools_crop_name, image_tools_tools_crop_desc, image_tools_tools_watermark_name, image_tools_tools_watermark_desc, image_tools_tools_meme_name, image_tools_tools_meme_desc, image_tools_tools_batch_name, image_tools_tools_batch_desc, image_tools_tools_qr_name, image_tools_tools_qr_desc, image_tools_tools_color_picker_name, image_tools_tools_color_picker_desc, image_tools_tools_blur_name, image_tools_tools_blur_desc, image_tools_tools_filters_name, image_tools_tools_filters_desc, image_tools_tools_video_to_gif_name, image_tools_tools_video_to_gif_desc, dev_tools_tools_json_name, dev_tools_tools_json_desc, dev_tools_tools_hash_name, dev_tools_tools_hash_desc, dev_tools_tools_base64_name, dev_tools_tools_base64_desc, dev_tools_tools_markdown_name, dev_tools_tools_markdown_desc, dev_tools_tools_diff_name, dev_tools_tools_diff_desc, dev_tools_tools_word_count_name, dev_tools_tools_word_count_desc, dev_tools_tools_url_encode_name, dev_tools_tools_url_encode_desc, dev_tools_tools_css_minify_name, dev_tools_tools_css_minify_desc, command_palette_converter_name, command_palette_converter_desc, footer_pdf_tools_count, pdf_tools_badge, footer_image_tools_count, image_tools_badge, footer_dev_tools_count, dev_tools_badge, command_palette_placeholder, command_palette_no_results, aria_close } from "$lib/paraglide/messages/_barrel.js";

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
			{ name: pdf_tools_tools_merge_name(), desc: pdf_tools_tools_merge_desc(), href: '/pdf-tools/merge/', category: 'pdf' },
			{ name: pdf_tools_tools_split_name(), desc: pdf_tools_tools_split_desc(), href: '/pdf-tools/split/', category: 'pdf' },
			{ name: pdf_tools_tools_rotate_name(), desc: pdf_tools_tools_rotate_desc(), href: '/pdf-tools/rotate/', category: 'pdf' },
			{ name: pdf_tools_tools_organize_name(), desc: pdf_tools_tools_organize_desc(), href: '/pdf-tools/organize/', category: 'pdf' },
			{ name: pdf_tools_tools_compress_name(), desc: pdf_tools_tools_compress_desc(), href: '/pdf-tools/compress/', category: 'pdf' },
			{ name: pdf_tools_tools_watermark_name(), desc: pdf_tools_tools_watermark_desc(), href: '/pdf-tools/watermark/', category: 'pdf' },
			{ name: pdf_tools_tools_page_numbers_name(), desc: pdf_tools_tools_page_numbers_desc(), href: '/pdf-tools/page-numbers/', category: 'pdf' },
			{ name: pdf_tools_tools_metadata_name(), desc: pdf_tools_tools_metadata_desc(), href: '/pdf-tools/metadata/', category: 'pdf' },
			{ name: pdf_tools_tools_crop_name(), desc: pdf_tools_tools_crop_desc(), href: '/pdf-tools/crop/', category: 'pdf' },
			{ name: pdf_tools_tools_sign_name(), desc: pdf_tools_tools_sign_desc(), href: '/pdf-tools/sign/', category: 'pdf' },
			{ name: pdf_tools_tools_edit_name(), desc: pdf_tools_tools_edit_desc(), href: '/pdf-tools/edit/', category: 'pdf' },
			{ name: pdf_tools_tools_password_name(), desc: pdf_tools_tools_password_desc(), href: '/pdf-tools/password/', category: 'pdf' },
			{ name: pdf_tools_tools_unlock_name(), desc: pdf_tools_tools_unlock_desc(), href: '/pdf-tools/unlock/', category: 'pdf' },
			{ name: pdf_tools_tools_images_to_pdf_name(), desc: pdf_tools_tools_images_to_pdf_desc(), href: '/pdf-tools/images-to-pdf/', category: 'pdf' },
			{ name: pdf_tools_tools_pdf_to_images_name(), desc: pdf_tools_tools_pdf_to_images_desc(), href: '/pdf-tools/pdf-to-images/', category: 'pdf' },
			{ name: pdf_tools_tools_pdf_to_ppt_name(), desc: pdf_tools_tools_pdf_to_ppt_desc(), href: '/pdf-tools/pdf-to-ppt/', category: 'pdf' },
			{ name: pdf_tools_tools_pdf_to_text_name(), desc: pdf_tools_tools_pdf_to_text_desc(), href: '/pdf-tools/pdf-to-text/', category: 'pdf' },
			{ name: pdf_tools_tools_grayscale_name(), desc: pdf_tools_tools_grayscale_desc(), href: '/pdf-tools/grayscale/', category: 'pdf' },
			{ name: pdf_tools_tools_from_docx_name(), desc: pdf_tools_tools_from_docx_desc(), href: '/pdf-tools/from-docx/', category: 'pdf' },
			{ name: pdf_tools_tools_from_xlsx_name(), desc: pdf_tools_tools_from_xlsx_desc(), href: '/pdf-tools/from-xlsx/', category: 'pdf' },
			{ name: pdf_tools_tools_to_docx_name(), desc: pdf_tools_tools_to_docx_desc(), href: '/pdf-tools/to-docx/', category: 'pdf' },
			// Image Tools
			{ name: image_tools_tools_rotate_name(), desc: image_tools_tools_rotate_desc(), href: '/image-tools/rotate/', category: 'image' },
			{ name: image_tools_tools_crop_name(), desc: image_tools_tools_crop_desc(), href: '/image-tools/crop/', category: 'image' },
			{ name: image_tools_tools_watermark_name(), desc: image_tools_tools_watermark_desc(), href: '/image-tools/watermark/', category: 'image' },
			{ name: image_tools_tools_meme_name(), desc: image_tools_tools_meme_desc(), href: '/image-tools/meme/', category: 'image' },
			{ name: image_tools_tools_batch_name(), desc: image_tools_tools_batch_desc(), href: '/image-tools/batch/', category: 'image' },
			{ name: image_tools_tools_qr_name(), desc: image_tools_tools_qr_desc(), href: '/image-tools/qr/', category: 'image' },
			{ name: image_tools_tools_color_picker_name(), desc: image_tools_tools_color_picker_desc(), href: '/image-tools/color-picker/', category: 'image' },
			{ name: image_tools_tools_blur_name(), desc: image_tools_tools_blur_desc(), href: '/image-tools/blur/', category: 'image' },
			{ name: image_tools_tools_filters_name(), desc: image_tools_tools_filters_desc(), href: '/image-tools/filters/', category: 'image' },
			{ name: image_tools_tools_video_to_gif_name(), desc: image_tools_tools_video_to_gif_desc(), href: '/image-tools/video-to-gif/', category: 'image' },
			// Dev Tools
			{ name: dev_tools_tools_json_name(), desc: dev_tools_tools_json_desc(), href: '/dev-tools/json/', category: 'dev' },
			{ name: dev_tools_tools_hash_name(), desc: dev_tools_tools_hash_desc(), href: '/dev-tools/hash/', category: 'dev' },
			{ name: dev_tools_tools_base64_name(), desc: dev_tools_tools_base64_desc(), href: '/dev-tools/base64/', category: 'dev' },
			{ name: dev_tools_tools_markdown_name(), desc: dev_tools_tools_markdown_desc(), href: '/dev-tools/markdown/', category: 'dev' },
			{ name: dev_tools_tools_diff_name(), desc: dev_tools_tools_diff_desc(), href: '/dev-tools/diff/', category: 'dev' },
			{ name: dev_tools_tools_word_count_name(), desc: dev_tools_tools_word_count_desc(), href: '/dev-tools/word-count/', category: 'dev' },
			{ name: dev_tools_tools_url_encode_name(), desc: dev_tools_tools_url_encode_desc(), href: '/dev-tools/url-encode/', category: 'dev' },
			{ name: dev_tools_tools_css_minify_name(), desc: dev_tools_tools_css_minify_desc(), href: '/dev-tools/css-minify/', category: 'dev' },
			// Pages
			{ name: command_palette_converter_name(), desc: command_palette_converter_desc(), href: '/convert', category: 'convert' },
			{ name: footer_pdf_tools_count(), desc: pdf_tools_badge(), href: '/pdf-tools/', category: 'pdf' },
			{ name: footer_image_tools_count(), desc: image_tools_badge(), href: '/image-tools/', category: 'image' },
			{ name: footer_dev_tools_count(), desc: dev_tools_badge(), href: '/dev-tools/', category: 'dev' },
		];
		return tools;
	});

	const filtered = $derived(
		query.trim() === ''
			? []
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
		goto(localizeHref(href));
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
	<div class="palette" role="dialog" aria-label={command_palette_placeholder()} transition:fade={{ duration: 120 }}>
		<div class="palette-input-wrap">
			<SearchIcon size={16} class="palette-input-icon" />
			<input
				bind:this={inputEl}
				bind:value={query}
				onkeydown={onKeydown}
				type="text"
				placeholder={command_palette_placeholder()}
				class="palette-input"
				autocomplete="off"
				spellcheck="false"
			/>
			<button class="palette-close" onclick={() => commandPalette.close()} aria-label={aria_close()}>
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
			{#if filtered.length === 0 && query.trim() !== ''}
				<div class="palette-empty">{command_palette_no_results()}</div>
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
		display: flex;
		flex-direction: column;
	}

	@media (max-width: 767px) {
		.palette {
			top: auto;
			bottom: 0;
			inset-inline-start: 0;
			transform: none;
			width: 100vw;
			border-radius: 1rem 1rem 0 0;
			flex-direction: column-reverse;
			overflow: visible;
		}

		.palette-input-wrap {
			border-bottom: none;
			border-top: 1px solid var(--bg-separator);
			padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
		}

		.palette-results {
			max-height: 50vh;
		}
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
		text-align: start;
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
