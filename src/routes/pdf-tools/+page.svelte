<script lang="ts">
	import { FileTextIcon, GitMergeIcon, ScissorsIcon, RotateCwIcon, LayoutGridIcon, ImageIcon, FileDownIcon, ZapIcon, PenLineIcon, ListOrderedIcon, InfoIcon, ShieldCheckIcon } from 'lucide-svelte';
	import { m } from '$lib/paraglide/messages';

	const categories = $derived([
		{
			label: m['pdf_tools.categories.organize'](),
			color: 'green',
			tools: [
				{ href: '/pdf-tools/merge/', icon: GitMergeIcon, name: m['pdf_tools.tools.merge_name'](), desc: m['pdf_tools.tools.merge_desc']() },
				{ href: '/pdf-tools/split/', icon: ScissorsIcon, name: m['pdf_tools.tools.split_name'](), desc: m['pdf_tools.tools.split_desc']() },
				{ href: '/pdf-tools/rotate/', icon: RotateCwIcon, name: m['pdf_tools.tools.rotate_name'](), desc: m['pdf_tools.tools.rotate_desc']() },
				{ href: '/pdf-tools/organize/', icon: LayoutGridIcon, name: m['pdf_tools.tools.organize_name'](), desc: m['pdf_tools.tools.organize_desc']() },
			],
		},
		{
			label: m['pdf_tools.categories.convert'](),
			color: 'blue',
			tools: [
				{ href: '/pdf-tools/images-to-pdf/', icon: ImageIcon, name: m['pdf_tools.tools.images_to_pdf_name'](), desc: m['pdf_tools.tools.images_to_pdf_desc']() },
				{ href: '/pdf-tools/pdf-to-images/', icon: FileDownIcon, name: m['pdf_tools.tools.pdf_to_images_name'](), desc: m['pdf_tools.tools.pdf_to_images_desc']() },
			],
		},
		{
			label: m['pdf_tools.categories.optimize'](),
			color: 'red',
			tools: [
				{ href: '/pdf-tools/compress/', icon: ZapIcon, name: m['pdf_tools.tools.compress_name'](), desc: m['pdf_tools.tools.compress_desc']() },
				{ href: '/pdf-tools/watermark/', icon: PenLineIcon, name: m['pdf_tools.tools.watermark_name'](), desc: m['pdf_tools.tools.watermark_desc']() },
				{ href: '/pdf-tools/page-numbers/', icon: ListOrderedIcon, name: m['pdf_tools.tools.page_numbers_name'](), desc: m['pdf_tools.tools.page_numbers_desc']() },
				{ href: '/pdf-tools/metadata/', icon: InfoIcon, name: m['pdf_tools.tools.metadata_name'](), desc: m['pdf_tools.tools.metadata_desc']() },
			],
		},
	]);
</script>

<svelte:head>
	<title>PDF Tools — LocalConvert</title>
	<meta name="description" content="Free online PDF tools that run entirely in your browser. Merge, split, rotate, compress, and convert PDFs — no uploads, no server." />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/" />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">

	<!-- Hero -->
	<div class="flex flex-col items-center text-center gap-4">
		<div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background: var(--accent-green); color: var(--fg-on-accent)">
			<FileTextIcon size={28} />
		</div>
		<h1 class="text-4xl md:text-5xl font-display tracking-tight">{m['pdf_tools.title']()}</h1>
		<p class="text-lg max-w-xl" style="color: var(--fg-muted)">
			{m['pdf_tools.subtitle']()}
		</p>
		<div class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style="background: var(--bg-badge); color: var(--fg-on-badge)">
			<ShieldCheckIcon size={14} />
			{m['pdf_tools.badge']()}
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
						<div class="tool-icon" style="background: var(--accent-{cat.color}); color: var(--fg-on-accent)">
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
		background: var(--accent);
		color: var(--fg-on-accent);
	}

	.tool-name {
		@apply font-semibold text-sm;
	}

	.tool-desc {
		@apply text-xs font-normal;
		color: var(--fg-muted);
	}
</style>
