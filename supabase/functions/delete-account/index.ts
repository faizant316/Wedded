// delete-account: in-app account deletion (vision S19, §8; required by Apple
// guideline 5.1.1(v) and Google Play).
//
// POST with the signed-in person's session. They must have verified a fresh
// email code in the last 10 minutes (the app asks for one on the second
// screen), so a borrowed or forgotten-open phone can't delete the account in
// one tap. Deleting the auth user cascades in the database: profile and saved
// vendors are deleted, and inquiries keep the vendor's history with the
// sender's name, phone and email scrubbed.
//
//   200 { deleted: true }
//   401 { error: 'unauthorized' }
//   403 { error: 'reauth_required' }   verify a fresh code first
//   500 { error: 'server_error' }

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
  Deno.env.get('SUPABASE_SECRET_KEY') ?? '';

/** How recent the email code must be, in seconds. */
const FRESH_CODE_SECONDS = 10 * 60;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

type AuthMethod = { method?: string; timestamp?: number };

/** The token's claims. Only read after getUser() has verified the token. */
function claimsOf(token: string): { amr?: AuthMethod[] } {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));
  } catch {
    return {};
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'unauthorized' }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return json({ error: 'unauthorized' }, 401);

  const now = Math.floor(Date.now() / 1000);
  const freshCode = (claimsOf(token).amr ?? []).some(
    (entry) =>
      entry.method === 'otp' &&
      typeof entry.timestamp === 'number' &&
      now - entry.timestamp <= FRESH_CODE_SECONDS,
  );
  if (!freshCode) return json({ error: 'reauth_required' }, 403);

  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) {
    console.error('deleting account failed', data.user.id, deleteError);
    return json({ error: 'server_error' }, 500);
  }
  return json({ deleted: true }, 200);
});
