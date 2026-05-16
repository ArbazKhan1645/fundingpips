-- Lordfunded demo data for Supabase SQL Editor / local Supabase.
-- Test logins after running migrations:
--   admin@lordfunded.test / Admin123!Demo
--     2FA setup key: JBSWY3DPEHPK3PXP
--   trader@lordfunded.test / Trader123!Demo
--   funded@lordfunded.test / Funded123!Demo
--     2FA setup key: JBSWY3DPEHPK3PXP
--
-- This file is for development/demo environments only.

create extension if not exists pgcrypto;

do $$
declare
  v_admin uuid := '00000000-0000-0000-0000-000000000001';
  v_super uuid := '00000000-0000-0000-0000-000000000002';
  v_trader uuid := '00000000-0000-0000-0000-000000000101';
  v_funded uuid := '00000000-0000-0000-0000-000000000102';
  v_challenge_10k uuid := '10000000-0000-0000-0000-000000000010';
  v_challenge_50k uuid := '10000000-0000-0000-0000-000000000050';
  v_coupon uuid := '20000000-0000-0000-0000-000000000001';
  v_order_1 uuid := '30000000-0000-0000-0000-000000000001';
  v_order_2 uuid := '30000000-0000-0000-0000-000000000002';
  v_account_1 uuid := '40000000-0000-0000-0000-000000000001';
  v_account_2 uuid := '40000000-0000-0000-0000-000000000002';
  v_kyc_1 uuid := '50000000-0000-0000-0000-000000000001';
  v_kyc_2 uuid := '50000000-0000-0000-0000-000000000002';
  v_ticket uuid := '60000000-0000-0000-0000-000000000001';
  v_chat uuid := '70000000-0000-0000-0000-000000000001';
