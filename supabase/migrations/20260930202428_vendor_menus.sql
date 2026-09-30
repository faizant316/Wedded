-- Vendor menus (feedback from the Town and Country owners, Sacramento: vendors
-- want families to see their menus while they talk and book; vision §6
-- caterers: cuisines, dietary, per-plate prices).
--
-- A vendor (usually a hall or caterer) can have several menus ("Silver",
-- "Gold", "Vegetarian thali"), each with a price per person or plate, a
-- minimum guest count, a cuisine, diet tags, and sections of dishes. Menus
-- are public for published vendors. Founders load them with the vendor import
-- for now; vendors will edit their own once vendor accounts arrive.

-- Shape check for sections: [{ "title", "title_pa"?, "items": [{ "name",
-- "name_pa"?, "description"?, "diet"? }] }], at most 20 sections of 60 items.
create function private.is_menu_sections(value jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    jsonb_typeof(value) = 'array'
    and jsonb_array_length(value) <= 20
    and not exists (
      select 1
      from jsonb_array_elements(value) as s
      where jsonb_typeof(s) is distinct from 'object'
        or jsonb_typeof(s -> 'title') is distinct from 'string'
        or length(btrim(s ->> 'title')) not between 1 and 60
        or jsonb_typeof(s -> 'items') is distinct from 'array'
        or jsonb_array_length(s -> 'items') > 60
        or exists (
          select 1
          from jsonb_array_elements(s -> 'items') as i
          where jsonb_typeof(i) is distinct from 'object'
            or jsonb_typeof(i -> 'name') is distinct from 'string'
            or length(btrim(i ->> 'name')) not between 1 and 80
            or (i ? 'description' and (jsonb_typeof(i -> 'description') is distinct from 'string'
                                       or length(i ->> 'description') > 300))
        )
    ),
    false
  );
$$;

comment on function private.is_menu_sections is
  'True when a menu''s sections jsonb has the expected shape: titled sections of named items.';

create table public.vendor_menus (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 80),
  name_pa text check (length(btrim(name_pa)) between 1 and 80),
  description text check (length(btrim(description)) between 1 and 500),
  description_pa text check (length(btrim(description_pa)) between 1 and 500),
  -- In the vendor's words: "Punjabi", "Indo-Chinese", "Mexican"
  cuisine text check (length(btrim(cuisine)) between 1 and 60),
  diet text[] not null default '{}'
    check (diet <@ array['veg', 'non_veg', 'jhatka', 'halal', 'jain', 'eggless', 'vegan', 'gluten_free']::text[]),
  price_from integer check (price_from > 0),
  price_unit text check (price_unit in ('person', 'plate', 'event')),
  min_guests integer check (min_guests > 0),
  sections jsonb not null default '[]' check (private.is_menu_sections(sections)),
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendor_menus_price_has_unit check (price_from is null or price_unit is not null)
);

comment on table public.vendor_menus is
  'Menus a vendor offers (packages, thalis): price per person/plate, minimum guests, cuisine, diet tags and sections of dishes. Public for published vendors.';

create index vendor_menus_vendor_idx on public.vendor_menus (vendor_id, sort_order);

create trigger set_updated_at before update on public.vendor_menus
  for each row execute function private.set_updated_at();

alter table public.vendor_menus enable row level security;

create policy "Menus of published vendors are readable by everyone" on public.vendor_menus
  for select to anon, authenticated
  using (exists (
    select 1 from public.vendors v
    where v.id = vendor_menus.vendor_id and v.status = 'published'
  ));

revoke all on public.vendor_menus from anon, authenticated;
grant select on public.vendor_menus to anon, authenticated;
