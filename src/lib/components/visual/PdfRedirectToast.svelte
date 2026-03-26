<script lang="ts">
	import type { ToastProps } from "$lib/util/toast.svelte";
	import { ArrowRightIcon } from "lucide-svelte";
	import { m } from "$lib/paraglide/messages";

	const { additional }: ToastProps<{ filename: string }> = $props();

	export const title = m["convert.errors.pdf_redirect_title"]();
</script>

<div class="flex flex-col gap-1.5">
	<p class="text-sm opacity-75 truncate max-w-[240px]">{additional.filename}</p>
	<a
		href="/pdf-tools/"
		class="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2"
	>
		{m["convert.errors.pdf_redirect_button"]()}
		<ArrowRightIcon size="14" />
	</a>
</div>
