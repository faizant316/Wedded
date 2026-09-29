-- search_vendors now also returns cover_path, the vendor's cover photo folder
-- in the vendor-media bucket (or its first photo), so result cards can show
-- it. At equal distance, vendors with photos come before those without
-- (vision §8: "then has-photos"). The return type changed, so the function is
-- dropped and recreated with the same arguments and permissions.

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
  result_offset integer default 0
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
    select nullif(btrim(search_vendors.query), '') as text
  ),
  matches as (
    select
      v.*,
      extensions.st_distance(v.location, o.point) / 1609.344 as miles
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
      and (n.text is null
        or v.name ilike '%' || n.text || '%'
        or v.name_pa ilike '%' || n.text || '%'
        or v.tagline ilike '%' || n.text || '%'
        or exists (
          select 1
          from public.vendor_categories vc
          join public.categories c on c.slug = vc.category_slug
          where vc.vendor_id = v.id
            and (c.name ->> 'en' ilike '%' || n.text || '%'
              or c.name ->> 'pa' ilike '%' || n.text || '%'
              or exists (select 1 from unnest(c.aliases) as a (alias) where a.alias ilike '%' || n.text || '%'))
        ))
      and (o.point is null
        or search_vendors.max_miles is null
        or extensions.st_dwithin(
          v.location, o.point, greatest(search_vendors.max_miles, v.service_radius_miles) * 1609.344
        )
        or (search_vendors.include_travelers and v.will_travel))
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
  order by m.miles nulls last, m.founding_number nulls last, (cover.storage_path is null), m.name
  limit least(greatest(search_vendors.result_limit, 1), 100)
  offset greatest(search_vendors.result_offset, 0);
$$;

comment on function public.search_vendors is
  'Published vendors near a point (or anywhere when no point), filtered by category, event and text, sorted by distance. Includes vendors whose service radius covers the searcher.';

revoke all on function public.search_vendors from public;
grant execute on function public.search_vendors to anon, authenticated;