begin
  alter table public.profiles disable trigger prevent_profile_privilege_escalation;

  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values
    (v_admin, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@lordfunded.test', crypt('Admin123!Demo', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"firstName":"Admin","lastName":"User","phone":"+15550000001","country":"United States"}', now(), now()),
    (v_super, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'superadmin@lordfunded.test', crypt('Super123!Demo', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"firstName":"Super","lastName":"Admin","phone":"+15550000002","country":"United States"}', now(), now()),
    (v_trader, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'trader@lordfunded.test', crypt('Trader123!Demo', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"firstName":"Demo","lastName":"Trader","phone":"+15550000101","country":"Pakistan"}', now(), now()),
    (v_funded, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'funded@lordfunded.test', crypt('Funded123!Demo', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"firstName":"Funded","lastName":"Trader","phone":"+15550000102","country":"United Arab Emirates"}', now(), now())
  on conflict (id) do update set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now();

  insert into auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values
    (v_admin, v_admin::text, v_admin, jsonb_build_object('sub', v_admin::text, 'email', 'admin@lordfunded.test'), 'email', now(), now(), now()),
    (v_super, v_super::text, v_super, jsonb_build_object('sub', v_super::text, 'email', 'superadmin@lordfunded.test'), 'email', now(), now(), now()),
    (v_trader, v_trader::text, v_trader, jsonb_build_object('sub', v_trader::text, 'email', 'trader@lordfunded.test'), 'email', now(), now(), now()),
    (v_funded, v_funded::text, v_funded, jsonb_build_object('sub', v_funded::text, 'email', 'funded@lordfunded.test'), 'email', now(), now(), now())
  on conflict (provider, provider_id) do update set
    identity_data = excluded.identity_data,
    updated_at = now();

  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    country,
    role,
    email_verified_at,
    two_factor_enabled,
    two_factor_required,
    kyc_status
  )
  values
    (v_admin, 'admin@lordfunded.test', 'Admin', 'User', '+15550000001', 'United States', 'admin', now(), true, true, 'approved'),
    (v_super, 'superadmin@lordfunded.test', 'Super', 'Admin', '+15550000002', 'United States', 'super_admin', now(), true, true, 'approved'),
    (v_trader, 'trader@lordfunded.test', 'Demo', 'Trader', '+15550000101', 'Pakistan', 'trader', now(), false, false, 'pending'),
    (v_funded, 'funded@lordfunded.test', 'Funded', 'Trader', '+15550000102', 'United Arab Emirates', 'trader', now(), true, true, 'approved')
  on conflict (id) do update set
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    country = excluded.country,
    role = excluded.role,
    email_verified_at = excluded.email_verified_at,
    two_factor_enabled = excluded.two_factor_enabled,
    two_factor_required = excluded.two_factor_required,
    kyc_status = excluded.kyc_status,
    updated_at = now();

  alter table public.profiles enable trigger prevent_profile_privilege_escalation;

  insert into public.sessions (id, user_id, refresh_token_hash, user_agent, ip, expires_at)
  values
    ('80000000-0000-0000-0000-000000000001', v_admin, encode(digest('admin-refresh-token', 'sha256'), 'hex'), 'Chrome on Windows demo admin', '127.0.0.1', now() + interval '7 days'),
    ('80000000-0000-0000-0000-000000000002', v_funded, encode(digest('funded-refresh-token', 'sha256'), 'hex'), 'Safari on iPhone demo trader', '127.0.0.1', now() + interval '7 days')
  on conflict (id) do nothing;

  insert into public.two_factor_secrets (user_id, secret_ciphertext, backup_code_hashes, confirmed_at)
  values
    (v_admin, 'JBSWY3DPEHPK3PXP', array[encode(digest('ADMIN-BACKUP-1', 'sha256'), 'hex')], now()),
    (v_funded, 'JBSWY3DPEHPK3PXP', array[encode(digest('FUNDED-BACKUP-1', 'sha256'), 'hex')], now())
  on conflict (user_id) do update set
    secret_ciphertext = excluded.secret_ciphertext,
    backup_code_hashes = excluded.backup_code_hashes,
    confirmed_at = excluded.confirmed_at;

  insert into public.challenge_tiers (
    id,
    slug,
    name,
    model,
    account_size,
    price,
    currency,
    phase1_profit_target_pct,
    phase2_profit_target_pct,
    daily_drawdown_pct,
    max_drawdown_pct,
    min_trading_days,
    profit_split_pct,
    leverage,
    platform,
    is_active,
    sort_order,
    metadata
  )
  values
    (v_challenge_10k, 'demo-10k-two-step', '$10K Demo Two Step', 'two_step', 10000, 59, 'USD', 10, 5, 5, 10, 3, 80, '1:100', array['MT5','cTrader','Match-Trader'], true, 1, '{"demo":true}'),
    (v_challenge_50k, 'demo-50k-one-step', '$50K Demo One Step', 'one_step', 50000, 299, 'USD', 10, 0, 4, 6, 3, 90, '1:100', array['MT5','cTrader'], true, 2, '{"demo":true}')
  on conflict (id) do update set
    name = excluded.name,
    price = excluded.price,
    is_active = excluded.is_active,
    metadata = excluded.metadata,
    updated_at = now();

  insert into public.coupons (
    id,
    code,
    discount_pct,
    max_redemptions,
    redeemed_count,
    starts_at,
    expires_at,
    is_active
  )
  values (v_coupon, 'DEMO25', 25, 100, 2, now() - interval '1 day', now() + interval '30 days', true)
  on conflict (id) do update set
    code = excluded.code,
    discount_pct = excluded.discount_pct,
    max_redemptions = excluded.max_redemptions,
    redeemed_count = excluded.redeemed_count,
    expires_at = excluded.expires_at,
    is_active = excluded.is_active;

  insert into public.challenge_orders (
    id,
    user_id,
    challenge_tier_id,
    coupon_id,
    amount,
    currency,
    status,
    provider,
    provider_reference,
    invoice_url,
    paid_at
  )
  values
    (v_order_1, v_trader, v_challenge_10k, v_coupon, 44.25, 'USD', 'paid', 'stripe', 'pi_demo_10k', 'https://example.com/invoice/pi_demo_10k', now() - interval '5 days'),
    (v_order_2, v_funded, v_challenge_50k, null, 299, 'USD', 'paid', 'nowpayments', 'np_demo_50k', 'https://example.com/invoice/np_demo_50k', now() - interval '18 days')
  on conflict (id) do update set
    status = excluded.status,
    provider = excluded.provider,
    provider_reference = excluded.provider_reference,
    paid_at = excluded.paid_at,
    updated_at = now();

  insert into public.trading_accounts (
    id,
    user_id,
    challenge_tier_id,
    order_id,
    account_number,
    broker,
    broker_server,
    platform,
    phase,
    status,
    starting_balance,
    balance,
    equity,
    high_watermark_equity,
    daily_start_equity,
    started_at
  )
  values
    (v_account_1, v_trader, v_challenge_10k, v_order_1, 'LF-DEMO-10001', 'Demo Broker', 'Demo-Live01', 'MT5', 'phase_1', 'active', 10000, 10320, 10380, 10425, 10250, now() - interval '5 days'),
    (v_account_2, v_funded, v_challenge_50k, v_order_2, 'LF-FUNDED-50001', 'Demo Broker', 'Demo-Live02', 'cTrader', 'funded', 'funded', 50000, 55840, 56210, 56600, 56000, now() - interval '18 days')
  on conflict (id) do update set
    status = excluded.status,
    balance = excluded.balance,
    equity = excluded.equity,
    high_watermark_equity = excluded.high_watermark_equity,
    daily_start_equity = excluded.daily_start_equity,
    updated_at = now();

  insert into public.account_equity_points (account_id, balance, equity, drawdown_pct, recorded_at)
  values
    (v_account_1, 10000, 10000, 0, now() - interval '5 days'),
    (v_account_1, 10120, 10170, 0, now() - interval '4 days'),
    (v_account_1, 10320, 10380, 0.43, now() - interval '1 day'),
    (v_account_2, 50000, 50000, 0, now() - interval '18 days'),
    (v_account_2, 54200, 54550, 0.2, now() - interval '7 days'),
    (v_account_2, 55840, 56210, 0.69, now() - interval '1 day');

  insert into public.trades (
    id,
    account_id,
    broker_trade_id,
    symbol,
    side,
    volume,
    open_price,
    close_price,
    stop_loss,
    take_profit,
    commission,
    swap,
    profit,
    opened_at,
    closed_at,
    raw_payload
  )
  values
    ('90000000-0000-0000-0000-000000000001', v_account_1, 'T-DEMO-001', 'EURUSD', 'buy', 1.00, 1.08300, 1.08710, 1.08000, 1.08800, -7, 0, 410, now() - interval '3 days', now() - interval '3 days' + interval '2 hours', '{"source":"demo"}'),
    ('90000000-0000-0000-0000-000000000002', v_account_2, 'T-DEMO-002', 'XAUUSD', 'sell', 0.50, 2338.50, 2322.10, 2347.00, 2320.00, -5, 0, 820, now() - interval '6 days', now() - interval '6 days' + interval '1 hour', '{"source":"demo"}')
  on conflict (id) do update set
    profit = excluded.profit,
    raw_payload = excluded.raw_payload;

  insert into public.kyc_submissions (
    id,
    user_id,
    provider,
    provider_reference,
    status,
    rejection_reason,
    reviewed_by,
    reviewed_at
  )
  values
    (v_kyc_1, v_trader, 'manual', 'KYC-DEMO-001', 'pending', null, null, null),
    (v_kyc_2, v_funded, 'manual', 'KYC-DEMO-002', 'approved', null, v_admin, now() - interval '12 days')
  on conflict (id) do update set
    status = excluded.status,
    reviewed_by = excluded.reviewed_by,
    reviewed_at = excluded.reviewed_at,
    updated_at = now();

  insert into public.kyc_documents (
    id,
    submission_id,
    document_type,
    storage_path,
    status
  )
  values
    ('51000000-0000-0000-0000-000000000001', v_kyc_1, 'passport', 'kyc/demo-trader/passport.png', 'pending'),
    ('51000000-0000-0000-0000-000000000002', v_kyc_1, 'proof_of_address', 'kyc/demo-trader/address.pdf', 'pending'),
    ('51000000-0000-0000-0000-000000000003', v_kyc_2, 'national_id', 'kyc/funded-trader/id.png', 'approved')
  on conflict (id) do update set
    status = excluded.status,
    storage_path = excluded.storage_path;

  insert into public.payout_requests (
    id,
    user_id,
    account_id,
    gross_amount,
    profit_split_pct,
    trader_amount,
    method,
    destination,
    status,
    admin_note,
    reviewed_by,
    reviewed_at
  )
  values
    ('52000000-0000-0000-0000-000000000001', v_funded, v_account_2, 2500, 90, 2250, 'USDT', '{"network":"TRC20","address":"TDEMO123456789"}', 'pending', null, null, null),
    ('52000000-0000-0000-0000-000000000002', v_funded, v_account_2, 1200, 90, 1080, 'bank_transfer', '{"bank":"Demo Bank","iban":"DEMO-IBAN"}', 'approved', 'Approved for demo payout.', v_admin, now() - interval '3 days')
  on conflict (id) do update set
    status = excluded.status,
    admin_note = excluded.admin_note,
    updated_at = now();

  insert into public.affiliates (user_id, referral_code, commission_pct, approved_at)
  values
    (v_admin, 'ADMINREF', 15, now()),
    (v_funded, 'FUNDEDREF', 10, now())
  on conflict (user_id) do update set
    referral_code = excluded.referral_code,
    commission_pct = excluded.commission_pct,
    approved_at = excluded.approved_at;

  insert into public.affiliate_referrals (
    id,
    affiliate_user_id,
    referred_user_id,
    order_id,
    commission_amount,
    status
  )
  values ('53000000-0000-0000-0000-000000000001', v_funded, v_trader, v_order_1, 4.43, 'pending')
  on conflict (id) do update set
    commission_amount = excluded.commission_amount,
    status = excluded.status;

  insert into public.support_tickets (
    id,
    user_id,
    subject,
    status,
    priority,
    assigned_to
  )
  values (v_ticket, v_trader, 'Need help with Phase 1 rules', 'open', 'normal', v_admin)
  on conflict (id) do update set
    status = excluded.status,
    priority = excluded.priority,
    assigned_to = excluded.assigned_to,
    updated_at = now();

  insert into public.support_messages (
    id,
    ticket_id,
    author_id,
    body,
    is_internal
  )
  values
    ('61000000-0000-0000-0000-000000000001', v_ticket, v_trader, 'Can you explain how daily drawdown is calculated?', false),
    ('61000000-0000-0000-0000-000000000002', v_ticket, v_admin, 'Daily drawdown is checked against the daily start equity and current equity.', false),
    ('61000000-0000-0000-0000-000000000003', v_ticket, v_admin, 'Demo ticket for admin QA.', true)
  on conflict (id) do update set
    body = excluded.body,
    is_internal = excluded.is_internal;

  insert into public.notifications (
    id,
    user_id,
    channel,
    title,
    body,
    metadata,
    read_at
  )
  values
    ('62000000-0000-0000-0000-000000000001', v_trader, 'in_app', 'Challenge activated', 'Your $10K demo challenge is active.', '{"account":"LF-DEMO-10001"}', null),
    ('62000000-0000-0000-0000-000000000002', v_funded, 'email', 'Payout request received', 'Your payout request is waiting for admin review.', '{"amount":2500}', null)
  on conflict (id) do update set
    title = excluded.title,
    body = excluded.body,
    metadata = excluded.metadata;

  insert into public.blog_posts (
    id,
    slug,
    title,
    excerpt,
    content,
    cover_image_url,
    status,
    author_id,
    published_at
  )
  values
    ('63000000-0000-0000-0000-000000000001', 'demo-risk-rules', 'Understanding Demo Risk Rules', 'How profit targets and drawdown checks work.', 'This demo article explains phase targets, max drawdown, daily loss limits, and payout readiness.', null, 'published', v_admin, now() - interval '2 days'),
    ('63000000-0000-0000-0000-000000000002', 'demo-payout-guide', 'Demo Payout Guide', 'How funded traders request payouts.', 'KYC and 2FA are required before payout approval.', null, 'draft', v_admin, null)
  on conflict (id) do update set
    title = excluded.title,
    excerpt = excluded.excerpt,
    content = excluded.content,
    status = excluded.status,
    updated_at = now();

  insert into public.ai_chat_sessions (
    id,
    user_id,
    visitor_id,
    title
  )
  values (v_chat, v_trader, 'demo-visitor-001', 'Challenge rules question')
  on conflict (id) do update set
    title = excluded.title,
    updated_at = now();

  insert into public.ai_chat_messages (
    id,
    session_id,
    role,
    content,
    metadata
  )
  values
    ('71000000-0000-0000-0000-000000000001', v_chat, 'user', 'What is the max drawdown rule?', '{}'),
    ('71000000-0000-0000-0000-000000000002', v_chat, 'assistant', 'Max drawdown is tier based and checked from equity against the allowed limit.', '{"model":"demo"}')
  on conflict (id) do update set
    content = excluded.content,
    metadata = excluded.metadata;

  insert into public.webhook_events (
    id,
    provider,
    event_type,
    external_id,
    payload,
    processed_at
  )
  values
    ('72000000-0000-0000-0000-000000000001', 'stripe', 'checkout.session.completed', 'evt_demo_stripe_001', '{"amount_total":4425,"currency":"usd"}', now() - interval '5 days'),
    ('72000000-0000-0000-0000-000000000002', 'broker', 'account.equity.updated', 'evt_demo_broker_001', '{"account":"LF-DEMO-10001","equity":10380}', now() - interval '1 day')
  on conflict (provider, external_id) do update set
    payload = excluded.payload,
    processed_at = excluded.processed_at;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_table,
    entity_id,
    before,
    after,
    ip,
    user_agent
  )
  values
    (v_admin, 'demo.seed', 'all', 'mock_data', null, '{"status":"inserted"}', '127.0.0.1', 'Supabase SQL seed'),
    (v_admin, 'payout.review', 'payout_requests', '52000000-0000-0000-0000-000000000002', '{"status":"pending"}', '{"status":"approved"}', '127.0.0.1', 'Supabase SQL seed');
end $$;
