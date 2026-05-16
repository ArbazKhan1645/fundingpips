create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.user_role as enum ('trader', 'admin', 'super_admin');
create type public.verification_status as enum ('unverified', 'pending', 'approved', 'rejected');
create type public.challenge_model as enum ('instant', 'one_step', 'two_step');
create type public.account_phase as enum ('phase_1', 'phase_2', 'funded');
create type public.account_status as enum ('pending', 'active', 'passed', 'breached', 'funded', 'suspended', 'closed');
create type public.payment_status as enum ('draft', 'pending', 'paid', 'failed', 'refunded', 'cancelled');
create type public.payout_status as enum ('pending', 'approved', 'rejected', 'processing', 'paid', 'cancelled');
create type public.ticket_status as enum ('open', 'pending', 'resolved', 'closed');
create type public.notification_channel as enum ('in_app', 'email', 'sms', 'webhook');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  first_name text not null default '',
  last_name text not null default '',
  title text,
  date_of_birth date,
  phone text,
  country text,
  avatar_url text,
  role public.user_role not null default 'trader',
  is_banned boolean not null default false,
  email_verified_at timestamptz,
  two_factor_enabled boolean not null default false,
  two_factor_required boolean not null default false,
  kyc_status public.verification_status not null default 'unverified',
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  refresh_token_hash text not null,
  user_agent text,
  ip inet,
  revoked_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.two_factor_secrets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  secret_ciphertext text not null,
  backup_code_hashes text[] not null default '{}',
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.challenge_tiers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  model public.challenge_model not null default 'two_step',
  account_size numeric(14,2) not null check (account_size > 0),
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'USD',
  phase1_profit_target_pct numeric(5,2) not null default 8,
  phase2_profit_target_pct numeric(5,2) not null default 5,
  daily_drawdown_pct numeric(5,2) not null default 5,
  max_drawdown_pct numeric(5,2) not null default 10,
  min_trading_days integer not null default 0,
  duration_days integer,
  profit_split_pct numeric(5,2) not null default 80,
  leverage text not null default '1:100',
  platform text[] not null default array['MT5'],
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  discount_pct numeric(5,2),
  discount_amount numeric(12,2),
  max_redemptions integer,
  redeemed_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (discount_pct is not null or discount_amount is not null)
);

create table public.challenge_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  challenge_tier_id uuid not null references public.challenge_tiers(id),
  coupon_id uuid references public.coupons(id),
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  status public.payment_status not null default 'draft',
  provider text,
  provider_reference text,
  invoice_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trading_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  challenge_tier_id uuid references public.challenge_tiers(id),
  order_id uuid references public.challenge_orders(id),
  account_number text unique,
  broker text,
  broker_server text,
  platform text not null default 'MT5',
  phase public.account_phase not null default 'phase_1',
  status public.account_status not null default 'pending',
  starting_balance numeric(14,2) not null,
  balance numeric(14,2) not null,
  equity numeric(14,2) not null,
  high_watermark_equity numeric(14,2) not null,
  daily_start_equity numeric(14,2) not null,
  current_profit numeric(14,2) generated always as (equity - starting_balance) stored,
  current_drawdown_pct numeric(8,4) generated always as (
    case when high_watermark_equity > 0
      then greatest(0, ((high_watermark_equity - equity) / high_watermark_equity) * 100)
      else 0
    end
  ) stored,
  breached_reason text,
  funded_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.account_equity_points (
  id bigserial primary key,
  account_id uuid not null references public.trading_accounts(id) on delete cascade,
  balance numeric(14,2) not null,
  equity numeric(14,2) not null,
  drawdown_pct numeric(8,4) not null default 0,
  recorded_at timestamptz not null default now()
);

create table public.trades (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.trading_accounts(id) on delete cascade,
  broker_trade_id text,
  symbol text not null,
  side text not null check (side in ('buy', 'sell')),
  volume numeric(16,4) not null,
  open_price numeric(18,8) not null,
  close_price numeric(18,8),
  stop_loss numeric(18,8),
  take_profit numeric(18,8),
  commission numeric(12,2) not null default 0,
  swap numeric(12,2) not null default 0,
  profit numeric(14,2) not null default 0,
  opened_at timestamptz not null,
  closed_at timestamptz,
  raw_payload jsonb not null default '{}',
  unique (account_id, broker_trade_id)
);

