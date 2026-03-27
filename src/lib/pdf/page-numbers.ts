import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export type NumberPosition =
	| 'bottom-center'
	| 'bottom-left'
	| 'bottom-right'
	| 'top-center'
	| 'top-left'
	| 'top-right';

export type NumberFormat = 'plain' | 'page-n' | 'n-of-total' | 'roman';

export interface PageNumbersOptions {
	position?: NumberPosition;
	format?: NumberFormat;
	startFrom?: number;
	fontSize?: number;
	color?: [number, number, number];
	skipFirstPage?: boolean;
}

function toRoman(num: number): string {
	const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
	const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
	let result = '';
	for (let i = 0; i < vals.length; i++) {
		while (num >= vals[i]) {
			result += syms[i];
			num -= vals[i];
		}
	}
	return result;
}

function formatNumber(index: number, total: number, format: NumberFormat): string {
	switch (format) {
		case 'page-n':
			return `Page ${index}`;
		case 'n-of-total':
			return `${index} / ${total}`;
		case 'roman':
			return toRoman(index);
		default:
			return `${index}`;
	}
}

export async function addPageNumbers(file: File, opts: PageNumbersOptions = {}): Promise<Uint8Array> {
	const {
		position = 'bottom-center',
		format = 'plain',
		startFrom = 1,
		fontSize = 12,
		color = [0, 0, 0],
		skipFirstPage = false,
	} = opts;

	const bytes = await file.arrayBuffer();
	const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const pages = doc.getPages();
	const total = pages.length - (skipFirstPage ? 1 : 0);
	const margin = 36; // 0.5 inch

	for (let i = 0; i < pages.length; i++) {
		if (skipFirstPage && i === 0) continue;

		const page = pages[i];
		const { width, height } = page.getSize();
		const num = i - (skipFirstPage ? 1 : 0) + startFrom;
		const label = formatNumber(num, total + startFrom - 1, format);
		const textWidth = font.widthOfTextAtSize(label, fontSize);

		let x: number;
		let y: number;

		// Horizontal position
		if (position.includes('left')) {
			x = margin;
		} else if (position.includes('right')) {
			x = width - margin - textWidth;
		} else {
			x = (width - textWidth) / 2;
		}

		// Vertical position
		if (position.startsWith('top')) {
			y = height - margin - fontSize;
		} else {
			y = margin;
		}

		page.drawText(label, {
			x,
			y,
			size: fontSize,
			font,
			color: rgb(...color as [number, number, number]),
		});
	}

	return doc.save();
}
