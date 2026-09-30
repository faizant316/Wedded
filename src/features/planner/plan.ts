/**
 * My Wedding (vision S15b/S15c, the planning board): the wedding date, the
 * family's traditions, which events they're having, and which vendor types
 * are booked for each. Works on the phone with no account. Once it's saved
 * to the account (Plan together, src/data/wedding.ts), this store holds a
 * copy of the account's plan (syncedWeddingId set), so Home and Profile show
 * it without waiting.
 */
import { useSyncExternalStore } from 'react';

import { readSetting, StorageKeys, writeSetting } from '@/lib/storage';

import { pickTradition, type WeddingPlan } from './plan-helpers';

export type { WeddingPlan };

const EMPTY: WeddingPlan = { weddingDate: null, traditions: [], events: [], booked: {} };

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

function load(): WeddingPlan {
  try {
    const raw = readSetting(StorageKeys.weddingPlan);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<WeddingPlan>;
    return {
      weddingDate: typeof parsed.weddingDate === 'string' ? parsed.weddingDate : null,
      traditions: strings(parsed.traditions),
      events: strings(parsed.events),
      booked: typeof parsed.booked === 'object' && parsed.booked ? parsed.booked : {},
      guests: typeof parsed.guests === 'object' && parsed.guests ? parsed.guests : {},
      syncedWeddingId: typeof parsed.syncedWeddingId === 'string' ? parsed.syncedWeddingId : null,
    };
  } catch {
    return EMPTY;
  }
}

let plan: WeddingPlan | null = null;
const listeners = new Set<() => void>();

function current(): WeddingPlan {
  plan ??= load();
  return plan;
}

function update(change: (plan: WeddingPlan) => WeddingPlan) {
  plan = change(current());
  void writeSetting(StorageKeys.weddingPlan, JSON.stringify(plan));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setWeddingDate(date: string | null) {
  update((p) => ({ ...p, weddingDate: date }));
}

export function toggleEvent(slug: string) {
  update((p) => ({
    ...p,
    events: p.events.includes(slug) ? p.events.filter((e) => e !== slug) : [...p.events, slug],
  }));
}

/** Adds events (a tradition's main ones, say) without removing any. */
export function addEvents(slugs: string[]) {
  update((p) => ({ ...p, events: [...new Set([...p.events, ...slugs])] }));
}

/** Picks or unpicks a tradition; `current` is what the screen shows (see pickTradition). */
export function toggleTradition(slug: string, current: string[]) {
  update((p) => {
    const picked = pickTradition(p.traditions, current, slug);
    return picked ? { ...p, traditions: picked } : p;
  });
}

export function toggleBooked(eventSlug: string, categorySlug: string) {
  update((p) => {
    const list = p.booked[eventSlug] ?? [];
    const next = list.includes(categorySlug)
      ? list.filter((c) => c !== categorySlug)
      : [...list, categorySlug];
    return { ...p, booked: { ...p.booked, [eventSlug]: next } };
  });
}

/** About how many guests an event will have (a guest band, or null to clear). */
export function setEventGuests(eventSlug: string, band: string | null) {
  update((p) => {
    const guests = { ...(p.guests ?? {}) };
    if (band) guests[eventSlug] = band;
    else delete guests[eventSlug];
    return { ...p, guests };
  });
}

/** Replace the whole plan: the copy of the account's plan (Plan together). */
export function replacePlan(next: WeddingPlan) {
  update(() => next);
}

/** Forget the plan on this phone (after it's saved to the account, or on sign-out). */
export function clearPlan() {
  update(() => EMPTY);
}

/** The plan, re-rendering whenever it changes. */
export function usePlan(): WeddingPlan {
  return useSyncExternalStore(subscribe, current, () => EMPTY);
}

export {
  activeTraditions,
  bookedCount,
  chosenEvents,
  daysUntil,
  essentialNeeds,
  mergedEvents,
  nextToBook,
  pickTradition,
  planProgress,
} from './plan-helpers';
