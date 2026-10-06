-- Reels (Kirat, 2026-10-05): a TikTok / Instagram Reels feed of wedding clips.
-- Families post clips from their wedding and tag the vendors they used;
-- vendors post their work. People follow vendors and other people, like and
-- comment. This replaces the 2026-09-30 rule of no likes, followers or
-- comments (DECISIONS.md).
--
-- Because anyone can post, Apple's rule 1.2 for user content applies: every
-- reel, comment and person can be reported, people can block each other, and
-- the founders review reports (reel_reports, founders-only). Blocking hides
-- the other person's reels and comments both ways.
--
-- Videos live in the public `reels` bucket under <user id>/<file>, so the
-- feed streams them straight from storage. Only the poster can upload or
-- delete their own files. A reel row is created only by create_reel(), after
-- the upload, which checks the path is theirs, the consent tick, the tags
-- and a daily limit.

-- Reels ------------------------------------------------------------------------------------------

create table public.reels (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  -- Posted as a vendor account (its members), or null for a family's own clip
  vendor_id uuid references public.vendors (id) on delete cascade,
  video_path text not null check (video_path ~ '^[0-9a-f-]{36}/[A-Za-z0-9._-]{1,80}$'),
  thumb_path text check (thumb_path ~ '^[0-9a-f-]{36}/[A-Za-z0-9._-]{1,80}$'),
  duration_s numeric(5, 2) not null check (duration_s > 0 and duration_s <= 90),
  width integer check (width between 1 and 8192),
  height integer check (height between 1 and 8192),
  caption text check (length(btrim(caption)) between 1 and 300),
  event_slug text references public.events (slug) on update cascade,
  -- live: in the feeds; hidden: taken down by the founders after a report
  status text not null default 'live' check (status in ('live', 'hidden')),
  created_at timestamptz not null default now()
);

comment on table public.reels is
  'Short wedding clips in the Reels feed: a family''s (author_id) or a vendor''s (vendor_id). Written only by create_reel(); the founders hide reported ones.';

create index reels_feed_idx on public.reels (status, created_at desc);
create index reels_author_idx on public.reels (author_id, created_at desc);
create index reels_vendor_idx on public.reels (vendor_id, created_at desc);
create index reels_event_idx on public.reels (event_slug);

-- Vendors tagged in a reel. A family's tag starts pending and shows on the
-- reel straight away; the vendor approves it (it then shows on their page) or
-- declines it (it disappears). A vendor's own reel tags itself, approved.
create table public.reel_vendor_tags (
  reel_id uuid not null references public.reels (id) on delete cascade,
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  primary key (reel_id, vendor_id)
);

comment on table public.reel_vendor_tags is
  'Vendors tagged in a reel: pending (shown on the reel), approved (also on the vendor''s page) or declined (hidden).';

create index reel_vendor_tags_vendor_idx on public.reel_vendor_tags (vendor_id, status);

