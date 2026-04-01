import { PDFDocument } from 'pdf-lib';
import { renderTextTile, canvasToPngBytes } from '$lib/util/text-to-png';

export interface WatermarkOptions {
	text: string;
	opacity?: number;       // 0–1, default 0.3
	fontSize?: number;      // default 60
	color?: string;         // CSS color, default '#888888'
	rotation?: number;      // degrees, default 45
	position?: 'center' | 'tile'; // default 'center'
	fontFamily?: string;    // CSS font-family, default 'sans-serif'
}

/**
 * Add a watermark to every page of a PDF.
 * Uses canvas-rendered text (supports all scripts: Arabic, CJK, RTL, emoji).
 * Text is embedded as a transparent PNG overlay — no font embedding needed.
 */
export async function addWatermark(file: File, opts: WatermarkOptions): Promise<Uint8Array> {
	const {
		text,
		opacity = 0.3,
		fontSize = 60,
		color = '#888888',
		rotation = 45,
		position = 'center',
		fontFamily = 'sans-serif',
	} = opts;

	const bytes = await file.arrayBuffer();
	const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
	const pages = doc.getPages();

	// Render the text tile once at 3× resolution
	const scale = 3;
	const tile = renderTextTile({ text, fontSize, rotation, color, fontFamily, scale });
	const pngBytes = await canvasToPngBytes(tile.canvas);
	const pngImage = await doc.embedPng(pngBytes);
	tile.canvas.width = 0;
	tile.canvas.height = 0;

	const imgW = tile.width;
	const imgH = tile.height;

	for (const page of pages) {
		const { width, height } = page.getSize();

		if (position === 'tile') {
			// Tile: measure unrotated text width for grid spacing (matching preview)
			const spacingCanvas = document.createElement('canvas');
			const sCtx = spacingCanvas.getContext('2d')!;
			sCtx.font = `bold ${fontSize}px ${fontFamily}`;
			const textWidth = sCtx.measureText(text).width;
			spacingCanvas.width = 0;
			spacingCanvas.height = 0;

			const tileW = textWidth + 60;
			const tileH = fontSize * 3;

			// Loop from negative to 2× page size for rotated overflow coverage
			for (let cy = -height; cy < height * 2; cy += tileH) {
				for (let cx = -width; cx < width * 2; cx += tileW) {
					// Canvas origin is top-left, PDF is bottom-left
					// Center the tile image on the grid point
					const pdfX = cx - imgW / 2;
					const pdfY = (height - cy) - imgH / 2;

					page.drawImage(pngImage, {
						x: pdfX,
						y: pdfY,
						width: imgW,
						height: imgH,
						opacity,
					});
				}
			}
		} else {
			// Center: place at page center
			page.drawImage(pngImage, {
				x: width / 2 - imgW / 2,
				y: height / 2 - imgH / 2,
				width: imgW,
				height: imgH,
				opacity,
			});
		}
	}

	return doc.save();
}
