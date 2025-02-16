<script lang="ts">
	import Toast from "$lib/components/visual/Toast.svelte";
	import { type Toast as ToastType, toasts } from "$lib/store/ToastProvider";

	let toastList = $state<ToastType[]>([]);
	toasts.subscribe((value) => {
		toastList = value as ToastType[];
	});
</script>

<div class="fixed bottom-28 md:bottom-0 right-0 p-4 space-y-4 z-50">
	{#each toastList as { id, type, message, durations }}
		<Toast {id} {type} {message} {durations} />
	{/each}
</div>