create table public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text,
  provider_reference text,
  status public.verification_status not null default 'pending',
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.kyc_submissions(id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  status public.verification_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  account_id uuid not null references public.trading_accounts(id) on delete restrict,
  gross_amount numeric(14,2) not null check (gross_amount > 0),
  profit_split_pct numeric(5,2) not null,
  trader_amount numeric(14,2) not null,
  method text not null,
  destination jsonb not null default '{}',
  status public.payout_status not null default 'pending',
  admin_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.affiliates (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  referral_code citext not null unique,
  commission_pct numeric(5,2) not null default 10,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_user_id uuid not null references public.profiles(id) on delete restrict,
  referred_user_id uuid not null references public.profiles(id) on delete restrict,
  order_id uuid references public.challenge_orders(id),
  commission_amount numeric(12,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (affiliate_user_id, referred_user_id)
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  status public.ticket_status not null default 'open',
  priority text not null default 'normal',
  assigned_to uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  channel public.notification_channel not null default 'in_app',
  title text not null,
  body text not null,
  metadata jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  cover_image_url text,
  status text not null default 'draft',
  author_id uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  visitor_id text,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text not null,
  external_id text,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, external_id)
);

create table public.audit_logs (
  id bigserial primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_table text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index on public.profiles(role);
create index on public.trading_accounts(user_id, status);
create index on public.challenge_orders(user_id, status);
create index on public.trades(account_id, opened_at desc);
create index on public.account_equity_points(account_id, recorded_at desc);
create index on public.payout_requests(user_id, status);
create index on public.notifications(user_id, read_at);
create index on public.audit_logs(actor_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_challenge_tiers_updated_at before update on public.challenge_tiers for each row execute function public.set_updated_at();
create trigger set_challenge_orders_updated_at before update on public.challenge_orders for each row execute function public.set_updated_at();
create trigger set_trading_accounts_updated_at before update on public.trading_accounts for each row execute function public.set_updated_at();
create trigger set_kyc_submissions_updated_at before update on public.kyc_submissions for each row execute function public.set_updated_at();
create trigger set_payout_requests_updated_at before update on public.payout_requests for each row execute function public.set_updated_at();
create trigger set_support_tickets_updated_at before update on public.support_tickets for each row execute function public.set_updated_at();
create trigger set_blog_posts_updated_at before update on public.blog_posts for each row execute function public.set_updated_at();
create trigger set_ai_chat_sessions_updated_at before update on public.ai_chat_sessions for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone, country, title, date_of_birth, email_verified_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'firstName', new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'lastName', new.raw_user_meta_data->>'last_name', ''),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'title',
    nullif(new.raw_user_meta_data->>'dob', '')::date,
    case when new.email_confirmed_at is null then null else new.email_confirmed_at end
  )
  on conflict (id) do update set
    email = excluded.email,
    email_verified_at = excluded.email_verified_at;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.two_factor_secrets enable row level security;
alter table public.challenge_tiers enable row level security;
alter table public.coupons enable row level security;
alter table public.challenge_orders enable row level security;
alter table public.trading_accounts enable row level security;
alter table public.account_equity_points enable row level security;
alter table public.trades enable row level security;
alter table public.kyc_submissions enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.payout_requests enable row level security;
alter table public.affiliates enable row level security;
alter table public.affiliate_referrals enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.blog_posts enable row level security;
alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;
alter table public.webhook_events enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.current_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role() in ('admin', 'super_admin'), false)
$$;

create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles admin all" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.prevent_profile_privilege_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role <> old.role and not public.is_admin() then
    raise exception 'admin_required';
  end if;
  return new;
end;
$$;

create trigger prevent_profile_privilege_escalation
before update on public.profiles
for each row execute function public.prevent_profile_privilege_escalation();

create policy "public active challenges" on public.challenge_tiers for select using (is_active = true or public.is_admin());
create policy "admin challenge write" on public.challenge_tiers for all using (public.is_admin()) with check (public.is_admin());

create policy "own orders" on public.challenge_orders for select using (user_id = auth.uid() or public.is_admin());
create policy "own order insert" on public.challenge_orders for insert with check (user_id = auth.uid());
create policy "admin order write" on public.challenge_orders for all using (public.is_admin()) with check (public.is_admin());

create policy "own accounts" on public.trading_accounts for select using (user_id = auth.uid() or public.is_admin());
create policy "admin accounts write" on public.trading_accounts for all using (public.is_admin()) with check (public.is_admin());

create policy "own equity points" on public.account_equity_points for select using (
  exists (select 1 from public.trading_accounts a where a.id = account_id and (a.user_id = auth.uid() or public.is_admin()))
);
create policy "admin equity write" on public.account_equity_points for all using (public.is_admin()) with check (public.is_admin());

create policy "own trades" on public.trades for select using (
  exists (select 1 from public.trading_accounts a where a.id = account_id and (a.user_id = auth.uid() or public.is_admin()))
);
create policy "admin trades write" on public.trades for all using (public.is_admin()) with check (public.is_admin());

