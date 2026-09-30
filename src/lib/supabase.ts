/**
 * The one Supabase client for the app. The session is stored on the device with
 * expo-sqlite's localStorage (works in Expo Go), following Expo's Supabase guide:
 * https://docs.expo.dev/guides/using-supabase/
 *
 * The URL and publishable key are public by design; row level security in the
 * database decides what each user can read and write. Never put the secret key
 * or the database password in an EXPO_PUBLIC_ variable.
 */
import './install-local-storage';

import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing Supabase settings. Copy .env.example to .env.local and fill in ' +
      'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ' +
      '(run `supabase status` to see the local values), then restart `npx expo start`.',
  );
}

/** The project's address and publishable key, e.g. for GET /auth/v1/settings. */
export const supabaseConfig = { url: supabaseUrl, publishableKey: supabasePublishableKey };

// The web build pre-renders pages in Node, where there is no localStorage;
// phones (via the install import above) and browsers have one.
const storage = typeof localStorage === 'undefined' ? undefined : localStorage;

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    // Google sign-in on the web comes back to /auth-callback with the tokens
    // in the address (#access_token=…), and the client reads them there. On
    // phones the app reads them itself (features/auth/providers.ts). The
    // client only looks when there's a real browser window, so the web
    // build's pre-render in Node is unaffected.
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Refresh the session only while the app is in the foreground, so a
// backgrounded phone doesn't keep refreshing tokens.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
