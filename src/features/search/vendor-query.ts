import { useEffect, useState } from 'react';

/** Fewer characters than this match too many vendors to be useful. */
export const MIN_VENDOR_QUERY = 2;

/**
 * What to send to search_vendors for the text in the search box, or null when
 * it's too short to search yet. The database matches with ILIKE, where % and _
 * are wildcards (a lone % would list every vendor), so they become spaces.
 */
export function vendorQuery(text: string): string | null {
  const query = text
    .replace(/[%_\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return [...query].length >= MIN_VENDOR_QUERY ? query : null;
}

/** The value once it has stopped changing for `delay` ms (one query per pause in typing). */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
}
