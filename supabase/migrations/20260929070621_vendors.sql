-- Vendors: public listings, plus a private table the API can never read
-- (docs/PRODUCT_VISION.md sections 6 to 8).
--
-- vendors            What the app shows. Readable by everyone once published.
-- vendor_private     Email, exact street address and coordinates, owner notes.
--                    RLS on, zero policies and no grants for the API roles, so
--                    the API returns nothing even if a policy is added later by
--                    mistake. Server code (the inquiry Edge Function, the seed
--                    script) reads it with the service role.
-- vendor_categories  Which categories a vendor is listed under: up to 3,
--                    position 1 is the primary category.
-- vendor_events      Which events a vendor serves.
--
-- Home-based vendors (most dhol players, mehndi artists, makeup artists) must
-- be unlocatable: their public location is their city's centre point (a
-- centroid can't be triangulated; jittered coordinates can), and address_line
-- stays empty. The exact address lives only in vendor_private.
--
-- Nobody writes through the API yet: founders add and edit vendors in
-- Supabase Studio and with the seed script. Vendor accounts come in Phase 8.

create extension if not exists postgis with schema extensions;

-- Vendors ---------------------------------------------------------------

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'hidden', 'retired')),
  is_sample boolean not null default false,

  -- What the listing says. Vendor-written text has separate English and
  -- Punjabi columns so a Punjabi-only bio is possible.
  name text not null check (length(btrim(name)) between 1 and 80),
  name_pa text check (length(btrim(name_pa)) between 1 and 80),
  tagline text check (length(btrim(tagline)) between 1 and 120),
  tagline_pa text check (length(btrim(tagline_pa)) between 1 and 120),
  bio text check (length(btrim(bio)) between 1 and 2000),
  bio_pa text check (length(btrim(bio_pa)) between 1 and 2000),

  -- Where they are and how far they go
  city text not null check (length(btrim(city)) > 0),
  location extensions.geography(point, 4326) not null,
  address_visibility text not null default 'city_only'
    check (address_visibility in ('public', 'city_only', 'on_request')),
  address_line text check (length(btrim(address_line)) > 0),
  service_radius_miles smallint not null default 25
    check (service_radius_miles in (10, 25, 50, 100, 250)),
  will_travel boolean not null default false,
  travel_note text check (length(btrim(travel_note)) > 0),

  -- How families reach them (email is private: the inquiry form sends it)
  call_phone text check (call_phone ~ '^\+1[2-9][0-9]{9}$'),
  text_phone text check (text_phone ~ '^\+1[2-9][0-9]{9}$'),
  whatsapp_phone text check (whatsapp_phone ~ '^\+[1-9][0-9]{7,14}$'),
  instagram_handle text check (instagram_handle ~ '^[A-Za-z0-9._]{1,30}$'),
  website_url text check (website_url ~ '^https?://[^\s]+$'),
  preferred_contact text
    check (preferred_contact in ('call', 'text', 'whatsapp', 'email', 'instagram')),
  office_hours text check (length(btrim(office_hours)) > 0),
  languages text[] not null default '{en}'
    check (cardinality(languages) > 0 and languages <@ array['en', 'pa', 'hi', 'ur']::text[]),

  -- Pricing, in whole US dollars
  price_display text not null default 'contact'
    check (price_display in ('hidden', 'starting_at', 'range', 'packages', 'contact')),
  price_from integer check (price_from > 0),
  price_to integer check (price_to > 0),
  price_unit text
    check (price_unit in ('event', 'hour', 'person', 'plate', 'hand', 'turban', 'day')),
  price_note text check (length(btrim(price_note)) > 0),

  -- Trust and provenance
  years_in_business smallint check (years_in_business >= 0),
  team_size smallint check (team_size > 0),
  founding_number smallint unique check (founding_number > 0),
  source text not null default 'founder'
    check (source in ('founder', 'claimed', 'self_signup')),
  last_verified_at timestamptz,

  -- Category-specific facts (seats, outside catering, BYO alcohol...),
  -- validated per category in the app (vision section 6)
  details jsonb not null default '{}' check (jsonb_typeof(details) = 'object'),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint vendors_street_address_only_when_public
    check (address_visibility = 'public' or address_line is null),
  -- coalesce: a NULL comparison would slip through a CHECK
  constraint vendors_price_matches_display check (coalesce(
    case price_display
      when 'starting_at' then price_from is not null and price_unit is not null
      when 'range' then price_from is not null and price_to is not null
        and price_to >= price_from and price_unit is not null
      else true
    end,
    false
  ))
);

