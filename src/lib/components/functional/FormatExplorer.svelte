<script lang="ts">
	import { formatsByCategory, categoryMeta, formatMap, allInputFormats, type FormatEntry } from '$lib/data/format-map';
	import { aria_search_formats, aria_gpu_acceleration, aria_close } from '$lib/paraglide/messages/_barrel.js';
	import { Image, AudioLines, Film, BookText, ArrowRight, SearchIcon, ZapIcon } from 'lucide-svelte';

	const icons = { image: Image, audio: AudioLines, video: Film, doc: BookText };
	const categories = ['image', 'audio', 'video', 'doc'] as const;

	let activeCategory = $state<string>('image');
	let selectedFormat = $state<string | null>(null);
	let outputsVisible = $state(false);
	let searchQuery = $state('');
	let outputMode = $state<'to' | 'from'>('to');

	const meta = $derived(categoryMeta[activeCategory]);
	const selectedColor = $derived(
		selectedFormat && formatMap[selectedFormat]
			? categoryMeta[formatMap[selectedFormat].category]?.color ?? meta.color
			: meta.color
	);

	const isSearching = $derived(searchQuery.trim().length > 0);

	const inputFormats = $derived.by(() => {
		if (isSearching) {
			const q = searchQuery.trim().toLowerCase().replace(/^\./, '');
			return allInputFormats
				.filter(f => f.displayName.toLowerCase().includes(q) || f.name.replace(/^\./, '').includes(q))
				.sort((a, b) => a.displayName.localeCompare(b.displayName));
		}
		return formatsByCategory[activeCategory]
			.filter(f => f.canBeInput)
			.sort((a, b) => a.displayName.localeCompare(b.displayName));
	});

	const outputFormats = $derived.by(() => {
		if (!selectedFormat || !formatMap[selectedFormat]) return [];
		const entry = formatMap[selectedFormat];
		return entry.outputFormats
			.map(name => formatMap[name])
			.filter(Boolean)
			.sort((a, b) => a.displayName.localeCompare(b.displayName));
	});

	const inputFromFormats = $derived.by(() => {
		if (!selectedFormat || !formatMap[selectedFormat]) return [];
		const entry = formatMap[selectedFormat];
		return entry.inputFromFormats
			.map(name => formatMap[name])
			.filter(Boolean)
			.sort((a, b) => a.displayName.localeCompare(b.displayName));
	});

	const activeResults = $derived(outputMode === 'to' ? outputFormats : inputFromFormats);

	const selectedIsGpuInput = $derived(
		selectedFormat && formatMap[selectedFormat] ? formatMap[selectedFormat].gpuInput : false
	);

	const resultsByCategory = $derived.by(() => {
		const groups: Record<string, FormatEntry[]> = {};
		for (const fmt of activeResults) {
			if (!groups[fmt.category]) groups[fmt.category] = [];
			groups[fmt.category].push(fmt);
		}
		return groups;
	});

	function selectCategory(cat: string) {
		activeCategory = cat;
		selectedFormat = null;
		outputsVisible = false;
		searchQuery = '';
	}

	function selectFormat(name: string) {
		selectedFormat = name;
		outputsVisible = false;
		// Trigger cascade animation
		requestAnimationFrame(() => { outputsVisible = true; });
	}

	// Auto-select first format on category change
	$effect(() => {
		if (inputFormats.length > 0 && !selectedFormat) {
			selectFormat(inputFormats[0].name);
		}
	});
</script>

