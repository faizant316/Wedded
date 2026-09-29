/**
 * The Supabase client for scripts: --local uses the local database
 * (`supabase status`); otherwise SUPABASE_URL and SUPABASE_SECRET_KEY (the
 * service role key; never commit it).
 */
import { execFileSync } from 'node:child_process';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function fail(message: string): never {
  console.error(`\n${message}\n`);
  process.exit(1);
}

export type Settings = {
  url: string;
  secretKey: string;
  /** The app's key, for acting as a signed-in person. */
  publishableKey: string | null;
  /** Local only: the Mailpit inbox for emails the local stack sends. */
  mailpitUrl: string | null;
};

export function settings(local: boolean): Settings {
  if (local) {
    const status = JSON.parse(
      execFileSync('supabase', ['status', '-o', 'json'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }),
    ) as Record<string, string>;
    const key = status.SECRET_KEY ?? status.SERVICE_ROLE_KEY;
    if (!status.API_URL || !key) fail('Local Supabase is not running. Run npm run db:start first.');
    return {
      url: status.API_URL,
      secretKey: key,
      publishableKey: status.PUBLISHABLE_KEY ?? status.ANON_KEY ?? null,
      mailpitUrl: status.MAILPIT_URL ?? status.INBUCKET_URL ?? null,
    };
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    fail('Set SUPABASE_URL and SUPABASE_SECRET_KEY (the service role key), or pass --local.');
  }
  return {
    url,
    secretKey: key,
    publishableKey:
      process.env.SUPABASE_PUBLISHABLE_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      null,
    mailpitUrl: null,
  };
}

export function connect(local: boolean): SupabaseClient {
  const { url, secretKey } = settings(local);
  return createClient(url, secretKey, { auth: { persistSession: false } });
}
