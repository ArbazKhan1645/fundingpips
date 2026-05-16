import 'server-only';
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer) {
  let bits = '';
  let output = '';

  for (const byte of buffer) bits += byte.toString(2).padStart(8, '0');
  for (let index = 0; index < bits.length; index += 5) {
    output += alphabet[parseInt(bits.slice(index, index + 5).padEnd(5, '0'), 2)];
  }

  return output;
}

function base32Decode(value: string) {
  const clean = value.replace(/=+$/g, '').replace(/\s+/g, '').toUpperCase();
  let bits = '';
  const bytes: number[] = [];

  for (const char of clean) {
    const index = alphabet.indexOf(char);
    if (index === -1) throw new Error('Invalid TOTP secret.');
    bits += index.toString(2).padStart(5, '0');
  }

  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(parseInt(bits.slice(index, index + 8), 2));
  }

  return Buffer.from(bytes);
}

function encryptionKey() {
  const source = process.env.TWO_FACTOR_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'lordfunded-dev-two-factor-secret';
  return createHash('sha256').update(source).digest();
}

export function generateTotpSecret() {
  return base32Encode(randomBytes(20));
}

export function encryptTotpSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptTotpSecret(ciphertext: string) {
  if (!ciphertext.startsWith('v1.')) return ciphertext;

  const [, iv, tag, encrypted] = ciphertext.split('.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

function generateCode(secret: string, counter: number) {
  const key = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac('sha1', key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary = ((hmac[offset] & 0x7f) << 24)
    | ((hmac[offset + 1] & 0xff) << 16)
    | ((hmac[offset + 2] & 0xff) << 8)
    | (hmac[offset + 3] & 0xff);

  return String(binary % 1_000_000).padStart(6, '0');
}

export function verifyTotpCode(secret: string, code: string) {
  const clean = code.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(clean)) return false;

  const currentCounter = Math.floor(Date.now() / 1000 / 30);
  for (const drift of [-1, 0, 1]) {
    const expected = generateCode(secret, currentCounter + drift);
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(clean))) return true;
  }

  return false;
}

export function createOtpAuthUri(params: { email: string; secret: string }) {
  const issuer = 'Lordfunded';
  return `otpauth://totp/${encodeURIComponent(`${issuer}:${params.email}`)}?secret=${params.secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

export function hashBackupCode(code: string) {
  return createHash('sha256').update(code.trim()).digest('hex');
}
