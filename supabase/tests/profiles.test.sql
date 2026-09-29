-- Profiles: each person reads and writes only their own, 18+ is stamped by the
-- database, and deleting the account removes the profile. Signs in as two
-- test users (A and B) by setting the JWT claims that auth.uid() reads.

begin;
create extension if not exists pgtap with schema extensions;

select plan(15);

-- Two test accounts, created as the table owner
insert into auth.users (id, instance_id, aud, role, email) values
  ('a0000000-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'person-a@example.com'),
  ('b0000000-0000-4000-8000-00000000000b', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'person-b@example.com');

-- Logged out ------------------------------------------------------------------

set local role anon;

select throws_ok(
  $$ select * from public.profiles $$,
  '42501', null,
  'Logged-out users cannot read profiles'
);

reset role;

-- Person A ---------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "a0000000-0000-4000-8000-00000000000a", "role": "authenticated"}', true);

select lives_ok(
  $$ insert into public.profiles (id, full_name, city, phone)
     values ('a0000000-0000-4000-8000-00000000000a', 'Harjit Kaur', 'Yuba City', '+15305550111') $$,
  'A signed-in person can create their own profile'
);

select ok(
  (select adult_confirmed_at > now() - interval '1 minute'
   from public.profiles where id = 'a0000000-0000-4000-8000-00000000000a'),
  'The database stamps the 18+ confirmation when the profile is created'
);

select throws_ok(
  $$ insert into public.profiles (id, full_name, city, phone)
     values ('b0000000-0000-4000-8000-00000000000b', 'Someone Else', 'Fremont', '+15105550112') $$,
  '42501', null,
  'Nobody can create a profile for someone else'
);

select is(
  (select count(*)::int from public.profiles),
  1,
  'A person sees only their own profile'
);

select lives_ok(
  $$ update public.profiles set full_name = 'Harjit Kaur Sandhu'
     where id = 'a0000000-0000-4000-8000-00000000000a' $$,
  'A person can update their own name, city and phone'
);

select throws_ok(
  $$ update public.profiles set adult_confirmed_at = '2000-01-01'
     where id = 'a0000000-0000-4000-8000-00000000000a' $$,
  '42501', null,
  'Nobody can change their 18+ timestamp'
);

select throws_ok(
  $$ update public.profiles set phone = '12345'
     where id = 'a0000000-0000-4000-8000-00000000000a' $$,
  '23514', null,
  'Phone numbers must be in international format (+ and digits)'
);

select throws_ok(
  $$ delete from public.profiles where id = 'a0000000-0000-4000-8000-00000000000a' $$,
  '42501', null,
  'Profiles cannot be deleted through the API (account deletion does it)'
);

-- Person B ---------------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub": "b0000000-0000-4000-8000-00000000000b", "role": "authenticated"}', true);

select throws_ok(
  $$ insert into public.profiles (id, full_name, city, phone, adult_confirmed_at)
     values ('b0000000-0000-4000-8000-00000000000b', 'Amrit Singh', 'Fremont', '+15105550112', '2000-01-01') $$,
  '42501', null,
  'Nobody can set their own 18+ timestamp when signing up'
);

select lives_ok(
  $$ insert into public.profiles (id, full_name, city, phone)
     values ('b0000000-0000-4000-8000-00000000000b', 'Amrit Singh', 'Fremont', '+919876543210') $$,
  'A second person creates their profile (a phone number from India is fine)'
);

select is(
  (select count(*)::int from public.profiles where id = 'a0000000-0000-4000-8000-00000000000a'),
  0,
  'Person B cannot see person A''s profile'
);

select is_empty(
  $$ update public.profiles set full_name = 'Changed by B'
     where id = 'a0000000-0000-4000-8000-00000000000a' returning id $$,
  'Person B cannot change person A''s profile'
);

reset role;

-- As the table owner ---------------------------------------------------------------

select is(
  (select full_name from public.profiles where id = 'a0000000-0000-4000-8000-00000000000a'),
  'Harjit Kaur Sandhu',
  'Person A''s profile kept their own edit and not B''s'
);

delete from auth.users where id = 'a0000000-0000-4000-8000-00000000000a';

select is(
  (select count(*)::int from public.profiles where id = 'a0000000-0000-4000-8000-00000000000a'),
  0,
  'Deleting the account deletes the profile'
);

select * from finish();
rollback;
