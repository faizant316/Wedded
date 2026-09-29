-- Sending queued inquiries (vision §8: "daily cap reached: queued, sent after
-- midnight by pg_cron").
--
-- 1. inquiry_emails_left_today(): the one place the daily email cap is
--    counted. It counts inquiries by the California day they were actually
--    sent, so yesterday's queue going out today counts against today's cap.
-- 2. create_inquiry() now uses it (the rules are otherwise unchanged).
-- 3. pg_cron calls the send-queued-inquiries Edge Function every night at
--    08:05 UTC (just after midnight in California). The URL and the service
--    role key come from Vault, so no key is in this file. Each environment
--    needs them once (see the README):
--      select vault.create_secret('<project url>', 'project_url');
--      select vault.create_secret('<service role key>', 'service_role_key');

create function public.inquiry_emails_left_today()
returns integer
language sql
stable
set search_path = ''
as $$
  select greatest(
    0,
    coalesce(
      (select (c.value #>> '{}')::integer from public.app_config c where c.key = 'inquiry_daily_cap'),
      90
    ) - (
      select count(*)::integer
      from public.inquiries i
      where i.status in ('sent', 'sending')
        and (coalesce(i.sent_at, i.created_at) at time zone 'America/Los_Angeles')::date
          = (now() at time zone 'America/Los_Angeles')::date
    )
  );
$$;

comment on function public.inquiry_emails_left_today is
  'How many more inquiry emails can go out today (California day) under app_config.inquiry_daily_cap. Server only.';

revoke all on function public.inquiry_emails_left_today from public, anon, authenticated;
grant execute on function public.inquiry_emails_left_today to service_role;

create or replace function public.create_inquiry(
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

  v_status := case when public.inquiry_emails_left_today() <= 0 then 'queued' else 'sending' end;

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


-- The nightly job -----------------------------------------------------------------

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'send-queued-inquiries',
  '5 8 * * *',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/send-queued-inquiries',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $job$
);
