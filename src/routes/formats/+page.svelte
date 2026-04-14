<script lang="ts">
	import { allFormats, categoryMeta, formatMap, type FormatEntry } from '$lib/data/format-map';
	import { Image, AudioLines, Film, BookText, SearchIcon, ChevronDown, ArrowRight, ZapIcon } from 'lucide-svelte';

	const icons: Record<string, typeof Image> = { image: Image, audio: AudioLines, video: Film, doc: BookText };
	const categories = ['image', 'audio', 'video', 'doc'] as const;

	let searchQuery = $state('');
	let expandedFormat = $state<string | null>(null);
	let activeFilter = $state<string | null>(null);

	const filteredFormats = $derived.by(() => {
		let formats = allFormats;

		if (activeFilter) {
			formats = formats.filter(f => f.category === activeFilter);
		}

		if (searchQuery.trim()) {
			const q = searchQuery.trim().toLowerCase().replace(/^\./, '');
			formats = formats.filter(f =>
				f.displayName.toLowerCase().includes(q) ||
				f.name.replace(/^\./, '').includes(q)
			);
		}

		return formats.sort((a, b) => a.displayName.localeCompare(b.displayName));
	});

	const groupedFormats = $derived.by(() => {
		const groups: Record<string, FormatEntry[]> = {};
		for (const cat of categories) {
			const catFormats = filteredFormats.filter(f => f.category === cat);
			if (catFormats.length > 0) groups[cat] = catFormats;
		}
		return groups;
	});

	function toggleExpand(name: string) {
		expandedFormat = expandedFormat === name ? null : name;
	}

	function directionLabel(f: FormatEntry): string {
		if (f.canBeInput && f.canBeOutput) return 'Input & Output';
		if (f.canBeInput) return 'Input only';
		return 'Output only';
	}

	const schemaData = JSON.stringify({
		"@context": "https://schema.org",
		"@type": "ItemList",
		"name": "LocalConvert Supported Formats",
		"description": "All file formats supported by LocalConvert for conversion, organized by category.",
		"numberOfItems": allFormats.length,
		"itemListElement": allFormats.slice(0, 50).map((f, i) => ({
			"@type": "ListItem",
			"position": i + 1,
			"name": f.displayName,
		})),
	});
</script>

<svelte:head>
	<title>Supported Formats — LocalConvert</title>
	<meta name="description" content="Browse all {allFormats.length} file formats supported by LocalConvert. Images, audio, video, and documents — see what converts to what." />
	<link rel="canonical" href="https://localconvert.app/formats/" />
	<meta property="og:title" content="Supported Formats — LocalConvert" />
	<meta property="og:description" content="Browse all file formats supported by LocalConvert. Images, audio, video, and documents — see what converts to what." />
	<meta property="og:url" content="https://localconvert.app/formats/" />
	{@html `<script type="application/ld+json">${schemaData}</script>`}
</svelte:head>

