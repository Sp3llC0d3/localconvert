export function loadImage(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Failed to load image'));
		};
		img.src = url;
	});
}

export function canvasToBlob(canvas: HTMLCanvasElement, format: 'png' | 'jpeg' = 'png', quality = 0.92): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) return reject(new Error('Failed to export image'));
				resolve(blob);
			},
			`image/${format}`,
			quality,
		);
	});
}

export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateImageSize(file: File): { ok: boolean; warning?: string } {
	const MB = 1024 * 1024;
	if (file.size > 100 * MB) {
		return { ok: false, warning: 'File too large (>100 MB). May crash the browser.' };
	}
	if (file.size > 20 * MB) {
		return { ok: true, warning: 'Large file (>20 MB). Processing may be slow.' };
	}
	return { ok: true };
}

export { formatOutputName as getOutputName } from '$lib/util/filename';
