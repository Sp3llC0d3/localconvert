<script lang="ts">
	type Props = {
		progress: number | null;
		min: number;
		max: number;
	};

	let { progress, min, max }: Props = $props();

	const percent = $derived(
		progress ? ((progress - min) / (max - min)) * 100 : null,
	);
</script>

<div
	class="w-full h-1.5 bg-panel-alt rounded-full overflow-hidden relative"
	role="progressbar"
	aria-valuenow={percent ?? undefined}
	aria-valuemin={0}
	aria-valuemax={100}
>
	<div
		class="h-full bg-accent rounded-full absolute top-0"
		class:indeterminate={progress === null}
		style={percent !== null ? `width: ${percent}%; transition: width 400ms linear;` : "width: 40%;"}
	></div>
</div>

<style>
	.indeterminate {
		animation: indeterminate 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}

	@keyframes indeterminate {
		0%   { left: -40%; }
		60%  { left: 100%; }
		100% { left: 100%; }
	}
</style>
