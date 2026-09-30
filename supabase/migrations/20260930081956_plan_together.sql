-- Plan together: My Wedding saved to the account and shared with family
-- (vision S15b/S15c wedding board; docs/RESEARCH_GROWTH.md #1).
--
-- weddings          One wedding being planned: date, a title ("Jaspreet &
--                   Amrit"), who it's for.
-- wedding_members   Who can see it, and their role: owner (who set it up),
--                   planner (can change things) or viewer (can only look).
-- wedding_events    Which events the family is having, each with an optional
--                   date and guest count.
-- wedding_bookings  Per event, the vendor types they've booked, optionally
--                   with the vendor and a note.
-- wedding_invites   Links a member shares (in WhatsApp) so relatives can
--                   join: unguessable token, a role, 14-day expiry, a use limit.
--
-- Only members can read a wedding. Owners and planners change it; viewers
-- can only look. Nobody joins except through an invite
-- (accept_wedding_invite). When the owner leaves or deletes their account, the
-- longest-standing planner (else member) becomes the owner; when the last
-- member goes, the wedding is deleted.
--
-- The RPCs that have to see past RLS (creating a wedding with its owner,
-- reading an invite before joining, joining, member names) are security
-- definer functions in private, called through thin security invoker wrappers
-- in public.

-- Tables ------------------------------------------------------------------------------

create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  title text check (length(btrim(title)) between 1 and 80),
  wedding_date date,
  planning_for text check (planning_for in ('self', 'child', 'sibling', 'relative', 'friend')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.weddings is
  'A wedding being planned (My Wedding). Readable by its members only; see wedding_members.';
comment on column public.weddings.wedding_date is
  'The main wedding day (the Anand Karaj for a Sikh wedding). A calendar date, never a timestamp.';

create table public.wedding_members (
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'planner', 'viewer')),
  invited_by uuid references auth.users (id) on delete set null,
  joined_at timestamptz not null default now(),
  primary key (wedding_id, user_id)
);

comment on table public.wedding_members is
  'Who is planning a wedding: one owner, planners (can edit) and viewers (can only look). Added only by create_wedding and accept_wedding_invite.';

create unique index wedding_members_one_owner on public.wedding_members (wedding_id) where role = 'owner';
create index wedding_members_user_idx on public.wedding_members (user_id);
create index wedding_members_invited_by_idx on public.wedding_members (invited_by);
create index weddings_created_by_idx on public.weddings (created_by);

create table public.wedding_events (
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  event_slug text not null references public.events (slug) on update cascade,
  event_date date,
  guest_band text
    check (guest_band in ('under_50', '50_100', '100_250', '250_500', '500_plus', 'not_sure')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (wedding_id, event_slug)
);

comment on table public.wedding_events is
  'The events a family is having, each with an optional date and guest count (the same bands as inquiries).';

create index wedding_events_event_slug_idx on public.wedding_events (event_slug);

create table public.wedding_bookings (
  wedding_id uuid not null,
  event_slug text not null,
  category_slug text not null references public.categories (slug) on update cascade,
  vendor_id uuid references public.vendors (id) on delete set null,
  note text check (length(btrim(note)) between 1 and 500),
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (wedding_id, event_slug, category_slug),
  foreign key (wedding_id, event_slug)
    references public.wedding_events (wedding_id, event_slug) on delete cascade on update cascade
);

comment on table public.wedding_bookings is
  'Vendor types booked for an event of a wedding, optionally with the vendor and a note. Removing the event removes its bookings.';

create index wedding_bookings_category_idx on public.wedding_bookings (category_slug);
create index wedding_bookings_vendor_idx on public.wedding_bookings (vendor_id);
create index wedding_bookings_updated_by_idx on public.wedding_bookings (updated_by);

create table public.wedding_invites (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  -- 122 random bits as 32 hex characters: unguessable, safe in a URL
  token text not null unique default replace(gen_random_uuid()::text, '-', '')
    check (token ~ '^[0-9a-f]{32}$'),
  role text not null default 'planner' check (role in ('planner', 'viewer')),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days',
  revoked_at timestamptz,
  uses integer not null default 0 check (uses >= 0),
  max_uses integer not null default 20 check (max_uses between 1 and 50)
);

comment on table public.wedding_invites is
  'Join links for a wedding. Created with create_wedding_invite, read before joining with wedding_invite_preview, used with accept_wedding_invite.';

create index wedding_invites_wedding_idx on public.wedding_invites (wedding_id);
create index wedding_invites_created_by_idx on public.wedding_invites (created_by);

create trigger set_updated_at before update on public.weddings
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.wedding_events
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.wedding_bookings
  for each row execute function private.set_updated_at();

-- Helpers ------------------------------------------------------------------------------

-- The signed-in person's role in a wedding, or null. Security definer so
-- policies on wedding_members can use it without recursing into themselves.
create function private.wedding_role(p_wedding_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select m.role
  from public.wedding_members m
  where m.wedding_id = p_wedding_id and m.user_id = (select auth.uid());
$$;

comment on function private.wedding_role is
  'The caller''s role in a wedding (owner, planner, viewer) or null. Used by RLS policies.';

revoke all on function private.wedding_role from public;
grant execute on function private.wedding_role to authenticated;

-- Who last changed a booking.
create function private.stamp_booking_editor()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_by := coalesce((select auth.uid()), new.updated_by);
  return new;
end;
$$;

-- Only on real edits: an account deletion clearing updated_by must not re-stamp it
create trigger stamp_booking_editor before insert or update of vendor_id, note on public.wedding_bookings
  for each row execute function private.stamp_booking_editor();

-- Keep a wedding sensible in size.
create function private.check_wedding_limits()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_table_name = 'wedding_events'
    and (select count(*) from public.wedding_events where wedding_id = new.wedding_id) >= 40 then
    raise exception 'wedding_too_many_events' using errcode = 'P0001';
  end if;
  if tg_table_name = 'wedding_bookings'
    and (select count(*) from public.wedding_bookings where wedding_id = new.wedding_id) >= 400 then
    raise exception 'wedding_too_many_bookings' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger check_wedding_limits before insert on public.wedding_events
  for each row execute function private.check_wedding_limits();
create trigger check_wedding_limits before insert on public.wedding_bookings
  for each row execute function private.check_wedding_limits();

-- When a member leaves (or deletes their account): if nobody is left, delete
-- the wedding; if the owner left, hand the wedding to the longest-standing
-- planner, else the longest-standing viewer.
create function private.after_wedding_member_removed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_owner uuid;
begin
  -- The wedding itself is being deleted: nothing to hand over
  if not exists (select 1 from public.weddings where id = old.wedding_id) then
    return null;
  end if;
  if not exists (select 1 from public.wedding_members where wedding_id = old.wedding_id) then
    delete from public.weddings where id = old.wedding_id;
  elsif old.role = 'owner' then
    select m.user_id into next_owner
    from public.wedding_members m
    where m.wedding_id = old.wedding_id
    order by (m.role = 'planner') desc, m.joined_at, m.user_id
    limit 1;
    update public.wedding_members
    set role = 'owner'
    where wedding_id = old.wedding_id and user_id = next_owner;
  end if;
  return null;
end;
$$;

create trigger after_wedding_member_removed after delete on public.wedding_members
  for each row execute function private.after_wedding_member_removed();

-- Access ------------------------------------------------------------------------------

alter table public.weddings enable row level security;
alter table public.wedding_members enable row level security;
alter table public.wedding_events enable row level security;
alter table public.wedding_bookings enable row level security;
alter table public.wedding_invites enable row level security;

create policy "Members read their weddings" on public.weddings
  for select to authenticated
  using (private.wedding_role(id) is not null);
create policy "Owners and planners change their weddings" on public.weddings
  for update to authenticated
  using (private.wedding_role(id) in ('owner', 'planner'))
  with check (private.wedding_role(id) in ('owner', 'planner'));
create policy "Owners delete their weddings" on public.weddings
  for delete to authenticated
  using (private.wedding_role(id) = 'owner');

create policy "Members see who else is planning" on public.wedding_members
  for select to authenticated
  using (private.wedding_role(wedding_id) is not null);

create policy "Members read the events" on public.wedding_events
  for select to authenticated
  using (private.wedding_role(wedding_id) is not null);
create policy "Owners and planners add events" on public.wedding_events
  for insert to authenticated
  with check (private.wedding_role(wedding_id) in ('owner', 'planner'));
create policy "Owners and planners change events" on public.wedding_events
  for update to authenticated
  using (private.wedding_role(wedding_id) in ('owner', 'planner'))
  with check (private.wedding_role(wedding_id) in ('owner', 'planner'));
create policy "Owners and planners remove events" on public.wedding_events
  for delete to authenticated
  using (private.wedding_role(wedding_id) in ('owner', 'planner'));

create policy "Members read the bookings" on public.wedding_bookings
  for select to authenticated
  using (private.wedding_role(wedding_id) is not null);
create policy "Owners and planners add bookings" on public.wedding_bookings
  for insert to authenticated
  with check (private.wedding_role(wedding_id) in ('owner', 'planner'));
create policy "Owners and planners change bookings" on public.wedding_bookings
  for update to authenticated
  using (private.wedding_role(wedding_id) in ('owner', 'planner'))
  with check (private.wedding_role(wedding_id) in ('owner', 'planner'));
create policy "Owners and planners remove bookings" on public.wedding_bookings
  for delete to authenticated
  using (private.wedding_role(wedding_id) in ('owner', 'planner'));

create policy "Owners and planners see the invites" on public.wedding_invites
  for select to authenticated
  using (private.wedding_role(wedding_id) in ('owner', 'planner'));
create policy "Owners and planners cancel invites" on public.wedding_invites
  for update to authenticated
  using (private.wedding_role(wedding_id) in ('owner', 'planner'))
  with check (private.wedding_role(wedding_id) in ('owner', 'planner'));

revoke all on public.weddings, public.wedding_members, public.wedding_events,
  public.wedding_bookings, public.wedding_invites
  from anon, authenticated;

grant select, delete on public.weddings to authenticated;
grant update (title, wedding_date, planning_for) on public.weddings to authenticated;
grant select on public.wedding_members to authenticated;
grant select, delete on public.wedding_events to authenticated;
grant insert (wedding_id, event_slug, event_date, guest_band) on public.wedding_events to authenticated;
grant update (event_date, guest_band) on public.wedding_events to authenticated;
grant select, delete on public.wedding_bookings to authenticated;
grant insert (wedding_id, event_slug, category_slug, vendor_id, note) on public.wedding_bookings to authenticated;
grant update (vendor_id, note) on public.wedding_bookings to authenticated;
grant select on public.wedding_invites to authenticated;
grant update (revoked_at) on public.wedding_invites to authenticated;

-- RPCs (security definer in private, invoker wrappers in public) -------------------------

-- Create a wedding with the caller as owner, optionally from the plan kept on
-- the phone: p_events are event slugs, p_booked is {"event_slug": ["category_slug", ...]}.
create function private.create_wedding(
  p_title text,
  p_wedding_date date,
  p_planning_for text,
  p_events text[],
  p_booked jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  new_id uuid;
begin
  if caller is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  if (select count(*) from public.wedding_members where user_id = caller and role = 'owner') >= 5 then
    raise exception 'wedding_limit' using errcode = 'P0001';
  end if;

  insert into public.weddings (title, wedding_date, planning_for, created_by)
  values (nullif(btrim(p_title), ''), p_wedding_date, p_planning_for, caller)
  returning id into new_id;

  insert into public.wedding_members (wedding_id, user_id, role)
  values (new_id, caller, 'owner');

  insert into public.wedding_events (wedding_id, event_slug)
  select distinct new_id, e from unnest(coalesce(p_events, '{}')) as e;

  insert into public.wedding_bookings (wedding_id, event_slug, category_slug, updated_by)
  select distinct new_id, b.key, c, caller
  from jsonb_each(coalesce(p_booked, '{}'::jsonb)) as b
  cross join lateral jsonb_array_elements_text(
    case when jsonb_typeof(b.value) = 'array' then b.value else '[]'::jsonb end
  ) as c
  where b.key = any(coalesce(p_events, '{}'));

  return new_id;
end;
$$;

create function public.create_wedding(
  p_title text default null,
  p_wedding_date date default null,
  p_planning_for text default null,
  p_events text[] default '{}',
  p_booked jsonb default '{}'
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.create_wedding(p_title, p_wedding_date, p_planning_for, p_events, p_booked);
$$;

comment on function public.create_wedding is
  'Create a wedding with the caller as owner, optionally from the plan on the phone (events, and {event: [categories]} booked). Returns its id.';

-- A join link for relatives. Owners and planners can make one; at most 10
-- open links per wedding.
create function private.create_wedding_invite(p_wedding_id uuid, p_role text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_token text;
begin
  if private.wedding_role(p_wedding_id) is distinct from 'owner'
    and private.wedding_role(p_wedding_id) is distinct from 'planner' then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if p_role not in ('planner', 'viewer') then
    raise exception 'invalid_role' using errcode = '22023';
  end if;
  if (select count(*) from public.wedding_invites
      where wedding_id = p_wedding_id and revoked_at is null and expires_at > now()) >= 10 then
    raise exception 'invite_limit' using errcode = 'P0001';
  end if;

  insert into public.wedding_invites (wedding_id, role, created_by)
  values (p_wedding_id, p_role, (select auth.uid()))
  returning token into new_token;
  return new_token;
end;
$$;

create function public.create_wedding_invite(p_wedding_id uuid, p_role text default 'planner')
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.create_wedding_invite(p_wedding_id, p_role);
$$;

comment on function public.create_wedding_invite is
  'Make a join link token for a wedding (owners and planners; role planner or viewer; 14 days, 20 uses).';

-- What a relative sees before joining: the title, date and who invited them.
-- Works logged out (the join page opens from WhatsApp, often on the web).
create function private.wedding_invite_preview(p_token text)
returns table (status text, title text, wedding_date date, inviter_name text, role text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  inv public.wedding_invites;
begin
  select * into inv from public.wedding_invites i where i.token = lower(btrim(p_token));
  if not found then
    return query select 'not_found'::text, null::text, null::date, null::text, null::text;
    return;
  end if;
  return query
  select
    case
      when inv.revoked_at is not null then 'revoked'
      when inv.expires_at <= now() then 'expired'
      when inv.uses >= inv.max_uses then 'used_up'
      else 'valid'
    end,
    w.title,
    w.wedding_date,
    -- First name only
    nullif(split_part(btrim(p.full_name), ' ', 1), ''),
    inv.role
  from public.weddings w
  left join public.profiles p on p.id = inv.created_by
  where w.id = inv.wedding_id;
end;
$$;

create function public.wedding_invite_preview(p_token text)
returns table (status text, title text, wedding_date date, inviter_name text, role text)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.wedding_invite_preview(p_token);
$$;

comment on function public.wedding_invite_preview is
  'Before joining: the invite''s status (valid, expired, used_up, revoked, not_found), the wedding title and date, and the inviter''s first name.';

-- Join a wedding with an invite. Joining again is harmless; a planner link
-- upgrades a viewer. At most 30 members per wedding and 10 weddings per person.
create function private.accept_wedding_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  inv public.wedding_invites;
  current_role_in_wedding text;
begin
  if caller is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  select * into inv from public.wedding_invites i
  where i.token = lower(btrim(p_token))
  for update;
  if not found then
    raise exception 'invite_not_found' using errcode = 'P0002';
  end if;

  current_role_in_wedding := private.wedding_role(inv.wedding_id);
  if current_role_in_wedding is not null then
    if current_role_in_wedding = 'viewer' and inv.role = 'planner'
      and inv.revoked_at is null and inv.expires_at > now() then
      update public.wedding_members set role = 'planner'
      where wedding_id = inv.wedding_id and user_id = caller;
    end if;
    return inv.wedding_id;
  end if;

  if inv.revoked_at is not null then
    raise exception 'invite_revoked' using errcode = 'P0001';
  elsif inv.expires_at <= now() then
    raise exception 'invite_expired' using errcode = 'P0001';
  elsif inv.uses >= inv.max_uses then
    raise exception 'invite_used_up' using errcode = 'P0001';
  end if;
  if (select count(*) from public.wedding_members where wedding_id = inv.wedding_id) >= 30 then
    raise exception 'wedding_full' using errcode = 'P0001';
  end if;
  if (select count(*) from public.wedding_members where user_id = caller) >= 10 then
    raise exception 'too_many_weddings' using errcode = 'P0001';
  end if;

  insert into public.wedding_members (wedding_id, user_id, role, invited_by)
  values (inv.wedding_id, caller, inv.role, inv.created_by);
  update public.wedding_invites set uses = uses + 1 where id = inv.id;
  return inv.wedding_id;
end;
$$;

create function public.accept_wedding_invite(p_token text)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.accept_wedding_invite(p_token);
$$;

comment on function public.accept_wedding_invite is
  'Join a wedding with an invite token; returns the wedding id. Errors: invite_not_found, invite_revoked, invite_expired, invite_used_up, wedding_full, too_many_weddings.';

-- The members of a wedding with their names (from profiles), for members only.
create function private.wedding_members_list(p_wedding_id uuid)
returns table (user_id uuid, role text, name text, is_me boolean, joined_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select m.user_id, m.role, p.full_name, m.user_id = (select auth.uid()), m.joined_at
  from public.wedding_members m
  left join public.profiles p on p.id = m.user_id
  where m.wedding_id = p_wedding_id
    and private.wedding_role(p_wedding_id) is not null
  order by (m.role = 'owner') desc, m.joined_at;
$$;

create function public.wedding_members_list(p_wedding_id uuid)
returns table (user_id uuid, role text, name text, is_me boolean, joined_at timestamptz)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.wedding_members_list(p_wedding_id);
$$;

comment on function public.wedding_members_list is
  'Members of a wedding with their names, owner first. Empty unless the caller is a member.';

-- Remove a member: anyone can leave; the owner can remove others.
create function private.remove_wedding_member(p_wedding_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_user_id is distinct from (select auth.uid())
    and private.wedding_role(p_wedding_id) is distinct from 'owner' then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  delete from public.wedding_members where wedding_id = p_wedding_id and user_id = p_user_id;
end;
$$;

create function public.remove_wedding_member(p_wedding_id uuid, p_user_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.remove_wedding_member(p_wedding_id, p_user_id);
$$;

comment on function public.remove_wedding_member is
  'Leave a wedding (your own id) or, as the owner, remove someone. The owner leaving hands the wedding on; the last member leaving deletes it.';

-- Change a member's role (owner only). Making someone the owner makes the
-- current owner a planner.
create function private.set_wedding_member_role(p_wedding_id uuid, p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if private.wedding_role(p_wedding_id) is distinct from 'owner' then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if p_role not in ('owner', 'planner', 'viewer') then
    raise exception 'invalid_role' using errcode = '22023';
  end if;
  if p_user_id = caller then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if not exists (select 1 from public.wedding_members
                 where wedding_id = p_wedding_id and user_id = p_user_id) then
    raise exception 'not_a_member' using errcode = 'P0002';
  end if;
  if p_role = 'owner' then
    update public.wedding_members set role = 'planner'
    where wedding_id = p_wedding_id and user_id = caller;
  end if;
  update public.wedding_members set role = p_role
  where wedding_id = p_wedding_id and user_id = p_user_id;
end;
$$;

create function public.set_wedding_member_role(p_wedding_id uuid, p_user_id uuid, p_role text)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.set_wedding_member_role(p_wedding_id, p_user_id, p_role);
$$;

comment on function public.set_wedding_member_role is
  'Owner only: make a member a planner or viewer, or hand over ownership (the old owner becomes a planner).';

revoke all on function
  private.create_wedding, private.create_wedding_invite, private.wedding_invite_preview,
  private.accept_wedding_invite, private.wedding_members_list, private.remove_wedding_member,
  private.set_wedding_member_role, private.stamp_booking_editor, private.check_wedding_limits,
  private.after_wedding_member_removed
  from public;
grant execute on function
  private.create_wedding, private.create_wedding_invite, private.accept_wedding_invite,
  private.wedding_members_list, private.remove_wedding_member, private.set_wedding_member_role
  to authenticated;
grant execute on function private.wedding_invite_preview to anon, authenticated;

revoke all on function
  public.create_wedding, public.create_wedding_invite, public.wedding_invite_preview,
  public.accept_wedding_invite, public.wedding_members_list, public.remove_wedding_member,
  public.set_wedding_member_role
  from public;
grant execute on function
  public.create_wedding, public.create_wedding_invite, public.accept_wedding_invite,
  public.wedding_members_list, public.remove_wedding_member, public.set_wedding_member_role
  to authenticated;
grant execute on function public.wedding_invite_preview to anon, authenticated;