<div class="fmt-page">
	<!-- Hero -->
	<div class="fmt-hero">
		<h1 class="fmt-title">Format Reference</h1>
		<p class="fmt-subtitle">
			{allFormats.length} formats across {categories.length} categories. Click any format to see what it converts to.
		</p>
	</div>

	<!-- Search + filters -->
	<div class="fmt-controls">
		<div class="fmt-search-wrap">
			<SearchIcon size={16} class="fmt-search-icon" />
			<input
				bind:value={searchQuery}
				type="text"
				placeholder="Search formats..."
				class="fmt-search"
				autocomplete="off"
				spellcheck="false"
			/>
		</div>

		<div class="fmt-filters">
			<button
				class="fmt-filter-btn"
				class:fmt-filter-btn--active={activeFilter === null}
				onclick={() => activeFilter = null}
			>All</button>
			{#each categories as cat}
				{@const meta = categoryMeta[cat]}
				<button
					class="fmt-filter-btn"
					class:fmt-filter-btn--active={activeFilter === cat}
					style="--filter-color: var(--accent-{meta.color})"
					onclick={() => activeFilter = activeFilter === cat ? null : cat}
				>
					{meta.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Format grid -->
	{#if Object.keys(groupedFormats).length === 0}
		<div class="fmt-empty">
			No formats found for "{searchQuery}"
		</div>
	{/if}

	{#each Object.entries(groupedFormats) as [cat, formats]}
		{@const meta = categoryMeta[cat]}
		{@const Icon = icons[cat]}
		<section class="fmt-section">
			<div class="fmt-section-header" style="--section-color: var(--accent-{meta.color})">
				<div class="fmt-section-icon" style="background: var(--accent-{meta.color})">
					<Icon size={16} />
				</div>
				<h2 class="fmt-section-title">{meta.label}</h2>
				<span class="fmt-section-count">{formats.length}</span>
				<div class="fmt-section-line"></div>
			</div>

			<div class="fmt-grid">
				{#each formats as fmt (fmt.name)}
					{@const isExpanded = expandedFormat === fmt.name}
					<div class="fmt-card" style="--card-color: var(--accent-{meta.color})">
						<button class="fmt-card-header" onclick={() => toggleExpand(fmt.name)}>
							<span class="fmt-card-name">{fmt.displayName}</span>
							{#if fmt.gpuInput && fmt.gpuOutput}
								<span class="fmt-card-gpu" title="Full GPU acceleration — input and output">
									<ZapIcon size={10} />
									GPU
								</span>
							{:else if fmt.gpuInput}
								<span class="fmt-card-gpu fmt-card-gpu--input" title="GPU accelerated when converting to MP4, WebM, MOV, M4V, or 3GP">
									<ZapIcon size={10} />
									GPU In
								</span>
							{/if}
							<span class="fmt-card-dir" class:fmt-card-dir--both={fmt.canBeInput && fmt.canBeOutput}>
								{directionLabel(fmt)}
							</span>
							{#if fmt.canBeInput && fmt.outputFormats.length > 0}
								<span class="fmt-card-arrow" class:fmt-card-arrow--open={isExpanded}>
									<ChevronDown size={14} />
								</span>
							{/if}
						</button>

						{#if isExpanded && fmt.canBeInput && fmt.outputFormats.length > 0}
							<div class="fmt-card-body">
								<div class="fmt-card-flow">
									<span class="fmt-card-from" style="background: var(--accent-{meta.color})">{fmt.displayName}</span>
									<ArrowRight size={12} class="fmt-card-flow-arrow" />
								</div>
								<div class="fmt-card-outputs">
									{#each fmt.outputFormats as outName, i}
										{@const outFmt = formatMap[outName]}
										{#if outFmt}
											{@const outMeta = categoryMeta[outFmt.category]}
											<span
												class="fmt-output-chip"
												style="--chip-color: var(--accent-{outMeta.color}); animation-delay: {i * 12}ms"
											>
												{outFmt.displayName}
											</span>
										{/if}
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>

<style>
	/* ── Page layout ── */
	.fmt-page {
		max-width: 64rem;
		margin: 0 auto;
		padding: 2.5rem 1rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* ── Hero ── */
	.fmt-hero {
		text-align: center;
	}

	.fmt-title {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		font-weight: 700;
		letter-spacing: -0.04em;
		line-height: 1.1;
		margin-bottom: 0.5rem;
	}

	.fmt-subtitle {
		font-size: 0.9375rem;
		color: var(--fg-muted);
		max-width: 32rem;
		margin: 0 auto;
		line-height: 1.6;
	}

	/* ── Search & filters ── */
	.fmt-controls {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		position: sticky;
		top: 0;
		z-index: 10;
		padding: 0.75rem 0;
		background: var(--bg);
	}

	@media (min-width: 640px) {
		.fmt-controls {
			flex-direction: row;
			align-items: center;
		}
	}

	.fmt-search-wrap {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.75rem;
		background: var(--bg-panel);
		border: 1px solid var(--bg-separator);
		box-shadow: var(--shadow-panel);
	}

	:global(.fmt-search-icon) {
		color: var(--fg-muted);
		flex-shrink: 0;
	}

	.fmt-search {
		flex: 1;
		background: none !important;
		border: none !important;
		outline: none !important;
		padding: 0 !important;
		font-size: 0.875rem;
		color: var(--fg);
		font-family: var(--font-body);
	}

	.fmt-search::placeholder {
		color: var(--fg-muted);
	}

	.fmt-search:focus {
		outline: none !important;
	}

	.fmt-filters {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	.fmt-filter-btn {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		padding: 0.375rem 0.75rem;
		border-radius: 9999px;
		border: 1px solid var(--bg-separator);
		background: var(--bg-panel);
		color: var(--fg-muted);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.fmt-filter-btn:hover {
		background: var(--bg-panel-highlight);
		color: var(--fg);
	}

	.fmt-filter-btn--active {
		background: var(--filter-color, var(--accent));
		color: var(--fg-on-accent);
		border-color: var(--filter-color, var(--accent));
	}

	/* ── Empty state ── */
	.fmt-empty {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--fg-muted);
		font-size: 0.9375rem;
	}

	/* ── Category sections ── */
	.fmt-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.fmt-section-header {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.fmt-section-icon {
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-on-accent);
		flex-shrink: 0;
	}

	.fmt-section-title {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: -0.03em;
	}

	.fmt-section-count {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		font-weight: 700;
		padding: 2px 7px;
		border-radius: 9999px;
		background: color-mix(in srgb, var(--section-color) 12%, transparent);
		color: var(--section-color);
	}

	.fmt-section-line {
		flex: 1;
		height: 1px;
		background: var(--bg-separator);
	}

	/* ── Format grid ── */
	.fmt-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.375rem;
	}

	@media (min-width: 640px) {
		.fmt-grid { grid-template-columns: repeat(2, 1fr); }
	}

	@media (min-width: 1024px) {
		.fmt-grid { grid-template-columns: repeat(3, 1fr); }
	}

	/* ── Format card ── */
	.fmt-card {
		background: var(--bg-panel);
		border-radius: 0.75rem;
		border: 1px solid var(--bg-separator);
		overflow: hidden;
		transition: border-color 0.15s ease;
	}

	.fmt-card:has(.fmt-card-arrow--open) {
		border-color: color-mix(in srgb, var(--card-color) 30%, var(--bg-separator));
		grid-column: 1 / -1;
	}

	.fmt-card-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		width: 100%;
		border: none;
		background: none;
		cursor: pointer;
		color: var(--fg);
		text-align: left;
		transition: background 0.1s ease;
	}

	.fmt-card-header:hover {
		background: var(--bg-panel-highlight);
	}

	.fmt-card-name {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.fmt-card-dir {
		font-size: 0.5625rem;
		font-weight: 600;
		padding: 1px 6px;
		border-radius: 4px;
		background: var(--bg-panel-highlight);
		color: var(--fg-muted);
		margin-left: auto;
		white-space: nowrap;
	}

	.fmt-card-dir--both {
		background: color-mix(in srgb, var(--card-color) 10%, transparent);
		color: var(--card-color);
	}

	.fmt-card-gpu {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		font-size: 0.5625rem;
		font-weight: 700;
		font-family: var(--font-mono);
		padding: 1px 6px;
		border-radius: 4px;
		background: hsla(14, 80%, 60%, 0.1);
		color: var(--accent-red);
		letter-spacing: 0.06em;
	}

	.fmt-card-gpu--input {
		background: var(--bg-panel-highlight);
		color: var(--fg-muted);
	}

	.fmt-card-arrow {
		color: var(--fg-muted);
		transition: transform 0.2s ease;
		flex-shrink: 0;
	}

	.fmt-card-arrow--open {
		transform: rotate(180deg);
		color: var(--card-color);
	}

	/* ── Expanded body ── */
	.fmt-card-body {
		padding: 0.5rem 0.75rem 0.75rem;
		border-top: 1px solid var(--bg-separator);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.fmt-card-flow {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.fmt-card-from {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 4px;
		color: var(--fg-on-accent);
	}

	:global(.fmt-card-flow-arrow) {
		color: var(--fg-muted);
	}

	.fmt-card-outputs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	@keyframes chipIn {
		from { opacity: 0; transform: scale(0.9); }
		to { opacity: 1; transform: scale(1); }
	}

	.fmt-output-chip {
		font-family: var(--font-mono);
		font-size: 0.5625rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		padding: 2px 7px;
		border-radius: 4px;
		background: color-mix(in srgb, var(--chip-color) 10%, var(--bg-panel-highlight));
		color: var(--chip-color);
		border: 1px solid color-mix(in srgb, var(--chip-color) 12%, transparent);
		animation: chipIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
	}
</style>
