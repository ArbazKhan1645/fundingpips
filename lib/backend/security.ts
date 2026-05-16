import { NextResponse, type NextRequest } from 'next/server';

const jsonHeaders = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { ...init, headers: { ...jsonHeaders, ...init?.headers } });
}

export function jsonError(message = 'Request failed', status = 400) {
  return NextResponse.json({ error: message }, { status, headers: jsonHeaders });
}

export function getClientIp(request: NextRequest) {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '0.0.0.0'
  );
}

export function isAdminIpAllowed(request: NextRequest) {
  const whitelist = process.env.ADMIN_IP_WHITELIST?.split(',').map((ip) => ip.trim()).filter(Boolean);
  if (!whitelist?.length) return true;
  return whitelist.includes(getClientIp(request));
}
