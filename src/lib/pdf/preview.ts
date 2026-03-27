import { getPdfJs } from './utils';

/**
 * Render a single PDF page to an existing canvas element.
 * Returns the page dimensions in PDF points.
 */
export async function renderPageToCanvas(
	file: File,
	pageNum: number,
	canvas: HTMLCanvasElement,
	scale = 0.5,
): Promise<{ width: number; height: number }> {
	const pdfjs = await getPdfJs();
	const buf = await file.arrayBuffer();
	const doc = await pdfjs.getDocument({ data: buf }).promise;
	const page = await doc.getPage(pageNum); // 1-indexed
	const origVp = page.getViewport({ scale: 1 });
	const viewport = page.getViewport({ scale });

	canvas.width = viewport.width;
	canvas.height = viewport.height;
	const ctx = canvas.getContext('2d')!;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	await page.render({ canvasContext: ctx, viewport }).promise;

	return { width: Math.round(origVp.width), height: Math.round(origVp.height) };
}
