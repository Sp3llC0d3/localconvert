<script lang="ts">
	import { UploadIcon } from "lucide-svelte";
	import Panel from "../visual/Panel.svelte";

	type Props = {
		class?: string;
	};

	const { class: classList }: Props = $props();
</script>

<button class={classList}>
	<Panel class="flex justify-center items-center w-full h-full flex-col">
		<div
			class="w-16 h-16 bg-accent rounded-full flex items-center justify-center p-4"
		>
			<UploadIcon class="w-full h-full text-on-accent" />
		</div>
		<h2 class="text-center text-2xl font-semibold mt-4">
			Drop or click to upload
		</h2>
	</Panel>
</button>
