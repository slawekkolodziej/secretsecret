import { writable } from 'svelte/store';

export function persistentStore<T>(key: string, initialValue: T) {
  // Only access localStorage on the client side
  const isBrowser = typeof window !== 'undefined';

  // Get stored value from localStorage or use initialValue
  const storedValue = isBrowser
    ? JSON.parse(localStorage.getItem(key) || 'null')
    : null;

  // Create writable store with the retrieved value or fallback to initialValue
  const store = writable<T>(storedValue !== null ? storedValue : initialValue);

  // Subscribe to store changes and update localStorage
  if (isBrowser) {
    store.subscribe((value) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }

  return store;
}
