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

	const size = circle ? Math.min(rect.width, rect.height) : 0;
	const w = circle ? size : rect.width;
	const h = circle ? size : rect.height;

	canvas.width = w;
	canvas.height = h;

	if (circle) {
		const r = size / 2;
		ctx.beginPath();
		ctx.arc(r, r, r, 0, Math.PI * 2);
		ctx.closePath();
		ctx.clip();
	}

	ctx.drawImage(img, rect.x, rect.y, w, h, 0, 0, w, h);

	return canvasToBlob(canvas, 'png');
}
