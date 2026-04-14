import type { Converter } from "./converter.svelte";

// Re-export static metadata for backward compatibility
export { categories, byNative, isAudioFormat, isVideoFormat, getConverterNameForFormat, formatRegistry } from "./format-metadata";

// ── Lazy converter loading ───────────────────────────────────────

let _converters: Converter[] | null = null;
let _loadPromise: Promise<Converter[]> | null = null;

/**
 * Lazily load and instantiate all converters.
 * Uses a singleton promise — safe to call multiple times.
 */
export async function loadConverters(): Promise<Converter[]> {
	if (_converters) return _converters;
	if (_loadPromise) return _loadPromise;

	_loadPromise = (async () => {
		const [
			{ MagickConverter },
			{ FFmpegConverter },
			{ PandocConverter },
			{ PdfConverter },
			{ DocToPdfConverter, PdfToDocConverter },
		] = await Promise.all([
			import("./magick.svelte"),
			import("./ffmpeg.svelte"),
			import("./pandoc.svelte"),
			import("./pdf.svelte"),
			import("./doc-pdf.svelte"),
		]);

		_converters = [
			new MagickConverter(),
			new FFmpegConverter(),
			new PandocConverter(),
			new PdfConverter(),
			new DocToPdfConverter(),
			new PdfToDocConverter(),
		];
		return _converters;
	})();

	return _loadPromise;
}

/** Sync access — returns null before loadConverters() resolves. */
export function getLoadedConverters(): Converter[] | null {
	return _converters;
}
