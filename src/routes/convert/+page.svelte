<script lang="ts">
	import ConversionPanel from "$lib/components/functional/ConversionPanel.svelte";
	import FormatDropdown from "$lib/components/functional/FormatDropdown.svelte";
	import Uploader from "$lib/components/functional/Uploader.svelte";
	import Panel from "$lib/components/visual/Panel.svelte";
	import ProgressBar from "$lib/components/visual/ProgressBar.svelte";
	import Tooltip from "$lib/components/visual/Tooltip.svelte";
	import { categories, converters } from "$lib/converters";
	import {
		effects,
		files,
		gradientColor,
		showGradient,
		dropdownStates,
	} from "$lib/store/index.svelte";
	import { VertFile } from "$lib/types";
	import {
		AudioLines,
		BookText,
		DownloadIcon,
		FileMusicIcon,
		FileQuestionIcon,
		FileVideo2,
		FilmIcon,
		ImageIcon,
		ImageOffIcon,
		RotateCwIcon,
		XIcon,
	} from "lucide-svelte";
	import { m } from "$lib/paraglide/messages";
	import { Settings } from "$lib/sections/settings/index.svelte";
	import { MAX_ARRAY_BUFFER_SIZE } from "$lib/store/index.svelte";
	import { GB } from "$lib/util/consts";
	import { log } from "$lib/util/logger";
	import errorConversion from "$lib/assets/errors/error-conversion.png";
	import { page } from "$app/state";
	import { CONVERSION_BITRATES } from "$lib/converters/ffmpeg.svelte";

	// LocalConvert: video formats are non-native ffmpeg formats
	const videoFormatNames = converters
		.find((c) => c.name === "ffmpeg")
		?.supportedFormats.filter((f) => !f.isNative)
		.map((f) => f.name) || [];

	const isVideoFormat = (format: string) => videoFormatNames.includes(format);

	let processedFileIds = $state(new Set<string>());

	$effect(() => {
		if (!Settings.instance.settings || files.files.length === 0) return;

		files.files.forEach((file) => {
			const settings = Settings.instance.settings;
			if (processedFileIds.has(file.id)) return;

			const converter = file.findConverter();
			if (!converter) return;

			let category: string | undefined;
			const isImage = converter.name === "imagemagick";
			const isAudio = converter.name === "ffmpeg" && !isVideoFormat(file.from);
			const isVideo = converter.name === "ffmpeg" && isVideoFormat(file.from);
			const isDocument = converter.name === "pandoc";

			if (isImage) category = "image";
			else if (isAudio) category = "audio";
			else if (isVideo) category = "video";
			else if (isDocument) category = "doc";
			if (!category) return;

			let targetFormat: string | undefined;

			// check for ?to= URL param (used by converter landing pages)
			const urlTo = page.url.searchParams.get("to");
			if (
				urlTo &&
				urlTo !== file.from.replace(".", "") &&
				categories[category]?.formats.includes(urlTo)
			) {
				targetFormat = urlTo;
			}

			// restore saved format (if navigated back to page for example)
			const savedFormat = $dropdownStates[file.name];
			if (
				savedFormat &&
				savedFormat !== file.from &&
				categories[category]?.formats.includes(savedFormat)
			) {
				targetFormat = savedFormat;
			} else if (settings.useDefaultFormat) {
				// else use default format if enabled
				let defaultFormat: string | undefined;
				const df = settings.defaultFormat;
				if (category === "image") defaultFormat = df.image;
				else if (category === "audio") defaultFormat = df.audio;
				else if (category === "video") defaultFormat = df.video;
				else if (category === "doc") defaultFormat = df.document;

				if (
					defaultFormat &&
					defaultFormat !== file.from &&
					categories[category]?.formats.includes(defaultFormat)
				) {
					targetFormat = defaultFormat;
				}
			}

			// or use first available format (or if default format is same as input)
			if (!targetFormat) {
				const firstDiff = categories[category]?.formats.find(
					(f) => f !== file.from,
				);
				targetFormat =
					firstDiff || categories[category]?.formats[0] || "";
			}

			file.to = targetFormat;
			processedFileIds.add(file.id);
		});
	});

	const handleSelect = (option: string, file: VertFile) => {
		file.result = null;
	};

	$effect(() => {
		// Set gradient color depending on the file types
		let type = "";
		if (files.files.length) {
			const converterNames = files.files.map(
				(file) => file.findConverter()?.name,
			);
			const uniqueTypes = new Set(converterNames);

			if (uniqueTypes.size === 1) {
				const onlyType = converterNames[0];
				if (onlyType === "imagemagick") type = "blue";
				else if (onlyType === "ffmpeg") {
					// check if all files are video or all audio
					const allVideo = files.files.every((f) => isVideoFormat(f.from));
					type = allVideo ? "red" : "purple";
				}
				else if (onlyType === "pandoc") type = "green";
			}
		}

		if (files.files.length === 0 || !type) {
			showGradient.set(false);
		} else showGradient.set(true);

		gradientColor.set(type);
	});
