-- Launch reference data: the Punjabi Sikh event set, the vendor category
-- taxonomy, and which categories each event needs.
--
-- Source: docs/PRODUCT_VISION.md section 3 (events table and category
-- taxonomy). Gurmukhi is copied from that section, which was cross-checked
-- against Punjabi Wikipedia; the only additions are the culture name
-- ਪੰਜਾਬੀ ਸਿੱਖ and the alias ਆਨੰਦ ਕਾਰਜ. Names without verified Gurmukhi
-- fall back to English until the family has reviewed a translation. Where the community
-- spells a word two ways (ਅਨੰਦ/ਆਨੰਦ, ਸਿਹਰਾ/ਸਹਿਰਾ, ਬਰਾਤ/ਬਾਰਾਤ), the name
-- uses the primary spelling and the other is a search alias.
--
-- This lives in a migration, not seed.sql, because seed.sql only runs on
-- local databases and production needs these rows too.

-- Cultures --------------------------------------------------------------

insert into public.cultures (slug, name, script, shows_auspicious_dates, is_default, sort_order) values
  ('punjabi-sikh', '{"en": "Punjabi Sikh", "pa": "ਪੰਜਾਬੀ ਸਿੱਖ"}', 'gurmukhi', false, true, 1);

-- Events ----------------------------------------------------------------

insert into public.events (slug, name, aliases, host_side, timing, typical_guests_min, typical_guests_max) values
  ('roka',
    '{"en": "Roka / Thaka", "pa": "ਰੋਕਾ / ਠਾਕਾ"}',
    array['roka', 'thaka'],
    'bride', '{"en": "3 to 12 months before the wedding"}', 15, 60),
  ('chunni-kurmai',
    '{"en": "Chunni Chadai + Kurmai / Sagai", "pa": "ਚੁੰਨੀ ਚੜ੍ਹਾਈ / ਕੁੜਮਾਈ / ਸਗਾਈ"}',
    array['chunni', 'chunni chadai', 'kurmai', 'sagai', 'mangni', 'ring ceremony', 'engagement', 'ਮੁੰਦਰੀ'],
    'each', '{"en": "2 weeks to 6 months before the wedding"}', 50, 300),
  ('saha',
    '{"en": "Saha / card distribution", "pa": "ਸਾਹਾ / ਕਾਰਡ ਵੰਡਣਾ"}',
    array['saha', 'cards', 'card distribution'],
    'each', '{"en": "3 to 8 weeks before the wedding"}', null, null),
  ('akhand-paath',
    '{"en": "Akhand Paath / Sehaj Paath + Bhog", "pa": "ਅਖੰਡ ਪਾਠ / ਸਹਿਜ ਪਾਠ / ਭੋਗ"}',
    array['paath', 'path', 'akhand paath', 'sehaj paath', 'bhog'],
    'each', '{"en": "48 hours, with the bhog on the Saturday morning before the wedding"}', 50, 250),
  ('sangeet',
    '{"en": "Ladies Sangeet + Dholki", "pa": "ਲੇਡੀਜ਼ ਸੰਗੀਤ / ਢੋਲਕੀ"}',
    array['sangeet', 'ladies sangeet', 'dholki'],
    'each', '{"en": "1 to 3 days before the wedding, often with the mehndi"}', 50, 250),
  ('mehndi',
    '{"en": "Mehndi", "pa": "ਮਹਿੰਦੀ"}',
    array['mehndi', 'mehendi', 'henna'],
    'bride', '{"en": "2 or 3 days before the wedding"}', 40, 200),
  ('maiyan',
    '{"en": "Maiyan / Vatna", "pa": "ਮਾਈਆਂ / ਵਟਣਾ / ਹਲਦੀ"}',
    array['maiyan', 'mayian', 'vatna', 'batna', 'haldi', 'mayun'],
    'each', '{"en": "1 to 3 days before the wedding, at home"}', 30, 150),
  ('jaago',
    '{"en": "Jaago", "pa": "ਜਾਗੋ"}',
    array['jaago', 'jaggo', 'jago'],
    'each', '{"en": "The night before the wedding"}', 150, 800),
  ('choora',
    '{"en": "Choora + Kalire", "pa": "ਚੂੜਾ / ਕਲੀਰੇ"}',
    array['choora', 'chura', 'chooda', 'kalire', 'kaleere'],
    'bride', '{"en": "Wedding morning, 6 to 9 AM"}', 20, 60),
  ('sehra-ghori',
    '{"en": "Sehra Bandi + Ghori", "pa": "ਸਿਹਰਾ ਬੰਦੀ / ਘੋੜੀ ਚੜ੍ਹਨਾ"}',
    array['sehra', 'sehrabandi', 'sehra bandi', 'ghori', 'ghodi', 'vaag pharai', 'ਸਹਿਰਾ'],
    'groom', '{"en": "Wedding morning, 6:30 to 9 AM"}', 30, 100),
  ('baraat',
    '{"en": "Baraat", "pa": "ਬਰਾਤ"}',
    array['baraat', 'barat', 'ਬਾਰਾਤ'],
    'groom', '{"en": "Wedding morning, 8:30 to 10 AM"}', 100, 400),
  ('milni',
    '{"en": "Milni", "pa": "ਮਿਲਣੀ"}',
    array['milni'],
    'bride', '{"en": "Wedding morning, 9 to 10 AM"}', 200, 800),
  ('anand-karaj',
    '{"en": "Anand Karaj + Laavan", "pa": "ਅਨੰਦ ਕਾਰਜ / ਲਾਵਾਂ"}',
    array['anand karaj', 'anand karj', 'laavan', 'lavan', 'ਆਨੰਦ ਕਾਰਜ'],
    'bride', '{"en": "10:30 AM to 12:30 PM on the wedding day"}', 200, 800),
  ('langar',
    '{"en": "Langar", "pa": "ਲੰਗਰ"}',
    array['langar'],
    'bride', '{"en": "After the ceremony"}', null, null),
  ('viah-di-roti',
    '{"en": "Viah di roti", "pa": "ਵਿਆਹ ਦੀ ਰੋਟੀ"}',
    array['viah di roti', 'roti'],
    'bride', '{"en": "Wedding day, 1 to 4 PM or evening"}', 300, 1200),
  ('doli',
    '{"en": "Doli / Vidaai", "pa": "ਡੋਲੀ / ਵਿਦਾਈ"}',
    array['doli', 'vidaai', 'vidai', 'bidaai'],
    'joint', '{"en": "Wedding day, 2 to 5 PM"}', null, null),
  ('reception',
    '{"en": "Reception", "pa": "ਰਿਸੈਪਸ਼ਨ"}',
    array['reception'],
    'groom', '{"en": "Wedding evening (Bay Area) or the next day (Valley), 6 PM to past midnight"}', 300, 1500),
  ('pag-phera',
    '{"en": "Pag Phera / Muklawa", "pa": "ਪਗ ਫੇਰਾ / ਮੁਕਲਾਵਾ"}',
    array['pag phera', 'muklawa'],
    'bride', '{"en": "1 to 3 days after the wedding"}', 10, 40),
  ('whole-wedding',
    '{"en": "Whole wedding", "pa": "ਪੂਰਾ ਵਿਆਹ"}',
    array['whole wedding', 'wedding', 'planner'],
    'joint', null, null, null);

