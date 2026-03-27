import { loadImage, canvasToBlob } from './utils';

export interface ImageWatermarkOptions {
	text: string;
	fontSize?: number;
	opacity?: number;
	color?: string;
	rotation?: number;
	position?: 'center' | 'tile';
}

export async function watermarkImage(file: File, opts: ImageWatermarkOptions): Promise<Blob> {
	const {
		text,
		fontSize = 48,
		opacity = 0.3,
		color = '#888888',
		rotation = -30,
		position = 'center',
	} = opts;

	const img = await loadImage(file);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	canvas.width = img.width;
	canvas.height = img.height;
	ctx.drawImage(img, 0, 0);

	ctx.globalAlpha = opacity;
	ctx.fillStyle = color;
	ctx.font = `bold ${fontSize}px sans-serif`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	if (position === 'tile') {
		const metric = ctx.measureText(text);
		const tileW = metric.width + 80;
		const tileH = fontSize * 3;
		for (let y = -canvas.height; y < canvas.height * 2; y += tileH) {
			for (let x = -canvas.width; x < canvas.width * 2; x += tileW) {
				ctx.save();
				ctx.translate(x, y);
				ctx.rotate((rotation * Math.PI) / 180);
				ctx.fillText(text, 0, 0);
				ctx.restore();
			}
		}
	} else {
		ctx.save();
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate((rotation * Math.PI) / 180);
		ctx.fillText(text, 0, 0);
		ctx.restore();
	}

	ctx.globalAlpha = 1;
	return canvasToBlob(canvas, 'png');
}
