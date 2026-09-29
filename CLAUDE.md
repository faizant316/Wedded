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
- Vendor tables: `vendors` (public listing; PostGIS `location` is the city centre point for home-based vendors, and `address_line` is only allowed when `address_visibility` is public), `vendor_private` (email, exact address; RLS on with zero policies and no grants, so the API can never read it), `vendor_categories` (up to 3, position 1 is primary) and `vendor_events`. 9 sample vendors in `supabase/seed.sql` (local only, `is_sample`). Vendor-written text has `_pa` columns (`name_pa`, `bio_pa`) instead of LocalizedText, so a Punjabi-only bio is possible.
- CI (`.github/workflows/ci.yml`) also rebuilds the database from the migrations and runs the pgTAP tests, `db lint` and the advisors, and fails on stale `src/types/database.ts`. Auto-merge waits for it.
- Login backend: email 6-digit code (`signInWithOtp` then `verifyOtp` with `type: 'email'`; template in `supabase/templates/sign-in-code.html`) and `profiles` (full_name, city, phone in E.164; one row per person, created by the About you form). Email is not in `profiles`: it's the sign-in email in `auth.users`. `adult_confirmed_at` is stamped by the database; the API can write only id, full_name, city and phone. Upsert works. No profile row after sign-in means show About you.
- Next (§13, week 2): login screens (S13 auth sheet, S14 email code, About you wired to `profiles`) and a session provider; Home organised by event and the Event page (in progress on another branch). Later: `cities` table so centre points come from data, vendor media, the `search_vendors` RPC (§8).
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
