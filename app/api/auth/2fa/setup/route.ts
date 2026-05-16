import { randomBytes } from 'node:crypto';
import { type NextRequest } from 'next/server';
import { requireUser } from '@/lib/backend/auth';
import { jsonError, jsonOk } from '@/lib/backend/security';
import { createOtpAuthUri, encryptTotpSecret, generateTotpSecret, hashBackupCode } from '@/lib/backend/totp';

export const runtime = 'nodejs';

function makeBackupCodes() {
  return Array.from({ length: 8 }, () => randomBytes(4).toString('hex').toUpperCase());
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ('error' in auth) return jsonError(auth.error, auth.error === 'unauthorized' ? 401 : 403);

  const { data: existing, error: existingError } = await auth.admin
    .from('two_factor_secrets')
    .select('confirmed_at')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (existingError) return jsonError(existingError.message, 400);
  if (existing?.confirmed_at) return jsonOk({ enabled: true });

  const secret = generateTotpSecret();
  const backupCodes = makeBackupCodes();
  const { error } = await auth.admin.from('two_factor_secrets').upsert({
    user_id: auth.user.id,
    secret_ciphertext: encryptTotpSecret(secret),
    backup_code_hashes: backupCodes.map(hashBackupCode),
    confirmed_at: null,
  });

  if (error) return jsonError(error.message, 400);

  return jsonOk({
    enabled: false,
    secret,
    otpauthUri: createOtpAuthUri({ email: auth.user.email ?? auth.user.id, secret }),
    backupCodes,
  });
}
