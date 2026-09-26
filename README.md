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

Copy `.env.example` to `.env.local` and fill in the Supabase values once the project exists.

## Layout

| Path | What lives there |
| --- | --- |
| `src/app/` | Screens and navigators (Expo Router). `(tabs)/` holds Home, Search, Saved, Profile |
| `src/components/` | Reusable UI. `AppText` is the only text component: it picks the Latin or Gurmukhi font and sets line height |
| `src/constants/theme.ts` | Colour, spacing, radius and type-scale tokens from the product vision |
| `src/i18n/` | English and Punjabi strings, the `useLocale()` hook and the persisted language setting |
| `src/lib/` | Small utilities (device storage) |
| `docs/` | Plan, decisions, product vision |

## Docs

- [Project plan and checklist](docs/PROJECT_PLAN.md): every phase and task, with checkboxes
- [Product vision](docs/PRODUCT_VISION.md): how the app looks and works, screen by screen, and the November prototype plan
- [Decisions log](docs/DECISIONS.md): what we decided and why

## How we work

- Every feature gets its own branch and a pull request. The other partner reviews before merging.
- Never commit passwords or API keys. Use `.env` files (already ignored by git).
- Every task lives on the task board. Decisions go in the decisions log.
