@AGENTS.md

# Wedding Vendor Booking App

## Stack
- **Frontend**: React Native + Expo (SDK 57) with Expo Router
- **Backend/DB**: Supabase (Postgres + Auth + Storage)
- **Platforms**: iOS and Android (cross-platform first; web is secondary)

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
- Every feature or fix lives on its own branch (`feature/<name>` or `fix/<name>`)
- Open a PR for every branch; the other co-founder (Gurkirat or Fezy) must review and approve before merging
- Keep PRs small and focused — one thing per PR
- Never force-push to `main`

## Co-founders
- Gurkirat Bagri — grrcarrotb2022@gmail.com
- Fezy — faizant316 (GitHub: faizant316)
