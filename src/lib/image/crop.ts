import { loadImage, canvasToBlob } from './utils';

export interface CropRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export async function cropImage(file: File, rect: CropRect): Promise<Blob> {
	const img = await loadImage(file);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	canvas.width = rect.width;
	canvas.height = rect.height;

	ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);

	return canvasToBlob(canvas, 'png');
}
