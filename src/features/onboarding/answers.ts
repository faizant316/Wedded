/**
 * What a family answers in the first questions (src/app/onboarding), kept in
 * memory until they finish, when finishOnboarding() turns it into their plan.
 * Background and faith are only ever used here, to pick traditions: they're
 * never saved (docs/DECISIONS.md, 2026-09-30).
 */
import { useSyncExternalStore } from 'react';

/** Who the wedding is for, as weddings.planning_for stores it. */
export type PlanningFor = 'self' | 'child' | 'sibling' | 'relative' | 'friend';

export type Answers = {
  planningFor: PlanningFor | null;
  weddingDate: string | null;
  /** They said they haven't picked a date yet. */
  noDateYet: boolean;
  backgrounds: string[];
  faiths: string[];
  /** Null until the events question first shows; then it starts with the main events. */
  events: string[] | null;
  /** An area-code chip (area_codes.code) for where to search. */
  areaCode: string | null;
};

const EMPTY: Answers = {
  planningFor: null,
  weddingDate: null,
  noDateYet: false,
  backgrounds: [],
  faiths: [],
  events: null,
  areaCode: null,
};

let answers: Answers = EMPTY;
const listeners = new Set<() => void>();

export function setAnswers(change: Partial<Answers>) {
  answers = { ...answers, ...change };
  listeners.forEach((listener) => listener());
}

export function resetAnswers() {
  setAnswers(EMPTY);
}

export function getAnswers(): Answers {
  return answers;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The answers so far, re-rendering when they change. */
export function useAnswers(): Answers {
  return useSyncExternalStore(subscribe, getAnswers, () => EMPTY);
}

/** Adds or removes one item of a multi-choice answer. */
export function toggleIn(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}
