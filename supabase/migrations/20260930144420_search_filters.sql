-- Search filters (docs/RESEARCH_GROWTH.md #4): families only contact vendors
-- that fit, so vendors get better inquiries.
--
-- search_vendors gets four optional arguments at the end; the existing
-- arguments and the return columns are unchanged:
--   min_guests  venues that seat at least this many (details.seated_capacity);
--               vendors without a capacity (a DJ, a caterer) aren't filtered
--   max_price   a shown starting price at or under this; vendors who don't
--               show a price stay in
--   language    vendors who speak it: en, pa, hi or ur
--   sort        'distance' (default), 'price_low' (shown prices first, cheapest
--               first) or 'founding' (founding vendors first)
--
-- The signature changes, so the function is dropped and recreated with the
-- same permissions.

drop function public.search_vendors(double precision, double precision, integer, text, text, text, boolean, integer, integer);

create function public.search_vendors(
  lat double precision default null,
  lng double precision default null,
  max_miles integer default 25,
  category_slug text default null,
  event_slug text default null,
  query text default null,
  include_travelers boolean default false,
  result_limit integer default 50,
  result_offset integer default 0,
  min_guests integer default null,
  max_price integer default null,
  language text default null,
  sort text default 'distance'
)
returns table (
  id uuid,
  slug text,
  name text,
  name_pa text,
  city text,
  primary_category_slug text,
  primary_category_name jsonb,
  price_display text,
  price_from integer,
  price_to integer,
  price_unit text,
  founding_number smallint,
  distance_miles double precision,
  within_search_radius boolean,
  latitude double precision,
  longitude double precision,
  cover_path text
)
language sql
stable
security invoker
set search_path = ''
as $$
  with origin as (
    select case
      when search_vendors.lat is null or search_vendors.lng is null then null
      else extensions.st_setsrid(
        extensions.st_makepoint(search_vendors.lng, search_vendors.lat), 4326
      )::extensions.geography
    end as point
  ),
  needle as (
    select
      t.text,
      -- For ILIKE: the text with \, % and _ escaped, so they match literally
      '%' || replace(replace(replace(t.text, '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern,
      private.search_words(t.text) as words
    from (select nullif(btrim(search_vendors.query), '') as text) t
  ),
  candidates as (
    select
      v.*,
      extensions.st_distance(v.location, o.point) / 1609.344 as miles,
      n.text is not null and (
        v.name ilike n.pattern
        or v.name_pa ilike n.pattern
        or v.tagline ilike n.pattern
        or exists (
          select 1
          from public.vendor_categories vc
          join public.categories c on c.slug = vc.category_slug
          where vc.vendor_id = v.id
            and (c.name ->> 'en' ilike n.pattern
              or c.name ->> 'pa' ilike n.pattern
              or exists (select 1 from unnest(c.aliases) as a (alias) where a.alias ilike n.pattern))
        )
      ) as exact_match,
      n.text is not null and private.words_match_loosely(
        n.words,
        private.search_words(v.name) || private.search_words(v.name_pa) || coalesce((
          select array_agg(word)
          from public.vendor_categories vc
          join public.categories c on c.slug = vc.category_slug
          cross join lateral unnest(
            private.search_words(c.name ->> 'en')
              || private.search_words(c.name ->> 'pa')
              || private.search_words(array_to_string(c.aliases, ' '))
          ) as word
          where vc.vendor_id = v.id
        ), '{}')
      ) as loose_match
    from public.vendors v
    cross join origin o
    cross join needle n
    where v.status = 'published'
      and (search_vendors.category_slug is null or exists (
        select 1 from public.vendor_categories vc
        where vc.vendor_id = v.id and vc.category_slug = search_vendors.category_slug
      ))
      and (search_vendors.event_slug is null or exists (
        select 1 from public.vendor_events ve
        where ve.vendor_id = v.id and ve.event_slug = search_vendors.event_slug
      ))
      -- Venues that seat at least this many (vendors without a capacity, like
      -- a DJ, aren't filtered out)
      and (search_vendors.min_guests is null
        or jsonb_typeof(v.details -> 'seated_capacity') is distinct from 'number'
        or (v.details ->> 'seated_capacity')::numeric >= search_vendors.min_guests)
      -- A shown starting price at or under this (vendors who don't show a
      -- price stay in: "Contact for price")
      and (search_vendors.max_price is null
        or v.price_display not in ('starting_at', 'range')
        or v.price_from is null
        or v.price_from <= search_vendors.max_price)
      and (search_vendors.language is null or search_vendors.language = any (v.languages))
      and (o.point is null
        or search_vendors.max_miles is null
        or extensions.st_dwithin(
          v.location, o.point, greatest(search_vendors.max_miles, v.service_radius_miles) * 1609.344
        )
        or (search_vendors.include_travelers and v.will_travel))
  ),
  matches as (
    select c.*
    from candidates c
    cross join needle n
    where n.text is null
      or c.exact_match
      -- Close spellings only when nothing matched exactly
      or (c.loose_match and not exists (select 1 from candidates e where e.exact_match))
  )
  select
    m.id,
    m.slug,
    m.name,
    m.name_pa,
    m.city,
    pc.category_slug,
    c.name,
    m.price_display,
    m.price_from,
    m.price_to,
    m.price_unit,
    m.founding_number,
    m.miles,
    case when m.miles is null or search_vendors.max_miles is null then null
      else m.miles <= search_vendors.max_miles end,
    extensions.st_y(m.location::extensions.geometry),
    extensions.st_x(m.location::extensions.geometry),
    cover.storage_path
  from matches m
  left join lateral (
    select vc.category_slug
    from public.vendor_categories vc
    where vc.vendor_id = m.id
    order by vc.position
    limit 1
  ) pc on true
  left join public.categories c on c.slug = pc.category_slug
  left join lateral (
    select vm.storage_path
    from public.vendor_media vm
    where vm.vendor_id = m.id
    order by vm.is_cover desc, vm.sort_order, vm.created_at
    limit 1
  ) cover on true
  order by
    case when search_vendors.sort = 'price_low' and m.price_display in ('starting_at', 'range')
      then m.price_from end nulls last,
    case when search_vendors.sort = 'founding' then m.founding_number end nulls last,
    m.miles nulls last, m.founding_number nulls last, (cover.storage_path is null), m.name
  limit least(greatest(search_vendors.result_limit, 1), 100)
  offset greatest(search_vendors.result_offset, 0);
$$;

comment on function public.search_vendors is
  'Published vendors near a point (or anywhere when no point), filtered by category, event, text, guest capacity, price ceiling and language, sorted by distance (or price or founding number). Includes vendors whose service radius covers the searcher. Text falls back to close spellings when nothing matches exactly.';

revoke all on function public.search_vendors from public;
grant execute on function public.search_vendors to anon, authenticated, service_role;
