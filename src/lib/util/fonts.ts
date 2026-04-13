/**
 * Locale-aware font loading — lazy-loads the right body font per script group.
 * Only the font for the active locale is fetched; all others stay unloaded.
 */

type FontDef = {
	family: string;
	imports: () => Promise<unknown>[];
};

const FONT_MAP: Record<string, FontDef> = {
	// Arabic script
	ar: {
		family: '"Readex Pro"',
		imports: () => [
			import("@fontsource/readex-pro/400.css"),
			import("@fontsource/readex-pro/600.css"),
		],
	},
	fa: {
		family: '"Readex Pro"',
		imports: () => [
			import("@fontsource/readex-pro/400.css"),
			import("@fontsource/readex-pro/600.css"),
		],
	},

	// Cyrillic
	ru: {
		family: '"Manrope"',
		imports: () => [
			import("@fontsource/manrope/400.css"),
			import("@fontsource/manrope/600.css"),
		],
	},
	uk: {
		family: '"Manrope"',
		imports: () => [
			import("@fontsource/manrope/400.css"),
			import("@fontsource/manrope/600.css"),
		],
	},

	// Greek
	el: {
		family: '"Manrope"',
		imports: () => [
			import("@fontsource/manrope/400.css"),
			import("@fontsource/manrope/600.css"),
		],
	},

	// Devanagari
	hi: {
		family: '"Mukta"',
		imports: () => [
			import("@fontsource/mukta/400.css"),
			import("@fontsource/mukta/600.css"),
		],
	},

	// Thai
	th: {
		family: '"IBM Plex Sans Thai"',
		imports: () => [
			import("@fontsource/ibm-plex-sans-thai/400.css"),
			import("@fontsource/ibm-plex-sans-thai/600.css"),
		],
	},

	// Japanese
	ja: {
		family: '"Zen Maru Gothic"',
		imports: () => [
			import("@fontsource/zen-maru-gothic/400.css"),
			import("@fontsource/zen-maru-gothic/500.css"),
		],
	},

	// Korean
	ko: {
		family: '"Noto Sans KR"',
		imports: () => [
			import("@fontsource/noto-sans-kr/400.css"),
			import("@fontsource/noto-sans-kr/600.css"),
		],
	},

	// Chinese Simplified
	"zh-Hans": {
		family: '"Noto Sans SC"',
		imports: () => [
			import("@fontsource/noto-sans-sc/400.css"),
			import("@fontsource/noto-sans-sc/600.css"),
		],
	},

	// Chinese Traditional
	"zh-Hant": {
		family: '"Noto Sans TC"',
		imports: () => [
			import("@fontsource/noto-sans-tc/400.css"),
			import("@fontsource/noto-sans-tc/600.css"),
		],
	},
};

// Default (Latin) — Lexend is loaded eagerly in app.scss
const LATIN_FAMILY = '"Lexend"';
const FALLBACK = "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

const loaded = new Set<string>();

export async function loadFontForLocale(locale: string): Promise<void> {
	const def = FONT_MAP[locale];

	if (!def) {
		// Latin locale — Lexend is already loaded, just ensure the CSS var is set
		document.documentElement.style.setProperty(
			"--font-body",
			`${LATIN_FAMILY}, ${FALLBACK}`,
		);
		return;
	}

	// Only import CSS once per font family
	if (!loaded.has(def.family)) {
		await Promise.all(def.imports());
		loaded.add(def.family);
	}

	document.documentElement.style.setProperty(
		"--font-body",
		`${def.family}, ${LATIN_FAMILY}, ${FALLBACK}`,
	);
}
