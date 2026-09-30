-- "Yes, we booked them" fills in the family's plan, and booked_by counts it.

begin;
create extension if not exists pgtap with schema extensions;

select plan(6);

insert into auth.users (id, instance_id, aud, role, email)
select ('a4000000-0000-4000-8000-00000000000' || n)::uuid, '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'bf' || n || '@example.com'
from generate_series(1, 6) as n;

insert into public.vendors (id, slug, status, name, city, location) values
  ('b4000000-0000-4000-8000-000000000001', 'bf-hall', 'published', 'Bf Hall', 'Yuba City', 'SRID=4326;POINT(-121.6169 39.1404)'),
  ('b4000000-0000-4000-8000-000000000002', 'bf-other-hall', 'published', 'Bf Other Hall', 'Yuba City', 'SRID=4326;POINT(-121.6169 39.1404)');
insert into public.vendor_categories (vendor_id, category_slug, position) values
  ('b4000000-0000-4000-8000-000000000001', 'banquet-hall', 1),
  ('b4000000-0000-4000-8000-000000000002', 'banquet-hall', 1);

-- Six families, each with a plan having the reception, each asking the hall
create function pg_temp.as_user(uid uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;

set local role authenticated;
select pg_temp.as_user(('a4000000-0000-4000-8000-00000000000' || n)::uuid),
       public.create_wedding(p_events => array['reception', 'jaago'])
from generate_series(1, 6) as n;
reset role;

insert into public.inquiries (user_id, vendor_id, event_slugs, guest_band, location, message, preferred_contact,
  sender_name, sender_phone, channel, status, sent_at)
select ('a4000000-0000-4000-8000-00000000000' || n)::uuid, 'b4000000-0000-4000-8000-000000000001',
  case when n = 6 then array['mehndi'] else array['reception'] end,
  '250_500', 'Yuba City', 'Price?', 'call', 'Family ' || n, '+15305550400', 'email', 'sent', now() - interval '3 days'
from generate_series(1, 6) as n;

-- Family 2 already booked another hall for the reception
insert into public.wedding_bookings (wedding_id, event_slug, category_slug, vendor_id)
select m.wedding_id, 'reception', 'banquet-hall', 'b4000000-0000-4000-8000-000000000002'
from public.wedding_members m where m.user_id = 'a4000000-0000-4000-8000-000000000002';

set local role authenticated;
select pg_temp.as_user('a4000000-0000-4000-8000-000000000001');
update public.inquiries set reply_answer = 'booked' where user_id = 'a4000000-0000-4000-8000-000000000001';
reset role;

select is(
  (select b.vendor_id from public.wedding_bookings b
   join public.wedding_members m on m.wedding_id = b.wedding_id
   where m.user_id = 'a4000000-0000-4000-8000-000000000001' and b.event_slug = 'reception' and b.category_slug = 'banquet-hall'),
  'b4000000-0000-4000-8000-000000000001'::uuid,
  'Answering "booked" books the vendor in the family''s plan for that event and the vendor''s main category'
);

set local role authenticated;
select pg_temp.as_user('a4000000-0000-4000-8000-000000000002');
update public.inquiries set reply_answer = 'booked' where user_id = 'a4000000-0000-4000-8000-000000000002';
select pg_temp.as_user('a4000000-0000-4000-8000-000000000003');
update public.inquiries set reply_answer = 'deciding' where user_id = 'a4000000-0000-4000-8000-000000000003';
select pg_temp.as_user('a4000000-0000-4000-8000-000000000006');
update public.inquiries set reply_answer = 'booked' where user_id = 'a4000000-0000-4000-8000-000000000006';
reset role;

select is(
  (select b.vendor_id from public.wedding_bookings b
   join public.wedding_members m on m.wedding_id = b.wedding_id
   where m.user_id = 'a4000000-0000-4000-8000-000000000002' and b.event_slug = 'reception'),
  'b4000000-0000-4000-8000-000000000002'::uuid,
  'A vendor the family already named is never replaced'
);
select is(
  (select count(*)::int from public.wedding_bookings b
   join public.wedding_members m on m.wedding_id = b.wedding_id
   where m.user_id = 'a4000000-0000-4000-8000-000000000003'),
  0,
  '"Still deciding" books nothing'
);
select is(
  (select count(*)::int from public.wedding_bookings b
   join public.wedding_members m on m.wedding_id = b.wedding_id
   where m.user_id = 'a4000000-0000-4000-8000-000000000006'),
  0,
  'An inquiry for an event not in the plan books nothing'
);

set local role anon;
select is(
  (select booked_by from public.vendor_public_stats('b4000000-0000-4000-8000-000000000001')),
  null,
  'Fewer than 5 weddings booking shows nothing'
);
reset role;

-- Families 3, 4 and 5 book too (3 changes their mind from "deciding")
update public.inquiries set reply_answer = null where user_id = 'a4000000-0000-4000-8000-000000000003';
set local role authenticated;
select pg_temp.as_user('a4000000-0000-4000-8000-000000000003');
update public.inquiries set reply_answer = 'booked' where user_id = 'a4000000-0000-4000-8000-000000000003';
select pg_temp.as_user('a4000000-0000-4000-8000-000000000004');
update public.inquiries set reply_answer = 'booked' where user_id = 'a4000000-0000-4000-8000-000000000004';
select pg_temp.as_user('a4000000-0000-4000-8000-000000000005');
update public.inquiries set reply_answer = 'booked' where user_id = 'a4000000-0000-4000-8000-000000000005';
reset role;
-- Family 6 books it by hand in their plan's jaago
insert into public.wedding_bookings (wedding_id, event_slug, category_slug, vendor_id)
select m.wedding_id, 'jaago', 'banquet-hall', 'b4000000-0000-4000-8000-000000000001'
from public.wedding_members m where m.user_id = 'a4000000-0000-4000-8000-000000000006';

set local role anon;
select is(
  (select booked_by from public.vendor_public_stats('b4000000-0000-4000-8000-000000000001')),
  5,
  'Five weddings booking shows "booked by 5"'
);
reset role;

select * from finish();
rollback;
