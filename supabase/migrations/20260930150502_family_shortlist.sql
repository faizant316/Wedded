-- Family shortlist (docs/RESEARCH_GROWTH.md #2): once a plan is shared, the
-- family sees every vendor any member saved, who saved it, and each other's
-- reactions (love it / maybe / not for us), so they can see where everyone
-- stands without a 40-message WhatsApp thread.
--
-- wedding_reactions   One reaction per member per vendor in a wedding. Any
--                     member can react (viewers too: it's an opinion, not a
--                     change to the plan); each person changes only their own.
-- wedding_shortlist() The members' saved vendors (saved_vendors, which stay
--                     per person) with who saved them and the reaction counts.
--                     Members only. Joining a wedding is what shares your
--                     saves with that family.

create table public.wedding_reactions (
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reaction text not null check (reaction in ('love', 'maybe', 'no')),
  updated_at timestamptz not null default now(),
  primary key (wedding_id, vendor_id, user_id)
);

comment on table public.wedding_reactions is
  'Family members'' reactions to shortlisted vendors: love, maybe or no. Members read all; each writes their own.';

create index wedding_reactions_vendor_idx on public.wedding_reactions (vendor_id);
create index wedding_reactions_user_idx on public.wedding_reactions (user_id);

create trigger set_updated_at before update on public.wedding_reactions
  for each row execute function private.set_updated_at();

alter table public.wedding_reactions enable row level security;

create policy "Members read the family's reactions" on public.wedding_reactions
  for select to authenticated
  using (private.wedding_role(wedding_id) is not null);
create policy "Members add their own reaction" on public.wedding_reactions
  for insert to authenticated
  with check (user_id = (select auth.uid()) and private.wedding_role(wedding_id) is not null);
create policy "Members change their own reaction" on public.wedding_reactions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and private.wedding_role(wedding_id) is not null);
create policy "Members remove their own reaction" on public.wedding_reactions
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.wedding_reactions from anon, authenticated;
grant select, delete on public.wedding_reactions to authenticated;
grant insert (wedding_id, vendor_id, reaction) on public.wedding_reactions to authenticated;
grant update (reaction) on public.wedding_reactions to authenticated;

-- The family's saved vendors with who saved them and how everyone feels.
-- One row per vendor (events merged), best loved first.
create function private.wedding_shortlist(p_wedding_id uuid)
returns table (
  vendor_id uuid,
  slug text,
  name text,
  name_pa text,
  city text,
  published boolean,
  event_slugs text[],
  saved_by text[],
  loves integer,
  maybes integer,
  nos integer,
  my_reaction text,
  loved_by text[]
)
language sql
stable
security definer
set search_path = ''
as $$
  with members as (
    select m.user_id
    from public.wedding_members m
    where m.wedding_id = p_wedding_id
      and private.wedding_role(p_wedding_id) is not null
  ),
  saves as (
    select
      s.vendor_id,
      array_agg(distinct s.event_slug) filter (where s.event_slug is not null) as event_slugs,
      array_agg(distinct coalesce(nullif(split_part(btrim(p.full_name), ' ', 1), ''), '?')) as saved_by
    from public.saved_vendors s
    join members on members.user_id = s.user_id
    left join public.profiles p on p.id = s.user_id
    group by s.vendor_id
  ),
  reactions as (
    select
      r.vendor_id,
      (count(*) filter (where r.reaction = 'love'))::integer as loves,
      (count(*) filter (where r.reaction = 'maybe'))::integer as maybes,
      (count(*) filter (where r.reaction = 'no'))::integer as nos,
      max(r.reaction) filter (where r.user_id = (select auth.uid())) as my_reaction,
      array_agg(coalesce(nullif(split_part(btrim(p.full_name), ' ', 1), ''), '?'))
        filter (where r.reaction = 'love') as loved_by
    from public.wedding_reactions r
    left join public.profiles p on p.id = r.user_id
    where r.wedding_id = p_wedding_id
      and r.user_id in (select user_id from members)
    group by r.vendor_id
  )
  select
    v.id, v.slug, v.name, v.name_pa, v.city, v.status = 'published',
    coalesce(saves.event_slugs, '{}'), saves.saved_by,
    coalesce(reactions.loves, 0), coalesce(reactions.maybes, 0), coalesce(reactions.nos, 0),
    reactions.my_reaction, coalesce(reactions.loved_by, '{}')
  from saves
  join public.vendors v on v.id = saves.vendor_id
  left join reactions on reactions.vendor_id = saves.vendor_id
  order by coalesce(reactions.loves, 0) desc, coalesce(reactions.nos, 0), v.name;
$$;

create function public.wedding_shortlist(p_wedding_id uuid)
returns table (
  vendor_id uuid,
  slug text,
  name text,
  name_pa text,
  city text,
  published boolean,
  event_slugs text[],
  saved_by text[],
  loves integer,
  maybes integer,
  nos integer,
  my_reaction text,
  loved_by text[]
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.wedding_shortlist(p_wedding_id);
$$;

comment on function public.wedding_shortlist is
  'For members: every vendor a member of the wedding saved, with the events, who saved it (first names), reaction counts, your reaction and who loves it. Best loved first.';

revoke all on function private.wedding_shortlist, public.wedding_shortlist from public;
grant execute on function private.wedding_shortlist, public.wedding_shortlist to authenticated;

-- React (or change your reaction) in one call. Runs as the caller, so the
-- policies above still decide; it exists because an API upsert would need
-- update rights on columns that must never change.
create function public.react_to_vendor(p_wedding_id uuid, p_vendor_id uuid, p_reaction text)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.wedding_reactions (wedding_id, vendor_id, reaction)
  values (p_wedding_id, p_vendor_id, p_reaction)
  on conflict (wedding_id, vendor_id, user_id) do update set reaction = excluded.reaction;
$$;

comment on function public.react_to_vendor is
  'Set your reaction (love, maybe, no) to a vendor in a wedding you belong to.';

revoke all on function public.react_to_vendor from public;
grant execute on function public.react_to_vendor to authenticated;
