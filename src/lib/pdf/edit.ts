import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface TextEdit {
	type: 'text';
	text: string;
	x: number;       // PDF points from left
	y: number;       // PDF points from bottom
	fontSize: number;
	color: [number, number, number]; // RGB 0-1
}

export interface ImageEdit {
	type: 'image';
	imageBytes: Uint8Array;
	format: 'png' | 'jpg';
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface RectEdit {
	type: 'rect';
	x: number;
	y: number;
	width: number;
	height: number;
	color: [number, number, number];
	borderWidth: number;
	filled: boolean;
}

export type PdfEdit = TextEdit | ImageEdit | RectEdit;

export async function editPdf(
	file: File,
	pageIndex: number,
	edits: PdfEdit[],
): Promise<Uint8Array> {
	const bytes = await file.arrayBuffer();
	const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
	const page = doc.getPage(pageIndex);
	const font = await doc.embedFont(StandardFonts.Helvetica);

	for (const edit of edits) {
		if (edit.type === 'text') {
			page.drawText(edit.text, {
				x: edit.x,
				y: edit.y,
				size: edit.fontSize,
				font,
				color: rgb(...edit.color),
			});
		} else if (edit.type === 'image') {
			const img = edit.format === 'jpg'
				? await doc.embedJpg(edit.imageBytes)
				: await doc.embedPng(edit.imageBytes);
			page.drawImage(img, {
				x: edit.x,
				y: edit.y,
				width: edit.width,
				height: edit.height,
			});
		} else if (edit.type === 'rect') {
			if (edit.filled) {
				page.drawRectangle({
					x: edit.x,
					y: edit.y,
					width: edit.width,
					height: edit.height,
					color: rgb(...edit.color),
				});
			} else {
				page.drawRectangle({
					x: edit.x,
					y: edit.y,
					width: edit.width,
					height: edit.height,
					borderColor: rgb(...edit.color),
					borderWidth: edit.borderWidth,
				});
			}
		}
	}

	return doc.save();
}
