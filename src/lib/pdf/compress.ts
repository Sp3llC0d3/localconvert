import { PDFDocument } from 'pdf-lib';
import { getPdfJs } from './utils';

/**
 * Compress a PDF by re-rendering each page as a JPEG.
 * ⚠️ Text becomes non-selectable in the output.
 * @param quality JPEG quality 0–1 (0.3=high compression, 0.6=medium, 0.9=low)
 * @param scale  Render resolution multiplier
 */
export async function compressPdf(
	file: File,
	quality = 0.6,
	scale = 1.5,
	onProgress?: (done: number, total: number) => void
): Promise<Uint8Array> {
	const pdfjs = await getPdfJs();
	const arrayBuffer = await file.arrayBuffer();
	const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
	const newPdf = await PDFDocument.create();

	const total = pdfDoc.numPages;
	for (let i = 1; i <= total; i++) {
		const page = await pdfDoc.getPage(i);
		const viewport = page.getViewport({ scale });

		const canvas = document.createElement('canvas');
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		const ctx = canvas.getContext('2d')!;
		await page.render({ canvasContext: ctx, viewport, canvas }).promise;

		const jpegBlob = await new Promise<Blob>((resolve) =>
			canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality)
		);
		canvas.width = 0; canvas.height = 0; // release canvas memory
		const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

		// Use original page dimensions (PDF points, not pixels)
		const origViewport = page.getViewport({ scale: 1.0 });
		const pageWidth = origViewport.width;
		const pageHeight = origViewport.height;

		const jpgImage = await newPdf.embedJpg(jpegBytes);
		const newPage = newPdf.addPage([pageWidth, pageHeight]);
		newPage.drawImage(jpgImage, { x: 0, y: 0, width: pageWidth, height: pageHeight });

		onProgress?.(i, total);
	}

	pdfDoc.destroy();
	return newPdf.save();
}
