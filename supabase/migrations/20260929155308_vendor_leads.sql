-- Vendor leads: "For vendors" sign-ups and "Claim your profile" requests
-- (docs/PRODUCT_VISION.md S16g and S9 item 14).
--
-- There are no real vendors yet: onboarding starts with the founders calling
-- these people back (vision section 7, concierge onboarding). So the app only
-- ever writes a lead; nobody can read leads through the API. Founders work
-- through them in Supabase Studio and move `status` along.

create table public.vendor_leads (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'new_listing' check (kind in ('new_listing', 'claim')),
  -- For a claim: the listing they say is theirs.
  claimed_vendor_id uuid references public.vendors (id) on delete set null,
  business_name text not null check (length(btrim(business_name)) between 1 and 80),
  contact_name text not null check (length(btrim(contact_name)) between 1 and 80),
  -- What they do, in their own words ("Dhol player", "Banquet hall").
  category text check (length(btrim(category)) between 1 and 80),
  city text not null check (length(btrim(city)) between 1 and 60),
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  instagram_handle text check (instagram_handle ~ '^[A-Za-z0-9._]{1,30}$'),
  note text check (length(btrim(note)) between 1 and 1000),
  -- The app language they used, so the callback starts in the right one.
  language text not null default 'en' check (language in ('en', 'pa')),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'listed', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendor_leads_claim_has_vendor
    check (kind = 'new_listing' or claimed_vendor_id is not null)
);

comment on table public.vendor_leads is
  'Vendors who asked to be listed or claimed a listing. Anyone can add one; nobody can read them through the API. Founders follow up in Studio.';
comment on column public.vendor_leads.status is
  'new, contacted, listed or declined. Set by the founders, never by the app.';

create index vendor_leads_created_at_idx on public.vendor_leads (created_at desc);
create index vendor_leads_claimed_vendor_id_idx on public.vendor_leads (claimed_vendor_id);

create trigger set_updated_at before update on public.vendor_leads
  for each row execute function private.set_updated_at();

-- Access ------------------------------------------------------------------

alter table public.vendor_leads enable row level security;

-- Vendors can sign up without an account. Claims must point at a published
-- listing (the subquery sees only published vendors under RLS anyway).
create policy "Anyone can add a vendor lead" on public.vendor_leads
  for insert to anon, authenticated
  with check (
    status = 'new'
    and (
      claimed_vendor_id is null
      or exists (
        select 1 from public.vendors v
        where v.id = claimed_vendor_id and v.status = 'published'
      )
    )
  );

-- Insert only, and only the columns the form fills in: no select, so a lead
-- (a stranger's phone number) is never readable through the API.
revoke all on public.vendor_leads from anon, authenticated;
grant insert (
  kind, claimed_vendor_id, business_name, contact_name, category, city, phone,
  instagram_handle, note, language
) on public.vendor_leads to anon, authenticated;