insert into public.culture_events (culture_slug, event_slug, phase, sort_order) values
  ('punjabi-sikh', 'roka', 'before', 1),
  ('punjabi-sikh', 'chunni-kurmai', 'before', 2),
  ('punjabi-sikh', 'saha', 'before', 3),
  ('punjabi-sikh', 'akhand-paath', 'before', 4),
  ('punjabi-sikh', 'sangeet', 'before', 5),
  ('punjabi-sikh', 'mehndi', 'before', 6),
  ('punjabi-sikh', 'maiyan', 'before', 7),
  ('punjabi-sikh', 'jaago', 'before', 8),
  ('punjabi-sikh', 'choora', 'wedding_day', 9),
  ('punjabi-sikh', 'sehra-ghori', 'wedding_day', 10),
  ('punjabi-sikh', 'baraat', 'wedding_day', 11),
  ('punjabi-sikh', 'milni', 'wedding_day', 12),
  ('punjabi-sikh', 'anand-karaj', 'wedding_day', 13),
  ('punjabi-sikh', 'langar', 'wedding_day', 14),
  ('punjabi-sikh', 'viah-di-roti', 'wedding_day', 15),
  ('punjabi-sikh', 'doli', 'wedding_day', 16),
  ('punjabi-sikh', 'reception', 'wedding_day', 17),
  ('punjabi-sikh', 'pag-phera', 'after', 18),
  ('punjabi-sikh', 'whole-wedding', 'whole_wedding', 19);

-- Category groups -------------------------------------------------------

