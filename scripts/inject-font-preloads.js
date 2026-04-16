// Injects <link rel="preload"> for critical font files into all prerendered HTML pages.
// Latin fonts are preloaded on all pages; non-Latin locale fonts are preloaded only on matching locale pages.
// Run after build: node scripts/inject-font-preloads.js

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = join(__dirname, '..', 'build');
const ASSETS_DIR = join(BUILD_DIR, '_app', 'immutable', 'assets');

const allAssets = readdirSync(ASSETS_DIR);

// Find critical Latin font woff2 files (preloaded on ALL pages)
const latinFonts = allAssets.filter(f =>
	(f.startsWith('azeret-mono-latin-700-normal') && f.endsWith('.woff2')) ||
	(f.startsWith('lexend-latin-400-normal') && f.endsWith('.woff2')) ||
	(f.startsWith('lexend-latin-600-normal') && f.endsWith('.woff2'))
);

if (latinFonts.length === 0) {
	console.log('No critical fonts found — skipping preload injection');
	process.exit(0);
}

// Locale → font file prefixes (script-specific subsets only, not CJK which have 100+ chunks)
const localeFontMap = {
	ar: ['readex-pro-arabic-400-normal', 'readex-pro-arabic-600-normal'],
	fa: ['readex-pro-arabic-400-normal', 'readex-pro-arabic-600-normal'],
	ru: ['manrope-cyrillic-400-normal', 'manrope-cyrillic-600-normal'],
	uk: ['manrope-cyrillic-400-normal', 'manrope-cyrillic-600-normal'],
	el: ['manrope-greek-400-normal', 'manrope-greek-600-normal'],
	hi: ['mukta-devanagari-400-normal', 'mukta-devanagari-600-normal'],
	th: ['ibm-plex-sans-thai-thai-400-normal', 'ibm-plex-sans-thai-thai-600-normal'],
};

// Resolve locale font file names (with hashes) from the assets directory
const localeFontFiles = {};
for (const [locale, prefixes] of Object.entries(localeFontMap)) {
	const resolved = prefixes
		.map(prefix => allAssets.find(f => f.startsWith(prefix) && f.endsWith('.woff2')))
		.filter(Boolean);
	if (resolved.length > 0) {
		localeFontFiles[locale] = resolved;
	}
}

function makePreloadTag(filename) {
	return `<link rel="preload" href="/_app/immutable/assets/${filename}" as="font" type="font/woff2" crossorigin>`;
}

const latinPreloadTags = latinFonts.map(makePreloadTag).join('\n\t\t');

// Recursively find all HTML files in build/
function findHtml(dir) {
	const results = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) results.push(...findHtml(full));
		else if (entry.name.endsWith('.html')) results.push(full);
	}
	return results;
}

const htmlFiles = findHtml(BUILD_DIR);
let count = 0;
for (const file of htmlFiles) {
	let html = readFileSync(file, 'utf8');
	if (html.includes('rel="preload"') && html.includes('font/woff2')) continue;

	// Detect locale from lang attribute
	const langMatch = html.match(/lang="([^"]+)"/);
	const lang = langMatch ? langMatch[1] : 'en';

	// Build preload tags: Latin + locale-specific (if applicable)
	let preloadTags = latinPreloadTags;
	if (localeFontFiles[lang]) {
		preloadTags += '\n\t\t' + localeFontFiles[lang].map(makePreloadTag).join('\n\t\t');
	}

	html = html.replace('<meta charset="utf-8" />', `<meta charset="utf-8" />\n\t\t${preloadTags}`);
	writeFileSync(file, html, 'utf8');
	count++;
}

const localeCount = Object.keys(localeFontFiles).length;
console.log(`✓ Font preload tags injected into ${count} HTML files (${latinFonts.length} Latin fonts + ${localeCount} locale fonts)`);
