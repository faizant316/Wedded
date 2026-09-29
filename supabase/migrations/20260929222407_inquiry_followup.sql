-- "Did they get back to you?" (vision S16c and §8 "Knowing whether the vendor
-- replied"). A few days after an inquiry, My inquiries asks the family:
-- Yes, booked / Yes, still deciding / No reply yet. The answer is the first
-- reliability data (vision idea 18: "Replied within a day · 11 of 14"), and
-- no-answer is unknown, never negative.
--
-- The family can write only reply_answer, only on their own sent inquiries;
-- the database stamps reply_answered_at. Everything else about an inquiry
-- stays written only by the send-inquiry Edge Function. Answers stay after
-- an account is deleted (they hold nothing about the person).

alter table public.inquiries
  add column reply_answer text check (reply_answer in ('booked', 'deciding', 'no_reply')),
  add column reply_answered_at timestamptz;

comment on column public.inquiries.reply_answer is
  'The family''s answer to "Did they get back to you?": booked, deciding (replied, still deciding) or no_reply. Null means not asked or not answered.';

create function private.stamp_reply_answer()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.reply_answer is distinct from old.reply_answer then
    if old.status <> 'sent' then
      raise exception 'Only a sent inquiry can be answered' using errcode = '22023';
    end if;
    new.reply_answered_at := case when new.reply_answer is null then null else now() end;
  end if;
  return new;
end;
$$;

create trigger stamp_reply_answer
  before update of reply_answer on public.inquiries
  for each row execute function private.stamp_reply_answer();

create policy "People can answer the follow-up on their own inquiries" on public.inquiries
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant update (reply_answer) on public.inquiries to authenticated;
