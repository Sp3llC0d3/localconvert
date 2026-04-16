<script lang="ts">
	import { FileTextIcon, GitMergeIcon, ScissorsIcon, RotateCwIcon, LayoutGridIcon, ImageIcon, FileDownIcon, ZapIcon, PenLineIcon, ListOrderedIcon, InfoIcon, CropIcon, PresentationIcon, PenToolIcon, EditIcon, LockIcon, UnlockIcon, PaletteIcon, TypeIcon, ShieldCheckIcon, TableIcon, FileOutputIcon } from 'lucide-svelte';
	import { pdf_tools_categories_organize, pdf_tools_tools_merge_name, pdf_tools_tools_merge_desc, pdf_tools_tools_split_name, pdf_tools_tools_split_desc, pdf_tools_tools_rotate_name, pdf_tools_tools_rotate_desc, pdf_tools_tools_organize_name, pdf_tools_tools_organize_desc, pdf_tools_categories_convert, pdf_tools_tools_images_to_pdf_name, pdf_tools_tools_images_to_pdf_desc, pdf_tools_tools_pdf_to_images_name, pdf_tools_tools_pdf_to_images_desc, pdf_tools_tools_pdf_to_ppt_name, pdf_tools_tools_pdf_to_ppt_desc, pdf_tools_tools_pdf_to_text_name, pdf_tools_tools_pdf_to_text_desc, pdf_tools_tools_grayscale_name, pdf_tools_tools_grayscale_desc, pdf_tools_tools_from_docx_name, pdf_tools_tools_from_docx_desc, pdf_tools_tools_from_xlsx_name, pdf_tools_tools_from_xlsx_desc, pdf_tools_tools_to_docx_name, pdf_tools_tools_to_docx_desc, pdf_tools_categories_optimize, pdf_tools_tools_compress_name, pdf_tools_tools_compress_desc, pdf_tools_tools_watermark_name, pdf_tools_tools_watermark_desc, pdf_tools_tools_page_numbers_name, pdf_tools_tools_page_numbers_desc, pdf_tools_tools_metadata_name, pdf_tools_tools_metadata_desc, pdf_tools_tools_crop_name, pdf_tools_tools_crop_desc, pdf_tools_tools_sign_name, pdf_tools_tools_sign_desc, pdf_tools_tools_edit_name, pdf_tools_tools_edit_desc, pdf_tools_tools_password_name, pdf_tools_tools_password_desc, pdf_tools_tools_unlock_name, pdf_tools_tools_unlock_desc, pdf_tools_title, pdf_tools_subtitle, pdf_tools_badge , meta_descriptions_pdf_tools} from "$lib/paraglide/messages/_barrel.js";
	import { localizeHref } from "$lib/paraglide/runtime";

	const categories = $derived([
		{
			label: pdf_tools_categories_organize(),
			color: 'green',
			tools: [
				{ href: '/pdf-tools/merge/', icon: GitMergeIcon, name: pdf_tools_tools_merge_name(), desc: pdf_tools_tools_merge_desc() },
				{ href: '/pdf-tools/split/', icon: ScissorsIcon, name: pdf_tools_tools_split_name(), desc: pdf_tools_tools_split_desc() },
				{ href: '/pdf-tools/rotate/', icon: RotateCwIcon, name: pdf_tools_tools_rotate_name(), desc: pdf_tools_tools_rotate_desc() },
				{ href: '/pdf-tools/organize/', icon: LayoutGridIcon, name: pdf_tools_tools_organize_name(), desc: pdf_tools_tools_organize_desc() },
			],
		},
		{
			label: pdf_tools_categories_convert(),
			color: 'blue',
			tools: [
				{ href: '/pdf-tools/images-to-pdf/', icon: ImageIcon, name: pdf_tools_tools_images_to_pdf_name(), desc: pdf_tools_tools_images_to_pdf_desc() },
				{ href: '/pdf-tools/pdf-to-images/', icon: FileDownIcon, name: pdf_tools_tools_pdf_to_images_name(), desc: pdf_tools_tools_pdf_to_images_desc() },
				{ href: '/pdf-tools/pdf-to-ppt/', icon: PresentationIcon, name: pdf_tools_tools_pdf_to_ppt_name(), desc: pdf_tools_tools_pdf_to_ppt_desc() },
				{ href: '/pdf-tools/pdf-to-text/', icon: TypeIcon, name: pdf_tools_tools_pdf_to_text_name(), desc: pdf_tools_tools_pdf_to_text_desc() },
				{ href: '/pdf-tools/grayscale/', icon: PaletteIcon, name: pdf_tools_tools_grayscale_name(), desc: pdf_tools_tools_grayscale_desc() },
				{ href: '/pdf-tools/from-docx/', icon: FileTextIcon, name: pdf_tools_tools_from_docx_name(), desc: pdf_tools_tools_from_docx_desc() },
				{ href: '/pdf-tools/from-xlsx/', icon: TableIcon, name: pdf_tools_tools_from_xlsx_name(), desc: pdf_tools_tools_from_xlsx_desc() },
				{ href: '/pdf-tools/to-docx/', icon: FileOutputIcon, name: pdf_tools_tools_to_docx_name(), desc: pdf_tools_tools_to_docx_desc() },
			],
		},
		{
			label: pdf_tools_categories_optimize(),
			color: 'red',
			tools: [
				{ href: '/pdf-tools/compress/', icon: ZapIcon, name: pdf_tools_tools_compress_name(), desc: pdf_tools_tools_compress_desc() },
				{ href: '/pdf-tools/watermark/', icon: PenLineIcon, name: pdf_tools_tools_watermark_name(), desc: pdf_tools_tools_watermark_desc() },
				{ href: '/pdf-tools/page-numbers/', icon: ListOrderedIcon, name: pdf_tools_tools_page_numbers_name(), desc: pdf_tools_tools_page_numbers_desc() },
				{ href: '/pdf-tools/metadata/', icon: InfoIcon, name: pdf_tools_tools_metadata_name(), desc: pdf_tools_tools_metadata_desc() },
				{ href: '/pdf-tools/crop/', icon: CropIcon, name: pdf_tools_tools_crop_name(), desc: pdf_tools_tools_crop_desc() },
				{ href: '/pdf-tools/sign/', icon: PenToolIcon, name: pdf_tools_tools_sign_name(), desc: pdf_tools_tools_sign_desc() },
				{ href: '/pdf-tools/edit/', icon: EditIcon, name: pdf_tools_tools_edit_name(), desc: pdf_tools_tools_edit_desc() },
				{ href: '/pdf-tools/password/', icon: LockIcon, name: pdf_tools_tools_password_name(), desc: pdf_tools_tools_password_desc() },
				{ href: '/pdf-tools/unlock/', icon: UnlockIcon, name: pdf_tools_tools_unlock_name(), desc: pdf_tools_tools_unlock_desc() },
			],
		},
	]);
