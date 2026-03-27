import { PDFDocument } from 'pdf-lib';

export interface PdfCropBox {
	left: number;
	bottom: number;
	right: number;
	top: number;
}

/**
 * Crop PDF pages by setting CropBox and MediaBox.
 * Coordinates are in PDF points (72 per inch), origin at bottom-left.
 */
export async function cropPdf(
	file: File,
	cropBox: PdfCropBox,
	pageIndices?: number[],
): Promise<Uint8Array> {
	const bytes = await file.arrayBuffer();
	const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
	const pages = doc.getPages();

	const targets = pageIndices ?? pages.map((_, i) => i);

	for (const idx of targets) {
		if (idx < 0 || idx >= pages.length) continue;
		const page = pages[idx];
		page.setCropBox(cropBox.left, cropBox.bottom, cropBox.right - cropBox.left, cropBox.top - cropBox.bottom);
		page.setMediaBox(cropBox.left, cropBox.bottom, cropBox.right - cropBox.left, cropBox.top - cropBox.bottom);
	}

	return doc.save();
}
