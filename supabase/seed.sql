-- Sample vendors for local development only. seed.sql runs on
-- `npm run db:reset` and in CI, never in production (reference data lives in
-- the migrations).
--
-- Everything here is made up: 555-01xx phone numbers (reserved for fiction),
-- example.com emails, invented street addresses. All rows have
-- is_sample = true. They include the awkward cases the vision asks for
-- (section 7): home-based, no email, a Punjabi-only bio, a very long name, an
-- all-of-NorCal radius, hidden pricing, and no photos yet.
--
-- Public locations of home-based vendors are their city's point from
-- public.cities, never their house (vision section 8).

-- Banquet halls (public addresses) -----------------------------------------

insert into public.vendors (
  id, slug, status, is_sample, name, tagline, bio,
  city, location, address_visibility, address_line,
  call_phone, text_phone, preferred_contact, office_hours, languages,
  price_display, price_from, price_unit, price_note,
  years_in_business, team_size, founding_number, details
) values (
  '00000000-0000-4000-8000-000000000001', 'royal-orchard-banquet-hall', 'published', true,
  'Royal Orchard Banquet Hall',
  'Seats 700. Outside caterers welcome from our approved list.',
  'Family-run hall for receptions, jaagos and sangeets, ten minutes from the gurdwara.',
  'Yuba City', 'SRID=4326;POINT(-121.6250 39.1350)', 'public', '1450 Sample Orchard Way, Yuba City, CA 95993',
  '+15305550101', '+15305550101', 'call', 'Tuesday to Sunday, 11 AM to 7 PM', '{en,pa}',
  'starting_at', 55, 'plate', 'Food included. Weekday discounts.',
  18, 25, 1,
  '{"seated_capacity": 700, "in_house_catering": "optional", "outside_catering": "approved_list",
    "alcohol_policy": "byob", "corkage": 500, "ghori_allowed": true, "dhol_outside_allowed": true,
    "curfew": "01:00", "parking_spaces": 400}'
);

insert into public.vendors (
  id, slug, status, is_sample, name, tagline,
  city, location, address_visibility, address_line,
  call_phone, preferred_contact, office_hours, languages,
  price_display, price_from, price_to, price_unit, price_note,
  years_in_business, details
) values (
  '00000000-0000-4000-8000-000000000002', 'capitol-rose-event-center', 'published', true,
  'Capitol Rose Event Center',
  'Hall rental for up to 450 guests, Friday to Sunday.',
  'Sacramento', 'SRID=4326;POINT(-121.4700 38.6000)', 'public', '2200 Sample Rose Blvd, Sacramento, CA 95815',
  '+19165550102', 'call', 'Monday to Saturday, 10 AM to 6 PM', '{en,pa,hi}',
  'range', 4000, 9000, 'event', 'Hall only. Bring your own caterer.',
  9,
  '{"seated_capacity": 450, "in_house_catering": "no", "outside_catering": "yes",
    "alcohol_policy": "full_bar", "security_required": true}'
);

-- Home-based and mobile vendors (city only) ---------------------------------

insert into public.vendors (
  id, slug, status, is_sample, name, tagline,
  city, location, service_radius_miles,
  call_phone, whatsapp_phone, preferred_contact, languages,
  price_display, price_from, price_unit, price_note, details
) values (
  '00000000-0000-4000-8000-000000000003', 'tandoor-house-catering', 'published', true,
  'Tandoor House Catering',
  'Veg and non-veg Punjabi menus, live tandoor on request.',
  'Fremont', (select location from public.cities where slug = 'fremont'), 100,
  '+15105550103', '+15105550103', 'whatsapp', '{en,pa,hi}',
  'starting_at', 22, 'person', 'Minimum 100 guests.',
  '{"dietary": ["veg", "non_veg", "jhatka"], "live_stations": ["tandoor", "chaat", "jalebi"],
    "min_headcount": 100}'
);

insert into public.vendors (
  id, slug, status, is_sample, name, tagline,
  city, location, service_radius_miles, will_travel, travel_note,
  text_phone, instagram_handle, preferred_contact, languages,
  price_display, price_from, price_unit, details
) values (
  '00000000-0000-4000-8000-000000000004', 'bass-and-bhangra-dj', 'published', true,
  'Bass & Bhangra DJ',
  'Bhangra, Bollywood and Top 40, with an MC in Punjabi and English.',
  'Stockton', (select location from public.cities where slug = 'stockton'), 100, true, 'Bay Area and Yuba City at no extra charge.',
  '+12095550104', 'bassandbhangra', 'text', '{en,pa}',
  'starting_at', 1500, 'event',
  '{"genres": ["bhangra", "bollywood", "punjabi_folk", "top_40"], "mc_included": true,
    "mc_languages": ["en", "pa"], "led_wall": true}'
);