-- People follow a vendor or another person
create table public.follows (
  follower_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  user_id uuid references auth.users (id) on delete cascade,
  vendor_id uuid references public.vendors (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint follows_one_target check ((user_id is null) <> (vendor_id is null)),
  constraint follows_not_self check (user_id is distinct from follower_id)
);

create unique index follows_user_unique on public.follows (follower_id, user_id) where user_id is not null;
create unique index follows_vendor_unique on public.follows (follower_id, vendor_id) where vendor_id is not null;
create index follows_user_idx on public.follows (user_id);
create index follows_vendor_idx on public.follows (vendor_id);

create table public.reel_likes (
  reel_id uuid not null references public.reels (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (reel_id, user_id)
);

create index reel_likes_user_idx on public.reel_likes (user_id);

create table public.reel_comments (
  id uuid primary key default gen_random_uuid(),
  reel_id uuid not null references public.reels (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (length(btrim(body)) between 1 and 500),
  -- Hidden by the founders after a report, or by the reel's poster
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index reel_comments_reel_idx on public.reel_comments (reel_id, created_at);
create index reel_comments_user_idx on public.reel_comments (user_id);

create table public.user_blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint user_blocks_not_self check (blocker_id <> blocked_id)
);

create index user_blocks_blocked_idx on public.user_blocks (blocked_id);

-- Reports for the founders. Nobody can read them through the API.
create table public.reel_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users (id) on delete set null default auth.uid(),
  reel_id uuid references public.reels (id) on delete cascade,
  comment_id uuid references public.reel_comments (id) on delete cascade,
  reported_user_id uuid references auth.users (id) on delete cascade,
  reason text not null check (reason in ('inappropriate', 'not_mine', 'privacy', 'spam', 'harassment', 'other')),
  note text check (length(btrim(note)) between 1 and 500),
  status text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  created_at timestamptz not null default now(),
  constraint reel_reports_one_target check (num_nonnulls(reel_id, comment_id, reported_user_id) = 1)
);

comment on table public.reel_reports is
  'Reports of a reel, comment or person, for the founders to review (App Store rule 1.2). No API access.';

create index reel_reports_status_idx on public.reel_reports (status, created_at);
create index reel_reports_reporter_idx on public.reel_reports (reporter_id);
create index reel_reports_reel_idx on public.reel_reports (reel_id);
create index reel_reports_comment_idx on public.reel_reports (comment_id);
create index reel_reports_user_idx on public.reel_reports (reported_user_id);

-- Helpers ----------------------------------------------------------------------------------------

-- Either of two people has blocked the other
create function private.blocked_between(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_blocks
    where (blocker_id = p_a and blocked_id = p_b) or (blocker_id = p_b and blocked_id = p_a)
  );
$$;

-- Access -----------------------------------------------------------------------------------------

alter table public.reels enable row level security;
alter table public.reel_vendor_tags enable row level security;
alter table public.follows enable row level security;
alter table public.reel_likes enable row level security;
alter table public.reel_comments enable row level security;
alter table public.user_blocks enable row level security;
alter table public.reel_reports enable row level security;

create policy "Live reels are readable, except from people you've blocked" on public.reels
  for select to anon, authenticated
  using (
    (status = 'live' and not private.blocked_between((select auth.uid()), author_id))
    or author_id = (select auth.uid())
  );
create policy "People delete their own reels" on public.reels
  for delete to authenticated
  using (author_id = (select auth.uid()));

create policy "Tags on readable reels are readable" on public.reel_vendor_tags
  for select to anon, authenticated
  using (
    status <> 'declined'
    and exists (select 1 from public.reels r where r.id = reel_id)
  );

create policy "People see who follows whom" on public.follows
  for select to anon, authenticated
  using (true);
create policy "People follow" on public.follows
  for insert to authenticated
  with check (follower_id = (select auth.uid()));
create policy "People unfollow" on public.follows
  for delete to authenticated
  using (follower_id = (select auth.uid()));

create policy "Likes on readable reels are readable" on public.reel_likes
  for select to anon, authenticated
  using (exists (select 1 from public.reels r where r.id = reel_id));
create policy "People like readable reels" on public.reel_likes
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.reels r where r.id = reel_id and r.status = 'live')
  );
create policy "People unlike" on public.reel_likes
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "Comments on readable reels are readable" on public.reel_comments
  for select to anon, authenticated
  using (
    not hidden
    and not private.blocked_between((select auth.uid()), user_id)
    and exists (select 1 from public.reels r where r.id = reel_id)
  );
create policy "People delete their own comments" on public.reel_comments
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "People see their own blocks" on public.user_blocks
  for select to authenticated
  using (blocker_id = (select auth.uid()));
create policy "People block" on public.user_blocks
  for insert to authenticated
  with check (blocker_id = (select auth.uid()));
create policy "People unblock" on public.user_blocks
  for delete to authenticated
  using (blocker_id = (select auth.uid()));

revoke all on public.reels, public.reel_vendor_tags, public.follows, public.reel_likes,
  public.reel_comments, public.user_blocks, public.reel_reports from anon, authenticated;
