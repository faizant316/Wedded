-- Where a family is from and their faith, for the questions a new family
-- answers when they first open the app (docs/DECISIONS.md, 2026-09-30).
--
-- Each tradition in `cultures` names the background and faith it belongs to
-- (Pakistani + Muslim is the pakistani tradition; Muslim with no background is
-- the general muslim one), so the app turns the answers into traditions and
-- their events without hardcoding any of them. Options without a tradition
-- yet (Afghan, Christian...) are still offered: the app falls back to the
-- closest tradition or the default one.
--
-- The answers themselves are never stored: only the traditions they lead to,
-- in the family's plan. Faith and ethnic origin are sensitive personal
-- information (CPRA), and we don't need them once the events are chosen.

create table public.backgrounds (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name jsonb not null check (private.is_localized_text(name)),
  sort_order smallint not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.backgrounds is
  'Where a family is from (Punjabi, Pakistani, Arab...), the first question for a new family.';

create table public.faiths (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name jsonb not null check (private.is_localized_text(name)),
  sort_order smallint not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.faiths is
  'Faiths a family can pick (Sikh, Hindu, Muslim...), the second question for a new family.';

alter table public.cultures
  add column background_slug text references public.backgrounds (slug) on update cascade,
  add column faith_slug text references public.faiths (slug) on update cascade;

comment on column public.cultures.background_slug is
  'The background this tradition belongs to; null for a faith-wide one (Muslim).';
comment on column public.cultures.faith_slug is
  'The faith this tradition belongs to; null when it is about a background alone.';

create index cultures_background_slug_idx on public.cultures (background_slug);
create index cultures_faith_slug_idx on public.cultures (faith_slug);

create trigger set_updated_at before update on public.backgrounds
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.faiths
  for each row execute function private.set_updated_at();

-- Readable by everyone, changeable by no one through the API (like the other
-- reference tables).

alter table public.backgrounds enable row level security;
alter table public.faiths enable row level security;

create policy "Reference data is readable by everyone" on public.backgrounds
  for select to anon, authenticated using (true);
create policy "Reference data is readable by everyone" on public.faiths
  for select to anon, authenticated using (true);

revoke all on public.backgrounds, public.faiths from anon, authenticated;
grant select on public.backgrounds, public.faiths to anon, authenticated;

-- Rows (Gurmukhi only where the vision verified it) --------------------------

insert into public.backgrounds (slug, name, sort_order) values
  ('punjabi', '{"en": "Punjabi", "pa": "ਪੰਜਾਬੀ"}', 1),
  ('pakistani', '{"en": "Pakistani"}', 2),
  ('indian', '{"en": "Indian"}', 3),
  ('arab', '{"en": "Arab"}', 4),
  ('afghan', '{"en": "Afghan"}', 5),
  ('bangladeshi', '{"en": "Bangladeshi"}', 6);

insert into public.faiths (slug, name, sort_order) values
  ('sikh', '{"en": "Sikh", "pa": "ਸਿੱਖ"}', 1),
  ('hindu', '{"en": "Hindu"}', 2),
  ('muslim', '{"en": "Muslim"}', 3),
  ('christian', '{"en": "Christian"}', 4);

update public.cultures c
set background_slug = m.background_slug, faith_slug = m.faith_slug
from (values
  ('punjabi-sikh', 'punjabi', 'sikh'),
  ('punjabi-hindu', 'punjabi', 'hindu'),
  ('pakistani', 'pakistani', 'muslim'),
  ('muslim', null, 'muslim'),
  ('arab', 'arab', 'muslim')
) as m (culture_slug, background_slug, faith_slug)
where c.slug = m.culture_slug;