-- No email on file, Punjabi-first
insert into public.vendors (
  id, slug, status, is_sample, name, tagline,
  city, location, service_radius_miles,
  call_phone, whatsapp_phone, preferred_contact, languages,
  price_display, price_from, price_unit, price_note, details
) values (
  '00000000-0000-4000-8000-000000000005', 'gabru-dhol-crew', 'published', true,
  'Gabru Dhol Crew',
  'Two dholis for jaago, baraat and reception entrances.',
  'Manteca', (select location from public.cities where slug = 'manteca'), 50,
  '+12095550105', '+12095550105', 'whatsapp', '{pa,en}',
  'starting_at', 400, 'event', 'Two hours, two dholis.',
  '{"dholis": 2, "min_hours": 2}'
);

-- Punjabi-only bio
insert into public.vendors (
  id, slug, status, is_sample, name, name_pa, bio_pa,
  city, location, service_radius_miles,
  text_phone, preferred_contact, languages,
  price_display, price_from, price_unit, price_note
) values (
  '00000000-0000-4000-8000-000000000006', 'rang-mehndi', 'published', true,
  'Rang Mehndi', 'ਰੰਗ ਮਹਿੰਦੀ',
  'ਲਾੜੀ ਅਤੇ ਮਹਿਮਾਨਾਂ ਲਈ ਮਹਿੰਦੀ। ਘਰ ਆ ਕੇ ਲਗਾਉਂਦੇ ਹਾਂ।',
  'Elk Grove', (select location from public.cities where slug = 'elk-grove'), 25,
  '+19165550106', 'text', '{pa}',
  'starting_at', 300, 'event', 'Bridal. Guests from $10 a hand.'
);

-- Very long name, three categories, all of NorCal, hidden pricing
insert into public.vendors (
  id, slug, status, is_sample, name, tagline,
  city, location, service_radius_miles,
  call_phone, instagram_handle, preferred_contact, languages,
  price_display, years_in_business, team_size
) values (
  '00000000-0000-4000-8000-000000000007', 'golden-moments-photo-cinema', 'published', true,
  'Golden Moments Photography and Cinematography Studio',
  'Photo, film and drone for every event, gurdwara-experienced.',
  'San Jose', (select location from public.cities where slug = 'san-jose'), 250,
  '+14085550107', 'goldenmomentsstudio', 'instagram', '{en,pa,hi}',
  'hidden', 12, 8
);

insert into public.vendors (
  id, slug, status, is_sample, name, tagline,
  city, location, service_radius_miles,
  call_phone, preferred_contact, languages,
  price_display, price_from, price_to, price_unit
) values (
  '00000000-0000-4000-8000-000000000008', 'phulkari-decor-events', 'published', true,
  'Phulkari Decor & Events',
  'Reception stages, mehndi and jaago village themes, garlands.',
  'Tracy', (select location from public.cities where slug = 'tracy'), 100,
  '+12095550108', 'call', '{en,pa}',
  'range', 4000, 15000, 'event'
);

insert into public.vendors (
  id, slug, status, is_sample, name, tagline,
  city, location, service_radius_miles,
  text_phone, instagram_handle, preferred_contact, languages,
  price_display, price_from, price_unit, price_note
) values (
  '00000000-0000-4000-8000-000000000009', 'glow-by-simran', 'published', true,
  'Glow by Simran',
  'Bridal makeup and hair, ready by 8 AM for the Anand Karaj.',
  'Lathrop', (select location from public.cities where slug = 'lathrop'), 50,
  '+12095550109', 'glowbysimran', 'instagram', '{en,pa}',
  'starting_at', 350, 'event', 'Early-morning calls from 4 AM.'
);

-- Private details (never readable through the API) -------------------------

