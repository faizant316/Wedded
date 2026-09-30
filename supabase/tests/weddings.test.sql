-- Plan together: weddings, members, events, bookings and invites. Who can see
-- and change what, joining with invites, and what happens when people leave.

begin;
create extension if not exists pgtap with schema extensions;

select plan(27);

-- People: Asha (sets up the wedding), Balwinder (joins as a planner),
-- Charan (joins as a viewer), Dev (a stranger)
insert into auth.users (id, instance_id, aud, role, email) values
  ('a2000000-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'asha@example.com'),
  ('b2000000-0000-4000-8000-00000000000b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'balwinder@example.com'),
  ('c2000000-0000-4000-8000-00000000000c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'charan@example.com'),
  ('d2000000-0000-4000-8000-00000000000d', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dev@example.com');

insert into public.profiles (id, full_name, city, phone) values
  ('a2000000-0000-4000-8000-00000000000a', 'Asha Kaur', 'Yuba City', '+15305550201'),
  ('b2000000-0000-4000-8000-00000000000b', 'Balwinder Singh', 'Yuba City', '+15305550202'),
  ('c2000000-0000-4000-8000-00000000000c', 'Charan Gill', 'Fremont', '+15105550203');

create function pg_temp.as_user(uid uuid) returns void language sql as $$
  select set_config('request.jwt.claims',
    json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;

create table pg_temp.ids (name text primary key, value text);
grant all on pg_temp.ids to authenticated, anon;

-- Creating --------------------------------------------------------------------------

set local role anon;
select throws_ok(
  $$ select public.create_wedding('Test') $$,
  '42501', null,
  'Logged-out people cannot create a wedding'
);
reset role;

set local role authenticated;
select pg_temp.as_user('a2000000-0000-4000-8000-00000000000a');

insert into pg_temp.ids
select 'wedding', public.create_wedding(
  p_title => 'Jaspreet & Amrit',
  p_wedding_date => '2027-06-12',
  p_planning_for => 'child',
  p_events => array['reception', 'jaago'],
  p_booked => '{"reception": ["banquet-hall", "dj"], "jaago": ["dhol"], "roka": ["caterer"]}'
)::text;

select is(
  (select role from public.wedding_members
   where wedding_id = (select value::uuid from pg_temp.ids where name = 'wedding')
     and user_id = 'a2000000-0000-4000-8000-00000000000a'),
  'owner',
  'Whoever creates a wedding is its owner'
);

select set_eq(
  $$ select event_slug from public.wedding_events $$,
  array['reception', 'jaago'],
  'The plan from the phone comes across: its events'
);

select set_eq(
  $$ select event_slug || '/' || category_slug from public.wedding_bookings $$,
  array['reception/banquet-hall', 'reception/dj', 'jaago/dhol'],
  'and what was booked, only for events they''re having'
);

-- Strangers see nothing --------------------------------------------------------------

select pg_temp.as_user('d2000000-0000-4000-8000-00000000000d');
select is(
  (select count(*)::int from public.weddings) + (select count(*)::int from public.wedding_events)
    + (select count(*)::int from public.wedding_bookings) + (select count(*)::int from public.wedding_members),
  0,
  'Someone who isn''t a member sees no wedding, events, bookings or members'
);
select is(
  (select count(*)::int from public.wedding_members_list((select value::uuid from pg_temp.ids where name = 'wedding'))),
  0,
  'and gets no member names'
);

-- Invites ------------------------------------------------------------------------------

select pg_temp.as_user('a2000000-0000-4000-8000-00000000000a');
insert into pg_temp.ids
select 'planner_invite', public.create_wedding_invite((select value::uuid from pg_temp.ids where name = 'wedding'));
insert into pg_temp.ids
select 'viewer_invite', public.create_wedding_invite((select value::uuid from pg_temp.ids where name = 'wedding'), 'viewer');

select ok(
  (select value ~ '^[0-9a-f]{32}$' from pg_temp.ids where name = 'planner_invite'),
  'An invite is a 32-character unguessable token'
);
reset role;

set local role anon;
select results_eq(
  $$ select status, title, inviter_name, role
     from public.wedding_invite_preview((select value from pg_temp.ids where name = 'planner_invite')) $$,
  $$ values ('valid'::text, 'Jaspreet & Amrit'::text, 'Asha'::text, 'planner'::text) $$,
  'Before joining, anyone with the link sees the title and the inviter''s first name only'
);
select is(
  (select status from public.wedding_invite_preview('0123456789abcdef0123456789abcdef')),
  'not_found',
  'A made-up token finds nothing'
);
reset role;

set local role authenticated;
select pg_temp.as_user('b2000000-0000-4000-8000-00000000000b');
select is(
  public.accept_wedding_invite((select value from pg_temp.ids where name = 'planner_invite'))::text,
  (select value from pg_temp.ids where name = 'wedding'),
  'Joining with the link returns the wedding'
);
select is(
  (select role from public.wedding_members where user_id = 'b2000000-0000-4000-8000-00000000000b'),
  'planner',
  'and the person joins with the link''s role'
);
select is(
  public.accept_wedding_invite((select value from pg_temp.ids where name = 'planner_invite'))::text,
  (select value from pg_temp.ids where name = 'wedding'),
  'Joining again is harmless'
);

-- Planners change things; viewers can only look --------------------------------------------

insert into public.wedding_bookings (wedding_id, event_slug, category_slug)
values ((select value::uuid from pg_temp.ids where name = 'wedding'), 'jaago', 'photographer');
select is(
  (select updated_by from public.wedding_bookings where category_slug = 'photographer'),
  'b2000000-0000-4000-8000-00000000000b'::uuid,
  'A planner can tick off a booking, and it records who did'
);

update public.weddings set traditions = '{punjabi-sikh,pakistani}';
select is(
  (select traditions from public.weddings),
  '{punjabi-sikh,pakistani}'::text[],
  'A planner can set the wedding''s traditions'
);

select pg_temp.as_user('c2000000-0000-4000-8000-00000000000c');
select lives_ok(
  $$ select public.accept_wedding_invite((select value from pg_temp.ids where name = 'viewer_invite')) $$,
  'A viewer link lets a relative join'
);
select throws_ok(
  $$ insert into public.wedding_bookings (wedding_id, event_slug, category_slug)
     values ((select value::uuid from pg_temp.ids where name = 'wedding'), 'jaago', 'caterer') $$,
  '42501', null,
  'A viewer cannot change the plan'
);
update public.weddings set wedding_date = '2027-01-01';
select is(
  (select wedding_date from public.weddings),
  '2027-06-12'::date,
  'A viewer''s change to the date does nothing'
);
select throws_ok(
  $$ select public.create_wedding_invite((select value::uuid from pg_temp.ids where name = 'wedding')) $$,
  '42501', null,
  'A viewer cannot invite more people'
);
select results_eq(
  $$ select name, role from public.wedding_members_list((select value::uuid from pg_temp.ids where name = 'wedding')) $$,
  $$ values ('Asha Kaur'::text, 'owner'::text), ('Balwinder Singh', 'planner'), ('Charan Gill', 'viewer') $$,
  'Members see each other''s names, owner first'
);
select throws_ok(
  $$ select public.remove_wedding_member(
       (select value::uuid from pg_temp.ids where name = 'wedding'),
       'b2000000-0000-4000-8000-00000000000b') $$,
  '42501', null,
  'Only the owner can remove someone else'
);

-- Closed links -------------------------------------------------------------------------

select pg_temp.as_user('a2000000-0000-4000-8000-00000000000a');
update public.wedding_invites set revoked_at = now()
where token = (select value from pg_temp.ids where name = 'viewer_invite');

select pg_temp.as_user('d2000000-0000-4000-8000-00000000000d');
select throws_ok(
  $$ select public.accept_wedding_invite((select value from pg_temp.ids where name = 'viewer_invite')) $$,
  'P0001', 'invite_revoked',
  'A cancelled link no longer works'
);
reset role;
update public.wedding_invites set expires_at = now() - interval '1 minute'
where token = (select value from pg_temp.ids where name = 'planner_invite');
set local role authenticated;
select pg_temp.as_user('d2000000-0000-4000-8000-00000000000d');
select throws_ok(
  $$ select public.accept_wedding_invite((select value from pg_temp.ids where name = 'planner_invite')) $$,
  'P0001', 'invite_expired',
  'An expired link no longer works'
);

-- Leaving ------------------------------------------------------------------------------

select pg_temp.as_user('a2000000-0000-4000-8000-00000000000a');
select public.remove_wedding_member(
  (select value::uuid from pg_temp.ids where name = 'wedding'),
  'a2000000-0000-4000-8000-00000000000a');
reset role;
select is(
  (select user_id from public.wedding_members where role = 'owner'),
  'b2000000-0000-4000-8000-00000000000b'::uuid,
  'When the owner leaves, the longest-standing planner becomes the owner'
);

delete from auth.users where id = 'b2000000-0000-4000-8000-00000000000b';
select is(
  (select user_id from public.wedding_members where role = 'owner'),
  'c2000000-0000-4000-8000-00000000000c'::uuid,
  'When an owner deletes their account, the next member takes over'
);
select is(
  (select updated_by from public.wedding_bookings where category_slug = 'photographer'),
  null,
  'and their name comes off what they changed'
);

set local role authenticated;
select pg_temp.as_user('c2000000-0000-4000-8000-00000000000c');
select public.remove_wedding_member(
  (select value::uuid from pg_temp.ids where name = 'wedding'),
  'c2000000-0000-4000-8000-00000000000c');
reset role;
select is(
  (select count(*)::int from public.weddings where id = (select value::uuid from pg_temp.ids where name = 'wedding')),
  0,
  'When the last member leaves, the wedding is deleted'
);
select is(
  (select count(*)::int from public.wedding_events) + (select count(*)::int from public.wedding_invites),
  0,
  'along with its events, bookings and links'
);

select * from finish();
rollback;
