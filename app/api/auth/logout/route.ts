import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('lf_2fa', '', { path: '/', maxAge: 0 });
  response.cookies.set('lf_auth_hint', '', { path: '/', maxAge: 0 });
  response.cookies.set('lf_device_id', '', { path: '/', maxAge: 0 });
  return response;
}
