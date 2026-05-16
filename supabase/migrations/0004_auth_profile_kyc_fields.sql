alter table public.profiles
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists postal_code text,
  add column if not exists nationality text,
  add column if not exists tax_country text,
  add column if not exists preferred_platform text,
  add column if not exists trading_experience text,
  add column if not exists referral_source text,
  add column if not exists accepted_terms_at timestamptz,
  add column if not exists accepted_risk_at timestamptz,
  add column if not exists marketing_opt_in boolean not null default false;

alter table public.kyc_submissions
  add column if not exists legal_first_name text,
  add column if not exists legal_last_name text,
  add column if not exists date_of_birth date,
  add column if not exists residential_address jsonb not null default '{}',
  add column if not exists id_document_type text,
  add column if not exists id_document_number text,
  add column if not exists proof_of_address_type text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kyc-documents',
  'kyc-documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "kyc docs owner upload"
on storage.objects for insert
with check (
  bucket_id = 'kyc-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "kyc docs owner read"
on storage.objects for select
using (
  bucket_id = 'kyc-documents'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin()
  )
);

create policy "kyc docs admin update"
on storage.objects for update
using (bucket_id = 'kyc-documents' and public.is_admin())
with check (bucket_id = 'kyc-documents' and public.is_admin());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
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
    case when new.email_confirmed_at is null then null else new.email_confirmed_at end
  )
  on conflict (id) do update set
    email = excluded.email,
    phone = coalesce(excluded.phone, public.profiles.phone),
    country = coalesce(excluded.country, public.profiles.country),
    email_verified_at = excluded.email_verified_at;
  return new;
end;
$$;