</script>

{#snippet fileItem(file: VertFile, index: number)}
	{@const currentConverter = file.findConverter()}
	{@const isImage = currentConverter?.name === "imagemagick"}
	{@const isAudio = currentConverter?.name === "ffmpeg" && !isVideoFormat(file.from)}
	{@const isVideo = currentConverter?.name === "ffmpeg" && isVideoFormat(file.from)}
	{@const isDocument = currentConverter?.name === "pandoc"}
	<Panel class="p-5 flex flex-col min-w-0 gap-4 relative">
		<div class="flex-shrink-0 h-8 w-full flex items-center gap-2">
			{#if !converters.length}
				<Tooltip
					text={m["convert.tooltips.unknown_file"]()}
					position="bottom"
				>
					<FileQuestionIcon size="24" class="flex-shrink-0" />
				</Tooltip>
			{:else if isAudio}
				<Tooltip
					text={m["convert.tooltips.audio_file"]()}
					position="bottom"
				>
					<AudioLines size="24" class="flex-shrink-0" />
				</Tooltip>
			{:else if isVideo}
				<Tooltip
					text={m["convert.tooltips.video_file"]()}
					position="bottom"
				>
					<FilmIcon size="24" class="flex-shrink-0" />
				</Tooltip>
			{:else if isDocument}
				<Tooltip
					text={m["convert.tooltips.document_file"]()}
					position="bottom"
				>
					<BookText size="24" class="flex-shrink-0" />
				</Tooltip>
			{:else}
				<Tooltip
					text={m["convert.tooltips.image_file"]()}
					position="bottom"
				>
					<ImageIcon size="24" class="flex-shrink-0" />
				</Tooltip>
			{/if}
			<div class="flex-grow overflow-hidden">
				{#if file.processing}
					<ProgressBar
						min={0}
						max={100}
						progress={currentConverter?.reportsProgress || file.isZip()
							? file.progress
							: null}
					/>
				{:else}
					<h2
						class="text-xl font-body overflow-hidden text-ellipsis whitespace-nowrap"
						title={file.name}
					>
						{file.name}
					</h2>
				{/if}
			</div>
			<button
				class="flex-shrink-0 w-8 rounded-full hover:bg-panel-alt h-full flex items-center justify-center"
				onclick={async () => {
					await file.cancel();
					files.files = files.files.filter((_, i) => i !== index);
				}}
			>
				<XIcon size="24" class="text-muted" />
			</button>
		</div>
		{#if !currentConverter}
			<div
				class="h-full flex flex-col text-center justify-center text-failure"
			>
				<p class="font-body font-bold">
					{m["convert.errors.cant_convert"]()}
				</p>
				<p class="font-normal">
					{m["convert.errors.unsupported_format"]()}
				</p>
			</div>
		{:else}
			{@const formatInfo = currentConverter.supportedFormats.find(
				(f) => f.name === file.from,
			)}
			{@const isLarge = file.isLarge()}
			{#if formatInfo && !formatInfo.fromSupported}
				<div
					class="h-full flex flex-col text-center justify-center text-failure"
				>
					<p class="font-body font-bold">
						{m["convert.errors.cant_convert"]()}
					</p>
					<p class="font-normal">
						{m["convert.errors.format_output_only"]()}
					</p>
				</div>
			{:else if isLarge && !file.supportsStreaming()}
				<div
					class="h-full flex flex-col text-center justify-center text-failure"
				>
					<p class="font-body font-bold">
						{m["convert.errors.cant_convert"]()}
					</p>
					<p class="font-normal">
						{m["workers.errors.file_too_large"]({
							limit: (MAX_ARRAY_BUFFER_SIZE / GB).toFixed(2),
						})}
					</p>
				</div>
			{:else if currentConverter.status === "downloading"}
				<div
					class="h-full flex flex-col text-center justify-center text-failure"
				>
					<p class="font-body font-bold">
						{m["convert.errors.cant_convert"]()}
					</p>
					<p class="font-normal">
						{m["convert.errors.worker_downloading"]({
							type: isAudio || isVideo
								? isVideo
									? "Video"
									: m["convert.errors.audio"]()
								: isDocument
									? m["convert.errors.doc"]()
									: m["convert.errors.image"](),
						})}
					</p>
				</div>
			{:else if currentConverter.status === "error"}
				<div
					class="h-full flex flex-col text-center justify-center text-failure"
				>
					<p class="font-body font-bold">
						{m["convert.errors.cant_convert"]()}
					</p>
					<p class="font-normal">
						{m["convert.errors.worker_error"]({
							type: isAudio || isVideo
								? isVideo
									? "Video"
									: m["convert.errors.audio"]()
								: isDocument
									? m["convert.errors.doc"]()
									: m["convert.errors.image"](),
						})}
					</p>
				</div>
			{:else if currentConverter.status === "not-ready"}
				<div
					class="h-full flex flex-col text-center justify-center text-failure"
				>
					<p class="font-body font-bold">
						{m["convert.errors.cant_convert"]()}
					</p>
					<p class="font-normal">
						{m["convert.errors.worker_timeout"]({
							type: isAudio || isVideo
								? isVideo
									? "Video"
									: m["convert.errors.audio"]()
								: isDocument
									? m["convert.errors.doc"]()
									: m["convert.errors.image"](),
						})}
					</p>
				</div>
			{:else if file.conversionError}
				<div class="flex flex-col items-center justify-center gap-3 py-2">
					<img src={errorConversion} alt="" class="w-20 h-20 object-contain" />
					<p class="text-sm text-failure font-medium">{m["convert.errors.cant_convert"]()}</p>
					<button class="btn text-sm px-4 py-2" onclick={() => file.convert()}>Try again</button>
				</div>
			{:else}
				<!-- preview area — relative so absolute controls scope to this 152px box -->
				<div class="relative h-[152px]">
					<div class="flex gap-4 w-full h-full overflow-hidden">
						<div class="w-1/2 h-full overflow-hidden rounded-xl">
							{#if file.blobUrl}
								<img
									class="object-cover w-full h-full"
									src={file.blobUrl}
									alt={file.name}
								/>
							{:else}
								<div
									class="w-full h-full flex items-center justify-center text-black"
									style="background: var({isAudio
										? '--bg-gradient-purple-alt'
										: isVideo
											? '--bg-gradient-red-alt'
											: isDocument
												? '--bg-gradient-green-alt'
												: '--bg-gradient-blue-alt'})"
								>
									{#if isAudio}
										<FileMusicIcon size="56" />
									{:else if isVideo}
										<FileVideo2 size="56" />
									{:else if isDocument}
										<BookText size="56" />
									{:else}
										<ImageOffIcon size="56" />
									{/if}
								</div>
							{/if}
						</div>
					</div>
					<div
						class="absolute top-0 right-0 mr-4 pl-2 h-full w-[calc(50%-38px)] pr-4 flex items-center justify-center"
					>
						<div
							class="w-[122px] h-fit flex flex-col gap-2 items-center justify-center"
						>
							<FormatDropdown
								{categories}
								from={file.from}
								bind:selected={file.to}
								onselect={(option) =>
									handleSelect(option, file)}
								{file}
							/>
							<div
								class="w-full flex items-center justify-between"
							>
								<Tooltip
									text={m["convert.tooltips.convert_file"]()}
									position="bottom"
								>
									<button
										class="btn {$effects
											? ''
											: '!scale-100'} p-0 w-14 h-14 text-black {isAudio
											? 'bg-accent-purple'
											: isVideo
												? 'bg-accent-red'
												: isDocument
													? 'bg-accent-green'
													: 'bg-accent-blue'}"
										disabled={!files.ready}
										onclick={() => file.convert()}
									>
										<RotateCwIcon size="24" />
									</button>
								</Tooltip>
								<Tooltip
									text={m["convert.tooltips.download_file"]()}
									position="bottom"
								>
									<button
										class="btn {$effects
											? ''
											: '!scale-100'} p-0 w-14 h-14"
										onclick={file.download}
										disabled={!file.result}
									>
										<DownloadIcon size="24" />
									</button>
								</Tooltip>
							</div>
						</div>
					</div>
				</div>

				<!-- Per-file quality controls -->
				{#if isImage || isAudio || isVideo}
					<div class="file-options">
						{#if isImage}
							{@const effectiveQuality = file.optQuality ?? Settings.instance.settings.magickQuality}
							<div class="opt-group">
								<span class="opt-label">Quality</span>
								<div class="opt-control">
									<input
										type="range" min={1} max={100}
										value={effectiveQuality}
										oninput={(e) => { file.optQuality = Number((e.target as HTMLInputElement).value); }}
										class="quality-slider"
									/>
									<span class="opt-value">{effectiveQuality}%</span>
								</div>
							</div>
							<div class="opt-group">
								<span class="opt-label">Resize</span>
								<div class="opt-control gap-1">
									<input
										type="number" min={1} placeholder="W"
										bind:value={file.optWidth}
										class="dim-input"
									/>
									<span class="opt-value">×</span>
									<input
										type="number" min={1} placeholder="H"
										bind:value={file.optHeight}
										class="dim-input"
									/>
									<span class="opt-value">px</span>
								</div>
							</div>
						{/if}
						{#if isAudio}
							<div class="opt-group">
								<span class="opt-label">Bitrate</span>
								<div class="opt-control">
									<select
										class="opt-select"
										value={file.optBitrate ?? Settings.instance.settings.ffmpegQuality.toString()}
										onchange={(e) => { file.optBitrate = (e.target as HTMLSelectElement).value; }}
									>
										{#each CONVERSION_BITRATES as br}
											<option value={br.toString()}>
												{br === "auto" ? "Auto" : `${br} kbps`}
											</option>
										{/each}
									</select>
								</div>
							</div>
						{/if}
						{#if isAudio || isVideo}
							<div class="opt-group">
								<span class="opt-label">Trim</span>
								<div class="opt-control gap-1">
									<input
										type="number" min={0} step={1} placeholder="0"
										bind:value={file.optTrimStart}
										class="time-input"
									/>
									<span class="opt-value">s →</span>
									<input
										type="number" min={0} step={1} placeholder="end"
										bind:value={file.optTrimEnd}
										class="time-input"
									/>
									<span class="opt-value">s</span>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			{/if}
		{/if}
	</Panel>
{/snippet}

<div class="flex flex-col justify-center items-center gap-8 px-4 md:p-0">
	<div class="max-w-[778px] w-full">
		<ConversionPanel />
	</div>

	<div
		class="w-full max-w-[778px] grid grid-cols-1 md:grid-cols-2 auto-rows-auto gap-4 md:p-0"
	>
		{#each files.files as file, i (file.id)}
			{#if files.files.length >= 2 && i === 1}
				<Uploader
					class="w-full h-full col-start-1 row-start-1 md:col-start-2"
				/>
			{/if}
			{@render fileItem(file, i)}
			{#if files.files.length < 2}
				<Uploader class="w-full h-full" />
			{/if}
		{/each}
		{#if files.files.length === 0}
			<Uploader class="w-full min-h-[240px] col-span-2" />
		{/if}
	</div>
</div>

<style lang="postcss">
	/* ── Per-file options strip ── */
	.file-options {
		@apply flex flex-col gap-2 pt-2 border-t border-separator;
	}

	.opt-group {
		@apply flex items-center gap-2 text-sm;
	}

	.opt-label {
		@apply w-14 flex-shrink-0 text-xs font-semibold;
		color: var(--fg-muted);
	}

	.opt-control {
		@apply flex items-center gap-2 flex-1 min-w-0;
	}

	.opt-value {
		@apply text-xs flex-shrink-0;
		color: var(--fg-muted);
	}

	.quality-slider {
		@apply flex-1 h-1.5 appearance-none rounded-full cursor-pointer;
		background: var(--bg-separator);
		accent-color: var(--accent-pink);
	}

	.dim-input,
	.time-input {
		@apply w-14 rounded-lg px-2 py-1 text-xs text-center border border-separator;
		background: var(--bg-panel-alt, var(--bg-panel));
		color: var(--fg);
	}

	.dim-input:focus,
	.time-input:focus {
		outline: 1.5px solid var(--accent-pink);
	}

	.opt-select {
		@apply rounded-lg px-2 py-1 text-xs border border-separator cursor-pointer;
		background: var(--bg-panel-alt, var(--bg-panel));
		color: var(--fg);
	}

	.opt-select:focus {
		outline: 1.5px solid var(--accent-pink);
	}
</style>
