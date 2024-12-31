<script lang="ts">
	import Panel from "$lib/components/visual/Panel.svelte";
	import { MessageCircleQuestionIcon } from "lucide-svelte";
</script>

<Panel class="flex flex-col gap-3 p-6">
    <h2 class="text-2xl font-bold">
        <MessageCircleQuestionIcon
            size="40"
            class="inline-block -mt-1 mr-2 bg-accent p-1.5 rounded-full"
            color="black"
        />
        Why VERT?
    </h2>
    <p class="text-lg font-normal">
        <b>File converters have always disappointed us.</b> They're
        ugly, riddled with ads, and most importantly; slow. We
        decided to solve this problem once and for all by making an
        alternative that solves all those problems, and then some.<br
        />
        <br />
        All your files are converted completely on—device, which means
        that there's no delay between sending and receiving the file
        from a server, and that we never get to snoop on the files you
        convert.
    </p>
</Panel>