-- Vendor photos (vision §6 media, §8 "Media").
--
-- Files live in the public storage bucket vendor-media, pre-sized by the
-- upload script (scripts/upload-vendor-photos.ts) because Supabase image
-- transforms are a paid feature: each photo is a folder
-- <vendor id>/<photo id>/ holding 400.webp (grids), 1080.webp (the profile)
-- and 1600.webp (full screen). Never load a large one in a grid.
--
-- vendor_media has one row per photo: its size, a blurhash for the loading
-- placeholder, the event and venue it was taken at (the venue tag fills a
-- hall's "Real weddings here"), and the photo credit. Everyone can read
-- photos of published vendors; only server tools (the upload script with the
-- service role) can add or change them.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vendor-media', 'vendor-media', true, 5 * 1024 * 1024, array['image/webp', 'image/jpeg'])
on conflict (id) do nothing;

-- No storage.objects policies for anon or authenticated: a public bucket is
-- readable by URL, and writes need the service role.

create table public.vendor_media (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  kind text not null default 'photo' check (kind in ('photo')),
  -- Folder in the vendor-media bucket: <vendor id>/<photo id>
  storage_path text not null unique,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  blurhash text check (length(blurhash) between 6 and 100),
  is_cover boolean not null default false,
  sort_order smallint not null default 0,
  event_slug text references public.events (slug) on update cascade on delete set null,
  venue_vendor_id uuid references public.vendors (id) on delete set null,
  credit_vendor_id uuid references public.vendors (id) on delete set null,
  credit_text text check (length(btrim(credit_text)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendor_media_path_matches_vendor check (storage_path like vendor_id::text || '/%')
);

comment on table public.vendor_media is
  'Vendor photos. Files: vendor-media/<storage_path>/{400,1080,1600}.webp. venue_vendor_id tags where it was taken ("Real weddings here").';

create unique index vendor_media_one_cover on public.vendor_media (vendor_id) where is_cover;
create index vendor_media_vendor_order_idx on public.vendor_media (vendor_id, sort_order);
create index vendor_media_venue_idx on public.vendor_media (venue_vendor_id);
create index vendor_media_event_idx on public.vendor_media (event_slug);
create index vendor_media_credit_idx on public.vendor_media (credit_vendor_id);

create trigger set_updated_at before update on public.vendor_media
  for each row execute function private.set_updated_at();

alter table public.vendor_media enable row level security;

create policy "Photos of published vendors are readable by everyone" on public.vendor_media
  for select to anon, authenticated
  using (exists (
    select 1 from public.vendors v
    where v.id = vendor_media.vendor_id and v.status = 'published'
  ));

revoke all on public.vendor_media from anon, authenticated;
grant select on public.vendor_media to anon, authenticated;
