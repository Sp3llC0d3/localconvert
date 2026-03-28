let open = $state(false);

export const commandPalette = {
	get open() { return open; },
	toggle() { open = !open; },
	close() { open = false; },
};
