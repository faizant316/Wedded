-- Places for location search (vision §8 "Geocoding", S22a location sheet).
--
-- No external geocoding API: these tables are the whole map. People pick an
-- area-code chip, type a city or a ZIP, or use their phone's location. Each
-- becomes a point, and search_vendors measures distance from it.
--
-- cities      NorCal cities with nicknames people type ("SJ", "Sac", "Yuba").
--             Also the source of truth for city centre points: a home-based
--             vendor's public location is their city's point.
-- area_codes  The chips (510 · East Bay, 530 · Yuba City...): area codes are
--             how the community describes geography. Each is a city's point
--             plus a radius.
-- zip_codes   California ZIP code centre points.
--
-- Points are stored as latitude/longitude (readable, and what the app needs);
-- location is generated from them for PostGIS. Everyone can read these
-- tables; nobody can change them through the API.

create table public.cities (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) > 0),
  area_code text not null check (area_code ~ '^[2-9][0-9]{2}$'),
  aliases text[] not null default '{}',
  latitude double precision not null check (latitude between 32 and 42.1),
  longitude double precision not null check (longitude between -124.5 and -114),
  location extensions.geography(point, 4326) generated always as (
    extensions.st_setsrid(extensions.st_makepoint(longitude, latitude), 4326)::extensions.geography
  ) stored,
  census_geoid text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cities is
  'NorCal cities for the location sheet and typeahead. Points are US Census 2024 Gazetteer internal points.';
comment on column public.cities.aliases is
  'Nicknames people type: sj, sac, yuba.';

create table public.area_codes (
  code text primary key check (code ~ '^[2-9][0-9]{2}$'),
  label jsonb not null check (private.is_localized_text(label)),
  center_city_slug text not null references public.cities (slug) on update cascade,
  radius_miles smallint not null default 40 check (radius_miles > 0),
  sort_order smallint not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.area_codes is
  'Area-code chips in the location sheet: 510 · East Bay, 530 · Yuba City... Each searches around a city within radius_miles.';

create index area_codes_center_city_slug_idx on public.area_codes (center_city_slug);

create table public.zip_codes (
  zip text primary key check (zip ~ '^[0-9]{5}$'),
  latitude double precision not null check (latitude between 32 and 42.1),
  longitude double precision not null check (longitude between -124.5 and -114),
  location extensions.geography(point, 4326) generated always as (
    extensions.st_setsrid(extensions.st_makepoint(longitude, latitude), 4326)::extensions.geography
  ) stored
);

comment on table public.zip_codes is
  'California ZIP code centre points (US Census 2024 ZCTA Gazetteer). A ZIP not here is outside California.';

create index cities_location_idx on public.cities using gist (location);
create index zip_codes_location_idx on public.zip_codes using gist (location);

create trigger set_updated_at before update on public.cities
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.area_codes
  for each row execute function private.set_updated_at();

alter table public.cities enable row level security;
alter table public.area_codes enable row level security;
alter table public.zip_codes enable row level security;

create policy "Places are readable by everyone" on public.cities
  for select to anon, authenticated using (true);
create policy "Places are readable by everyone" on public.area_codes
  for select to anon, authenticated using (true);
create policy "Places are readable by everyone" on public.zip_codes
  for select to anon, authenticated using (true);

revoke all on public.cities, public.area_codes, public.zip_codes from anon, authenticated;
grant select on public.cities, public.area_codes, public.zip_codes to anon, authenticated;
