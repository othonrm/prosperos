import { writable } from 'svelte/store';

export const storable = <T>(key: string, initialValue: T, skipStoring = false) => {
	const storedValue = skipStoring ? null : localStorage.getItem(key);
	const defaultValue = storedValue ? (JSON.parse(storedValue) as T) : initialValue;
	const value = writable<T>(defaultValue);

	if (!skipStoring) {
		value.subscribe((val) => {
			localStorage.setItem(key, JSON.stringify(val));
		});
	}

	return value;
};
