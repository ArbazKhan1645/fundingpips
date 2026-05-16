import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseConfig } from '@/lib/supabase/config';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));

  if (code && supabaseConfig.url && supabaseConfig.anonKey) {
    const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
      cookieOptions: {
        name: 'lordfunded.auth',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
