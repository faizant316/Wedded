-- "Yes, we booked them" fills in the plan (docs/RESEARCH_GROWTH.md #3).
--
-- When a family answers the follow-up on an inquiry with "booked", every
-- shared plan they can edit that includes one of the inquiry's events gets
-- that vendor booked for the vendor's main category at that event
-- (wedding_bookings.vendor_id), unless the family already named a vendor
-- there. Changing the answer later never un-books anything: the family
-- manages the plan.
--
-- vendor_public_stats() gains booked_by: how many weddings booked the vendor
-- (null below 5), for "Booked by N families through Wedded App", the
-- strongest proof we can give a vendor. The return type changes, so the
-- functions are dropped and recreated.

create function private.book_from_followup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  main_category text;
begin
  if new.reply_answer is distinct from 'booked'
    or old.reply_answer is not distinct from 'booked'
    or new.user_id is null then
    return new;
  end if;

  select vc.category_slug into main_category
  from public.vendor_categories vc
  where vc.vendor_id = new.vendor_id
  order by vc.position
  limit 1;
  if main_category is null then
    return new;
  end if;

  insert into public.wedding_bookings as b (wedding_id, event_slug, category_slug, vendor_id, updated_by)
  select we.wedding_id, we.event_slug, main_category, new.vendor_id, new.user_id
  from public.wedding_members m
  join public.wedding_events we on we.wedding_id = m.wedding_id
  where m.user_id = new.user_id
    and m.role in ('owner', 'planner')
    and we.event_slug = any (new.event_slugs)
  on conflict (wedding_id, event_slug, category_slug) do update
    set vendor_id = excluded.vendor_id, updated_by = excluded.updated_by
    where b.vendor_id is null;

  return new;
end;
$$;

revoke all on function private.book_from_followup from public;

create trigger book_from_followup after update of reply_answer on public.inquiries
  for each row execute function private.book_from_followup();

-- vendor_public_stats with booked_by ----------------------------------------------------

drop function public.vendor_public_stats(uuid);
drop function private.vendor_public_stats(uuid);

create function private.vendor_public_stats(p_vendor_id uuid)
returns table (saved_by integer, replied integer, answered integer, booked_by integer)
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
  ),
  bookings as (
    select count(distinct b.wedding_id)::integer as n
    from public.wedding_bookings b
    join vendor on vendor.id = b.vendor_id
  )
  select
    case when saves.n >= 5 then saves.n end,
    case when answers.answered >= 5 then answers.replied end,
    case when answers.answered >= 5 then answers.answered end,
    case when bookings.n >= 5 then bookings.n end
  from saves, answers, bookings
  where exists (select 1 from vendor);
$$;

create function public.vendor_public_stats(p_vendor_id uuid)
returns table (saved_by integer, replied integer, answered integer, booked_by integer)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.vendor_public_stats(p_vendor_id);
$$;

comment on function public.vendor_public_stats is
  'For a vendor page: families who saved them, how many families who answered the follow-up said the vendor replied, and weddings that booked them. Each is null below 5.';

revoke all on function private.vendor_public_stats, public.vendor_public_stats from public;
grant execute on function private.vendor_public_stats, public.vendor_public_stats
  to anon, authenticated;