insert into public.category_groups (slug, name, sort_order) values
  ('venues', '{"en": "Venues"}', 1),
  ('food', '{"en": "Food"}', 2),
  ('music', '{"en": "Music and performance"}', 3),
  ('religious', '{"en": "Religious"}', 4),
  ('photo-video', '{"en": "Photo and video"}', 5),
  ('decor', '{"en": "Decor"}', 6),
  ('beauty', '{"en": "Beauty"}', 7),
  ('attire', '{"en": "Attire and jewelry"}', 8),
  ('transport', '{"en": "Transport"}', 9),
  ('stationery', '{"en": "Stationery"}', 10),
  ('services', '{"en": "Services"}', 11);

-- Categories ------------------------------------------------------------

insert into public.categories (slug, group_slug, sort_order, name, aliases, is_religious, serves_alcohol) values
  -- Venues
  ('gurdwara', 'venues', 1, '{"en": "Gurdwara", "pa": "ਗੁਰਦੁਆਰਾ"}',
    array['gurdwara', 'gurudwara', 'gurdwara sahib', 'ਗੁਰਦੁਆਰਾ'], true, false),
  ('banquet-hall', 'venues', 2, '{"en": "Banquet hall", "pa": "ਬੈਂਕੁਇਟ ਹਾਲ"}',
    array['hall', 'banquet', 'banquet hall', 'venue', 'palace', 'marriage palace', 'ਬੈਂਕੁਇਟ ਹਾਲ'], false, false),
  ('hotel-ballroom', 'venues', 3, '{"en": "Hotel ballroom"}',
    array['hotel', 'ballroom', 'venue'], false, false),
  ('restaurant-room', 'venues', 4, '{"en": "Restaurant private room"}',
    array['restaurant', 'private room', 'party room'], false, false),
  ('outdoor-venue', 'venues', 5, '{"en": "Outdoor venue"}',
    array['outdoor', 'winery', 'farm', 'ranch', 'garden'], false, false),
  ('community-center', 'venues', 6, '{"en": "Community center"}',
    array['community center', 'community centre', 'fairgrounds', 'hall'], false, false),
  ('mandir-masjid', 'venues', 7, '{"en": "Mandir or masjid"}',
    array['mandir', 'temple', 'masjid', 'mosque'], true, false),
  ('tent', 'venues', 8, '{"en": "Backyard tent", "pa": "ਟੈਂਟ"}',
    array['tent', 'pandal', 'canopy', 'flooring', 'heaters', 'misters', 'lights', 'ਟੈਂਟ'], false, false),

  -- Food
  ('caterer', 'food', 1, '{"en": "Caterer", "pa": "ਕੇਟਰਿੰਗ"}',
    array['caterer', 'catering', 'khana', 'food', 'ਕੇਟਰਿੰਗ'], false, false),
  ('halwai', 'food', 2, '{"en": "Halwai", "pa": "ਹਲਵਾਈ"}',
    array['halwai', 'cook', 'langar', 'home cooking', 'ਹਲਵਾਈ'], false, false),
  ('nashta-chai', 'food', 3, '{"en": "Breakfast and chai"}',
    array['nashta', 'breakfast', 'chai', 'tea'], false, false),
  ('live-counters', 'food', 4, '{"en": "Live food counters"}',
    array['chaat', 'tandoor', 'jalebi', 'paan', 'golgappa', 'pani puri', 'kulfi', 'dosa'], false, false),
  ('mithai', 'food', 5, '{"en": "Mithai and sweet boxes", "pa": "ਮਿਠਾਈ"}',
    array['mithai', 'sweets', 'ladoo', 'laddu', 'dry fruit', 'pinni', 'barfi', 'ਮਿਠਾਈ'], false, false),
  ('cake-desserts', 'food', 6, '{"en": "Cake and desserts"}',
    array['cake', 'dessert', 'desserts'], false, false),
  ('bar-service', 'food', 7, '{"en": "Bar service"}',
    array['bar', 'bartender', 'bartenders', 'drinks', 'alcohol'], false, true),

  -- Music and performance
  ('dhol', 'music', 1, '{"en": "Dhol player", "pa": "ਢੋਲੀ"}',
    array['dhol', 'dholi', 'dhol wala', 'drummer', 'ਢੋਲ', 'ਢੋਲੀ'], false, false),
  ('dj', 'music', 2, '{"en": "DJ", "pa": "ਡੀਜੇ"}',
    array['dj', 'deejay', 'music', 'sound', 'ਡੀਜੇ'], false, false),
  ('live-singer', 'music', 3, '{"en": "Live singer or band"}',
    array['singer', 'band', 'live music', 'band baja'], false, false),
  ('dholki-singers', 'music', 4, '{"en": "Dholki and sangeet singers"}',
    array['dholki', 'sangeet', 'ladies sangeet', 'boliyan'], false, false),
  ('bhangra-team', 'music', 5, '{"en": "Bhangra and giddha team"}',
    array['bhangra', 'giddha', 'dance team', 'dancers'], false, false),
  ('choreographer', 'music', 6, '{"en": "Sangeet choreographer"}',
    array['choreographer', 'dance', 'dance teacher', 'sangeet'], false, false),
  ('mc-host', 'music', 7, '{"en": "MC / host"}',
    array['mc', 'host', 'emcee', 'anchor'], false, false),

  -- Religious
  ('ragi-jatha', 'religious', 1, '{"en": "Ragi / kirtan jatha"}',
    array['ragi', 'kirtan', 'jatha', 'kirtani'], true, false),
  ('paathi', 'religious', 2, '{"en": "Paathi Singhs"}',
    array['paathi', 'paath', 'path', 'akhand paath', 'sehaj paath'], true, false),
  ('granthi', 'religious', 3, '{"en": "Granthi"}',
    array['granthi', 'giani', 'gyani'], true, false),
  ('pandit', 'religious', 4, '{"en": "Pandit"}',
    array['pandit', 'priest', 'jotshi', 'pujari'], true, false),
  ('imam', 'religious', 5, '{"en": "Imam / nikah khwan"}',
    array['imam', 'nikah khwan', 'maulvi', 'qazi'], true, false),
  ('bhajan-mandali', 'religious', 6, '{"en": "Bhajan mandali"}',
    array['bhajan', 'mandali', 'jagrata', 'chowki'], true, false),

  -- Photo and video
  ('photographer', 'photo-video', 1, '{"en": "Photographer", "pa": "ਫੋਟੋਗ੍ਰਾਫਰ"}',
    array['photographer', 'photography', 'photos', 'pictures', 'ਫੋਟੋਗ੍ਰਾਫਰ'], false, false),
  ('videographer', 'photo-video', 2, '{"en": "Videographer"}',
    array['videographer', 'video', 'videography', 'cinematographer', 'film'], false, false),
  ('drone', 'photo-video', 3, '{"en": "Drone"}',
    array['drone', 'aerial'], false, false),
  ('live-streaming', 'photo-video', 4, '{"en": "Live streaming"}',
    array['live stream', 'livestream', 'streaming', 'zoom'], false, false),
  ('photo-booth', 'photo-video', 5, '{"en": "Photo booth"}',
    array['photo booth', '360 booth', 'booth'], false, false),

  -- Decor
  ('decorator', 'decor', 1, '{"en": "Decorator", "pa": "ਸਜਾਵਟ"}',
    array['decor', 'decoration', 'decorator', 'stage', 'mandap', 'backdrop', 'entrance', 'ਸਜਾਵਟ'], false, false),
  ('florist', 'decor', 2, '{"en": "Florist", "pa": "ਹਾਰ / ਫੁੱਲ"}',
    array['florist', 'flowers', 'garlands', 'haar', 'ਹਾਰ', 'ਫੁੱਲ'], false, false),
  ('lighting', 'decor', 3, '{"en": "Lighting and LED wall"}',
    array['lighting', 'lights', 'uplighting', 'led wall', 'dance floor'], false, false),
  ('rentals', 'decor', 4, '{"en": "Rentals"}',
    array['rentals', 'chairs', 'tables', 'linens', 'peerhi', 'floor seating', 'generator', 'restrooms'], false, false),
  ('jaago-decor', 'decor', 5, '{"en": "Jaago pot and danda"}',
    array['jaago pot', 'gaggar', 'gagar', 'danda'], false, false),
  ('thaal-packing', 'decor', 6, '{"en": "Thaal and gift trays"}',
    array['thaal', 'gift tray', 'trays', 'nanki chhak', 'trousseau', 'shagun'], false, false),
  ('cold-sparklers', 'decor', 7, '{"en": "Cold sparklers"}',
    array['cold sparklers', 'sparklers', 'sparks'], false, false),
  ('signage', 'decor', 8, '{"en": "Signs and neon"}',
    array['signage', 'signs', 'neon'], false, false),

  -- Beauty
  ('makeup', 'beauty', 1, '{"en": "Makeup and hair", "pa": "ਮੇਕਅੱਪ"}',
    array['makeup', 'make up', 'hair', 'bridal makeup', 'mua', 'ਮੇਕਅੱਪ'], false, false),
  ('mehndi-artist', 'beauty', 2, '{"en": "Mehndi artist", "pa": "ਮਹਿੰਦੀ ਵਾਲੀ"}',
    array['mehndi', 'mehendi', 'henna', 'ਮਹਿੰਦੀ'], false, false),
  ('turban-tying', 'beauty', 3, '{"en": "Turban tying", "pa": "ਪੱਗ"}',
    array['pagg', 'pagri', 'turban', 'dastar', 'sehra', 'ਪੱਗ'], false, false),
  ('groom-grooming', 'beauty', 4, '{"en": "Groom grooming and barber"}',
    array['barber', 'grooming', 'beard'], false, false),

  -- Attire and jewelry
  ('bridal-boutique', 'attire', 1, '{"en": "Bridal boutique", "pa": "ਬੁਟੀਕ"}',
    array['boutique', 'lehenga', 'suits', 'chunni', 'bridal wear', 'ਬੁਟੀਕ'], false, false),
  ('groom-wear', 'attire', 2, '{"en": "Groom wear"}',
    array['sherwani', 'kalgi', 'jutti', 'groom wear', 'achkan'], false, false),
  ('tailor', 'attire', 3, '{"en": "Tailor and alterations", "pa": "ਦਰਜ਼ੀ"}',
    array['tailor', 'alterations', 'darzi', 'ਦਰਜ਼ੀ'], false, false),
  ('jewelry', 'attire', 4, '{"en": "Jewelry", "pa": "ਗਹਿਣੇ / ਸੁਨਿਆਰਾ"}',
    array['jewelry', 'jewellery', 'gold', '22k', 'choora', 'chura', 'kalire', 'sunyara', 'ਗਹਿਣੇ', 'ਸੁਨਿਆਰਾ'], false, false),
  ('phulkari', 'attire', 5, '{"en": "Phulkari and dupattas"}',
    array['phulkari', 'dupatta', 'rumal', 'rumala'], false, false),

  -- Transport
  ('ghori', 'transport', 1, '{"en": "Ghori", "pa": "ਘੋੜੀ ਵਾਲਾ"}',
    array['ghori', 'ghodi', 'horse', 'ਘੋੜੀ'], false, false),
  ('cars-limos', 'transport', 2, '{"en": "Cars, limos and party buses"}',
    array['limo', 'limousine', 'vintage car', 'party bus', 'car'], false, false),
  ('shuttle', 'transport', 3, '{"en": "Guest shuttle"}',
    array['shuttle', 'charter bus', 'bus'], false, false),
  ('valet', 'transport', 4, '{"en": "Valet and parking"}',
    array['valet', 'parking'], false, false),

  -- Stationery
  ('invitations', 'stationery', 1, '{"en": "Printed invitations"}',
    array['invitations', 'invites', 'cards', 'wedding cards'], false, false),
  ('digital-invites', 'stationery', 2, '{"en": "Digital and video invites"}',
    array['e-invite', 'video invite', 'digital invite', 'whatsapp invite'], false, false),
  ('favors', 'stationery', 3, '{"en": "Favors and welcome bags"}',
    array['favors', 'favours', 'welcome bags', 'thank you cards', 'gifts'], false, false),

  -- Services
  ('planner', 'services', 1, '{"en": "Wedding planner"}',
    array['planner', 'wedding planner', 'coordinator', 'day of coordinator'], false, false),
  ('security', 'services', 2, '{"en": "Security guards"}',
    array['security', 'guards', 'bouncer'], false, false),
  ('cleaning', 'services', 3, '{"en": "Cleaning crew"}',
    array['cleaning', 'cleanup', 'teardown'], false, false),
  ('hotel-blocks', 'services', 4, '{"en": "Hotel room blocks"}',
    array['hotel', 'hotel rooms', 'room block'], false, false),
  ('permits-insurance', 'services', 5, '{"en": "Permits and insurance"}',
    array['permit', 'permits', 'insurance'], false, false),
  ('travel-agent', 'services', 6, '{"en": "Travel agent"}',
    array['travel', 'travel agent', 'tickets', 'flights'], false, false),
  ('kids-entertainment', 'services', 7, '{"en": "Kids entertainment"}',
    array['kids', 'children', 'face painting', 'entertainment'], false, false);

