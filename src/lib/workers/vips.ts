import Vips from "wasm-vips";

const vipsPromise = Vips({
	dynamicLibraries: [],
});

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
			const buffer = await message.input.file.arrayBuffer();
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
