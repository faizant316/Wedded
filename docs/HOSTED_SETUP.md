# Putting the app online (hosted Supabase)

Until now everything has run on a laptop: the database, sign-in emails (in Mailpit) and inquiry emails. For the November demo the app has to work on a phone anywhere, which means one online Supabase project. This is the checklist, in order. Steps marked **(you)** need a founder at a browser; Claude Code can run the rest.

It takes about an hour. Nothing here costs money: the free Supabase plan and the free Resend plan are enough for the demo.

## 1. Create the project (you)

1. Sign in at [supabase.com](https://supabase.com) with the shared founders' account, and create an organization if there isn't one.
2. **New project**. Name: `wedding-app`. Region: **West US (North California)**, closest to our families. Pick a strong database password and save it in the shared password manager, never in the repo.
3. When it's ready, open **Project Settings → API Keys** and note:
   - the **Project URL** (`https://<project-ref>.supabase.co`) and the project ref (the part before `.supabase.co`)
   - the **publishable key** (`sb_publishable_…`): safe to put in the app
   - under **Legacy API keys**, the **service_role** key: a secret. Never paste it in chat, the app or git. It goes only in step 6 and in your shell when running the scripts.

## 2. Link and push the database

```bash
supabase login                                # opens the browser once
supabase link --project-ref <project-ref>     # asks for the database password
supabase db push --dry-run                    # lists the migrations it will run
supabase db push --include-seed               # runs them, plus the 25 sample vendors
```

`--include-seed` is right for the demo: the sample vendors (`is_sample`) fill the lists around the real hall. Leave it off for later pushes, or the seed runs again. The migrations create everything else: tables, security rules, the 101 cities and ZIP codes, the photo bucket and the nightly queued-inquiry job.

## 3. Sign-in emails (you)

In the dashboard, **Authentication**:

1. **Emails → Templates**: paste the contents of `supabase/templates/sign-in-code.html` into both **Magic link** and **Confirm signup**. Subject: `Your sign-in code`. This is what makes the email a 6-digit code instead of a link.
2. **Sign In / Providers → Email**: email provider on, **Confirm email** off, **Email OTP length** 6.
3. **URL Configuration**: nothing needed yet (we don't use links).

Supabase's built-in email only sends to members of the Supabase organization and only a few an hour. That's fine while only the two founders sign in. **Before the hall owner or anyone else signs in**, set **Emails → SMTP settings** to Resend (host `smtp.resend.com`, port `465`, user `resend`, password: a Resend API key). That needs the verified domain (Phase 5).

## 4. Email for inquiries (you, then Claude)

1. Create a free account at [resend.com](https://resend.com) with the shared founders' email, and create an API key (**Sending access** only).
2. Set the server settings (README, "Edge Functions"):

```bash
supabase secrets set RESEND_API_KEY=<key> FOUNDERS_EMAIL=<founder1>,<founder2> INQUIRY_TEST_INBOX=<the Resend account email>
```

Without a verified domain, Resend only delivers to the account's own email, so `INQUIRY_TEST_INBOX` sends every inquiry there. That's what the demo shows: the booking sheet arriving in our inbox. Once the domain is verified (Phase 5), set `INQUIRY_FROM` and remove `INQUIRY_TEST_INBOX`.

## 5. Deploy the server code

```bash
supabase functions deploy          # send-inquiry, delete-account, send-queued-inquiries
supabase functions list            # all three should say ACTIVE
```

## 6. The nightly job's keys (you, in the SQL editor)

**SQL Editor → New query**, run once:

```sql
select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
select vault.create_secret('<legacy service_role key>', 'service_role_key');
```

## 7. Add the real vendors and photos

With the hosted values in your shell only for these commands (not saved anywhere):

```bash
export SUPABASE_URL=https://<project-ref>.supabase.co
export SUPABASE_SECRET_KEY=<legacy service_role key>
npm run vendors:import -- vendor-data/<hall>.json --dry-run
npm run vendors:import -- vendor-data/<hall>.json
npm run photos:upload -- photos
```

Sample-vendor placeholder photos (`photos:samples`) are local only; on the hosted project, sample vendors show their category icon until they get photos.

## 8. Point the app at it

In `.env.local` (gitignored):

```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<sb_publishable_… key>
```

Then `npx expo start` and scan the QR code with Expo Go. If the phone isn't on the laptop's Wi-Fi, `npx expo start --tunnel`.

## 9. Check it end to end

First the automatic check, with the three values from step 1 in your shell:

```bash
export SUPABASE_URL=https://<project-ref>.supabase.co SUPABASE_SECRET_KEY=<legacy service_role key> SUPABASE_PUBLISHABLE_KEY=<sb_publishable_… key>
npm run demo:check -- --hall=<hall slug> --send
```

Fix anything marked `✗`. Then do it by hand on a phone: sign in with a founder's email (the code arrives by email), fill in About you, find the hall from Home → Reception → Banquet hall, save it, send a **Book a tour** request, and check the booking sheet arrives in the Resend account's inbox. Then **Profile → My inquiries** shows it as sent.

## Still open

- The app still runs through Expo Go and the laptop's dev server. For the demo at the hall, the phone should open the app without the laptop; decide between an EAS Update the phone opens in Expo Go and a development build before demo week (check the current Expo docs first).
- A separate development project (Phase 1, "separate development and production environments") can wait until after the demo. Until then, the local database is development.
