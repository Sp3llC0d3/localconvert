import { getPdfJs, pdfDocumentOptions } from './utils';

export async function pdfToPpt(
	file: File,
	slideSize: '16:9' | '4:3' = '16:9',
	onProgress?: (current: number, total: number) => void,
): Promise<Blob> {
	const PptxGenJS = (await import('pptxgenjs')).default;
	const pdfjs = await getPdfJs();

	const buf = await file.arrayBuffer();
	const doc = await pdfjs.getDocument({ data: buf, ...pdfDocumentOptions }).promise;
	const total = doc.numPages;

	const pres = new PptxGenJS();
	if (slideSize === '4:3') {
		pres.defineLayout({ name: 'CUSTOM', width: 10, height: 7.5 });
		pres.layout = 'CUSTOM';
	}

	for (let i = 1; i <= total; i++) {
		const page = await doc.getPage(i);
		const viewport = page.getViewport({ scale: 2 });

		const canvas = document.createElement('canvas');
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		const ctx = canvas.getContext('2d')!;
		await page.render({ canvasContext: ctx, viewport }).promise;

		const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
		canvas.width = 0;
		canvas.height = 0;

		const slide = pres.addSlide();
		slide.addImage({
			data: dataUrl,
			x: 0,
			y: 0,
			w: '100%',
			h: '100%',
		});

		onProgress?.(i, total);
	}

	pdfDoc.destroy();
	return await pres.write({ outputType: 'blob' }) as Blob;
}
