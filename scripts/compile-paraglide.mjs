// Programmatic Paraglide compile so we can pass `experimentalStaticLocale`
// (which the CLI does not expose as of paraglide-js v2.5.0).
//
// Usage:
//   node scripts/compile-paraglide.mjs            # default, no static locale
//   node scripts/compile-paraglide.mjs en         # bake static locale "en"

import { compile } from "@inlang/paraglide-js";
import { readFileSync, writeFileSync } from "fs";

const locale = process.argv[2];

await compile({
	project: "./project.inlang",
	outdir: "./src/lib/paraglide",
	strategy: ["url", "cookie", "localStorage", "baseLocale"],
	experimentalStaticLocale: locale ? `"${locale}"` : undefined,
});

if (locale) {
	// Paraglide emits `experimentalStaticLocale = assertIsLocale("en")` — a
	// runtime call that defeats Vite's constant-folding. Replace with the
	// literal so the locale dispatches can be tree-shaken.
	const runtimePath = "./src/lib/paraglide/runtime.js";
	const src = readFileSync(runtimePath, "utf8");
	const patched = src.replace(
		/export const experimentalStaticLocale = assertIsLocale\("([^"]+)"\);/,
		(_, l) => `export const experimentalStaticLocale = "${l}";`,
	);
	if (src === patched) {
		throw new Error("[compile-paraglide] FAILED to unwrap assertIsLocale in runtime.js");
	}
	writeFileSync(runtimePath, patched);
	console.log(
		`[compile-paraglide] Compiled with experimentalStaticLocale="${locale}" (unwrapped for tree-shaking)`,
	);
} else {
	console.log(`[compile-paraglide] Compiled (no static locale)`);
}