create policy "own kyc" on public.kyc_submissions for select using (user_id = auth.uid() or public.is_admin());
create policy "own kyc insert" on public.kyc_submissions for insert with check (user_id = auth.uid());
create policy "admin kyc write" on public.kyc_submissions for all using (public.is_admin()) with check (public.is_admin());

create policy "kyc document owner read" on public.kyc_documents for select using (
  exists (select 1 from public.kyc_submissions s where s.id = submission_id and (s.user_id = auth.uid() or public.is_admin()))
);
create policy "kyc document owner insert" on public.kyc_documents for insert with check (
  exists (select 1 from public.kyc_submissions s where s.id = submission_id and s.user_id = auth.uid())
);
create policy "admin kyc document write" on public.kyc_documents for all using (public.is_admin()) with check (public.is_admin());

create policy "own payouts" on public.payout_requests for select using (user_id = auth.uid() or public.is_admin());
create policy "own payout insert" on public.payout_requests for insert with check (user_id = auth.uid());
create policy "admin payout write" on public.payout_requests for all using (public.is_admin()) with check (public.is_admin());

create policy "own affiliate" on public.affiliates for select using (user_id = auth.uid() or public.is_admin());
create policy "admin affiliates" on public.affiliates for all using (public.is_admin()) with check (public.is_admin());
create policy "own referrals" on public.affiliate_referrals for select using (affiliate_user_id = auth.uid() or referred_user_id = auth.uid() or public.is_admin());
create policy "admin referrals" on public.affiliate_referrals for all using (public.is_admin()) with check (public.is_admin());

create policy "own tickets" on public.support_tickets for select using (user_id = auth.uid() or assigned_to = auth.uid() or public.is_admin());
create policy "own ticket insert" on public.support_tickets for insert with check (user_id = auth.uid());
create policy "admin tickets" on public.support_tickets for all using (public.is_admin()) with check (public.is_admin());
create policy "ticket messages read" on public.support_messages for select using (
  exists (select 1 from public.support_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or t.assigned_to = auth.uid() or public.is_admin()))
);
create policy "ticket messages insert" on public.support_messages for insert with check (
  author_id = auth.uid() and exists (select 1 from public.support_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or t.assigned_to = auth.uid() or public.is_admin()))
);

create policy "own notifications" on public.notifications for select using (user_id = auth.uid() or public.is_admin());
create policy "own notification update" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin notifications" on public.notifications for all using (public.is_admin()) with check (public.is_admin());

create policy "published blog read" on public.blog_posts for select using (status = 'published' or public.is_admin());
create policy "admin blog write" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());

create policy "own chat sessions" on public.ai_chat_sessions for select using (user_id = auth.uid() or user_id is null or public.is_admin());
create policy "chat session insert" on public.ai_chat_sessions for insert with check (user_id = auth.uid() or user_id is null);
create policy "own chat messages" on public.ai_chat_messages for select using (
  exists (select 1 from public.ai_chat_sessions s where s.id = session_id and (s.user_id = auth.uid() or s.user_id is null or public.is_admin()))
);
create policy "chat message insert" on public.ai_chat_messages for insert with check (
  exists (select 1 from public.ai_chat_sessions s where s.id = session_id and (s.user_id = auth.uid() or s.user_id is null))
);

create policy "admin only coupons" on public.coupons for all using (public.is_admin()) with check (public.is_admin());
create policy "admin only webhook events" on public.webhook_events for all using (public.is_admin()) with check (public.is_admin());
create policy "admin audit read" on public.audit_logs for select using (public.is_admin());

insert into public.challenge_tiers
  (slug, name, model, account_size, price, phase1_profit_target_pct, phase2_profit_target_pct, daily_drawdown_pct, max_drawdown_pct, min_trading_days, profit_split_pct, platform, sort_order)
values
  ('5k-two-step', '$5K Two Step', 'two_step', 5000, 29, 10, 5, 5, 10, 3, 80, array['MT5','cTrader','Match-Trader'], 10),
  ('10k-two-step', '$10K Two Step', 'two_step', 10000, 59, 10, 5, 5, 10, 3, 80, array['MT5','cTrader','Match-Trader'], 20),
  ('25k-two-step', '$25K Two Step', 'two_step', 25000, 149, 10, 5, 5, 10, 3, 80, array['MT5','cTrader','Match-Trader'], 30),
  ('50k-one-step', '$50K One Step', 'one_step', 50000, 299, 10, 0, 4, 6, 3, 90, array['MT5','cTrader'], 40),
  ('100k-instant', '$100K Instant', 'instant', 100000, 599, 0, 0, 3, 5, 0, 95, array['MT5','cTrader'], 50)
on conflict (slug) do nothing;
