import { PDFDocument } from 'pdf-lib';

export interface SignaturePosition {
	pageIndex: number;
	x: number;      // PDF points from left
	y: number;      // PDF points from bottom
	width: number;
	height: number;
}

export async function signPdf(
	file: File,
	signatureBytes: Uint8Array,
	position: SignaturePosition,
): Promise<Uint8Array> {
	const bytes = await file.arrayBuffer();
	const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
	const page = doc.getPage(position.pageIndex);

	const sigImage = await doc.embedPng(signatureBytes);

	page.drawImage(sigImage, {
		x: position.x,
		y: position.y,
		width: position.width,
		height: position.height,
	});

	return doc.save();
}