insert into public.vendor_private (vendor_id, email, checks_email, street_address, exact_location, owner_name) values
  ('00000000-0000-4000-8000-000000000001', 'events@example.com', true, null, null, 'Sample Owner One'),
  ('00000000-0000-4000-8000-000000000002', 'office@example.com', true, null, null, 'Sample Owner Two'),
  ('00000000-0000-4000-8000-000000000003', 'orders@example.com', true, '88 Sample Tandoor Ct, Fremont, CA 94536',
    'SRID=4326;POINT(-121.9790 37.5560)', 'Sample Owner Three'),
  ('00000000-0000-4000-8000-000000000004', 'bookings@example.com', false, null, null, 'Sample Owner Four'),
  ('00000000-0000-4000-8000-000000000005', null, null, '12 Sample Dhol Ln, Manteca, CA 95336',
    'SRID=4326;POINT(-121.2230 37.8050)', 'Sample Owner Five'),
  ('00000000-0000-4000-8000-000000000006', 'mehndi@example.com', false, '5 Sample Henna Way, Elk Grove, CA 95758',
    'SRID=4326;POINT(-121.3800 38.4150)', 'Sample Owner Six'),
  ('00000000-0000-4000-8000-000000000007', 'studio@example.com', true, null, null, 'Sample Owner Seven'),
  ('00000000-0000-4000-8000-000000000008', 'decor@example.com', true, null, null, 'Sample Owner Eight'),
  ('00000000-0000-4000-8000-000000000009', 'glow@example.com', true, null, null, 'Sample Owner Nine');

-- Categories (position 1 is the primary) -------------------------------------

insert into public.vendor_categories (vendor_id, category_slug, position) values
  ('00000000-0000-4000-8000-000000000001', 'banquet-hall', 1),
  ('00000000-0000-4000-8000-000000000002', 'banquet-hall', 1),
  ('00000000-0000-4000-8000-000000000003', 'caterer', 1),
  ('00000000-0000-4000-8000-000000000003', 'live-counters', 2),
  ('00000000-0000-4000-8000-000000000004', 'dj', 1),
  ('00000000-0000-4000-8000-000000000004', 'lighting', 2),
  ('00000000-0000-4000-8000-000000000005', 'dhol', 1),
  ('00000000-0000-4000-8000-000000000006', 'mehndi-artist', 1),
  ('00000000-0000-4000-8000-000000000007', 'photographer', 1),
  ('00000000-0000-4000-8000-000000000007', 'videographer', 2),
  ('00000000-0000-4000-8000-000000000007', 'drone', 3),
  ('00000000-0000-4000-8000-000000000008', 'decorator', 1),
  ('00000000-0000-4000-8000-000000000008', 'florist', 2),
  ('00000000-0000-4000-8000-000000000009', 'makeup', 1);

-- Events served ---------------------------------------------------------------

insert into public.vendor_events (vendor_id, event_slug)
select v.vendor_id::uuid, unnest(v.events)
from (values
  ('00000000-0000-4000-8000-000000000001', array['reception', 'viah-di-roti', 'sangeet', 'chunni-kurmai', 'jaago']),
  ('00000000-0000-4000-8000-000000000002', array['reception', 'sangeet', 'chunni-kurmai', 'viah-di-roti']),
  ('00000000-0000-4000-8000-000000000003', array['reception', 'jaago', 'sangeet', 'mehndi', 'viah-di-roti', 'chunni-kurmai', 'roka']),
  ('00000000-0000-4000-8000-000000000004', array['reception', 'jaago', 'sangeet', 'mehndi', 'chunni-kurmai', 'baraat']),
  ('00000000-0000-4000-8000-000000000005', array['jaago', 'baraat', 'sehra-ghori', 'mehndi', 'sangeet', 'maiyan', 'reception']),
  ('00000000-0000-4000-8000-000000000006', array['mehndi', 'sangeet']),
  ('00000000-0000-4000-8000-000000000007', array['anand-karaj', 'reception', 'jaago', 'mehndi', 'sangeet', 'milni', 'doli', 'choora', 'sehra-ghori', 'baraat', 'chunni-kurmai']),
  ('00000000-0000-4000-8000-000000000008', array['reception', 'mehndi', 'maiyan', 'sangeet', 'chunni-kurmai', 'jaago', 'milni']),
  ('00000000-0000-4000-8000-000000000009', array['anand-karaj', 'reception', 'choora', 'chunni-kurmai', 'sangeet'])
) as v (vendor_id, events);

-- More sample vendors across the reception categories -------------------------
-- The November demo needs 20 to 25 (vision §13). Same rules as above: made-up
-- names, 555-01xx numbers, example.com emails, city points for home-based
-- vendors. A few carry founding numbers for the Founding Wall.

