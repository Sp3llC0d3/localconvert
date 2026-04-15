/**
 * patch-paraglide.cjs
 *
 * Pre-build script that enables Vite tree-shaking for Paraglide messages.
 * Runs AFTER `paraglide-js compile` and BEFORE `vite build`.
 *
 * What it does:
 * 1. Patches message file exports: `export { fn as "dotted.key" }` → `export { fn }`
 * 2. Generates _barrel.js with plain identifier re-exports
 * 3. Transforms m["key"]() calls in source files to direct named imports
 * 4. Resolves dynamic (m as any)[toolSeo[...]] patterns from tool-seo.ts
 * 5. Removes `import { m }` and patches messages.js
 */

const fs = require("fs");
const path = require("path");

const MESSAGES_DIR = path.resolve(__dirname, "../src/lib/paraglide/messages");
const MESSAGES_JS = path.resolve(__dirname, "../src/lib/paraglide/messages.js");
const SRC_DIR = path.resolve(__dirname, "../src");
const TOOL_SEO_PATH = path.resolve(__dirname, "../src/lib/data/tool-seo.ts");

// ── Phase 1: Patch Paraglide Exports ─────────────────────────────

function patchExports() {
	console.log("[patch-paraglide] Phase 1: Patching message exports...");
	const mapping = new Map(); // dotted key → plain identifier

	const files = fs.readdirSync(MESSAGES_DIR).filter(
		(f) => f.endsWith(".js") && f !== "_index.js" && f !== "_barrel.js",
	);

	let patched = 0;
	for (const file of files) {
		const filePath = path.join(MESSAGES_DIR, file);
		let source = fs.readFileSync(filePath, "utf-8");

		// Match: export { identifier as "dotted.key.name" }
		const exportMatch = /export\s*\{\s*(\w+)\s+as\s+"([^"]+)"\s*\}/.exec(source);
		if (!exportMatch) continue;

		const identifier = exportMatch[1];
		const dottedKey = exportMatch[2];
		mapping.set(dottedKey, identifier);

		// Replace string-named export with plain identifier export
		source = source.replace(
			/export\s*\{\s*\w+\s+as\s+"[^"]+"\s*\}/,
			`export { ${identifier} }`,
		);
		fs.writeFileSync(filePath, source);
		patched++;
	}

	console.log(`  Patched ${patched} message files, ${mapping.size} keys mapped`);
	return mapping;
}

// ── Phase 2: Generate Barrel File ────────────────────────────────

function generateBarrel(mapping, missingKeys) {
	console.log("[patch-paraglide] Phase 2: Generating barrel file...");

	const lines = ["/* Auto-generated barrel for tree-shaking. Do not edit. */"];

	for (const [dottedKey, identifier] of mapping) {
		const filename = dottedKey.replace(/\./g, "_");
		lines.push(`export { ${identifier} } from "./${filename}.js";`);
	}

	// Add stubs for missing keys (so imports don't fail)
	for (const key of missingKeys) {
		const identifier = key.replace(/\./g, "_");
		if (!mapping.has(key)) {
			lines.push(`export const ${identifier} = () => "";`);
			mapping.set(key, identifier);
		}
	}

	const barrelPath = path.join(MESSAGES_DIR, "_barrel.js");
	fs.writeFileSync(barrelPath, lines.join("\n") + "\n");
	console.log(`  Generated _barrel.js with ${mapping.size} exports (${missingKeys.size} stubs)`);
}

// ── Phase 3: Patch Source Files — Static Keys ────────────────────

function findSourceFiles(dir, ext) {
	const results = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			// Skip node_modules, .svelte-kit, paraglide output
			if (["node_modules", ".svelte-kit", "paraglide"].includes(entry.name)) continue;
			results.push(...findSourceFiles(fullPath, ext));
		} else if (ext.some((e) => entry.name.endsWith(e))) {
			results.push(fullPath);
		}
	}
	return results;
}

