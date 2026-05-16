import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/backend/auth';
import { jsonError, jsonOk } from '@/lib/backend/security';
import { sendTransactionalEmail } from '@/lib/backend/notifications';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return jsonError(auth.error, auth.error === 'unauthorized' ? 401 : 403);

  const { id } = await context.params;
  const payload = await request.json();
  const status = String(payload.status);
  if (!['approved', 'rejected'].includes(status)) return jsonError('invalid_kyc_status', 400);

  const { data: before } = await auth.admin.from('kyc_submissions').select('*').eq('id', id).single();
  const { data, error } = await auth.admin
    .from('kyc_submissions')
    .update({
      status,
      rejection_reason: status === 'rejected' ? payload.rejectionReason ?? 'Documents could not be verified.' : null,
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, profiles(email,first_name)')
    .single();

  if (error) return jsonError(error.message, 400);

  await auth.admin.from('audit_logs').insert({
    actor_id: auth.user.id,
    action: `kyc.${status}`,
    entity_table: 'kyc_submissions',
    entity_id: id,
    before,
    after: data,
  });

  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  if (profile?.email) {
    try {
      await sendTransactionalEmail({
        to: profile.email,
        subject: status === 'approved' ? 'Your Lordfunded verification is approved' : 'Your Lordfunded verification needs attention',
        text: status === 'approved'
          ? 'Your KYC verification has been approved. You can now access your trader dashboard.'
          : `Your KYC verification was rejected. Reason: ${payload.rejectionReason ?? 'Documents could not be verified.'}`,
      });
    } catch {
      await auth.admin.from('audit_logs').insert({
        actor_id: auth.user.id,
        action: 'kyc.email_failed',
        entity_table: 'kyc_submissions',
        entity_id: id,
        after: { status },
      });
    }
  }

  return jsonOk({ data });
}