create temporary table more_samples (
  n integer, slug text, name text, tagline text, city_slug text, radius smallint,
  category text, category2 text, price_display text, price_from integer, price_to integer,
  unit text, phone text, contact text, languages text[], events text[], founding smallint
);

insert into more_samples values
  (10, 'grand-sutter-hotel-ballroom', 'Grand Sutter Hotel Ballroom', 'Ballroom for 600 with in-house catering and a bridal suite.',
    'yuba-city', 25, 'hotel-ballroom', null, 'starting_at', 85, null, 'plate', '+15305550110', 'call', '{en,pa}',
    '{reception,viah-di-roti,sangeet}', 2),
  (11, 'saffron-tandoor-catering', 'Saffron Tandoor Catering', 'Punjabi menus for 100 to 1,200 guests, live tandoor on site.',
    'yuba-city', 50, 'caterer', 'live-counters', 'starting_at', 18, null, 'person', '+15305550111', 'call', '{pa,en}',
    '{reception,jaago,viah-di-roti,sangeet,mehndi,roka,chunni-kurmai}', 3),
  (12, 'royal-feast-caterers', 'Royal Feast Caterers', 'Veg and non-veg, jhatka on request, halwai for home functions.',
    'sacramento', 100, 'caterer', 'halwai', 'starting_at', 20, null, 'person', '+19165550112', 'text', '{en,pa,hi}',
    '{reception,jaago,viah-di-roti,sangeet,mehndi,maiyan,akhand-paath}', null),
  (13, 'dhol-di-awaaz', 'Dhol Di Awaaz', 'Dhol for baraat, jaago and reception entrances.',
    'yuba-city', 50, 'dhol', null, 'starting_at', 350, null, 'event', '+15305550113', 'whatsapp', '{pa,en}',
    '{jaago,baraat,sehra-ghori,reception,mehndi,sangeet}', 4),
  (14, 'valley-beats-dj', 'Valley Beats DJ', 'Bhangra and Bollywood, with an MC in Punjabi and English.',
    'yuba-city', 100, 'dj', 'mc-host', 'starting_at', 1200, null, 'event', '+15305550114', 'text', '{en,pa}',
    '{reception,jaago,sangeet,mehndi,chunni-kurmai}', null),
  (15, 'glowline-lighting', 'Glowline Lighting & LED', 'Uplighting, LED walls and dance floors.',
    'sacramento', 100, 'lighting', null, 'starting_at', 900, null, 'event', '+19165550115', 'call', '{en}',
    '{reception,jaago,sangeet}', null),
  (16, 'marigold-stage-decor', 'Marigold Stage Decor', 'Reception stages, phulkari mehndi setups and jaago decor.',
    'yuba-city', 50, 'decorator', 'florist', 'range', 3000, 12000, 'event', '+15305550116', 'call', '{pa,en}',
    '{reception,mehndi,sangeet,jaago,maiyan,chunni-kurmai}', 5),
  (17, 'frames-by-jas', 'Frames by Jas', 'Gurdwara-experienced photography, every event.',
    'sacramento', 250, 'photographer', null, 'starting_at', 2500, null, 'event', '+19165550117', 'instagram', '{en,pa}',
    '{anand-karaj,reception,jaago,mehndi,milni,doli,choora}', null),
  (18, 'reel-story-films', 'Reel Story Films', 'Wedding films and same-day edits.',
    'fremont', 250, 'videographer', 'drone', 'starting_at', 3000, null, 'event', '+15105550118', 'text', '{en}',
    '{anand-karaj,reception,jaago,mehndi,milni,doli,choora}', null),
  (19, 'bridal-glam-by-noor', 'Bridal Glam by Noor', 'Bridal makeup and hair, ready early for the Anand Karaj.',
    'yuba-city', 50, 'makeup', null, 'starting_at', 300, null, 'event', '+15305550119', 'text', '{en,pa}',
    '{anand-karaj,reception,choora,sangeet}', null),
  (20, 'sufi-nights-live', 'Sufi Nights Live', 'Live Punjabi and Sufi sets with a four-piece band.',
    'stockton', 250, 'live-singer', null, 'starting_at', 1500, null, 'event', '+12095550120', 'call', '{pa,en}',
    '{reception,sangeet,jaago}', null),
  (21, 'bhangra-empire-team', 'Bhangra Empire', 'Bhangra and giddha performances and entrances.',
    'fremont', 250, 'bhangra-team', null, 'starting_at', 800, null, 'event', '+15105550121', 'instagram', '{en,pa}',
    '{reception,sangeet,jaago,baraat}', null),
  (22, 'pour-house-bartending', 'Pour House Bartending', 'Licensed bartenders for receptions and jaagos.',
    'sacramento', 100, 'bar-service', null, 'starting_at', 1500, null, 'event', '+19165550122', 'call', '{en}',
    '{reception,jaago}', null),
  (23, 'shield-event-security', 'Shield Event Security', 'Licensed guards, as most halls require when alcohol is served.',
    'yuba-city', 100, 'security', null, 'starting_at', 45, null, 'hour', '+15305550123', 'call', '{en,pa}',
    '{reception,jaago}', null),
  (24, 'sweet-rasoi-cakes', 'Sweet Rasoi Cakes', 'Eggless wedding cakes and dessert tables.',
    'elk-grove', 50, 'cake-desserts', null, 'starting_at', 250, null, 'event', '+19165550124', 'text', '{en,pa}',
    '{reception}', null),
  (25, 'snapbox-360-booth', 'SnapBox 360 Booth', 'Photo booth and 360 booth with instant prints.',
    'sacramento', 100, 'photo-booth', null, 'starting_at', 600, null, 'event', '+19165550125', 'text', '{en}',
    '{reception,sangeet}', null);

