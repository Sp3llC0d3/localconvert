import { Converter, FormatInfo } from "./converter.svelte";
import { VertFile } from "$lib/types";

/**
 * DocToPdfConverter — converts documents to PDF.
 * DOCX/DOC → PDF via mammoth + pdf-lib
 * XLSX/XLS/ODS/CSV → PDF via SheetJS + pdf-lib
 *
 * Input-only formats: all document types. Output-only: .pdf.
 * isNative is false — Pandoc stays primary for docx↔md etc.
 */
export class DocToPdfConverter extends Converter {
	public name = "doc-to-pdf";
	public readonly reportsProgress = true;

	public supportedFormats = [
		new FormatInfo("docx", true, false, false),
		new FormatInfo("doc", true, false, false),
		new FormatInfo("xlsx", true, false, false),
		new FormatInfo("xls", true, false, false),
		new FormatInfo("ods", true, false, false),
		new FormatInfo("csv", true, false, false),
		new FormatInfo("pdf", false, true, false),
	];

	constructor() {
		super(60);
		this.status = "ready";
		this.clearTimeout();
	}

	public async convert(input: VertFile, to: string): Promise<VertFile> {
		const fromExt = input.from.toLowerCase();
		const toExt = to.toLowerCase();

		if ([".docx", ".doc"].includes(fromExt) && toExt === ".pdf") {
			const { convertDocxToPdf } = await import("$lib/pdf/from-docx");
			const bytes = await convertDocxToPdf(input.file, {
				onProgress: (p) => { input.progress = Math.round(p * 100); },
			});
			const outName = input.file.name.replace(/\.(docx|doc)$/i, ".pdf");
			return new VertFile(
				new File([bytes], outName, { type: "application/pdf" }),
				".pdf",
			);
		}

		if ([".xlsx", ".xls", ".ods", ".csv"].includes(fromExt) && toExt === ".pdf") {
			const { convertXlsxToPdf } = await import("$lib/pdf/from-xlsx");
			const bytes = await convertXlsxToPdf(input.file, {
				onProgress: (p) => { input.progress = Math.round(p * 100); },
			});
			const outName = input.file.name.replace(/\.(xlsx|xls|ods|csv)$/i, ".pdf");
			return new VertFile(
				new File([bytes], outName, { type: "application/pdf" }),
				".pdf",
			);
		}

		throw new Error(`Unsupported conversion: ${fromExt} → ${toExt}`);
	}

	public async cancel(): Promise<void> {}
}

/**
 * PdfToDocConverter — converts PDF to Word document.
 * PDF → DOCX via pdfjs-dist (text extraction) + docx (DOCX builder)
 *
 * Input-only: .pdf. Output-only: .docx.
 * isNative is false — PdfConverter stays primary for pdf↔images.
 */
export class PdfToDocConverter extends Converter {
	public name = "pdf-to-doc";
	public readonly reportsProgress = true;

	public supportedFormats = [
		new FormatInfo("pdf", true, false, false),
		new FormatInfo("docx", false, true, false),
	];

	constructor() {
		super(60);
		this.status = "ready";
		this.clearTimeout();
	}

	public async convert(input: VertFile, to: string): Promise<VertFile> {
		const fromExt = input.from.toLowerCase();
		const toExt = to.toLowerCase();

		if (fromExt === ".pdf" && toExt === ".docx") {
			const { convertPdfToDocx } = await import("$lib/pdf/to-docx");
			const bytes = await convertPdfToDocx(input.file, {
				onProgress: (p) => { input.progress = Math.round(p * 100); },
			});
			const outName = input.file.name.replace(/\.pdf$/i, ".docx");
			return new VertFile(
				new File([bytes], outName, {
					type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				}),
				".docx",
			);
		}

		throw new Error(`Unsupported conversion: ${fromExt} → ${toExt}`);
	}

	public async cancel(): Promise<void> {}
}
