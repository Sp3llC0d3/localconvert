// scripts/generate-sitemap.js
// Run: node scripts/generate-sitemap.js
// Generates sitemap-index.xml + sub-sitemaps with hreflang for 28 locales

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://localconvert.app';
const today = new Date().toISOString().split('T')[0];

// ── Locales (en = base, no prefix) ──────────────────────────────────────
const locales = ['en','es','fr','de','it','ba','hr','tr','ja','ko','el','id','zh-Hans','zh-Hant','pt-BR','ar','hi','ru','vi','pl','nl','th','fa','ms','sv','ro','uk','pt'];

function localizePath(path, locale) {
	return locale === 'en' ? path : `/${locale}${path}`;
}

// ── Converter pages ───────────────────────────────────────────────────────
const converterFormats = [
	'jpg','png','webp','gif','bmp','tiff','svg','avif','ico',
	'mp3','wav','ogg','flac','aac',
	'mp4','webm','mkv','avi','mov',
	'docx','md','html','epub','odt',
];

// ── Format-pair pages ─────────────────────────────────────────────────────
const imageFmts = ['jpg','png','webp','gif','bmp','tiff','svg','avif','ico'];
const imageFromFmts = [...imageFmts, 'heic'];
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

// ── Tool pages ────────────────────────────────────────────────────────────
const pdfToolPaths = [
	'/pdf-tools/','/pdf-tools/merge/','/pdf-tools/split/','/pdf-tools/rotate/',
	'/pdf-tools/organize/','/pdf-tools/images-to-pdf/','/pdf-tools/pdf-to-images/',
	'/pdf-tools/compress/','/pdf-tools/watermark/','/pdf-tools/page-numbers/',
	'/pdf-tools/metadata/','/pdf-tools/crop/','/pdf-tools/pdf-to-ppt/',
	'/pdf-tools/sign/','/pdf-tools/edit/','/pdf-tools/password/','/pdf-tools/unlock/',
	'/pdf-tools/pdf-to-text/','/pdf-tools/grayscale/',
	'/pdf-tools/from-docx/','/pdf-tools/from-xlsx/','/pdf-tools/to-docx/',
];

const imageToolPaths = [
	'/image-tools/','/image-tools/rotate/','/image-tools/crop/',
	'/image-tools/watermark/','/image-tools/meme/','/image-tools/batch/',
	'/image-tools/qr/','/image-tools/color-picker/','/image-tools/blur/',
	'/image-tools/filters/','/image-tools/video-to-gif/',
];

const devToolPaths = [
	'/dev-tools/','/dev-tools/json/','/dev-tools/hash/','/dev-tools/base64/',
	'/dev-tools/markdown/','/dev-tools/diff/','/dev-tools/word-count/',
	'/dev-tools/url-encode/','/dev-tools/css-minify/',
];

const staticPages = ['/', '/convert/', '/about/', '/privacy/', '/formats/'];

// ── Hreflang URL entry ────────────────────────────────────────────────────
function urlEntry(path, priority, changefreq) {
	const alternates = locales.map(loc =>
		`    <xhtml:link rel="alternate" hreflang="${loc}" href="${BASE}${localizePath(path, loc)}" />`
	).join('\n');
	const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${path}" />`;

	return `  <url>
    <loc>${BASE}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates}
${xDefault}
  </url>`;
}

// ── Generate sub-sitemap ──────────────────────────────────────────────────
function generateSubSitemap(name, paths, priority, changefreq) {
	// Generate entries for all locales of each path
	const entries = [];
	for (const path of paths) {
		for (const loc of locales) {
			const localizedPath = localizePath(path, loc);
			const alternates = locales.map(l =>
				`    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE}${localizePath(path, l)}" />`
			).join('\n');
			const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${path}" />`;

			entries.push(`  <url>
    <loc>${BASE}${localizedPath}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates}
${xDefault}
  </url>`);
		}
	}

	const xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
		...entries,
		'</urlset>',
	].join('\n');

	const outPath = join(__dirname, '..', 'static', `sitemap-${name}.xml`);
	writeFileSync(outPath, xml, 'utf8');
	return { name, count: paths.length * locales.length };
}

// ── Generate all sub-sitemaps ─────────────────────────────────────────────
const sitemaps = [
	generateSubSitemap('static', staticPages, '0.9', 'weekly'),
	generateSubSitemap('pdf-tools', pdfToolPaths, '0.8', 'monthly'),
	generateSubSitemap('image-tools', imageToolPaths, '0.8', 'monthly'),
	generateSubSitemap('dev-tools', devToolPaths, '0.8', 'monthly'),
	generateSubSitemap('converters', converterFormats.map(f => `/${f}-converter/`), '0.8', 'monthly'),
	generateSubSitemap('format-pairs', pairPages.map(([f, t]) => `/${f}-to-${t}/`), '0.7', 'monthly'),
];

// ── Generate sitemap index ────────────────────────────────────────────────
const indexXml = [
	'<?xml version="1.0" encoding="UTF-8"?>',
	'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
	...sitemaps.map(s => `  <sitemap>
    <loc>${BASE}/sitemap-${s.name}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`),
	'</sitemapindex>',
].join('\n');

const indexPath = join(__dirname, '..', 'static', 'sitemap.xml');
writeFileSync(indexPath, indexXml, 'utf8');

const totalUrls = sitemaps.reduce((sum, s) => sum + s.count, 0);
console.log(`✓ Sitemap index + ${sitemaps.length} sub-sitemaps written (${totalUrls} URLs across ${locales.length} locales)`);
sitemaps.forEach(s => console.log(`  ${s.name}: ${s.count} URLs`));
