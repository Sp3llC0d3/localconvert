import { loadImage, canvasToBlob } from './utils';

export interface BlurRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Apply a box blur to a rectangular region of an image.
 * Returns the full image with the region blurred.
 */
export async function blurRegion(file: File, rect: BlurRect, radius: number): Promise<Blob> {
	const img = await loadImage(file);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	canvas.width = img.width;
	canvas.height = img.height;
	ctx.drawImage(img, 0, 0);

	// Clamp rect to image bounds
	const rx = Math.max(0, Math.round(rect.x));
	const ry = Math.max(0, Math.round(rect.y));
	const rw = Math.min(img.width - rx, Math.round(rect.width));
	const rh = Math.min(img.height - ry, Math.round(rect.height));

	if (rw <= 0 || rh <= 0 || radius <= 0) return canvasToBlob(canvas, 'png');

	// Use OffscreenCanvas or temp canvas for the blurred region
	const regionCanvas = document.createElement('canvas');
	regionCanvas.width = rw;
	regionCanvas.height = rh;
	const regionCtx = regionCanvas.getContext('2d')!;

	// Draw the region, apply CSS blur filter, then draw back
	// We need extra padding to avoid edge artifacts from the blur
	const pad = radius * 2;
	const srcX = Math.max(0, rx - pad);
	const srcY = Math.max(0, ry - pad);
	const srcW = Math.min(img.width - srcX, rw + pad * 2);
	const srcH = Math.min(img.height - srcY, rh + pad * 2);

	const padCanvas = document.createElement('canvas');
	padCanvas.width = srcW;
	padCanvas.height = srcH;
	const padCtx = padCanvas.getContext('2d')!;

	padCtx.filter = `blur(${radius}px)`;
	padCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

	// Copy the blurred region (minus padding) back to the main canvas
	const offsetX = rx - srcX;
	const offsetY = ry - srcY;
	ctx.drawImage(padCanvas, offsetX, offsetY, rw, rh, rx, ry, rw, rh);

	return canvasToBlob(canvas, 'png');
}
