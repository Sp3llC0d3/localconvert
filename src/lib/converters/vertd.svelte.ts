import { log } from "$lib/logger";
import { VertFile } from "$lib/types";
import { Converter } from "./converter.svelte";

interface VertdError {
	type: "error";
	data: string;
}

interface VertdSuccess<T> {
	type: "success";
	data: T;
}

type VertdResponse<T> = VertdError | VertdSuccess<T>;

interface UploadResponse {
	id: string;
	auth: string;
	from: string;
	to: null;
	completed: false;
	totalFrames: number;
}

interface RouteMap {
	"/api/upload": UploadResponse;
}

const vertdFetch = async <U extends keyof RouteMap>(
	url: U,
	options: RequestInit,
): Promise<RouteMap[U]> => {
	const res = await fetch(`http://127.0.0.1:8080${url}`, options);
	const text = await res.text();
	let json: VertdResponse<RouteMap[U]> = null!;
	try {
		json = JSON.parse(text);
	} catch {
		throw new Error(text);
	}

	if (json.type === "error") {
		throw new Error(json.data);
	}

	return json.data as RouteMap[U];
};

// ws types
interface StartJobMessage {
	type: "startJob";
	data: {
		token: string;
		jobId: string;
		to: string;
	};
}

interface ErrorMessage {
	type: "error";
	data: {
		message: string;
	};
}

interface ProgressMessage {
	type: "progressUpdate";
	data: ProgressData;
}

interface CompletedMessage {
	type: "jobFinished";
	data: {
		jobId: string;
	};
}

interface FpsProgress {
	type: "fps";
	data: number;
}

interface FrameProgress {
	type: "frame";
	data: number;
}

type ProgressData = FpsProgress | FrameProgress;

type VertdMessage =
	| StartJobMessage
	| ErrorMessage
	| ProgressMessage
	| CompletedMessage;

export class VertdConverter extends Converter {
	public name = "vertd";
	public ready = $state(false);
	public reportsProgress = true;
	public supportedFormats = [".mkv", ".mp4", ".webm", ".avi"];
	private log: (msg: string) => void = () => {};

	constructor() {
		super();
		this.log = (msg) => log(["converters", this.name], msg);
		this.log("created converter");
		this.log("not rly sure how to implement this :P");
		this.ready = true;
	}

	public async convert(input: VertFile, to: string): Promise<VertFile> {
		if (to.startsWith(".")) to = to.slice(1);
		// POST http://localhost:8080/api/upload
		// multipart body, key is "file", value is the file
		const formData = new FormData();
		formData.append("file", input.file, input.name);
		// const uploadRes = await fetch("http://localhost:8080/api/upload", {
		// 	method: "POST",
		// 	body: formData,
		// });

		const uploadRes = await vertdFetch("/api/upload", {
			method: "POST",
			body: formData,
		});

		return new Promise((resolve, reject) => {
			const ws = new WebSocket(`ws://localhost:8080/api/ws`);
			ws.onopen = () => {
				this.log("opened ws connection to vertd");
				const msg: StartJobMessage = {
					type: "startJob",
					data: {
						jobId: uploadRes.id,
						token: uploadRes.auth,
						to,
					},
				};
				ws.send(JSON.stringify(msg));
				this.log("sent startJob message");
			};

			ws.onmessage = async (e) => {
				const msg: VertdMessage = JSON.parse(e.data);
				this.log(`received message ${msg.type}`);
				switch (msg.type) {
					case "progressUpdate": {
						const data = msg.data;
						if (data.type !== "frame") break;
						const frame = data.data;
						input.progress = (frame / uploadRes.totalFrames) * 100;
						break;
					}

					case "jobFinished": {
						this.log("job finished");
						ws.close();
						const url = `http://localhost:8080/api/download/${msg.data.jobId}/${uploadRes.auth}`;
						this.log(`downloading from ${url}`);
						const res = await fetch(url).then((res) => res.blob());
						resolve(
							new VertFile(
								new File([res], input.name),
								to,
								this,
								undefined,
							),
						);
						break;
					}

					case "error": {
						this.log(`error: ${msg.data.message}`);
						reject(msg.data.message);
					}
				}
			};
		});
	}
}
