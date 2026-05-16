import type { NextRequest } from 'next/server';

const botPatterns = [
  'bot',
  'crawler',
  'spider',
  'scrapy',
  'curl',
  'wget',
  'python-requests',
  'python',
  'aiohttp',
  'httpx',
  'go-http-client',
  'java/',
  'nikto',
  'sqlmap',
  'nmap',
  'masscan',
];

const sqlPatterns = [
  'union select',
  'information_schema',
  'sleep(',
  'benchmark(',
  ' or 1=1',
  "' or '1'='1",
  'drop table',
  'select * from',
];

const xssPatterns = ['<script', 'javascript:', 'onerror=', 'onload=', '%3cscript'];
const pathTraversalPatterns = ['../', '..\\', '%2e%2e', '/etc/passwd', 'c:\\'];
const secretProbePatterns = ['/.env', '/.git', 'config.php', 'wp-config', 'id_rsa', 'server.key'];

export function getClientIpFromHeaders(headers: Headers) {
  return (
    headers.get('cf-connecting-ip') ??
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    null
  );
}

export function getGeoFromHeaders(headers: Headers) {
  return {
    countryCode: headers.get('cf-ipcountry') ?? headers.get('x-vercel-ip-country') ?? null,
    country: headers.get('x-vercel-ip-country-region') ?? null,
    region: headers.get('x-vercel-ip-country-region') ?? headers.get('cf-region') ?? null,
    city: headers.get('x-vercel-ip-city') ?? headers.get('cf-ipcity') ?? null,
    timezone: headers.get('x-vercel-ip-timezone') ?? headers.get('cf-timezone') ?? null,
  };
}

export function detectThreatFlags(input: { path?: string | null; query?: string | null; userAgent?: string | null; body?: string | null }) {
  const haystack = `${input.path ?? ''} ${input.query ?? ''} ${input.body ?? ''}`.toLowerCase();
  const userAgent = (input.userAgent ?? '').toLowerCase();
  const flags = new Set<string>();

  if (botPatterns.some((pattern) => userAgent.includes(pattern))) flags.add('automated_bot');
  if (userAgent.includes('python')) flags.add('python_client');
  if (sqlPatterns.some((pattern) => haystack.includes(pattern))) flags.add('sql_injection_probe');
  if (xssPatterns.some((pattern) => haystack.includes(pattern))) flags.add('xss_probe');
  if (pathTraversalPatterns.some((pattern) => haystack.includes(pattern))) flags.add('path_traversal_probe');
  if (secretProbePatterns.some((pattern) => haystack.includes(pattern))) flags.add('secret_file_probe');
  if (haystack.includes('/wp-admin') || haystack.includes('/wp-login')) flags.add('wordpress_probe');

  return Array.from(flags);
}

export function getRequestLogPayload(request: NextRequest, userId?: string | null) {
  const geo = getGeoFromHeaders(request.headers);
  const userAgent = request.headers.get('user-agent');
  const path = request.nextUrl.pathname;
  const threatFlags = detectThreatFlags({
    path,
    query: request.nextUrl.search,
    userAgent,
  });

  return {
    user_id: userId ?? null,
    method: request.method,
    path,
    locale: request.nextUrl.pathname.split('/')[1] || null,
    host: request.headers.get('host'),
    referrer: request.headers.get('referer'),
    origin: request.headers.get('origin'),
    client_ip: getClientIpFromHeaders(request.headers),
    device_ip: getClientIpFromHeaders(request.headers),
    server_ip: process.env.SERVER_IP || null,
    forwarded_for: request.headers.get('x-forwarded-for'),
    country_code: geo.countryCode,
    country: geo.country,
    region: geo.region,
    city: geo.city,
    timezone: geo.timezone,
    user_agent: userAgent,
    device: {
      acceptLanguage: request.headers.get('accept-language'),
      secChUa: request.headers.get('sec-ch-ua'),
      secChUaMobile: request.headers.get('sec-ch-ua-mobile'),
      secChUaPlatform: request.headers.get('sec-ch-ua-platform'),
    },
    threat_flags: threatFlags,
    is_bot: threatFlags.includes('automated_bot'),
  };
}

export async function logSiteAccess(request: NextRequest, userId?: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  await fetch(`${url}/rest/v1/site_access_logs`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(getRequestLogPayload(request, userId)),
  }).catch(() => undefined);
}

export async function isIpBlocked(ip: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !ip) return false;

  const params = new URLSearchParams({
    select: 'id,expires_at',
    ip_address: `eq.${ip}`,
    is_active: 'eq.true',
    limit: '1',
  });

  try {
    const response = await fetch(`${url}/rest/v1/blocked_ip_addresses?${params.toString()}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: 'no-store',
    });
    if (!response.ok) return false;
    const rows = await response.json() as Array<{ id: string; expires_at: string | null }>;
    return rows.some((row) => !row.expires_at || new Date(row.expires_at).getTime() > Date.now());
  } catch {
    return false;
  }
}

export async function isDeviceBlocked(userId: string, deviceId: string | undefined) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !deviceId) return false;

  const params = new URLSearchParams({
    select: 'id',
    id: `eq.${deviceId}`,
    user_id: `eq.${userId}`,
    is_blocked: 'eq.true',
    limit: '1',
  });

  try {
    const response = await fetch(`${url}/rest/v1/user_devices?${params.toString()}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: 'no-store',
    });
    if (!response.ok) return false;
    const rows = await response.json() as Array<{ id: string }>;
    return rows.length > 0;
  } catch {
    return false;
  }
}
