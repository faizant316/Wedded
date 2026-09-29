-- Reference data: the spine of the app (docs/PRODUCT_VISION.md section 3).
--
-- Cultures, events and vendor categories are rows, never code, so a new
-- culture, event or category is data, not an app release (CLAUDE.md).
-- Events are shared across cultures (a DJ who plays jaagos serves every
-- Punjabi family); culture_events says which events a culture has and in
-- what order, so a Punjabi Hindu or Muslim set is a list of rows.
--
-- Every name is LocalizedText, {"en": "...", "pa": "..."}: English is
-- required, Punjabi is optional until someone has written it. The app reads
-- it with localized() in src/i18n/localized.ts.
--
-- Everyone (signed in or not) can read these tables; nobody can change them
-- through the API. Founders edit them in Supabase Studio or via migrations.

create schema if not exists private;

comment on schema private is
  'Helpers that must not be exposed through the Data API.';

-- Helpers ---------------------------------------------------------------

create function private.is_localized_text(value jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  -- coalesce: a missing key makes the comparisons NULL, and a CHECK
  -- constraint lets NULL through, so NULL must count as false.
  select coalesce(
    case
      when jsonb_typeof(value) is distinct from 'object' then false
      else
        jsonb_typeof(value -> 'en') = 'string'
        and length(btrim(value ->> 'en')) > 0
        and (not value ? 'pa'
          or (jsonb_typeof(value -> 'pa') = 'string' and length(btrim(value ->> 'pa')) > 0))
        and not exists (
          select 1
          from jsonb_object_keys(value) as k (key)
          where k.key not in ('en', 'pa')
        )
    end,
    false
  );
$$;

comment on function private.is_localized_text(jsonb) is
  'True for {"en": text, "pa"?: text} with a non-blank English value and no other keys.';

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Cultures --------------------------------------------------------------

create table public.cultures (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name jsonb not null check (private.is_localized_text(name)),
  script text not null check (script in ('gurmukhi', 'shahmukhi', 'devanagari', 'latin')),
  shows_auspicious_dates boolean not null default false,
  is_default boolean not null default false,
  sort_order smallint not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cultures is
  'Wedding traditions the app supports. Punjabi Sikh is the launch default.';
comment on column public.cultures.script is
  'Script for this culture''s own-language names (Punjabi Muslim families may use Shahmukhi).';
comment on column public.cultures.shows_auspicious_dates is
  'Sikh weddings have no astrology: never show "auspicious date" content when false.';

create unique index cultures_single_default on public.cultures (is_default) where is_default;

-- Events ----------------------------------------------------------------

create table public.events (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name jsonb not null check (private.is_localized_text(name)),
  aliases text[] not null default '{}',
  host_side text not null check (host_side in ('bride', 'groom', 'each', 'joint')),
  timing jsonb check (timing is null or private.is_localized_text(timing)),
  typical_guests_min smallint check (typical_guests_min > 0),
  typical_guests_max smallint,
  summary jsonb check (summary is null or private.is_localized_text(summary)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_typical_guests_check check (
    (typical_guests_min is null and typical_guests_max is null)
    or (typical_guests_min is not null and typical_guests_max >= typical_guests_min)
  )
);

comment on table public.events is
  'Wedding events (roka to reception), shared across cultures. Slugs are used in deep links: /e/{slug}.';
comment on column public.events.aliases is
  'Other spellings and names people search for, in English and Gurmukhi.';
comment on column public.events.host_side is
  'bride or groom: that family hosts. each: both families hold their own. joint: both families together.';
comment on column public.events.timing is
  'When it usually happens, e.g. "The night before the wedding".';
comment on column public.events.summary is
  'Founder-written two-line explainer for the event page. Empty until written.';

create table public.culture_events (
  culture_slug text not null references public.cultures (slug) on update cascade on delete cascade,
  event_slug text not null references public.events (slug) on update cascade on delete cascade,
  phase text not null check (phase in ('before', 'wedding_day', 'after', 'whole_wedding')),
  sort_order smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (culture_slug, event_slug),
  constraint culture_events_order_key unique (culture_slug, sort_order) deferrable initially deferred
);

comment on table public.culture_events is
  'Which events each culture has, in order. Home groups them by phase: before, wedding day, after, then the Whole wedding card.';

create index culture_events_event_slug_idx on public.culture_events (event_slug);

-- Vendor categories -----------------------------------------------------

create table public.category_groups (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name jsonb not null check (private.is_localized_text(name)),
  sort_order smallint not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.category_groups is
  'Headings for the vendor category list: Venues, Food, Music and performance, and so on.';

create table public.categories (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  group_slug text not null references public.category_groups (slug) on update cascade,
  sort_order smallint not null,
  name jsonb not null check (private.is_localized_text(name)),
  aliases text[] not null default '{}',
  is_religious boolean not null default false,
  serves_alcohol boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_group_order_key unique (group_slug, sort_order) deferrable initially deferred
);

comment on table public.categories is
  'Types of vendor (dhol player, banquet hall, mehndi artist...). Slugs are used in deep links: /c/{slug}.';
comment on column public.categories.aliases is
  'Search synonyms so parents'' words work: dhol, dholi, dhol wala, ਢੋਲ.';
comment on column public.categories.is_religious is
  'Religious services: the app says "request seva" and "donation guidance", never "price".';
comment on column public.categories.serves_alcohol is
  'Shown only under jaago and reception; never on or near gurdwara, paath or maiyan pages.';

create table public.event_categories (
  event_slug text not null references public.events (slug) on update cascade on delete cascade,
  category_slug text not null references public.categories (slug) on update cascade on delete cascade,
  importance text not null check (importance in ('essential', 'nice_to_have')),
  sort_order smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_slug, category_slug),
  constraint event_categories_order_key unique (event_slug, sort_order) deferrable initially deferred
);

comment on table public.event_categories is
  'The "Vendors you''ll need" list on each event page: essential first, then nice to have.';

create index event_categories_category_slug_idx on public.event_categories (category_slug);

-- Keep updated_at current (the app uses it to refresh its cached copy) ---

create trigger set_updated_at before update on public.cultures
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.events
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.culture_events
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.category_groups
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.categories
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.event_categories
  for each row execute function private.set_updated_at();

-- Access: readable by everyone, changeable by no one through the API -----

alter table public.cultures enable row level security;
alter table public.events enable row level security;
alter table public.culture_events enable row level security;
alter table public.category_groups enable row level security;
alter table public.categories enable row level security;
alter table public.event_categories enable row level security;

create policy "Reference data is readable by everyone" on public.cultures
  for select to anon, authenticated using (true);
create policy "Reference data is readable by everyone" on public.events
  for select to anon, authenticated using (true);
create policy "Reference data is readable by everyone" on public.culture_events
  for select to anon, authenticated using (true);
create policy "Reference data is readable by everyone" on public.category_groups
  for select to anon, authenticated using (true);
create policy "Reference data is readable by everyone" on public.categories
  for select to anon, authenticated using (true);
create policy "Reference data is readable by everyone" on public.event_categories
  for select to anon, authenticated using (true);

-- Belt and braces: even if a write policy is added by mistake later, the
-- API roles have no write privileges on reference tables.
revoke all on public.cultures, public.events, public.culture_events,
  public.category_groups, public.categories, public.event_categories
  from anon, authenticated;
grant select on public.cultures, public.events, public.culture_events,
  public.category_groups, public.categories, public.event_categories
  to anon, authenticated;
