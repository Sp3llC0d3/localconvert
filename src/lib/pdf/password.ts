/**
 * PDF Password Protection using pdf-lib-plus-encrypt.
 * Uses AES encryption, compatible with all major PDF readers.
 */

export interface PasswordOptions {
	userPassword: string;
	ownerPassword?: string;
	permissions?: {
		printing?: boolean | 'lowResolution' | 'highResolution';
		modifying?: boolean;
		copying?: boolean;
		annotating?: boolean;
	};
}

export async function protectPdf(file: File, opts: PasswordOptions): Promise<Uint8Array> {
	// Dynamic import to avoid bundling the encryption lib on pages that don't need it
	const { PDFDocument } = await import('pdf-lib-plus-encrypt');

	const bytes = await file.arrayBuffer();
	const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

	await doc.encrypt({
		userPassword: opts.userPassword,
		ownerPassword: opts.ownerPassword || opts.userPassword,
		permissions: {
			printing: opts.permissions?.printing ?? 'highResolution',
			modifying: opts.permissions?.modifying ?? false,
			copying: opts.permissions?.copying ?? false,
			annotating: opts.permissions?.annotating ?? false,
		},
	});

	return doc.save();
}
