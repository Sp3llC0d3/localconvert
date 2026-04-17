// Merges the 28 per-locale builds from `.build-tmp/build-<locale>/` into a
// single `build/` directory.
//
// Strategy:
//   - English (base locale) lives at root: copy everything from build-en/ → build/
//   - Each non-English locale X: copy only build-X/<X>/ → build/<X>/
//     (each X-pass prerendered /X/... URLs, which ended up under build-X/X/)
//   - All _app/immutable/ content merges at build/_app/immutable/
//     Content-hashed chunks with the same name MUST be byte-identical (fail-fast).
//
// Usage: node scripts/merge-locale-builds.js

import {
	readdirSync,
	readFileSync,
	statSync,
	copyFileSync,
	mkdirSync,
	existsSync,
	rmSync,
} from "fs";
import { join, relative } from "path";

const LOCALES = [
	"en",
	"es", "fr", "de", "it", "ba", "hr", "tr", "ja", "ko",
	"el", "id", "zh-Hans", "zh-Hant", "pt-BR", "ar", "hi", "ru",
	"vi", "pl", "nl", "th", "fa", "ms", "sv", "ro", "uk", "pt",
];
const TMP = ".build-tmp";
const OUT = "build";

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

/** Recursively walk a directory, yielding absolute file paths. */
function* walk(dir) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(full);
		else if (entry.isFile()) yield full;
	}
}

/** Copy a single file, creating parent dirs as needed. */
function copy(src, dest) {
	mkdirSync(join(dest, ".."), { recursive: true });
	copyFileSync(src, dest);
}

let copied = 0;
let dedupedIdentical = 0;
let skippedForeignLocale = 0;
let collisions = [];

/** Determine if a relative path is under a locale subdirectory the pass is not
 *  responsible for (e.g. build-ja/ contains root-level `favicon.svg` — we only
 *  accept its /ja/ subtree + shared /_app/ immutable content + truly static assets). */
function isLocaleSubtree(relPath, ownLocale) {
	// Paths like "ja/index.html" or "ja/about/index.html"
	const first = relPath.split("/")[0];
	return LOCALES.includes(first) && first !== ownLocale;
}

for (const locale of LOCALES) {
	const src = join(TMP, `build-${locale}`);
	if (!existsSync(src)) {
		throw new Error(`[merge] Missing ${src} — did the per-locale build fail?`);
	}

	for (const file of walk(src)) {
		const rel = relative(src, file).replace(/\\/g, "/");
		const destRel = rel;
		const dest = join(OUT, destRel);

		// Skip content belonging to OTHER locales (each pass only prerenders its
		// own locale URLs, but static assets at root are emitted by every pass).
		if (isLocaleSubtree(rel, locale)) {
			skippedForeignLocale++;
			continue;
		}

		// For English pass: emit ROOT-level pages (no locale prefix).
		// For non-English passes: only the `<locale>/...` subtree and the
		// shared `_app/immutable/` chunks should be emitted — everything else
		// would duplicate English root content.
		if (locale !== "en") {
			const first = rel.split("/")[0];
			const isOwnLocale = first === locale;
			const isShared = rel.startsWith("_app/");
			if (!isOwnLocale && !isShared) {
				skippedForeignLocale++;
				continue;
			}
		}

		if (existsSync(dest)) {
			const a = readFileSync(file);
			const b = readFileSync(dest);
			if (a.equals(b)) {
				dedupedIdentical++;
				continue;
			}
			// Immutable (content-hashed) chunks MUST be byte-identical — any collision
			// with different content is a real problem. Non-immutable artifacts like
			// `_app/version.json` or service-worker files legitimately vary per pass
			// (timestamps); let the first locale's (English) version win.
			if (rel.startsWith("_app/immutable/")) {
				collisions.push(destRel);
			}
			// else: silently keep the earlier (English) copy
			continue;
		}

		copy(file, dest);
		copied++;
	}
}

if (collisions.length) {
	console.error(
		`\n✗ MERGE FAILED: ${collisions.length} file(s) have conflicting content across per-locale builds:`,
	);
	for (const c of collisions.slice(0, 10)) console.error(`  - ${c}`);
	if (collisions.length > 10) console.error(`  … and ${collisions.length - 10} more`);
	console.error(
		`\nThis usually means a chunk was emitted by multiple locale passes with different content,\nwhich should never happen (hashes are content-derived). Investigate the colliding files.`,
	);
	process.exit(1);
}

// Sanity checks — the merged tree must contain the expected top-level pages.
const mustExist = ["index.html", "ja/index.html", "ar/index.html", "zh-Hans/index.html"];
for (const p of mustExist) {
	if (!existsSync(join(OUT, p))) {
		console.error(`✗ MERGE FAILED: ${join(OUT, p)} missing from merged build`);
		process.exit(1);
	}
}

console.log(
	`\n✓ Merge complete: ${copied} files copied, ${dedupedIdentical} identical duplicates deduped, ${skippedForeignLocale} cross-locale files skipped.`,
);
