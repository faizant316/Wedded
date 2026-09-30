/** Pure helpers for the My Wedding plan (kept apart from storage so tests can load them). */

export type WeddingPlan = {
  /** The Anand Karaj day, yyyy-mm-dd. */
  weddingDate: string | null;
  /** Event slugs the family is having, in no particular order. */
  events: string[];
  /** Per event, the category slugs they've booked. */
  booked: Record<string, string[]>;
  /** Per event, about how many guests (the inquiry form's bands), so inquiries fill it in. */
  guests?: Record<string, string>;
  /**
   * Set when this is a copy of a plan saved to the account (Plan together):
   * the wedding it mirrors. Cleared on sign-out, so the next person on this
   * phone doesn't see it.
   */
  syncedWeddingId?: string | null;
};

/** Whole days from today to a yyyy-mm-dd date (negative once it has passed). */
export function daysUntil(date: string, today = new Date()): number {
  const [y, m, d] = date.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - now) / 86_400_000);
}

/** How many vendor types are booked across the plan's events. */
export function bookedCount(p: WeddingPlan): number {
  return p.events.reduce((sum, slug) => sum + (p.booked[slug]?.length ?? 0), 0);
}