grant select on public.reels, public.reel_vendor_tags, public.follows, public.reel_likes,
  public.reel_comments to anon, authenticated;
grant delete on public.reels, public.reel_comments to authenticated;
grant select, delete on public.user_blocks to authenticated;
grant insert (blocked_id) on public.user_blocks to authenticated;
grant insert (user_id, vendor_id), delete on public.follows to authenticated;
grant insert (reel_id), delete on public.reel_likes to authenticated;

-- Writing ----------------------------------------------------------------------------------------

-- Post a reel after uploading its video (and thumbnail) to <your id>/ in the
-- reels bucket. As a vendor's member, p_vendor_id posts it as that business
-- (and tags it, approved). p_consent: everyone shown is happy to be in it.
-- At most 10 tagged vendors, published ones only; 15 reels a day per person.
create function private.create_reel(
  p_video_path text, p_thumb_path text, p_duration_s numeric, p_width integer, p_height integer,
  p_caption text, p_event_slug text, p_vendor_ids uuid[], p_vendor_id uuid, p_consent boolean)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  folder text;
  new_id uuid;
  tags uuid[];
begin
  if caller is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  if p_consent is not true then
    raise exception 'consent_required' using errcode = '22023';
  end if;
  folder := caller::text || '/';
  if left(p_video_path, length(folder)) <> folder
    or (p_thumb_path is not null and left(p_thumb_path, length(folder)) <> folder) then
    raise exception 'not_your_file' using errcode = '42501';
  end if;
  if not exists (select 1 from storage.objects where bucket_id = 'reels' and name = p_video_path) then
    raise exception 'video_not_uploaded' using errcode = 'P0002';
  end if;
  if p_vendor_id is not null and not private.is_vendor_member(p_vendor_id) then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if (select count(*) from public.reels
      where author_id = caller and created_at > now() - interval '1 day') >= 15 then
    raise exception 'reel_limit' using errcode = 'P0001';
  end if;

  tags := array(select distinct unnest(coalesce(p_vendor_ids, '{}'::uuid[])));
  if p_vendor_id is not null then
    tags := array_remove(tags, p_vendor_id);
  end if;
  if cardinality(tags) > 10 then
    raise exception 'too_many_tags' using errcode = '22023';
  end if;
  if exists (
    select 1 from unnest(tags) as t (id)
    where not exists (select 1 from public.vendors v where v.id = t.id and v.status = 'published')
  ) then
    raise exception 'vendor_not_found' using errcode = 'P0002';
  end if;

  insert into public.reels
    (author_id, vendor_id, video_path, thumb_path, duration_s, width, height, caption, event_slug)
  values
    (caller, p_vendor_id, p_video_path, p_thumb_path, p_duration_s, p_width, p_height,
     nullif(btrim(p_caption), ''), nullif(p_event_slug, ''))
  returning id into new_id;

  if p_vendor_id is not null then
    insert into public.reel_vendor_tags (reel_id, vendor_id, status, decided_at)
    values (new_id, p_vendor_id, 'approved', now());
  end if;
  insert into public.reel_vendor_tags (reel_id, vendor_id)
  select new_id, t.id from unnest(tags) as t (id);
  return new_id;
end;
$$;

