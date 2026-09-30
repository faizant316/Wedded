-- Chat between families and vendors, and vendor accounts (feedback from Town
-- and Country, Sacramento: on WeddingPro, messaging a lead meant getting the
-- number and texting; vision Phase 8 "vendor accounts and the inbox", brought
-- forward; DECISIONS.md 2026-09-30). One-to-one only: no group chat, no
-- payments (vision §9 scope).
--
-- vendor_members   Which signed-in people run a vendor (owner or staff).
--                  Founders add them (npm run vendors:invite); the vendor then
--                  signs in with the same email code as families.
-- conversations    One per family and vendor. Every inquiry starts (or
--                  continues) one, with the booking details as its first
--                  message. Read markers and notification times per side.
-- messages         text and photo (both sides); quote and menu (vendors).
--                  Written only through send_message(), which checks the
--                  sender, the kind and a rate limit.
-- chat-media       A private bucket for chat photos: <conversation id>/<file>,
--                  readable and writable only by the two sides.
--
-- Only the family and the vendor's people can read a conversation. Deleting
-- a family account keeps the vendor's copy of the messages but removes the
-- family's name from it (like inquiries).

-- Vendor accounts -----------------------------------------------------------------------

create table public.vendor_members (
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  primary key (vendor_id, user_id)
);

comment on table public.vendor_members is
  'People who run a vendor''s account (owner or staff). Added by founders; each person reads only their own rows.';

create index vendor_members_user_idx on public.vendor_members (user_id);

alter table public.vendor_members enable row level security;

create policy "People see their own vendor memberships" on public.vendor_members
  for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.vendor_members from anon, authenticated;
grant select on public.vendor_members to authenticated;

create function private.is_vendor_member(p_vendor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.vendor_members m
    where m.vendor_id = p_vendor_id and m.user_id = (select auth.uid())
  );
$$;

-- Conversations and messages -------------------------------------------------------------

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  family_user_id uuid references auth.users (id) on delete set null,
  -- "Harjit K.", what the vendor sees; removed when the account is deleted
  family_name text check (length(btrim(family_name)) between 1 and 80),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  family_read_at timestamptz,
  vendor_read_at timestamptz,
  family_notified_at timestamptz,
  vendor_notified_at timestamptz,
  constraint conversations_one_per_family unique (vendor_id, family_user_id)
);

comment on table public.conversations is
  'One chat per family and vendor. Readable by the family and the vendor''s members only; written by the chat functions.';

