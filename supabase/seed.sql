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

-- Every other vendor type, for testing the whole app ---------------------------
-- One or two sample vendors in each remaining category except kids-entertainment
-- (the search tests own that one). Same rules as above.

create temporary table all_type_samples (
  n integer, slug text, name text, tagline text, bio text, city_slug text, radius smallint,
  category text, category2 text, price_display text, price_from integer, price_to integer,
  unit text, phone text, contact text, languages text[], events text[], instagram text
);

insert into all_type_samples values
  (26, 'sutter-buttes-garden-estate', 'Sutter Buttes Garden Estate', 'Open lawns and an orchard backdrop for up to 500 guests.', 'A family farm turned venue, with string lights over the lawn and room for the ghori to arrive in style.', 'yuba-city', 25, 'outdoor-venue', 'tent', 'starting_at', 6500, null, 'event', '+15305550126', 'call', '{en,pa}', '{reception,sangeet,mehndi,jaago}', 'sutterbuttesestate'),
  (27, 'valley-oak-community-hall', 'Valley Oak Community Hall', 'Affordable hall for 300 with a full kitchen for your halwai.', 'Run by volunteers. Popular for roka, chunni and akhand paath bhog lunches.', 'stockton', 25, 'community-center', null, 'range', 1200, 2500, 'event', '+12095550127', 'call', '{en,pa}', '{roka,chunni-kurmai,akhand-paath,maiyan,viah-di-roti}', null),
  (28, 'tandoori-nights-private-room', 'Tandoori Nights Private Room', 'Private dining room for 80, set menus from $32 a person.', 'Good for the roka, the saha dinner or a small reception with close family.', 'fremont', 25, 'restaurant-room', 'caterer', 'starting_at', 32, null, 'person', '+15105550128', 'text', '{en,pa,hi}', '{roka,saha,chunni-kurmai,reception}', 'tandoorinightsfremont'),
  (29, 'gurdwara-sahib-sample-lathrop', 'Sample Gurdwara Sahib (Lathrop)', 'Anand Karaj bookings through the gurdwara office.', 'Langar hall for 600. Please call the office to book the Anand Karaj and the akhand paath.', 'lathrop', 25, 'gurdwara', null, 'contact', null, null, null, '+12095550129', 'call', '{pa,en}', '{anand-karaj,akhand-paath,langar}', null),
  (30, 'harmony-mandir-hall', 'Harmony Mandir Hall', 'Temple hall for Hindu and interfaith ceremonies, 250 guests.', 'Pandit ji available by arrangement. Vegetarian catering only.', 'fremont', 25, 'mandir-masjid', null, 'contact', null, null, null, '+15105550130', 'call', '{en,hi,pa}', '{anand-karaj,sangeet,mehndi}', null),
  (31, 'crystal-palace-banquets', 'Crystal Palace Banquets', 'Chandeliers, a sprung dance floor and seating for 900.', 'The biggest room in the valley, with two bridal suites and parking for 500 cars.', 'manteca', 25, 'banquet-hall', null, 'starting_at', 65, null, 'plate', '+12095550131', 'call', '{en,pa}', '{reception,sangeet,viah-di-roti,jaago}', 'crystalpalacemanteca'),
  (32, 'chai-and-parontha-co', 'Chai & Parontha Co.', 'Morning nashta for the maiyan and the Anand Karaj day.', 'Fresh aloo and gobi paronthe, masala chai in big pateelas, set up by 7 AM.', 'yuba-city', 50, 'nashta-chai', null, 'starting_at', 9, null, 'person', '+15305550132', 'whatsapp', '{pa,en}', '{maiyan,anand-karaj,akhand-paath,roka}', null),
  (33, 'desi-mithai-house', 'Desi Mithai House', 'Laddoo, barfi and jalebi boxes for shagun and milni.', 'Custom mithai boxes with your names printed on the lid, orders from 50 boxes.', 'sacramento', 100, 'mithai', 'favors', 'starting_at', 12, null, 'person', '+19165550133', 'text', '{en,pa,hi}', '{roka,chunni-kurmai,milni,reception}', 'desimithaihouse'),
  (34, 'five-rivers-catering', 'Five Rivers Catering', 'Punjabi and Indo-Chinese menus, live chaat and tandoor.', 'Butter chicken, sarson da saag, paneer tikka and a chaat counter guests talk about for weeks.', 'stockton', 100, 'caterer', 'live-counters', 'starting_at', 22, null, 'person', '+12095550134', 'call', '{pa,en,hi}', '{reception,jaago,sangeet,mehndi,viah-di-roti,roka}', 'fiveriverscatering'),
  (35, 'giddha-queens-dholki', 'Giddha Queens Dholki', 'Dholki and boliyan for the ladies sangeet.', 'Four aunties with a dholki, spoons and every boli you remember from back home.', 'yuba-city', 50, 'dholki-singers', null, 'starting_at', 400, null, 'event', '+15305550135', 'call', '{pa}', '{sangeet,mehndi,jaago,maiyan}', null),
  (36, 'naach-studio-choreography', 'Naach Studio Choreography', 'Family dance routines for the sangeet in six weekends.', 'We teach cousins, parents and grandparents one routine each, and film the rehearsals for practice.', 'san-jose', 100, 'choreographer', null, 'packages', 900, null, 'event', '+14085550136', 'instagram', '{en,pa,hi}', '{sangeet,reception}', 'naachstudio'),
  (37, 'thunder-dhol-academy', 'Thunder Dhol Academy', 'Two or four dholis for the baraat and the doli.', 'Matching turbans, loud and on time. Add a bagpipe band for the milni.', 'sacramento', 100, 'dhol', null, 'starting_at', 400, null, 'event', '+19165550137', 'whatsapp', '{pa,en}', '{baraat,sehra-ghori,jaago,doli,reception}', 'thunderdhol'),
  (38, 'beat-drop-dj-sac', 'Beat Drop DJ', 'Bhangra, hip-hop and Bollywood with a light show.', 'Clean mixes for the aunties, bass for the cousins. Cold sparklers for the first dance.', 'elk-grove', 100, 'dj', 'lighting', 'starting_at', 1400, null, 'event', '+19165550138', 'text', '{en,pa}', '{reception,sangeet,jaago}', 'beatdropdj'),
  (39, 'saanjh-live-streams', 'Saanjh Live Streams', 'Stream the Anand Karaj to family in India and Canada.', 'Two cameras, a private link and a recording the same day.', 'fremont', 250, 'live-streaming', 'videographer', 'starting_at', 700, null, 'event', '+15105550139', 'text', '{en,pa}', '{anand-karaj,reception,akhand-paath}', 'saanjhlive'),
  (40, 'mitti-stories-photography', 'Mitti Stories Photography', 'Documentary photos of every ceremony, from roka to doli.', 'Unposed, warm and full of family. Albums printed in Punjab-style leather.', 'modesto', 250, 'photographer', null, 'starting_at', 2800, null, 'event', '+12095550140', 'instagram', '{en,pa}', '{roka,chunni-kurmai,mehndi,jaago,anand-karaj,milni,doli,reception}', 'mittistories'),
  (41, 'bhai-sahib-ragi-jatha', 'Sample Ragi Jatha', 'Kirtan for the Anand Karaj, akhand paath bhog and home functions.', 'Three-member jatha. Please book through the gurdwara office or call directly.', 'yuba-city', 100, 'ragi-jatha', null, 'contact', null, null, null, '+15305550141', 'call', '{pa}', '{anand-karaj,akhand-paath}', null),
  (42, 'sample-granthi-singh', 'Sample Granthi Singh', 'Granthi available for home paath and the Anand Karaj.', 'Punjabi and English. Available weekends across the Sacramento valley.', 'sacramento', 100, 'granthi', 'paathi', 'contact', null, null, null, '+19165550142', 'call', '{pa,en}', '{anand-karaj,akhand-paath}', null),
  (43, 'sample-paathi-singhs', 'Sample Paathi Singhs', 'A team of paathis for the akhand paath at home.', 'Five paathis in rotation for the full 48 hours.', 'stockton', 100, 'paathi', null, 'contact', null, null, null, '+12095550143', 'call', '{pa}', '{akhand-paath}', null),
  (44, 'sample-pandit-ji', 'Sample Pandit Ji', 'Hindu wedding ceremonies, havan and griha pravesh.', 'Hindi, Punjabi and English. Brings the samagri.', 'fremont', 100, 'pandit', null, 'contact', null, null, null, '+15105550144', 'call', '{hi,pa,en}', '{anand-karaj,roka,sangeet}', null),
  (45, 'sample-nikah-khwan', 'Sample Nikah Khwan', 'Nikah ceremonies at the masjid, a hall or at home.', 'Urdu, Punjabi and English.', 'sacramento', 100, 'imam', null, 'contact', null, null, null, '+19165550145', 'call', '{ur,pa,en}', '{anand-karaj}', null),
  (46, 'sample-bhajan-mandali', 'Sample Bhajan Mandali', 'Bhajans and kirtan for mehndi nights and home functions.', 'Harmonium, tabla and six voices.', 'modesto', 100, 'bhajan-mandali', null, 'contact', null, null, null, '+12095550146', 'call', '{hi,pa}', '{mehndi,sangeet,akhand-paath}', null),
  (47, 'mehndi-by-harleen', 'Mehndi by Harleen', 'Bridal mehndi with portraits, names and the date hidden in the design.', 'Organic henna, dark stain in 24 hours. Guest mehndi at $10 a hand.', 'fremont', 100, 'mehndi-artist', null, 'starting_at', 250, null, 'event', '+15105550147', 'instagram', '{en,pa}', '{mehndi,sangeet}', 'mehndibyharleen'),
  (48, 'sardar-grooming-lounge', 'Sardar Grooming Lounge', 'Beard styling, facials and a calm morning for the groom.', 'We come to the house on the wedding morning with everything, including the beard fixer.', 'sacramento', 50, 'groom-grooming', 'turban-tying', 'starting_at', 180, null, 'event', '+19165550148', 'text', '{en,pa}', '{anand-karaj,sehra-ghori,reception}', 'sardargrooming'),
  (49, 'pagg-da-ustaad', 'Pagg Da Ustaad', 'Turban tying for the groom and the whole baraat.', 'Matching pagg for 20 relatives in an hour. Starch and pins included.', 'yuba-city', 50, 'turban-tying', null, 'starting_at', 15, null, 'turban', '+15305550149', 'whatsapp', '{pa,en}', '{anand-karaj,baraat,sehra-ghori}', 'paggdaustaad'),
  (50, 'kohl-and-kesar-studio', 'Kohl & Kesar Studio', 'Airbrush bridal makeup and hair for the reception.', 'Soft glam or full glam. Trial sessions on weekday evenings.', 'san-jose', 100, 'makeup', null, 'starting_at', 400, null, 'event', '+14085550150', 'instagram', '{en,pa,hi}', '{anand-karaj,reception,sangeet,chunni-kurmai}', 'kohlandkesar'),
  (51, 'rajwada-sherwani-house', 'Rajwada Sherwani House', 'Sherwanis, achkans and matching pagg fabric for the groom.', 'Made to measure in four weeks, rentals for the groom''s brothers.', 'fremont', 100, 'groom-wear', null, 'starting_at', 450, null, 'event', '+15105550151', 'text', '{en,pa,hi}', '{anand-karaj,reception}', 'rajwadasherwani'),
  (52, 'nirvair-bridal-boutique', 'Nirvair Bridal Boutique', 'Bridal lehengas and Anand Karaj suits, custom colors.', 'Appointments on Saturdays. Bring your mother and your chooda color.', 'yuba-city', 100, 'bridal-boutique', null, 'starting_at', 1200, null, 'event', '+15305550152', 'instagram', '{pa,en}', '{anand-karaj,reception,chunni-kurmai}', 'nirvairbridal'),
  (53, 'phulkari-heritage', 'Phulkari Heritage', 'Hand-embroidered phulkari dupattas and baghs from Patiala.', 'Each piece takes weeks to stitch. Perfect for the bride''s mother and the jaago.', 'stockton', 250, 'phulkari', null, 'starting_at', 150, null, 'event', '+12095550153', 'text', '{pa,en}', '{jaago,mehndi,anand-karaj}', 'phulkariheritage'),
  (54, 'sona-jewellers', 'Sona Jewellers', 'Bridal sets, kalire and chooda, with 22-karat gold.', 'Rent or buy. We fit the chooda the night before.', 'yuba-city', 100, 'jewelry', null, 'contact', null, null, null, '+15305550154', 'call', '{pa,en,hi}', '{choora,anand-karaj,reception}', 'sonajewellers'),
  (55, 'stitch-perfect-tailors', 'Stitch Perfect Tailors', 'Suit stitching and alterations in a week.', 'Blouses, salwar suits and sherwani fittings. Rush jobs in two days.', 'sacramento', 50, 'tailor', null, 'starting_at', 40, null, 'event', '+19165550155', 'text', '{en,pa,hi}', '{whole-wedding}', null),
  (56, 'jaago-crafts-by-bibi', 'Jaago Crafts by Bibi', 'Decorated jaago pots and dandas, ready to carry.', 'Brass gaagar with diyas, a decorated danda with ghungroo, and a spare for the cousins.', 'yuba-city', 100, 'jaago-decor', null, 'starting_at', 120, null, 'event', '+15305550156', 'whatsapp', '{pa}', '{jaago}', null),
  (57, 'neon-and-names', 'Neon & Names', 'Custom neon signs and welcome boards with your names.', 'Your names in Gurmukhi or English. Rent or keep.', 'san-jose', 250, 'signage', null, 'starting_at', 180, null, 'event', '+14085550157', 'instagram', '{en,pa}', '{reception,sangeet,mehndi}', 'neonandnames'),
  (58, 'sparkle-moments-fx', 'Sparkle Moments FX', 'Cold sparklers and low fog for the first dance and entrances.', 'Indoor-safe, approved by most halls. A tech stays for the whole night.', 'elk-grove', 100, 'cold-sparklers', null, 'starting_at', 500, null, 'event', '+19165550158', 'text', '{en}', '{reception,sangeet}', 'sparklemomentsfx'),
  (59, 'shagun-thaal-studio', 'Shagun Thaal Studio', 'Decorated trays for the roka, chunni and shagun.', 'Dry fruit, mithai and chunni trays wrapped to match your colors.', 'fremont', 100, 'thaal-packing', 'favors', 'starting_at', 35, null, 'event', '+15105550159', 'instagram', '{en,pa,hi}', '{roka,chunni-kurmai,milni}', 'shagunthaal'),
  (60, 'valley-party-rentals', 'Valley Party Rentals', 'Tents, tables, chairs, heaters and palki rentals.', 'Delivery and setup included within 25 miles.', 'modesto', 100, 'rentals', 'tent', 'starting_at', 800, null, 'event', '+12095550160', 'call', '{en,pa}', '{mehndi,jaago,maiyan,akhand-paath,reception}', null),
  (61, 'gulmohar-floral-studio', 'Gulmohar Floral Studio', 'Floral mandaps, car decor and the doli car garlands.', 'Fresh marigold and rose, flown in the week of the wedding.', 'pleasanton', 100, 'florist', 'decorator', 'range', 2500, 9000, 'event', '+19255550161', 'text', '{en,pa,hi}', '{reception,mehndi,doli,milni}', 'gulmoharfloral'),
  (62, 'shaadi-sorted-planning', 'Shaadi Sorted Planning', 'Day-of coordination or planning from the roka to the doli.', 'We keep the timeline, the vendors and the aunties on schedule, so you enjoy the day.', 'san-jose', 250, 'planner', null, 'packages', 2500, null, 'event', '+14085550162', 'instagram', '{en,pa,hi}', '{whole-wedding}', 'shaadisorted'),
  (63, 'punjab-express-travel', 'Punjab Express Travel', 'Group flights for family coming from India and Canada.', 'Visa letters, group fares and airport pickups.', 'yuba-city', 250, 'travel-agent', null, 'contact', null, null, null, '+15305550163', 'call', '{pa,en}', '{whole-wedding}', null),
  (64, 'event-cover-insurance', 'Event Cover Insurance', 'Liability insurance and permits for halls and backyards.', 'Same-day certificates that halls ask for.', 'sacramento', 250, 'permits-insurance', null, 'starting_at', 150, null, 'event', '+19165550164', 'call', '{en}', '{whole-wedding}', null),
  (65, 'guest-stay-blocks', 'Guest Stay Blocks', 'Hotel room blocks near your hall, no deposit.', 'We negotiate group rates and handle the rooming list.', 'sacramento', 250, 'hotel-blocks', null, 'contact', null, null, null, '+19165550165', 'text', '{en,pa}', '{whole-wedding}', null),
  (66, 'spotless-event-crew', 'Spotless Event Crew', 'Cleanup for backyard functions and the langar hall.', 'Before and after cleaning, trash haul-away, dishes.', 'stockton', 50, 'cleaning', null, 'starting_at', 35, null, 'hour', '+12095550166', 'call', '{en,pa}', '{mehndi,jaago,akhand-paath,maiyan}', null),
  (67, 'safe-side-security', 'Safe Side Security', 'Licensed guards for receptions, as halls with a bar require.', 'Bilingual guards, uniformed or in suits.', 'fremont', 100, 'security', null, 'starting_at', 40, null, 'hour', '+15105550167', 'call', '{en,pa}', '{reception,jaago}', null),
  (68, 'rangoli-invites', 'Rangoli Invites', 'Printed cards in Gurmukhi and English, boxed invitations.', 'Laser-cut and foil cards, envelopes addressed by hand.', 'fremont', 250, 'invitations', null, 'starting_at', 6, null, 'person', '+15105550168', 'instagram', '{en,pa,hi}', '{whole-wedding}', 'rangoliinvites'),
  (69, 'reel-invite-studio', 'Reel Invite Studio', 'Video and animated WhatsApp invitations in a day.', 'Your photos, a Punjabi song and the event list, ready to forward.', 'san-jose', 250, 'digital-invites', null, 'starting_at', 120, null, 'event', '+14085550169', 'instagram', '{en,pa}', '{whole-wedding}', 'reelinvites'),
  (70, 'little-lamb-favors', 'Little Lamb Favors', 'Welcome bags and favors: mithai, candles and mini bottles.', 'Packed and labeled by guest name.', 'elk-grove', 100, 'favors', null, 'starting_at', 8, null, 'person', '+19165550170', 'text', '{en}', '{reception,mehndi}', null),
  (71, 'shahi-ghori-wale', 'Shahi Ghori Wale', 'A decorated white ghori for the groom, with a handler.', 'Includes the sehra-bandi ride and photos with the baraat.', 'yuba-city', 100, 'ghori', null, 'starting_at', 900, null, 'event', '+15305550171', 'whatsapp', '{pa,en}', '{sehra-ghori,baraat}', 'shahighori'),
  (72, 'royal-rides-limo', 'Royal Rides Limo & Party Bus', 'Vintage cars, limos and a party bus for the baraat.', 'The doli car comes decorated if you like.', 'hayward', 100, 'cars-limos', 'shuttle', 'starting_at', 150, null, 'hour', '+15105550172', 'call', '{en,pa,hi}', '{baraat,doli,reception}', 'royalrideslimo'),
  (73, 'park-it-valet', 'Park It Valet', 'Valet for halls with small lots and backyard functions.', 'Insured drivers, glow signs and a ticket for every car.', 'sacramento', 100, 'valet', null, 'starting_at', 600, null, 'event', '+19165550173', 'call', '{en}', '{reception,jaago}', null);

