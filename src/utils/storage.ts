/* eslint-disable no-empty */
/**
 * Shared localStorage helpers that eliminate repeated try/catch boilerplate.
 */

/** Read an integer from localStorage (returns `fallback` on any error). */
export const getStoredInt = (key: string, fallback: number = 0): number => {
  try {
    return parseInt(localStorage.getItem(key) || String(fallback), 10);
  } catch {
    return fallback;
  }
};

/** Write an integer to localStorage (silently swallows quota / security errors). */
export const setStoredInt = (key: string, value: number): void => {
  try {
    localStorage.setItem(key, value.toString());
  } catch {}
};

/** Read a string from localStorage (returns `fallback` on any error). */
export const getStoredString = (key: string, fallback: string = ''): string => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

/** Write a string to localStorage. */
export const setStoredString = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

/** Read a boolean flag (`"1"` → true, anything else → `fallback`). */
export const getStoredFlag = (key: string, fallback: boolean = false): boolean => {
  try {
    return localStorage.getItem(key) === '1' ? true : fallback;
  } catch {
    return fallback;
  }
};

/** Write a boolean flag as `"1"`. */
export const setStoredFlag = (key: string): void => {
  try {
    localStorage.setItem(key, '1');
  } catch {}
};

/** Read JSON from localStorage (returns `fallback` on any error). */
export const getStoredJSON = <T>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

/** Write JSON to localStorage. */
export const setStoredJSON = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

/** Remove a key from localStorage. */
export const removeStored = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {}
};
