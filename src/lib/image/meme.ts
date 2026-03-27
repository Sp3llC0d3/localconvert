import { loadImage, canvasToBlob } from './utils';

export interface MemeOptions {
	topText?: string;
	bottomText?: string;
}

function drawMemeText(ctx: CanvasRenderingContext2D, text: string, y: number, maxWidth: number) {
	const upper = text.toUpperCase();
	let fontSize = Math.min(maxWidth / 8, 72);

	// Shrink font until text fits
	ctx.font = `bold ${fontSize}px Impact, "Arial Black", sans-serif`;
	while (ctx.measureText(upper).width > maxWidth * 0.9 && fontSize > 16) {
		fontSize -= 2;
		ctx.font = `bold ${fontSize}px Impact, "Arial Black", sans-serif`;
	}

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.lineWidth = fontSize / 8;
	ctx.strokeStyle = '#000000';
	ctx.fillStyle = '#ffffff';
	ctx.lineJoin = 'round';
	ctx.strokeText(upper, maxWidth / 2, y);
	ctx.fillText(upper, maxWidth / 2, y);
}

export async function generateMeme(file: File, opts: MemeOptions): Promise<Blob> {
	const { topText = '', bottomText = '' } = opts;

	const img = await loadImage(file);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	canvas.width = img.width;
	canvas.height = img.height;
	ctx.drawImage(img, 0, 0);

	if (topText.trim()) {
		drawMemeText(ctx, topText, img.height * 0.08 + 20, img.width);
	}
	if (bottomText.trim()) {
		drawMemeText(ctx, bottomText, img.height * 0.92 - 20, img.width);
	}

	return canvasToBlob(canvas, 'png');
}
