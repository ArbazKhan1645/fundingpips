create or replace function public.sync_profile_kyc_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    kyc_status = new.status,
    updated_at = now()
  where id = new.user_id;

  if new.status in ('approved', 'rejected') then
    update public.kyc_documents
    set status = new.status
    where submission_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_profile_kyc_status_after_write on public.kyc_submissions;
create trigger sync_profile_kyc_status_after_write
after insert or update of status on public.kyc_submissions
for each row
execute function public.sync_profile_kyc_status();
