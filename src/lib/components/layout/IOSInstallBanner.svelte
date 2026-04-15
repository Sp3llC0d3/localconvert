<script lang="ts">
	import { browser } from "$app/environment";
	import { XIcon, ShareIcon } from "lucide-svelte";
	import { aria_dismiss } from "$lib/paraglide/messages/_barrel.js";

	let show = $state(false);
	let dismissed = $state(false);

	if (browser) {
		// Only show on iOS Safari when not already installed as PWA
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		const isStandalone = window.matchMedia("(display-mode: standalone)").matches
			|| (navigator as any).standalone === true;
		const wasDismissed = localStorage.getItem("ios-install-dismissed");

		if (isIOS && !isStandalone && !wasDismissed) {
			// Delay showing the banner so it doesn't flash on load
			setTimeout(() => {
				show = true;
			}, 3000);
		}
	}

	function dismiss() {
		show = false;
		dismissed = true;
		localStorage.setItem("ios-install-dismissed", "true");
	}
</script>

{#if show && !dismissed}
	<div
		class="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4 md:bottom-4"
	>
		<div
			class="flex items-center gap-3 bg-panel border border-separator rounded-2xl px-4 py-3 shadow-lg max-w-md w-full"
		>
			<div class="flex-1 flex items-center gap-3">
				<div class="rounded-full bg-accent-purple p-2 shrink-0">
					<ShareIcon size={16} color="black" />
				</div>
				<div class="text-sm">
					<p class="font-medium">Install LocalConvert</p>
					<p class="text-muted text-xs">
						Tap <ShareIcon size={12} class="inline -mt-0.5" /> then <b>"Add to Home Screen"</b>
					</p>
				</div>
			</div>
			<button
				onclick={dismiss}
				class="shrink-0 p-1 rounded-full hover:bg-panel-highlight transition-colors"
				aria-label={aria_dismiss()}
			>
				<XIcon size={18} />
			</button>
		</div>
	</div>
{/if}
