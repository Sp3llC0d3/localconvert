import sanitizeHtml from "sanitize-html";

export function sanitize(
	html: string,
	allowedTags: string[] = ["a", "b", "code", "br"],
): string {
	return sanitizeHtml(html, {
		allowedTags: allowedTags,
		allowedAttributes: {
			a: ["href", "target", "rel", "class"],
			"*": ["class"],
		},
		allowedSchemes: ["http", "https", "mailto", "blob"],
	});
}
