create table if not exists public.site_access_logs (
  id bigserial primary key,
  request_id uuid not null default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  method text not null,
  path text not null,
  locale text,
  host text,
  referrer text,
  origin text,
  client_ip inet,
  device_ip inet,
  server_ip inet,
  forwarded_for text,
  country_code text,
  country text,
  region text,
  city text,
  timezone text,
  user_agent text,
  device jsonb not null default '{}',
  threat_flags text[] not null default '{}',
  is_bot boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  fingerprint_hash text not null,
  label text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_login_at timestamptz,
  signup_count integer not null default 0,
  login_count integer not null default 0,
  client_ip inet,
  device_ip inet,
  server_ip inet,
  forwarded_for text,
  country_code text,
  country text,
  region text,
  city text,
  timezone text,
  user_agent text,
  device jsonb not null default '{}',
  risk_flags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, fingerprint_hash)
);

create table if not exists public.security_events (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  severity text not null default 'info',
  client_ip inet,
  country_code text,
  user_agent text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists site_access_logs_created_idx on public.site_access_logs(created_at desc);
create index if not exists site_access_logs_ip_created_idx on public.site_access_logs(client_ip, created_at desc);
create index if not exists site_access_logs_country_created_idx on public.site_access_logs(country_code, created_at desc);
create index if not exists site_access_logs_user_created_idx on public.site_access_logs(user_id, created_at desc);
create index if not exists user_devices_user_last_seen_idx on public.user_devices(user_id, last_seen_at desc);
create index if not exists user_devices_ip_last_seen_idx on public.user_devices(client_ip, last_seen_at desc);
create index if not exists security_events_created_idx on public.security_events(created_at desc);
create index if not exists security_events_user_created_idx on public.security_events(user_id, created_at desc);

drop trigger if exists set_user_devices_updated_at on public.user_devices;
create trigger set_user_devices_updated_at
before update on public.user_devices
for each row execute function public.set_updated_at();

alter table public.site_access_logs enable row level security;
alter table public.user_devices enable row level security;
alter table public.security_events enable row level security;

drop policy if exists "admin site access read" on public.site_access_logs;
create policy "admin site access read" on public.site_access_logs
for select using (public.is_admin());

drop policy if exists "own devices read" on public.user_devices;
create policy "own devices read" on public.user_devices
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin devices write" on public.user_devices;
create policy "admin devices write" on public.user_devices
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin security events read" on public.security_events;
create policy "admin security events read" on public.security_events
for select using (public.is_admin());

create or replace function public.prune_security_logs()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.site_access_logs where created_at < now() - interval '180 days';
  delete from public.security_events where created_at < now() - interval '365 days';
end;
$$;
