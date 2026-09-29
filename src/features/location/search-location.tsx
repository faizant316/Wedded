import { router } from 'expo-router';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Place } from '@/data/places';
import { readSetting, StorageKeys, writeSetting } from '@/lib/storage';

/** The "How far?" choices in the location sheet; null means anywhere. */
export const DISTANCE_CHOICES: readonly (number | null)[] = [10, 25, 50, 100, null];
const DEFAULT_MILES = 25;

type SearchLocation = {
  /** Where to search from; null until they pick a city, ZIP or area. */
  place: Place | null;
  /** How far to look; null means anywhere. */
  maxMiles: number | null;
};

type SearchLocationValue = SearchLocation & {
  /** Search from here. An area-code chip passes its own radius (40 mi). */
  setPlace: (place: Place, radiusMiles?: number) => void;
  setMaxMiles: (miles: number | null) => void;
  clearPlace: () => void;
  /** Opens the "Where should we look?" sheet (src/app/location.tsx). */
  openLocationSheet: () => void;
};

function isPlace(value: unknown): value is Place {
  if (typeof value !== 'object' || value === null) return false;
  const place = value as Record<string, unknown>;
  return (
    typeof place.label === 'string' &&
    typeof place.latitude === 'number' &&
    typeof place.longitude === 'number'
  );
}

/** What was saved on this device last time, or the defaults. */
function readSaved(): SearchLocation {
  const fallback: SearchLocation = { place: null, maxMiles: DEFAULT_MILES };
  const raw = readSetting(StorageKeys.searchLocation);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const miles = parsed.maxMiles;
    return {
      place: isPlace(parsed.place) ? parsed.place : null,
      maxMiles: typeof miles === 'number' || miles === null ? miles : DEFAULT_MILES,
    };
  } catch {
    return fallback;
  }
}

const SearchLocationContext = createContext<SearchLocationValue | null>(null);

/**
 * Where the family is searching from (vision S22a): remembered on this
 * phone, never sent anywhere except as the point for a search, and no account
 * needed.
 */
export function SearchLocationProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SearchLocation>(readSaved);

  const value = useMemo<SearchLocationValue>(() => {
    const update = (next: Partial<SearchLocation>) => {
      const merged = { ...saved, ...next };
      setSaved(merged);
      void writeSetting(StorageKeys.searchLocation, JSON.stringify(merged));
    };
    return {
      ...saved,
      setPlace: (place, radiusMiles) =>
        update(radiusMiles === undefined ? { place } : { place, maxMiles: radiusMiles }),
      setMaxMiles: (maxMiles) => update({ maxMiles }),
      clearPlace: () => update({ place: null }),
      openLocationSheet: () => router.push('/location'),
    };
  }, [saved]);

  return <SearchLocationContext.Provider value={value}>{children}</SearchLocationContext.Provider>;
}

/**
 * The saved search location. Pass `place?.latitude`, `place?.longitude` and
 * `maxMiles` straight to useVendorSearch().
 */
export function useSearchLocation(): SearchLocationValue {
  const context = useContext(SearchLocationContext);
  if (!context) {
    throw new Error('useSearchLocation must be used inside SearchLocationProvider');
  }
  return context;
}
