-- Saved vendors (vision S15, §8 "saved vendors as one table and one policy").
--
-- A family saves a vendor for an event ("this dhol crew for the jaago"), so
-- the Saved tab can group by event. The same vendor can be saved for several
-- events (a DJ for the sangeet and the reception). event_slug is empty when
-- they saved from Search without choosing an event ("Not sure yet").
--
-- Each person sees and changes only their own saves. user_id is filled in by
-- the database from the signed-in person, and the API can't write it, so
-- nobody can save into someone else's list. Only published vendors can be
-- saved; if a vendor is unpublished later, the save stays but the vendor no
-- longer comes back, and the app shows "no longer listed".

create table public.saved_vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  event_slug text references public.events (slug) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  constraint saved_vendors_once_per_event unique nulls not distinct (user_id, vendor_id, event_slug)
);

comment on table public.saved_vendors is
  'Vendors a person saved, per event. event_slug null means "Not sure yet".';

create index saved_vendors_vendor_id_idx on public.saved_vendors (vendor_id);
create index saved_vendors_event_slug_idx on public.saved_vendors (event_slug);

alter table public.saved_vendors enable row level security;

create policy "People can read their own saves" on public.saved_vendors
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "People can save published vendors for themselves" on public.saved_vendors
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.vendors v
      where v.id = saved_vendors.vendor_id and v.status = 'published'
    )
  );

create policy "People can remove their own saves" on public.saved_vendors
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Logged-out users get nothing. Signed-in users choose only the vendor and
-- event; user_id and created_at always come from the database. No updates:
-- moving a save to another event is a remove plus a save.
revoke all on public.saved_vendors from anon, authenticated;
grant select, delete on public.saved_vendors to authenticated;
grant insert (vendor_id, event_slug) on public.saved_vendors to authenticated;