function patchStaticKeys(mapping) {
	console.log("[patch-paraglide] Phase 3: Patching static m[] calls...");

	const sourceFiles = findSourceFiles(SRC_DIR, [".svelte", ".ts", ".js"]);
	let totalReplacements = 0;
	let filesPatched = 0;

	for (const filePath of sourceFiles) {
		let code = fs.readFileSync(filePath, "utf-8");

		// Skip files that don't import m from paraglide
		if (
			!code.includes('from "$lib/paraglide/messages"') &&
			!code.includes("from '$lib/paraglide/messages'") &&
			!code.includes('from "$lib/paraglide/messages.js"') &&
			!code.includes("from '$lib/paraglide/messages.js'")
		)
			continue;

		// Collect all static m["key"]( and m['key']( patterns (including multi-line)
		const keysUsed = new Set();
		const doubleRe = /\bm\s*\[\s*"([^"]+)"\s*\]\s*\(/g;
		const singleRe = /\bm\s*\[\s*'([^']+)'\s*\]\s*\(/g;

		let match;
		while ((match = doubleRe.exec(code)) !== null) keysUsed.add(match[1]);
		while ((match = singleRe.exec(code)) !== null) keysUsed.add(match[1]);

		if (keysUsed.size === 0) continue;

		// Replace each m["key"]( with identifier( (handles multi-line whitespace)
		let replacements = 0;
		for (const key of keysUsed) {
			const identifier = mapping.get(key);
			if (!identifier) {
				console.warn(`  WARN: No mapping for key "${key}" in ${path.relative(SRC_DIR, filePath)}`);
				continue;
			}

			// Match m["key"]( or m[\n"key"\n]( with any whitespace
			const dqRe = new RegExp(`\\bm\\s*\\[\\s*"${key.replace(/\./g, '\\.')}"\\s*\\]\\s*\\(`, 'g');
			const sqRe = new RegExp(`\\bm\\s*\\[\\s*'${key.replace(/\./g, '\\.')}'\\s*\\]\\s*\\(`, 'g');

			let prev = code;
			code = code.replace(dqRe, `${identifier}(`);
			code = code.replace(sqRe, `${identifier}(`);
			if (code !== prev) {
				const count = (prev.match(dqRe) || []).length + (prev.match(sqRe) || []).length;
				replacements += count;
			}
		}

		if (replacements > 0) {
			// Add barrel import
			const identifiers = [...keysUsed]
				.map((k) => mapping.get(k))
				.filter(Boolean);

			// We'll add imports in Phase 5 after all transformations
			// For now, store the needed identifiers as a comment marker
			if (!code.includes("from \"$lib/paraglide/messages/_barrel.js\"") &&
				!code.includes("from '$lib/paraglide/messages/_barrel.js'")) {
				code = `/* __BARREL_IMPORTS__: ${identifiers.join(",")} */\n` + code;
			} else {
				// Append to existing marker
				const markerRe = /\/\* __BARREL_IMPORTS__: ([^*]+) \*\//;
				const existing = markerRe.exec(code);
				if (existing) {
					const combined = new Set([...existing[1].split(","), ...identifiers]);
					code = code.replace(markerRe, `/* __BARREL_IMPORTS__: ${[...combined].join(",")} */`);
				}
			}

			fs.writeFileSync(filePath, code);
			totalReplacements += replacements;
			filesPatched++;
		}
	}

	console.log(`  Patched ${filesPatched} files, ${totalReplacements} replacements`);
}

// ── Phase 4: Patch Dynamic Keys ──────────────────────────────────

