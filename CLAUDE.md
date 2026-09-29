@AGENTS.md

# Wedding Vendor Booking App

## Start here
Before planning any feature, read the part of the docs it touches. They are the source of truth; this file only summarizes them.

- `docs/PRODUCT_VISION.md`: the full rundown of the app. It is about 150 KB, so read the section you need rather than the whole file:
  - §3 Events and vendor categories: the data the whole app is built on
  - §4 How it looks: colour and type tokens, component sizes, accessibility
  - §5 Screen by screen: every user screen (S0 to S23); build screens to these specs
  - §6 Vendor listings by type: the shared model, halls and gurdwaras in depth
  - §8 Technical reality: how each feature is built on Expo + Supabase, and what goes wrong
  - §13 The November prototype: demo scope, what is in and out, and the week-by-week plan
- `docs/PROJECT_PLAN.md`: the 8-phase checklist. Tick a box in the same PR that finishes the task.
- `docs/DECISIONS.md`: decisions already made. Don't reopen one without asking; add new ones at the top.

## Where things stand (2026-09-29; update this in the PR that changes it)
- Done: Phase 1 tech setup (ESLint, Prettier, CI), the product vision, the app shell (Home, Search, Saved and Profile tabs, theme tokens, `AppText`, English/Punjabi toggle), a local Supabase with the typed client in `src/lib/supabase.ts`, and the reference data (#10): `cultures`, `events`, `culture_events` (Home order and grouping), `category_groups`, `categories`, `event_categories` (essential / nice to have), with RLS (read-only for everyone) and pgTAP tests.
- UI building blocks in `src/components` (#7): Button, Chip, Card, TextField, Checkbox, StateView; `localized()` in `src/i18n/localized.ts` picks the English or Punjabi name from database rows, and `bilingual()` gives both for two-line names. Browse pieces: EventTile (Home), CategoryTile (takes an Ionicon name) and VendorCard (takes `{ en: name, pa: name_pa }` and a `price_unit` code; the unit words are in i18n). The "About you" signup form is `src/features/auth/about-you-form.tsx`: it validates and calls `onSubmit(values)`, and is not wired to Supabase yet.
- Vendor tables: `vendors` (public listing; PostGIS `location` is the city centre point for home-based vendors, and `address_line` is only allowed when `address_visibility` is public), `vendor_private` (email, exact address; RLS on with zero policies and no grants, so the API can never read it), `vendor_categories` (up to 3, position 1 is primary) and `vendor_events`. 25 sample vendors in `supabase/seed.sql` (local and CI only, `is_sample`; 5 with founding numbers). Vendor-written text has `_pa` columns (`name_pa`, `bio_pa`) instead of LocalizedText, so a Punjabi-only bio is possible.
- Data layer: TanStack Query (`queryClient` in `src/data/query-client.ts`, provider in `src/app/_layout.tsx`; refetches when the app returns to the foreground). Reference hooks in `src/data/reference.ts`: `useHomeEvents()` (default culture, grouped by phase, ceremony order, with vendor-type and published-vendor counts), `useEvent(slug)`, `useEventNeeds(slug)` (essential first) and `useCategories()` (A to Z); fresh for a day. `asLocalizedText()` turns jsonb names into LocalizedText.
- Home (S4) in `src/app/(tabs)/(home)/index.tsx`: header with the EN | ਪੰ toggle, the location chip, a search-bar button that opens the Search tab, then **Browse by vendor type** first (category groups from `useCategoryGroups()`, each opening `/g/{group}` with its vendor types), then **Plan by event**: events under Before the wedding / Wedding day / After in database order and the whole-wedding card, pull to refresh, and loading, empty and error states. The Home tab is its own stack (`(tabs)/(home)/_layout.tsx`), so pushed screens keep the tab bar.
- Event page (S5) at `/e/{slug}` in the Home stack, and results (S6) at `/c/{category}?event={slug}`, shared by the Home and Search stacks through the `(tabs)/(home,search)` group (a cold deep link opens it in Home): the event name in both scripts, its timing, and "Vendors you'll need" (essential, then nice to have) as rows with a group icon (`groupIcon()` in `src/components/group-icon.ts`, display only, shop-front default). Results never filter by event (vendors who haven't listed every event would vanish; see DECISIONS.md); `?event=` only decides where a heart saves. Results use `useVendorSearch()` with the saved search location: nearest first with "12 mi" on each card, a location chip at the top, "Travels to you" and "Founding vendor" badges, and "Widen to 50 mi" / "Show vendors who travel to you" when nothing is near. Result cards open the profile and have a heart (`useSaveVendor().toggleSave`, with the event when there is one).
- Vendor profile (S9) at `/v/{slug}` in the root stack (over the tabs): cover placeholder, name and name_pa, founding badge, categories, tagline and bio (`vendorText()`: Punjabi in Punjabi mode, Punjabi-only text in both), address only when `address_line` is set, otherwise city and travel radius, languages, price from `price_display`, hall fact chips from `details`, Call (confirms the number) / Text / WhatsApp / Instagram / Directions (only with an address) through expo-linking, the numbers printed under Contact, and a sticky Save button. `useVendor(slug)` is in `src/data/vendors.ts`. A sticky bar with Save (40%) and "Ask about price & date" (60%), which opens `/ask`; `?event=` (passed from results) goes to both Save and Ask.
- Founding Wall at `/founding` (root stack, linked from the bottom of Home): published vendors with a `founding_number`, in order, each opening the profile (`useFoundingVendors()`).
- Search (S8) at `/search`, its own stack in `(tabs)/(search)/`: a search field (Home's search box opens it with the keyboard up), Popular chips (the categories with the most published vendors, from `useCategoryVendorCounts()`), and all categories A to Z as a two-column grid (one column at very large text). Typing matches category names and aliases in English or Gurmukhi on the device (`matchCategories()` in `src/features/search/`).
- CI (`.github/workflows/ci.yml`) also rebuilds the database from the migrations and runs the pgTAP tests, `db lint` and the advisors, and fails on stale `src/types/database.ts`. Auto-merge waits for it.
- Login backend: email 6-digit code (`signInWithOtp` then `verifyOtp` with `type: 'email'`; template in `supabase/templates/sign-in-code.html`) and `profiles` (full_name, city, phone in E.164; one row per person, created by the About you form). Email is not in `profiles`: it's the sign-in email in `auth.users`. `adult_confirmed_at` is stamped by the database; the API can write only id, full_name, city and phone. Upsert works. No profile row after sign-in means show About you.
- Login screens: `src/app/sign-in.tsx` is a modal (email, 6-digit code, About you; `?mode=edit` edits About you). `useSession()` from `src/features/auth/session.tsx` gives `status` (loading, signedOut, needsProfile, signedIn, error), `profile`, `email`, `signOut`, and `requireSignIn(action)`: runs the action if signed in, otherwise opens sign-in and runs it after. Use it for Save and Ask; browsing never needs an account. The Profile tab shows sign-in, finish setup, or the person's details with edit and sign out. `formatPhone` is in `src/lib/phone.ts`.
- Known issue: `npx expo export --platform web` fails because expo-sqlite needs wasm support in a Metro config (web is secondary).
- `saved_vendors`: one row per person, vendor and event (`event_slug` null means "Not sure yet"); RLS so people read, add and remove only their own; the API can write only `vendor_id` and `event_slug` (`user_id` defaults to `auth.uid()`); only published vendors can be saved; no updates (remove and save again).
- Saving: `src/data/saved.ts`. `useSaveVendor().toggleSave(vendorId, eventSlug?)` is what a heart calls: with an event it saves or removes for that event; without one it removes all of the vendor's saves or opens `src/app/save-vendor.tsx` ("Save to which event?", a modal); logged out it signs in first, then saves. `useSavedEventsFor(vendorId)` says whether to fill the heart. The Saved tab groups saves by event in ceremony order, then "Not sure yet", and shows "no longer listed" for unpublished vendors.
- Location search: `cities` (101 NorCal cities, US Census 2024 points, nicknames like sj/sac/yuba), `area_codes` (the 9 chips, each a centre city and 40 mi) and `zip_codes` (California), all read-only. `search_vendors(lat, lng, max_miles, category_slug, event_slug, query, include_travelers, result_limit, result_offset)` returns published vendors sorted by distance and includes vendors whose own service radius covers the searcher; `max_miles` null means anywhere, no lat/lng means no distance. App side: `useVendorSearch()` in `src/data/search.ts` (results ready for VendorCard), and `useCities()`, `useAreaCodes()`, `findZip()`, `matchCities()` in `src/data/places.ts`. Sample home-based vendors take their city's point from `cities`.
- Search location: `useSearchLocation()` from `src/features/location/search-location.tsx` gives `place` ({ label, latitude, longitude } or null), `maxMiles` (null = anywhere, default 25), setters and `openLocationSheet()`; it's saved on the phone (`settings.searchLocation`). `src/app/location.tsx` is the S22a sheet (city or ZIP with suggestions, area-code chips, How far). `<LocationChip />` from `src/features/location/location-chip.tsx` is the full-width chip for Home and results. Pass `place?.latitude`, `place?.longitude` and `maxMiles` to `useVendorSearch()`. "Use my current location" (expo-location, S22b) is not built yet.
- Inquiries: the app calls `useSendInquiry()` / `sendInquiry(draft)` from `src/data/inquiries.ts`, which invokes the `send-inquiry` Edge Function and returns an outcome (sent, queued, duplicate with previousAt, rateLimited, needsProfile, vendorNotFound, invalid with field, failed, offline). The rules live in `public.create_inquiry()` (service role only; profile, published vendor, valid events and date, 1 per vendor per 24 h unless sendAgain, 5 an hour, 15 a day, app-wide daily cap in `app_config`). The app can read its own `inquiries` but never write them. Vendors without email (or who don't check it) are relayed to FOUNDERS_EMAIL. Asking a vendor saves them under the event. Deleting an account scrubs the sender's details. `useMyInquiries()` lists them. CI type-checks, lints and format-checks every Edge Function with Deno.
- Inquiry form: `src/app/ask.tsx` is the S11 modal. Open it with `router.push({ pathname: '/ask', params: { vendorId, event } })` (event optional). It has event chips (multi, Not sure), a native date picker or Not sure yet, guest bands, where (prefilled with their city), a suggested message in their language that's rewritten until they edit it, name and phone, and reply-by chips. Logged out, Send asks them to sign in and then sends the same draft. It handles duplicate ("Send again?"), limits, offline and failures. `src/app/ask-sent.tsx` is S12 (what happens next, Call now / Text now, and where it was saved).
- Vendor links: `vendor_links` (approved_at: a caterer on a venue's approved list; worked_with), shown only when both sides confirmed and both are published. `useVendorLinks(vendorId)` in `src/data/vendor-links.ts` gives `approvedCaterers` (on a hall), `approvedAt` (on a caterer) and `workedWith`. Sample: Royal Orchard has two approved caterers and a decorator.
- Account deletion: Profile → "Delete my account" opens `src/app/delete-account.tsx` (S19): what's removed, "sign out instead", then a fresh email code. The `delete-account` Edge Function refuses unless an email code was verified in the last 10 minutes, then deletes the auth user; profile and saves cascade, inquiries keep the vendor's copy with the sender scrubbed. Buttons have a `danger` variant.
- Next (§13): the vendor profile (`/v/{slug}`, with its "Ask about price & date" button opening /ask) and the Founding Wall (another branch). Later: a job that sends queued inquiries after midnight (pg_cron), "Use my current location", vendor media, a web page for Google Play deletion requests (needs the domain), the Expo patch updates `npx expo install --check` lists.
- Local database: `npm run db:start`, `db:status`, `db:reset`, `db:test`, `db:types`, `db:stop` (setup steps are in the README). After a schema change, run `db:types` and commit `src/types/database.ts`.
- Both founders build with Claude Code. Run `gh pr list` before starting so two branches don't build the same thing.

## Stack
- **Frontend**: React Native + Expo (SDK 57) with Expo Router
- **Backend/DB**: Supabase (Postgres + Auth + Storage)
- **Platforms**: iOS and Android (cross-platform first; web is secondary)
- Until the November demo, everything must run in Expo Go: no libraries that need a development build (§13)

## User base
Users include elders who may not be tech-savvy. UI must:
- Use large, readable text (minimum 16sp body, 20sp+ headings)
- Keep interactions simple — no multi-step flows without clear progress indicators
- Avoid jargon; use plain, warm language

## Data-driven content
Cultures, event types, and vendor categories must come from the database — never hardcode them in the app. This ensures the app supports any culture or event type without a code change.

## Privacy & security
- Collect only the minimum personal data needed for a feature to work
- Never commit secrets, API keys, or credentials — use `.env.local` (gitignored) for local secrets and EAS Secrets for CI/build secrets
- `.env.example` documents the required env vars with empty values

## Git workflow
Pull requests merge themselves. When the checks pass, the `Merge when checks pass` job in `.github/workflows/ci.yml` squash-merges the PR into `main`. Nobody has to approve or click merge.

1. Start from a fresh `main`: `git switch main && git pull`
2. Branch: `feature/<name>`, `fix/<name>`, `docs/<name>` or `chore/<name>`
3. Before pushing, run what CI runs: `npm run lint -- --max-warnings 0`, `npm run format:check`, `npm run typecheck` (`npm run format` fixes formatting). If you touched `supabase/`, also `npm run db:reset && npm run db:test && npm run db:types` and commit the regenerated types; CI rebuilds the database from the migrations, runs the tests and advisors, and refuses stale types
4. Push and open the PR: `git push -u origin HEAD`, then `gh pr create`
5. Watch it land: `gh pr checks --watch`. All green means it is merged. Then `git switch main && git pull`

- The PR title becomes the only commit message on `main`, so write it as a short plain sentence: "Add vendor profile screen"
- Keep PRs small: one feature or fix each. Small PRs rarely conflict
- To have the other founder look first, open a draft (`gh pr create --draft`). Drafts never merge on their own; `gh pr ready` sends it through the checks and it merges when green
- Checks failed: fix on the same branch and push again. It merges once green
- `Merge when checks pass` failed: `main` moved and the PR now conflicts. Run `git fetch origin && git merge origin/main`, fix the conflicts, rerun the checks, push
- Never push straight to `main`, and never force-push it
- No AI attribution: no `Co-Authored-By: Claude` trailers and no "Generated with Claude Code" lines in commits or PR descriptions
- GitHub CLI on a Mac: `brew install gh`, then `gh auth login` once

## Co-founders
- Gurkirat Bagri — grrcarrotb2022@gmail.com
- Fezy — faizant316 (GitHub: faizant316)
