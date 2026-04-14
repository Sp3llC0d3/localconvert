import {
	GitMergeIcon, ScissorsIcon, RotateCwIcon, LayoutGridIcon,
	ZapIcon, PenLineIcon, ListOrderedIcon, InfoIcon, CropIcon,
	PenToolIcon, EditIcon, LockIcon, UnlockIcon, ImageIcon,
	FileDownIcon, PresentationIcon, TypeIcon, PaletteIcon,
	FileTextIcon, TableIcon, FileOutputIcon,
	RotateCwIcon as ImgRotateIcon, CropIcon as ImgCropIcon,
	DropletIcon, SmileIcon, LayersIcon, QrCodeIcon, PipetteIcon,
	BlurIcon, SlidersHorizontalIcon, FilmIcon,
	BracesIcon, HashIcon, BinaryIcon, BookOpenIcon, DiffIcon,
	TypeIcon as WordCountIcon, LinkIcon, MinimizeIcon,
} from 'lucide-svelte';
import type { Component } from 'svelte';

type ToolSeoData = {
	related: { href: string; nameKey: string; icon: Component<{ size?: number }> }[];
	faqKeys: string[]; // pairs: [q1, a1, q2, a2, ...]
};

// Related tool mappings for all 39 tools
export const toolSeo: Record<string, ToolSeoData> = {
	// ── PDF Tools ──
	'merge': {
		related: [
			{ href: '/pdf-tools/split/', nameKey: 'pdf_tools.tools.split_name', icon: ScissorsIcon },
			{ href: '/pdf-tools/organize/', nameKey: 'pdf_tools.tools.organize_name', icon: LayoutGridIcon },
			{ href: '/pdf-tools/compress/', nameKey: 'pdf_tools.tools.compress_name', icon: ZapIcon },
		],
		faqKeys: ['tool_pages.merge.seo_faq1_q', 'tool_pages.merge.seo_faq1_a', 'tool_pages.merge.seo_faq2_q', 'tool_pages.merge.seo_faq2_a'],
	},
	'split': {
		related: [
			{ href: '/pdf-tools/merge/', nameKey: 'pdf_tools.tools.merge_name', icon: GitMergeIcon },
			{ href: '/pdf-tools/organize/', nameKey: 'pdf_tools.tools.organize_name', icon: LayoutGridIcon },
			{ href: '/pdf-tools/pdf-to-images/', nameKey: 'pdf_tools.tools.pdf_to_images_name', icon: FileDownIcon },
		],
		faqKeys: ['tool_pages.split.seo_faq1_q', 'tool_pages.split.seo_faq1_a', 'tool_pages.split.seo_faq2_q', 'tool_pages.split.seo_faq2_a'],
	},
	'rotate': {
		related: [
			{ href: '/pdf-tools/organize/', nameKey: 'pdf_tools.tools.organize_name', icon: LayoutGridIcon },
			{ href: '/pdf-tools/crop/', nameKey: 'pdf_tools.tools.crop_name', icon: CropIcon },
			{ href: '/pdf-tools/page-numbers/', nameKey: 'pdf_tools.tools.page_numbers_name', icon: ListOrderedIcon },
		],
		faqKeys: ['tool_pages.rotate.seo_faq1_q', 'tool_pages.rotate.seo_faq1_a', 'tool_pages.rotate.seo_faq2_q', 'tool_pages.rotate.seo_faq2_a'],
	},
	'organize': {
		related: [
			{ href: '/pdf-tools/merge/', nameKey: 'pdf_tools.tools.merge_name', icon: GitMergeIcon },
			{ href: '/pdf-tools/split/', nameKey: 'pdf_tools.tools.split_name', icon: ScissorsIcon },
			{ href: '/pdf-tools/rotate/', nameKey: 'pdf_tools.tools.rotate_name', icon: RotateCwIcon },
		],
		faqKeys: ['tool_pages.organize.seo_faq1_q', 'tool_pages.organize.seo_faq1_a', 'tool_pages.organize.seo_faq2_q', 'tool_pages.organize.seo_faq2_a'],
	},
	'compress': {
		related: [
			{ href: '/pdf-tools/grayscale/', nameKey: 'pdf_tools.tools.grayscale_name', icon: PaletteIcon },
			{ href: '/pdf-tools/merge/', nameKey: 'pdf_tools.tools.merge_name', icon: GitMergeIcon },
			{ href: '/pdf-tools/from-docx/', nameKey: 'pdf_tools.tools.from_docx_name', icon: FileTextIcon },
		],
		faqKeys: ['tool_pages.compress.seo_faq1_q', 'tool_pages.compress.seo_faq1_a', 'tool_pages.compress.seo_faq2_q', 'tool_pages.compress.seo_faq2_a'],
	},
	'watermark': {
		related: [
			{ href: '/pdf-tools/sign/', nameKey: 'pdf_tools.tools.sign_name', icon: PenToolIcon },
			{ href: '/pdf-tools/page-numbers/', nameKey: 'pdf_tools.tools.page_numbers_name', icon: ListOrderedIcon },
			{ href: '/pdf-tools/edit/', nameKey: 'pdf_tools.tools.edit_name', icon: EditIcon },
		],
		faqKeys: ['tool_pages.watermark.seo_faq1_q', 'tool_pages.watermark.seo_faq1_a', 'tool_pages.watermark.seo_faq2_q', 'tool_pages.watermark.seo_faq2_a'],
	},
	'page-numbers': {
		related: [
			{ href: '/pdf-tools/watermark/', nameKey: 'pdf_tools.tools.watermark_name', icon: PenLineIcon },
			{ href: '/pdf-tools/organize/', nameKey: 'pdf_tools.tools.organize_name', icon: LayoutGridIcon },
			{ href: '/pdf-tools/rotate/', nameKey: 'pdf_tools.tools.rotate_name', icon: RotateCwIcon },
		],
		faqKeys: ['tool_pages.page_numbers.seo_faq1_q', 'tool_pages.page_numbers.seo_faq1_a', 'tool_pages.page_numbers.seo_faq2_q', 'tool_pages.page_numbers.seo_faq2_a'],
	},
	'metadata': {
		related: [
			{ href: '/pdf-tools/compress/', nameKey: 'pdf_tools.tools.compress_name', icon: ZapIcon },
			{ href: '/pdf-tools/password/', nameKey: 'pdf_tools.tools.password_name', icon: LockIcon },
			{ href: '/pdf-tools/unlock/', nameKey: 'pdf_tools.tools.unlock_name', icon: UnlockIcon },
		],
		faqKeys: ['tool_pages.metadata.seo_faq1_q', 'tool_pages.metadata.seo_faq1_a', 'tool_pages.metadata.seo_faq2_q', 'tool_pages.metadata.seo_faq2_a'],
	},
	'crop': {
		related: [
			{ href: '/pdf-tools/rotate/', nameKey: 'pdf_tools.tools.rotate_name', icon: RotateCwIcon },
			{ href: '/pdf-tools/organize/', nameKey: 'pdf_tools.tools.organize_name', icon: LayoutGridIcon },
			{ href: '/pdf-tools/pdf-to-images/', nameKey: 'pdf_tools.tools.pdf_to_images_name', icon: FileDownIcon },
		],
		faqKeys: ['tool_pages.crop.seo_faq1_q', 'tool_pages.crop.seo_faq1_a', 'tool_pages.crop.seo_faq2_q', 'tool_pages.crop.seo_faq2_a'],
	},
	'sign': {
		related: [
			{ href: '/pdf-tools/watermark/', nameKey: 'pdf_tools.tools.watermark_name', icon: PenLineIcon },
			{ href: '/pdf-tools/edit/', nameKey: 'pdf_tools.tools.edit_name', icon: EditIcon },
			{ href: '/pdf-tools/password/', nameKey: 'pdf_tools.tools.password_name', icon: LockIcon },
		],
		faqKeys: ['tool_pages.sign.seo_faq1_q', 'tool_pages.sign.seo_faq1_a', 'tool_pages.sign.seo_faq2_q', 'tool_pages.sign.seo_faq2_a'],
	},
	'edit': {
		related: [
			{ href: '/pdf-tools/sign/', nameKey: 'pdf_tools.tools.sign_name', icon: PenToolIcon },
			{ href: '/pdf-tools/watermark/', nameKey: 'pdf_tools.tools.watermark_name', icon: PenLineIcon },
			{ href: '/pdf-tools/page-numbers/', nameKey: 'pdf_tools.tools.page_numbers_name', icon: ListOrderedIcon },
		],
		faqKeys: ['tool_pages.edit.seo_faq1_q', 'tool_pages.edit.seo_faq1_a', 'tool_pages.edit.seo_faq2_q', 'tool_pages.edit.seo_faq2_a'],
	},
	'password': {
		related: [
			{ href: '/pdf-tools/unlock/', nameKey: 'pdf_tools.tools.unlock_name', icon: UnlockIcon },
			{ href: '/pdf-tools/metadata/', nameKey: 'pdf_tools.tools.metadata_name', icon: InfoIcon },
			{ href: '/pdf-tools/compress/', nameKey: 'pdf_tools.tools.compress_name', icon: ZapIcon },
		],
		faqKeys: ['tool_pages.password.seo_faq1_q', 'tool_pages.password.seo_faq1_a', 'tool_pages.password.seo_faq2_q', 'tool_pages.password.seo_faq2_a'],
	},
	'unlock': {
		related: [
			{ href: '/pdf-tools/password/', nameKey: 'pdf_tools.tools.password_name', icon: LockIcon },
			{ href: '/pdf-tools/metadata/', nameKey: 'pdf_tools.tools.metadata_name', icon: InfoIcon },
			{ href: '/pdf-tools/edit/', nameKey: 'pdf_tools.tools.edit_name', icon: EditIcon },
		],
		faqKeys: ['tool_pages.unlock.seo_faq1_q', 'tool_pages.unlock.seo_faq1_a', 'tool_pages.unlock.seo_faq2_q', 'tool_pages.unlock.seo_faq2_a'],
	},
	'images-to-pdf': {
		related: [
			{ href: '/pdf-tools/pdf-to-images/', nameKey: 'pdf_tools.tools.pdf_to_images_name', icon: FileDownIcon },
			{ href: '/pdf-tools/compress/', nameKey: 'pdf_tools.tools.compress_name', icon: ZapIcon },
			{ href: '/pdf-tools/merge/', nameKey: 'pdf_tools.tools.merge_name', icon: GitMergeIcon },
		],
		faqKeys: ['tool_pages.images_to_pdf.seo_faq1_q', 'tool_pages.images_to_pdf.seo_faq1_a', 'tool_pages.images_to_pdf.seo_faq2_q', 'tool_pages.images_to_pdf.seo_faq2_a'],
	},
	'pdf-to-images': {
		related: [
			{ href: '/pdf-tools/images-to-pdf/', nameKey: 'pdf_tools.tools.images_to_pdf_name', icon: ImageIcon },
			{ href: '/pdf-tools/crop/', nameKey: 'pdf_tools.tools.crop_name', icon: CropIcon },
			{ href: '/pdf-tools/compress/', nameKey: 'pdf_tools.tools.compress_name', icon: ZapIcon },
		],
		faqKeys: ['tool_pages.pdf_to_images.seo_faq1_q', 'tool_pages.pdf_to_images.seo_faq1_a', 'tool_pages.pdf_to_images.seo_faq2_q', 'tool_pages.pdf_to_images.seo_faq2_a'],
	},
	'pdf-to-ppt': {
		related: [
			{ href: '/pdf-tools/to-docx/', nameKey: 'pdf_tools.tools.to_docx_name', icon: FileOutputIcon },
			{ href: '/pdf-tools/pdf-to-text/', nameKey: 'pdf_tools.tools.pdf_to_text_name', icon: TypeIcon },
			{ href: '/pdf-tools/pdf-to-images/', nameKey: 'pdf_tools.tools.pdf_to_images_name', icon: FileDownIcon },
		],
		faqKeys: ['tool_pages.pdf_to_ppt.seo_faq1_q', 'tool_pages.pdf_to_ppt.seo_faq1_a', 'tool_pages.pdf_to_ppt.seo_faq2_q', 'tool_pages.pdf_to_ppt.seo_faq2_a'],
	},
	'pdf-to-text': {
		related: [
			{ href: '/pdf-tools/to-docx/', nameKey: 'pdf_tools.tools.to_docx_name', icon: FileOutputIcon },
			{ href: '/pdf-tools/pdf-to-ppt/', nameKey: 'pdf_tools.tools.pdf_to_ppt_name', icon: PresentationIcon },
			{ href: '/pdf-tools/edit/', nameKey: 'pdf_tools.tools.edit_name', icon: EditIcon },
		],
		faqKeys: ['tool_pages.pdf_to_text.seo_faq1_q', 'tool_pages.pdf_to_text.seo_faq1_a', 'tool_pages.pdf_to_text.seo_faq2_q', 'tool_pages.pdf_to_text.seo_faq2_a'],
	},
	'grayscale': {
		related: [
			{ href: '/pdf-tools/compress/', nameKey: 'pdf_tools.tools.compress_name', icon: ZapIcon },
			{ href: '/pdf-tools/pdf-to-images/', nameKey: 'pdf_tools.tools.pdf_to_images_name', icon: FileDownIcon },
			{ href: '/pdf-tools/crop/', nameKey: 'pdf_tools.tools.crop_name', icon: CropIcon },
		],
		faqKeys: ['tool_pages.grayscale.seo_faq1_q', 'tool_pages.grayscale.seo_faq1_a', 'tool_pages.grayscale.seo_faq2_q', 'tool_pages.grayscale.seo_faq2_a'],
	},
	'from-docx': {
		related: [
			{ href: '/pdf-tools/to-docx/', nameKey: 'pdf_tools.tools.to_docx_name', icon: FileOutputIcon },
			{ href: '/pdf-tools/from-xlsx/', nameKey: 'pdf_tools.tools.from_xlsx_name', icon: TableIcon },
			{ href: '/pdf-tools/compress/', nameKey: 'pdf_tools.tools.compress_name', icon: ZapIcon },
		],
		faqKeys: ['tool_pages.from_docx.seo_faq1_q', 'tool_pages.from_docx.seo_faq1_a', 'tool_pages.from_docx.seo_faq2_q', 'tool_pages.from_docx.seo_faq2_a'],
	},
	'from-xlsx': {
		related: [
			{ href: '/pdf-tools/from-docx/', nameKey: 'pdf_tools.tools.from_docx_name', icon: FileTextIcon },
			{ href: '/pdf-tools/to-docx/', nameKey: 'pdf_tools.tools.to_docx_name', icon: FileOutputIcon },
			{ href: '/pdf-tools/compress/', nameKey: 'pdf_tools.tools.compress_name', icon: ZapIcon },
		],
		faqKeys: ['tool_pages.from_xlsx.seo_faq1_q', 'tool_pages.from_xlsx.seo_faq1_a', 'tool_pages.from_xlsx.seo_faq2_q', 'tool_pages.from_xlsx.seo_faq2_a'],
	},
	'to-docx': {
		related: [
			{ href: '/pdf-tools/from-docx/', nameKey: 'pdf_tools.tools.from_docx_name', icon: FileTextIcon },
			{ href: '/pdf-tools/pdf-to-text/', nameKey: 'pdf_tools.tools.pdf_to_text_name', icon: TypeIcon },
			{ href: '/pdf-tools/pdf-to-ppt/', nameKey: 'pdf_tools.tools.pdf_to_ppt_name', icon: PresentationIcon },
		],
		faqKeys: ['tool_pages.to_docx.seo_faq1_q', 'tool_pages.to_docx.seo_faq1_a', 'tool_pages.to_docx.seo_faq2_q', 'tool_pages.to_docx.seo_faq2_a'],
	},

	// ── Image Tools ──
	'img-rotate': {
		related: [
			{ href: '/image-tools/crop/', nameKey: 'image_tools.tools.crop_name', icon: CropIcon },
			{ href: '/image-tools/filters/', nameKey: 'image_tools.tools.filters_name', icon: SlidersHorizontalIcon },
			{ href: '/image-tools/batch/', nameKey: 'image_tools.tools.batch_name', icon: LayersIcon },
		],
		faqKeys: ['tool_pages.img_rotate.seo_faq1_q', 'tool_pages.img_rotate.seo_faq1_a', 'tool_pages.img_rotate.seo_faq2_q', 'tool_pages.img_rotate.seo_faq2_a'],
	},
	'img-crop': {
		related: [
			{ href: '/image-tools/rotate/', nameKey: 'image_tools.tools.rotate_name', icon: RotateCwIcon },
			{ href: '/image-tools/watermark/', nameKey: 'image_tools.tools.watermark_name', icon: DropletIcon },
			{ href: '/image-tools/filters/', nameKey: 'image_tools.tools.filters_name', icon: SlidersHorizontalIcon },
		],
		faqKeys: ['tool_pages.img_crop.seo_faq1_q', 'tool_pages.img_crop.seo_faq1_a', 'tool_pages.img_crop.seo_faq2_q', 'tool_pages.img_crop.seo_faq2_a'],
	},
	'img-watermark': {
		related: [
			{ href: '/image-tools/meme/', nameKey: 'image_tools.tools.meme_name', icon: SmileIcon },
			{ href: '/image-tools/crop/', nameKey: 'image_tools.tools.crop_name', icon: CropIcon },
			{ href: '/image-tools/batch/', nameKey: 'image_tools.tools.batch_name', icon: LayersIcon },
		],
		faqKeys: ['tool_pages.img_watermark.seo_faq1_q', 'tool_pages.img_watermark.seo_faq1_a', 'tool_pages.img_watermark.seo_faq2_q', 'tool_pages.img_watermark.seo_faq2_a'],
	},
	'img-meme': {
		related: [
			{ href: '/image-tools/watermark/', nameKey: 'image_tools.tools.watermark_name', icon: DropletIcon },
			{ href: '/image-tools/filters/', nameKey: 'image_tools.tools.filters_name', icon: SlidersHorizontalIcon },
			{ href: '/image-tools/crop/', nameKey: 'image_tools.tools.crop_name', icon: CropIcon },
		],
		faqKeys: ['tool_pages.img_meme.seo_faq1_q', 'tool_pages.img_meme.seo_faq1_a', 'tool_pages.img_meme.seo_faq2_q', 'tool_pages.img_meme.seo_faq2_a'],
	},
	'img-batch': {
		related: [
			{ href: '/image-tools/filters/', nameKey: 'image_tools.tools.filters_name', icon: SlidersHorizontalIcon },
			{ href: '/image-tools/rotate/', nameKey: 'image_tools.tools.rotate_name', icon: RotateCwIcon },
			{ href: '/image-tools/crop/', nameKey: 'image_tools.tools.crop_name', icon: CropIcon },
		],
		faqKeys: ['tool_pages.img_batch.seo_faq1_q', 'tool_pages.img_batch.seo_faq1_a', 'tool_pages.img_batch.seo_faq2_q', 'tool_pages.img_batch.seo_faq2_a'],
	},
	'img-qr': {
		related: [
			{ href: '/image-tools/color-picker/', nameKey: 'image_tools.tools.color_picker_name', icon: PipetteIcon },
			{ href: '/image-tools/watermark/', nameKey: 'image_tools.tools.watermark_name', icon: DropletIcon },
			{ href: '/dev-tools/base64/', nameKey: 'dev_tools.tools.base64_name', icon: BinaryIcon },
		],
		faqKeys: ['tool_pages.img_qr.seo_faq1_q', 'tool_pages.img_qr.seo_faq1_a', 'tool_pages.img_qr.seo_faq2_q', 'tool_pages.img_qr.seo_faq2_a'],
	},
	'img-color-picker': {
		related: [
			{ href: '/image-tools/filters/', nameKey: 'image_tools.tools.filters_name', icon: SlidersHorizontalIcon },
			{ href: '/image-tools/crop/', nameKey: 'image_tools.tools.crop_name', icon: CropIcon },
			{ href: '/dev-tools/css-minify/', nameKey: 'dev_tools.tools.css_minify_name', icon: MinimizeIcon },
		],
		faqKeys: ['tool_pages.img_color_picker.seo_faq1_q', 'tool_pages.img_color_picker.seo_faq1_a', 'tool_pages.img_color_picker.seo_faq2_q', 'tool_pages.img_color_picker.seo_faq2_a'],
	},
	'img-blur': {
		related: [
			{ href: '/image-tools/crop/', nameKey: 'image_tools.tools.crop_name', icon: CropIcon },
			{ href: '/image-tools/watermark/', nameKey: 'image_tools.tools.watermark_name', icon: DropletIcon },
			{ href: '/image-tools/filters/', nameKey: 'image_tools.tools.filters_name', icon: SlidersHorizontalIcon },
		],
		faqKeys: ['tool_pages.img_blur.seo_faq1_q', 'tool_pages.img_blur.seo_faq1_a', 'tool_pages.img_blur.seo_faq2_q', 'tool_pages.img_blur.seo_faq2_a'],
	},
	'img-filters': {
		related: [
			{ href: '/image-tools/crop/', nameKey: 'image_tools.tools.crop_name', icon: CropIcon },
			{ href: '/image-tools/rotate/', nameKey: 'image_tools.tools.rotate_name', icon: RotateCwIcon },
			{ href: '/image-tools/batch/', nameKey: 'image_tools.tools.batch_name', icon: LayersIcon },
		],
		faqKeys: ['tool_pages.img_filters.seo_faq1_q', 'tool_pages.img_filters.seo_faq1_a', 'tool_pages.img_filters.seo_faq2_q', 'tool_pages.img_filters.seo_faq2_a'],
	},
	'img-video-to-gif': {
		related: [
			{ href: '/image-tools/crop/', nameKey: 'image_tools.tools.crop_name', icon: CropIcon },
			{ href: '/image-tools/filters/', nameKey: 'image_tools.tools.filters_name', icon: SlidersHorizontalIcon },
			{ href: '/image-tools/batch/', nameKey: 'image_tools.tools.batch_name', icon: LayersIcon },
		],
		faqKeys: ['tool_pages.img_video_to_gif.seo_faq1_q', 'tool_pages.img_video_to_gif.seo_faq1_a', 'tool_pages.img_video_to_gif.seo_faq2_q', 'tool_pages.img_video_to_gif.seo_faq2_a'],
	},

	// ── Dev Tools ──
	'dev-json': {
		related: [
			{ href: '/dev-tools/css-minify/', nameKey: 'dev_tools.tools.css_minify_name', icon: MinimizeIcon },
			{ href: '/dev-tools/diff/', nameKey: 'dev_tools.tools.diff_name', icon: DiffIcon },
			{ href: '/dev-tools/base64/', nameKey: 'dev_tools.tools.base64_name', icon: BinaryIcon },
		],
		faqKeys: ['tool_pages.dev_json.seo_faq1_q', 'tool_pages.dev_json.seo_faq1_a', 'tool_pages.dev_json.seo_faq2_q', 'tool_pages.dev_json.seo_faq2_a'],
	},
	'dev-hash': {
		related: [
			{ href: '/dev-tools/base64/', nameKey: 'dev_tools.tools.base64_name', icon: BinaryIcon },
			{ href: '/dev-tools/diff/', nameKey: 'dev_tools.tools.diff_name', icon: DiffIcon },
			{ href: '/dev-tools/url-encode/', nameKey: 'dev_tools.tools.url_encode_name', icon: LinkIcon },
		],
		faqKeys: ['tool_pages.dev_hash.seo_faq1_q', 'tool_pages.dev_hash.seo_faq1_a', 'tool_pages.dev_hash.seo_faq2_q', 'tool_pages.dev_hash.seo_faq2_a'],
	},
	'dev-base64': {
		related: [
			{ href: '/dev-tools/url-encode/', nameKey: 'dev_tools.tools.url_encode_name', icon: LinkIcon },
			{ href: '/dev-tools/hash/', nameKey: 'dev_tools.tools.hash_name', icon: HashIcon },
			{ href: '/dev-tools/json/', nameKey: 'dev_tools.tools.json_name', icon: BracesIcon },
		],
		faqKeys: ['tool_pages.dev_base64.seo_faq1_q', 'tool_pages.dev_base64.seo_faq1_a', 'tool_pages.dev_base64.seo_faq2_q', 'tool_pages.dev_base64.seo_faq2_a'],
	},
	'dev-markdown': {
		related: [
			{ href: '/dev-tools/diff/', nameKey: 'dev_tools.tools.diff_name', icon: DiffIcon },
			{ href: '/dev-tools/word-count/', nameKey: 'dev_tools.tools.word_count_name', icon: TypeIcon },
			{ href: '/dev-tools/json/', nameKey: 'dev_tools.tools.json_name', icon: BracesIcon },
		],
		faqKeys: ['tool_pages.dev_markdown.seo_faq1_q', 'tool_pages.dev_markdown.seo_faq1_a', 'tool_pages.dev_markdown.seo_faq2_q', 'tool_pages.dev_markdown.seo_faq2_a'],
	},
	'dev-diff': {
		related: [
			{ href: '/dev-tools/json/', nameKey: 'dev_tools.tools.json_name', icon: BracesIcon },
			{ href: '/dev-tools/word-count/', nameKey: 'dev_tools.tools.word_count_name', icon: TypeIcon },
			{ href: '/dev-tools/markdown/', nameKey: 'dev_tools.tools.markdown_name', icon: FileTextIcon },
		],
		faqKeys: ['tool_pages.dev_diff.seo_faq1_q', 'tool_pages.dev_diff.seo_faq1_a', 'tool_pages.dev_diff.seo_faq2_q', 'tool_pages.dev_diff.seo_faq2_a'],
	},
	'dev-word-count': {
		related: [
			{ href: '/dev-tools/diff/', nameKey: 'dev_tools.tools.diff_name', icon: DiffIcon },
			{ href: '/dev-tools/markdown/', nameKey: 'dev_tools.tools.markdown_name', icon: FileTextIcon },
			{ href: '/dev-tools/json/', nameKey: 'dev_tools.tools.json_name', icon: BracesIcon },
		],
		faqKeys: ['tool_pages.dev_word_count.seo_faq1_q', 'tool_pages.dev_word_count.seo_faq1_a', 'tool_pages.dev_word_count.seo_faq2_q', 'tool_pages.dev_word_count.seo_faq2_a'],
	},
	'dev-url-encode': {
		related: [
			{ href: '/dev-tools/base64/', nameKey: 'dev_tools.tools.base64_name', icon: BinaryIcon },
			{ href: '/dev-tools/hash/', nameKey: 'dev_tools.tools.hash_name', icon: HashIcon },
			{ href: '/dev-tools/json/', nameKey: 'dev_tools.tools.json_name', icon: BracesIcon },
		],
		faqKeys: ['tool_pages.dev_url_encode.seo_faq1_q', 'tool_pages.dev_url_encode.seo_faq1_a', 'tool_pages.dev_url_encode.seo_faq2_q', 'tool_pages.dev_url_encode.seo_faq2_a'],
	},
	'dev-css-minify': {
		related: [
			{ href: '/dev-tools/json/', nameKey: 'dev_tools.tools.json_name', icon: BracesIcon },
			{ href: '/dev-tools/diff/', nameKey: 'dev_tools.tools.diff_name', icon: DiffIcon },
			{ href: '/dev-tools/word-count/', nameKey: 'dev_tools.tools.word_count_name', icon: TypeIcon },
		],
		faqKeys: ['tool_pages.dev_css_minify.seo_faq1_q', 'tool_pages.dev_css_minify.seo_faq1_a', 'tool_pages.dev_css_minify.seo_faq2_q', 'tool_pages.dev_css_minify.seo_faq2_a'],
	},
};
