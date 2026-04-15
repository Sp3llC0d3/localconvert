<script lang="ts">
	import { tools_common_before, tools_common_after } from "$lib/paraglide/messages/_barrel.js";

	type Props = {
		beforeSrc: string;
		afterSrc: string;
		alt?: string;
	};

	let { beforeSrc, afterSrc, alt = 'Comparison' }: Props = $props();
	let sliderPos = $state(50);
	let dragging = $state(false);
	let containerEl = $state<HTMLDivElement>();

	function getPercent(e: MouseEvent | TouchEvent): number {
		if (!containerEl) return 50;
		const rect = containerEl.getBoundingClientRect();
		const pos = 'touches' in e && e.touches.length > 0 ? e.touches[0] : (e as MouseEvent);
		const x = pos.clientX - rect.left;
		return Math.max(0, Math.min(100, (x / rect.width) * 100));
	}

	function onDown(e: MouseEvent | TouchEvent) {
		if ('touches' in e) e.preventDefault();
		dragging = true;
		sliderPos = getPercent(e);
	}

	function onMove(e: MouseEvent | TouchEvent) {
		if (!dragging) return;
		if ('touches' in e) e.preventDefault();
		sliderPos = getPercent(e);
	}

	function onUp() {
		dragging = false;
	}
</script>

<div
	bind:this={containerEl}
	class="ba-container"
	onmousedown={onDown}
	onmousemove={onMove}
	onmouseup={onUp}
	onmouseleave={onUp}
	ontouchstart={onDown}
	ontouchmove={onMove}
	ontouchend={onUp}
	ontouchcancel={onUp}
	role="slider"
	aria-label="Before and after comparison"
	aria-valuenow={Math.round(sliderPos)}
	aria-valuemin={0}
	aria-valuemax={100}
>
	<!-- After (full image behind) -->
	<img src={afterSrc} alt="{alt} — after" class="ba-img" draggable="false" />

	<!-- Before (clipped by overflow:hidden on .ba-before) -->
	<div class="ba-before" style="width: {sliderPos}%;">
		<img src={beforeSrc} alt="{alt} — before" class="ba-before-img" draggable="false" />
	</div>

	<!-- Slider line + handle -->
	<div class="ba-line" style="left: {sliderPos}%;">
		<div class="ba-handle">
			<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M3 6L1 4M3 6L1 8M9 6L11 4M9 6L11 8" />
			</svg>
		</div>
	</div>

	<!-- Labels -->
	<span class="ba-label ba-label-before">{tools_common_before()}</span>
	<span class="ba-label ba-label-after">{tools_common_after()}</span>
</div>

<style>
	.ba-container {
		position: relative;
		overflow: hidden;
		border-radius: 0.75rem;
		cursor: ew-resize;
		user-select: none;
		-webkit-user-select: none;
		touch-action: none;
		box-shadow: var(--shadow-panel);
	}

	.ba-img {
		display: block;
		width: 100%;
		height: auto;
		pointer-events: none;
	}

	.ba-before {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		overflow: hidden;
	}

	.ba-before-img {
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: auto;
		max-width: none;
		pointer-events: none;
	}

	.ba-line {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		background: white;
		transform: translateX(-1px);
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
		pointer-events: none;
	}

	.ba-handle {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: white;
		border: 2px solid var(--accent, #0F6E56);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent, #0F6E56);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
	}

	.ba-label {
		position: absolute;
		bottom: 8px;
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.5);
		color: white;
		pointer-events: none;
	}

	.ba-label-before { left: 8px; }
	.ba-label-after { right: 8px; }
</style>
