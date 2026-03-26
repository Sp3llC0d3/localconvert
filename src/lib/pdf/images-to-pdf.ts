import { PDFDocument } from 'pdf-lib';
import { convertWebpToPng } from './utils';

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
	const doc = await PDFDocument.create();
	for (const file of files) {
		const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
		let imageBytes: Uint8Array;

		if (ext === 'webp') {
			imageBytes = await convertWebpToPng(file);
		} else {
			imageBytes = new Uint8Array(await file.arrayBuffer());
		}

		let image;
		if (ext === 'jpg' || ext === 'jpeg') {
			image = await doc.embedJpg(imageBytes);
		} else {
			// PNG (and converted WEBP)
			image = await doc.embedPng(imageBytes);
		}

		const page = doc.addPage([image.width, image.height]);
		page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
	}
	return doc.save();
}
