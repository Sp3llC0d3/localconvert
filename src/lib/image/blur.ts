import { loadImage, canvasToBlob } from './utils';

export interface BlurRegion {
	id: string;
	type: 'rect' | 'ellipse';
	x: number;      // image pixels, left of bounding box
	y: number;      // image pixels, top of bounding box
	width: number;
	height: number;
	opacity: number; // 0–1
}

// Keep the old interface for backwards compat
export interface BlurRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Apply blur to multiple regions of an image.
 * Supports rectangle and ellipse shapes with per-region opacity.
 */
export async function blurRegions(file: File, regions: BlurRegion[], radius: number): Promise<Blob> {
	const img = await loadImage(file);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	canvas.width = img.width;
	canvas.height = img.height;
	ctx.drawImage(img, 0, 0);

	for (const region of regions) {
		if (region.width < 2 || region.height < 2 || radius <= 0) continue;

		// Clamp to image bounds
		const rx = Math.max(0, Math.round(region.x));
		const ry = Math.max(0, Math.round(region.y));
		const rw = Math.min(img.width - rx, Math.round(region.width));
		const rh = Math.min(img.height - ry, Math.round(region.height));
		if (rw <= 0 || rh <= 0) continue;

		// Create padded canvas for blur (avoids edge artifacts)
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

		// Draw blurred region back onto main canvas
		const offsetX = rx - srcX;
		const offsetY = ry - srcY;

		ctx.save();
		ctx.globalAlpha = region.opacity;

		if (region.type === 'ellipse') {
			// Clip to ellipse shape
			ctx.beginPath();
			ctx.ellipse(
				rx + rw / 2, ry + rh / 2,  // center
				rw / 2, rh / 2,              // radii
				0, 0, Math.PI * 2
			);
			ctx.clip();
		}

		ctx.drawImage(padCanvas, offsetX, offsetY, rw, rh, rx, ry, rw, rh);
		ctx.restore();

		padCanvas.width = 0;
		padCanvas.height = 0;
	}

	return canvasToBlob(canvas, 'png');
}

/**
 * Legacy single-region blur (used by existing callers).
 */
export async function blurRegion(file: File, rect: BlurRect, radius: number): Promise<Blob> {
	return blurRegions(file, [{
		id: '0', type: 'rect',
		x: rect.x, y: rect.y,
		width: rect.width, height: rect.height,
		opacity: 1,
	}], radius);
}
