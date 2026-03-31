import { FFmpeg } from '@ffmpeg/ffmpeg';

export interface GifOptions {
	fps?: number;       // frames per second (default 10)
	width?: number;     // output width in px (0 = original)
	startTime?: number; // start time in seconds
	duration?: number;  // duration in seconds (0 = full)
}

/**
 * Convert a video file to an animated GIF using FFmpeg WASM.
 */
export async function videoToGif(
	file: File,
	opts: GifOptions = {},
	onProgress?: (pct: number) => void,
): Promise<Blob> {
	const { fps = 10, width = 0, startTime = 0, duration = 0 } = opts;

	const ffmpeg = new FFmpeg();

	if (onProgress) {
		ffmpeg.on('progress', (p) => onProgress(Math.round(p.progress * 100)));
	}

	const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';
	await ffmpeg.load({
		coreURL: `${baseURL}/ffmpeg-core.js`,
		wasmURL: `${baseURL}/ffmpeg-core.wasm`,
	});

	const inputBuf = new Uint8Array(await file.arrayBuffer());
	await ffmpeg.writeFile('input', inputBuf);

	// Build filter string
	const filters: string[] = [];
	filters.push(`fps=${fps}`);
	if (width > 0) filters.push(`scale=${width}:-1`);
	const vf = filters.join(',');

	// Build command
	const cmd: string[] = ['-i', 'input'];
	if (startTime > 0) cmd.push('-ss', String(startTime));
	if (duration > 0) cmd.push('-t', String(duration));
	cmd.push('-vf', vf, '-loop', '0', 'output.gif');

	await ffmpeg.exec(cmd);

	const output = (await ffmpeg.readFile('output.gif')) as unknown as Uint8Array;
	ffmpeg.terminate();

	if (!output || output.length === 0) {
		throw new Error('FFmpeg produced empty output');
	}

	return new Blob([output], { type: 'image/gif' });
}