insert into public.vendors (
  id, slug, status, is_sample, name, tagline, bio, city, location, service_radius_miles,
  call_phone, text_phone, whatsapp_phone, instagram_handle, preferred_contact, languages,
  price_display, price_from, price_to, price_unit
)
select
  ('00000000-0000-4000-8000-0000000000' || lpad(m.n::text, 2, '0'))::uuid, m.slug, 'published', true,
  m.name, m.tagline, m.bio, c.name, c.location, m.radius, m.phone, m.phone,
  case when m.contact = 'whatsapp' then m.phone end, m.instagram, m.contact, m.languages,
  m.price_display, m.price_from, m.price_to, m.unit
from all_type_samples m
join public.cities c on c.slug = m.city_slug;

insert into public.vendor_private (vendor_id, email, checks_email, owner_name)
select ('00000000-0000-4000-8000-0000000000' || lpad(m.n::text, 2, '0'))::uuid,
  replace(m.slug, '-', '.') || '@example.com', true, 'Sample Owner ' || m.n
from all_type_samples m;

insert into public.vendor_categories (vendor_id, category_slug, position)
select ('00000000-0000-4000-8000-0000000000' || lpad(m.n::text, 2, '0'))::uuid, m.category, 1
from all_type_samples m
union all
select ('00000000-0000-4000-8000-0000000000' || lpad(m.n::text, 2, '0'))::uuid, m.category2, 2
from all_type_samples m where m.category2 is not null;

