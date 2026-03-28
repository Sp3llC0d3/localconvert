// scripts/generate-sitemap.js
// Run: node scripts/generate-sitemap.js
// Generates static/sitemap.xml from known routes

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://localconvert.app';

// ── Converter pages ───────────────────────────────────────────────────────
const converterFormats = [
	'jpg','png','webp','gif','bmp','tiff','svg','avif','ico',
	'mp3','wav','ogg','flac','aac',
	'mp4','webm','mkv','avi','mov',
	'docx','md','html','epub','odt',
];

// ── Format-pair pages ─────────────────────────────────────────────────────
const imageFmts = ['jpg','png','webp','gif','bmp','tiff','svg','avif','ico'];
const imageFromFmts = [...imageFmts, 'heic']; // heic input-only (no heic output)
const audioFmts = ['mp3','wav','ogg','flac','aac'];
const videoFmts = ['mp4','webm','mkv','avi','mov'];
const docFmts   = ['docx','md','html','epub','odt'];

function allPairs(fmts) {
	const pairs = [];
	for (const from of fmts)
		for (const to of fmts)
			if (from !== to) pairs.push([from, to]);
	return pairs;
}

function imagePairs() {
	const pairs = [];
	for (const from of imageFromFmts)
		for (const to of imageFmts)
			if (from !== to) pairs.push([from, to]);
	return pairs;
}

const videoToAudio = [
	['mp4','mp3'],['mp4','wav'],['mp4','aac'],['mp4','flac'],['mp4','ogg'],
	['webm','mp3'],['webm','wav'],['webm','ogg'],
	['mkv','mp3'],['mkv','wav'],['mkv','aac'],
	['avi','mp3'],['avi','wav'],
	['mov','mp3'],['mov','wav'],['mov','aac'],
];

const pairPages = [
	...imagePairs(),
	...allPairs(audioFmts),
	...allPairs(videoFmts),
	...videoToAudio,
	...allPairs(docFmts),
];

// ── PDF tool pages ─────────────────────────────────────────────────────────
const pdfToolPaths = [
	'/pdf-tools/','/pdf-tools/merge/','/pdf-tools/split/','/pdf-tools/rotate/',
	'/pdf-tools/organize/','/pdf-tools/images-to-pdf/','/pdf-tools/pdf-to-images/',
	'/pdf-tools/compress/','/pdf-tools/watermark/','/pdf-tools/page-numbers/',
	'/pdf-tools/metadata/','/pdf-tools/crop/','/pdf-tools/pdf-to-ppt/',
	'/pdf-tools/sign/','/pdf-tools/edit/','/pdf-tools/password/','/pdf-tools/unlock/',
];

// ── Image tool pages ──────────────────────────────────────────────────────
const imageToolPaths = [
	'/image-tools/','/image-tools/rotate/','/image-tools/crop/',
	'/image-tools/watermark/','/image-tools/meme/','/image-tools/batch/','/image-tools/qr/','/image-tools/color-picker/',
];

// ── Static pages ──────────────────────────────────────────────────────────
const staticPages = ['/', '/convert/', '/settings/', '/about/', '/privacy/'];

function urlEntry(path, priority, changefreq) {
	return `  <url>
    <loc>${BASE}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const lines = [
	'<?xml version="1.0" encoding="UTF-8"?>',
	'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
	...staticPages.map(p => urlEntry(p, p === '/' ? '1.0' : '0.8', 'weekly')),
	...converterFormats.map(f => urlEntry(`/${f}-converter/`, '0.8', 'monthly')),
	...pairPages.map(([from, to]) => urlEntry(`/${from}-to-${to}/`, '0.7', 'monthly')),
	...pdfToolPaths.map(p => urlEntry(p, '0.8', 'monthly')),
	...imageToolPaths.map(p => urlEntry(p, '0.8', 'monthly')),
	'</urlset>',
];

const xml = lines.join('\n');
const outPath = join(__dirname, '..', 'static', 'sitemap.xml');
writeFileSync(outPath, xml, 'utf8');
const total = pairPages.length + converterFormats.length + staticPages.length + pdfToolPaths.length + imageToolPaths.length;
console.log(`✓ sitemap.xml written with ${total} URLs`);
