<script lang="ts">
	import {
		CheckIcon,
		XIcon,
		FileTextIcon,
		CalendarIcon,
	} from "lucide-svelte";
	import type { ISettings } from "./index.svelte";
	import {
		CONVERSION_BITRATES,
		type ConversionBitrate,
		SAMPLE_RATES,
		type SampleRate,
	} from "$lib/converters/audio-constants";
	import { settings_conversion_filename_format, settings_conversion_filename_description, settings_conversion_filename_prefix, settings_conversion_filename_var_name, settings_conversion_filename_var_date, settings_conversion_filename_preview, settings_conversion_advanced_settings, settings_conversion_default_format, settings_conversion_default_format_description, settings_conversion_default_format_enable, settings_conversion_default_format_disable, settings_conversion_default_format_image, settings_conversion_default_format_audio, settings_conversion_default_format_video, settings_conversion_default_format_document, settings_conversion_metadata, settings_conversion_metadata_description, settings_conversion_keep, settings_conversion_remove, settings_conversion_quality, settings_conversion_quality_description, settings_conversion_quality_images, settings_conversion_quality_audio, settings_conversion_rate } from "$lib/paraglide/messages/_barrel.js";
	import Dropdown from "$lib/components/functional/Dropdown.svelte";
	import FancyInput from "$lib/components/functional/FancyInput.svelte";
	import { effects } from "$lib/store/index.svelte";
	import FormatDropdown from "$lib/components/functional/FormatDropdown.svelte";
	import { categories } from "$lib/converters";

	const { settings = $bindable() }: { settings: ISettings } = $props();

	// ── Filename builder state ──
	// Parse the existing format string into parts
	function parseFormat(fmt: string) {
		let remaining = fmt;
		let hasName = remaining.includes('%name%');
		let hasDate = remaining.includes('%date%');

		// Extract prefix: everything before the first template variable
		let prefix = remaining
			.replace(/%name%/g, '')
			.replace(/%date%/g, '')
			.replace(/^_+|_+$/g, '')  // trim leading/trailing underscores
			.replace(/_+/g, '_');     // collapse multiple underscores

		return { prefix, hasName, hasDate };
	}

	const parsed = parseFormat(settings.filenameFormat);
	let prefix = $state(parsed.prefix || 'LocalConvert.app');
	let includeName = $state(parsed.hasName);
	let includeDate = $state(parsed.hasDate);

	// Compose back into filenameFormat string
	function compose() {
		const parts: string[] = [];
		if (prefix.trim()) parts.push(prefix.trim());
		if (includeName) parts.push('%name%');
		if (includeDate) parts.push('%date%');
		return parts.join('_') || '%name%';
	}

	// Update settings when any part changes
	$effect(() => {
		const result = compose();
		if (settings.filenameFormat !== result) {
			settings.filenameFormat = result;
		}
	});

	// Example preview
	const exampleName = 'my-photo';
	const exampleDate = new Date().toISOString().slice(0, 10);

	let preview = $derived.by(() => {
		const parts: string[] = [];
		if (prefix.trim()) parts.push(prefix.trim());
		if (includeName) parts.push(exampleName);
		if (includeDate) parts.push(exampleDate);
		return (parts.join('_') || exampleName) + '.png';
	});
</script>