insert into public.vendor_events (vendor_id, event_slug)
select ('00000000-0000-4000-8000-0000000000' || lpad(m.n::text, 2, '0'))::uuid, unnest(m.events)
from all_type_samples m;

drop table all_type_samples;

-- A line about each of the earlier samples, shown as the caption in Discover.
update public.vendors v set bio = b.bio
from (values
  ('grand-sutter-hotel-ballroom', 'Downtown Yuba City. In-house chefs cook Punjabi and continental menus, and guests can stay upstairs.'),
  ('saffron-tandoor-catering', 'Three generations of cooks from Jalandhar. We bring the tandoor, the halwai and the serving staff.'),
  ('royal-feast-caterers', 'Big weddings are our specialty: we have served 1,500 guests in one evening.'),
  ('dhol-di-awaaz', 'Our dholis have played at hundreds of Sutter County weddings. We know every entrance tune.'),
  ('valley-beats-dj', 'We read the room: slow for the aunties, fast for the cousins, and never too loud at dinner.'),
  ('glowline-lighting', 'Uplighting in your colors, an LED wall for the entrance video and a dance floor that glows.'),
  ('marigold-stage-decor', 'From the jaago charpai to the reception stage, we design and set up everything.'),
  ('frames-by-jas', 'We know every moment of the Anand Karaj and never get in the way of the ceremony.'),
  ('reel-story-films', 'Cinematic wedding films, drone shots and a same-day edit for the reception.'),
  ('bridal-glam-by-noor', 'Long-wear makeup that lasts from the Anand Karaj to the last song.'),
  ('sufi-nights-live', 'Live qawwali, Sufi and Punjabi folk. A favourite for sangeet nights.'),
  ('bhangra-empire-team', 'Bhangra and giddha teams for entrances, sangeets and surprise performances.'),
  ('pour-house-bartending', 'Licensed and insured bartenders, plus mocktails the whole family can enjoy.'),
  ('shield-event-security', 'Guards who know how a Punjabi wedding runs and keep it calm.'),
  ('sweet-rasoi-cakes', 'Eggless cakes in any size, with flavours like rasmalai and pista.'),
  ('snapbox-360-booth', 'Slow-motion 360 videos your cousins will post all night.')
) as b (slug, bio)
where v.slug = b.slug and v.bio is null;
