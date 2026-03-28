import { getPdfJs } from './utils';

/**
 * Extract all text from a PDF file using pdf.js getTextContent().
 * Returns the full text with page separators.
 */
export async function pdfToText(
	file: File,
	onProgress?: (done: number, total: number) => void,
): Promise<string> {
	const pdfjs = await getPdfJs();
	const buf = await file.arrayBuffer();
	const doc = await pdfjs.getDocument({ data: buf }).promise;
	const total = doc.numPages;
	const pages: string[] = [];

	for (let i = 1; i <= total; i++) {
		const page = await doc.getPage(i);
		const content = await page.getTextContent();
		const text = content.items
			.map((item: any) => ('str' in item ? item.str : ''))
			.join(' ')
			.replace(/\s+/g, ' ')
			.trim();
		pages.push(text);
		onProgress?.(i, total);
	}

	doc.destroy();
	return pages.join('\n\n');
}
