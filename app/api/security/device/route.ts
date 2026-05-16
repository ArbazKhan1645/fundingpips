import { createHash } from 'node:crypto';
import { type NextRequest } from 'next/server';
import { requireUser } from '@/lib/backend/auth';
import { jsonError, jsonOk } from '@/lib/backend/security';
import { detectThreatFlags, getClientIpFromHeaders, getGeoFromHeaders } from '@/lib/security/request-metadata';

export const runtime = 'nodejs';

function hashFingerprint(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ('error' in auth) return jsonError(auth.error, auth.error === 'unauthorized' ? 401 : 403);

  const payload = await request.json();
  const action = payload.action === 'signup' ? 'signup' : 'login';
  const fingerprintSource = typeof payload.fingerprint === 'string'
    ? payload.fingerprint
    : JSON.stringify(payload.device ?? {});

  if (!fingerprintSource || fingerprintSource.length < 8) return jsonError('fingerprint_required', 400);

  const geo = getGeoFromHeaders(request.headers);
  const userAgent = request.headers.get('user-agent');
  const flags = detectThreatFlags({ userAgent, body: JSON.stringify(payload.device ?? {}) });
  const fingerprintHash = hashFingerprint(`${auth.user.id}:${fingerprintSource}`);
  const now = new Date().toISOString();

  const deviceRow = {
    user_id: auth.user.id,
    fingerprint_hash: fingerprintHash,
    label: payload.device?.platform || payload.device?.userAgent?.slice(0, 80) || 'Unknown device',
    last_seen_at: now,
    last_login_at: action === 'login' ? now : null,
    signup_count: action === 'signup' ? 1 : 0,
    login_count: action === 'login' ? 1 : 0,
    client_ip: getClientIpFromHeaders(request.headers),
    device_ip: getClientIpFromHeaders(request.headers),
    server_ip: process.env.SERVER_IP || null,
    forwarded_for: request.headers.get('x-forwarded-for'),
    country_code: geo.countryCode,
    country: geo.country,
    region: geo.region,
    city: geo.city,
    timezone: payload.device?.timezone ?? geo.timezone,
    user_agent: userAgent,
    device: payload.device ?? {},
    risk_flags: flags,
  };

  const { data: existing } = await auth.admin
    .from('user_devices')
    .select('id,signup_count,login_count')
    .eq('user_id', auth.user.id)
    .eq('fingerprint_hash', fingerprintHash)
    .maybeSingle();

  const query = existing
    ? auth.admin.from('user_devices').update({
        ...deviceRow,
        signup_count: Number(existing.signup_count ?? 0) + (action === 'signup' ? 1 : 0),
        login_count: Number(existing.login_count ?? 0) + (action === 'login' ? 1 : 0),
      }).eq('id', existing.id).select('id').single()
    : auth.admin.from('user_devices').insert(deviceRow).select('id').single();

  const { data, error } = await query;
  if (error) return jsonError(error.message, 400);

  if (flags.length) {
    await auth.admin.from('security_events').insert({
      user_id: auth.user.id,
      event_type: `${action}.risk_flags`,
      severity: flags.some((flag) => flag.includes('injection') || flag.includes('probe')) ? 'high' : 'warning',
      client_ip: getClientIpFromHeaders(request.headers),
      country_code: geo.countryCode,
      user_agent: userAgent,
      metadata: { flags, device_id: data.id },
    });
  }

  const response = jsonOk({ data });
  response.cookies.set('lf_device_id', data.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
