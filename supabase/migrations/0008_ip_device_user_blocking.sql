alter table public.profiles
  add column if not exists is_deleted boolean not null default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.profiles(id),
  add column if not exists deletion_reason text;

alter table public.user_devices
  add column if not exists is_blocked boolean not null default false,
  add column if not exists blocked_at timestamptz,
  add column if not exists blocked_by uuid references public.profiles(id),
  add column if not exists block_reason text;

create table if not exists public.blocked_ip_addresses (
  id uuid primary key default gen_random_uuid(),
  ip_address inet not null unique,
  reason text,
  is_active boolean not null default true,
  blocked_by uuid references public.profiles(id),
  blocked_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_deleted_idx on public.profiles(is_deleted, deleted_at);
create index if not exists user_devices_blocked_idx on public.user_devices(user_id, is_blocked);
create index if not exists blocked_ip_active_idx on public.blocked_ip_addresses(ip_address, is_active);

drop trigger if exists set_blocked_ip_addresses_updated_at on public.blocked_ip_addresses;
create trigger set_blocked_ip_addresses_updated_at
before update on public.blocked_ip_addresses
for each row execute function public.set_updated_at();

alter table public.blocked_ip_addresses enable row level security;

drop policy if exists "admin blocked ip all" on public.blocked_ip_addresses;
create policy "admin blocked ip all" on public.blocked_ip_addresses
for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.is_ip_blocked(p_ip inet)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.blocked_ip_addresses b
    where b.ip_address = p_ip
      and b.is_active = true
      and (b.expires_at is null or b.expires_at > now())
  )
$$;

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('role', true) in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  if (
    new.role <> old.role
    or new.is_banned <> old.is_banned
    or new.is_deleted <> old.is_deleted
    or new.kyc_status <> old.kyc_status
    or new.two_factor_required <> old.two_factor_required
    or new.email_verified_at is distinct from old.email_verified_at
    or new.deleted_at is distinct from old.deleted_at
    or new.deleted_by is distinct from old.deleted_by
  ) and not public.is_admin() then
    raise exception 'admin_required';
  end if;

  return new;
end;
$$;
