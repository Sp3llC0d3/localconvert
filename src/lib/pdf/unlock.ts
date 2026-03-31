import { PDFDocument } from 'pdf-lib';

/**
 * Remove password protection from a PDF.
 * Uses ignoreEncryption to bypass the lock, then re-saves without encryption.
 * The caller must ensure they have the right to unlock the file.
 */
export async function unlockPdf(file: File): Promise<Uint8Array> {
	try {
		const bytes = await file.arrayBuffer();
		const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
		return doc.save();
	} catch (e) {
		throw new Error('This PDF cannot be unlocked. It may be corrupted or use an unsupported encryption method.');
	}
}
