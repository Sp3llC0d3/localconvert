// Runs Paraglide compile + patch + Vite build once per locale, with
// `experimentalStaticLocale` baked in so Vite can tree-shake 27/28 dispatch
// branches per message. Outputs go to `.build-tmp/build-<locale>/`.
// The separate merge script stitches them into a single `build/` directory.
//
// Usage: node scripts/build-per-locale.js

import { execSync } from "child_process";
import { existsSync, rmSync, mkdirSync, readFileSync } from "fs";

const LOCALES = [
	"en",
	"es", "fr", "de", "it", "ba", "hr", "tr", "ja", "ko",
	"el", "id", "zh-Hans", "zh-Hant", "pt-BR", "ar", "hi", "ru",
	"vi", "pl", "nl", "th", "fa", "ms", "sv", "ro", "uk", "pt",
];

const TMP = ".build-tmp";

if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const startAll = Date.now();

for (const [i, locale] of LOCALES.entries()) {
	const label = `[${i + 1}/${LOCALES.length}] ${locale}`;
	console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
	console.log(`  ${label}`);
	console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

	const start = Date.now();

	if (existsSync("src/lib/paraglide")) {
		rmSync("src/lib/paraglide", { recursive: true, force: true });
	}

	execSync(`node scripts/compile-paraglide.mjs ${locale}`, { stdio: "inherit" });
	execSync(`node scripts/patch-paraglide.cjs`, { stdio: "inherit" });

	// svelte.config.js reads PER_LOCALE_BUILD and sets adapter output to
	// .build-tmp/build-<locale> directly — no --outDir needed.
	const logFile = `${TMP}/build-${locale}.log`;
	try {
		execSync(
			`node --max-old-space-size=8192 ./node_modules/vite/bin/vite.js build > ${logFile} 2>&1`,
			{
				stdio: "inherit",
				shell: true,
				env: { ...process.env, PER_LOCALE_BUILD: locale },
			},
		);
	} catch (e) {
		console.error(`\n✗ ${label} build failed. Last 60 lines of log:`);
		try {
			console.error(readFileSync(logFile, "utf8").split("\n").slice(-60).join("\n"));
		} catch {}
		throw e;
	}

	console.log(`✓ ${label} completed in ${((Date.now() - start) / 1000).toFixed(1)}s`);
}

console.log(
	`\n✓ All ${LOCALES.length} locale builds complete in ${((Date.now() - startAll) / 1000 / 60).toFixed(1)} min`,
);
