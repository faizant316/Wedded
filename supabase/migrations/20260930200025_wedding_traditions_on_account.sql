-- A wedding saved to the account remembers its traditions (Plan together,
-- 20260930081956, and the traditions in 20260930090000), so relatives who
-- join see the same events. The app ignores slugs it doesn't know, so no
-- lookup is needed; owners and planners change them like the date.

alter table public.weddings
  add column traditions text[] not null default '{}' check (cardinality(traditions) <= 10);

comment on column public.weddings.traditions is
  'Culture slugs the family picked in My Wedding (a mixed wedding has several). Empty means the default culture.';

grant update (traditions) on public.weddings to authenticated;
