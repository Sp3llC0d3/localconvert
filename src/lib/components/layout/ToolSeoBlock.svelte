<script lang="ts">
	import { tools_common_seo_how_title, tools_common_seo_step1, tools_common_seo_step2, tools_common_seo_step3, tools_common_seo_why_title, tools_common_seo_why_private, tools_common_seo_why_free, tools_common_seo_why_offline, tools_common_seo_faq_title, tools_common_seo_related_title } from "$lib/paraglide/messages/_barrel.js";
	import type { Component } from 'svelte';

	type RelatedTool = {
		href: string;
		name: string;
		icon: Component<{ size?: number }>;
	};

	type FAQ = {
		q: string;
		a: string;
	};

	type Props = {
		faqs?: FAQ[];
		relatedTools?: RelatedTool[];
	};

	const { faqs = [], relatedTools = [] }: Props = $props();
</script>

<div class="seo-block">
	<!-- How it works -->
	<details class="seo-section" open>
		<summary class="seo-heading">{tools_common_seo_how_title()}</summary>
		<ol class="seo-steps">
			<li>{tools_common_seo_step1()}</li>
			<li>{tools_common_seo_step2()}</li>
			<li>{tools_common_seo_step3()}</li>
		</ol>
	</details>

	<!-- Why LocalConvert -->
	<details class="seo-section">
		<summary class="seo-heading">{tools_common_seo_why_title()}</summary>
		<ul class="seo-list">
			<li>{tools_common_seo_why_private()}</li>
			<li>{tools_common_seo_why_free()}</li>
			<li>{tools_common_seo_why_offline()}</li>
		</ul>
	</details>

	<!-- FAQ -->
	{#if faqs.length > 0}
		<details class="seo-section">
			<summary class="seo-heading">{tools_common_seo_faq_title()}</summary>
			<div class="seo-faqs">
				{#each faqs as faq}
					<div class="seo-faq">
						<p class="seo-faq-q">{faq.q}</p>
						<p class="seo-faq-a">{faq.a}</p>
					</div>
				{/each}
			</div>
		</details>
	{/if}

	<!-- Related tools -->
	{#if relatedTools.length > 0}
		<div class="seo-section">
			<p class="seo-heading">{tools_common_seo_related_title()}</p>
			<div class="seo-related">
				{#each relatedTools as tool}
					{@const Icon = tool.icon}
					<a href={tool.href} class="seo-related-card">
						<Icon size={18} />
						<span>{tool.name}</span>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.seo-block {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--bg-separator);
	}

	.seo-section {
		font-size: 0.85rem;
		color: var(--fg-muted);
		line-height: 1.6;
	}

	.seo-heading {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--fg);
		cursor: pointer;
		list-style: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.seo-heading::before {
		content: '▸';
		font-size: 0.7rem;
		transition: transform 0.15s ease;
	}

	details[open] > .seo-heading::before {
		transform: rotate(90deg);
	}

	/* Remove default marker */
	.seo-heading::-webkit-details-summary-icon { display: none; }

	.seo-steps {
		margin: 0.5rem 0 0;
		padding-left: 1.25rem;
	}

	.seo-steps li {
		margin-bottom: 0.25rem;
	}

	.seo-list {
		margin: 0.5rem 0 0;
		padding-left: 1.25rem;
		list-style: disc;
	}

	.seo-list li {
		margin-bottom: 0.25rem;
	}

	.seo-faqs {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.seo-faq-q {
		font-weight: 600;
		color: var(--fg);
		margin: 0 0 0.2rem;
	}

	.seo-faq-a {
		margin: 0;
	}

	.seo-related {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.seo-related-card {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.75rem;
		border-radius: 0.75rem;
		background: var(--bg-panel);
		box-shadow: var(--shadow-panel);
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--fg);
		text-decoration: none;
		transition: background 0.15s, color 0.15s;
	}

	.seo-related-card:hover {
		background: var(--accent);
		color: var(--fg-on-accent);
	}

	/* Non-collapsible sections (related tools) */
	.seo-section:not(details) .seo-heading {
		cursor: default;
	}

	.seo-section:not(details) .seo-heading::before {
		display: none;
	}
</style>
