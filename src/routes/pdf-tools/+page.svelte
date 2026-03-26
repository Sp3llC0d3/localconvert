<script lang="ts">
	import { FileTextIcon, GitMergeIcon, ScissorsIcon, RotateCwIcon, LayoutGridIcon, ImageIcon, FileDownIcon, ZapIcon, PenLineIcon, ShieldCheckIcon } from 'lucide-svelte';

	const categories = [
		{
			label: 'Organize',
			tools: [
				{ href: '/pdf-tools/merge/', icon: GitMergeIcon, name: 'Merge PDF', desc: 'Combine multiple PDFs into one file' },
				{ href: '/pdf-tools/split/', icon: ScissorsIcon, name: 'Split PDF', desc: 'Extract pages or split into individual files' },
				{ href: '/pdf-tools/rotate/', icon: RotateCwIcon, name: 'Rotate Pages', desc: 'Rotate individual or all pages 90°/180°/270°' },
				{ href: '/pdf-tools/organize/', icon: LayoutGridIcon, name: 'Organize Pages', desc: 'Reorder or delete pages with visual thumbnails' },
			],
		},
		{
			label: 'Convert',
			tools: [
				{ href: '/pdf-tools/images-to-pdf/', icon: ImageIcon, name: 'Images → PDF', desc: 'Convert JPG, PNG, or WEBP images to a PDF' },
				{ href: '/pdf-tools/pdf-to-images/', icon: FileDownIcon, name: 'PDF → Images', desc: 'Export each page as a JPG or PNG image' },
			],
		},
		{
			label: 'Optimize & Edit',
			tools: [
				{ href: '/pdf-tools/compress/', icon: ZapIcon, name: 'Compress PDF', desc: 'Reduce file size by re-rendering pages as JPEG' },
				{ href: '/pdf-tools/watermark/', icon: PenLineIcon, name: 'Add Watermark', desc: 'Stamp text on every page of a PDF' },
			],
		},
	];
</script>

<svelte:head>
	<title>PDF Tools — LocalConvert</title>
	<meta name="description" content="Free online PDF tools that run entirely in your browser. Merge, split, rotate, compress, and convert PDFs — no uploads, no server." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-12">

	<!-- Hero -->
	<div class="flex flex-col items-center text-center gap-4">
		<div class="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
			<FileTextIcon size={28} color="black" />
		</div>
		<h1 class="text-4xl md:text-5xl font-display tracking-tight">PDF Tools</h1>
		<p class="text-lg max-w-xl" style="color: var(--fg-muted)">
			Every operation runs entirely in your browser. Your files never leave your device.
		</p>
		<div class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style="background: var(--bg-badge); color: var(--fg-on-badge)">
			<ShieldCheckIcon size={14} />
			100% local — no uploads, no server
		</div>
	</div>

	<!-- Tool categories -->
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
		background: var(--bg-badge);
		color: var(--fg-on-badge);
	}

	.tool-name {
		@apply font-semibold text-sm;
	}

	.tool-desc {
		@apply text-xs font-normal;
		color: var(--fg-muted);
	}
</style>
