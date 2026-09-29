/**
 * Small key-value storage for per-device settings (language, text size, last
 * location). Backed by expo-sqlite's kv-store, which works in Expo Go and has a
 * synchronous API so settings can be read before the first render.
 */
import Storage from 'expo-sqlite/kv-store';

export const StorageKeys = {
  locale: 'settings.locale',
} as const;

export function readSetting(key: string): string | null {
  try {
    return Storage.getItemSync(key);
  } catch {
    return null;
  }
}

export async function writeSetting(key: string, value: string): Promise<void> {
  try {
    await Storage.setItem(key, value);
  } catch {
    // Storage is a convenience; the app must keep working without it.
  }
}
