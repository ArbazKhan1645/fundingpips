const encoder = new TextEncoder();

function base64Url(bytes: ArrayBuffer) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function hmac(message: string) {
  const secret = process.env.TWO_FACTOR_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'lordfunded-dev-2fa-cookie-secret';
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(message)));
}

export async function createTwoFactorCookieValue(userId: string) {
  const issuedAt = Date.now();
  const message = `${userId}.${issuedAt}`;
  const signature = await hmac(message);
  return `${message}.${signature}`;
}

export async function verifyTwoFactorCookieValue(value: string | undefined, userId: string) {
  if (!value) return false;

  const [cookieUserId, issuedAt, signature] = value.split('.');
  if (!cookieUserId || !issuedAt || !signature || cookieUserId !== userId) return false;

  const ageMs = Date.now() - Number(issuedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > 12 * 60 * 60 * 1000) return false;

  const expected = await hmac(`${cookieUserId}.${issuedAt}`);
  return expected === signature;
}
