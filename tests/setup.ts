import "@testing-library/jest-dom/vitest";

if (
	!globalThis.localStorage ||
	typeof globalThis.localStorage.getItem !== "function" ||
	typeof globalThis.localStorage.clear !== "function"
) {
	const storage = new Map<string, string>();
	const mockLocalStorage = {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => {
			storage.set(key, String(value));
		},
		removeItem: (key: string) => {
			storage.delete(key);
		},
		clear: () => {
			storage.clear();
		},
		key: (index: number) => Array.from(storage.keys())[index] ?? null,
		get length() {
			return storage.size;
		},
	};

	Object.defineProperty(globalThis, "localStorage", {
		value: mockLocalStorage,
		configurable: true,
		writable: true,
	});
}
