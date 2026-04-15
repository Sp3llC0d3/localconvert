<script lang="ts">
	import { ImageIcon, RotateCwIcon, CropIcon, DropletIcon, SmileIcon, LayersIcon, QrCodeIcon, PipetteIcon, EyeOffIcon, SlidersHorizontalIcon, FilmIcon, ShieldCheckIcon } from 'lucide-svelte';
	import { image_tools_categories_edit, image_tools_tools_rotate_name, image_tools_tools_rotate_desc, image_tools_tools_crop_name, image_tools_tools_crop_desc, image_tools_tools_blur_name, image_tools_tools_blur_desc, image_tools_tools_filters_name, image_tools_tools_filters_desc, image_tools_tools_watermark_name, image_tools_tools_watermark_desc, image_tools_categories_create, image_tools_tools_meme_name, image_tools_tools_meme_desc, image_tools_tools_qr_name, image_tools_tools_qr_desc, image_tools_tools_batch_name, image_tools_tools_batch_desc, image_tools_tools_color_picker_name, image_tools_tools_color_picker_desc, image_tools_tools_video_to_gif_name, image_tools_tools_video_to_gif_desc, image_tools_title, image_tools_subtitle, image_tools_badge } from "$lib/paraglide/messages/_barrel.js";

	const categories = $derived([
		{
			label: image_tools_categories_edit(),
			tools: [
				{ href: '/image-tools/rotate/', icon: RotateCwIcon, name: image_tools_tools_rotate_name(), desc: image_tools_tools_rotate_desc() },
				{ href: '/image-tools/crop/', icon: CropIcon, name: image_tools_tools_crop_name(), desc: image_tools_tools_crop_desc() },
				{ href: '/image-tools/blur/', icon: EyeOffIcon, name: image_tools_tools_blur_name(), desc: image_tools_tools_blur_desc() },
				{ href: '/image-tools/filters/', icon: SlidersHorizontalIcon, name: image_tools_tools_filters_name(), desc: image_tools_tools_filters_desc() },
				{ href: '/image-tools/watermark/', icon: DropletIcon, name: image_tools_tools_watermark_name(), desc: image_tools_tools_watermark_desc() },
			],
		},
		{
			label: image_tools_categories_create(),
			tools: [
				{ href: '/image-tools/meme/', icon: SmileIcon, name: image_tools_tools_meme_name(), desc: image_tools_tools_meme_desc() },
				{ href: '/image-tools/qr/', icon: QrCodeIcon, name: image_tools_tools_qr_name(), desc: image_tools_tools_qr_desc() },
				{ href: '/image-tools/batch/', icon: LayersIcon, name: image_tools_tools_batch_name(), desc: image_tools_tools_batch_desc() },
				{ href: '/image-tools/color-picker/', icon: PipetteIcon, name: image_tools_tools_color_picker_name(), desc: image_tools_tools_color_picker_desc() },
				{ href: '/image-tools/video-to-gif/', icon: FilmIcon, name: image_tools_tools_video_to_gif_name(), desc: image_tools_tools_video_to_gif_desc() },
			],
		},
	]);
</script>

<svelte:head>
	<title>Image Tools — LocalConvert</title>
	<meta name="description" content="Free online image tools that run entirely in your browser. Rotate, crop, watermark images — no uploads, no server." />
	<link rel="canonical" href="https://localconvert.app/image-tools/" />
	<meta property="og:title" content="Image Tools — LocalConvert" />
	<meta property="og:description" content="Free online image tools that run entirely in your browser. Rotate, crop, watermark images — no uploads, no server." />
	<meta property="og:url" content="https://localconvert.app/image-tools/" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		"name": "LocalConvert Image Tools",
		"url": "https://localconvert.app/image-tools/",
		"applicationCategory": "MultimediaApplication",
		"operatingSystem": "Any (browser-based)",
		"offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
		"description": "Free online image tools — rotate, crop, watermark, and create memes. All processing runs in your browser."
	})}</script>`}
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
	<!-- Accent line -->
	<div class="accent-line accent-line--blue"></div>

	<div class="flex flex-col items-center text-center gap-4">
		<div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background: var(--accent-blue); color: var(--fg-on-accent)">
			<ImageIcon size={28} />
		</div>
		<div class="flex items-center gap-3">
			<h1 class="text-4xl md:text-5xl font-display tracking-tight">{image_tools_title()}</h1>
			<span class="tool-count tool-count--blue">10</span>
		</div>
		<p class="text-lg max-w-xl" style="color: var(--fg-muted)">
			{image_tools_subtitle()}
		</p>
		<div class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style="background: var(--bg-badge); color: var(--fg-on-badge)">
			<ShieldCheckIcon size={14} />
			{image_tools_badge()}
		</div>
	</div>

	{#each categories as cat}
		<section class="flex flex-col gap-4">
			<h2 class="text-xl font-semibold">{cat.label}</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{#each cat.tools as tool}
					{@const Icon = tool.icon}
					<a href={tool.href} class="tool-card">
						<div class="tool-icon">
							<Icon size={20} />
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="tool-name">{tool.name}</span>
							<span class="tool-desc">{tool.desc}</span>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/each}
</div>

<style lang="postcss">
	.tool-card {
		@apply flex items-center gap-4 p-4 rounded-2xl transition-colors;
		background: var(--bg-panel);
		box-shadow: var(--shadow-panel);
	}
	.tool-card:hover {
		background: var(--bg-panel-alt, var(--bg-panel));
	}
	.tool-icon {
		@apply w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0;
		background: var(--accent-blue);
		color: var(--fg-on-accent);
	}
	.tool-name {
		@apply font-semibold text-sm;
	}
	.tool-desc {
		@apply text-xs font-normal;
		color: var(--fg-muted);
	}

	.accent-line {
		height: 3px;
		border-radius: 2px;
		width: 100%;
	}
	.accent-line--blue { background: var(--accent-blue); }

	.tool-count {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		padding: 3px 10px;
		border-radius: 9999px;
		flex-shrink: 0;
	}
	.tool-count--blue { background: hsla(217, 82%, 58%, 0.12); color: var(--accent-blue); }
</style>
