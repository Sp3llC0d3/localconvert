import { loadImage, canvasToBlob } from './utils';

export type RotationAngle = 90 | 180 | 270;

export async function rotateImage(file: File, angle: RotationAngle): Promise<Blob> {
	const img = await loadImage(file);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	const swap = angle === 90 || angle === 270;
	canvas.width = swap ? img.height : img.width;
	canvas.height = swap ? img.width : img.height;

	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.rotate((angle * Math.PI) / 180);
	ctx.drawImage(img, -img.width / 2, -img.height / 2);

	return canvasToBlob(canvas, 'png');
}
