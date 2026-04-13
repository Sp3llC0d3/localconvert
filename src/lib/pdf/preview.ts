import { getPdfJs, pdfDocumentOptions } from './utils';

export interface PdfDocProxy {
	numPages: number;
	getPage(pageNum: number): Promise<any>;
	destroy(): void;
}

/**
 * Load a PDF document from a file. Caller should call doc.destroy() when done.
 */
export async function loadPdfDocument(file: File): Promise<PdfDocProxy> {
	const pdfjs = await getPdfJs();
	const buf = await file.arrayBuffer();
	return await pdfjs.getDocument({ data: buf, ...pdfDocumentOptions }).promise;
}

/**
 * Render a single page from a pre-loaded document to a canvas.
 * Returns page dimensions in PDF points.
 */
export async function renderDocPageToCanvas(
	doc: PdfDocProxy,
	pageNum: number,
	canvas: HTMLCanvasElement,
	scale = 0.5,
): Promise<{ width: number; height: number }> {
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

/**
 * Convenience: render a page directly from a file (loads doc internally).
 * Use renderDocPageToCanvas with loadPdfDocument for repeated calls on same file.
 */
export async function renderPageToCanvas(
	file: File,
	pageNum: number,
	canvas: HTMLCanvasElement,
	scale = 0.5,
): Promise<{ width: number; height: number }> {
	const doc = await loadPdfDocument(file);
	const result = await renderDocPageToCanvas(doc, pageNum, canvas, scale);
	doc.destroy();
	return result;
}