create index conversations_family_idx on public.conversations (family_user_id, last_message_at desc);
create index conversations_vendor_idx on public.conversations (vendor_id, last_message_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_user_id uuid references auth.users (id) on delete set null,
  sender_role text not null check (sender_role in ('family', 'vendor', 'system')),
  kind text not null default 'text' check (kind in ('text', 'photo', 'quote', 'menu', 'booking')),
  body text check (length(btrim(body)) between 1 and 4000),
  -- photo: {path, width, height}; quote: {amount, unit, eventSlug, date, guests,
  -- note, validUntil}; menu: {menuId}; booking: the inquiry's details
  data jsonb not null default '{}' check (jsonb_typeof(data) = 'object'),
  inquiry_id uuid references public.inquiries (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint messages_text_has_body check (kind <> 'text' or body is not null)
);

comment on table public.messages is
  'Chat messages. Readable by both sides of the conversation; written only by send_message() and the inquiry trigger.';

create index messages_conversation_idx on public.messages (conversation_id, created_at);
create index messages_sender_idx on public.messages (sender_user_id, created_at);
create index messages_inquiry_idx on public.messages (inquiry_id);

create function private.can_see_conversation(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversations c
    where c.id = p_conversation_id
      and (c.family_user_id = (select auth.uid()) or private.is_vendor_member(c.vendor_id))
  );
$$;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "The family and the vendor read their conversation" on public.conversations
  for select to authenticated
  using (family_user_id = (select auth.uid()) or private.is_vendor_member(vendor_id));

create policy "The family and the vendor read their messages" on public.messages
  for select to authenticated
  using (private.can_see_conversation(conversation_id));

revoke all on public.conversations, public.messages from anon, authenticated;
grant select on public.conversations, public.messages to authenticated;

-- Deleting a family account removes their name from the vendor's copy
create function private.scrub_conversation_family()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.family_user_id is null and old.family_user_id is not null then
    new.family_name := null;
  end if;
  return new;
end;
$$;

create trigger scrub_conversation_family before update of family_user_id on public.conversations
  for each row execute function private.scrub_conversation_family();

-- "Harjit Kaur" → "Harjit K."
create function private.short_name(p_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(
    btrim(
      split_part(btrim(coalesce(p_name, '')), ' ', 1) || ' ' ||
      coalesce(left(nullif(split_part(btrim(coalesce(p_name, '')), ' ', 2), ''), 1) || '.', '')
    ),
    ''
  );
$$;

-- Chat functions (security definer in private, invoker wrappers in public) ------------------

create function private.start_conversation(p_vendor_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  conversation uuid;
begin
  if caller is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles where id = caller) then
    raise exception 'needs_profile' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.vendors where id = p_vendor_id and status = 'published') then
    raise exception 'vendor_not_found' using errcode = 'P0002';
  end if;

  select id into conversation from public.conversations
  where vendor_id = p_vendor_id and family_user_id = caller;
  if conversation is not null then
    return conversation;
  end if;

  if (select count(*) from public.conversations
      where family_user_id = caller and created_at > now() - interval '1 day') >= 30 then
    raise exception 'conversation_rate' using errcode = 'P0001';
  end if;

  insert into public.conversations (vendor_id, family_user_id, family_name, family_read_at)
  values (p_vendor_id, caller,
    private.short_name((select full_name from public.profiles where id = caller)), now())
  returning id into conversation;
  return conversation;
end;
$$;

create function public.start_conversation(p_vendor_id uuid)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.start_conversation(p_vendor_id);
$$;

comment on function public.start_conversation is
  'The signed-in family''s conversation with a published vendor (created if new). Errors: needs_profile, vendor_not_found, conversation_rate.';

create function private.send_message(
  p_conversation_id uuid,
  p_kind text,
  p_body text,
  p_data jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  convo public.conversations;
  role text;
  new_id uuid;
begin
  select * into convo from public.conversations where id = p_conversation_id;
  if convo.id is null or caller is null then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if convo.family_user_id = caller then
    role := 'family';
  elsif private.is_vendor_member(convo.vendor_id) then
    role := 'vendor';
  else
    raise exception 'not_allowed' using errcode = '42501';
  end if;

  p_body := nullif(btrim(p_body), '');
  p_data := coalesce(p_data, '{}'::jsonb);
  if p_kind = 'text' then
    if p_body is null then
      raise exception 'empty_message' using errcode = '22023';
    end if;
  elsif p_kind = 'photo' then
    if jsonb_typeof(p_data -> 'path') is distinct from 'string'
      or split_part(p_data ->> 'path', '/', 1) <> p_conversation_id::text then
      raise exception 'invalid_photo' using errcode = '22023';
    end if;
  elsif p_kind = 'quote' and role = 'vendor' then
    if jsonb_typeof(p_data -> 'amount') is distinct from 'number' or (p_data ->> 'amount')::numeric <= 0 then
      raise exception 'invalid_quote' using errcode = '22023';
    end if;
  elsif p_kind = 'menu' and role = 'vendor' then
    if not exists (
      select 1 from public.vendor_menus m
      where m.id::text = p_data ->> 'menuId' and m.vendor_id = convo.vendor_id
    ) then
      raise exception 'invalid_menu' using errcode = '22023';
    end if;
  else
    raise exception 'invalid_kind' using errcode = '22023';
  end if;

  if (select count(*) from public.messages
      where sender_user_id = caller and created_at > now() - interval '1 hour') >= 120 then
    raise exception 'message_rate' using errcode = 'P0001';
  end if;

  -- clock_timestamp, not now(): read markers must fall after the message
  -- even when several things happen in one transaction
  insert into public.messages (conversation_id, sender_user_id, sender_role, kind, body, data, created_at)
  values (p_conversation_id, caller, role, p_kind, p_body, p_data, clock_timestamp())
  returning id into new_id;

  if role = 'family' then
    update public.conversations
    set last_message_at = clock_timestamp(), family_read_at = clock_timestamp()
    where id = p_conversation_id;
  else
    update public.conversations
    set last_message_at = clock_timestamp(), vendor_read_at = clock_timestamp()
    where id = p_conversation_id;
  end if;
  return new_id;
end;
$$;

create function public.send_message(
  p_conversation_id uuid,
  p_kind text default 'text',
  p_body text default null,
  p_data jsonb default '{}'
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.send_message(p_conversation_id, p_kind, p_body, p_data);
$$;

comment on function public.send_message is
  'Send a message: text or photo from either side; quote ({amount, ...}) or menu ({menuId}) from the vendor. At most 120 an hour per person.';

create function private.mark_conversation_read(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  update public.conversations
  set family_read_at = clock_timestamp()
  where id = p_conversation_id and family_user_id = caller;
  update public.conversations c
  set vendor_read_at = clock_timestamp()
  where c.id = p_conversation_id and private.is_vendor_member(c.vendor_id);
end;
$$;

create function public.mark_conversation_read(p_conversation_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.mark_conversation_read(p_conversation_id);
$$;

comment on function public.mark_conversation_read is
  'Mark a conversation read up to now for the caller''s side.';

-- The inbox: every conversation the caller is part of (as a family, or as a
-- vendor's member), newest first, with the last message and unread count.
create function private.my_conversations()
returns table (
  id uuid,
  side text,
  vendor_id uuid,
  vendor_slug text,
  vendor_name text,
  vendor_name_pa text,
  vendor_cover_path text,
  family_name text,
  last_message_at timestamptz,
  last_kind text,
  last_body text,
  last_sender_role text,
  unread_count integer,
  other_read_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with mine as (
    select c.*, case when c.family_user_id = (select auth.uid()) then 'family' else 'vendor' end as side
    from public.conversations c
    where c.family_user_id = (select auth.uid()) or private.is_vendor_member(c.vendor_id)
  )
  select
    mine.id,
    mine.side,
    v.id,
    v.slug,
    v.name,
    v.name_pa,
    (select vm.storage_path from public.vendor_media vm
     where vm.vendor_id = v.id order by vm.is_cover desc, vm.sort_order limit 1),
    mine.family_name,
    mine.last_message_at,
    last.kind,
    last.body,
    last.sender_role,
    (select count(*)::integer from public.messages m
     where m.conversation_id = mine.id
       and m.sender_role <> mine.side
       and m.created_at > coalesce(case when mine.side = 'family' then mine.family_read_at else mine.vendor_read_at end, '-infinity')),
    case when mine.side = 'family' then mine.vendor_read_at else mine.family_read_at end
  from mine
  join public.vendors v on v.id = mine.vendor_id
  left join lateral (
    select m.kind, m.body, m.sender_role
    from public.messages m
    where m.conversation_id = mine.id
    order by m.created_at desc
    limit 1
  ) last on true
  order by mine.last_message_at desc;
$$;

create function public.my_conversations()
returns table (
  id uuid,
  side text,
  vendor_id uuid,
  vendor_slug text,
  vendor_name text,
  vendor_name_pa text,
  vendor_cover_path text,
  family_name text,
  last_message_at timestamptz,
  last_kind text,
  last_body text,
  last_sender_role text,
  unread_count integer,
  other_read_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.my_conversations();
$$;

comment on function public.my_conversations is
  'The caller''s inbox: conversations as a family or as a vendor member, newest first, with the last message and unread count.';

-- Every inquiry continues the conversation with its booking details --------------------------

create function private.inquiry_to_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  conversation uuid;
begin
  if new.user_id is null then
    return new;
  end if;
  insert into public.conversations as c (vendor_id, family_user_id, family_name, family_read_at)
  values (new.vendor_id, new.user_id, private.short_name(new.sender_name), now())
  on conflict (vendor_id, family_user_id) do update
    set last_message_at = clock_timestamp(), family_read_at = clock_timestamp()
  returning c.id into conversation;

  insert into public.messages (conversation_id, sender_user_id, sender_role, kind, body, data, inquiry_id, created_at)
  values (conversation, new.user_id, 'family', 'booking', new.message,
    jsonb_strip_nulls(jsonb_build_object(
      'eventSlugs', to_jsonb(new.event_slugs),
      'eventDate', new.event_date,
      'startTime', new.start_time,
      'guestBand', new.guest_band,
      'location', new.location,
      'details', new.details
    )),
    new.id, clock_timestamp());
  return new;
end;
$$;

create trigger inquiry_to_conversation after insert on public.inquiries
  for each row execute function private.inquiry_to_conversation();

-- Chat photos ---------------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-media', 'chat-media', false, 5 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

-- <conversation id>/<file>: only the two sides can upload or read
create function private.can_use_chat_object(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when split_part(p_name, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then private.can_see_conversation(split_part(p_name, '/', 1)::uuid)
    else false
  end;
$$;

create policy "Chat photos are readable by the two sides" on storage.objects
  for select to authenticated
  using (bucket_id = 'chat-media' and private.can_use_chat_object(name));
create policy "Chat photos are uploaded by the two sides" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'chat-media' and private.can_use_chat_object(name));

-- Live updates ----------------------------------------------------------------------------------

alter publication supabase_realtime add table public.messages, public.conversations;

-- Grants ------------------------------------------------------------------------------------------

revoke all on function
  private.is_vendor_member, private.can_see_conversation, private.short_name,
  private.start_conversation, private.send_message, private.mark_conversation_read,
  private.my_conversations, private.inquiry_to_conversation, private.can_use_chat_object,
  private.scrub_conversation_family
  from public;
grant execute on function
  private.is_vendor_member, private.can_see_conversation, private.start_conversation,
  private.send_message, private.mark_conversation_read, private.my_conversations,
  private.can_use_chat_object
  to authenticated;

revoke all on function
  public.start_conversation, public.send_message, public.mark_conversation_read,
  public.my_conversations
  from public;
grant execute on function
  public.start_conversation, public.send_message, public.mark_conversation_read,
  public.my_conversations
  to authenticated;
