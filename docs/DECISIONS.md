# Decisions Log

Add newest decisions at the top. Keep each entry short: what we decided, why, and who agreed.

| Date | Decision | Why | Agreed by |
| --- | --- | --- | --- |
| 2026-09-29 | Inquiry rules live in the database function `create_inquiry` (one transaction, locked per person), called only by the `send-inquiry` Edge Function; the app can read its inquiries but not write them | The limits can't be skipped, can't be raced by double taps, and are covered by pgTAP tests (vision section 8) | Kirat |
| 2026-09-29 | Vendors without email, or who say they don't check it, get inquiries relayed through the founders | Realistic at 50 vendors, and the best early data on who replies (vision section 8) | Kirat |
| 2026-09-29 | Until the sending domain is verified (Phase 5), set `INQUIRY_TEST_INBOX` so every vendor email goes to the founders | Resend can only send to your own inbox without a verified domain; matches "all test inquiries go to our own inbox" | Kirat |
| 2026-09-29 | Cities and ZIP points come from the US Census 2024 Gazetteer, stored in tables; no geocoding API | Free, no keys, works offline once cached (vision section 8); the launch city list covers 510, 916, 408, 209, 530, 925, 650, 559 and 707 | Kirat |
| 2026-09-29 | A search includes vendors whose own service radius covers you, marked as travelling to you; vendors who "will travel" further appear only on request | A Sacramento DJ who serves the valley should show up in Stockton (vision section 8); open-ended travellers would crowd local results | Kirat |
| 2026-09-29 | Area-code chips search 40 miles around a centre city: 510 Hayward, 408 San Jose, 916 Sacramento, 209 Manteca, 530 Yuba City, 925 Pleasanton, 650 San Mateo, 559 Fresno, 707 Fairfield | Area codes are how the community describes geography (vision S22a); the centres are editable rows | Kirat |
| 2026-09-29 | Sign-up asks only name, city, phone, email and 18+; sign-in is a 6-digit email code, no password, no subscription | Keep it as simple as possible for families; phone/SMS login needs the LLC (vision section 8) | Kirat |
| 2026-09-29 | `profiles` doesn't store email; the sign-in email in `auth.users` is the one we use | Collect the minimum and keep one copy (CLAUDE.md privacy rule) | Kirat |
| 2026-09-29 | 18+ is `profiles.adult_confirmed_at`, stamped by the database when the profile is created; the app can't write it | A record the user can't backdate, and never a birthdate (vision section 8) | Kirat |
| 2026-09-29 | Vendor-written text uses separate English and Punjabi columns (`name`/`name_pa`, `bio`/`bio_pa`), not LocalizedText | Some vendors will write only in Punjabi; reference data (events, categories) keeps LocalizedText with English required | Kirat |
| 2026-09-29 | Service radius is one of 10, 25, 50, 100 miles or 250 ("all of NorCal"), plus a `will_travel` flag for further with a fee | Matches the vision's radius choices (section 6) in miles, which is what families and vendors use | Kirat |
| 2026-09-29 | Prices are whole US dollars with a unit (event, hour, person, plate, hand, turban, day) | Vendors quote round numbers; cents add nothing | Kirat |
| 2026-09-29 | PostGIS lives in the `extensions` schema; CI lints only our schemas (`public`, `private`) | Supabase's recommendation; PostGIS's own functions trip the linter and aren't ours to fix | Kirat |
| 2026-09-29 | Reference data (cultures, events, categories, what each event needs) ships in migrations, not `seed.sql` | `seed.sql` only runs on local databases; production needs these rows too. `seed.sql` stays for sample vendors | Kirat |
| 2026-09-29 | Events are shared across cultures; `culture_events` sets each culture's list, order and Home grouping | A Punjabi Hindu or Muslim set becomes rows (the vision's "delta"), and a vendor's "events served" means the same thing for every family | Kirat |
| 2026-09-29 | The category list table is `categories`; `vendor_categories` is reserved for which categories a vendor is in | The vision used `vendor_categories` for both; one name per meaning avoids confusion | Kirat |
| 2026-09-29 | Gurmukhi only where the vision doc verified it; other names show English until the family reviews them | A wrong Punjabi word in front of elders is worse than English | Kirat |
| 2026-09-29 | Local dev database: Supabase CLI on Colima (free, headless Docker engine) | Product vision section 12: local Supabase so dev never pauses; Colima avoids Docker Desktop's app and licence terms | Kirat |
| 2026-09-29 | Supabase session stored with `expo-sqlite/localStorage`; env var is the publishable key (`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) | Expo's current Supabase guide; expo-sqlite is already installed and works in Expo Go; publishable keys replace the old anon key | Kirat |
| 2026-09-26 | Use Expo Router's JS `Tabs`, not native tabs, for the first builds | Native tabs need a development build; the November demo runs in Expo Go | |
| 2026-09-26 | Fonts: Nunito (Latin) + Mukta Mahee (Gurmukhi), loaded at runtime with `useFonts` | Works in Expo Go; Mukta Mahee is the Gurmukhi most Punjabi users already read on Android and WhatsApp | |
| 2026-09-26 | One text component (`AppText`) that picks the script's font and sets line height | Gurmukhi vowel marks clip without explicit line height; keeps the type scale in one place | |
| 2026-09-26 | i18n with `i18n-js` + `expo-localization`; language persisted in `expo-sqlite/kv-store` | Expo's recommended pair; kv-store works in Expo Go, is synchronous at startup, and can later back the Supabase session too | |
| 2026-09-26 | Light theme only until Phase 8 | Parents keep phones in light mode; halves the design and test work | |
| 2026-09-25 | Tech stack: Expo (React Native) + TypeScript + Expo Router, Supabase backend | One codebase for iOS and Android; Supabase covers auth, database, and storage (from the project plan) | |
| 2026-09-25 | Working repo name `wedding-vendor-app` until the final name is picked in Phase 5 | Don't get attached to a name before trademark and domain checks | |
