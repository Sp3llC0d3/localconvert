import { PDFDocument } from 'pdf-lib';

/**
 * Reorder and/or delete pages.
 * @param file Source PDF
 * @param newOrder 0-indexed page indices in the desired output order
 */
export async function organizePdf(file: File, newOrder: number[]): Promise<Uint8Array> {
	const bytes = await file.arrayBuffer();
	const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
	const out = await PDFDocument.create();
	const pages = await out.copyPages(src, newOrder);
	pages.forEach(p => out.addPage(p));
	return out.save();
}
