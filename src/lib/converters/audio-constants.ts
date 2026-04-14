/** Audio conversion constants — extracted from ffmpeg.svelte.ts to avoid pulling in WASM. */

export const CONVERSION_BITRATES = [
	"auto",
	320,
	256,
	192,
	128,
	96,
	64,
	32,
] as const;
export type ConversionBitrate = (typeof CONVERSION_BITRATES)[number];

export const SAMPLE_RATES = [
	"auto",
	"custom",
	"48000",
	"44100",
	"32000",
	"22050",
	"16000",
	"11025",
	"8000",
] as const;
export type SampleRate = (typeof SAMPLE_RATES)[number];
