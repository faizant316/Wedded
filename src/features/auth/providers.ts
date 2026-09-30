/**
 * Sign in with Apple and Google, and which sign-in methods are turned on.
 *
 * Google is the browser flow (no native SDK, so it runs in Expo Go): Supabase
 * sends the person to Google and back to `auth-callback` in the app with the
 * session in the address. On the web that's a full-page redirect and the
 * Supabase client reads the address itself (lib/supabase.ts); on phones an
 * auth session (ASWebAuthenticationSession / Chrome Custom Tabs) hands the
 * address back here. Apple is the native sheet on iPhone (apple-sign-in.ios.ts).
 */
import { useQuery } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { queryClient } from '@/data/query-client';
import { supabase, supabaseConfig } from '@/lib/supabase';

import { appleSignIn, appleSignInAvailable } from './apple-sign-in';
import { authParamsFromUrl, enabledProviders, type EnabledProviders } from './auth-helpers';

export type ProviderResult = 'signedIn' | 'cancelled' | 'unavailable' | 'failed';

const HOUR = 60 * 60 * 1000;
const SETTINGS_QUERY = {
  queryKey: ['auth-settings'],
  queryFn: fetchAuthSettings,
  staleTime: HOUR,
  gcTime: 2 * HOUR,
} as const;

async function fetchAuthSettings(): Promise<EnabledProviders> {
  const response = await fetch(`${supabaseConfig.url}/auth/v1/settings`, {
    headers: { apikey: supabaseConfig.publishableKey },
  });
  if (!response.ok) throw new Error(`auth settings answered ${response.status}`);
  return enabledProviders(await response.json());
}

/** The server's switches from the cache (or one request), null when they can't be read. */
async function serverProviders(): Promise<EnabledProviders | null> {
  return queryClient.fetchQuery(SETTINGS_QUERY).catch(() => null);
}

export type ProviderState = {
  /** What the server has turned on; undefined while loading or when it can't be reached. */
  server: EnabledProviders | undefined;
  /** This device can show Apple's sheet (an iPhone). */
  appleDevice: boolean;
  isPending: boolean;
};

/** The raw state behind useAuthProviders(), for SignInOptions. */
export function useProviderState(): ProviderState {
  const ios = Platform.OS === 'ios';
  const settings = useQuery(SETTINGS_QUERY);
  const apple = useQuery({
    queryKey: ['apple-sign-in-available'],
    queryFn: appleSignInAvailable,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: ios,
  });
  return {
    server: settings.data,
    // Assume yes on iPhone until the check answers (every iOS the SDK runs on
    // supports it), so the Apple button doesn't pop in late.
    appleDevice: ios && apple.data !== false,
    isPending: settings.isPending || (ios && apple.isPending),
  };
}

/** Which sign-in methods are on (GET /auth/v1/settings, cached ~1h; Apple also needs iOS + isAvailableAsync). */
export function useAuthProviders(): {
  apple: boolean;
  google: boolean;
  phone: boolean;
  email: boolean;
  isPending: boolean;
} {
  const { server, appleDevice, isPending } = useProviderState();
  return {
    apple: appleDevice && !!server?.apple,
    google: !!server?.google,
    phone: !!server?.phone,
    email: !!server?.email,
    isPending,
  };
}

/** Sign in with Apple (iPhone only). A first-time name is kept for About you. */
export async function signInWithApple(): Promise<ProviderResult> {
  if (Platform.OS !== 'ios') return 'unavailable';
  const server = await serverProviders();
  if (server && !server.apple) return 'unavailable';
  return appleSignIn();
}

export type GoogleOptions = {
  /** Web only: where /auth-callback goes after the redirect instead of Home. */
  next?: 'delete-account';
  /** Preselect this Google account, e.g. when confirming it's them. */
  loginHint?: string;
};

/**
 * Sign in with Google in the browser. On phones it resolves when they're back
 * in the app. On the web the page leaves for Google and /auth-callback picks
 * up on return, so the promise only settles if the page is still here after
 * 30 seconds or they come back with the Back button ('cancelled').
 */
export async function signInWithGoogle(options: GoogleOptions = {}): Promise<ProviderResult> {
  const server = await serverProviders();
  if (server && !server.google) return 'unavailable';

  const redirectTo = Linking.createURL(
    'auth-callback',
    options.next ? { queryParams: { next: options.next } } : undefined,
  );
  const queryParams: Record<string, string> = options.loginHint
    ? { login_hint: options.loginHint }
    : { prompt: 'select_account' };

  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, queryParams },
    });
    if (error) return 'failed';
    return waitForRedirect();
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, queryParams, skipBrowserRedirect: true },
  });
  if (error || !data.url) return 'failed';

  let result: WebBrowser.WebBrowserAuthSessionResult;
  try {
    result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  } catch (browserError) {
    if (__DEV__) console.warn('Google sign-in browser failed', browserError);
    return 'failed';
  }
  if (result.type !== 'success') return 'cancelled';
  return sessionFromRedirect(result.url);
}

/** Turn the address Google sign-in came back to into a session. */
async function sessionFromRedirect(url: string): Promise<ProviderResult> {
  const params = authParamsFromUrl(url);
  if (params.error) {
    if (params.error === 'access_denied') return 'cancelled';
    if (__DEV__) console.warn('Google sign-in came back with', params);
    return 'failed';
  }
  if (params.accessToken && params.refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });
    return error ? 'failed' : 'signedIn';
  }
  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    return error ? 'failed' : 'signedIn';
  }
  return 'failed';
}

/** Keep the spinner while the browser leaves for Google. */
function waitForRedirect(): Promise<ProviderResult> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve('cancelled'), 30_000);
    window.addEventListener('pageshow', (event) => {
      if ((event as { persisted?: boolean }).persisted) {
        clearTimeout(timer);
        resolve('cancelled');
      }
    });
  });
}

export type ConfirmResult = ProviderResult | 'otherAccount';

/**
 * Sign in again with Apple or Google to show it's really them (before
 * deleting the account). The fresh sign-in is what the delete-account
 * function checks. If they pick a different Apple ID or Google account, the
 * session they had is put back and the answer is 'otherAccount'. On the web,
 * Google leaves the page and comes back to /delete-account?confirmed=google.
 */
export async function confirmWithProvider(provider: 'apple' | 'google'): Promise<ConfirmResult> {
  const {
    data: { session: before },
  } = await supabase.auth.getSession();
  if (!before) return 'failed';

  const result =
    provider === 'apple'
      ? await signInWithApple()
      : await signInWithGoogle({
          next: 'delete-account',
          loginHint: before.user.email || undefined,
        });
  if (result !== 'signedIn') return result;

  const {
    data: { session: after },
  } = await supabase.auth.getSession();
  if (after?.user.id === before.user.id) return 'signedIn';

  await supabase.auth.setSession({
    access_token: before.access_token,
    refresh_token: before.refresh_token,
  });
  return 'otherAccount';
}
