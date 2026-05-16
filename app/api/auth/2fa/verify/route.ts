import { type NextRequest } from 'next/server';
import { requireUser } from '@/lib/backend/auth';
import { createTwoFactorCookieValue } from '@/lib/backend/two-factor-cookie';
import { decryptTotpSecret, hashBackupCode, verifyTotpCode } from '@/lib/backend/totp';
import { jsonError, jsonOk } from '@/lib/backend/security';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ('error' in auth) return jsonError(auth.error, auth.error === 'unauthorized' ? 401 : 403);

  const { code } = await request.json();
  if (!code || typeof code !== 'string') return jsonError('code_required', 400);

  const { data: secretRecord, error } = await auth.admin
    .from('two_factor_secrets')
    .select('secret_ciphertext,backup_code_hashes,confirmed_at')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (error) return jsonError(error.message, 400);
  if (!secretRecord) return jsonError('two_factor_not_configured', 400);

  const secret = decryptTotpSecret(secretRecord.secret_ciphertext);
  const cleanCode = code.trim();
  const backupHash = hashBackupCode(cleanCode);
  const backupCodes = (secretRecord.backup_code_hashes ?? []) as string[];
  const backupIndex = backupCodes.indexOf(backupHash);
  const isValid = verifyTotpCode(secret, cleanCode) || backupIndex >= 0;

  if (!isValid) return jsonError('invalid_two_factor_code', 400);

  const remainingBackupCodes = backupIndex >= 0
    ? backupCodes.filter((_, index) => index !== backupIndex)
    : backupCodes;

  const { error: updateError } = await auth.admin.from('two_factor_secrets').update({
    confirmed_at: secretRecord.confirmed_at ?? new Date().toISOString(),
    backup_code_hashes: remainingBackupCodes,
  }).eq('user_id', auth.user.id);

  if (updateError) return jsonError(updateError.message, 400);

  await auth.admin.from('profiles').update({
    two_factor_enabled: true,
    two_factor_required: false,
  }).eq('id', auth.user.id);

  const response = jsonOk({ verified: true });
  response.cookies.set('lf_2fa', await createTwoFactorCookieValue(auth.user.id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 12 * 60 * 60,
  });
  return response;
}
