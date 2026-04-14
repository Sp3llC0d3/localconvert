import { Converter, FormatInfo } from "./converter.svelte";
import { VertFile } from "$lib/types";

/**
 * Document ↔ PDF converter — handles Word/Excel → PDF and PDF → Word.
 * DOCX/DOC → PDF via mammoth + pdf-lib
 * XLSX/XLS/ODS/CSV → PDF via SheetJS + pdf-lib
 * PDF → DOCX via pdfjs-dist + docx
 *
 * Libraries are loaded on demand via dynamic import.
 * isNative is false for all formats — Pandoc and PdfConverter remain
 * primary for their native paths (docx↔md, pdf↔images).
 */
export class DocPdfConverter extends Converter {
	public name = "doc-pdf";
	public readonly reportsProgress = true;

	public supportedFormats = [
		new FormatInfo("docx", true, true, false),
		new FormatInfo("doc", true, false, false),
		new FormatInfo("xlsx", true, false, false),
		new FormatInfo("xls", true, false, false),
		new FormatInfo("ods", true, false, false),
		new FormatInfo("csv", true, false, false),
		new FormatInfo("pdf", true, true, false),
	];

	constructor() {
		super(60); // 60s timeout for large documents
		this.status = "ready";
		this.clearTimeout();
	}

	public async convert(input: VertFile, to: string): Promise<VertFile> {
		const fromExt = input.from.toLowerCase();
		const toExt = to.toLowerCase();

		if ([".docx", ".doc"].includes(fromExt) && toExt === ".pdf") {
			return this.docxToPdf(input);
		}

		if ([".xlsx", ".xls", ".ods", ".csv"].includes(fromExt) && toExt === ".pdf") {
			return this.xlsxToPdf(input);
		}

		if (fromExt === ".pdf" && toExt === ".docx") {
			return this.pdfToDocx(input);
		}

		throw new Error(`Unsupported conversion: ${fromExt} → ${toExt}`);
	}

	private async docxToPdf(input: VertFile): Promise<VertFile> {
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

	private async xlsxToPdf(input: VertFile): Promise<VertFile> {
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

	private async pdfToDocx(input: VertFile): Promise<VertFile> {
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

	public async cancel(): Promise<void> {
		// These conversions are synchronous library calls, not cancellable
	}
}
