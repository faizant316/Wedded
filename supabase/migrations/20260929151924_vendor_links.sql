-- Links between vendors (vision §6 and §7 `vendor_links`):
--
-- approved_at   the vendor (a caterer) is on the venue's approved list. Shown
--               as "Approved caterers" on the hall and "Approved at N venues"
--               on the caterer. "Can we bring our own caterer?" is the most
--               common booking dead-end in NorCal Punjabi weddings (§6).
-- worked_with   the two have worked together (a decorator at a hall).
--
-- A link shows only when both sides have confirmed it (confirmed_by_both), so
-- a caterer can't claim a hall that never approved them. Founders record the
-- confirmations for now; vendor accounts come in Phase 8. Everyone can read
-- confirmed links between published vendors; nobody writes through the API.

create table public.vendor_links (
  id uuid primary key default gen_random_uuid(),
  -- For approved_at: the venue. For worked_with: either side.
  venue_vendor_id uuid not null references public.vendors (id) on delete cascade,
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  kind text not null check (kind in ('approved_at', 'worked_with')),
  confirmed_by_venue boolean not null default false,
  confirmed_by_vendor boolean not null default false,
  confirmed_by_both boolean generated always as (confirmed_by_venue and confirmed_by_vendor) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendor_links_not_self check (venue_vendor_id <> vendor_id),
  constraint vendor_links_once unique (venue_vendor_id, vendor_id, kind)
);

comment on table public.vendor_links is
  'Approved caterers at a hall, and vendors who worked together. Shown only when confirmed by both sides.';

create index vendor_links_vendor_id_idx on public.vendor_links (vendor_id);

create trigger set_updated_at before update on public.vendor_links
  for each row execute function private.set_updated_at();

alter table public.vendor_links enable row level security;

create policy "Confirmed links between published vendors are readable by everyone" on public.vendor_links
  for select to anon, authenticated
  using (
    confirmed_by_both
    and exists (select 1 from public.vendors v where v.id = vendor_links.venue_vendor_id and v.status = 'published')
    and exists (select 1 from public.vendors v where v.id = vendor_links.vendor_id and v.status = 'published')
  );

revoke all on public.vendor_links from anon, authenticated;
grant select on public.vendor_links to anon, authenticated;
