<script lang="ts">
	import Toast from "$lib/components/visual/Toast.svelte";
	import { ToastManager } from "$lib/util/toast.svelte";
</script>

<div
	class="fixed bottom-28 md:bottom-0 right-0 p-4 flex flex-col-reverse gap-4 z-50 pointer-events-none"
	role="status"
	aria-live="polite"
>
	{#each ToastManager.toasts as toast (toast.id)}
		<div class="flex justify-end pointer-events-auto">
			<Toast {toast} />
		</div>
	{/each}
</div>
