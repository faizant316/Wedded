-- More wedding traditions (docs/DECISIONS.md, 2026-09-30).
--
-- My Wedding lets a family pick one or more traditions: Punjabi Sikh (the
-- launch default), Punjabi Hindu, Pakistani, Muslim and Arab. Events stay
-- shared across cultures, so a mehndi artist who serves the mehndi serves
-- every family that has one. culture_events now also says what a tradition
-- calls a shared event (Mayun for the maiyan, Henna night for the mehndi,
-- Rukhsati for the doli) and which events are the main ones: My Wedding shows
-- those first and keeps the rest under "More".
--
-- New names are English only until the family has reviewed a translation
-- (Gurmukhi only where the vision verified it); local names reuse Gurmukhi
-- words that are already verified. `npm run i18n:review` lists what's missing.

-- Columns -----------------------------------------------------------------

alter table public.cultures drop constraint cultures_script_check;
alter table public.cultures add constraint cultures_script_check
  check (script in ('gurmukhi', 'shahmukhi', 'devanagari', 'arabic', 'latin'));

alter table public.culture_events
  add column local_name jsonb check (local_name is null or private.is_localized_text(local_name)),
  add column is_core boolean not null default false;

comment on column public.culture_events.local_name is
  'What this tradition calls the event when it differs from events.name: Mayun (maiyan) in a Pakistani wedding, Henna night (mehndi) in an Arab one.';
comment on column public.culture_events.is_core is
  'A main event: My Wedding shows these first and the rest under More.';

-- The Punjabi Sikh main events: the culture, not every ritual -------------

update public.culture_events
set is_core = true
where culture_slug = 'punjabi-sikh'
  and event_slug in (
    'roka', 'chunni-kurmai', 'sangeet', 'mehndi', 'maiyan', 'jaago', 'baraat',
    'anand-karaj', 'reception', 'whole-wedding'
  );

-- Traditions ----------------------------------------------------------------

insert into public.cultures (slug, name, script, shows_auspicious_dates, is_default, sort_order) values
  ('punjabi-hindu', '{"en": "Punjabi Hindu"}', 'gurmukhi', true, false, 2),
  ('pakistani', '{"en": "Pakistani"}', 'shahmukhi', false, false, 3),
  ('muslim', '{"en": "Muslim"}', 'latin', false, false, 4),
  ('arab', '{"en": "Arab"}', 'arabic', false, false, 5);

-- Events the new traditions add -------------------------------------------

insert into public.events (slug, name, aliases, host_side, timing, typical_guests_min, typical_guests_max) values
  ('nikah',
    '{"en": "Nikah"}',
    array['nikah', 'nikkah', 'nikaah', 'katb al kitab', 'katb el kitab', 'aqd'],
    'bride', '{"en": "The wedding day, or a day or two before"}', 50, 400),
  ('shadi',
    '{"en": "Shadi / Baraat"}',
    array['shadi', 'shaadi', 'barat', 'baraat', 'wedding day'],
    'bride', '{"en": "The wedding day, usually an evening at a hall"}', 200, 800),
  ('walima',
    '{"en": "Walima"}',
    array['walima', 'valima', 'waleema', 'walimah'],
    'groom', '{"en": "The day after the wedding, or soon after"}', 200, 1000),
  ('pheras',
    '{"en": "Pheras"}',
    array['pheras', 'phere', 'fere', 'saat phere', 'varmala', 'jaimala', 'mandap'],
    'bride', '{"en": "The wedding day, at the muhurat"}', 100, 500),
  ('zaffa',
    '{"en": "Zaffa"}',
    array['zaffa', 'zeffa', 'zafa', 'wedding procession', 'dabke'],
    'joint', '{"en": "The wedding night, as the couple arrives"}', 100, 600);

