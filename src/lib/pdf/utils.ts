export { formatOutputName as getOutputName } from '$lib/util/filename';

export function downloadPdf(bytes: Uint8Array, filename: string): void {
	const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], { type: 'application/pdf' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	setTimeout(() => URL.revokeObjectURL(url), 1000);
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

export function validateFileSize(file: File): { ok: boolean; warning?: string } {
	const MB = 1024 * 1024;
	if (file.size > 200 * MB) {
		return { ok: false, warning: 'File too large (>200MB). May cause browser to crash.' };
	}
	if (file.size > 50 * MB) {
		return { ok: true, warning: 'Large file (>50MB). Processing may take a while.' };
	}
	return { ok: true };
}

// pdf-lib only supports JPG and PNG — WEBP must be converted first
export async function convertWebpToPng(file: File): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const objectUrl = URL.createObjectURL(file);
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, 0, 0);
			canvas.toBlob((blob) => {
				URL.revokeObjectURL(objectUrl);
				if (!blob) return reject(new Error('Failed to convert WEBP'));
				blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf)));
			}, 'image/png');
		};
		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error('Failed to load image'));
		};
		img.src = objectUrl;
	});
}

// Lazy pdf.js loader — call this instead of direct import
let _pdfjsLib: typeof import('pdfjs-dist') | null = null;

export async function getPdfJs(): Promise<typeof import('pdfjs-dist')> {
	if (_pdfjsLib) return _pdfjsLib;
	_pdfjsLib = await import('pdfjs-dist');
	// Use local worker to avoid CDN dependency and version mismatches
	_pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
	return _pdfjsLib;
}
