-- Sharing a wedding plan like Google Drive (Kirat, 2026-10-02): the owner,
-- editors who change the plan, and suggesters who suggest a vendor for an
-- event instead of changing the plan; the owner or an editor accepts or
-- declines. Replaces planner (now editor) and viewer (now suggester): people
-- already in a plan keep the same access under the new name.
--
-- private.can_edit_wedding() is the one place that says who edits, so the
-- policies and functions no longer list roles.

-- Roles ----------------------------------------------------------------------------------

alter table public.wedding_members drop constraint wedding_members_role_check;
alter table public.wedding_invites drop constraint wedding_invites_role_check;

update public.wedding_members
set role = case role when 'planner' then 'editor' when 'viewer' then 'suggester' else role end;
update public.wedding_invites
set role = case role when 'planner' then 'editor' else 'suggester' end;

alter table public.wedding_members
  add constraint wedding_members_role_check check (role in ('owner', 'editor', 'suggester'));
alter table public.wedding_invites
  alter column role set default 'editor',
  add constraint wedding_invites_role_check check (role in ('editor', 'suggester'));

comment on table public.wedding_members is
  'Who is planning a wedding: one owner, editors (change the plan) and suggesters (suggest vendors). Added only by create_wedding and accept_wedding_invite.';
comment on function private.wedding_role is
  'The caller''s role in a wedding (owner, editor, suggester) or null. Used by RLS policies.';

create function private.can_edit_wedding(p_wedding_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.wedding_role(p_wedding_id) in ('owner', 'editor'), false);
$$;

comment on function private.can_edit_wedding is
  'Whether the caller can change a wedding''s plan (its owner or an editor).';

revoke all on function private.can_edit_wedding from public;
grant execute on function private.can_edit_wedding to authenticated;

-- Policies -------------------------------------------------------------------------------

drop policy "Owners and planners change their weddings" on public.weddings;
create policy "Owners and editors change their weddings" on public.weddings
  for update to authenticated
  using (private.can_edit_wedding(id))
  with check (private.can_edit_wedding(id));

drop policy "Owners and planners add events" on public.wedding_events;
drop policy "Owners and planners change events" on public.wedding_events;
drop policy "Owners and planners remove events" on public.wedding_events;
create policy "Owners and editors add events" on public.wedding_events
  for insert to authenticated
  with check (private.can_edit_wedding(wedding_id));
create policy "Owners and editors change events" on public.wedding_events
  for update to authenticated
  using (private.can_edit_wedding(wedding_id))
  with check (private.can_edit_wedding(wedding_id));
create policy "Owners and editors remove events" on public.wedding_events
  for delete to authenticated
  using (private.can_edit_wedding(wedding_id));

drop policy "Owners and planners add bookings" on public.wedding_bookings;
drop policy "Owners and planners change bookings" on public.wedding_bookings;
drop policy "Owners and planners remove bookings" on public.wedding_bookings;
create policy "Owners and editors add bookings" on public.wedding_bookings
  for insert to authenticated
  with check (private.can_edit_wedding(wedding_id));
create policy "Owners and editors change bookings" on public.wedding_bookings
  for update to authenticated
  using (private.can_edit_wedding(wedding_id))
  with check (private.can_edit_wedding(wedding_id));
create policy "Owners and editors remove bookings" on public.wedding_bookings
  for delete to authenticated
  using (private.can_edit_wedding(wedding_id));

drop policy "Owners and planners see the invites" on public.wedding_invites;
drop policy "Owners and planners cancel invites" on public.wedding_invites;
create policy "Owners and editors see the invites" on public.wedding_invites
  for select to authenticated
  using (private.can_edit_wedding(wedding_id));
create policy "Owners and editors cancel invites" on public.wedding_invites
  for update to authenticated
  using (private.can_edit_wedding(wedding_id))
  with check (private.can_edit_wedding(wedding_id));

-- Functions that named the old roles -----------------------------------------------------

-- The owner leaving hands the wedding to the longest-standing editor, else
-- the longest-standing suggester.
create or replace function private.after_wedding_member_removed()
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
    order by (m.role = 'editor') desc, m.joined_at, m.user_id
    limit 1;
    update public.wedding_members
    set role = 'owner'
    where wedding_id = old.wedding_id and user_id = next_owner;
  end if;
  return null;
end;
$$;

