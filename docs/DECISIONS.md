# Decisions Log

Add newest decisions at the top. Keep each entry short: what we decided, why, and who agreed.

| Date | Decision | Why | Agreed by |
| --- | --- | --- | --- |
| 2026-09-29 | Local dev database: Supabase CLI on Colima (free, headless Docker engine) | Product vision section 12: local Supabase so dev never pauses; Colima avoids Docker Desktop's app and licence terms | Kirat |
| 2026-09-29 | Supabase session stored with `expo-sqlite/localStorage`; env var is the publishable key (`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) | Expo's current Supabase guide; expo-sqlite is already installed and works in Expo Go; publishable keys replace the old anon key | Kirat |
| 2026-09-26 | Use Expo Router's JS `Tabs`, not native tabs, for the first builds | Native tabs need a development build; the November demo runs in Expo Go | |
| 2026-09-26 | Fonts: Nunito (Latin) + Mukta Mahee (Gurmukhi), loaded at runtime with `useFonts` | Works in Expo Go; Mukta Mahee is the Gurmukhi most Punjabi users already read on Android and WhatsApp | |
| 2026-09-26 | One text component (`AppText`) that picks the script's font and sets line height | Gurmukhi vowel marks clip without explicit line height; keeps the type scale in one place | |
| 2026-09-26 | i18n with `i18n-js` + `expo-localization`; language persisted in `expo-sqlite/kv-store` | Expo's recommended pair; kv-store works in Expo Go, is synchronous at startup, and can later back the Supabase session too | |
| 2026-09-26 | Light theme only until Phase 8 | Parents keep phones in light mode; halves the design and test work | |
| 2026-09-25 | Tech stack: Expo (React Native) + TypeScript + Expo Router, Supabase backend | One codebase for iOS and Android; Supabase covers auth, database, and storage (from the project plan) | |
| 2026-09-25 | Working repo name `wedding-vendor-app` until the final name is picked in Phase 5 | Don't get attached to a name before trademark and domain checks | |
