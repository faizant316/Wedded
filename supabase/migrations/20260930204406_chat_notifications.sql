-- Nobody misses a chat message: when a message sits unread for a few
-- minutes, the other side gets one email ("Harjit K. sent you a message...
-- reply in Wedded App"). One email per conversation per side until they catch
-- up; replying live (within the quiet minutes) sends nothing.
--
-- claim_chat_notifications() finds conversations with unread, un-notified
-- messages older than the quiet period, stamps them notified (so two runs
-- never email twice) and returns who to email. Service role only: the
-- notify-chat Edge Function calls it, and pg_cron calls that every 2 minutes.
--
-- Recipients: for a vendor, the emails of its accounts (vendor_members), or,
-- if it has none yet, its listing email when it reads email (the message then
-- invites them to claim their free account); for a family, their sign-in email.

create function public.claim_chat_notifications(p_quiet_minutes integer default 3)
returns table (
  conversation_id uuid,
  notify_side text,
  recipients text[],
  vendor_has_account boolean,
  vendor_name text,
  vendor_slug text,
  family_name text,
  unread_count integer,
  last_body text,
  last_kind text,
  notified_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  quiet interval := make_interval(mins => greatest(p_quiet_minutes, 0));
  r record;
  stamp timestamptz := now();
  side text;
  emails text[];
  has_account boolean;
begin
  for r in
    select c.id, c.vendor_id, c.family_user_id, c.family_name, v.name as vendor_name, v.slug as vendor_slug,
      exists (
        select 1 from public.messages m
        where m.conversation_id = c.id and m.sender_role = 'family'
          and m.created_at > coalesce(c.vendor_read_at, '-infinity')
          and m.created_at > coalesce(c.vendor_notified_at, '-infinity')
          and m.created_at < now() - quiet
      ) as vendor_due,
      c.family_user_id is not null and exists (
        select 1 from public.messages m
        where m.conversation_id = c.id and m.sender_role = 'vendor'
          and m.created_at > coalesce(c.family_read_at, '-infinity')
          and m.created_at > coalesce(c.family_notified_at, '-infinity')
          and m.created_at < now() - quiet
      ) as family_due
    from public.conversations c
    join public.vendors v on v.id = c.vendor_id
    where c.last_message_at > now() - interval '14 days'
      and c.last_message_at < now() - quiet
    for update of c skip locked
  loop
    foreach side in array array['vendor', 'family'] loop
      continue when (side = 'vendor' and not r.vendor_due) or (side = 'family' and not r.family_due);

      if side = 'vendor' then
        select coalesce(array_agg(u.email::text order by u.email), '{}') into emails
        from public.vendor_members vm
        join auth.users u on u.id = vm.user_id
        where vm.vendor_id = r.vendor_id and u.email is not null;
        has_account := cardinality(emails) > 0;
        if not has_account then
          select coalesce(array_agg(p.email), '{}') into emails
          from public.vendor_private p
          where p.vendor_id = r.vendor_id and p.email is not null and p.checks_email is not false;
        end if;
        update public.conversations set vendor_notified_at = stamp where id = r.id;
      else
        select coalesce(array_agg(u.email::text), '{}') into emails
        from auth.users u where u.id = r.family_user_id and u.email is not null;
        has_account := true;
        update public.conversations set family_notified_at = stamp where id = r.id;
      end if;

      return query
      select r.id, side, emails, has_account, r.vendor_name, r.vendor_slug, r.family_name,
        (select count(*)::integer from public.messages m
         where m.conversation_id = r.id
           and m.sender_role = case when side = 'vendor' then 'family' else 'vendor' end
           and m.created_at > coalesce(
             (select case when side = 'vendor' then c.vendor_read_at else c.family_read_at end
              from public.conversations c where c.id = r.id), '-infinity')),
        last.body, last.kind, stamp
      from (
        select m.body, m.kind from public.messages m
        where m.conversation_id = r.id
          and m.sender_role = case when side = 'vendor' then 'family' else 'vendor' end
        order by m.created_at desc limit 1
      ) last;
    end loop;
  end loop;
end;
$$;

comment on function public.claim_chat_notifications is
  'Service role only: conversations with messages unread for p_quiet_minutes and not yet emailed, stamped as notified, with who to email.';

revoke all on function public.claim_chat_notifications from public, anon, authenticated;
grant execute on function public.claim_chat_notifications to service_role;

create index conversations_last_message_idx on public.conversations (last_message_at);

-- Every 2 minutes (the URL and key come from Vault, as for send-queued-inquiries; README)
select cron.schedule(
  'notify-chat',
  '*/2 * * * *',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/notify-chat',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'
      )
    ),
    body := '{}'::jsonb
  );
  $job$
);
