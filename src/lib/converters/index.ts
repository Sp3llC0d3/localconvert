import type { Categories } from "$lib/types";
import type { Converter } from "./converter.svelte";
import { FFmpegConverter } from "./ffmpeg.svelte";
import { PandocConverter } from "./pandoc.svelte";
import { MagickConverter } from "./magick.svelte";
import { PdfConverter } from "./pdf.svelte";
import { DocPdfConverter } from "./doc-pdf.svelte";

const getConverters = (): Converter[] => {
	const converters: Converter[] = [
		new MagickConverter(),
		new FFmpegConverter(),
		new PandocConverter(),
		new PdfConverter(),
		new DocPdfConverter(),
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
	image: { formats: [""], canConvertTo: [] },
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
categories.image.formats =
	converters
		.find((c) => c.name === "imagemagick")
		?.formatStrings((f) => f.toSupported) || [];
// Add PDF as an image output format (Image → PDF via pdf converter)
if (!categories.image.formats.includes(".pdf")) {
	categories.image.formats.push(".pdf");
}
categories.doc.formats =
	converters
		.find((c) => c.name === "pandoc")
		?.supportedFormats.filter((f) => f.toSupported && f.isNative)
		.map((f) => f.name) || [];
// Add PDF as a document output format (Word/Excel → PDF via doc-pdf converter)
if (!categories.doc.formats.includes(".pdf")) {
	categories.doc.formats.push(".pdf");
}
// Add spreadsheet formats to doc category (Excel → PDF via doc-pdf converter)
for (const fmt of [".xlsx", ".xls", ".ods"]) {
	if (!categories.doc.formats.includes(fmt)) {
		categories.doc.formats.push(fmt);
	}
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