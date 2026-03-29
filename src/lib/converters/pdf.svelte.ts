import { Converter, FormatInfo } from "./converter.svelte";
import { VertFile } from "$lib/types";

/**
 * PDF converter — handles PDF ↔ Image conversions.
 * PDF → JPG/PNG via pdfjs-dist (renders each page to canvas)
 * JPG/PNG/WEBP → PDF via pdf-lib (embeds images as pages)
 */
export class PdfConverter extends Converter {
	public name = "pdf";

	public supportedFormats = [
		new FormatInfo("pdf", true, true),
		new FormatInfo("jpg", true, true),
		new FormatInfo("jpeg", true, true),
		new FormatInfo("png", true, true),
		new FormatInfo("webp", true, false), // input only (converted to PNG internally)
	];

	constructor() {
		super(30);
		this.status = "ready";
		this.clearTimeout();
	}

	public async convert(input: VertFile, to: string): Promise<VertFile> {
		const fromExt = input.from.toLowerCase();
		const toExt = to.toLowerCase();

		if (fromExt === ".pdf" && [".jpg", ".jpeg", ".png"].includes(toExt)) {
			return this.pdfToImage(input, toExt);
		}

		if ([".jpg", ".jpeg", ".png", ".webp"].includes(fromExt) && toExt === ".pdf") {
			return this.imageToPdf(input);
		}

		throw new Error(`Unsupported conversion: ${fromExt} → ${toExt}`);
	}

	private async pdfToImage(input: VertFile, toExt: string): Promise<VertFile> {
		const { pdfToImages } = await import("$lib/pdf/pdf-to-images");
		const format = toExt === ".png" ? "image/png" as const : "image/jpeg" as const;
		const quality = input.optQuality ? input.optQuality / 100 : 0.92;

		const pages = await pdfToImages(input.file, format, quality, 2, (done, total) => {
			input.progress = Math.round((done / total) * 100);
		});

		if (pages.length === 1) {
			// Single page → return as image file
			const outName = input.file.name.replace(/\.pdf$/i, toExt);
			return new VertFile(
				new File([pages[0].blob], outName, { type: pages[0].blob.type }),
				toExt,
			);
		}

		// Multi-page → ZIP of images
		const { createZip } = await import("$lib/util/zip");
		const imageFiles = pages.map(
			(p) => new File([p.blob], p.filename, { type: p.blob.type }),
		);
		const zipBlob = await createZip(imageFiles);
		const zipName = input.file.name.replace(/\.pdf$/i, ".zip");
		return new VertFile(
			new File([zipBlob], zipName),
			".zip",
		);
	}

	private async imageToPdf(input: VertFile): Promise<VertFile> {
		const { imagesToPdf } = await import("$lib/pdf/images-to-pdf");
		const pdfBytes = await imagesToPdf([input.file]);
		const outName = input.file.name.replace(/\.[^.]+$/, ".pdf");
		return new VertFile(
			new File([pdfBytes], outName, { type: "application/pdf" }),
			".pdf",
		);
	}

	public async cancel(): Promise<void> {
		// PDF conversions are synchronous canvas operations, not cancellable
	}
}
