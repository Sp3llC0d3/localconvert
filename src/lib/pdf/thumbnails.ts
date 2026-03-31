import { browser } from '$app/environment';
import { getPdfJs } from './utils';

/**
 * Render a single PDF page to a data URL for use as a thumbnail.
 * @param file   Source PDF
 * @param pageNum 1-indexed page number
 * @param scale  Render scale (default 0.3 for small thumbnails)
 */
export async function renderThumbnail(file: File, pageNum: number, scale = 0.3): Promise<string> {
	if (!browser) throw new Error('thumbnails must run in browser');
	const pdfjs = await getPdfJs();
	const bytes = await file.arrayBuffer();
	const pdfDoc = await pdfjs.getDocument({ data: bytes }).promise;
	const page = await pdfDoc.getPage(pageNum);
	const viewport = page.getViewport({ scale });
	const canvas = document.createElement('canvas');
	canvas.width = viewport.width;
	canvas.height = viewport.height;
	const ctx = canvas.getContext('2d')!;
	await page.render({ canvasContext: ctx, viewport, canvas }).promise;
	const url = canvas.toDataURL('image/jpeg', 0.7);
	canvas.width = 0; canvas.height = 0;
	pdfDoc.destroy();
	return url;
}

/**
 * Render all pages as thumbnail data URLs.
 * @param onProgress Called after each page: (done, total)
 */
export async function renderAllThumbnails(
	file: File,
	scale = 0.3,
	onProgress?: (done: number, total: number) => void
): Promise<string[]> {
	if (!browser) throw new Error('thumbnails must run in browser');
	const pdfjs = await getPdfJs();
	const bytes = await file.arrayBuffer();
	const pdfDoc = await pdfjs.getDocument({ data: bytes }).promise;
	const total = pdfDoc.numPages;
	const thumbs: string[] = [];
	for (let i = 1; i <= total; i++) {
		const page = await pdfDoc.getPage(i);
		const viewport = page.getViewport({ scale });
		const canvas = document.createElement('canvas');
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		const ctx = canvas.getContext('2d')!;
		await page.render({ canvasContext: ctx, viewport, canvas }).promise;
		thumbs.push(canvas.toDataURL('image/jpeg', 0.7));
		canvas.width = 0; canvas.height = 0;
		onProgress?.(i, total);
	}
	pdfDoc.destroy();
	return thumbs;
}
