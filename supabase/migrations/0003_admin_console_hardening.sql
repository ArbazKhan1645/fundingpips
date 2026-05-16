create or replace function public.prevent_profile_privilege_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if current_setting('role', true) in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  if new.role <> old.role and not public.is_admin() then
    raise exception 'admin_required';
  end if;

  return new;
end;
$$;

create or replace function public.set_admin_role_by_email(p_email citext, p_role public.user_role default 'admin')
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  if current_setting('role', true) <> 'service_role' then
    raise exception 'service_role_required';
  end if;

  if p_role not in ('admin', 'super_admin') then
    raise exception 'invalid_admin_role';
  end if;

  update public.profiles
  set role = p_role, updated_at = now()
  where email = p_email
  returning * into v_profile;

  if not found then
    raise exception 'profile_not_found';
  end if;

  return v_profile;
end;
$$;

revoke all on function public.set_admin_role_by_email(citext, public.user_role) from public;
grant execute on function public.set_admin_role_by_email(citext, public.user_role) to service_role;
