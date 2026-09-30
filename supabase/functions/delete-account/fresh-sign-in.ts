// How recently the person proved it's them, from the `amr` claim of their
// access token. Supabase Auth records one entry per way the session was
// signed in, with its time: `otp` for an email or text code (verifyOtp),
// `oauth` for Apple (signInWithIdToken) or Google (the browser flow). A token
// refresh keeps the original entries and times, so an old sign-in never looks
// fresh again.

export type AuthMethod = { method?: string; timestamp?: number };

/** How recent the sign-in must be, in seconds. */
export const FRESH_SIGN_IN_SECONDS = 10 * 60;

/** The ways of signing in that count as proving it's them. */
const PROOF_METHODS = new Set(['otp', 'oauth']);

/** Allowance for the Auth server's clock running a little ahead of this one. */
const CLOCK_SKEW_SECONDS = 60;

/** True when a code was verified, or Apple or Google signed them in, in the last 10 minutes. */
export function signedInRecently(amr: AuthMethod[] | undefined, nowSeconds: number): boolean {
  return (amr ?? []).some(
    (entry) =>
      typeof entry.method === 'string' &&
      PROOF_METHODS.has(entry.method) &&
      typeof entry.timestamp === 'number' &&
      nowSeconds - entry.timestamp >= -CLOCK_SKEW_SECONDS &&
      nowSeconds - entry.timestamp <= FRESH_SIGN_IN_SECONDS,
  );
}
