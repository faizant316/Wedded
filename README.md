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

## Docs

- [Project plan and checklist](docs/PROJECT_PLAN.md): every phase and task, with checkboxes
- [Decisions log](docs/DECISIONS.md): what we decided and why

## How we work

- Every feature gets its own branch and a pull request. The other partner reviews before merging.
- Never commit passwords or API keys. Use `.env` files (already ignored by git).
- Every task lives on the task board. Decisions go in the decisions log.
