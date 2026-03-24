<script lang="ts">
	import clsx from "clsx";
	import { onMount } from "svelte";
	import { effects, files } from "$lib/store/index.svelte";
	import { converters } from "$lib/converters";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { m } from "$lib/paraglide/messages";
	import dropzoneDark from "$lib/assets/dropzone-dark.png";
	import dropzoneLight from "$lib/assets/dropzone-light.png";

	type Props = {
		class?: string;
		redirectSuffix?: string;
	};

	const { class: classList, redirectSuffix = "" }: Props = $props();

	let uploaderButton = $state<HTMLButtonElement>();
	let fileInput = $state<HTMLInputElement>();

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
		const handler = (e: Event) => {
			e.preventDefault();
			return false;
		};

		uploaderButton?.addEventListener("dragover", handler);
		uploaderButton?.addEventListener("dragenter", handler);
		uploaderButton?.addEventListener("dragleave", handler);
		uploaderButton?.addEventListener("drop", handler);

		return () => {
			uploaderButton?.removeEventListener("dragover", handler);
			uploaderButton?.removeEventListener("dragenter", handler);
			uploaderButton?.removeEventListener("dragleave", handler);
			uploaderButton?.removeEventListener("drop", handler);
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
		"bg-panel shadow-panel border border-separator rounded-2.5xl p-4 flex items-center justify-center overflow-hidden",
	)}
	aria-label={m["upload.uploader.text"]({ action: m["upload.uploader.convert"]() })}
>
	<img
		src={dropzoneLight}
		alt=""
		class="w-full h-full object-contain pointer-events-none dynadark:hidden"
	/>
	<img
		src={dropzoneDark}
		alt=""
		class="w-full h-full object-contain pointer-events-none hidden dynadark:block"
	/>
</button>
