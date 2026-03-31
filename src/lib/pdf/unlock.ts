import { PDFDocument } from 'pdf-lib';
import { getPdfJs } from './utils';

/**
 * Remove password protection from a PDF.
 *
 * Strategy:
 * 1. Try pdf-lib with ignoreEncryption (fast, preserves text/vectors)
 * 2. If that fails, fall back to re-rendering via pdfjs-dist (slower, rasterizes pages)
 *
 * @param file The encrypted PDF file
 * @param password Optional password (empty string = try without password)
 */
export async function unlockPdf(file: File, password = ''): Promise<Uint8Array> {
	const bytes = await file.arrayBuffer();

	// Strategy 1: pdf-lib ignoreEncryption (works for simple encryption)
	try {
		const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
		return await doc.save();
	} catch {
		// pdf-lib can't handle this encryption — fall back to re-rendering
	}

	// Strategy 2: re-render via pdfjs-dist (works for all encryption types)
	try {
		const pdfjs = await getPdfJs();
		const pdfDoc = await pdfjs.getDocument({ data: bytes, password }).promise;
		const newPdf = await PDFDocument.create();
		const total = pdfDoc.numPages;

		for (let i = 1; i <= total; i++) {
			const page = await pdfDoc.getPage(i);
			const viewport = page.getViewport({ scale: 2 });
			const canvas = document.createElement('canvas');
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			const ctx = canvas.getContext('2d')!;
			await page.render({ canvasContext: ctx, viewport, canvas }).promise;

			const jpegBlob = await new Promise<Blob>((resolve) =>
				canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
			);
			canvas.width = 0; canvas.height = 0;
			const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

			const origViewport = page.getViewport({ scale: 1 });
			const jpgImage = await newPdf.embedJpg(jpegBytes);
			const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
			newPage.drawImage(jpgImage, { x: 0, y: 0, width: origViewport.width, height: origViewport.height });
		}

		pdfDoc.destroy();
		return newPdf.save();
	} catch {
		throw new Error('This PDF cannot be unlocked. Check the password or try a different file.');
	}
}
