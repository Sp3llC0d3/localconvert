import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export interface WatermarkOptions {
	text: string;
	opacity?: number;       // 0–1, default 0.3
	fontSize?: number;      // default 60
	color?: [number, number, number]; // RGB 0–1, default [0.5, 0.5, 0.5]
	rotation?: number;      // degrees, default 45
	position?: 'center' | 'tile'; // default 'center'
}

export async function addWatermark(file: File, opts: WatermarkOptions): Promise<Uint8Array> {
	const {
		text,
		opacity = 0.3,
		fontSize = 60,
		color = [0.5, 0.5, 0.5],
		rotation = 45,
		position = 'center',
	} = opts;

	const bytes = await file.arrayBuffer();
	const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
	const font = await doc.embedFont(StandardFonts.HelveticaBold);
	const pages = doc.getPages();

	for (const page of pages) {
		const { width, height } = page.getSize();

		if (position === 'tile') {
			const tileW = width / 2;
			const tileH = height / 3;
			for (let row = 0; row < 3; row++) {
				for (let col = 0; col < 2; col++) {
					page.drawText(text, {
						x: col * tileW + tileW / 2 - (font.widthOfTextAtSize(text, fontSize / 2) / 2),
						y: row * tileH + tileH / 2,
						size: fontSize / 2,
						font,
						color: rgb(...color as [number, number, number]),
						opacity,
						rotate: degrees(rotation),
					});
				}
			}
		} else {
			// center
			const textWidth = font.widthOfTextAtSize(text, fontSize);
			page.drawText(text, {
				x: width / 2 - textWidth / 2,
				y: height / 2,
				size: fontSize,
				font,
				color: rgb(...color as [number, number, number]),
				opacity,
				rotate: degrees(rotation),
			});
		}
	}

	return doc.save();
}
