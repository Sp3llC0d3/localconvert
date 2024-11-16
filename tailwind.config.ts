import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {
			backgroundColor: {
				panel: "var(--bg-panel)",
				"panel-accented": "var(--bg-panel-accented)",
				separator: "var(--bg-separator)",
				button: "var(--bg-button)",
				"panel-alt": "var(--bg-panel-alt)",
				badge: "var(--bg-badge)",
			},
			borderColor: {
				separator: "var(--bg-separator)",
			},
			textColor: {
				foreground: "var(--fg)",
				muted: "var(--fg-muted)",
				"on-accent": "var(--fg-on-accent)",
				"on-badge": "var(--fg-on-badge)",
			},
			colors: {
				accent: "var(--accent)",
			},
			boxShadow: {
				panel: "var(--shadow-panel)",
			},
			fontFamily: {
				display: "var(--font-display)",
				body: "var(--font-body)",
			},
			blur: {
				xs: "2px",
			},
			borderRadius: {
				"2.5xl": "1.25rem",
			},
		},
	},

	plugins: [
		plugin(function ({ addVariant }) {
			addVariant("dynadark", [
				":root:not(.light).dark &",
				"@media (prefers-color-scheme: dark) { :root:not(.light) &",
			]);
		}),
	],
} satisfies Config;
