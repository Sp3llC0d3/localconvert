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
	class="w-screen px-8 h-full flex items-center justify-center overflow-hidden"
>
	<div
		class="absolute -z-30 top-0 left-0 w-screen h-screen flex items-center justify-center overflow-hidden"
	>
		<VertVBig class="fill-[--fg] opacity-50" />
	</div>

	<div class="w-screen flex items-center justify-center flex-grow -mt-0 md:-mt-12">
		<div class="max-w-5xl w-full">
			<div
				class="flex items-center h-auto gap-12 md:gap-24 md:flex-row flex-col"
			>
				<div class="flex-grow w-full text-center md:text-left">
					<h1
						class="text-4xl px-12 md:p-0 md:text-6xl flex-wrap tracking-tight leading-tight md:leading-[72px] mb-4 md:mb-6"
					>
						The file converter you'll love.
					</h1>
					<p
						class="font-normal px-5 md:p-0 text-lg md:text-xl text-black opacity-60 dynadark:text-white dynadark:opacity-60"
					>
						All processing is done on your device. No file size
						limit, no ads, and completely open source.
					</p>
				</div>
				<div class="flex-grow w-11/12 md:w-full h-72">
					<Uploader class="w-full h-full" />
				</div>
			</div>
		</div>
	</div>
</div>