<div class="flex flex-col gap-6">
	<!-- Filename format -->
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<p class="text-base font-bold">
				{settings_conversion_filename_format()}
			</p>
			<p class="text-sm text-muted font-normal">
				{settings_conversion_filename_description()}
			</p>
		</div>

		<!-- Filename builder -->
		<div class="fn-builder">
			<!-- Prefix segment -->
			<div class="fn-segment fn-segment--active">
				<label class="fn-segment-label">{settings_conversion_filename_prefix()}</label>
				<input
					type="text"
					class="fn-segment-input"
					bind:value={prefix}
					placeholder="LocalConvert.app"
				/>
			</div>

			<span class="fn-sep">_</span>

			<!-- Name segment -->
			<button
				class="fn-segment fn-segment--toggle"
				class:fn-segment--active={includeName}
				class:fn-segment--inactive={!includeName}
				onclick={() => includeName = !includeName}
			>
				<span class="fn-segment-label">{settings_conversion_filename_var_name()}</span>
				<span class="fn-segment-value">
					<FileTextIcon size="14" strokeWidth={2} />
					%name%
				</span>
			</button>

			<span class="fn-sep">_</span>

			<!-- Date segment -->
			<button
				class="fn-segment fn-segment--toggle"
				class:fn-segment--active={includeDate}
				class:fn-segment--inactive={!includeDate}
				onclick={() => includeDate = !includeDate}
			>
				<span class="fn-segment-label">{settings_conversion_filename_var_date()}</span>
				<span class="fn-segment-value">
					<CalendarIcon size="14" strokeWidth={2} />
					%date%
				</span>
			</button>

			<span class="fn-ext">.ext</span>
		</div>

		<!-- Live preview -->
		<div class="fn-preview">
			<span class="fn-preview-label">{settings_conversion_filename_preview()}</span>
			<code class="fn-preview-value">{preview}</code>
		</div>
	</div>

	<!-- Advanced settings -->
	<div class="flex flex-col gap-6">
		<div class="border-t border-separator pt-2">
			<p class="text-base font-bold">{settings_conversion_advanced_settings()}</p>
		</div>

		<!-- Default format -->
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<p class="text-base font-bold">
					{settings_conversion_default_format()}
				</p>
				<p class="text-sm text-muted font-normal">
					{settings_conversion_default_format_description()}
				</p>
			</div>
			<div class="flex gap-3 w-full">
				<button
					onclick={() => (settings.useDefaultFormat = true)}
					class="btn {$effects
						? ''
						: '!scale-100'} {settings.useDefaultFormat
						? 'selected'
						: ''} flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
				>
					<CheckIcon size="24" class="inline-block me-2" />
					{settings_conversion_default_format_enable()}
				</button>

				<button
					onclick={() => (settings.useDefaultFormat = false)}
					class="btn {$effects
						? ''
						: '!scale-100'} {settings.useDefaultFormat
						? ''
						: 'selected'} flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
				>
					<XIcon size="24" class="inline-block me-2" />
					{settings_conversion_default_format_disable()}
				</button>
			</div>
			<div
				class="grid gap-3 grid-cols-2 md:grid-cols-4"
				class:opacity-50={!settings.useDefaultFormat}
			>
				<div class="flex flex-col gap-2">
					<p class="text-sm font-bold">
						{settings_conversion_default_format_image()}
					</p>
					<FormatDropdown
						categories={{ image: categories.image }}
						from={".png"}
						bind:selected={settings.defaultFormat.image}
						disabled={!settings.useDefaultFormat}
					/>
				</div>
				<div class="flex flex-col gap-2">
					<p class="text-sm font-bold">
						{settings_conversion_default_format_audio()}
					</p>
					<FormatDropdown
						categories={{ audio: categories.audio }}
						from={".mp3"}
						bind:selected={settings.defaultFormat.audio}
						disabled={!settings.useDefaultFormat}
					/>
				</div>
				<div class="flex flex-col gap-2">
					<p class="text-sm font-bold">
						{settings_conversion_default_format_video()}
					</p>
					<FormatDropdown
						categories={{ video: categories.video }}
						from={".mp4"}
						bind:selected={settings.defaultFormat.video}
						disabled={!settings.useDefaultFormat}
					/>
				</div>
				<div class="flex flex-col gap-2">
					<p class="text-sm font-bold">
						{settings_conversion_default_format_document()}
					</p>
					<FormatDropdown
						categories={{ doc: categories.doc }}
						from={".docx"}
						bind:selected={settings.defaultFormat.document}
						disabled={!settings.useDefaultFormat}
					/>
				</div>
			</div>
		</div>

		<!-- Metadata -->
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<p class="text-base font-bold">
					{settings_conversion_metadata()}
				</p>
				<p class="text-sm text-muted font-normal">
					{settings_conversion_metadata_description()}
				</p>
			</div>
			<div class="flex gap-3 w-full">
				<button
					onclick={() => (settings.metadata = true)}
					class="btn {$effects
						? ''
						: '!scale-100'} {settings.metadata
						? 'selected'
						: ''} flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
				>
					<CheckIcon size="24" class="inline-block me-2" />
					{settings_conversion_keep()}
				</button>

				<button
					onclick={() => (settings.metadata = false)}
					class="btn {$effects
						? ''
						: '!scale-100'} {settings.metadata
						? ''
						: 'selected'} flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
				>
					<XIcon size="24" class="inline-block me-2" />
					{settings_conversion_remove()}
				</button>
			</div>
		</div>

		<!-- Quality -->
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<p class="text-base font-bold">
					{settings_conversion_quality()}
				</p>
				<p class="text-sm text-muted font-normal">
					{settings_conversion_quality_description()}
				</p>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-2">
					<p class="text-sm font-bold">
						{settings_conversion_quality_images()}
					</p>
					<FancyInput
						bind:value={settings.magickQuality as unknown as string}
						type="number"
						min={1}
						max={100}
						placeholder={"100"}
						extension={"%"}
					/>
				</div>
				<div class="flex flex-col gap-2">
					<p class="text-sm font-bold">
						{settings_conversion_quality_audio()}
					</p>
					<Dropdown
						options={CONVERSION_BITRATES.map((b) => b.toString())}
						selected={settings.ffmpegQuality.toString()}
						onselect={(option: string) =>
							(settings.ffmpegQuality = option as ConversionBitrate)}
						settingsStyle
					/>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-2">
					<p class="text-sm font-bold">
						{settings_conversion_rate()}
					</p>
					<Dropdown
						options={SAMPLE_RATES.map((r) => r.toString())}
						selected={settings.ffmpegSampleRate.toString()}
						onselect={(option: string) => {
							settings.ffmpegSampleRate = option as SampleRate;
						}}
						settingsStyle
					/>
				</div>
				<div class="flex flex-col gap-2">
					<p class="text-sm font-bold select-none">
						&nbsp;&nbsp;
					</p>
					<FancyInput
						bind:value={settings.ffmpegCustomSampleRate as unknown as string}
						type="number"
						min={1}
						placeholder={"44100"}
						extension={"Hz"}
						disabled={settings.ffmpegSampleRate !== "custom"}
					/>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* ── Filename builder ── */
	.fn-builder {
		display: flex;
		align-items: flex-end;
		gap: 0;
		flex-wrap: wrap;
		row-gap: 0.5rem;
	}

	.fn-segment {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		border: 1.5px solid var(--bg-separator);
		border-radius: 0.6rem;
		padding: 0.5rem 0.7rem;
		background: var(--bg-panel-highlight);
		transition: border-color 0.2s ease, opacity 0.2s ease, background 0.2s ease;
	}

	.fn-segment--toggle {
		cursor: pointer;
		text-align: start;
	}

	.fn-segment--toggle:hover {
		border-color: var(--accent);
	}

	.fn-segment--active {
		border-color: var(--accent);
		background: var(--bg-badge);
	}

	.fn-segment--inactive {
		opacity: 0.4;
		border-style: dashed;
	}

	.fn-segment--inactive:hover {
		opacity: 0.7;
	}

	.fn-segment-label {
		font-family: var(--font-body);
		font-size: 0.65rem;
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-muted);
		line-height: 1;
	}

	.fn-segment-input {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--fg);
		background: transparent;
		border: none;
		outline: none;
		padding: 0;
		width: 10ch;
		min-width: 6ch;
	}

	.fn-segment-input::placeholder {
		color: var(--fg-muted);
		opacity: 0.5;
	}

	.fn-segment-value {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--accent);
		display: flex;
		align-items: center;
		gap: 0.3rem;
		white-space: nowrap;
	}

	.fn-sep {
		font-family: var(--font-mono);
		font-size: 1rem;
		color: var(--fg-muted);
		opacity: 0.5;
		padding: 0 0.15rem;
		align-self: flex-end;
		padding-bottom: 0.55rem;
	}

	.fn-ext {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--fg-muted);
		align-self: flex-end;
		padding-bottom: 0.55rem;
		padding-inline-start: 0.15rem;
	}

	/* ── Preview ── */
	.fn-preview {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.6rem 0.8rem;
		background: var(--bg-panel-alt);
		border-radius: 0.5rem;
		border: 1px solid var(--bg-separator);
	}

	.fn-preview-label {
		font-family: var(--font-body);
		font-size: 0.7rem;
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-muted);
		flex-shrink: 0;
	}

	.fn-preview-value {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--fg);
		background: none;
		padding: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
