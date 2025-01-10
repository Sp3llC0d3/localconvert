<script lang="ts">
	import * as Settings from "$lib/sections/settings";
	import { SettingsIcon } from "lucide-svelte";

</script>

<div class="flex flex-col h-full items-center">
	<h1 class="hidden md:block text-[40px] tracking-tight leading-[72px] mb-6">
		<SettingsIcon size="40" class="inline-block -mt-2 mr-2" />
		Settings
	</h1>

	<div
		class="w-full max-w-[1280px] flex flex-col md:flex-row gap-4 p-4 md:px-4 md:py-0"
	>
		<!-- Why VERT? & Credits -->
		<div class="flex flex-col gap-4 flex-1">
            <Settings.Conversion />
		</div>
        
        <div class="flex flex-col gap-4 flex-1">
            <Settings.Appearance />
		</div>
	</div>
</div>
