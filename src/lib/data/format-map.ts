import { converters } from '$lib/converters';

// Video formats that support GPU acceleration via WebCodecs
const GPU_INPUT_FORMATS = new Set(['.mp4', '.webm', '.mkv', '.ogg', '.ogv', '.m4v', '.mov', '.avi', '.flv', '.3gp', '.ts', '.wmv']);
const GPU_OUTPUT_FORMATS = new Set(['.mp4', '.m4v', '.mov', '.3gp', '.webm']);

export interface FormatEntry {
	name: string;
	displayName: string;
	category: 'image' | 'audio' | 'video' | 'doc';
	canBeInput: boolean;
	canBeOutput: boolean;
	gpuAccelerated: boolean;
	outputFormats: string[];
	inputFromFormats: string[];
}

export interface CategoryInfo {
	label: string;
	color: string;
	formats: FormatEntry[];
	inputCount: number;
	outputCount: number;
}

function getCategory(converterName: string, isNative: boolean): 'image' | 'audio' | 'video' | 'doc' {
	if (converterName === 'imagemagick' || converterName === 'pdf') return 'image';
	if (converterName === 'ffmpeg') return isNative ? 'audio' : 'video';
	if (converterName === 'pandoc') return 'doc';
	return 'image';
}

function buildFormatMap() {
	const map = new Map<string, FormatEntry>();

	for (const converter of converters) {
		const inputFormats = converter.supportedFormats.filter(f => f.fromSupported);
		const outputFormats = converter.supportedFormats.filter(f => f.toSupported);

		for (const fmt of converter.supportedFormats) {
			const key = fmt.name;
			const category = getCategory(converter.name, fmt.isNative);

			if (!map.has(key)) {
				map.set(key, {
					name: fmt.name,
					displayName: fmt.name.replace(/^\./, '').toUpperCase(),
					category,
					canBeInput: fmt.fromSupported,
					canBeOutput: fmt.toSupported,
					gpuAccelerated: GPU_INPUT_FORMATS.has(fmt.name) || GPU_OUTPUT_FORMATS.has(fmt.name),
					outputFormats: [],
					inputFromFormats: [],
				});
			}

			const entry = map.get(key)!;
			if (fmt.fromSupported) entry.canBeInput = true;
			if (fmt.toSupported) entry.canBeOutput = true;

			// If this format can be input in this converter, it can output to all toSupported formats
			if (fmt.fromSupported) {
				for (const out of outputFormats) {
					if (out.name !== fmt.name && !entry.outputFormats.includes(out.name)) {
						entry.outputFormats.push(out.name);
					}
				}
			}
		}
	}

	// Build reverse lookup: for each format, find what can convert TO it
	for (const [key, entry] of map) {
		for (const outName of entry.outputFormats) {
			const outEntry = map.get(outName);
			if (outEntry && !outEntry.inputFromFormats.includes(key)) {
				outEntry.inputFromFormats.push(key);
			}
		}
	}

	return map;
}

const _map = buildFormatMap();

export const formatMap: Record<string, FormatEntry> = Object.fromEntries(_map);

export const formatsByCategory: Record<string, FormatEntry[]> = {
	image: [..._map.values()].filter(f => f.category === 'image'),
	audio: [..._map.values()].filter(f => f.category === 'audio'),
	video: [..._map.values()].filter(f => f.category === 'video'),
	doc: [..._map.values()].filter(f => f.category === 'doc'),
};

export const categoryMeta: Record<string, CategoryInfo> = {
	image: {
		label: 'Images',
		color: 'blue',
		formats: formatsByCategory.image,
		inputCount: formatsByCategory.image.filter(f => f.canBeInput).length,
		outputCount: formatsByCategory.image.filter(f => f.canBeOutput).length,
	},
	audio: {
		label: 'Audio',
		color: 'purple',
		formats: formatsByCategory.audio,
		inputCount: formatsByCategory.audio.filter(f => f.canBeInput).length,
		outputCount: formatsByCategory.audio.filter(f => f.canBeOutput).length,
	},
	video: {
		label: 'Video',
		color: 'red',
		formats: formatsByCategory.video,
		inputCount: formatsByCategory.video.filter(f => f.canBeInput).length,
		outputCount: formatsByCategory.video.filter(f => f.canBeOutput).length,
	},
	doc: {
		label: 'Documents',
		color: 'green',
		formats: formatsByCategory.doc,
		inputCount: formatsByCategory.doc.filter(f => f.canBeInput).length,
		outputCount: formatsByCategory.doc.filter(f => f.canBeOutput).length,
	},
};

export const allFormats = [..._map.values()];
export const allInputFormats = allFormats.filter(f => f.canBeInput);
export const totalFormatCount = allFormats.length;
