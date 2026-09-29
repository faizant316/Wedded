-- Typo-tolerant text search in search_vendors (vision §8 Search: parents type
-- "dhool", "mendhi", "photgrapher" on small keyboards).
--
-- A query first matches as before: vendor name, Punjabi name, tagline, or a
-- category name or alias containing the text. Only when nothing matches that
-- way does it fall back to close spellings: every typed word must start a
-- word of the vendor's name or category names and aliases, or be within a
-- few letters of one (1 edit for 4 to 5 letters, 2 for 6 or more; shorter
-- words must match exactly). So correct spellings never get noisier results,
-- and a typo still finds something.
--
-- Also: % and _ in the query are now matched literally (a lone "%" used to
-- match every vendor).
--
-- Same arguments, return columns and permissions; only the body changes.

create extension if not exists fuzzystrmatch with schema extensions;

-- Lowercased words of a text, split on spaces and punctuation (not on
-- Gurmukhi vowel signs, which a [[:alnum:]] split would break words on).
create function private.search_words(input text)
returns text[]
language sql
immutable
parallel safe
set search_path = ''
as $$
  select coalesce(array_agg(word), '{}')
  from regexp_split_to_table(lower(coalesce(input, '')), '[\s/,+()&.''-]+') as word
  where word <> '';
$$;

comment on function private.search_words is
  'Lowercased words of a text for search, split on spaces and punctuation.';

-- True when every query word starts one of the words, or is a close
-- misspelling of one.
create function private.words_match_loosely(query_words text[], words text[])
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select cardinality(query_words) > 0 and not exists (
    select 1
    from unnest(query_words) as q
    where not exists (
      select 1
      from unnest(words) as w
      where starts_with(w, q)
        or (char_length(q) >= 4
          and extensions.levenshtein_less_equal(q, w, case when char_length(q) >= 6 then 2 else 1 end)
            <= case when char_length(q) >= 6 then 2 else 1 end)
    )
  );
$$;

comment on function private.words_match_loosely is
  'Typo fallback for search: each query word starts a word or is within 1 edit (4-5 letters) or 2 (6+) of one.';

-- search_vendors runs as the caller, so the API roles need these two. The
-- private schema is not exposed by the API, so this doesn't make them callable
-- as endpoints.
revoke all on function private.search_words, private.words_match_loosely from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.search_words, private.words_match_loosely to anon, authenticated;

create or replace function public.search_vendors(
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
  order by m.miles nulls last, m.founding_number nulls last, (cover.storage_path is null), m.name
  limit least(greatest(search_vendors.result_limit, 1), 100)
  offset greatest(search_vendors.result_offset, 0);
$$;

comment on function public.search_vendors is
  'Published vendors near a point (or anywhere when no point), filtered by category, event and text, sorted by distance. Includes vendors whose service radius covers the searcher. Text falls back to close spellings when nothing matches exactly.';

revoke all on function public.search_vendors from public;
grant execute on function public.search_vendors to anon, authenticated;