function parseToolSeo() {
	if (!fs.existsSync(TOOL_SEO_PATH)) return new Map();

	const source = fs.readFileSync(TOOL_SEO_PATH, "utf-8");
	const tools = new Map(); // toolId → { faqKeys: string[], nameKeys: string[] }

	// More robust line-by-line parser
	const lines = source.split("\n");
	let currentTool = null;
	let faqKeys = [];
	let nameKeys = [];

	for (const line of lines) {
		const toolMatch = /^\t'([^']+)':\s*\{/.exec(line);
		if (toolMatch) {
			if (currentTool) tools.set(currentTool, { faqKeys: [...faqKeys], nameKeys: [...nameKeys] });
			currentTool = toolMatch[1];
			faqKeys = [];
			nameKeys = [];
		}

		if (line.includes("faqKeys:")) {
			const keyRe = /'([^']+)'/g;
			let km;
			while ((km = keyRe.exec(line)) !== null) {
				if (km[1].includes(".")) faqKeys.push(km[1]);
			}
		}

		if (line.includes("nameKey:")) {
			const nkm = /nameKey:\s*'([^']+)'/.exec(line);
			if (nkm) nameKeys.push(nkm[1]);
		}
	}
	if (currentTool) tools.set(currentTool, { faqKeys: [...faqKeys], nameKeys: [...nameKeys] });

	return tools;
}

function patchDynamicKeys(mapping) {
	console.log("[patch-paraglide] Phase 4: Patching dynamic m[] patterns...");

	const toolSeo = parseToolSeo();
	const sourceFiles = findSourceFiles(SRC_DIR, [".svelte", ".ts"]);
	let patchedFiles = 0;

	for (const filePath of sourceFiles) {
		let code = fs.readFileSync(filePath, "utf-8");
		let changed = false;
		const additionalImports = new Set();

		// 4a: (m as any)[toolSeo['toolId'].faqKeys[N]]?.()
		const faqRe = /\(m\s+as\s+any\)\[toolSeo\['([^']+)'\]\.faqKeys\[(\d+)\]\]\?\.\(\)/g;
		code = code.replace(faqRe, (match, toolId, idxStr) => {
			const idx = parseInt(idxStr);
			const tool = toolSeo.get(toolId);
			if (!tool || !tool.faqKeys[idx]) {
				console.warn(`  WARN: Cannot resolve toolSeo['${toolId}'].faqKeys[${idx}]`);
				return match;
			}
			const key = tool.faqKeys[idx];
			const identifier = mapping.get(key);
			if (!identifier) {
				console.warn(`  WARN: No mapping for resolved key "${key}"`);
				return match;
			}
			additionalImports.add(identifier);
			changed = true;
			return `${identifier}?.()`;
		});

		// 4a: (m as any)[r.nameKey]?.() — resolve from toolSeo
		if (code.includes("(m as any)[r.nameKey]?.()")) {
			const toolIdMatch = /toolSeo\['([^']+)'\]/.exec(code);
			if (toolIdMatch) {
				const tool = toolSeo.get(toolIdMatch[1]);
				if (tool && tool.nameKeys.length > 0) {
					const entries = [];
					for (const nk of tool.nameKeys) {
						const identifier = mapping.get(nk);
						if (identifier) {
							entries.push(`'${nk}': ${identifier}`);
							additionalImports.add(identifier);
						} else {
							console.warn(`  WARN: No mapping for nameKey "${nk}" in ${path.relative(SRC_DIR, filePath)}`);
						}
					}
					if (entries.length > 0) {
						const mapDecl = `\tconst __nkm = {${entries.join(", ")}};`;
						code = code.replace(
							/\(m\s+as\s+any\)\[r\.nameKey\]\?\.\(\)/g,
							"__nkm[r.nameKey]?.()",
						);
						// Insert map declaration after the last import line in <script>
						const lastImportIdx = code.lastIndexOf("\nimport ");
						if (lastImportIdx >= 0) {
							const lineEnd = code.indexOf("\n", lastImportIdx + 1);
							code = code.slice(0, lineEnd + 1) + mapDecl + "\n" + code.slice(lineEnd + 1);
						} else {
							// Fallback: insert after <script...>
							const scriptIdx = code.indexOf("<script");
							if (scriptIdx >= 0) {
								const scriptEnd = code.indexOf(">", scriptIdx);
								code = code.slice(0, scriptEnd + 1) + "\n" + mapDecl + code.slice(scriptEnd + 1);
							}
						}
						changed = true;
					} else {
						console.warn(`  WARN: No entries for nameKey map in ${path.relative(SRC_DIR, filePath)} (tool: ${toolIdMatch[1]})`);
					}
				}
			}
		}

		// 4b: m[`convert.archive_file.${type}`]() — store template literal
		if (code.includes("m[`convert.archive_file.${type}`]()")) {
			const keys = ["convert.archive_file.image", "convert.archive_file.audio", "convert.archive_file.doc", "convert.archive_file.video"];
			const entries = keys.map((k) => {
				const id = mapping.get(k);
				if (id) additionalImports.add(id);
				const short = k.split(".").pop();
				return id ? `${short}: ${id}` : null;
			}).filter(Boolean);

			if (entries.length > 0) {
				code = code.replace(
					/m\[`convert\.archive_file\.\$\{type\}`\]\(\)/g,
					`({${entries.join(", ")}})[type]()`,
				);
				changed = true;
			}
		}

		// 4c: (m as any)[`convert.dropdown.${category}`]?.() — FormatDropdown template literal
		if (code.includes("(m as any)[`convert.dropdown.${category}`]?.()")) {
			const keys = ["convert.dropdown.audio", "convert.dropdown.video", "convert.dropdown.doc", "convert.dropdown.image"];
			const entries = keys.map((k) => {
				const id = mapping.get(k);
				if (id) additionalImports.add(id);
				const short = k.split(".").pop();
				return id ? `${short}: ${id}` : null;
			}).filter(Boolean);

			if (entries.length > 0) {
				code = code.replace(
					/\(m\s+as\s+any\)\[`convert\.dropdown\.\$\{category\}`\]\?\.\(\)/g,
					`({${entries.join(", ")}})[category]?.()`,
				);
				changed = true;
			}
		}

		if (changed) {
			// Add additional imports to the marker
			if (additionalImports.size > 0) {
				const markerRe = /\/\* __BARREL_IMPORTS__: ([^*]+) \*\//;
				const existing = markerRe.exec(code);
				if (existing) {
					const combined = new Set([...existing[1].split(","), ...additionalImports]);
					code = code.replace(markerRe, `/* __BARREL_IMPORTS__: ${[...combined].join(",")} */`);
				} else {
					code = `/* __BARREL_IMPORTS__: ${[...additionalImports].join(",")} */\n` + code;
				}
			}

			fs.writeFileSync(filePath, code);
			patchedFiles++;
		}
	}

	console.log(`  Patched ${patchedFiles} files with dynamic patterns`);
}

