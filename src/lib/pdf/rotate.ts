import { PDFDocument, degrees } from 'pdf-lib';

/**
 * Rotate pages in a PDF.
 * @param file Source PDF file
 * @param rotation Degrees to rotate (90, 180, 270)
 * @param pageIndices 0-indexed pages to rotate; if empty, all pages are rotated
 */
export async function rotatePdf(
	file: File,
	rotation: 90 | 180 | 270,
	pageIndices?: number[]
): Promise<Uint8Array> {
	const bytes = await file.arrayBuffer();
	const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
	const total = doc.getPageCount();
	const targets = pageIndices && pageIndices.length > 0
		? pageIndices
		: Array.from({ length: total }, (_, i) => i);
	for (const i of targets) {
		const page = doc.getPage(i);
		const current = page.getRotation().angle;
		page.setRotation(degrees((current + rotation) % 360));
	}
	return doc.save();
}