-- What each event needs ("Vendors you'll need" on the event page) --------
-- From the Essential and Nice-to-have columns of the events table. Bar
-- service appears only under jaago and reception (section 3 rule).

insert into public.event_categories (event_slug, category_slug, importance, sort_order)
select v.event_slug, v.category_slug, v.importance, v.sort_order
from (values
  ('roka', array['mithai', 'thaal-packing', 'caterer', 'photographer'],
           array['florist', 'decorator', 'bridal-boutique', 'groom-wear']),
  ('chunni-kurmai', array['banquet-hall', 'restaurant-room', 'caterer', 'decorator', 'photographer', 'videographer', 'dj'],
           array['dhol', 'mehndi-artist', 'makeup', 'jewelry', 'bridal-boutique', 'mithai']),
  ('saha', array['invitations', 'digital-invites', 'mithai'],
           array[]::text[]),
  ('akhand-paath', array['gurdwara', 'paathi', 'ragi-jatha', 'halwai', 'tent', 'rentals'],
           array['photographer', 'phulkari']),
  ('sangeet', array['banquet-hall', 'dj', 'dhol', 'caterer', 'decorator', 'photographer', 'videographer'],
           array['dholki-singers', 'choreographer', 'live-singer', 'lighting', 'makeup', 'photo-booth']),
  ('mehndi', array['mehndi-artist', 'decorator', 'dj', 'dhol', 'caterer', 'photographer'],
           array['live-counters', 'tent', 'lighting', 'jewelry', 'bridal-boutique', 'makeup']),
  ('maiyan', array['decorator', 'halwai', 'photographer'],
           array['dhol', 'dholki-singers', 'tent', 'bridal-boutique', 'nashta-chai']),
  ('jaago', array['dhol', 'jaago-decor', 'caterer', 'photographer', 'videographer'],
           array['dj', 'lighting', 'live-singer', 'bar-service', 'security', 'tent', 'bhangra-team', 'drone', 'cold-sparklers', 'makeup']),
  ('choora', array['jewelry', 'makeup', 'photographer', 'videographer'],
           array['halwai', 'dhol', 'mithai']),
  ('sehra-ghori', array['turban-tying', 'groom-wear', 'ghori', 'cars-limos', 'dhol', 'photographer', 'videographer'],
           array['halwai', 'live-singer']),
  ('baraat', array['dhol', 'cars-limos', 'ghori'],
           array['live-singer', 'bhangra-team', 'drone', 'dj']),
  ('milni', array['florist', 'nashta-chai', 'halwai', 'photographer', 'videographer'],
           array['turban-tying', 'thaal-packing']),
  ('anand-karaj', array['gurdwara', 'photographer', 'videographer', 'makeup', 'bridal-boutique'],
           array['florist', 'live-streaming', 'turban-tying', 'granthi', 'ragi-jatha']),
  ('langar', array['halwai', 'gurdwara'],
           array['tent', 'rentals']),
  ('viah-di-roti', array['banquet-hall', 'caterer', 'dj', 'decorator', 'photographer', 'videographer'],
           array[]::text[]),
  ('doli', array['cars-limos', 'florist', 'photographer', 'videographer'],
           array['halwai', 'mithai', 'favors']),
  ('reception', array['banquet-hall', 'hotel-ballroom', 'caterer', 'dj', 'lighting', 'decorator', 'photographer', 'videographer', 'makeup'],
           array['dhol', 'live-singer', 'mc-host', 'bhangra-team', 'bar-service', 'security', 'valet', 'cake-desserts', 'photo-booth', 'cold-sparklers', 'drone', 'cars-limos', 'hotel-blocks', 'shuttle', 'invitations', 'favors']),
  ('pag-phera', array['restaurant-room', 'caterer', 'mithai'],
           array['photographer']),
  ('whole-wedding', array['planner', 'invitations', 'bridal-boutique', 'groom-wear', 'jewelry', 'makeup', 'turban-tying', 'granthi', 'hotel-blocks'],
           array['permits-insurance', 'travel-agent'])
) as needs (event_slug, essential, nice_to_have)
cross join lateral (
  select needs.event_slug, e.category_slug, 'essential' as importance, e.position::smallint as sort_order
  from unnest(needs.essential) with ordinality as e (category_slug, position)
  union all
  select needs.event_slug, n.category_slug, 'nice_to_have', (cardinality(needs.essential) + n.position)::smallint
  from unnest(needs.nice_to_have) with ordinality as n (category_slug, position)
) as v;
