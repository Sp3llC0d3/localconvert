import { getPdfJs } from './utils';

export interface PdfPageImage {
	pageNum: number;
	blob: Blob;
	filename: string;
}

/**
 * Render each page of a PDF to an image blob.
 * @param file Source PDF
 * @param format 'image/jpeg' | 'image/png'
 * @param quality JPEG quality 0–1 (ignored for PNG)
 * @param scale Render resolution multiplier (1.5 = 1.5x, 2 = 2x)
 * @param onProgress Called after each page with (completed, total)
 */
export async function pdfToImages(
	file: File,
	format: 'image/jpeg' | 'image/png' = 'image/jpeg',
	quality = 0.92,
	scale = 2,
	onProgress?: (done: number, total: number) => void
): Promise<PdfPageImage[]> {
	const pdfjs = await getPdfJs();
	const arrayBuffer = await file.arrayBuffer();
	const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
	const total = pdfDoc.numPages;
	const ext = format === 'image/jpeg' ? 'jpg' : 'png';
	const baseName = file.name.replace(/\.pdf$/i, '');
	const results: PdfPageImage[] = [];

	for (let i = 1; i <= total; i++) {
		const page = await pdfDoc.getPage(i);
		const viewport = page.getViewport({ scale });
		const canvas = document.createElement('canvas');
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		const ctx = canvas.getContext('2d')!;
		await page.render({ canvasContext: ctx, viewport, canvas }).promise;
		const blob = await new Promise<Blob>((resolve) =>
			canvas.toBlob((b) => resolve(b!), format, quality)
		);
		results.push({ pageNum: i, blob, filename: `${baseName}_page${i}.${ext}` });
		onProgress?.(i, total);
	}

	return results;
}
