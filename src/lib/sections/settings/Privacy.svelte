<script lang="ts">
	import {
		XIcon,
		CheckIcon,
		RefreshCwIcon,
		Trash2Icon,
	} from "lucide-svelte";
	import type { ISettings } from "./index.svelte";
	import { effects } from "$lib/store/index.svelte";
	import { settings_privacy_cache_cleared, settings_privacy_cache_clear_error, settings_privacy_clear_all_data_confirm_title, settings_privacy_clear_all_data_confirm, settings_privacy_clear_all_data_cancel, settings_privacy_clear_all_data, settings_privacy_all_data_cleared, settings_privacy_all_data_clear_error, settings_privacy_cache_title, settings_privacy_cache_description, settings_privacy_total_size, settings_privacy_loading_cache, settings_privacy_files_cached_label, settings_privacy_refresh_cache, settings_privacy_clear_cache, settings_privacy_site_data_title, settings_privacy_site_data_description } from "$lib/paraglide/messages/_barrel.js";
	import { sanitize } from "$lib/util/sanitize";
	import { swManager, type CacheInfo } from "$lib/util/sw";
	import { onMount } from "svelte";
	import { error } from "$lib/util/logger";
	import { ToastManager } from "$lib/util/toast.svelte";
	import { addDialog } from "$lib/store/DialogProvider";

	const { settings = $bindable() }: { settings: ISettings } = $props();

	let cacheInfo = $state<CacheInfo | null>(null);
	let isLoadingCache = $state(false);

	async function loadCacheInfo() {
		if (isLoadingCache) return;
		isLoadingCache = true;
		try {
			await swManager.init();

			if ("serviceWorker" in navigator) {
				await navigator.serviceWorker.ready;
			}

			if (!navigator.serviceWorker.controller) {
				await new Promise((resolve) => setTimeout(resolve, 500));
			}

			cacheInfo = await swManager.getCacheInfo();
		} catch (err) {
			error(["privacy", "cache"], "Failed to load cache info:", err);
		} finally {
			isLoadingCache = false;
		}
	}

	async function clearCache() {
		if (isLoadingCache) return;
		isLoadingCache = true;
		try {
			await swManager.clearCache();
			cacheInfo = null;
			await loadCacheInfo();
			ToastManager.add({
				type: "success",
				message: settings_privacy_cache_cleared(),
			});
		} catch (err) {
			error(["privacy", "cache"], "Failed to clear cache:", err);
			ToastManager.add({
				type: "error",
				message: settings_privacy_cache_clear_error(),
			});
		} finally {
			isLoadingCache = false;
		}
	}

	async function clearAllData() {
		if (isLoadingCache) return;

		addDialog(
			settings_privacy_clear_all_data_confirm_title(),
			settings_privacy_clear_all_data_confirm(),
			[
				{
					text: settings_privacy_clear_all_data_cancel(),
					action: () => {},
				},
				{
					text: settings_privacy_clear_all_data(),
					action: async () => {
						isLoadingCache = true;
						try {
							await swManager.clearCache();
							localStorage.clear();
							sessionStorage.clear();

							ToastManager.add({
								type: "success",
								message:
									settings_privacy_all_data_cleared(),
							});

							setTimeout(() => {
								window.location.href = "/";
							}, 1500);
						} catch (err) {
							error(
								["privacy", "data"],
								`Failed to clear all data: ${err}`,
							);
							ToastManager.add({
								type: "error",
								message:
									settings_privacy_all_data_clear_error(),
							});
						} finally {
							isLoadingCache = false;
						}
					},
				},
			],
			"warning",
		);
	}

	onMount(() => {
		loadCacheInfo();
	});
</script>

<div class="flex flex-col gap-8">
	<!-- Cache management -->
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<p class="text-base font-bold">
				{settings_privacy_cache_title()}
			</p>
			<p class="text-sm text-muted font-normal">
				{settings_privacy_cache_description()}
			</p>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div class="bg-button p-4 rounded-lg">
				<div class="text-sm text-muted">
					{settings_privacy_total_size()}
				</div>
				<div class="text-lg font-bold flex items-center gap-2">
					{#if isLoadingCache}
						<RefreshCwIcon size="16" class="animate-spin" />
						{settings_privacy_loading_cache()}
					{:else}
						{cacheInfo
							? swManager.formatSize(cacheInfo.totalSize)
							: "0 B"}
					{/if}
				</div>
			</div>
			<div class="bg-button p-4 rounded-lg">
				<div class="text-sm text-muted">
					{settings_privacy_files_cached_label()}
				</div>
				<div class="text-lg font-bold flex items-center gap-2">
					{#if isLoadingCache}
						<RefreshCwIcon size="16" class="animate-spin" />
						{settings_privacy_loading_cache()}
					{:else}
						{cacheInfo?.fileCount ?? 0}
					{/if}
				</div>
			</div>
		</div>

		<div class="flex gap-3 w-full">
			<button
				onclick={loadCacheInfo}
				class="btn {$effects
					? ''
					: '!scale-100'} flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
				disabled={isLoadingCache}
			>
				<RefreshCwIcon size="24" class="inline-block me-2" />
				{settings_privacy_refresh_cache()}
			</button>
			<button
				onclick={clearCache}
				class="btn {$effects
					? ''
					: '!scale-100'} flex-1 p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
				disabled={isLoadingCache}
			>
				<Trash2Icon size="24" class="inline-block me-2" />
				{settings_privacy_clear_cache()}
			</button>
		</div>
	</div>

	<!-- Site data -->
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<p class="text-base font-bold">
				{settings_privacy_site_data_title()}
			</p>
			<p class="text-sm text-muted font-normal">
				{settings_privacy_site_data_description()}
			</p>
		</div>

		<button
			onclick={clearAllData}
			class="btn {$effects
				? ''
				: '!scale-100'} w-full p-4 rounded-lg text-black dynadark:text-white flex items-center justify-center"
			disabled={isLoadingCache}
		>
			<Trash2Icon size="24" class="inline-block me-2" />
			{settings_privacy_clear_all_data()}
		</button>
	</div>
</div>
