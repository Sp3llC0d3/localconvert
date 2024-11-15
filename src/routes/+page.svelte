<script lang="ts">
	// this comment was written on 15/11/2024 at 16:01 GMT.
	// i bet to myself that i could complete this whole redesign implementation
	// by the time realmy got started on it. i guess we'll see how that goes
	//
	// ship fast n break things !!
	// -- nullptr

	import VertVBig from "$lib/assets/vert-bg.svg?component";
	import Uploader from "$lib/components/functional/Uploader.svelte";
</script>

<div
	class="absolute -z-50 top-0 left-0 w-full h-full flex items-center justify-center overflow-hidden"
>
	<VertVBig class="fill-[--fg] opacity-50" />
</div>

<div class="w-screen h-screen flex items-center justify-center">
	<div class="max-w-5xl w-full">
		<div class="flex items-center h-[266px] gap-24">
			<div class="flex-grow w-full">
				<h1 class="text-6xl tracking-tight leading-[72px] mb-6">
					The file converter you'll love.
				</h1>
				<p class="font-normal text-xl text-muted">
					All processing done on your device. No file size limit, no
					ads, and completely open source.
				</p>
			</div>
			<div class="flex-grow w-full h-full">
				<Uploader class="w-full h-full" />
			</div>
		</div>
	</div>
</div>
