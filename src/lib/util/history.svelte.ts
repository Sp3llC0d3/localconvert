/**
 * Generic undo/redo history using Svelte 5 runes.
 * Stores deep-cloned snapshots of state (max 50).
 */

const MAX_HISTORY = 50;

export function createHistory<T>(initial: T) {
	let stack = $state<T[]>([structuredClone(initial)]);
	let pointer = $state(0);
	let _canUndo = $derived(pointer > 0);
	let _canRedo = $derived(pointer < stack.length - 1);

	return {
		get canUndo(): boolean {
			return _canUndo;
		},

		get canRedo(): boolean {
			return _canRedo;
		},

		push(state: T) {
			// Truncate any redo history
			stack = [...stack.slice(0, pointer + 1), structuredClone(state)];
			pointer = stack.length - 1;
			// Cap size
			if (stack.length > MAX_HISTORY) {
				stack = stack.slice(stack.length - MAX_HISTORY);
				pointer = stack.length - 1;
			}
		},

		undo(): T | undefined {
			if (pointer > 0) {
				pointer--;
				return structuredClone(stack[pointer]);
			}
		},

		redo(): T | undefined {
			if (pointer < stack.length - 1) {
				pointer++;
				return structuredClone(stack[pointer]);
			}
		},

		reset(state: T) {
			stack = [structuredClone(state)];
			pointer = 0;
		},
	};
}
