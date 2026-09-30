/**
 * My Wedding (vision S15b/S15c, the planning board): the wedding date, which
 * events the family is having, and which vendor types are booked for each.
 * Kept on this phone for now (no account needed); a shared, synced board is
 * Phase 8.
 */
import { useSyncExternalStore } from 'react';

import { readSetting, StorageKeys, writeSetting } from '@/lib/storage';

import type { WeddingPlan } from './plan-helpers';

export type { WeddingPlan };

const EMPTY: WeddingPlan = { weddingDate: null, events: [], booked: {} };

function load(): WeddingPlan {
  try {
    const raw = readSetting(StorageKeys.weddingPlan);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<WeddingPlan>;
    return {
      weddingDate: typeof parsed.weddingDate === 'string' ? parsed.weddingDate : null,
      events: Array.isArray(parsed.events)
        ? parsed.events.filter((e) => typeof e === 'string')
        : [],
      booked: typeof parsed.booked === 'object' && parsed.booked ? parsed.booked : {},
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

export function toggleBooked(eventSlug: string, categorySlug: string) {
  update((p) => {
    const list = p.booked[eventSlug] ?? [];
    const next = list.includes(categorySlug)
      ? list.filter((c) => c !== categorySlug)
      : [...list, categorySlug];
    return { ...p, booked: { ...p.booked, [eventSlug]: next } };
  });
}

/** The plan, re-rendering whenever it changes. */
export function usePlan(): WeddingPlan {
  return useSyncExternalStore(subscribe, current, () => EMPTY);
}

export { bookedCount, daysUntil } from './plan-helpers';
