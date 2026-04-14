import type { Categories } from "$lib/types";
import type { Converter } from "./converter.svelte";
import { FFmpegConverter } from "./ffmpeg.svelte";
import { PandocConverter } from "./pandoc.svelte";
import { MagickConverter } from "./magick.svelte";
import { PdfConverter } from "./pdf.svelte";
import { DocToPdfConverter, PdfToDocConverter } from "./doc-pdf.svelte";

const getConverters = (): Converter[] => {
	const converters: Converter[] = [
		new MagickConverter(),
		new FFmpegConverter(),
		new PandocConverter(),
		new PdfConverter(),
		new DocToPdfConverter(),
		new PdfToDocConverter(),
	];

	return converters;
};

export const converters = getConverters();

export function getConverterByFormat(format: string) {
	for (const converter of converters) {
		if (converter.supportedFormats.some((f) => f.name === format)) {
			return converter;
		}
	}
	return null;
}

export const categories: Categories = {
	image: { formats: [""], canConvertTo: ["doc"] },
	video: { formats: [""], canConvertTo: ["audio"] },
	audio: { formats: [""], canConvertTo: ["video"] },
	doc: { formats: [""], canConvertTo: [] },
};

categories.audio.formats =
	converters
		.find((c) => c.name === "ffmpeg")
		?.supportedFormats.filter((f) => f.toSupported && f.isNative)
		.map((f) => f.name) || [];
categories.video.formats =
	converters
		.find((c) => c.name === "ffmpeg")
		?.supportedFormats.filter((f) => f.toSupported && !f.isNative)
		.map((f) => f.name) || [];
// Image: curated common formats only (ImageMagick supports 147+ but most are obscure)
categories.image.formats = [
	".jpg", ".png", ".webp", ".avif", ".gif", ".svg", ".jxl",
	".ico", ".bmp", ".tiff", ".psd", ".eps", ".pdf",
];
categories.doc.formats =
	converters
		.find((c) => c.name === "pandoc")
		?.supportedFormats.filter((f) => f.toSupported && f.isNative)
		.map((f) => f.name) || [];
// Add PDF as a document output format (Word/Excel → PDF via doc-to-pdf converter)
if (!categories.doc.formats.includes(".pdf")) {
	categories.doc.formats.push(".pdf");
}

export const byNative = (format: string) => {
	return (a: Converter, b: Converter) => {
		const aFormat = a.supportedFormats.find((f) => f.name === format);
		const bFormat = b.supportedFormats.find((f) => f.name === format);

		if (aFormat && bFormat) {
			return aFormat.isNative ? -1 : 1;
		}
		return 0;
	};
};