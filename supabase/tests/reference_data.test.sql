-- Reference data: completeness, the rules from the product vision, and what
-- the app's roles (anon = logged out, authenticated = signed in) can do.
-- Run with `npm run db:test` (supabase test db).

begin;
create extension if not exists pgtap with schema extensions;

select plan(16);

-- Security ----------------------------------------------------------------

select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'Every table in public has row level security enabled'
);

-- Completeness ------------------------------------------------------------

select is(
  (select count(*)::int from public.cultures where is_default),
  1,
  'Exactly one default culture'
);

select is(
  (select count(*)::int from public.culture_events where culture_slug = 'punjabi-sikh'),
  19,
  'Punjabi Sikh has 18 events plus the Whole wedding card'
);

select is(
  (select count(*)::int from public.categories),
  64,
  'All 64 vendor categories from the taxonomy are present'
);

select is(
  (select count(*)::int from public.events where not (name ? 'pa')),
  0,
  'Every event has a Punjabi name (the November demo flips Home to Punjabi)'
);

select is(
  (
    select count(*)::int
    from public.events e
    where not exists (
      select 1 from public.event_categories ec
      where ec.event_slug = e.slug and ec.importance = 'essential'
    )
  ),
  0,
  'Every event lists at least one essential vendor category'
);

select results_eq(
  $$ select phase from public.culture_events
     where culture_slug = 'punjabi-sikh' and event_slug = 'whole-wedding' $$,
  array['whole_wedding'],
  'Whole wedding is its own card at the end of Home'
);

-- Rules from the product vision ----------------------------------------------

select set_eq(
  $$ select ec.event_slug
     from public.event_categories ec
     join public.categories c on c.slug = ec.category_slug
     where c.serves_alcohol $$,
  array['jaago', 'reception'],
  'Alcohol categories appear only under jaago and reception'
);

select is(
  (
    select count(*)::int
    from public.categories
    where is_religious and slug not in (
      'gurdwara', 'mandir-masjid', 'ragi-jatha', 'paathi', 'granthi',
      'pandit', 'imam', 'bhajan-mandali'
    )
  ),
  0,
  'Only places of worship and religious services are marked religious'
);

-- Data rules the database enforces -------------------------------------------

select throws_ok(
  $$ insert into public.category_groups (slug, name, sort_order) values ('test', '{"pa": "x"}', 99) $$,
  '23514',
  null,
  'A name without English is rejected'
);

select throws_ok(
  $$ insert into public.category_groups (slug, name, sort_order) values ('Not A Slug', '{"en": "Test"}', 99) $$,
  '23514',
  null,
  'A slug that is not lowercase-with-dashes is rejected'
);

select throws_ok(
  $$ insert into public.events (slug, name, host_side, typical_guests_min, typical_guests_max)
     values ('test', '{"en": "Test"}', 'joint', 200, 100) $$,
  '23514',
  null,
  'A guest range with max below min is rejected'
);

-- What the app can do --------------------------------------------------------

set local role anon;

select is(
  (select count(*)::int from public.events),
  19,
  'Logged-out users can read events'
);

select throws_ok(
  $$ insert into public.events (slug, name, host_side) values ('test', '{"en": "Test"}', 'joint') $$,
  '42501',
  null,
  'Logged-out users cannot add events'
);

select throws_ok(
  $$ update public.categories set aliases = '{}' $$,
  '42501',
  null,
  'Logged-out users cannot change categories'
);

reset role;
set local role authenticated;

select throws_ok(
  $$ delete from public.event_categories $$,
  '42501',
  null,
  'Signed-in users cannot delete what an event needs'
);

reset role;

select * from finish();
rollback;
