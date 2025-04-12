import * as wasiShim from "@bjorn3/browser_wasi_shim";

self.onmessage = async (e) => {
	const message = e.data;
	try {
		const res = await handleMessage(message);
		if (!res) return;
		self.postMessage({
			...res,
			id: message.id,
		});
	} catch (e) {
		self.postMessage({
			type: "error",
			error: e,
			id: message.id,
		});
	}
};

let wasm: ArrayBuffer = null!;

type Format =
	| ".md"
	| ".docx"
	| ".csv"
	| ".tsv"
	| ".json"
	| ".doc"
	| ".rtf"
	| ".rst"
	| ".epub"
	| ".odt"
	| ".docbook"
	| ".html"
	| ".markdown";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleMessage = async (message: any): Promise<any> => {
	switch (message.type) {
		case "load": {
			wasm = message.wasm;
			postMessage({ type: "loaded" });
			break;
		}

		case "convert": {
			try {
				// eslint-disable-next-line prefer-const
				let { to, file }: { to: Format; file: File } = message;
				const buf = new Uint8Array(await file.arrayBuffer());
				const args = `-f ${formatToReader(`.${file.name.split(".").pop() || ""}` as Format)} -t ${formatToReader(to)}`;
				const [result, stderr] = await pandoc(args, buf);
				if (stderr) {
					return {
						type: "error",
						error: stderr
							.replaceAll("\\n", "\n")
							.replaceAll('\\"', '"')
							.split('"')
							.slice(1, -1)
							.join('"'),
						errorKind: stderr.split(" ")[0],
					};
				}
				return {
					type: "finished",
					output: result,
				};
			} catch (e) {
				console.error(e);
				return { type: "error", error: e };
			}
		}
	}
};

const formatToReader = (format: Format): string => {
	switch (format) {
		case ".md":
		case ".markdown":
			return "markdown";
		case ".doc":
		case ".docx":
			return "docx";
		case ".csv":
			return "csv";
		case ".tsv":
			return "tsv";
		case ".docbook":
			return "docbook";
		case ".epub":
			return "epub";
		case ".html":
			return "html";
		case ".json":
			return "json";
		case ".odt":
			return "odt";
		case ".rtf":
			return "rtf";
		case ".rst":
			return "rst";
	}

	throw new Error(`Unsupported format: ${format}`);
};

async function pandoc(
	args_str: string,
	in_data: Uint8Array,
): Promise<[Uint8Array, string]> {
	if (!wasm) throw new Error("WASM not loaded");
	let stderr = "";
	const args = ["pandoc.wasm", "+RTS", "-H64m", "-RTS"];
	const env: string[] = [];
	const in_file = new wasiShim.File(in_data, {
		readonly: true,
	});
	const out_file = new wasiShim.File(new Uint8Array(), {
		readonly: false,
	});
	const map = new Map<string, wasiShim.File>([
		["in", in_file],
		["out", out_file],
	]);
	const fds = [
		new wasiShim.OpenFile(
			new wasiShim.File(new Uint8Array(), { readonly: true }),
		),
		wasiShim.ConsoleStdout.lineBuffered((msg) => {
			console.log(`[WASI stdout] ${msg}`);
		}),
		wasiShim.ConsoleStdout.lineBuffered((msg) => {
			console.warn(`[WASI stderr] ${msg}`);
			stderr += msg + "\n";
		}),
		new wasiShim.PreopenDirectory("/", map),
		new wasiShim.PreopenDirectory("/tmp", new Map()),
	];

	const wasi = new wasiShim.WASI(args, env, fds, { debug: true });
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { instance }: { instance: any } = await WebAssembly.instantiate(
		wasm,
		{
			wasi_snapshot_preview1: wasi.wasiImport,
		},
	);

	wasi.initialize(instance);

	instance.exports.__wasm_call_ctors();

	function memory_data_view() {
		return new DataView(instance.exports.memory.buffer);
	}

	const argc_ptr = instance.exports.malloc(4);
	memory_data_view().setUint32(argc_ptr, args.length, true);
	const argv = instance.exports.malloc(4 * (args.length + 1));
	for (let i = 0; i < args.length; ++i) {
		const arg = instance.exports.malloc(args[i].length + 1);
		new TextEncoder().encodeInto(
			args[i],
			new Uint8Array(instance.exports.memory.buffer, arg, args[i].length),
		);
		memory_data_view().setUint8(arg + args[i].length, 0);
		memory_data_view().setUint32(argv + 4 * i, arg, true);
	}
	memory_data_view().setUint32(argv + 4 * args.length, 0, true);
	const argv_ptr = instance.exports.malloc(4);
	memory_data_view().setUint32(argv_ptr, argv, true);

	instance.exports.hs_init_with_rtsopts(argc_ptr, argv_ptr);

	const args_ptr = instance.exports.malloc(args_str.length);
	new TextEncoder().encodeInto(
		args_str,
		new Uint8Array(
			instance.exports.memory.buffer,
			args_ptr,
			args_str.length,
		),
	);

	instance.exports.wasm_main(args_ptr, args_str.length);
	return [out_file.data, stderr];
}
