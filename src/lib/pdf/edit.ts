import { PDFDocument, rgb } from 'pdf-lib';
import { canvasToPngBytes } from '$lib/util/text-to-png';

export interface TextEdit {
	type: 'text';
	text: string;
	x: number;       // PDF points from left
	y: number;       // PDF points from bottom (baseline)
	fontSize: number;
	color: [number, number, number]; // RGB 0-1
	fontFamily?: string; // CSS font-family, default 'sans-serif'
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

/**
 * Render a text edit to a transparent PNG for embedding.
 * Uses canvas for universal script support (Arabic, CJK, RTL, emoji).
 * Positions text with baseline at the bottom of the canvas so
 * drawImage(x, y) aligns with where drawText(x, y) would place the baseline.
 */
async function renderTextEdit(edit: TextEdit, scale: number): Promise<{
	pngBytes: Uint8Array;
	widthPt: number;
	heightPt: number;
}> {
	const fontFamily = edit.fontFamily || 'sans-serif';
	const scaledSize = edit.fontSize * scale;
	const cssColor = `rgb(${Math.round(edit.color[0] * 255)}, ${Math.round(edit.color[1] * 255)}, ${Math.round(edit.color[2] * 255)})`;

	// Measure text
	const measureCanvas = document.createElement('canvas');
	const mCtx = measureCanvas.getContext('2d')!;
	mCtx.font = `${scaledSize}px ${fontFamily}`;
	const metrics = mCtx.measureText(edit.text);
	measureCanvas.width = 0;
	measureCanvas.height = 0;

	const textW = Math.ceil(metrics.width) + 4;
	const ascent = Math.ceil(metrics.actualBoundingBoxAscent || scaledSize * 0.8);
	const descent = Math.ceil(metrics.actualBoundingBoxDescent || scaledSize * 0.2);
	const textH = ascent + descent + 4;

	// Create canvas — text baseline at (2, ascent+2) so baseline aligns with bottom edge minus descent
	const canvas = document.createElement('canvas');
	canvas.width = textW;
	canvas.height = textH;
	const ctx = canvas.getContext('2d')!;
	ctx.font = `${scaledSize}px ${fontFamily}`;
	ctx.fillStyle = cssColor;
	ctx.textBaseline = 'alphabetic';
	ctx.fillText(edit.text, 2, ascent + 2);

	const pngBytes = await canvasToPngBytes(canvas);
	canvas.width = 0;
	canvas.height = 0;

	return {
		pngBytes,
		widthPt: textW / scale,
		heightPt: textH / scale,
	};
}

export async function editPdf(
	file: File,
	pageIndex: number,
	edits: PdfEdit[],
): Promise<Uint8Array> {
	const bytes = await file.arrayBuffer();
	const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
	const page = doc.getPage(pageIndex);
	const scale = 3; // render resolution

	for (const edit of edits) {
		if (edit.type === 'text') {
			// Render text to PNG via canvas (supports all scripts)
			const { pngBytes, widthPt, heightPt } = await renderTextEdit(edit, scale);
			const img = await doc.embedPng(pngBytes);

			// Position: x = left edge, y = baseline position
			// drawImage y is bottom edge of image, baseline is at (heightPt - descent)
			// Approximate: place image so its top aligns with text top
			const descent = edit.fontSize * 0.2;
			page.drawImage(img, {
				x: edit.x,
				y: edit.y - descent,
				width: widthPt,
				height: heightPt,
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
