-- Profiles: the "About you" details of a signed-in person (vision S14 and
-- section 8): name, city and phone from the About you form.
--
-- The email is the one they signed in with, which Supabase Auth keeps in
-- auth.users, so it isn't stored twice. 18+ is recorded as the time the
-- profile was created (the form can't submit without the box ticked), set by
-- the database, never a birthdate.
--
-- Each person can read, create and update only their own profile. Nobody can
-- delete one through the API: deleting the account (a later Edge Function
-- calling auth.admin.deleteUser) removes the profile with it.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (length(btrim(full_name)) between 1 and 80),
  city text not null check (length(btrim(city)) between 1 and 80),
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  adult_confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'About you: one row per signed-in person, created after their first email code. Email lives in auth.users.';
comment on column public.profiles.phone is
  'E.164, e.g. +15305550101. Numbers from India, Canada or the UK are allowed.';
comment on column public.profiles.adult_confirmed_at is
  'When they confirmed they are 18 or older. Set by the database; the app cannot write it.';

create trigger set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

alter table public.profiles enable row level security;

create policy "People can read their own profile" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "People can create their own profile" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "People can update their own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Logged-out users get nothing. Signed-in users may write only the columns the
-- About you form fills in, so adult_confirmed_at and the timestamps always come
-- from the database. id is updatable only so upsert works; the policies above
-- pin it to the caller.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, full_name, city, phone) on public.profiles to authenticated;
grant update (id, full_name, city, phone) on public.profiles to authenticated;
