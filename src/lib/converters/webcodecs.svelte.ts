import { VertFile } from "$lib/types";
import { Converter, FormatInfo } from "./converter.svelte";
import { log, error } from "$lib/util/logger";

// Check if WebCodecs API is available
function isWebCodecsSupported(): boolean {
	return (
		typeof VideoDecoder !== "undefined" &&
		typeof VideoEncoder !== "undefined" &&
		typeof AudioDecoder !== "undefined" &&
		typeof AudioEncoder !== "undefined"
	);
}

// Map output extension to Mediabunny output format class name
function getOutputFormatName(ext: string): string | null {
	switch (ext) {
		case ".mp4":
		case ".m4v":
			return "Mp4OutputFormat";
		case ".webm":
			return "WebMOutputFormat";
		case ".mkv":
			return "MatroskaOutputFormat";
		case ".ogg":
		case ".ogv":
			return "OggOutputFormat";
		case ".wav":
			return "WavOutputFormat";
		case ".mp3":
			return "Mp3OutputFormat";
		default:
			return null;
	}
}

export class WebCodecsConverter extends Converter {
	public name = "webcodecs";
	public reportsProgress = true;

	private supported = false;

	constructor() {
		const formats = [
			new FormatInfo("mp4", true, true, false),
			new FormatInfo("webm", true, true, false),
			new FormatInfo("mkv", true, true, false),
			new FormatInfo("ogg", true, true, false),
			new FormatInfo("ogv", true, true, false),
			new FormatInfo("m4v", true, true, false),
			new FormatInfo("mov", true, false, false),
			new FormatInfo("avi", true, false, false),
			new FormatInfo("flv", true, false, false),
			new FormatInfo("3gp", true, false, false),
			new FormatInfo("ts", true, false, false),
			new FormatInfo("wmv", true, false, false),
		];

		super("webcodecs", formats);

		this.supported = isWebCodecsSupported();

		if (this.supported) {
			log(["converters", this.name], "WebCodecs API available — GPU acceleration enabled");
			this.status = "ready";
		} else {
			log(["converters", this.name], "WebCodecs API not available — will fall back to FFmpeg");
			this.status = "not-ready";
		}
	}

	public async convert(input: VertFile, to: string): Promise<VertFile> {
		if (!to.startsWith(".")) to = `.${to}`;

		if (!this.supported) {
			throw new Error("WebCodecs not supported in this browser");
		}

		const outputFormatName = getOutputFormatName(to);
		if (!outputFormatName) {
			throw new Error(`WebCodecs: unsupported output format ${to}`);
		}

		log(
			["converters", this.name],
			`Converting ${input.name} from ${input.from} to ${to} using GPU acceleration`,
		);

		try {
			// Dynamic import to keep bundle small when WebCodecs isn't used
			const mediabunny = await import("mediabunny");
			const {
				Input,
				Output,
				Conversion,
				ALL_FORMATS,
				BlobSource,
				BufferTarget,
				Mp4OutputFormat,
			} = mediabunny;

			// Get the right output format constructor
			let outputFormat: any;
			switch (outputFormatName) {
				case "Mp4OutputFormat":
					outputFormat = new (mediabunny as any).Mp4OutputFormat();
					break;
				case "WebMOutputFormat":
					outputFormat = new (mediabunny as any).WebMOutputFormat();
					break;
				case "MatroskaOutputFormat":
					outputFormat = new (mediabunny as any).MatroskaOutputFormat();
					break;
				case "OggOutputFormat":
					outputFormat = new (mediabunny as any).OggOutputFormat();
					break;
				case "WavOutputFormat":
					outputFormat = new (mediabunny as any).WavOutputFormat();
					break;
				case "Mp3OutputFormat":
					outputFormat = new (mediabunny as any).Mp3OutputFormat();
					break;
				default:
					throw new Error(`Unknown output format: ${outputFormatName}`);
			}

			const target = new BufferTarget();

			const inputObj = new Input({
				source: new BlobSource(input.file),
				formats: ALL_FORMATS,
			});

			const outputObj = new Output({
				format: outputFormat,
				target: target,
			});

			const conversion = await Conversion.init({
				input: inputObj,
				output: outputObj,
			});

			// Track progress
			if (conversion.progress !== undefined) {
				const progressInterval = setInterval(() => {
					if (conversion.progress !== undefined) {
						input.progress = conversion.progress;
					}
				}, 200);

				try {
					await conversion.execute();
				} finally {
					clearInterval(progressInterval);
				}
			} else {
				await conversion.execute();
			}

			input.progress = 1;

			const buffer = target.buffer;
			if (!buffer) {
				throw new Error("WebCodecs conversion produced no output");
			}

			const outputFileName =
				input.name.split(".").slice(0, -1).join(".") + to;

			log(
				["converters", this.name],
				`Successfully converted ${input.name} to ${to} using GPU acceleration`,
			);

			return new VertFile(
				new File([buffer], outputFileName),
				to,
			);
		} catch (err: any) {
			error(
				["converters", this.name],
				`WebCodecs conversion failed: ${err.message}`,
			);
			throw err;
		}
	}

	public async cancel(input: VertFile): Promise<void> {
		// WebCodecs conversions can't easily be cancelled mid-stream
		log(["converters", this.name], `Cancel requested for ${input.name}`);
	}
}
