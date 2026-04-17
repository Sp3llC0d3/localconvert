// One-time script: converts "local" and "convert" text (Azeret Mono 700, size 38)
// into SVG <path> data, so Logo.svelte doesn't need to wait for the font to load
// at paint time (eliminates the LCP element render delay).
//
// Run: node scripts/generate-logo-paths.cjs
//
// Paste the output d="..." strings into src/lib/components/visual/svg/Logo.svelte

const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const wawoff = require('wawoff2');

const FONT_PATH = path.resolve(__dirname, '..', 'node_modules', '@fontsource', 'azeret-mono', 'files', 'azeret-mono-latin-700-normal.woff2');
const FONT_SIZE = 38;
const LETTER_SPACING_PX = -1; // SVG attribute letter-spacing="-1" in user units (= px at this zoom)
const ORIGIN_X = 68;
const ORIGIN_Y = 42;

async function main() {
	console.log('[generate-logo-paths] Reading', FONT_PATH);
	const woff2Buffer = fs.readFileSync(FONT_PATH);
	const ttfUint8 = await wawoff.decompress(woff2Buffer);
	// opentype.parse needs a pure ArrayBuffer; create a fresh one from the Uint8Array data
	const ttfArrayBuffer = new Uint8Array(ttfUint8).buffer;
	const font = opentype.parse(ttfArrayBuffer);

	console.log('[generate-logo-paths] Font:', font.names.fontFamily.en, font.names.fontSubfamily.en);

	// opentype's getPath letterSpacing is in em units (1 em = fontSize px).
	// SVG letter-spacing="-1" means subtract 1 px between each character.
	const letterSpacingEm = LETTER_SPACING_PX / FONT_SIZE;

	// Generate path for "local"
	const localPath = font.getPath('local', ORIGIN_X, ORIGIN_Y, FONT_SIZE, { letterSpacing: letterSpacingEm });
	const localD = localPath.toPathData(2);

	// Advance width of "local" accounting for letter spacing
	// In SVG, letter-spacing adds extra space AFTER each char. For 5 chars "local", that's 5 * -1 = -5 px.
	// But opentype's letterSpacing applies the same way in getAdvanceWidth:
	const localAdvance = font.getAdvanceWidth('local', FONT_SIZE, { letterSpacing: letterSpacingEm });

	// Generate path for "convert" starting where "local" ends
	const convertX = ORIGIN_X + localAdvance;
	const convertPath = font.getPath('convert', convertX, ORIGIN_Y, FONT_SIZE, { letterSpacing: letterSpacingEm });
	const convertD = convertPath.toPathData(2);

	console.log('\n=== LOCAL path (paste into <path d="..."/>) ===');
	console.log(localD);
	console.log('\n=== CONVERT path (paste into <path d="..."/> with opacity="0.45") ===');
	console.log(convertD);
	console.log('\nlocal advance:', localAdvance.toFixed(2), 'px → convert starts at x=' + convertX.toFixed(2));
}

main().catch((err) => {
	console.error('ERROR:', err);
	process.exit(1);
});
