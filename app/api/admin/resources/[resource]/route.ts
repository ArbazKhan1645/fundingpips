import { type NextRequest } from 'next/server';
import { getAdminResource } from '@/lib/admin/resources';
import { requireAdmin } from '@/lib/backend/auth';
import { isAdminIpAllowed, jsonError, jsonOk } from '@/lib/backend/security';
import { sendSms, sendTransactionalEmail } from '@/lib/backend/notifications';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  if (!isAdminIpAllowed(request)) return jsonError('admin_ip_not_allowed', 403);

  const auth = await requireAdmin(request);
  if ('error' in auth) return jsonError(auth.error, auth.error === 'unauthorized' ? 401 : 403);

  const { resource } = await context.params;
  const config = getAdminResource(resource);
  if (!config) return jsonError('unknown_resource', 404);

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const pageSize = Math.min(100, Math.max(5, Number(url.searchParams.get('pageSize') ?? 20)));
  const search = url.searchParams.get('search')?.trim();
  const filterField = url.searchParams.get('filterField')?.trim();
  const filterValue = url.searchParams.get('filterValue')?.trim();
  const sortBy = url.searchParams.get('sortBy')?.trim() || config.idColumn;
  const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const sortableColumns = new Set([...config.columns, ...config.editable, config.idColumn, 'created_at', 'updated_at']);

  let query = auth.admin
    .from(config.table)
    .select(config.columns.join(','), { count: 'exact' })
    .range(from, to)
    .order(sortableColumns.has(sortBy) ? sortBy : config.idColumn, { ascending: sortOrder === 'asc' });

  if (search && config.searchable.length) {
    query = query.or(config.searchable.map((column) => `${column}.ilike.%${search}%`).join(','));
  }

  for (const fixedFilter of config.fixedFilters ?? []) {
    query = query.in(fixedFilter.column, fixedFilter.values);
  }

  if (filterField && filterValue && config.filterOptions?.[filterField]?.includes(filterValue)) {
    if (filterValue === 'null') {
      query = query.is(filterField, null);
    } else {
      const normalizedFilterValue = filterValue === 'true' ? true : filterValue === 'false' ? false : filterValue;
      query = query.eq(filterField, normalizedFilterValue);
    }
  }

  const { data, error, count } = await query;
  if (error) return jsonError('Unable to load admin resource.', 500);

  return jsonOk({
    data,
    page,
    pageSize,
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    config,
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  if (!isAdminIpAllowed(request)) return jsonError('admin_ip_not_allowed', 403);

  const auth = await requireAdmin(request);
  if ('error' in auth) return jsonError(auth.error, auth.error === 'unauthorized' ? 401 : 403);

  const { resource } = await context.params;
  const config = getAdminResource(resource);
  if (!config || config.readOnly) return jsonError('resource_not_writable', 400);

  const payload = await request.json();

  if (resource === 'users' || resource === 'admins') {
    if (!payload.email || !payload.password) return jsonError('email_and_password_required', 400);

    if (resource === 'admins' && !['admin', 'super_admin'].includes(String(payload.role))) {
      return jsonError('admin_role_required', 400);
    }

    const { data: authUser, error: authError } = await auth.admin.auth.admin.createUser({
      email: String(payload.email),
      password: String(payload.password),
      email_confirm: true,
      user_metadata: {
        firstName: payload.first_name ?? '',
        lastName: payload.last_name ?? '',
        phone: payload.phone ?? '',
        country: payload.country ?? '',
        addressLine1: payload.address_line1 ?? '',
        city: payload.city ?? '',
        nationality: payload.nationality ?? '',
        preferredPlatform: payload.preferred_platform ?? '',
        tradingExperience: payload.trading_experience ?? '',
      },
    });

    if (authError || !authUser.user) return jsonError(authError?.message ?? 'Unable to create auth user.', 400);

    const profileUpdate = Object.fromEntries(
      Object.entries(payload).filter(([key]) => config.editable.includes(key) && key !== 'password')
    );

    const { data, error } = await auth.admin
      .from(config.table)
      .upsert({
        id: authUser.user.id,
        email: String(payload.email),
        first_name: payload.first_name ?? '',
        last_name: payload.last_name ?? '',
        ...profileUpdate,
      })
      .select('*')
      .single();

    if (error) return jsonError(error.message, 400);

    await auth.admin.from('audit_logs').insert({
      actor_id: auth.user.id,
      action: `${resource}.create`,
      entity_table: config.table,
      entity_id: String(data[config.idColumn]),
      after: data,
    });

    return jsonOk({ data }, { status: 201 });
  }

  const allowedPayload = Object.fromEntries(
    Object.entries(payload).filter(([key]) => config.editable.includes(key) || key === config.idColumn)
  );
  if (resource === 'blockedIps') {
    Object.assign(allowedPayload, {
      blocked_by: auth.user.id,
      blocked_at: new Date().toISOString(),
    });
  }

  const { data, error } = await auth.admin.from(config.table).insert(allowedPayload).select('*').single();
  if (error) return jsonError(error.message, 400);

  if (resource === 'notifications') {
    try {
      const { data: recipient } = data.user_id
        ? await auth.admin.from('profiles').select('email,phone').eq('id', data.user_id).single()
        : { data: null };

      if (data.channel === 'email' && recipient?.email) {
        await sendTransactionalEmail({
          to: recipient.email,
          subject: data.title,
          text: data.body,
        });
      }

      if (data.channel === 'sms' && recipient?.phone) {
        await sendSms({ to: recipient.phone, body: data.body });
      }
    } catch (notificationError) {
      await auth.admin.from('audit_logs').insert({
        actor_id: auth.user.id,
        action: 'notifications.provider_failed',
        entity_table: config.table,
        entity_id: String(data[config.idColumn]),
        after: { error: notificationError instanceof Error ? notificationError.message : 'provider_failed' },
      });
    }
  }

  await auth.admin.from('audit_logs').insert({
    actor_id: auth.user.id,
    action: `${resource}.create`,
    entity_table: config.table,
    entity_id: String(data[config.idColumn]),
    after: data,
  });

  return jsonOk({ data }, { status: 201 });
}
