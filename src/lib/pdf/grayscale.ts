import { PDFDocument } from 'pdf-lib';
import { getPdfJs } from './utils';

/**
 * Convert all PDF pages to grayscale by rendering through a canvas with grayscale filter.
 * ⚠️ Text becomes non-selectable in the output (same as compress).
 */
export async function grayscalePdf(
	file: File,
	quality = 0.85,
	scale = 1.5,
	onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
	const pdfjs = await getPdfJs();
	const buf = await file.arrayBuffer();
	const pdfDoc = await pdfjs.getDocument({ data: buf }).promise;
	const newPdf = await PDFDocument.create();
	const total = pdfDoc.numPages;

	for (let i = 1; i <= total; i++) {
		const page = await pdfDoc.getPage(i);
		const viewport = page.getViewport({ scale });

		const canvas = document.createElement('canvas');
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		const ctx = canvas.getContext('2d')!;

		// Apply grayscale filter before rendering
		ctx.filter = 'grayscale(1)';
		await page.render({ canvasContext: ctx, viewport, canvas }).promise;

		const jpegBlob = await new Promise<Blob>((resolve) =>
			canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality),
		);
		const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

		const origVp = page.getViewport({ scale: 1.0 });
		const jpgImage = await newPdf.embedJpg(jpegBytes);
		const newPage = newPdf.addPage([origVp.width, origVp.height]);
		newPage.drawImage(jpgImage, { x: 0, y: 0, width: origVp.width, height: origVp.height });

		onProgress?.(i, total);
	}

	pdfDoc.destroy();
	return newPdf.save();
}