insert into public.culture_events (culture_slug, event_slug, phase, sort_order, is_core, local_name) values
  ('punjabi-hindu', 'roka', 'before', 1, true, null),
  ('punjabi-hindu', 'chunni-kurmai', 'before', 2, true, null),
  ('punjabi-hindu', 'sangeet', 'before', 3, true, null),
  ('punjabi-hindu', 'mehndi', 'before', 4, true, null),
  ('punjabi-hindu', 'maiyan', 'before', 5, true, '{"en": "Haldi / Maiyan", "pa": "ਹਲਦੀ / ਮਾਈਆਂ"}'),
  ('punjabi-hindu', 'jaago', 'before', 6, false, null),
  ('punjabi-hindu', 'choora', 'wedding_day', 7, false, null),
  ('punjabi-hindu', 'sehra-ghori', 'wedding_day', 8, false, null),
  ('punjabi-hindu', 'baraat', 'wedding_day', 9, true, null),
  ('punjabi-hindu', 'milni', 'wedding_day', 10, false, null),
  ('punjabi-hindu', 'pheras', 'wedding_day', 11, true, null),
  ('punjabi-hindu', 'doli', 'wedding_day', 12, false, '{"en": "Vidaai / Doli", "pa": "ਵਿਦਾਈ / ਡੋਲੀ"}'),
  ('punjabi-hindu', 'reception', 'wedding_day', 13, true, null),
  ('punjabi-hindu', 'whole-wedding', 'whole_wedding', 14, true, null),

  ('pakistani', 'chunni-kurmai', 'before', 1, true, '{"en": "Mangni"}'),
  ('pakistani', 'sangeet', 'before', 2, true, '{"en": "Dholki", "pa": "ਢੋਲਕੀ"}'),
  ('pakistani', 'maiyan', 'before', 3, true, '{"en": "Mayun"}'),
  ('pakistani', 'mehndi', 'before', 4, true, null),
  ('pakistani', 'nikah', 'wedding_day', 5, true, null),
  ('pakistani', 'shadi', 'wedding_day', 6, true, null),
  ('pakistani', 'doli', 'wedding_day', 7, false, '{"en": "Rukhsati"}'),
  ('pakistani', 'walima', 'after', 8, true, null),
  ('pakistani', 'whole-wedding', 'whole_wedding', 9, true, null),

  ('muslim', 'chunni-kurmai', 'before', 1, true, '{"en": "Engagement"}'),
  ('muslim', 'mehndi', 'before', 2, true, null),
  ('muslim', 'nikah', 'wedding_day', 3, true, null),
  ('muslim', 'doli', 'wedding_day', 4, false, '{"en": "Rukhsati"}'),
  ('muslim', 'reception', 'wedding_day', 5, false, null),
  ('muslim', 'walima', 'after', 6, true, null),
  ('muslim', 'whole-wedding', 'whole_wedding', 7, true, null),

  ('arab', 'chunni-kurmai', 'before', 1, true, '{"en": "Engagement"}'),
  ('arab', 'mehndi', 'before', 2, true, '{"en": "Henna night"}'),
  ('arab', 'nikah', 'before', 3, true, '{"en": "Katb al-Kitab"}'),
  ('arab', 'zaffa', 'wedding_day', 4, true, null),
  ('arab', 'reception', 'wedding_day', 5, true, '{"en": "Wedding party"}'),
  ('arab', 'walima', 'after', 6, false, null),
  ('arab', 'whole-wedding', 'whole_wedding', 7, true, null);

-- What the new events need (no bar service: it stays under jaago and reception)

insert into public.event_categories (event_slug, category_slug, importance, sort_order)
select v.event_slug, v.category_slug, v.importance, v.sort_order
from (values
  ('nikah', array['mandir-masjid', 'imam', 'photographer', 'videographer', 'makeup', 'bridal-boutique'],
            array['banquet-hall', 'decorator', 'florist', 'caterer', 'mithai', 'groom-wear', 'jewelry', 'live-streaming']),
  ('shadi', array['banquet-hall', 'caterer', 'decorator', 'photographer', 'videographer', 'makeup', 'bridal-boutique', 'groom-wear'],
            array['dhol', 'dj', 'live-singer', 'florist', 'lighting', 'jewelry', 'cars-limos', 'valet', 'mithai']),
  ('walima', array['banquet-hall', 'caterer', 'decorator', 'photographer', 'videographer', 'makeup'],
            array['hotel-ballroom', 'florist', 'lighting', 'live-singer', 'mc-host', 'cake-desserts', 'favors', 'valet', 'hotel-blocks']),
  ('pheras', array['mandir-masjid', 'pandit', 'decorator', 'florist', 'photographer', 'videographer', 'makeup', 'bridal-boutique'],
            array['banquet-hall', 'tent', 'live-streaming', 'dhol', 'halwai', 'jewelry', 'groom-wear']),
  ('zaffa', array['live-singer', 'photographer', 'videographer'],
            array['dj', 'lighting', 'cold-sparklers', 'drone', 'florist', 'cars-limos'])
) as needs (event_slug, essential, nice_to_have)
cross join lateral (
  select needs.event_slug, e.category_slug, 'essential' as importance, e.position::smallint as sort_order
  from unnest(needs.essential) with ordinality as e (category_slug, position)
  union all
  select needs.event_slug, n.category_slug, 'nice_to_have', (cardinality(needs.essential) + n.position)::smallint
  from unnest(needs.nice_to_have) with ordinality as n (category_slug, position)
) as v;

-- Whole wedding is every tradition's card now, so it keeps to the basics: the
-- granthi and turban tying stay with the Sikh events that need them.

delete from public.event_categories
where event_slug = 'whole-wedding' and category_slug in ('granthi', 'turban-tying');

-- Search words the new traditions use ---------------------------------------

update public.categories set aliases = aliases || array['qawwali', 'qawwal', 'zaffa', 'zaffa band']
where slug = 'live-singer';
update public.categories set aliases = aliases || array['halal', 'biryani']
where slug = 'caterer';
update public.categories set aliases = aliases || array['henna artist', 'henna night']
where slug = 'mehndi-artist';
update public.categories set aliases = aliases || array['nikah', 'officiant']
where slug = 'imam';
update public.categories set aliases = aliases || array['pheras', 'havan']
where slug = 'pandit';
update public.categories set aliases = aliases || array['dabke', 'dabka']
where slug = 'bhangra-team';
update public.categories set aliases = aliases || array['kunafa', 'baklava', 'arabic sweets']
where slug = 'cake-desserts';
update public.categories set aliases = aliases || array['islamic center', 'masjid hall']
where slug = 'mandir-masjid';
