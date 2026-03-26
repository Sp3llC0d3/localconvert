import { PDFDocument } from 'pdf-lib';

/** Extract a subset of pages (0-indexed) from a PDF and return as Uint8Array */
export async function splitPdf(file: File, pageIndices: number[]): Promise<Uint8Array> {
	const bytes = await file.arrayBuffer();
	const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
	const out = await PDFDocument.create();
	const pages = await out.copyPages(src, pageIndices);
	pages.forEach(p => out.addPage(p));
	return out.save();
}

/** Split every page into its own PDF, returns array of {name, bytes} */
export async function splitAllPages(file: File): Promise<{ name: string; bytes: Uint8Array }[]> {
	const bytes = await file.arrayBuffer();
	const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
	const total = src.getPageCount();
	const results: { name: string; bytes: Uint8Array }[] = [];
	const baseName = file.name.replace(/\.pdf$/i, '');
	for (let i = 0; i < total; i++) {
		const out = await PDFDocument.create();
		const [page] = await out.copyPages(src, [i]);
		out.addPage(page);
		results.push({ name: `${baseName}_page${i + 1}.pdf`, bytes: await out.save() });
	}
	return results;
}
