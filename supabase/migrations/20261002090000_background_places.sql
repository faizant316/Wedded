-- "Where are the families from?" answers with places, not nationalities
-- (Kirat, 2026-10-02): Punjab, Pakistan, India, the Middle East, Afghanistan
-- and Bangladesh. Only the names change; the slugs and the traditions they
-- lead to stay the same. Gurmukhi only for Punjab, as before, until the
-- family reviews the rest.

update public.backgrounds b
set name = n.name
from (values
  ('punjabi', '{"en": "Punjab", "pa": "ਪੰਜਾਬ"}'::jsonb),
  ('pakistani', '{"en": "Pakistan"}'::jsonb),
  ('indian', '{"en": "India"}'::jsonb),
  ('arab', '{"en": "Middle East"}'::jsonb),
  ('afghan', '{"en": "Afghanistan"}'::jsonb),
  ('bangladeshi', '{"en": "Bangladesh"}'::jsonb)
) as n (slug, name)
where b.slug = n.slug;

comment on table public.backgrounds is
  'Where a family is from (Punjab, Pakistan, the Middle East...), the first question for a new family.';