// ── Phase 5: Finalize Imports ────────────────────────────────────

function finalizeImports() {
	console.log("[patch-paraglide] Phase 5: Finalizing imports...");

	const sourceFiles = findSourceFiles(SRC_DIR, [".svelte", ".ts", ".js"]);
	let filesFinalized = 0;
	let mImportsRemoved = 0;
	let mImportsKept = 0;

	for (const filePath of sourceFiles) {
		let code = fs.readFileSync(filePath, "utf-8");

		// Check for our marker
		const markerRe = /\/\* __BARREL_IMPORTS__: ([^*]+) \*\/\n?/;
		const markerMatch = markerRe.exec(code);
		if (!markerMatch) continue;

		const identifiers = [...new Set(markerMatch[1].split(",").filter(Boolean))];

		// Remove the marker
		code = code.replace(markerRe, "");

		// Build the barrel import line
		const barrelImport = `import { ${identifiers.join(", ")} } from "$lib/paraglide/messages/_barrel.js";`;

		// Check if there are remaining dynamic m[ patterns (unresolved)
		const hasUnresolvedM = /\bm\s*\[/.test(code) || /\(\s*m\s+as\s+any\s*\)\s*\[/.test(code);

		// Handle the original import { m } line
		const importRe = /import\s*\{([^}]*)\}\s*from\s*["'](\$lib\/paraglide\/messages(?:\.js)?)["']\s*;?/;
		const importMatch = importRe.exec(code);

		if (importMatch) {
			const importedNames = importMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
			const otherNames = importedNames.filter((n) => n !== "m");

			if (hasUnresolvedM) {
				// Keep m import, add barrel import alongside
				code = code.replace(importMatch[0], `${importMatch[0]}\n${barrelImport}`);
				mImportsKept++;
				console.warn(`  KEPT import { m } in ${path.relative(SRC_DIR, filePath)} (unresolved dynamic access)`);
			} else if (otherNames.length > 0) {
				// Keep other imports, remove m, add barrel import
				const keptImport = `import { ${otherNames.join(", ")} } from "${importMatch[2]}";`;
				code = code.replace(importMatch[0], `${keptImport}\n${barrelImport}`);
				mImportsRemoved++;
			} else {
				// Remove entire import, replace with barrel import
				code = code.replace(importMatch[0], barrelImport);
				mImportsRemoved++;
			}
		} else {
			// No existing paraglide import — just add barrel import after other imports
			const lastImportIdx = code.lastIndexOf("\nimport ");
			if (lastImportIdx >= 0) {
				const lineEnd = code.indexOf("\n", lastImportIdx + 1);
				code = code.slice(0, lineEnd + 1) + barrelImport + "\n" + code.slice(lineEnd + 1);
			} else {
				code = barrelImport + "\n" + code;
			}
		}

		fs.writeFileSync(filePath, code);
		filesFinalized++;
	}

	// Patch messages.js — remove `export * as m` if all m imports removed
	if (mImportsKept === 0 && fs.existsSync(MESSAGES_JS)) {
		let messagesCode = fs.readFileSync(MESSAGES_JS, "utf-8");
		messagesCode = messagesCode.replace(
			/export \* as m from ['"]\.\/messages\/_index\.js['"]\s*;?/,
			"// export * as m — removed for tree-shaking (use direct imports from _barrel.js)",
		);
		fs.writeFileSync(MESSAGES_JS, messagesCode);
		console.log("  Patched messages.js — removed export * as m");
	}

	console.log(`  Finalized ${filesFinalized} files`);
	console.log(`  Removed ${mImportsRemoved} import { m } statements`);
	if (mImportsKept > 0) {
		console.log(`  WARNING: ${mImportsKept} files still use import { m } — shared chunk contamination possible`);
	}
}

// ── Main ─────────────────────────────────────────────────────────

function collectMissingKeys() {
	// Pre-scan tool-seo.ts to find all keys that might be needed
	const toolSeo = parseToolSeo();
	const missing = new Set();

	for (const [, tool] of toolSeo) {
		for (const key of tool.faqKeys) {
			const filename = key.replace(/\./g, "_");
			if (!fs.existsSync(path.join(MESSAGES_DIR, `${filename}.js`))) {
				missing.add(key);
			}
		}
		for (const key of tool.nameKeys) {
			const filename = key.replace(/\./g, "_");
			if (!fs.existsSync(path.join(MESSAGES_DIR, `${filename}.js`))) {
				missing.add(key);
			}
		}
	}

	if (missing.size > 0) {
		console.log(`  Found ${missing.size} missing message keys (will generate stubs)`);
	}
	return missing;
}

function main() {
	console.log("[patch-paraglide] Starting pre-build patching...\n");

	if (!fs.existsSync(MESSAGES_DIR)) {
		console.error("ERROR: Messages directory not found:", MESSAGES_DIR);
		console.error("Run `paraglide-js compile` first.");
		process.exit(1);
	}

	const mapping = patchExports();         // Phase 1
	const missingKeys = collectMissingKeys();
	generateBarrel(mapping, missingKeys);   // Phase 2
	patchStaticKeys(mapping);               // Phase 3
	patchDynamicKeys(mapping);              // Phase 4
	finalizeImports();                      // Phase 5

	console.log("\n[patch-paraglide] Done! Ready for vite build.");
}

main();
