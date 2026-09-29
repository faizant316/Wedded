import type { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * - loading: checking the session saved on this device, or loading the profile
 * - signedOut: browsing without an account (everything but saving and asking a
 *   vendor works this way; nobody is asked to sign in up front)
 * - needsProfile: signed in with an email code, but About you isn't filled in
 * - signedIn: signed in with a profile
 * - error: signed in, but the profile couldn't be loaded (usually offline)
 */
export type SessionStatus = 'loading' | 'signedOut' | 'needsProfile' | 'signedIn' | 'error';

type SessionContextValue = {
  status: SessionStatus;
  session: Session | null;
  profile: Profile | null;
  /** The email they signed in with. */
  email: string | null;
  reloadProfile: () => void;
  /** The sign-in screen saved About you: use this row without refetching. */
  profileSaved: (profile: Profile) => void;
  signOut: () => Promise<void>;
  /**
   * Run `action` now if they're signed in with a profile; otherwise open
   * sign-in and run it once they finish (vision §8, "pending action after
   * login"). Kept in memory only.
   */
  requireSignIn: (action?: () => void) => void;
  /** Called by the sign-in screen when it's done: closes it, then runs the pending action. */
  finishSignIn: () => void;
  /** Called when the sign-in screen closes without finishing. */
  cancelSignIn: () => void;
};

/**
 * The last profile lookup, labelled with the user and attempt it answers, so a
 * lookup for someone who has since signed out (or an older attempt) is ignored
 * and the state never needs resetting by hand.
 */
type ProfileLookup = {
  userId: string;
  attempt: number;
  profile: Profile | null;
  failed: boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [lookup, setLookup] = useState<ProfileLookup | null>(null);
  const [attempt, setAttempt] = useState(0);
  const pendingAction = useRef<(() => void) | null>(null);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    // INITIAL_SESSION arrives first with whatever was saved on the device.
    // Keep this callback synchronous: calling other Supabase methods inside it
    // can deadlock (supabase-js docs), so the profile loads in the effect below.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setSessionChecked(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let current = true;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (current) {
          setLookup({ userId, attempt, profile: error ? null : data, failed: !!error });
        }
      });
    return () => {
      current = false;
    };
  }, [userId, attempt]);

  const answer = lookup && lookup.userId === userId && lookup.attempt === attempt ? lookup : null;
  const profile = answer?.profile ?? null;

  let status: SessionStatus;
  if (!sessionChecked) status = 'loading';
  else if (!session) status = 'signedOut';
  else if (!answer) status = 'loading';
  else if (answer.failed) status = 'error';
  else status = profile ? 'signedIn' : 'needsProfile';

  const reloadProfile = useCallback(() => setAttempt((count) => count + 1), []);

  const profileSaved = useCallback(
    (saved: Profile) => setLookup({ userId: saved.id, attempt, profile: saved, failed: false }),
    [attempt],
  );

  const signOut = useCallback(async () => {
    pendingAction.current = null;
    await supabase.auth.signOut();
  }, []);

  const requireSignIn = useCallback(
    (action?: () => void) => {
      if (status === 'signedIn') {
        action?.();
        return;
      }
      pendingAction.current = action ?? null;
      router.push('/sign-in');
    },
    [status],
  );

  const finishSignIn = useCallback(() => {
    const action = pendingAction.current;
    pendingAction.current = null;
    if (router.canGoBack()) {
      router.back();
    }
    action?.();
  }, []);

  const cancelSignIn = useCallback(() => {
    pendingAction.current = null;
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      session,
      profile,
      email: session?.user.email ?? null,
      reloadProfile,
      profileSaved,
      signOut,
      requireSignIn,
      finishSignIn,
      cancelSignIn,
    }),
    [
      status,
      session,
      profile,
      reloadProfile,
      profileSaved,
      signOut,
      requireSignIn,
      finishSignIn,
      cancelSignIn,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return context;
}
