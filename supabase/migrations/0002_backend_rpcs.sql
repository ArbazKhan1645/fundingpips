create or replace function public.calculate_account_rules(p_account_id uuid)
returns table (
  account_id uuid,
  profit_target_amount numeric,
  current_profit numeric,
  current_profit_pct numeric,
  daily_loss_pct numeric,
  max_drawdown_pct numeric,
  phase_passed boolean,
  breached boolean,
  breach_reason text
)
language sql stable security definer set search_path = public as $$
  select
    a.id,
    case
      when a.phase = 'phase_1' then a.starting_balance * (ct.phase1_profit_target_pct / 100)
      when a.phase = 'phase_2' then a.starting_balance * (ct.phase2_profit_target_pct / 100)
      else 0
    end as profit_target_amount,
    a.equity - a.starting_balance as current_profit,
    ((a.equity - a.starting_balance) / nullif(a.starting_balance, 0)) * 100 as current_profit_pct,
    greatest(0, ((a.daily_start_equity - a.equity) / nullif(a.daily_start_equity, 0)) * 100) as daily_loss_pct,
    a.current_drawdown_pct as max_drawdown_pct,
    case
      when a.phase = 'phase_1' then ((a.equity - a.starting_balance) / nullif(a.starting_balance, 0)) * 100 >= ct.phase1_profit_target_pct
      when a.phase = 'phase_2' then ((a.equity - a.starting_balance) / nullif(a.starting_balance, 0)) * 100 >= ct.phase2_profit_target_pct
      when a.phase = 'funded' then false
      else false
    end as phase_passed,
    (
      greatest(0, ((a.daily_start_equity - a.equity) / nullif(a.daily_start_equity, 0)) * 100) >= ct.daily_drawdown_pct
      or a.current_drawdown_pct >= ct.max_drawdown_pct
    ) as breached,
    case
      when greatest(0, ((a.daily_start_equity - a.equity) / nullif(a.daily_start_equity, 0)) * 100) >= ct.daily_drawdown_pct then 'daily_drawdown'
      when a.current_drawdown_pct >= ct.max_drawdown_pct then 'max_drawdown'
      else null
    end as breach_reason
  from public.trading_accounts a
  join public.challenge_tiers ct on ct.id = a.challenge_tier_id
  where a.id = p_account_id
    and (a.user_id = auth.uid() or public.is_admin());
$$;

create or replace function public.record_equity_point(
  p_account_id uuid,
  p_balance numeric,
  p_equity numeric
)
returns public.trading_accounts
language plpgsql security definer set search_path = public as $$
declare
  v_account public.trading_accounts;
  v_rules record;
begin
  if not public.is_admin() then
    raise exception 'admin_required';
  end if;

  update public.trading_accounts
  set
    balance = p_balance,
    equity = p_equity,
    high_watermark_equity = greatest(high_watermark_equity, p_equity)
  where id = p_account_id
  returning * into v_account;

  if not found then
    raise exception 'account_not_found';
  end if;

  insert into public.account_equity_points(account_id, balance, equity, drawdown_pct)
  values (p_account_id, p_balance, p_equity, v_account.current_drawdown_pct);

  select * into v_rules from public.calculate_account_rules(p_account_id);

  if v_rules.breached then
    update public.trading_accounts
    set status = 'breached', breached_reason = v_rules.breach_reason, ended_at = now()
    where id = p_account_id
    returning * into v_account;
  elsif v_rules.phase_passed then
    update public.trading_accounts
    set status = 'passed'
    where id = p_account_id
    returning * into v_account;
  end if;

  return v_account;
end;
$$;

create or replace function public.request_payout(
  p_account_id uuid,
  p_gross_amount numeric,
  p_method text,
  p_destination jsonb default '{}'
)
returns public.payout_requests
language plpgsql security definer set search_path = public as $$
declare
  v_account public.trading_accounts;
  v_profile public.profiles;
  v_tier public.challenge_tiers;
  v_payout public.payout_requests;
begin
  select * into v_account from public.trading_accounts where id = p_account_id and user_id = auth.uid();
  if not found then
    raise exception 'account_not_found';
  end if;

  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile.kyc_status <> 'approved' then
    raise exception 'kyc_required';
  end if;

  if not v_profile.two_factor_enabled then
    raise exception 'two_factor_required';
  end if;

  if v_account.status not in ('funded', 'passed') then
    raise exception 'account_not_eligible';
  end if;

  select * into v_tier from public.challenge_tiers where id = v_account.challenge_tier_id;

  insert into public.payout_requests(
    user_id,
    account_id,
    gross_amount,
    profit_split_pct,
    trader_amount,
    method,
    destination
  )
  values (
    auth.uid(),
    p_account_id,
    p_gross_amount,
    coalesce(v_tier.profit_split_pct, 80),
    round(p_gross_amount * (coalesce(v_tier.profit_split_pct, 80) / 100), 2),
    p_method,
    p_destination
  )
  returning * into v_payout;

  return v_payout;
end;
$$;

create or replace function public.admin_approve_payout(
  p_payout_id uuid,
  p_approve boolean,
  p_note text default null
)
returns public.payout_requests
language plpgsql security definer set search_path = public as $$
declare
  v_payout public.payout_requests;
begin
  if not public.is_admin() then
    raise exception 'admin_required';
  end if;

  update public.payout_requests
  set
    status = case when p_approve then 'approved'::public.payout_status else 'rejected'::public.payout_status end,
    admin_note = p_note,
    reviewed_by = auth.uid(),
    reviewed_at = now()
  where id = p_payout_id
  returning * into v_payout;

  insert into public.audit_logs(actor_id, action, entity_table, entity_id, after)
  values (auth.uid(), case when p_approve then 'payout.approve' else 'payout.reject' end, 'payout_requests', p_payout_id::text, to_jsonb(v_payout));

  return v_payout;
end;
$$;
