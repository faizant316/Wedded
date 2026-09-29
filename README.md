# Wedding Vendor App

> Working name. The final name is picked in Phase 5 (see [Name Ideas](docs/PROJECT_PLAN.md#ongoing-name-ideas)).

A cross-platform mobile app (iOS and Android) for finding and booking every wedding vendor, organized by event: roka, mehndi, jaago, anand karaj, reception, and more.

- **Founders:** Kirat and Fezy (50/50)
- **Launch market:** Northern California Punjabi weddings (510, 916, 408, 209, 530)
- **Approach:** Build the app and prove it works with sample vendors first. Handle the name, LLC, and other official steps once the app is running.

## Stack

| Layer | Tool |
| --- | --- |
| App | Expo (React Native), TypeScript, Expo Router |
| Backend | Supabase (auth, Postgres, file storage) |
| Code style | ESLint and Prettier |
| Builds | EAS Build (TestFlight and Play internal testing) |
| Design | Figma |

## Run it

```bash
npm install
npx expo start        # then scan the QR code with Expo Go on your phone
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run format        # Prettier (format:check runs in CI)
```

### Local database (Supabase)

Development runs on a local Supabase in Docker, so the dev database never pauses. One-time setup on a Mac:

```bash
brew install colima docker supabase/tap/supabase
colima start --cpu 4 --memory 6 --disk 40   # Docker engine; run again after a restart
```

Then, from the repo:

```bash
npm run db:start      # starts Supabase locally (first run downloads a few GB)
npm run db:status     # shows the local URL and publishable key
npm run db:reset      # rebuilds the database from supabase/migrations and seed.sql
npm run db:test       # runs the database tests in supabase/tests
npm run db:types      # regenerates src/types/database.ts after a schema change
npm run db:stop
```

Copy `.env.example` to `.env.local` and fill in the two values from `npm run db:status`. To test on a phone with Expo Go, use your Mac's Wi-Fi IP instead of `127.0.0.1` (`ipconfig getifaddr en0`). Supabase Studio, a web UI for the local database, is at http://127.0.0.1:54323. Emails the local database sends (sign-in codes) land in Mailpit at http://127.0.0.1:54324, not in a real inbox.

## Layout

| Path | What lives there |
| --- | --- |
| `src/app/` | Screens and navigators (Expo Router). `(tabs)/` holds Home, Search, Saved, Profile |
| `src/components/` | Reusable UI. `AppText` is the only text component: it picks the Latin or Gurmukhi font and sets line height |
| `src/constants/theme.ts` | Colour, spacing, radius and type-scale tokens from the product vision |
| `src/i18n/` | English and Punjabi strings, the `useLocale()` hook and the persisted language setting |
| `src/lib/` | Small utilities (device storage, the Supabase client) |
| `src/types/database.ts` | TypeScript types generated from the database (`npm run db:types`); don't edit by hand |
| `supabase/migrations/` | Every database change, in order. Reference data (events, categories) lives here so production gets it too |
| `supabase/tests/` | Database tests (pgTAP): data completeness and what logged-out and signed-in users can do |
| `docs/` | Plan, decisions, product vision |

## Docs

- [Project plan and checklist](docs/PROJECT_PLAN.md): every phase and task, with checkboxes
- [Product vision](docs/PRODUCT_VISION.md): how the app looks and works, screen by screen, and the November prototype plan
- [Decisions log](docs/DECISIONS.md): what we decided and why

## How we work

- Every feature gets its own branch and a pull request. It merges itself once the checks pass; open it as a draft if you want the other partner to look first.
- Never commit passwords or API keys. Use `.env` files (already ignored by git).
- Every task lives on the task board. Decisions go in the decisions log.
