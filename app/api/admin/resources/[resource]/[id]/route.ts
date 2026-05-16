import { type NextRequest } from 'next/server';
import { getAdminResource } from '@/lib/admin/resources';
import { requireAdmin } from '@/lib/backend/auth';
import { isAdminIpAllowed, jsonError, jsonOk } from '@/lib/backend/security';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, context: { params: Promise<{ resource: string; id: string }> }) {
  if (!isAdminIpAllowed(request)) return jsonError('admin_ip_not_allowed', 403);

  const auth = await requireAdmin(request);
  if ('error' in auth) return jsonError(auth.error, auth.error === 'unauthorized' ? 401 : 403);

  const { resource, id } = await context.params;
  const config = getAdminResource(resource);
  if (!config || config.readOnly) return jsonError('resource_not_writable', 400);

  const payload = await request.json();
  if ((resource === 'users' || resource === 'admins') && typeof payload.email === 'string') {
    const { error: authError } = await auth.admin.auth.admin.updateUserById(id, { email: payload.email });
    if (authError) return jsonError(authError.message, 400);
  }

  if ((resource === 'users' || resource === 'admins') && (payload.is_banned === true || payload.is_deleted === true)) {
    await auth.admin.auth.admin.updateUserById(id, { ban_duration: '876000h' });
  }
  if ((resource === 'users' || resource === 'admins') && payload.is_banned === false && payload.is_deleted !== true) {
    await auth.admin.auth.admin.updateUserById(id, { ban_duration: 'none' });
  }

  if (resource === 'admins' && payload.role && !['admin', 'super_admin'].includes(String(payload.role))) {
    return jsonError('admin_role_required', 400);
  }

  const allowedPayload = Object.fromEntries(Object.entries(payload).filter(([key]) => config.editable.includes(key)));
  if ((resource === 'users' || resource === 'admins') && payload.is_deleted === true) {
    Object.assign(allowedPayload, {
      is_banned: true,
      deleted_at: new Date().toISOString(),
      deleted_by: auth.user.id,
    });
  }
  if (resource === 'userDevices' && payload.is_blocked === true) {
    Object.assign(allowedPayload, {
      blocked_at: new Date().toISOString(),
      blocked_by: auth.user.id,
    });
  }
  if (resource === 'blockedIps') {
    Object.assign(allowedPayload, {
      blocked_by: auth.user.id,
      blocked_at: new Date().toISOString(),
    });
  }

  const { data: before } = await auth.admin.from(config.table).select('*').eq(config.idColumn, id).single();
  const { data, error } = await auth.admin.from(config.table).update(allowedPayload).eq(config.idColumn, id).select('*').single();
  if (error) return jsonError(error.message, 400);

  await auth.admin.from('audit_logs').insert({
    actor_id: auth.user.id,
    action: `${resource}.update`,
    entity_table: config.table,
    entity_id: id,
    before,
    after: data,
  });

  return jsonOk({ data });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ resource: string; id: string }> }) {
  if (!isAdminIpAllowed(request)) return jsonError('admin_ip_not_allowed', 403);

  const auth = await requireAdmin(request);
  if ('error' in auth) return jsonError(auth.error, auth.error === 'unauthorized' ? 401 : 403);

  const { resource, id } = await context.params;
  const config = getAdminResource(resource);
  if (!config || config.readOnly) return jsonError('resource_not_writable', 400);

  const { data: before } = await auth.admin.from(config.table).select('*').eq(config.idColumn, id).single();

  if (resource === 'users' || resource === 'admins') {
    await auth.admin.auth.admin.updateUserById(id, { ban_duration: '876000h' });
    const { error } = await auth.admin
      .from(config.table)
      .update({
        is_deleted: true,
        is_banned: true,
        deleted_at: new Date().toISOString(),
        deleted_by: auth.user.id,
        deletion_reason: 'Soft deleted from admin dashboard.',
      })
      .eq(config.idColumn, id);
    if (error) return jsonError(error.message, 400);
  } else {
    const { error } = await auth.admin.from(config.table).delete().eq(config.idColumn, id);
    if (error) return jsonError(error.message, 400);
  }

  await auth.admin.from('audit_logs').insert({
    actor_id: auth.user.id,
    action: `${resource}.delete`,
    entity_table: config.table,
    entity_id: id,
    before,
  });

  return jsonOk({ ok: true });
}
