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
import { AppState } from 'react-native';

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

// The web build pre-renders pages in Node, where there is no localStorage;
// phones (via the install import above) and browsers have one.
const storage = typeof localStorage === 'undefined' ? undefined : localStorage;

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
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
