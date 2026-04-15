import type { Handle } from "@sveltejs/kit";
import { paraglideMiddleware } from "$lib/paraglide/server";

// creating a handle to use the paraglide middleware
const paraglideHandle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(
		event.request,
		({ request: localizedRequest, locale }) => {
			event.request = localizedRequest;
			const rtlLocales = ["ar", "fa"];
			const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";
			return resolve(event, {
				transformPageChunk: ({ html }) => {
					return html.replace("%lang%", locale).replace("%dir%", dir);
				},
			});
		},
	);

export const handle: Handle = paraglideHandle;
