import { type NextRequest } from 'next/server';
import { requireUser } from '@/lib/backend/auth';
import { decryptTotpSecret, verifyTotpCode } from '@/lib/backend/totp';
import { jsonError, jsonOk } from '@/lib/backend/security';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ('error' in auth) return jsonError(auth.error, auth.error === 'unauthorized' ? 401 : 403);

  const { code } = await request.json();
  if (!code || typeof code !== 'string') return jsonError('code_required', 400);

  const { data: secretRecord, error } = await auth.admin
    .from('two_factor_secrets')
    .select('secret_ciphertext')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (error) return jsonError(error.message, 400);
  if (!secretRecord) return jsonError('two_factor_not_configured', 400);
  if (!verifyTotpCode(decryptTotpSecret(secretRecord.secret_ciphertext), code)) return jsonError('invalid_two_factor_code', 400);

  await auth.admin.from('two_factor_secrets').delete().eq('user_id', auth.user.id);
  await auth.admin.from('profiles').update({ two_factor_enabled: false, two_factor_required: false }).eq('id', auth.user.id);

  const response = jsonOk({ disabled: true });
  response.cookies.set('lf_2fa', '', { path: '/', maxAge: 0 });
  return response;
}
