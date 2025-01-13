import { browser } from "$app/environment";
import { theme } from "$lib/store/index.svelte";
import JSCookie from "js-cookie";

export const load = ({ data }) => {
	if (!browser) return;
	window.plausible =
		window.plausible ||
		((_, opts) => {
			opts?.callback?.({
				status: 200,
			});
		});
	const themeStr = JSCookie.get("theme");
	if (typeof themeStr === "undefined") {
		theme.dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		JSCookie.set("theme", theme.dark ? "dark" : "light", {
			sameSite: "strict",
			path: "/",
			expires: 2147483647,
		});
	} else {
		theme.dark = themeStr === "dark";
	}
	theme.dark = JSCookie.get("theme") === "dark";
	window.plausible("Theme set", {
		props: { theme: theme.dark ? "dark" : "light" },
	});
	return data;
};

export const prerender = true;
