// Injects <link rel="preload"> for critical font files into all prerendered HTML pages.
// Run after build: node scripts/inject-font-preloads.js

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = join(__dirname, '..', 'build');
const ASSETS_DIR = join(BUILD_DIR, '_app', 'immutable', 'assets');

// Find the 3 critical Latin font woff2 files (hashed names)
const files = readdirSync(ASSETS_DIR);
const criticalFonts = files.filter(f =>
	(f.startsWith('azeret-mono-latin-700-normal') && f.endsWith('.woff2')) ||
	(f.startsWith('lexend-latin-400-normal') && f.endsWith('.woff2')) ||
	(f.startsWith('lexend-latin-600-normal') && f.endsWith('.woff2'))
);

if (criticalFonts.length === 0) {
	console.log('No critical fonts found — skipping preload injection');
	process.exit(0);
}

const preloadTags = criticalFonts.map(f =>
	`<link rel="preload" href="/_app/immutable/assets/${f}" as="font" type="font/woff2" crossorigin>`
).join('\n\t\t');

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
	if (html.includes('rel="preload"') && html.includes('font/woff2')) continue; // already has preloads
	// Inject after <meta charset="utf-8">
	html = html.replace('<meta charset="utf-8" />', `<meta charset="utf-8" />\n\t\t${preloadTags}`);
	writeFileSync(file, html, 'utf8');
	count++;
}

console.log(`✓ Font preload tags injected into ${count} HTML files (${criticalFonts.length} fonts)`);
