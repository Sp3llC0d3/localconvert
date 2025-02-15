import Vips from "wasm-vips";

const vipsPromise = Vips({ dynamicLibraries: [] });

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
			const image = vips.Image.newFromBuffer(
				await message.input.file.arrayBuffer(),
				`${message.to === ".gif" || message.to === ".webp" ? "[n=-1]" : ""}`,
			);
			const output = image.writeToBuffer(message.to);
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