comment on table public.vendors is
  'Vendor listings. Everyone can read published ones; founders write them. Slugs are deep-link ids: /v/{slug}.';
comment on column public.vendors.location is
  'Public map point. For home-based vendors this is their city''s centre point, never their house.';
comment on column public.vendors.address_line is
  'Public street address; only allowed when address_visibility is public (halls, shops, gurdwaras).';
comment on column public.vendors.service_radius_miles is
  'How far they travel: 10, 25, 50 or 100 miles, or 250 for all of Northern California.';
comment on column public.vendors.will_travel is
  'Travels beyond the radius, usually for a fee (see travel_note).';
comment on column public.vendors.founding_number is
  'Their number on the Founding 50 wall, if they are a founding vendor.';
comment on column public.vendors.is_sample is
  'Sample data for testing; bulk-hidden before real vendors launch.';

create index vendors_location_idx on public.vendors using gist (location);

-- Private details: never readable through the API --------------------------

create table public.vendor_private (
  vendor_id uuid primary key references public.vendors (id) on delete cascade,
  email text check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  checks_email boolean,
  street_address text check (length(btrim(street_address)) > 0),
  exact_location extensions.geography(point, 4326),
  owner_name text check (length(btrim(owner_name)) > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.vendor_private is
  'Email, exact address and owner notes. RLS on with zero policies and no grants to anon or authenticated: only the service role can read it.';
comment on column public.vendor_private.checks_email is
  'Whether they actually read email. If not, inquiries go by text or through the founders.';

-- Links -------------------------------------------------------------------

create table public.vendor_categories (
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  category_slug text not null references public.categories (slug) on update cascade,
  position smallint not null check (position between 1 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (vendor_id, category_slug),
  constraint vendor_categories_position_key unique (vendor_id, position)
);

comment on table public.vendor_categories is
  'Categories a vendor is listed under: up to 3; position 1 is the primary one shown on cards.';

create index vendor_categories_category_slug_idx on public.vendor_categories (category_slug);

create table public.vendor_events (
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  event_slug text not null references public.events (slug) on update cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (vendor_id, event_slug)
);

comment on table public.vendor_events is
  'Events a vendor serves (a dhol player: jaago, baraat, reception...).';

create index vendor_events_event_slug_idx on public.vendor_events (event_slug);

-- Keep updated_at current --------------------------------------------------

create trigger set_updated_at before update on public.vendors
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.vendor_private
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.vendor_categories
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.vendor_events
  for each row execute function private.set_updated_at();

-- Access ------------------------------------------------------------------

alter table public.vendors enable row level security;
alter table public.vendor_private enable row level security;
alter table public.vendor_categories enable row level security;
alter table public.vendor_events enable row level security;

create policy "Published vendors are readable by everyone" on public.vendors
  for select to anon, authenticated
  using (status = 'published');

create policy "Categories of published vendors are readable by everyone" on public.vendor_categories
  for select to anon, authenticated
  using (exists (
    select 1 from public.vendors v
    where v.id = vendor_categories.vendor_id and v.status = 'published'
  ));

create policy "Events of published vendors are readable by everyone" on public.vendor_events
  for select to anon, authenticated
  using (exists (
    select 1 from public.vendors v
    where v.id = vendor_events.vendor_id and v.status = 'published'
  ));

-- vendor_private: RLS on and deliberately no policies.

revoke all on public.vendors, public.vendor_private, public.vendor_categories,
  public.vendor_events
  from anon, authenticated;
grant select on public.vendors, public.vendor_categories, public.vendor_events
  to anon, authenticated;
