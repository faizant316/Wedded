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
-- Public locations of home-based vendors are city centre points.

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
  'Fremont', 'SRID=4326;POINT(-121.9886 37.5485)', 100,
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
  'Stockton', 'SRID=4326;POINT(-121.2908 37.9577)', 100, true, 'Bay Area and Yuba City at no extra charge.',
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
  'Manteca', 'SRID=4326;POINT(-121.2161 37.7974)', 50,
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
  'Elk Grove', 'SRID=4326;POINT(-121.3716 38.4088)', 25,
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
  'San Jose', 'SRID=4326;POINT(-121.8863 37.3382)', 250,
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
  'Tracy', 'SRID=4326;POINT(-121.4252 37.7397)', 100,
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
  'Lathrop', 'SRID=4326;POINT(-121.2766 37.8227)', 50,
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
