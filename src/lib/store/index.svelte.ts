import { browser } from "$app/environment";
import { log } from "$lib/logger";
import { VertFile } from "$lib/types";
import JSCookie from "js-cookie";

class Files {
	public files = $state<VertFile[]>([]);
}

class Theme {
	private _dark = $state(false);
	public get dark() {
		return this._dark;
	}
	public set dark(value: boolean) {
		this._dark = value;
		if (!browser) return;
		JSCookie.set("theme", this.dark ? "dark" : "light", {
			path: "/",
			sameSite: "lax",
			expires: 2147483647,
		});
		log(["theme"], `set to ${this.dark ? "dark" : "light"}`);
		window.plausible("Theme set", {
			props: { theme: theme.dark ? "dark" : "light" },
		});
		if (value) {
			document.documentElement.classList.add("dark");
			document.documentElement.classList.remove("light");
			JSCookie.set("theme", "dark", {
				path: "/",
				sameSite: "lax",
				expires: 2147483647,
			});
		} else {
			document.documentElement.classList.add("light");
			document.documentElement.classList.remove("dark");
			JSCookie.set("theme", "light", {
				path: "/",
				sameSite: "lax",
				expires: 2147483647,
			});
		}
	}
	public toggle = () => {
		this.dark = !this.dark;
	};
}

export const files = new Files();
export const theme = new Theme();
