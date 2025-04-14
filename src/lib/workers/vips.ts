import Vips from "wasm-vips";
import {
	initializeImageMagick,
	MagickFormat,
	MagickImage,
	MagickReadSettings,
} from "@imagemagick/magick-wasm";
import wasm from "@imagemagick/magick-wasm/magick.wasm?url";

const vipsPromise = Vips({
	dynamicLibraries: [],
});

const magickPromise = initializeImageMagick(new URL(wasm, import.meta.url));

const magickRequiredFormats = [".dng"];
const unsupportedFrom: string[] = [];
const unsupportedTo = [".dng"];

vipsPromise
	.then(() => {
		postMessage({ type: "loaded" });
	})
	.catch((error) => {
		postMessage({ type: "error", error });
	});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleMessage = async (message: any): Promise<any> => {
	const vips = await vipsPromise;
	switch (message.type) {
		case "convert": {
			if (!message.to.startsWith(".")) message.to = `.${message.to}`;
			if (unsupportedFrom.includes(message.input.from)) {
				return {
					type: "error",
					error: `Unsupported input format ${message.input.from}`,
				};
			}

			if (unsupportedTo.includes(message.to)) {
				return {
					type: "error",
					error: `Unsupported output format ${message.to}`,
				};
			}

			const buffer = await message.input.file.arrayBuffer();
			if (
				magickRequiredFormats.includes(message.input.from) ||
				magickRequiredFormats.includes(message.to)
			) {
				// only wait when we need to
				await magickPromise;
				const magick = MagickImage.create(
					new Uint8Array(buffer),
					new MagickReadSettings({
						format: message.input.from
							.slice(1)
							.toUpperCase() as MagickFormat,
					}),
				);

				const dngBuffer = await new Promise<Uint8Array>((resolve) =>
					magick.write(message.to.slice(1).toUpperCase(), (data) => {
						resolve(data);
					}),
				);

				return {
					type: "finished",
					output: dngBuffer,
				};
			}
			let image = vips.Image.newFromBuffer(buffer, "");

			// check if animated image & keep it animated when converting
			if (image.getTypeof("n-pages") > 0) {
				image = vips.Image.newFromBuffer(buffer, "[n=-1]");
			}

			const opts: { [key: string]: string } = {};
			if (typeof message.compression !== "undefined") {
				opts["Q"] = Math.min(100, message.compression + 1).toString();
			}

			const output = image.writeToBuffer(message.to, opts);
			image.delete();
			return {
				type: "finished",
				output: output.buffer,
			};
		}
	}
};

onmessage = async (e) => {
	const message = e.data;
	try {
		const res = await handleMessage(message);
		if (!res) return;
		postMessage({
			...res,
			id: message.id,
		});
	} catch (e) {
		postMessage({
			type: "error",
			error: e,
			id: message.id,
		});
	}
};
