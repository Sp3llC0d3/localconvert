import { browser } from "$app/environment";
import { theme } from "$lib/store/index.svelte";

export const load = ({ data }) => {
	if (!browser) return;
	window.plausible =
		window.plausible ||
		((_, opts) => {
			opts?.callback?.({
				status: 200,
			});
		});
	window.plausible("Theme set", {
		props: { theme: theme.dark ? "dark" : "light" },
	});
	theme.dark = localStorage.getItem("theme") === "dark";
	return data;
};

export const prerender = true;
