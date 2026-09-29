-- Inquiries: "Ask about price & date" (vision S11, S12 and §8 "Inquiries by
-- email").
--
-- The app never writes this table. It calls the send-inquiry Edge Function,
-- which calls create_inquiry() below with the service role. That function
-- applies every rule in one transaction: a complete profile (18+), a
-- published vendor, valid events and date, one inquiry per vendor per 24
-- hours, 5 an hour and 15 a day per person, and a daily cap for the whole
-- app (Resend's free plan allows 100 emails a day). The Edge Function then
-- sends the email and records the result.
--
-- People can read their own inquiries ("My inquiries"). When an account is
-- deleted, user_id becomes null and the sender's name, phone and email are
-- scrubbed, so vendors' inquiry history survives without the person's details.

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  vendor_id uuid not null references public.vendors (id),
  event_slugs text[] not null default '{}',
  event_date date,
  start_time time,
  guest_band text not null
    check (guest_band in ('under_50', '50_100', '100_250', '250_500', '500_plus', 'not_sure')),
  location text not null check (length(btrim(location)) between 1 and 120),
  message text not null check (length(btrim(message)) between 1 and 2000),
  preferred_contact text not null
    check (preferred_contact in ('call', 'text', 'whatsapp', 'email')),
  language text not null default 'en' check (language in ('en', 'pa')),
  details jsonb not null default '{}' check (jsonb_typeof(details) = 'object'),
  sender_name text check (length(btrim(sender_name)) between 1 and 80),
  sender_phone text check (sender_phone ~ '^\+[1-9][0-9]{7,14}$'),
  sender_email text,
  -- email: straight to the vendor. relay: the vendor doesn't use email, so it
  -- goes to the founders, who forward it by WhatsApp or text.
  channel text not null check (channel in ('email', 'relay')),
  status text not null default 'sending' check (status in ('sending', 'sent', 'failed', 'queued')),
  provider_message_id text,
  failure text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  constraint inquiries_sender_while_account_exists
    check (user_id is null or (sender_name is not null and sender_phone is not null))
);

comment on table public.inquiries is
  'Inquiries sent to vendors. Written only by the send-inquiry Edge Function (via create_inquiry); people read their own.';
comment on column public.inquiries.event_date is
  'A calendar date (never a timestamp, so it can''t shift by a day). Null means "Not sure yet".';

create index inquiries_user_created_idx on public.inquiries (user_id, created_at desc);
create index inquiries_vendor_id_idx on public.inquiries (vendor_id);
create index inquiries_created_at_idx on public.inquiries (created_at);

create function private.scrub_inquiry_sender()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is null and old.user_id is not null then
    new.sender_name := null;
    new.sender_phone := null;
    new.sender_email := null;
  end if;
  return new;
end;
$$;

create trigger scrub_sender_when_account_deleted
  before update of user_id on public.inquiries
  for each row execute function private.scrub_inquiry_sender();

alter table public.inquiries enable row level security;

create policy "People can read their own inquiries" on public.inquiries
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- No insert, update or delete for the app: writes go through the Edge Function
-- so the rate limits can't be skipped (vision §8).
revoke all on public.inquiries from anon, authenticated;
grant select on public.inquiries to authenticated;

-- Settings only server code reads ----------------------------------------------

create table public.app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.app_config is
  'Server-side settings (e.g. inquiry_daily_cap). RLS on with no policies: the API can''t read or write it.';

create trigger set_updated_at before update on public.app_config
  for each row execute function private.set_updated_at();

alter table public.app_config enable row level security;
revoke all on public.app_config from anon, authenticated;

-- 90 while on Resend's free plan (100 a day), leaving room for sign-in emails
insert into public.app_config (key, value) values ('inquiry_daily_cap', '90');

-- The rules ----------------------------------------------------------------------

create function public.create_inquiry(
  p_user_id uuid,
  p_vendor_id uuid,
  p_event_slugs text[],
  p_event_date date,
  p_start_time time,
  p_guest_band text,
  p_location text,
  p_message text,
  p_preferred_contact text,
  p_language text,
  p_details jsonb,
  p_sender_name text,
  p_sender_phone text,
  p_sender_email text,
  p_send_again boolean default false
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_vendor record;
  v_private record;
  v_previous timestamptz;
  v_hourly integer;
  v_daily integer;
  v_cap integer;
  v_today_sent integer;
  v_status text;
  v_channel text;
  v_id uuid;
  v_today date := (now() at time zone 'America/Los_Angeles')::date;
begin
  -- One request at a time per person, so two taps can't slip past the limits
  perform pg_advisory_xact_lock(hashtextextended('inquiry:' || p_user_id::text, 0));

  if not exists (
    select 1 from public.profiles p
    where p.id = p_user_id and p.adult_confirmed_at is not null
  ) then
    return jsonb_build_object('outcome', 'needs_profile');
  end if;

  select v.id, v.name, v.call_phone, v.text_phone, v.whatsapp_phone into v_vendor
  from public.vendors v
  where v.id = p_vendor_id and v.status = 'published';
  if not found then
    return jsonb_build_object('outcome', 'vendor_not_found');
  end if;

  if exists (
    select 1 from unnest(coalesce(p_event_slugs, '{}')) as s (slug)
    where not exists (select 1 from public.events e where e.slug = s.slug)
  ) or cardinality(coalesce(p_event_slugs, '{}')) > 10 then
    return jsonb_build_object('outcome', 'invalid', 'field', 'eventSlugs');
  end if;

  if p_event_date is not null and p_event_date < v_today then
    return jsonb_build_object('outcome', 'invalid', 'field', 'eventDate');
  end if;

  select max(i.created_at) into v_previous
  from public.inquiries i
  where i.user_id = p_user_id and i.vendor_id = p_vendor_id
    and i.status <> 'failed' and i.created_at > now() - interval '24 hours';
  if v_previous is not null and not coalesce(p_send_again, false) then
    return jsonb_build_object('outcome', 'duplicate', 'previous_at', v_previous);
  end if;

  select
    count(*) filter (where i.created_at > now() - interval '1 hour'),
    count(*)
  into v_hourly, v_daily
  from public.inquiries i
  where i.user_id = p_user_id and i.status <> 'failed'
    and i.created_at > now() - interval '24 hours';
  if v_hourly >= 5 then
    return jsonb_build_object('outcome', 'rate_limited', 'limit', 'hour');
  end if;
  if v_daily >= 15 then
    return jsonb_build_object('outcome', 'rate_limited', 'limit', 'day');
  end if;

  select vp.email, vp.checks_email into v_private
  from public.vendor_private vp
  where vp.vendor_id = p_vendor_id;
  v_channel := case
    when v_private.email is not null and coalesce(v_private.checks_email, true) then 'email'
    else 'relay'
  end;

  select coalesce((c.value #>> '{}')::integer, 90) into v_cap
  from public.app_config c where c.key = 'inquiry_daily_cap';
  v_cap := coalesce(v_cap, 90);
  select count(*) into v_today_sent
  from public.inquiries i
  where i.status in ('sent', 'sending')
    and (i.created_at at time zone 'America/Los_Angeles')::date = v_today;
  v_status := case when v_today_sent >= v_cap then 'queued' else 'sending' end;

  insert into public.inquiries (
    user_id, vendor_id, event_slugs, event_date, start_time, guest_band, location, message,
    preferred_contact, language, details, sender_name, sender_phone, sender_email, channel, status
  ) values (
    p_user_id, p_vendor_id, coalesce(p_event_slugs, '{}'), p_event_date, p_start_time,
    p_guest_band, btrim(p_location), btrim(p_message), p_preferred_contact,
    coalesce(p_language, 'en'), coalesce(p_details, '{}'), btrim(p_sender_name), p_sender_phone,
    p_sender_email, v_channel, v_status
  )
  returning id into v_id;

  -- Asking a vendor saves them under those events (S11 "On send")
  insert into public.saved_vendors (user_id, vendor_id, event_slug)
  select p_user_id, p_vendor_id, s.slug
  from unnest(case when cardinality(coalesce(p_event_slugs, '{}')) = 0 then array[null::text]
    else p_event_slugs end) as s (slug)
  on conflict on constraint saved_vendors_once_per_event do nothing;

  return jsonb_build_object(
    'outcome', 'created',
    'inquiry_id', v_id,
    'status', v_status,
    'channel', v_channel,
    'vendor_name', v_vendor.name,
    'vendor_email', case when v_channel = 'email' then v_private.email end,
    'vendor_phone', coalesce(v_vendor.whatsapp_phone, v_vendor.text_phone, v_vendor.call_phone)
  );
end;
$$;

comment on function public.create_inquiry is
  'Checks every inquiry rule and records the inquiry. Server only: the send-inquiry Edge Function calls it with the service role.';

revoke all on function public.create_inquiry from public, anon, authenticated;
grant execute on function public.create_inquiry to service_role;
