/**
 * Shared filename formatting — applies the user's filename pattern
 * from Settings to all tool outputs (converter, PDF tools, image tools).
 *
 * The pattern is stored in localStorage as `settings.filenameFormat`
 * and supports: %name% (original base name), %date% (ISO date string).
 */

export function getFilenameFormat(): string {
	try {
		const settings = JSON.parse(localStorage.getItem('settings') ?? '{}');
		return settings.filenameFormat || 'LocalConvert.app_%name%';
	} catch {
		return 'LocalConvert.app_%name%';
	}
}

/**
 * Apply the user's filename pattern to a given original filename.
 * @param originalName  The original input file name (e.g. "document.pdf")
 * @param suffix        Tool-specific suffix (e.g. "merged", "compressed", "rotated90")
 * @param extension     Output file extension without dot (e.g. "pdf", "png")
 * @returns             Formatted filename (e.g. "LocalConvert_document_merged.pdf")
 */
export function formatOutputName(originalName: string, suffix: string, extension: string): string {
	const pattern = getFilenameFormat();
	const baseName = originalName.replace(/\.[^/.]+$/, '');
	const date = new Date().toISOString().slice(0, 10);

	let result = pattern
		.replace(/%name%/g, baseName)
		.replace(/%date%/g, date);

	// Append tool suffix if present
	if (suffix) {
		result += `_${suffix}`;
	}

	// Clean up any double/trailing underscores
	result = result.replace(/_+/g, '_').replace(/^_|_$/g, '');

	return `${result}.${extension}`;
}
