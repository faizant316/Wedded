-- Vendors run their own menus and calendar (Town and Country feedback;
-- vision Phase 8 vendor accounts). People in vendor_members can add, change
-- and remove their vendor's menus, and mark days booked, held or open.
-- Changing the calendar stamps vendors.calendar_updated_at, so their open days
-- count as open (vendor_date_status) for the next 60 days; so does
-- touch_vendor_calendar() ("my calendar is up to date") without a change.
--
-- The read policies become one each ("published, or you run this vendor"),
-- so a vendor sees their own menus and calendar even while unpublished.

-- Menus --------------------------------------------------------------------------------------

drop policy "Menus of published vendors are readable by everyone" on public.vendor_menus;

create policy "Menus are readable when published, and by the vendor's people" on public.vendor_menus
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_menus.vendor_id and v.status = 'published'
    )
    or private.is_vendor_member(vendor_id)
  );
create policy "The vendor's people add menus" on public.vendor_menus
  for insert to authenticated
  with check (private.is_vendor_member(vendor_id));
create policy "The vendor's people change menus" on public.vendor_menus
  for update to authenticated
  using (private.is_vendor_member(vendor_id))
  with check (private.is_vendor_member(vendor_id));
create policy "The vendor's people remove menus" on public.vendor_menus
  for delete to authenticated
  using (private.is_vendor_member(vendor_id));

grant insert (
  vendor_id, name, name_pa, description, description_pa, cuisine, diet, price_from, price_unit,
  min_guests, sections, sort_order
) on public.vendor_menus to authenticated;
grant update (
  name, name_pa, description, description_pa, cuisine, diet, price_from, price_unit, min_guests,
  sections, sort_order
) on public.vendor_menus to authenticated;
grant delete on public.vendor_menus to authenticated;

-- Calendar -----------------------------------------------------------------------------------

drop policy "Calendars of published vendors are readable by everyone" on public.vendor_unavailable_days;

create policy "Calendars are readable when published, and by the vendor's people" on public.vendor_unavailable_days
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_unavailable_days.vendor_id and v.status = 'published'
    )
    or private.is_vendor_member(vendor_id)
  );
create policy "The vendor's people mark days" on public.vendor_unavailable_days
  for insert to authenticated
  with check (private.is_vendor_member(vendor_id));
create policy "The vendor's people change days" on public.vendor_unavailable_days
  for update to authenticated
  using (private.is_vendor_member(vendor_id))
  with check (private.is_vendor_member(vendor_id));
create policy "The vendor's people clear days" on public.vendor_unavailable_days
  for delete to authenticated
  using (private.is_vendor_member(vendor_id));

grant insert (vendor_id, day, part, status) on public.vendor_unavailable_days to authenticated;
grant update (status) on public.vendor_unavailable_days to authenticated;
grant delete on public.vendor_unavailable_days to authenticated;

-- Any calendar change means the calendar is current
create function private.stamp_calendar_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.vendors
  set calendar_updated_at = now()
  where id = coalesce(new.vendor_id, old.vendor_id);
  return null;
end;
$$;

create trigger stamp_calendar_updated after insert or update or delete on public.vendor_unavailable_days
  for each row execute function private.stamp_calendar_updated();

-- "My calendar is up to date" without changing a day
create function private.touch_vendor_calendar(p_vendor_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_vendor_member(p_vendor_id) then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  update public.vendors set calendar_updated_at = now() where id = p_vendor_id;
end;
$$;

create function public.touch_vendor_calendar(p_vendor_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.touch_vendor_calendar(p_vendor_id);
$$;

comment on function public.touch_vendor_calendar is
  'For a vendor''s people: confirm the calendar is up to date, so unmarked days show as open for 60 days.';

revoke all on function private.stamp_calendar_updated, private.touch_vendor_calendar,
  public.touch_vendor_calendar from public;
grant execute on function private.touch_vendor_calendar, public.touch_vendor_calendar to authenticated;
-- The read policies call it for logged-out visitors too
grant execute on function private.is_vendor_member to anon;
