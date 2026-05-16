import { type NextRequest } from 'next/server';
import { getClientIpFromHeaders } from '@/lib/security/request-metadata';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/backend/security';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { token, action } = await request.json();
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) return jsonOk({ ok: true, skipped: true });
  if (!token || typeof token !== 'string') return jsonError('captcha_required', 400);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: getClientIpFromHeaders(request.headers) ?? '',
    }),
  });

  const result = await response.json() as { success?: boolean; 'error-codes'?: string[] };
  if (!result.success) {
    try {
      await getSupabaseAdmin().from('security_events').insert({
        event_type: 'captcha_failed',
        severity: 'warning',
        client_ip: getClientIpFromHeaders(request.headers),
        country_code: request.headers.get('cf-ipcountry') ?? request.headers.get('x-vercel-ip-country'),
        user_agent: request.headers.get('user-agent'),
        metadata: { action, errors: result['error-codes'] ?? [] },
      });
    } catch {
      // Captcha failure should still return the intended response.
    }
    return jsonError('captcha_failed', 400);
  }

  return jsonOk({ ok: true });
}
