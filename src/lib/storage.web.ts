/**
 * The web version of src/lib/storage.ts: browsers have localStorage, so the
 * web build doesn't need expo-sqlite (whose web version needs WebAssembly
 * set up in Metro). While the web build pre-renders pages in Node there is no
 * localStorage, so settings read as unset.
 */
export { StorageKeys } from './storage-keys';

function browserStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    // Some browsers throw when site data is blocked
    return null;
  }
}

export function readSetting(key: string): string | null {
  try {
    return browserStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export async function writeSetting(key: string, value: string): Promise<void> {
  try {
    browserStorage()?.setItem(key, value);
  } catch {
    // Storage is a convenience; the app must keep working without it.
  }
}
