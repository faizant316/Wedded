-- Saved vendors: each person sees and changes only their own saves, only
-- published vendors can be saved, and a vendor is saved at most once per event.

begin;
create extension if not exists pgtap with schema extensions;

select plan(16);

-- Two accounts and three vendors, created as the table owner
insert into auth.users (id, instance_id, aud, role, email) values
  ('a0000000-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'saver-a@example.com'),
  ('b0000000-0000-4000-8000-00000000000b', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'saver-b@example.com');

insert into public.vendors (id, slug, status, name, city, location) values
  ('20000000-0000-4000-8000-000000000001', 'saves-dhol', 'published', 'Saves Dhol',
    'Yuba City', 'SRID=4326;POINT(-121.6169 39.1404)'),
  ('20000000-0000-4000-8000-000000000002', 'saves-dj', 'published', 'Saves DJ',
    'Yuba City', 'SRID=4326;POINT(-121.6169 39.1404)'),
  ('20000000-0000-4000-8000-000000000003', 'saves-draft', 'draft', 'Saves Draft',
    'Yuba City', 'SRID=4326;POINT(-121.6169 39.1404)');

-- Logged out ----------------------------------------------------------------------

set local role anon;

select throws_ok(
  $$ select * from public.saved_vendors $$,
  '42501', null,
  'Logged-out users cannot read saves'
);

select throws_ok(
  $$ insert into public.saved_vendors (vendor_id, event_slug)
     values ('20000000-0000-4000-8000-000000000001', 'jaago') $$,
  '42501', null,
  'Logged-out users cannot save (the app asks them to sign in first)'
);

reset role;

-- Person A ---------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "a0000000-0000-4000-8000-00000000000a", "role": "authenticated"}', true);

select lives_ok(
  $$ insert into public.saved_vendors (vendor_id, event_slug)
     values ('20000000-0000-4000-8000-000000000001', 'jaago') $$,
  'A person can save a vendor for an event'
);

select is(
  (select user_id from public.saved_vendors
   where vendor_id = '20000000-0000-4000-8000-000000000001'),
  'a0000000-0000-4000-8000-00000000000a'::uuid,
  'The database fills in who saved it'
);

select lives_ok(
  $$ insert into public.saved_vendors (vendor_id, event_slug)
     values ('20000000-0000-4000-8000-000000000001', 'baraat') $$,
  'The same vendor can be saved for another event'
);

select lives_ok(
  $$ insert into public.saved_vendors (vendor_id, event_slug)
     values ('20000000-0000-4000-8000-000000000002', null) $$,
  'A vendor can be saved without an event ("Not sure yet")'
);

select throws_ok(
  $$ insert into public.saved_vendors (vendor_id, event_slug)
     values ('20000000-0000-4000-8000-000000000001', 'jaago') $$,
  '23505', null,
  'Saving the same vendor for the same event twice is refused'
);

select throws_ok(
  $$ insert into public.saved_vendors (vendor_id, event_slug)
     values ('20000000-0000-4000-8000-000000000002', null) $$,
  '23505', null,
  'Saving the same vendor twice without an event is refused too'
);

select throws_ok(
  $$ insert into public.saved_vendors (vendor_id, event_slug)
     values ('20000000-0000-4000-8000-000000000003', 'jaago') $$,
  '42501', null,
  'An unpublished vendor cannot be saved'
);

select throws_ok(
  $$ insert into public.saved_vendors (user_id, vendor_id, event_slug)
     values ('b0000000-0000-4000-8000-00000000000b', '20000000-0000-4000-8000-000000000002', 'reception') $$,
  '42501', null,
  'Nobody can save into someone else''s list'
);

select is(
  (select count(*)::int from public.saved_vendors),
  3,
  'A person sees their own three saves'
);

-- Person B ---------------------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub": "b0000000-0000-4000-8000-00000000000b", "role": "authenticated"}', true);

select is(
  (select count(*)::int from public.saved_vendors),
  0,
  'Person B cannot see person A''s saves'
);

select is_empty(
  $$ delete from public.saved_vendors returning id $$,
  'Person B cannot remove person A''s saves'
);

-- Back to person A -------------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub": "a0000000-0000-4000-8000-00000000000a", "role": "authenticated"}', true);

select results_eq(
  $$ delete from public.saved_vendors
     where vendor_id = '20000000-0000-4000-8000-000000000001' and event_slug = 'baraat'
     returning event_slug $$,
  array['baraat'],
  'A person can remove one of their saves'
);

select throws_ok(
  $$ update public.saved_vendors set event_slug = 'reception' $$,
  '42501', null,
  'Saves are not edited in place (remove and save again)'
);

reset role;

delete from auth.users where id = 'a0000000-0000-4000-8000-00000000000a';

select is(
  (select count(*)::int from public.saved_vendors
   where user_id = 'a0000000-0000-4000-8000-00000000000a'),
  0,
  'Deleting the account deletes their saves'
);

select * from finish();
rollback;
