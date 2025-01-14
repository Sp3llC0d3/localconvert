import { browser } from "$app/environment";
import { converters } from "$lib/converters";
import { error, log } from "$lib/logger";
import { VertFile } from "$lib/types";
import JSCookie from "js-cookie";
import jsmediatags from "jsmediatags";
import type { TagType } from "jsmediatags/types";
import { writable } from "svelte/store";

class Files {
	public files = $state<VertFile[]>([]);

	public requiredConverters = $derived(
		Array.from(new Set(files.files.map((f) => f.converter))),
	);

	public ready = $derived(
		this.files.length === 0
			? false
			: this.requiredConverters.every((f) => f?.ready) &&
					this.files.every((f) => !f.processing),
	);
	public results = $derived(
		this.files.length === 0 ? false : this.files.every((f) => f.result),
	);

	private _addThumbnail = async (file: VertFile) => {
		try {
			if (
				converters
					.find((c) => c.name === "ffmpeg")
					?.supportedFormats?.includes(file.from.toLowerCase())
			) {
				// try to get the thumbnail from the audio via jsmmediatags
				const tags = await new Promise<TagType>((resolve, reject) => {
					jsmediatags.read(file.file, {
						onSuccess: (tag) => resolve(tag),
						onError: (error) => reject(error),
					});
				});
				if (tags.tags.picture) {
					const blob = new Blob(
						[new Uint8Array(tags.tags.picture.data)],
						{
							type: tags.tags.picture.format,
						},
					);
					const url = URL.createObjectURL(blob);
					file.blobUrl = url;
				}
			} else {
				const img = new Image();
				img.src = URL.createObjectURL(file.file);
				await new Promise((resolve) => {
					img.onload = resolve;
				});
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				if (!ctx) return;
				const maxSize = 180;
				const scale = Math.max(
					maxSize / img.width,
					maxSize / img.height,
				);
				canvas.width = img.width * scale;
				canvas.height = img.height * scale;
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				const url = canvas.toDataURL();
				file.blobUrl = url;
				canvas.remove();
			}
		} catch (e) {
			error(["files"], e);
		}
	};

	private _add(file: VertFile | File) {
		if (file instanceof VertFile) {
			this.files.push(file);
			this._addThumbnail(file);
		} else {
			const format = "." + file.name.split(".").pop()?.toLowerCase();
			if (!format) {
				log(["files"], `no extension found for ${file.name}`);
				return;
			}
			const converter = converters.find((c) =>
				c.supportedFormats.includes(
					format || ".somenonexistentextension",
				),
			);
			if (!converter) {
				log(["files"], `no converter found for ${file.name}`);
				this.files.push(new VertFile(file, format, null));
				return;
			}
			const to = converter.supportedFormats.find((f) => f !== format);
			if (!to) {
				log(["files"], `no output format found for ${file.name}`);
				return;
			}
			const vf = new VertFile(file, to, converter);
			this.files.push(vf);
			this._addThumbnail(vf);
		}
	}

	public add(file: VertFile | null | undefined): void;
	public add(file: File | null | undefined): void;
	public add(file: File[] | null | undefined): void;
	public add(file: VertFile[] | null | undefined): void;
	public add(file: FileList | null | undefined): void;
	public add(
		file:
			| VertFile
			| File
			| VertFile[]
			| File[]
			| FileList
			| null
			| undefined,
	) {
		if (!file) return;
		if (Array.isArray(file) || file instanceof FileList) {
			for (const f of file) {
				this._add(f);
			}
		} else {
			this._add(file);
		}
	}

	public async convertAll() {
		await Promise.all(this.files.map((f) => f.convert()));
	}

	public async downloadAll() {
		if (files.files.length === 0) return;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const dlFiles: any[] = [];
		for (let i = 0; i < files.files.length; i++) {
			const file = files.files[i];
			const result = file.result;
			if (!result) {
				console.error("No result found");
				continue;
			}
			dlFiles.push({
				name: file.file.name.replace(/\.[^/.]+$/, "") + file.to,
				lastModified: Date.now(),
				input: await result.file.arrayBuffer(),
			});
		}
		const { downloadZip } = await import("client-zip");
		const blob = await downloadZip(dlFiles, "converted.zip").blob();
		const url = URL.createObjectURL(blob);

		const filenameFormat =
			localStorage.getItem("filenameFormat") ?? "VERT_%name%";

		const format = (name: string) => {
			const date = new Date().toISOString();
			return name
				.replace(/%date%/g, date)
				.replace(/%name%/g, "Multi")
				.replace(/%extension%/g, "");
		};

		const a = document.createElement("a");
		a.href = url;
		a.download = `${format(filenameFormat)}.zip`;
		a.click();
		URL.revokeObjectURL(url);
		a.remove();
	}
}

class Theme {
	private _dark = $state(false);
	public get dark() {
		return this._dark;
	}
	public set dark(value: boolean) {
		this._dark = value;
		if (!browser) return;
		JSCookie.set("theme", this.dark ? "dark" : "light", {
			path: "/",
			sameSite: "lax",
			expires: 2147483647,
		});
		log(["theme"], `set to ${this.dark ? "dark" : "light"}`);
		window.plausible("Theme set", {
			props: { theme: theme.dark ? "dark" : "light" },
		});
		if (value) {
			document.documentElement.classList.add("dark");
			document.documentElement.classList.remove("light");
			JSCookie.set("theme", "dark", {
				path: "/",
				sameSite: "lax",
				expires: 2147483647,
			});
		} else {
			document.documentElement.classList.add("light");
			document.documentElement.classList.remove("dark");
			JSCookie.set("theme", "light", {
				path: "/",
				sameSite: "lax",
				expires: 2147483647,
			});
		}
	}
	public toggle = () => {
		this.dark = !this.dark;
	};
}

export const files = new Files();
export const theme = new Theme();
export const showGradient = writable(true);
