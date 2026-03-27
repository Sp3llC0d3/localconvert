import { loadImage, canvasToBlob } from './utils';

export interface CropRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export async function cropImage(file: File, rect: CropRect, circle = false): Promise<Blob> {
	const img = await loadImage(file);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	const w = rect.width;
	const h = rect.height;

	if (circle) {
		const size = Math.min(w, h);
		// Center the circle within the crop rect
		const sx = rect.x + (w - size) / 2;
		const sy = rect.y + (h - size) / 2;
		canvas.width = size;
		canvas.height = size;
		const r = size / 2;
		ctx.beginPath();
		ctx.arc(r, r, r, 0, Math.PI * 2);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
	} else {
		canvas.width = w;
		canvas.height = h;
		ctx.drawImage(img, rect.x, rect.y, w, h, 0, 0, w, h);
	}

	return canvasToBlob(canvas, 'png');
}
