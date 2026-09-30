import { useSyncExternalStore } from 'react';

// Stories watched since the app opened; their rings turn grey, as on
// Instagram. Kept in memory only: a fresh start shows every ring again.
const seen = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

export function markStorySeen(vendorId: string) {
  if (seen.has(vendorId)) return;
  seen.add(vendorId);
  version += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Whether a vendor's story has been watched; re-renders when that changes. */
export function useStorySeen(): (vendorId: string) => boolean {
  useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
  return (vendorId) => seen.has(vendorId);
}
