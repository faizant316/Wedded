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
- Done: Phase 1 tech setup (ESLint, Prettier, CI), the product vision, the app shell (Home, Search, Saved and Profile tabs, theme tokens, `AppText`, English/Punjabi toggle), and a local Supabase with the app's client in `src/lib/supabase.ts`.
- Open: PR #7, core UI components (Button, Chip, Card, TextField, Checkbox, StateView).
- Next (§13, week 2): schema, migrations and RLS in `supabase/migrations`, seed reference data (events and categories with Gurmukhi names and aliases); email-code login; then Home organised by event.
- Local database: `npm run db:start`, `db:status`, `db:reset`, `db:stop` (setup steps are in the README).
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
3. Before pushing, run what CI runs: `npm run lint -- --max-warnings 0`, `npm run format:check`, `npm run typecheck` (`npm run format` fixes formatting)
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