insert into public.vendors (
  id, slug, status, is_sample, name, tagline, city, location, service_radius_miles,
  call_phone, text_phone, preferred_contact, languages,
  price_display, price_from, price_to, price_unit, founding_number
)
select
  ('00000000-0000-4000-8000-0000000000' || lpad(m.n::text, 2, '0'))::uuid, m.slug, 'published', true,
  m.name, m.tagline, c.name, c.location, m.radius, m.phone, m.phone, m.contact, m.languages,
  m.price_display, m.price_from, m.price_to, m.unit, m.founding
from more_samples m
join public.cities c on c.slug = m.city_slug;

-- The hotel ballroom has a public address
update public.vendors
set address_visibility = 'public',
    address_line = '700 Sample Plaza Dr, Yuba City, CA 95991',
    location = 'SRID=4326;POINT(-121.6150 39.1380)',
    office_hours = 'Every day, 9 AM to 6 PM',
    details = '{"seated_capacity": 600, "in_house_catering": "yes", "outside_catering": "no",
      "alcohol_policy": "full_bar", "bridal_suite": true, "parking_spaces": 300}'
where slug = 'grand-sutter-hotel-ballroom';

insert into public.vendor_private (vendor_id, email, checks_email, owner_name)
select ('00000000-0000-4000-8000-0000000000' || lpad(m.n::text, 2, '0'))::uuid,
  replace(m.slug, '-', '.') || '@example.com', true, 'Sample Owner ' || m.n
from more_samples m;

insert into public.vendor_categories (vendor_id, category_slug, position)
select ('00000000-0000-4000-8000-0000000000' || lpad(m.n::text, 2, '0'))::uuid, m.category, 1
from more_samples m
union all
select ('00000000-0000-4000-8000-0000000000' || lpad(m.n::text, 2, '0'))::uuid, m.category2, 2
from more_samples m where m.category2 is not null;

insert into public.vendor_events (vendor_id, event_slug)
select ('00000000-0000-4000-8000-0000000000' || lpad(m.n::text, 2, '0'))::uuid, unnest(m.events)
from more_samples m;

drop table more_samples;

-- Links between sample vendors ---------------------------------------------------
-- Royal Orchard's approved caterers (demo step 3). Tandoor House is confirmed by
-- the hall only, so it stays hidden until the caterer confirms too.

insert into public.vendor_links (venue_vendor_id, vendor_id, kind, confirmed_by_venue, confirmed_by_vendor)
select venue.id, vendor.id, link.kind, true, link.vendor_confirmed
from (values
  ('royal-orchard-banquet-hall', 'saffron-tandoor-catering', 'approved_at', true),
  ('royal-orchard-banquet-hall', 'royal-feast-caterers', 'approved_at', true),
  ('royal-orchard-banquet-hall', 'tandoor-house-catering', 'approved_at', false),
  ('royal-orchard-banquet-hall', 'marigold-stage-decor', 'worked_with', true)
) as link (venue_slug, vendor_slug, kind, vendor_confirmed)
join public.vendors venue on venue.slug = link.venue_slug
join public.vendors vendor on vendor.slug = link.vendor_slug;
