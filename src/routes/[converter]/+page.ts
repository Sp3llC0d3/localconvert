import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export type ConverterInfo = {
	format: string;
	label: string;
	type: "image" | "audio" | "video" | "doc";
	headline: string;
	description: string;
	inputFormats: string[];
};

const converterMap: Record<string, ConverterInfo> = {
	// Images
	jpg: {
		format: "jpg",
		label: "JPG",
		type: "image",
		headline: "Convert any image to JPG — free & private",
		description:
			"Convert PNG, WEBP, GIF, BMP, TIFF, HEIC and more to JPG instantly. All processing happens in your browser — your files never leave your device.",
		inputFormats: ["png", "webp", "gif", "bmp", "tiff", "heic", "svg", "ico"],
	},
	png: {
		format: "png",
		label: "PNG",
		type: "image",
		headline: "Convert any image to PNG — free & private",
		description:
			"Convert JPG, WEBP, GIF, BMP, TIFF, HEIC and more to PNG with lossless quality. No uploads, no watermarks — runs entirely in your browser.",
		inputFormats: ["jpg", "jpeg", "webp", "gif", "bmp", "tiff", "heic", "svg"],
	},
	webp: {
		format: "webp",
		label: "WEBP",
		type: "image",
		headline: "Convert images to WEBP — free & private",
		description:
			"Convert JPG, PNG, GIF, BMP and more to WEBP for smaller file sizes without quality loss. All done locally in your browser.",
		inputFormats: ["jpg", "jpeg", "png", "gif", "bmp", "tiff"],
	},
	gif: {
		format: "gif",
		label: "GIF",
		type: "image",
		headline: "Convert images to GIF — free & private",
		description:
			"Convert JPG, PNG, WEBP, BMP and other image formats to GIF. Fully local — no server uploads ever.",
		inputFormats: ["jpg", "jpeg", "png", "webp", "bmp"],
	},
	bmp: {
		format: "bmp",
		label: "BMP",
		type: "image",
		headline: "Convert images to BMP — free & private",
		description:
			"Convert JPG, PNG, WEBP, GIF and more to BMP bitmap format. Runs entirely in your browser with no file uploads.",
		inputFormats: ["jpg", "jpeg", "png", "webp", "gif", "tiff"],
	},
	tiff: {
		format: "tiff",
		label: "TIFF",
		type: "image",
		headline: "Convert images to TIFF — free & private",
		description:
			"Convert JPG, PNG, WEBP, BMP and more to high-quality TIFF format. 100% local, no upload needed.",
		inputFormats: ["jpg", "jpeg", "png", "webp", "bmp", "gif"],
	},
	svg: {
		format: "svg",
		label: "SVG",
		type: "image",
		headline: "Convert images to SVG — free & private",
		description:
			"Convert raster images to scalable SVG vector format. Everything runs in your browser — zero uploads.",
		inputFormats: ["jpg", "jpeg", "png", "webp", "bmp", "gif"],
	},
	avif: {
		format: "avif",
		label: "AVIF",
		type: "image",
		headline: "Convert images to AVIF — free & private",
		description:
			"Convert JPG, PNG, WEBP, HEIC and more to AVIF for superior compression with no quality loss. Runs entirely in your browser — no uploads.",
		inputFormats: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "heic"],
	},
	ico: {
		format: "ico",
		label: "ICO",
		type: "image",
		headline: "Convert images to ICO — free & private",
		description:
			"Convert PNG, JPG, WEBP and more to ICO icon format. Perfect for favicons. All conversion runs locally in your browser.",
		inputFormats: ["png", "jpg", "jpeg", "webp", "bmp", "gif"],
	},
	// Audio
	mp3: {
		format: "mp3",
		label: "MP3",
		type: "audio",
		headline: "Convert audio to MP3 — free & private",
		description:
			"Convert WAV, OGG, FLAC, AAC, M4A and more to MP3. No uploads, no accounts — all conversion runs locally in your browser.",
		inputFormats: ["wav", "ogg", "flac", "aac", "m4a", "wma", "opus"],
	},
	wav: {
		format: "wav",
		label: "WAV",
		type: "audio",
		headline: "Convert audio to WAV — free & private",
		description:
			"Convert MP3, OGG, FLAC, AAC, M4A and more to uncompressed WAV format. Runs entirely in your browser.",
		inputFormats: ["mp3", "ogg", "flac", "aac", "m4a", "opus"],
	},
	ogg: {
		format: "ogg",
		label: "OGG",
		type: "audio",
		headline: "Convert audio to OGG — free & private",
		description:
			"Convert MP3, WAV, FLAC, AAC and more to OGG Vorbis format. Free, fast, and 100% local.",
		inputFormats: ["mp3", "wav", "flac", "aac", "m4a"],
	},
	flac: {
		format: "flac",
		label: "FLAC",
		type: "audio",
		headline: "Convert audio to FLAC — free & private",
		description:
			"Convert MP3, WAV, OGG, AAC and more to lossless FLAC format. No upload required — runs in your browser.",
		inputFormats: ["mp3", "wav", "ogg", "aac", "m4a"],
	},
	aac: {
		format: "aac",
		label: "AAC",
		type: "audio",
		headline: "Convert audio to AAC — free & private",
		description:
			"Convert MP3, WAV, OGG, FLAC and more to AAC format. All processing happens locally — no file uploads.",
		inputFormats: ["mp3", "wav", "ogg", "flac", "m4a"],
	},
	// Video
	mp4: {
		format: "mp4",
		label: "MP4",
		type: "video",
		headline: "Convert video to MP4 — free & private",
		description:
			"Convert WEBM, MKV, AVI, MOV, FLV and more to MP4. GPU-accelerated when available. Your video never leaves your device.",
		inputFormats: ["webm", "mkv", "avi", "mov", "flv", "wmv"],
	},
	webm: {
		format: "webm",
		label: "WEBM",
		type: "video",
		headline: "Convert video to WEBM — free & private",
		description:
			"Convert MP4, MKV, AVI, MOV and more to WEBM format. All done locally with no server uploads.",
		inputFormats: ["mp4", "mkv", "avi", "mov", "flv"],
	},
	mkv: {
		format: "mkv",
		label: "MKV",
		type: "video",
		headline: "Convert video to MKV — free & private",
		description:
			"Convert MP4, WEBM, AVI, MOV and more to MKV container format. Runs entirely in your browser.",
		inputFormats: ["mp4", "webm", "avi", "mov", "flv"],
	},
	avi: {
		format: "avi",
		label: "AVI",
		type: "video",
		headline: "Convert video to AVI — free & private",
		description:
			"Convert MP4, WEBM, MKV, MOV and more to AVI format. No uploads — your files stay on your device.",
		inputFormats: ["mp4", "webm", "mkv", "mov", "flv"],
	},
	mov: {
		format: "mov",
		label: "MOV",
		type: "video",
		headline: "Convert video to MOV — free & private",
		description:
			"Convert MP4, WEBM, MKV, AVI and more to QuickTime MOV format. 100% local, no account needed.",
		inputFormats: ["mp4", "webm", "mkv", "avi", "flv"],
	},
	// Documents
	docx: {
		format: "docx",
		label: "DOCX",
		type: "doc",
		headline: "Convert documents to DOCX — free & private",
		description:
			"Convert Markdown, HTML, EPUB, ODT, RTF and more to DOCX Word format. Powered by Pandoc, running locally in your browser.",
		inputFormats: ["md", "html", "epub", "odt", "rtf", "rst"],
	},
	md: {
		format: "md",
		label: "Markdown",
		type: "doc",
		headline: "Convert documents to Markdown — free & private",
		description:
			"Convert DOCX, HTML, EPUB, ODT, RTF and more to clean Markdown. All done locally with Pandoc WASM.",
		inputFormats: ["docx", "html", "epub", "odt", "rtf", "rst"],
	},
	html: {
		format: "html",
		label: "HTML",
		type: "doc",
		headline: "Convert documents to HTML — free & private",
		description:
			"Convert DOCX, Markdown, EPUB, ODT and more to HTML. Runs entirely in your browser — no server uploads.",
		inputFormats: ["docx", "md", "epub", "odt", "rst"],
	},
	epub: {
		format: "epub",
		label: "EPUB",
		type: "doc",
		headline: "Convert documents to EPUB — free & private",
		description:
			"Convert DOCX, Markdown, HTML, ODT and more to EPUB ebook format. 100% local using Pandoc WASM.",
		inputFormats: ["docx", "md", "html", "odt", "rst"],
	},
	odt: {
		format: "odt",
		label: "ODT",
		type: "doc",
		headline: "Convert documents to ODT — free & private",
		description:
			"Convert DOCX, Markdown, HTML, EPUB and more to OpenDocument ODT format. No uploads required.",
		inputFormats: ["docx", "md", "html", "epub", "rst"],
	},
};

export const entries = () =>
	Object.keys(converterMap).map((format) => ({
		converter: `${format}-converter`,
	}));

export const prerender = true;

export const load: PageLoad = ({ params }) => {
	const slug = params.converter;
	const format = slug.replace(/-converter$/, "");
	const info = converterMap[format];

	if (!info) {
		error(404, `No converter found for "${slug}"`);
	}

	return { info, slug, validFormats: Object.keys(converterMap) };
};
