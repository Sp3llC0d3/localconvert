import { loadImage, canvasToBlob } from './utils';

export interface FilterOptions {
	brightness: number;  // 0-200, default 100
	contrast: number;    // 0-200, default 100
	saturation: number;  // 0-200, default 100
	sepia: number;       // 0-100, default 0
	hue: number;         // 0-360, default 0
}

export const DEFAULT_FILTERS: FilterOptions = {
	brightness: 100,
	contrast: 100,
	saturation: 100,
	sepia: 0,
	hue: 0,
};

export function buildFilterString(opts: FilterOptions): string {
	const parts: string[] = [];
	if (opts.brightness !== 100) parts.push(`brightness(${opts.brightness / 100})`);
	if (opts.contrast !== 100) parts.push(`contrast(${opts.contrast / 100})`);
	if (opts.saturation !== 100) parts.push(`saturate(${opts.saturation / 100})`);
	if (opts.sepia > 0) parts.push(`sepia(${opts.sepia / 100})`);
	if (opts.hue > 0) parts.push(`hue-rotate(${opts.hue}deg)`);
	return parts.join(' ') || 'none';
}

export async function applyFilters(file: File, opts: FilterOptions): Promise<Blob> {
	const img = await loadImage(file);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	canvas.width = img.width;
	canvas.height = img.height;

	ctx.filter = buildFilterString(opts);
	ctx.drawImage(img, 0, 0);

	return canvasToBlob(canvas, 'png');
}
