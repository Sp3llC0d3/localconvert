import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = true;

// ── Format metadata ──────────────────────────────────────────────────────────

const formatMeta: Record<string, { label: string; type: 'image' | 'audio' | 'video' | 'doc'; desc: string }> = {
	// Images
	jpg:  { label: 'JPG',  type: 'image', desc: 'a widely-used lossy image format, ideal for photos' },
	jpeg: { label: 'JPEG', type: 'image', desc: 'a widely-used lossy image format, ideal for photos' },
	png:  { label: 'PNG',  type: 'image', desc: 'a lossless image format with transparency support' },
	webp: { label: 'WEBP', type: 'image', desc: 'a modern image format with excellent compression' },
	gif:  { label: 'GIF',  type: 'image', desc: 'an image format that supports simple animations' },
	bmp:  { label: 'BMP',  type: 'image', desc: 'an uncompressed bitmap image format' },
	tiff: { label: 'TIFF', type: 'image', desc: 'a high-quality lossless image format used in publishing' },
	svg:  { label: 'SVG',  type: 'image', desc: 'a scalable vector graphics format' },
	heic: { label: 'HEIC', type: 'image', desc: 'the default photo format on iPhone and iPad' },
	avif: { label: 'AVIF', type: 'image', desc: 'a next-generation image format with superior compression' },
	ico:  { label: 'ICO',  type: 'image', desc: 'the icon format used by Windows and browsers' },
	// Audio
	mp3:  { label: 'MP3',  type: 'audio', desc: 'the most widely-supported lossy audio format' },
	wav:  { label: 'WAV',  type: 'audio', desc: 'an uncompressed, high-quality audio format' },
	ogg:  { label: 'OGG',  type: 'audio', desc: 'an open-source lossy audio format' },
	flac: { label: 'FLAC', type: 'audio', desc: 'a lossless audio format that preserves full quality' },
	aac:  { label: 'AAC',  type: 'audio', desc: 'a high-efficiency audio format used by Apple and YouTube' },
	m4a:  { label: 'M4A',  type: 'audio', desc: 'Apple\'s audio format based on AAC' },
	opus: { label: 'OPUS', type: 'audio', desc: 'a modern low-latency audio codec' },
	// Video
	mp4:  { label: 'MP4',  type: 'video', desc: 'the most universally compatible video format' },
	webm: { label: 'WEBM', type: 'video', desc: 'an open-source video format for the web' },
	mkv:  { label: 'MKV',  type: 'video', desc: 'a flexible container format that supports multiple streams' },
	avi:  { label: 'AVI',  type: 'video', desc: 'a classic Microsoft video container format' },
	mov:  { label: 'MOV',  type: 'video', desc: 'Apple\'s QuickTime video format' },
	// Docs
	docx: { label: 'DOCX', type: 'doc', desc: 'the standard Microsoft Word document format' },
	md:   { label: 'Markdown', type: 'doc', desc: 'a lightweight plain-text markup language' },
	html: { label: 'HTML', type: 'doc', desc: 'the standard markup language for web pages' },
	epub: { label: 'EPUB', type: 'doc', desc: 'the standard ebook format' },
	odt:  { label: 'ODT',  type: 'doc', desc: 'an open-source office document format' },
};

// ── Valid conversion pairs ───────────────────────────────────────────────────

// image pairs — heic is input-only (HEIC output not supported by ImageMagick)
const imageFmts = ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'avif', 'ico'];
const imageFromFmts = [...imageFmts, 'heic']; // heic can be source but not target
// audio pairs
const audioFmts = ['mp3', 'wav', 'ogg', 'flac', 'aac'];
// video pairs
const videoFmts = ['mp4', 'webm', 'mkv', 'avi', 'mov'];
// doc pairs
const docFmts = ['docx', 'md', 'html', 'epub', 'odt'];

function allPairs(fmts: string[]): [string, string][] {
	const pairs: [string, string][] = [];
	for (const from of fmts)
		for (const to of fmts)
			if (from !== to) pairs.push([from, to]);
	return pairs;
}

// High-value video→audio extractions
const videoToAudio: [string, string][] = [
	['mp4', 'mp3'], ['mp4', 'wav'], ['mp4', 'aac'], ['mp4', 'flac'], ['mp4', 'ogg'],
	['webm', 'mp3'], ['webm', 'wav'], ['webm', 'ogg'],
	['mkv', 'mp3'], ['mkv', 'wav'], ['mkv', 'aac'],
	['avi', 'mp3'], ['avi', 'wav'],
	['mov', 'mp3'], ['mov', 'wav'], ['mov', 'aac'],
];

// Build image pairs: all imageFromFmts → imageFmts (excludes heic as target)
function imagePairs(): [string, string][] {
	const pairs: [string, string][] = [];
	for (const from of imageFromFmts)
		for (const to of imageFmts)
			if (from !== to) pairs.push([from, to]);
	return pairs;
}

const allValidPairs: [string, string][] = [
	...imagePairs(),
	...allPairs(audioFmts),
	...allPairs(videoFmts),
	...videoToAudio,
	...allPairs(docFmts),
];

export const entries = () =>
	allValidPairs.map(([from, to]) => ({ from, to }));

// ── Page load ────────────────────────────────────────────────────────────────

export type PairInfo = {
	from: string;
	fromMeta: (typeof formatMeta)[string];
	to: string;
	toMeta: (typeof formatMeta)[string];
	headline: string;
	description: string;
	metaDescription: string;
};

export const load: PageLoad = ({ params }) => {
	const { from, to } = params;

	const fromMeta = formatMeta[from];
	const toMeta = formatMeta[to];

	if (!fromMeta || !toMeta) {
		error(404, `No converter found for "${from}" to "${to}"`);
	}

	const isVideoToAudio =
		fromMeta.type === 'video' && toMeta.type === 'audio';

	const headline = `Convert ${fromMeta.label} to ${toMeta.label} — Free & Private`;

	const description = isVideoToAudio
		? `Extract ${toMeta.label} audio from ${fromMeta.label} video files directly in your browser. No uploads, no accounts, completely free.`
		: `Convert ${fromMeta.label} to ${toMeta.label} online for free. ${fromMeta.label} is ${fromMeta.desc}; ${toMeta.label} is ${toMeta.desc}. All processing happens locally in your browser — your files never leave your device.`;

	const metaDescription = isVideoToAudio
		? `Free ${fromMeta.label} to ${toMeta.label} converter. Extract audio from video locally in your browser — no uploads, no limits.`
		: `Free ${fromMeta.label} to ${toMeta.label} converter. Convert ${from.toUpperCase()} to ${to.toUpperCase()} locally in your browser — no uploads, no watermarks, no file size limit.`;

	return { from, to, fromMeta, toMeta, headline, description, metaDescription } satisfies PairInfo & { from: string; to: string };
};
