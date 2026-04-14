/**
 * Static format registry — pure data, no converter classes, no WASM.
 * Extracted from each converter's supportedFormats array so that
 * format metadata can be used on any page without pulling in heavy
 * converter dependencies.
 */

import type { Categories } from "$lib/types";

export interface FormatDef {
	name: string;
	fromSupported: boolean;
	toSupported: boolean;
	isNative: boolean;
	converter: string;
}

// ── ImageMagick formats ──────────────────────────────────────────
const magickFormats: FormatDef[] = [
	// manually tested
	{ name: ".png", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".jpeg", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".jpg", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".webp", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".gif", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".svg", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".jxl", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".avif", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".heic", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".heif", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".ico", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".bmp", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".cur", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ani", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".icns", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".nef", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".cr2", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".hdr", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".jpe", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".mat", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pbm", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pfm", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pgm", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pnm", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ppm", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".tiff", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".jfif", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".eps", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".psd", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	// raw camera formats
	{ name: ".arw", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".tif", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".dng", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".xcf", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".rw2", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".raf", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".orf", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".pef", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".mos", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".raw", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".dcr", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".crw", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".cr3", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".3fr", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".erf", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".mrw", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".mef", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".nrw", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".srw", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".sr2", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	{ name: ".srf", fromSupported: true, toSupported: false, isNative: true, converter: "imagemagick" },
	// magick-automated formats
	{ name: ".a", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".aai", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ai", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".art", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".avs", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".b", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".bgr", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".bgra", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".bgro", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".bmp2", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".bmp3", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".brf", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".cal", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".cals", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".cin", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".cip", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".cmyk", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".cmyka", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".dcx", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".dds", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".dpx", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".dxt1", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".dxt5", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".epdf", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".epi", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".eps2", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".eps3", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".epsf", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".epsi", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ept", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ept2", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ept3", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".exr", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".farbfeld", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".fax", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ff", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".fit", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".fits", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".fl32", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".fts", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ftxt", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".g", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".g3", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".g4", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".gif87", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".gray", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".graya", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".group4", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".hrz", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".icb", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".icon", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".info", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ipl", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".isobrl", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".isobrl6", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".j2c", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".j2k", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".jng", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".jp2", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".jpc", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".jpm", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".jps", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".map", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".miff", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".mng", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".mono", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".mtv", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".o", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".otb", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pal", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".palm", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pam", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pcd", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pcds", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pcl", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pct", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pcx", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pdb", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pgx", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".phm", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".picon", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pict", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".pjpeg", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".png00", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".png24", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".png32", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".png48", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".png64", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".png8", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ps", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ps1", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ps2", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ps3", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".psb", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ptif", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".qoi", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".r", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ras", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".rgb", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".rgba", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".rgbo", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".rgf", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".sgi", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".six", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".sixel", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".sparse-color", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".strimg", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".sun", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".svgz", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".tga", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".tiff64", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ubrl", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ubrl6", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".uil", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".uyvy", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".vda", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".vicar", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".viff", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".vips", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".vst", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".wbmp", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".wpg", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".xbm", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".xpm", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".xv", fromSupported: true, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ycbcr", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".ycbcra", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
	{ name: ".yuv", fromSupported: false, toSupported: true, isNative: true, converter: "imagemagick" },
];

// ── FFmpeg formats ───────────────────────────────────────────────
const ffmpegAudioFormats: FormatDef[] = [
	{ name: ".mp3", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".wav", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".flac", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".ogg", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".mogg", fromSupported: true, toSupported: false, isNative: true, converter: "ffmpeg" },
	{ name: ".oga", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".opus", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".aac", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".alac", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".m4a", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".caf", fromSupported: true, toSupported: false, isNative: true, converter: "ffmpeg" },
	{ name: ".wma", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".amr", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".ac3", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".aiff", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".aifc", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".aif", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".mp1", fromSupported: true, toSupported: false, isNative: true, converter: "ffmpeg" },
	{ name: ".mp2", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".mpc", fromSupported: true, toSupported: false, isNative: true, converter: "ffmpeg" },
	{ name: ".dsd", fromSupported: true, toSupported: false, isNative: true, converter: "ffmpeg" },
	{ name: ".dsf", fromSupported: true, toSupported: false, isNative: true, converter: "ffmpeg" },
	{ name: ".dff", fromSupported: true, toSupported: false, isNative: true, converter: "ffmpeg" },
	{ name: ".mqa", fromSupported: true, toSupported: false, isNative: true, converter: "ffmpeg" },
	{ name: ".au", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".m4b", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".voc", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
	{ name: ".weba", fromSupported: true, toSupported: true, isNative: true, converter: "ffmpeg" },
];

const ffmpegVideoFormats: FormatDef[] = [
	{ name: ".mkv", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".mp4", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".avi", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".mov", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".webm", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".ts", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".mts", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".m2ts", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".wmv", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".mpg", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".mpeg", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".flv", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".f4v", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".vob", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".m4v", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".3gp", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".3g2", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".mxf", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".ogv", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	{ name: ".divx", fromSupported: true, toSupported: true, isNative: false, converter: "ffmpeg" },
	// input-only video
	{ name: ".rm", fromSupported: true, toSupported: false, isNative: false, converter: "ffmpeg" },
	{ name: ".rmvb", fromSupported: true, toSupported: false, isNative: false, converter: "ffmpeg" },
];

// ── Pandoc formats ───────────────────────────────────────────────
const pandocFormats: FormatDef[] = [
	{ name: ".docx", fromSupported: true, toSupported: true, isNative: true, converter: "pandoc" },
	{ name: ".doc", fromSupported: true, toSupported: false, isNative: true, converter: "pandoc" },
	{ name: ".md", fromSupported: true, toSupported: true, isNative: true, converter: "pandoc" },
	{ name: ".html", fromSupported: true, toSupported: true, isNative: true, converter: "pandoc" },
	{ name: ".rtf", fromSupported: true, toSupported: false, isNative: true, converter: "pandoc" },
	{ name: ".csv", fromSupported: true, toSupported: false, isNative: true, converter: "pandoc" },
	{ name: ".tsv", fromSupported: true, toSupported: false, isNative: true, converter: "pandoc" },
	{ name: ".json", fromSupported: true, toSupported: false, isNative: true, converter: "pandoc" },
	{ name: ".rst", fromSupported: true, toSupported: true, isNative: true, converter: "pandoc" },
	{ name: ".epub", fromSupported: true, toSupported: true, isNative: true, converter: "pandoc" },
	{ name: ".odt", fromSupported: true, toSupported: true, isNative: true, converter: "pandoc" },
	{ name: ".docbook", fromSupported: true, toSupported: false, isNative: true, converter: "pandoc" },
];

// ── PDF converter formats ────────────────────────────────────────
const pdfFormats: FormatDef[] = [
	{ name: ".pdf", fromSupported: true, toSupported: true, isNative: true, converter: "pdf" },
	{ name: ".jpg", fromSupported: true, toSupported: true, isNative: true, converter: "pdf" },
	{ name: ".jpeg", fromSupported: true, toSupported: true, isNative: true, converter: "pdf" },
	{ name: ".png", fromSupported: true, toSupported: true, isNative: true, converter: "pdf" },
	{ name: ".webp", fromSupported: true, toSupported: false, isNative: true, converter: "pdf" },
];

// ── Doc-to-PDF converter formats ─────────────────────────────────
const docToPdfFormats: FormatDef[] = [
	{ name: ".docx", fromSupported: true, toSupported: false, isNative: false, converter: "doc-to-pdf" },
	{ name: ".doc", fromSupported: true, toSupported: false, isNative: false, converter: "doc-to-pdf" },
	{ name: ".xlsx", fromSupported: true, toSupported: false, isNative: false, converter: "doc-to-pdf" },
	{ name: ".xls", fromSupported: true, toSupported: false, isNative: false, converter: "doc-to-pdf" },
	{ name: ".ods", fromSupported: true, toSupported: false, isNative: false, converter: "doc-to-pdf" },
	{ name: ".csv", fromSupported: true, toSupported: false, isNative: false, converter: "doc-to-pdf" },
	{ name: ".pdf", fromSupported: false, toSupported: true, isNative: false, converter: "doc-to-pdf" },
];

// ── PDF-to-Doc converter formats ─────────────────────────────────
const pdfToDocFormats: FormatDef[] = [
	{ name: ".pdf", fromSupported: true, toSupported: false, isNative: false, converter: "pdf-to-doc" },
	{ name: ".docx", fromSupported: false, toSupported: true, isNative: false, converter: "pdf-to-doc" },
];

// ── Combined registry ────────────────────────────────────────────
export const formatRegistry: FormatDef[] = [
	...magickFormats,
	...ffmpegAudioFormats,
	...ffmpegVideoFormats,
	...pandocFormats,
	...pdfFormats,
	...docToPdfFormats,
	...pdfToDocFormats,
];

// ── Pre-computed categories ──────────────────────────────────────
export const categories: Categories = {
	audio: {
		formats: ffmpegAudioFormats
			.filter((f) => f.toSupported && f.isNative)
			.map((f) => f.name),
		canConvertTo: ["video"],
	},
	video: {
		formats: ffmpegVideoFormats
			.filter((f) => f.toSupported && !f.isNative)
			.map((f) => f.name),
		canConvertTo: ["audio"],
	},
	image: {
		formats: [
			".jpg", ".png", ".webp", ".avif", ".gif", ".svg", ".jxl",
			".ico", ".bmp", ".tiff", ".psd", ".eps", ".pdf",
		],
		canConvertTo: ["doc"],
	},
	doc: {
		formats: [
			...pandocFormats
				.filter((f) => f.toSupported && f.isNative)
				.map((f) => f.name),
			".pdf",
		],
		canConvertTo: [],
	},
};

// ── Helper functions ─────────────────────────────────────────────

/** Sort comparator: prefer native converter for a given format */
export const byNative = (format: string) => {
	return (a: { supportedFormats: { name: string; isNative: boolean }[] }, b: { supportedFormats: { name: string; isNative: boolean }[] }) => {
		const aFormat = a.supportedFormats.find((f: { name: string }) => f.name === format);
		const bFormat = b.supportedFormats.find((f: { name: string }) => f.name === format);
		if (aFormat && bFormat) {
			return aFormat.isNative ? -1 : 1;
		}
		return 0;
	};
};

// Lookup caches
const _audioFormats = new Set(ffmpegAudioFormats.map((f) => f.name));
const _videoFormats = new Set(ffmpegVideoFormats.map((f) => f.name));

/** Check if a format is an audio format (FFmpeg native) */
export function isAudioFormat(format: string): boolean {
	const f = format.startsWith(".") ? format : `.${format}`;
	return _audioFormats.has(f.toLowerCase());
}

/** Check if a format is a video format (FFmpeg non-native) */
export function isVideoFormat(format: string): boolean {
	const f = format.startsWith(".") ? format : `.${format}`;
	return _videoFormats.has(f.toLowerCase());
}

/** Get the converter name that handles a given input format (prefers native) */
export function getConverterNameForFormat(format: string): string | null {
	const f = format.startsWith(".") ? format.toLowerCase() : `.${format.toLowerCase()}`;
	// Prefer native converters
	const native = formatRegistry.find((r) => r.name === f && r.fromSupported && r.isNative);
	if (native) return native.converter;
	const any = formatRegistry.find((r) => r.name === f && r.fromSupported);
	return any?.converter ?? null;
}

/** Get all output format names for a given input format */
export function getOutputFormats(fromFormat: string): string[] {
	const f = fromFormat.startsWith(".") ? fromFormat.toLowerCase() : `.${fromFormat.toLowerCase()}`;
	const converterNames = new Set(
		formatRegistry.filter((r) => r.name === f && r.fromSupported).map((r) => r.converter),
	);
	const outputs = new Set<string>();
	for (const r of formatRegistry) {
		if (converterNames.has(r.converter) && r.toSupported && r.name !== f) {
			outputs.add(r.name);
		}
	}
	return [...outputs];
}
