/**
 * Render styled text to a transparent PNG canvas.
 * Used by PDF tools (watermark, edit, sign) to embed text as an image,
 * which supports all scripts (Arabic, CJK, emoji, RTL) via the browser's
 * native text rendering — no custom font files needed.
 */

export interface TextRenderOptions {
	text: string;
	fontSize: number;        // PDF points
	rotation: number;        // degrees
	color: string;           // CSS color (e.g. '#888888')
	fontFamily: string;      // CSS font-family (e.g. 'sans-serif', 'CustomFont')
	scale: number;           // render resolution multiplier (3 = 3x)
}

export interface RenderedText {
	canvas: HTMLCanvasElement;
	/** Natural size in PDF points (before scale) */
	width: number;
	height: number;
}

/**
 * Render a single text string onto a transparent canvas, rotated and centered.
 * Returns the canvas and its natural size in PDF points.
 */
export function renderTextTile(opts: TextRenderOptions): RenderedText {
	const { text, fontSize, rotation, color, fontFamily, scale } = opts;
	const rad = (rotation * Math.PI) / 180;

	// Measure text at scaled size
	const measureCanvas = document.createElement('canvas');
	const mCtx = measureCanvas.getContext('2d')!;
	const scaledSize = fontSize * scale;
	mCtx.font = `bold ${scaledSize}px ${fontFamily}`;
	const metrics = mCtx.measureText(text);
	const textW = metrics.width;
	const textH = scaledSize * 1.2; // approximate line height

	// Rotated bounding box
	const cos = Math.abs(Math.cos(rad));
	const sin = Math.abs(Math.sin(rad));
	const bboxW = Math.ceil(textW * cos + textH * sin) + 4;
	const bboxH = Math.ceil(textW * sin + textH * cos) + 4;

	// Create canvas at rotated bounding box size
	const canvas = document.createElement('canvas');
	canvas.width = bboxW;
	canvas.height = bboxH;
	const ctx = canvas.getContext('2d')!;

	// Draw text centered and rotated
	ctx.translate(bboxW / 2, bboxH / 2);
	ctx.rotate(rad);
	ctx.font = `bold ${scaledSize}px ${fontFamily}`;
	ctx.fillStyle = color;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(text, 0, 0);

	// Natural size in PDF points
	const natW = bboxW / scale;
	const natH = bboxH / scale;

	measureCanvas.width = 0;
	measureCanvas.height = 0;

	return { canvas, width: natW, height: natH };
}

/**
 * Export a canvas to PNG bytes for embedding in pdf-lib.
 */
export async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
	const blob = await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((b) => {
			if (!b) return reject(new Error('Failed to export canvas'));
			resolve(b);
		}, 'image/png');
	});
	return new Uint8Array(await blob.arrayBuffer());
}
