import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const locales = ["es","fr","de","it","ba","hr","tr","ja","ko","el","id","zh-Hans","zh-Hant","pt-BR","ar","hi","ru","vi","pl","nl","th","fa","ms","sv","ro","uk","pt"];

// Converter formats (same list as generate-sitemap.js)
const converterFormats = [
	"jpg","png","webp","gif","bmp","tiff","svg","avif","ico",
	"mp3","wav","ogg","flac","aac",
	"mp4","webm","mkv","avi","mov",
	"docx","md","html","epub","odt",
];

// Format pairs (same logic as generate-sitemap.js)
const imageFmts = ["jpg","png","webp","gif","bmp","tiff","svg","avif","ico"];
const imageFromFmts = [...imageFmts, "heic"];
const audioFmts = ["mp3","wav","ogg","flac","aac"];
const videoFmts = ["mp4","webm","mkv","avi","mov"];
const docFmts = ["docx","md","html","epub","odt"];
const videoToAudio = [
	["mp4","mp3"],["mp4","wav"],["mp4","aac"],["mp4","flac"],["mp4","ogg"],
	["webm","mp3"],["webm","wav"],["webm","ogg"],
	["mkv","mp3"],["mkv","wav"],["mkv","aac"],
	["avi","mp3"],["avi","wav"],
	["mov","mp3"],["mov","wav"],["mov","aac"],
];

function allPairs(fmts) {
	const p = [];
	for (const f of fmts) for (const t of fmts) if (f !== t) p.push(`/${f}-to-${t}/`);
	return p;
}
function imagePairs() {
	const p = [];
	for (const f of imageFromFmts) for (const t of imageFmts) if (f !== t) p.push(`/${f}-to-${t}/`);
	return p;
}

const converterPaths = converterFormats.map((f) => `/${f}-converter/`);
const pairPaths = [...imagePairs(), ...allPairs(audioFmts), ...allPairs(videoFmts), ...videoToAudio.map(([f,t]) => `/${f}-to-${t}/`), ...allPairs(docFmts)];

// Dynamic paths that need explicit locale entries (crawler can't discover via links)
const dynamicPaths = [...converterPaths, ...pairPaths];

// Generate: locale roots (crawler discovers static sub-pages via localized links)
// + locale × dynamic paths (converter & format-pair pages)
const localeEntries = locales.flatMap((l) => [
	`/${l}/`,
	...dynamicPaths.map((p) => `/${l}${p}`),
]);

// When PER_LOCALE_BUILD is set, restrict prerender to that single locale's URLs
// AND write output to a per-locale directory so passes don't overwrite each other.
// scripts/build-per-locale.js drives 28 passes this way.
const perLocale = process.env.PER_LOCALE_BUILD;
const prerenderEntries = perLocale === "en"
	? ["*", ...dynamicPaths]                             // base locale: no URL prefix
	: perLocale
		? [`/${perLocale}/`, ...dynamicPaths.map((p) => `/${perLocale}${p}`)]
		: ["*", ...localeEntries];                        // default: all locales (legacy single-pass)
const adapterOutDir = perLocale ? `.build-tmp/build-${perLocale}` : "build";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({ pages: adapterOutDir, assets: adapterOutDir }),
		inlineStyleThreshold: 12000,
		paths: {
			relative: false,
		},
		prerender: {
			entries: prerenderEntries,
			handleUnseenRoutes: perLocale ? "warn" : "fail",
		},
		env: {
			publicPrefix: "PUB_",
			privatePrefix: "PRI_",
		},
	},
};

export default config;