<div class="explorer">
	<!-- Category tabs -->
	<div class="explorer-tabs">
		{#each categories as cat}
			{@const catMeta = categoryMeta[cat]}
			{@const Icon = icons[cat]}
			<button
				class="explorer-tab"
				class:explorer-tab--active={activeCategory === cat}
				style="--tab-color: var(--accent-{catMeta.color})"
				onclick={() => selectCategory(cat)}
			>
				<Icon size={14} />
				<span class="explorer-tab-label">{catMeta.label}</span>
				<span class="explorer-tab-count">{catMeta.formats.length}</span>
			</button>
		{/each}
	</div>

	<!-- Search bar -->
	<div class="explorer-search-wrap">
		<SearchIcon size={14} class="explorer-search-icon" />
		<input
			bind:value={searchQuery}
			type="text"
			placeholder={aria_search_formats()}
			class="explorer-search"
			autocomplete="off"
			spellcheck="false"
		/>
		{#if isSearching}
			<button class="explorer-search-clear" onclick={() => searchQuery = ''} aria-label={aria_close()}>
				&times;
			</button>
		{/if}
	</div>

	<!-- Explorer body -->
	<div class="explorer-body">
		<!-- Input column -->
		<div class="explorer-input">
			<div class="explorer-col-header">
				<span class="explorer-col-label">{isSearching ? `Results` : 'Input format'}</span>
			</div>
			<div class="explorer-format-list">
				{#each inputFormats as fmt (fmt.name)}
					{@const chipColor = isSearching ? categoryMeta[fmt.category]?.color ?? meta.color : meta.color}
					<button
						class="explorer-chip"
						class:explorer-chip--active={selectedFormat === fmt.name}
						style="--chip-color: var(--accent-{chipColor})"
						onclick={() => selectFormat(fmt.name)}
					>
						{fmt.displayName}
					</button>
				{/each}
				{#if inputFormats.length === 0 && isSearching}
					<div class="explorer-empty" style="min-height: 4rem;">No formats found</div>
				{/if}
			</div>
		</div>

		<!-- Flow indicator -->
		<div class="explorer-flow" class:explorer-flow--active={selectedFormat}>
			<div class="explorer-flow-line" style="--flow-color: var(--accent-{selectedColor})"></div>
			<div class="explorer-flow-arrow" style="--flow-color: var(--accent-{selectedColor})">
				<ArrowRight size={16} class="icon-flip" />
			</div>
		</div>

		<!-- Output column -->
		<div class="explorer-output">
			<div class="explorer-col-header">
				{#if selectedFormat}
					<div class="explorer-col-left">
						<span class="explorer-from-badge" style="background: var(--accent-{selectedColor})">
							{formatMap[selectedFormat]?.displayName}
						</span>
						<div class="explorer-mode-toggle">
							<button
								class="explorer-mode-btn"
								class:explorer-mode-btn--active={outputMode === 'to'}
								onclick={() => { outputMode = 'to'; outputsVisible = false; requestAnimationFrame(() => outputsVisible = true); }}
							>converts to</button>
							<button
								class="explorer-mode-btn"
								class:explorer-mode-btn--active={outputMode === 'from'}
								onclick={() => { outputMode = 'from'; outputsVisible = false; requestAnimationFrame(() => outputsVisible = true); }}
							>converts from</button>
						</div>
					</div>
					<span class="explorer-output-count">{activeResults.length} formats</span>
				{:else}
					<span class="explorer-col-label">Select a format</span>
				{/if}
			</div>
			<div class="explorer-output-grid">
				{#if selectedFormat && outputsVisible}
					{#each Object.entries(resultsByCategory) as [cat, formats], groupIdx}
						{@const groupMeta = categoryMeta[cat]}
						{#if formats.length > 0}
							<div class="explorer-output-group">
								<span class="explorer-group-label" style="color: var(--accent-{groupMeta.color})">
									{groupMeta.label}
								</span>
								<div class="explorer-output-chips">
									{#each formats as fmt, i}
										<span
											class="explorer-output-chip"
											style="--chip-color: var(--accent-{groupMeta.color}); animation-delay: {(groupIdx * formats.length + i) * 18}ms"
										>
											{fmt.displayName}
											{#if outputMode === 'to' && selectedIsGpuInput && fmt.gpuOutput}
												<span title={aria_gpu_acceleration()}><ZapIcon size={8} /></span>
											{/if}
										</span>
									{/each}
								</div>
							</div>
						{/if}
					{/each}
					{#if activeResults.length === 0}
						<div class="explorer-empty">
							No {outputMode === 'to' ? 'output' : 'input'} formats available.
						</div>
					{/if}
				{:else if !selectedFormat}
					<div class="explorer-empty">
						Click a format on the left to explore.
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Legend -->
	<div class="explorer-legend">
		<span class="explorer-legend-item">
			<ZapIcon size={10} class="explorer-legend-zap" />
			<span class="explorer-legend-label">GPU Accelerated</span>
			<span class="explorer-legend-desc">— this conversion path uses hardware acceleration</span>
		</span>
	</div>
</div>

<style>
	/* ── Explorer container ── */
	.explorer {
		background: var(--bg-panel);
		border-radius: 1.25rem;
		box-shadow: var(--shadow-panel);
		border: 1px solid var(--bg-separator);
		overflow: hidden;
	}

	/* ── Category tabs ── */
	.explorer-tabs {
		display: flex;
		border-bottom: 1px solid var(--bg-separator);
		padding: 0.25rem;
		gap: 0.25rem;
	}

	.explorer-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		padding: 0.625rem 0.5rem;
		border-radius: 0.75rem;
		border: none;
		background: none;
		cursor: pointer;
		color: var(--fg-muted);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.explorer-tab:hover {
		background: var(--bg-panel-highlight);
		color: var(--fg);
	}

	.explorer-tab--active {
		background: var(--bg-panel-highlight);
		color: var(--tab-color);
		box-shadow: inset 0 -2px 0 var(--tab-color);
	}

	.explorer-tab-label {
		display: none;
	}

	@media (min-width: 480px) {
		.explorer-tab-label { display: inline; }
	}

	.explorer-tab-count {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		font-weight: 700;
		padding: 1px 5px;
		border-radius: 4px;
		background: var(--bg-separator);
		color: var(--fg-muted);
	}

	.explorer-tab--active .explorer-tab-count {
		background: var(--tab-color);
		color: var(--fg-on-accent);
	}

	/* ── Search bar ── */
	.explorer-search-wrap {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--bg-separator);
	}

	:global(.explorer-search-icon) {
		color: var(--fg-muted);
		flex-shrink: 0;
	}

	.explorer-search {
		flex: 1;
		background: none !important;
		border: none !important;
		outline: none;
		padding: 0 !important;
		font-size: 0.8125rem;
		color: var(--fg);
		font-family: var(--font-body);
		font-weight: 400;
	}

	.explorer-search::placeholder {
		color: var(--fg-muted);
	}

	.explorer-search:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: 4px;
	}

	.explorer-search-clear {
		font-size: 1rem;
		line-height: 1;
		color: var(--fg-muted);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0 0.25rem;
		transition: color 0.15s ease;
		min-height: 44px;
		min-width: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
	}

	.explorer-search-clear:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.explorer-search-clear:hover {
		color: var(--fg);
	}

	/* ── Body layout ── */
	.explorer-body {
		display: flex;
		flex-direction: column;
		min-height: 18rem;
	}

	@media (min-width: 640px) {
		.explorer-body { flex-direction: row; }
	}

	/* ── Input column ── */
	.explorer-input {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		border-bottom: 1px solid var(--bg-separator);
	}

	@media (min-width: 640px) {
		.explorer-input {
			width: 11rem;
			border-bottom: none;
			border-inline-end: 1px solid var(--bg-separator);
		}
	}

	.explorer-col-header {
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		border-bottom: 1px solid var(--bg-separator);
	}

	.explorer-col-label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--fg-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-family: var(--font-mono);
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.explorer-col-left {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex-wrap: wrap;
		min-width: 0;
	}

	.explorer-from-badge {
		display: inline-flex;
		padding: 1px 6px;
		border-radius: 4px;
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--fg-on-accent);
		letter-spacing: 0.06em;
		flex-shrink: 0;
	}

	.explorer-mode-toggle {
		display: flex;
		gap: 1px;
		background: var(--bg-separator);
		border-radius: 0.375rem;
		overflow: hidden;
	}

	.explorer-mode-btn {
		font-family: var(--font-mono);
		font-size: 0.5625rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		padding: 0.1875rem 0.5rem;
		border: none;
		background: var(--bg-panel-highlight);
		color: var(--fg-muted);
		cursor: pointer;
		transition: all 0.12s ease;
		white-space: nowrap;
	}

	.explorer-mode-btn:hover {
		color: var(--fg);
	}

	.explorer-mode-btn--active {
		background: var(--bg-panel);
		color: var(--fg);
	}

	.explorer-output-count {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		color: var(--fg-muted);
		white-space: nowrap;
	}

	.explorer-format-list {
		padding: 0.5rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		max-height: 14rem;
		overflow-y: auto;
		scrollbar-width: thin;
	}

	@media (min-width: 640px) {
		.explorer-format-list {
			flex-direction: column;
			flex-wrap: nowrap;
		}
	}

	/* ── Input chips ── */
	.explorer-chip {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		border: 1px solid transparent;
		background: var(--bg-panel-highlight);
		color: var(--fg-muted);
		cursor: pointer;
		transition: background 0.15s ease;
		text-align: start;
		white-space: nowrap;
	}

	.explorer-chip:hover {
		background: var(--bg-separator);
		color: var(--fg);
	}

	.explorer-chip--active {
		background: var(--chip-color);
		color: var(--fg-on-accent);
	}


	/* ── Flow indicator ── */
	.explorer-flow {
		display: none;
	}

	@media (min-width: 640px) {
		.explorer-flow {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 2.5rem;
			position: relative;
			opacity: 0.25;
			transition: opacity 0.3s ease;
		}

		.explorer-flow--active { opacity: 1; }

		.explorer-flow-line {
			width: 1px;
			height: 3rem;
			background: var(--flow-color);
			opacity: 0.3;
		}

		.explorer-flow-arrow {
			color: var(--flow-color);
			animation: none;
		}

		.explorer-flow--active .explorer-flow-arrow {
			animation: flowPulse 2s ease-in-out infinite;
		}
	}

	@keyframes flowPulse {
		0%, 100% { opacity: 0.5; transform: translateX(0); }
		50% { opacity: 1; transform: translateX(2px); }
	}

	/* ── Output column ── */
	.explorer-output {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.explorer-output-grid {
		padding: 0.75rem 1rem;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-height: 18rem;
		overflow-y: auto;
		scrollbar-width: thin;
	}

	.explorer-output-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.explorer-group-label {
		font-family: var(--font-mono);
		font-size: 0.5625rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		opacity: 0.8;
	}

	.explorer-output-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	/* ── Output chips with cascade animation ── */
	@keyframes chipCascade {
		from {
			opacity: 0;
			transform: translateY(6px) scale(0.92);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.explorer-output-chip {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		padding: 3px 8px;
		border-radius: 5px;
		background: color-mix(in srgb, var(--chip-color) 10%, var(--bg-panel-highlight));
		color: var(--chip-color);
		border: 1px solid color-mix(in srgb, var(--chip-color) 15%, transparent);
		animation: chipCascade 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
		transition: background 0.12s ease, transform 0.12s ease;
	}

	.explorer-output-chip:hover {
		background: color-mix(in srgb, var(--chip-color) 18%, var(--bg-panel-highlight));
		transform: translateY(-1px);
	}

	.explorer-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 8rem;
		color: var(--fg-muted);
		font-size: 0.8125rem;
		font-style: italic;
	}

	/* ── Legend ── */
	.explorer-legend {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		border-top: 1px solid var(--bg-separator);
		background: var(--bg-panel-highlight);
	}

	.explorer-legend-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	:global(.explorer-legend-zap) {
		color: var(--accent-red);
		flex-shrink: 0;
	}

	.explorer-legend-label {
		font-family: var(--font-mono);
		font-size: 0.5625rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--accent-red);
	}

	.explorer-legend-desc {
		font-size: 0.5625rem;
		color: var(--fg-muted);
		font-weight: 400;
	}

	@media (max-width: 480px) {
		.explorer-legend-desc { display: none; }
	}
</style>
