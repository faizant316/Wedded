-- Vendor links: only links confirmed by both sides, between published vendors,
-- are visible; nobody writes them through the API.

begin;
create extension if not exists pgtap with schema extensions;

select plan(7);

insert into public.vendors (id, slug, status, name, city, location) values
  ('50000000-0000-4000-8000-000000000001', 'link-hall', 'published', 'Link Hall', 'Yuba City', 'SRID=4326;POINT(-121.6 39.1)'),
  ('50000000-0000-4000-8000-000000000002', 'link-caterer-a', 'published', 'Link Caterer A', 'Yuba City', 'SRID=4326;POINT(-121.6 39.1)'),
  ('50000000-0000-4000-8000-000000000003', 'link-caterer-b', 'published', 'Link Caterer B', 'Yuba City', 'SRID=4326;POINT(-121.6 39.1)'),
  ('50000000-0000-4000-8000-000000000004', 'link-caterer-draft', 'draft', 'Link Caterer Draft', 'Yuba City', 'SRID=4326;POINT(-121.6 39.1)');

insert into public.vendor_links (venue_vendor_id, vendor_id, kind, confirmed_by_venue, confirmed_by_vendor) values
  ('50000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002', 'approved_at', true, true),
  ('50000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000003', 'approved_at', true, false),
  ('50000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000004', 'approved_at', true, true);

set local role anon;

select results_eq(
  $$ select vendor_id from public.vendor_links where venue_vendor_id = '50000000-0000-4000-8000-000000000001' $$,
  array['50000000-0000-4000-8000-000000000002'::uuid],
  'Only links both sides confirmed, between published vendors, are visible'
);

select throws_ok(
  $$ insert into public.vendor_links (venue_vendor_id, vendor_id, kind) values
     ('50000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000003', 'worked_with') $$,
  '42501', null, 'Logged-out users cannot add links'
);

reset role;
set local role authenticated;

select throws_ok(
  $$ update public.vendor_links set confirmed_by_vendor = true $$,
  '42501', null, 'Signed-in users cannot confirm links for vendors'
);

reset role;

select throws_ok(
  $$ insert into public.vendor_links (venue_vendor_id, vendor_id, kind) values
     ('50000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'worked_with') $$,
  '23514', null, 'A vendor cannot be linked to itself'
);

select throws_ok(
  $$ insert into public.vendor_links (venue_vendor_id, vendor_id, kind) values
     ('50000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002', 'approved_at') $$,
  '23505', null, 'The same link cannot be added twice'
);

update public.vendor_links set confirmed_by_vendor = true
where vendor_id = '50000000-0000-4000-8000-000000000003';

set local role anon;
select is(
  (select count(*)::int from public.vendor_links where venue_vendor_id = '50000000-0000-4000-8000-000000000001'),
  2,
  'Once the caterer confirms too, the link appears'
);
reset role;

update public.vendors set status = 'hidden' where id = '50000000-0000-4000-8000-000000000001';
set local role anon;
select is(
  (select count(*)::int from public.vendor_links where venue_vendor_id = '50000000-0000-4000-8000-000000000001'),
  0,
  'Links disappear when the hall is unpublished'
);
reset role;

select * from finish();
rollback;
