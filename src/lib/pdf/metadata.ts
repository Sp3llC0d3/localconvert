import { PDFDocument } from 'pdf-lib';

export interface PdfMetadata {
	title: string;
	author: string;
	subject: string;
	keywords: string;
	creator: string;
	producer: string;
	creationDate: string;
	modificationDate: string;
}

export async function getMetadata(file: File): Promise<PdfMetadata> {
	const bytes = await file.arrayBuffer();
	const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

	const fmtDate = (d: Date | undefined): string => {
		if (!d) return '';
		try { return d.toISOString().slice(0, 16); } catch { return ''; }
	};

	return {
		title: doc.getTitle() ?? '',
		author: doc.getAuthor() ?? '',
		subject: doc.getSubject() ?? '',
		keywords: (doc.getKeywords() ?? ''),
		creator: doc.getCreator() ?? '',
		producer: doc.getProducer() ?? '',
		creationDate: fmtDate(doc.getCreationDate()),
		modificationDate: fmtDate(doc.getModificationDate()),
	};
}

export async function updateMetadata(
	file: File,
	fields: Partial<Pick<PdfMetadata, 'title' | 'author' | 'subject' | 'keywords' | 'creator'>>,
): Promise<Uint8Array> {
	const bytes = await file.arrayBuffer();
	const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

	if (fields.title !== undefined) doc.setTitle(fields.title);
	if (fields.author !== undefined) doc.setAuthor(fields.author);
	if (fields.subject !== undefined) doc.setSubject(fields.subject);
	if (fields.keywords !== undefined) doc.setKeywords(fields.keywords.split(',').map((k) => k.trim()));
	if (fields.creator !== undefined) doc.setCreator(fields.creator);

	doc.setModificationDate(new Date());

	return doc.save();
}