-- A join link that makes people editors or suggesters. The owner and editors
-- can make one; at most 10 open links per wedding.
create or replace function private.create_wedding_invite(p_wedding_id uuid, p_role text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_token text;
begin
  if not private.can_edit_wedding(p_wedding_id) then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if p_role is null or p_role not in ('editor', 'suggester') then
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

-- The default changes, so the wrapper is made again
drop function public.create_wedding_invite(uuid, text);
create function public.create_wedding_invite(p_wedding_id uuid, p_role text default 'editor')
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.create_wedding_invite(p_wedding_id, p_role);
$$;

comment on function public.create_wedding_invite is
  'Make a join link token for a wedding (owners and editors; role editor or suggester; 14 days, 20 uses).';

revoke all on function public.create_wedding_invite from public;
grant execute on function public.create_wedding_invite to authenticated;

-- Join a wedding with an invite. Joining again is harmless; an editor link
-- makes a suggester an editor. At most 30 members per wedding and 10 weddings
-- per person.
create or replace function private.accept_wedding_invite(p_token text)
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
    if current_role_in_wedding = 'suggester' and inv.role = 'editor'
      and inv.revoked_at is null and inv.expires_at > now() then
      update public.wedding_members set role = 'editor'
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

-- Change a member's role (owner only). Making someone the owner makes the
-- current owner an editor.
create or replace function private.set_wedding_member_role(p_wedding_id uuid, p_user_id uuid, p_role text)
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
  if p_role is null or p_role not in ('owner', 'editor', 'suggester') then
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
    update public.wedding_members set role = 'editor'
    where wedding_id = p_wedding_id and user_id = caller;
  end if;
  update public.wedding_members set role = p_role
  where wedding_id = p_wedding_id and user_id = p_user_id;
end;
$$;

comment on function public.set_wedding_member_role is
  'Owner only: make a member an editor or a suggester, or hand over ownership (the old owner becomes an editor).';

-- "Yes, we booked them" fills in the plans the family can edit
create or replace function private.book_from_followup()
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
    and m.role in ('owner', 'editor')
    and we.event_slug = any (new.event_slugs)
  on conflict (wedding_id, event_slug, category_slug) do update
    set vendor_id = excluded.vendor_id, updated_by = excluded.updated_by
    where b.vendor_id is null;

  return new;
end;
$$;

-- Suggestions ----------------------------------------------------------------------------

create table public.wedding_suggestions (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null,
  event_slug text not null,
  category_slug text not null references public.categories (slug) on update cascade,
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  note text check (length(btrim(note)) between 1 and 300),
  suggested_by uuid references auth.users (id) on delete set null,
  status text not null default 'open' check (status in ('open', 'accepted', 'declined')),
  resolved_by uuid references auth.users (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (wedding_id, event_slug)
    references public.wedding_events (wedding_id, event_slug) on delete cascade on update cascade,
  constraint wedding_suggestions_resolved check ((status = 'open') = (resolved_at is null))
);

comment on table public.wedding_suggestions is
  'A member''s suggestion of a vendor for one of the wedding''s events and vendor types. The owner or an editor accepts it (the vendor is booked in the plan) or declines it. Removing the event removes its suggestions.';

create index wedding_suggestions_wedding_idx on public.wedding_suggestions (wedding_id, status, created_at desc);
create index wedding_suggestions_event_idx on public.wedding_suggestions (wedding_id, event_slug);
create index wedding_suggestions_category_idx on public.wedding_suggestions (category_slug);
create index wedding_suggestions_vendor_idx on public.wedding_suggestions (vendor_id);
create index wedding_suggestions_suggested_by_idx on public.wedding_suggestions (suggested_by);
create index wedding_suggestions_resolved_by_idx on public.wedding_suggestions (resolved_by);
-- One open suggestion per vendor for the same event and vendor type
create unique index wedding_suggestions_one_open
  on public.wedding_suggestions (wedding_id, event_slug, category_slug, vendor_id)
  where status = 'open';

alter table public.wedding_suggestions enable row level security;

create policy "Members read the suggestions" on public.wedding_suggestions
  for select to authenticated
  using (private.wedding_role(wedding_id) is not null);

revoke all on public.wedding_suggestions from anon, authenticated;
grant select on public.wedding_suggestions to authenticated;

-- Suggest a vendor for an event of the plan. Any member can; the vendor must
-- be published and the event in the plan. At most 20 open suggestions per
-- person per wedding.
create function private.suggest_vendor(
  p_wedding_id uuid, p_event_slug text, p_category_slug text, p_vendor_id uuid, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  existing uuid;
  new_id uuid;
begin
  if private.wedding_role(p_wedding_id) is null then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if not exists (select 1 from public.wedding_events
                 where wedding_id = p_wedding_id and event_slug = p_event_slug) then
    raise exception 'event_not_in_plan' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.vendors where id = p_vendor_id and status = 'published') then
    raise exception 'vendor_not_found' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.categories where slug = p_category_slug) then
    raise exception 'category_not_found' using errcode = 'P0002';
  end if;

  select s.id into existing from public.wedding_suggestions s
  where s.wedding_id = p_wedding_id and s.event_slug = p_event_slug
    and s.category_slug = p_category_slug and s.vendor_id = p_vendor_id and s.status = 'open';
  if existing is not null then
    return existing;
  end if;

  if (select count(*) from public.wedding_suggestions
      where wedding_id = p_wedding_id and suggested_by = caller and status = 'open') >= 20 then
    raise exception 'suggestion_limit' using errcode = 'P0001';
  end if;

  insert into public.wedding_suggestions
    (wedding_id, event_slug, category_slug, vendor_id, note, suggested_by)
  values (p_wedding_id, p_event_slug, p_category_slug, p_vendor_id, nullif(btrim(p_note), ''), caller)
  returning id into new_id;
  return new_id;
end;
$$;

create function public.suggest_vendor(
  p_wedding_id uuid, p_event_slug text, p_category_slug text, p_vendor_id uuid, p_note text default null)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.suggest_vendor(p_wedding_id, p_event_slug, p_category_slug, p_vendor_id, p_note);
$$;

comment on function public.suggest_vendor is
  'Any member: suggest a vendor for an event and vendor type of the plan; returns the suggestion id (the open one if it was already suggested). Errors: not_allowed, event_not_in_plan, vendor_not_found, category_not_found, suggestion_limit.';

-- Accept (the vendor is booked for that event and vendor type, replacing any
-- vendor named there) or decline. The owner and editors only.
create function private.resolve_suggestion(p_suggestion_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  s public.wedding_suggestions;
begin
  select * into s from public.wedding_suggestions where id = p_suggestion_id for update;
  if not found or private.wedding_role(s.wedding_id) is null then
    raise exception 'suggestion_not_found' using errcode = 'P0002';
  end if;
  if not private.can_edit_wedding(s.wedding_id) then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if s.status <> 'open' then
    raise exception 'already_resolved' using errcode = 'P0001';
  end if;

  update public.wedding_suggestions
  set status = case when p_accept then 'accepted' else 'declined' end,
      resolved_by = caller,
      resolved_at = now()
  where id = s.id;

  if p_accept then
    insert into public.wedding_bookings as b (wedding_id, event_slug, category_slug, vendor_id, updated_by)
    values (s.wedding_id, s.event_slug, s.category_slug, s.vendor_id, caller)
    on conflict (wedding_id, event_slug, category_slug) do update
      set vendor_id = excluded.vendor_id, updated_by = excluded.updated_by;
  end if;
end;
$$;

create function public.resolve_suggestion(p_suggestion_id uuid, p_accept boolean)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.resolve_suggestion(p_suggestion_id, p_accept);
$$;

comment on function public.resolve_suggestion is
  'Owner or editor: accept a suggestion (books the vendor for that event and vendor type) or decline it. Errors: suggestion_not_found, not_allowed, already_resolved.';

-- Take back your own open suggestion
create function private.withdraw_suggestion(p_suggestion_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.wedding_suggestions
  where id = p_suggestion_id and suggested_by = (select auth.uid()) and status = 'open';
end;
$$;

create function public.withdraw_suggestion(p_suggestion_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.withdraw_suggestion(p_suggestion_id);
$$;

comment on function public.withdraw_suggestion is
  'Take back your own open suggestion. Does nothing for anyone else''s, or once it''s resolved.';

revoke all on function
  private.suggest_vendor, private.resolve_suggestion, private.withdraw_suggestion,
  public.suggest_vendor, public.resolve_suggestion, public.withdraw_suggestion
  from public;
grant execute on function
  private.suggest_vendor, private.resolve_suggestion, private.withdraw_suggestion,
  public.suggest_vendor, public.resolve_suggestion, public.withdraw_suggestion
  to authenticated;
