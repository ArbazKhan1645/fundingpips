create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_submission_id uuid;
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    country,
    title,
    date_of_birth,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    nationality,
    tax_country,
    preferred_platform,
    trading_experience,
    referral_source,
    accepted_terms_at,
    accepted_risk_at,
    marketing_opt_in,
    kyc_status,
    email_verified_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'firstName', new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'lastName', new.raw_user_meta_data->>'last_name', ''),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'title',
    nullif(new.raw_user_meta_data->>'dob', '')::date,
    new.raw_user_meta_data->>'addressLine1',
    new.raw_user_meta_data->>'addressLine2',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'state',
    new.raw_user_meta_data->>'postalCode',
    new.raw_user_meta_data->>'nationality',
    new.raw_user_meta_data->>'taxCountry',
    new.raw_user_meta_data->>'preferredPlatform',
    new.raw_user_meta_data->>'tradingExperience',
    new.raw_user_meta_data->>'referralSource',
    case when new.raw_user_meta_data ? 'acceptedTerms' then now() else null end,
    case when new.raw_user_meta_data ? 'acceptedRisk' then now() else null end,
    coalesce((new.raw_user_meta_data->>'marketingOptIn')::boolean, false),
    case
      when new.raw_user_meta_data ? 'idDocumentType' then 'pending'::public.verification_status
      else 'unverified'::public.verification_status
    end,
    case when new.email_confirmed_at is null then null else new.email_confirmed_at end
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(nullif(excluded.first_name, ''), public.profiles.first_name),
    last_name = coalesce(nullif(excluded.last_name, ''), public.profiles.last_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    country = coalesce(excluded.country, public.profiles.country),
    email_verified_at = excluded.email_verified_at;

  if new.raw_user_meta_data ? 'idDocumentType' then
    insert into public.kyc_submissions (
      user_id,
      provider,
      status,
      legal_first_name,
      legal_last_name,
      date_of_birth,
      residential_address,
      id_document_type,
      id_document_number,
      proof_of_address_type
    )
    values (
      new.id,
      'manual',
      'pending',
      coalesce(new.raw_user_meta_data->>'firstName', ''),
      coalesce(new.raw_user_meta_data->>'lastName', ''),
      nullif(new.raw_user_meta_data->>'dob', '')::date,
      jsonb_build_object(
        'line1', new.raw_user_meta_data->>'addressLine1',
        'line2', new.raw_user_meta_data->>'addressLine2',
        'city', new.raw_user_meta_data->>'city',
        'state', new.raw_user_meta_data->>'state',
        'postalCode', new.raw_user_meta_data->>'postalCode',
        'country', new.raw_user_meta_data->>'country'
      ),
      new.raw_user_meta_data->>'idDocumentType',
      new.raw_user_meta_data->>'idDocumentNumber',
      new.raw_user_meta_data->>'proofOfAddressType'
    )
    on conflict do nothing
    returning id into v_submission_id;
  end if;

  return new;
end;
$$;

create or replace function public.sync_profile_email_verified()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
  set email_verified_at = new.email_confirmed_at, updated_at = now()
  where id = new.id and new.email_confirmed_at is not null;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_verified on auth.users;
create trigger on_auth_user_email_verified
after update of email_confirmed_at on auth.users
for each row
when (new.email_confirmed_at is not null)
execute function public.sync_profile_email_verified();
