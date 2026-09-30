/**
 * Give a vendor's owner (or staff) an account, so they can chat with families
 * in the app. They sign in with the same 6-digit email code as families; this
 * links that email to the vendor.
 *
 *   npm run vendors:invite -- --vendor=<slug> --email=<their email> [--role=owner|staff] [--local]
 *   npm run vendors:invite -- --vendor=<slug> --email=<email> --remove [--local]
 *   npm run vendors:invite -- --vendor=<slug> --list [--local]
 *
 * Without --local, set SUPABASE_URL and SUPABASE_SECRET_KEY.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

import { connect, fail } from './connect';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Find a user by email, paging through the admin list (there are few). */
async function findUserId(db: SupabaseClient, email: string): Promise<string | null> {
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) fail(`Could not read accounts: ${error.message}`);
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const value = (name: string) =>
    args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
  const slug = value('vendor');
  if (!slug)
    fail('Usage: npm run vendors:invite -- --vendor=<slug> --email=<email> [--role=owner|staff]');
  const db = connect(args.includes('--local'));

  const { data: vendor } = await db
    .from('vendors')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle();
  if (!vendor) fail(`No vendor with the slug "${slug}".`);

  if (args.includes('--list')) {
    const { data: members } = await db
      .from('vendor_members')
      .select('user_id, role, created_at')
      .eq('vendor_id', vendor.id);
    console.log(`${vendor.name}: ${members?.length ?? 0} account(s)`);
    for (const m of members ?? []) {
      const { data } = await db.auth.admin.getUserById(m.user_id);
      console.log(`  ${data.user?.email ?? m.user_id} (${m.role})`);
    }
    return;
  }

  const email = value('email')?.trim().toLowerCase();
  if (!email || !EMAIL.test(email)) fail("Give the owner's email: --email=owner@example.com");
  const role = value('role') ?? 'owner';
  if (role !== 'owner' && role !== 'staff') fail('--role must be owner or staff.');

  let userId = await findUserId(db, email);
  if (args.includes('--remove')) {
    if (!userId) fail(`No account for ${email}.`);
    const { error } = await db
      .from('vendor_members')
      .delete()
      .eq('vendor_id', vendor.id)
      .eq('user_id', userId);
    if (error) fail(`Could not remove: ${error.message}`);
    console.log(`${email} no longer has access to ${vendor.name}.`);
    return;
  }

  if (!userId) {
    const { data, error } = await db.auth.admin.createUser({ email, email_confirm: true });
    if (error) fail(`Could not create the account: ${error.message}`);
    userId = data.user.id;
  }
  const { error } = await db
    .from('vendor_members')
    .upsert({ vendor_id: vendor.id, user_id: userId, role }, { onConflict: 'vendor_id,user_id' });
  if (error) fail(`Could not link the account: ${error.message}`);
  console.log(
    `${email} can now run ${vendor.name} in the app (${role}). They sign in with that email; the app sends a 6-digit code.`,
  );
}

if (require.main === module) void main();
