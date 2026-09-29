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

export function connect(local: boolean): SupabaseClient {
  if (local) {
    const status = JSON.parse(
      execFileSync('supabase', ['status', '-o', 'json'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }),
    ) as Record<string, string>;
    const key = status.SECRET_KEY ?? status.SERVICE_ROLE_KEY;
    if (!status.API_URL || !key) fail('Local Supabase is not running. Run npm run db:start first.');
    return createClient(status.API_URL, key, { auth: { persistSession: false } });
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    fail('Set SUPABASE_URL and SUPABASE_SECRET_KEY (the service role key), or pass --local.');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