-- A vendor's members approve or decline a tag of their business
create function private.decide_reel_tag(p_reel_id uuid, p_vendor_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_vendor_member(p_vendor_id) then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  update public.reel_vendor_tags
  set status = case when p_approve then 'approved' else 'declined' end, decided_at = now()
  where reel_id = p_reel_id and vendor_id = p_vendor_id;
  if not found then
    raise exception 'tag_not_found' using errcode = 'P0002';
  end if;
end;
$$;

-- Comment on a reel: 30 an hour per person; not on reels of people who
-- blocked you (or you them).
create function private.add_reel_comment(p_reel_id uuid, p_body text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  author uuid;
  new_id uuid;
begin
  if caller is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  select r.author_id into author from public.reels r where r.id = p_reel_id and r.status = 'live';
  if author is null or private.blocked_between(caller, author) then
    raise exception 'reel_not_found' using errcode = 'P0002';
  end if;
  if (select count(*) from public.reel_comments
      where user_id = caller and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'comment_limit' using errcode = 'P0001';
  end if;
  insert into public.reel_comments (reel_id, user_id, body)
  values (p_reel_id, caller, btrim(p_body))
  returning id into new_id;
  return new_id;
end;
$$;

-- The reel's poster hides a comment on their reel
create function private.hide_reel_comment(p_comment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.reel_comments c
  set hidden = true
  from public.reels r
  where c.id = p_comment_id and r.id = c.reel_id and r.author_id = (select auth.uid());
  if not found then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
end;
$$;

-- Report a reel, a comment or a person (exactly one). 20 a day per person.
create function private.report_reel_content(
  p_reel_id uuid, p_comment_id uuid, p_user_id uuid, p_reason text, p_note text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  if (select count(*) from public.reel_reports
      where reporter_id = caller and created_at > now() - interval '1 day') >= 20 then
    raise exception 'report_limit' using errcode = 'P0001';
  end if;
  insert into public.reel_reports (reporter_id, reel_id, comment_id, reported_user_id, reason, note)
  values (caller, p_reel_id, p_comment_id, p_user_id, p_reason, nullif(btrim(p_note), ''));
end;
$$;

-- Reading ----------------------------------------------------------------------------------------

-- One page of a feed, newest first before p_before:
--   for_you    every live reel, near you first is left to the app for now
--   following  reels by the people and vendors you follow
--   person     one person's reels (p_user_id)
--   vendor     a vendor's own reels and approved tags (p_vendor_id)
-- With the poster, tagged vendors, like and comment counts and your own
-- like / follow, leaving out people you've blocked or who blocked you.
create function private.reels_feed(
  p_mode text, p_before timestamptz, p_limit integer, p_user_id uuid, p_vendor_id uuid)
returns table (
  id uuid, video_path text, thumb_path text, duration_s numeric, width integer, height integer,
  caption text, event_slug text, created_at timestamptz,
  author_id uuid, author_name text, vendor_id uuid, vendor_slug text, vendor_name text,
  tags jsonb, like_count bigint, comment_count bigint, liked boolean, following boolean, is_mine boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select
    r.id, r.video_path, r.thumb_path, r.duration_s, r.width, r.height, r.caption, r.event_slug,
    r.created_at, r.author_id,
    private.short_name(p.full_name),
    r.vendor_id, v.slug, v.name,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'vendor_id', tv.id, 'slug', tv.slug, 'name', tv.name, 'status', t.status)
        order by t.created_at)
      from public.reel_vendor_tags t
      join public.vendors tv on tv.id = t.vendor_id and tv.status = 'published'
      where t.reel_id = r.id and t.status <> 'declined'
        and t.vendor_id is distinct from r.vendor_id
    ), '[]'::jsonb),
    (select count(*) from public.reel_likes l where l.reel_id = r.id),
    (select count(*) from public.reel_comments c
     where c.reel_id = r.id and not c.hidden
       and not private.blocked_between((select auth.uid()), c.user_id)),
    exists (select 1 from public.reel_likes l where l.reel_id = r.id and l.user_id = (select auth.uid())),
    exists (
      select 1 from public.follows f
      where f.follower_id = (select auth.uid())
        and (case when r.vendor_id is not null then f.vendor_id = r.vendor_id else f.user_id = r.author_id end)
    ),
    r.author_id = (select auth.uid())
  from public.reels r
  left join public.profiles p on p.id = r.author_id
  left join public.vendors v on v.id = r.vendor_id
  where r.status = 'live'
    and r.created_at < coalesce(p_before, 'infinity'::timestamptz)
    and not private.blocked_between((select auth.uid()), r.author_id)
    and (r.vendor_id is null or v.status = 'published')
    and case p_mode
      when 'following' then exists (
        select 1 from public.follows f
        where f.follower_id = (select auth.uid())
          and (f.user_id = r.author_id or (r.vendor_id is not null and f.vendor_id = r.vendor_id)))
      when 'person' then r.author_id = p_user_id and r.vendor_id is null
      when 'vendor' then r.vendor_id = p_vendor_id or exists (
        select 1 from public.reel_vendor_tags t
        where t.reel_id = r.id and t.vendor_id = p_vendor_id and t.status = 'approved')
      else true
    end
  order by r.created_at desc
  limit least(greatest(coalesce(p_limit, 10), 1), 30);
$$;

-- Comments on a reel, oldest first, with "Harjit K." names
create function private.reel_comments_list(p_reel_id uuid)
returns table (id uuid, user_id uuid, name text, body text, created_at timestamptz, is_mine boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.user_id, private.short_name(p.full_name), c.body, c.created_at,
    c.user_id = (select auth.uid())
  from public.reel_comments c
  join public.reels r on r.id = c.reel_id and r.status = 'live'
  left join public.profiles p on p.id = c.user_id
  where c.reel_id = p_reel_id and not c.hidden
    and not private.blocked_between((select auth.uid()), c.user_id)
    and not private.blocked_between((select auth.uid()), r.author_id)
  order by c.created_at
  limit 500;
$$;

-- A person's page: their short name, counts, and whether you follow them
create function private.reel_person(p_user_id uuid)
returns table (name text, reel_count bigint, follower_count bigint, following_count bigint, following boolean, blocked boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.short_name(p.full_name),
    (select count(*) from public.reels r where r.author_id = p_user_id and r.vendor_id is null and r.status = 'live'),
    (select count(*) from public.follows f where f.user_id = p_user_id),
    (select count(*) from public.follows f where f.follower_id = p_user_id),
    exists (select 1 from public.follows f where f.follower_id = (select auth.uid()) and f.user_id = p_user_id),
    exists (select 1 from public.user_blocks b where b.blocker_id = (select auth.uid()) and b.blocked_id = p_user_id)
  from public.profiles p
  where p.id = p_user_id
    and not exists (select 1 from public.user_blocks b where b.blocker_id = p_user_id and b.blocked_id = (select auth.uid()));
$$;

-- Tags of a vendor waiting for its decision, for the vendor's members
create function private.pending_reel_tags(p_vendor_id uuid)
returns table (reel_id uuid, thumb_path text, caption text, author_name text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.thumb_path, r.caption, private.short_name(p.full_name), t.created_at
  from public.reel_vendor_tags t
  join public.reels r on r.id = t.reel_id and r.status = 'live'
  left join public.profiles p on p.id = r.author_id
  where t.vendor_id = p_vendor_id and t.status = 'pending'
    and private.is_vendor_member(p_vendor_id)
  order by t.created_at desc
  limit 100;
$$;

-- Public wrappers (security invoker) ----------------------------------------------------------------

create function public.create_reel(
  p_video_path text, p_thumb_path text, p_duration_s numeric, p_width integer, p_height integer,
  p_caption text, p_event_slug text, p_vendor_ids uuid[], p_vendor_id uuid, p_consent boolean)
returns uuid language sql security invoker set search_path = '' as $$
  select private.create_reel(p_video_path, p_thumb_path, p_duration_s, p_width, p_height,
    p_caption, p_event_slug, p_vendor_ids, p_vendor_id, p_consent);
$$;
create function public.decide_reel_tag(p_reel_id uuid, p_vendor_id uuid, p_approve boolean)
returns void language sql security invoker set search_path = '' as $$
  select private.decide_reel_tag(p_reel_id, p_vendor_id, p_approve);
$$;
create function public.add_reel_comment(p_reel_id uuid, p_body text)
returns uuid language sql security invoker set search_path = '' as $$
  select private.add_reel_comment(p_reel_id, p_body);
$$;
create function public.hide_reel_comment(p_comment_id uuid)
returns void language sql security invoker set search_path = '' as $$
  select private.hide_reel_comment(p_comment_id);
$$;
create function public.report_reel_content(
  p_reel_id uuid default null, p_comment_id uuid default null, p_user_id uuid default null,
  p_reason text default 'other', p_note text default null)
returns void language sql security invoker set search_path = '' as $$
  select private.report_reel_content(p_reel_id, p_comment_id, p_user_id, p_reason, p_note);
$$;
create function public.reels_feed(
  p_mode text default 'for_you', p_before timestamptz default null, p_limit integer default 10,
  p_user_id uuid default null, p_vendor_id uuid default null)
returns table (
  id uuid, video_path text, thumb_path text, duration_s numeric, width integer, height integer,
  caption text, event_slug text, created_at timestamptz,
  author_id uuid, author_name text, vendor_id uuid, vendor_slug text, vendor_name text,
  tags jsonb, like_count bigint, comment_count bigint, liked boolean, following boolean, is_mine boolean)
language sql stable security invoker set search_path = '' as $$
  select * from private.reels_feed(p_mode, p_before, p_limit, p_user_id, p_vendor_id);
$$;
create function public.reel_comments_list(p_reel_id uuid)
returns table (id uuid, user_id uuid, name text, body text, created_at timestamptz, is_mine boolean)
language sql stable security invoker set search_path = '' as $$
  select * from private.reel_comments_list(p_reel_id);
$$;
create function public.reel_person(p_user_id uuid)
returns table (name text, reel_count bigint, follower_count bigint, following_count bigint, following boolean, blocked boolean)
language sql stable security invoker set search_path = '' as $$
  select * from private.reel_person(p_user_id);
$$;
create function public.pending_reel_tags(p_vendor_id uuid)
returns table (reel_id uuid, thumb_path text, caption text, author_name text, created_at timestamptz)
language sql stable security invoker set search_path = '' as $$
  select * from private.pending_reel_tags(p_vendor_id);
$$;

comment on function public.create_reel is
  'Post a reel after uploading its files to <your id>/ in the reels bucket. Errors: not_signed_in, consent_required, not_your_file, video_not_uploaded, not_allowed, reel_limit, too_many_tags, vendor_not_found.';
comment on function public.reels_feed is
  'A page of reels: for_you, following, person (p_user_id) or vendor (p_vendor_id), newest first before p_before.';

revoke all on function
  private.blocked_between, private.create_reel, private.decide_reel_tag, private.add_reel_comment,
  private.hide_reel_comment, private.report_reel_content, private.reels_feed,
  private.reel_comments_list, private.reel_person, private.pending_reel_tags,
  public.create_reel, public.decide_reel_tag, public.add_reel_comment, public.hide_reel_comment,
  public.report_reel_content, public.reels_feed, public.reel_comments_list, public.reel_person,
  public.pending_reel_tags
  from public;
grant execute on function
  private.blocked_between, private.reels_feed, private.reel_comments_list, private.reel_person,
  public.reels_feed, public.reel_comments_list, public.reel_person
  to anon, authenticated;
grant execute on function
  private.create_reel, private.decide_reel_tag, private.add_reel_comment, private.hide_reel_comment,
  private.report_reel_content, private.pending_reel_tags,
  public.create_reel, public.decide_reel_tag, public.add_reel_comment, public.hide_reel_comment,
  public.report_reel_content, public.pending_reel_tags
  to authenticated;

-- Video files ----------------------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reels', 'reels', true, 50 * 1024 * 1024,
  array['video/mp4', 'video/quicktime', 'image/jpeg', 'image/webp', 'image/png'])
on conflict (id) do nothing;

-- <your id>/<file>: you upload and delete only in your own folder; anyone can watch
create policy "People upload reels to their own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'reels' and split_part(name, '/', 1) = (select auth.uid())::text);
create policy "People delete their own reel files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'reels' and split_part(name, '/', 1) = (select auth.uid())::text);
