-- Vendor numbers (docs/RESEARCH_GROWTH.md #3; vision idea 1 "monthly
-- scorecard" and idea 18 "reliability ledger: counts, not stars").
--
-- vendor_activity_daily  Anonymous daily counts per vendor: profile views and
--                        taps on Call, Text, WhatsApp, Directions, Share,
--                        Instagram and Website. No user ids, no devices: only
--                        numbers. Written by track_vendor_activity(), which
--                        anyone can call; read only by server tools.
-- vendor_public_stats()  What a vendor page may show: "Saved by N families"
--                        and "Replied to N of M families who asked" (from the
--                        family follow-up answers). Each appears only once 5 or
--                        more people are behind it, so nobody can be picked
--                        out, and a missing answer never counts against them.
-- vendor_scorecard()     The founders' monthly numbers for a vendor (service
--                        role only), for the WhatsApp scorecard.
--
-- Also: limits on vendor_leads so the open sign-up form can't be flooded.

create table public.vendor_activity_daily (
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  -- The California day
  day date not null,
  kind text not null
    check (kind in ('view', 'call', 'text', 'whatsapp', 'directions', 'share', 'instagram', 'website')),
  count integer not null default 0 check (count >= 0),
  primary key (vendor_id, day, kind)
);

comment on table public.vendor_activity_daily is
  'Anonymous daily counts of profile views and contact taps per vendor. No user data. Written by track_vendor_activity(); read by server tools only.';

alter table public.vendor_activity_daily enable row level security;
-- No policies and no grants for the API roles: only the service role reads it.
revoke all on public.vendor_activity_daily from anon, authenticated;

-- Count one view or tap. Silently ignores vendors that aren't published, and
-- stops counting a vendor's kind at 5,000 a day (nobody real gets there).
create function private.track_vendor_activity(p_vendor_id uuid, p_kind text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_kind is null or p_kind not in
    ('view', 'call', 'text', 'whatsapp', 'directions', 'share', 'instagram', 'website') then
    raise exception 'invalid_kind' using errcode = '22023';
  end if;
  if not exists (select 1 from public.vendors where id = p_vendor_id and status = 'published') then
    return;
  end if;
  insert into public.vendor_activity_daily as a (vendor_id, day, kind, count)
  values (p_vendor_id, (now() at time zone 'America/Los_Angeles')::date, p_kind, 1)
  on conflict (vendor_id, day, kind) do update
    set count = a.count + 1
    where a.count < 5000;
end;
$$;

create function public.track_vendor_activity(p_vendor_id uuid, p_kind text)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.track_vendor_activity(p_vendor_id, p_kind);
$$;

comment on function public.track_vendor_activity is
  'Count one profile view or contact tap (view, call, text, whatsapp, directions, share, instagram, website) for a published vendor. Anonymous.';

-- The public social proof for a published vendor. Each number is null until 5
-- or more people are behind it.
create function private.vendor_public_stats(p_vendor_id uuid)
returns table (saved_by integer, replied integer, answered integer)
language sql
stable
security definer
set search_path = ''
as $$
  with vendor as (
    select v.id from public.vendors v where v.id = p_vendor_id and v.status = 'published'
  ),
  saves as (
    select count(distinct s.user_id)::integer as n
    from public.saved_vendors s
    join vendor on vendor.id = s.vendor_id
  ),
  answers as (
    select
      (count(*) filter (where i.reply_answer in ('booked', 'deciding')))::integer as replied,
      (count(*) filter (where i.reply_answer is not null))::integer as answered
    from public.inquiries i
    join vendor on vendor.id = i.vendor_id
  )
  select
    case when saves.n >= 5 then saves.n end,
    case when answers.answered >= 5 then answers.replied end,
    case when answers.answered >= 5 then answers.answered end
  from saves, answers
  where exists (select 1 from vendor);
$$;

create function public.vendor_public_stats(p_vendor_id uuid)
returns table (saved_by integer, replied integer, answered integer)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.vendor_public_stats(p_vendor_id);
$$;

comment on function public.vendor_public_stats is
  'For a vendor page: families who saved them, and how many of the families who answered the follow-up said the vendor replied. Each is null below 5.';

-- A vendor's numbers between two California dates (inclusive), for the
-- founders' monthly scorecard. Service role only.
create function public.vendor_scorecard(p_vendor_id uuid, p_from date, p_to date)
returns table (
  views integer, calls integer, texts integer, whatsapps integer, directions integer,
  shares integer, instagram integer, website integer,
  saves integer, inquiries integer, replied integer, answered integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  with activity as (
    select kind, sum(count)::integer as n
    from public.vendor_activity_daily
    where vendor_id = p_vendor_id and day between p_from and p_to
    group by kind
  ),
  window_bounds as (
    select
      (p_from::timestamp at time zone 'America/Los_Angeles') as starts,
      ((p_to + 1)::timestamp at time zone 'America/Los_Angeles') as ends
  )
  select
    coalesce((select n from activity where kind = 'view'), 0),
    coalesce((select n from activity where kind = 'call'), 0),
    coalesce((select n from activity where kind = 'text'), 0),
    coalesce((select n from activity where kind = 'whatsapp'), 0),
    coalesce((select n from activity where kind = 'directions'), 0),
    coalesce((select n from activity where kind = 'share'), 0),
    coalesce((select n from activity where kind = 'instagram'), 0),
    coalesce((select n from activity where kind = 'website'), 0),
    (select count(*)::integer from public.saved_vendors s, window_bounds w
     where s.vendor_id = p_vendor_id and s.created_at >= w.starts and s.created_at < w.ends),
    (select count(*)::integer from public.inquiries i, window_bounds w
     where i.vendor_id = p_vendor_id and i.created_at >= w.starts and i.created_at < w.ends),
    (select count(*)::integer from public.inquiries i, window_bounds w
     where i.vendor_id = p_vendor_id and i.created_at >= w.starts and i.created_at < w.ends
       and i.reply_answer in ('booked', 'deciding')),
    (select count(*)::integer from public.inquiries i, window_bounds w
     where i.vendor_id = p_vendor_id and i.created_at >= w.starts and i.created_at < w.ends
       and i.reply_answer is not null);
$$;

comment on function public.vendor_scorecard is
  'Founders only (service role): a vendor''s views, contact taps, saves, inquiries and follow-up answers between two California dates.';

revoke all on function
  private.track_vendor_activity, private.vendor_public_stats,
  public.track_vendor_activity, public.vendor_public_stats, public.vendor_scorecard
  from public;
grant execute on function private.track_vendor_activity, private.vendor_public_stats
  to anon, authenticated;
grant execute on function public.track_vendor_activity, public.vendor_public_stats
  to anon, authenticated;
grant execute on function public.vendor_scorecard to service_role;

-- Vendor sign-up limits ------------------------------------------------------------------

-- The "For vendors" form is open to anyone, so: at most 3 leads a day from one
-- phone number, and 60 an hour in total (a real week brings a handful).
create function private.limit_vendor_leads()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.vendor_leads
      where phone = new.phone and created_at > now() - interval '1 day') >= 3 then
    raise exception 'lead_limit' using errcode = 'P0001';
  end if;
  if (select count(*) from public.vendor_leads
      where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'lead_rate' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function private.limit_vendor_leads from public;

create trigger limit_vendor_leads before insert on public.vendor_leads
  for each row execute function private.limit_vendor_leads();

create index vendor_leads_phone_created_idx on public.vendor_leads (phone, created_at desc);