</script>

<svelte:head>
	<title>{pdf_tools_title()} — LocalConvert</title>
	<meta name="description" content={meta_descriptions_pdf_tools()} />
	<link rel="canonical" href="https://localconvert.app/pdf-tools/" />
	<meta property="og:title" content="{pdf_tools_title()} — LocalConvert" />
	<meta property="og:description" content={meta_descriptions_pdf_tools()} />
	<meta property="og:url" content="https://localconvert.app/pdf-tools/" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":"SoftwareApplication","name":"LocalConvert PDF Tools","url":"https://localconvert.app/pdf-tools/","applicationCategory":"UtilitiesApplication","operatingSystem":"Any (browser-based)","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"description":"Free online PDF tools — merge, split, rotate, compress, sign, and convert PDFs. All processing runs in your browser."}</script>`}
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">

	<!-- Accent line -->
	<div class="accent-line accent-line--green"></div>

	<!-- Hero -->
	<div class="flex flex-col items-center text-center gap-4">
		<div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background: var(--accent-green); color: var(--fg-on-accent)">
			<FileTextIcon size={28} />
		</div>
		<div class="flex items-center gap-3">
			<h1 class="text-4xl md:text-5xl font-display tracking-tight">{pdf_tools_title()}</h1>
			<span class="tool-count tool-count--green">21</span>
		</div>
		<p class="text-lg max-w-xl" style="color: var(--fg-muted)">
			{pdf_tools_subtitle()}
		</p>
		<div class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style="background: var(--bg-badge); color: var(--fg-on-badge)">
			<ShieldCheckIcon size={14} />
			{pdf_tools_badge()}
		</div>
	</div>

	<!-- Tool categories -->
	{#each categories as cat}
		<section class="flex flex-col gap-4">
			<h2 class="text-xl font-semibold">{cat.label}</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{#each cat.tools as tool}
					{@const Icon = tool.icon}
					<a href={localizeHref(tool.href)} class="tool-card">
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

	.accent-line {
		height: 3px;
		border-radius: 2px;
		width: 100%;
	}
	.accent-line--green { background: var(--accent-green); }

	.tool-count {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		padding: 3px 10px;
		border-radius: 9999px;
		flex-shrink: 0;
	}
	.tool-count--green { background: hsla(158, 65%, 37%, 0.12); color: var(--accent-green); }
</style>
