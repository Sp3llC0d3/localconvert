<script lang="ts">
	import { duration, fade } from "$lib/util/animation";
	import { quintOut } from "svelte/easing";
	import Dialog from "../functional/Dialog.svelte";
	import {
		type Dialog as DialogType,
		dialogs,
	} from "$lib/store/DialogProvider";

	let dialogList = $state<DialogType[]>([]);
	let backdrop: HTMLDivElement | undefined = $state();

	dialogs.subscribe((value) => {
		dialogList = value as DialogType[];
	});

	function trapFocus(e: KeyboardEvent) {
		if (e.key !== 'Tab' || !backdrop) return;
		const focusable = backdrop.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	$effect(() => {
		if (dialogList.length > 0 && backdrop) {
			const firstBtn = backdrop.querySelector<HTMLElement>('button');
			firstBtn?.focus();
		}
	});
</script>

{#if dialogList.length > 0}
	<div
		bind:this={backdrop}
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-40"
		role="dialog"
		aria-modal="true"
		onkeydown={trapFocus}
		in:fade={{
			duration,
			easing: quintOut,
		}}
		out:fade={{
			duration,
			easing: quintOut,
		}}
	>
		{#each dialogList as dialog, i}
			{#if i === 0}
				<Dialog {...dialog} />
			{/if}
		{/each}
	</div>
{/if}
