<script lang="ts">
	import clsx from "clsx";
	import { onMount } from "svelte";
	import { effects, files } from "$lib/store/index.svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { m } from "$lib/paraglide/messages";
	import dropzoneDark from "$lib/assets/dropzone-dark.webp";
	import dropzoneLight from "$lib/assets/dropzone-light.webp";

	type Props = {
		class?: string;
		redirectSuffix?: string;
	};

	const { class: classList, redirectSuffix = "" }: Props = $props();

	let uploaderButton = $state<HTMLButtonElement>();
	let fileInput = $state<HTMLInputElement>();
	let isDragOver = $state(false);

	const uploadFiles = async () => {
		if (!fileInput) return;
		fileInput.click();
	};

	const handleFileChange = (e: Event) => {
		if (!fileInput) return;
		const oldLength = files.files.length;
		files.add(fileInput.files);
		if (oldLength !== files.files.length) goto(`/convert${redirectSuffix}`);
	};

	onMount(() => {
		const prevent = (e: Event) => { e.preventDefault(); return false; };
		const onEnter = (e: Event) => { e.preventDefault(); isDragOver = true; };
		const onLeave = (e: Event) => { e.preventDefault(); isDragOver = false; };
		const onDrop  = (e: DragEvent) => {
			e.preventDefault();
			isDragOver = false;
			const oldLength = files.files.length;
			files.add(e.dataTransfer?.files ?? null);
			if (oldLength !== files.files.length) goto(`/convert${redirectSuffix}`);
		};

		uploaderButton?.addEventListener("dragover",  onEnter);
		uploaderButton?.addEventListener("dragenter", onEnter);
		uploaderButton?.addEventListener("dragleave", onLeave);
		uploaderButton?.addEventListener("drop",      onDrop);

		return () => {
			uploaderButton?.removeEventListener("dragover",  onEnter);
			uploaderButton?.removeEventListener("dragenter", onEnter);
			uploaderButton?.removeEventListener("dragleave", onLeave);
			uploaderButton?.removeEventListener("drop",      onDrop);
		};
	});
</script>

<input
	bind:this={fileInput}
	type="file"
	multiple
	class="hidden"
	onchange={handleFileChange}
/>

<button
	onclick={uploadFiles}
	bind:this={uploaderButton}
	class={clsx(
		`hover:scale-105 active:scale-100 ${$effects ? "" : "!scale-100"} duration-200 ${classList}`,
		"uploader-btn bg-panel shadow-panel border rounded-2.5xl flex items-center justify-center overflow-hidden transition-colors",
		isDragOver ? "border-accent scale-105 bg-panel-highlight" : "border-separator",
	)}
	aria-label={m["upload.uploader.text"]({ action: m["upload.uploader.convert"]() })}
>
	<img
		src={dropzoneLight}
		alt=""
		width="398"
		height="249"
		class="uploader-img pointer-events-none dynadark:hidden"
	/>
	<img
		src={dropzoneDark}
		alt=""
		width="398"
		height="249"
		class="uploader-img pointer-events-none hidden dynadark:block"
	/>
</button>

<style>
	.uploader-btn {
		padding: 1rem;
	}
	.uploader-img {
		max-width: 398px;
		width: 100%;
		height: auto;
		display: block;
	}
</style>
