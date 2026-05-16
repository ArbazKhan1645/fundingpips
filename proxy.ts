import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { createSupabaseProxyClient, copyResponseCookies } from './lib/supabase/proxy';
import { verifyTwoFactorCookieValue } from './lib/backend/two-factor-cookie';
import { detectThreatFlags, getClientIpFromHeaders, isDeviceBlocked, isIpBlocked, logSiteAccess } from './lib/security/request-metadata';

const intlMiddleware = createMiddleware(routing);
const protectedPrefixes = ['/dashboard', '/admin'];
const authRoutes = ['/signin', '/signup', '/verify-email', '/forgot-password', '/reset-password', '/kyc', '/verification-status', '/two-factor', '/select-dashboard'];

function stripLocale(pathname: string) {
  const parts = pathname.split('/');
  if (routing.locales.includes(parts[1] as never)) {
    return `/${parts.slice(2).join('/')}` || '/';
  }
  return pathname;
}

function localizedPath(request: NextRequest, path: string) {
  const parts = request.nextUrl.pathname.split('/');
  const locale = routing.locales.includes(parts[1] as never) ? parts[1] : routing.defaultLocale;
  return `/${locale}${path}`;
}

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  const path = stripLocale(request.nextUrl.pathname);
  const supabaseResponse = NextResponse.next({ request });
  const supabase = createSupabaseProxyClient(request, supabaseResponse);
  const { data: { user } } = await supabase.auth.getUser();
  const hasUser = Boolean(user);
  event.waitUntil(logSiteAccess(request, user?.id));

  if (await isIpBlocked(getClientIpFromHeaders(request.headers))) {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    });
  }

  const threatFlags = detectThreatFlags({
    path: request.nextUrl.pathname,
    query: request.nextUrl.search,
    userAgent: request.headers.get('user-agent'),
  });
  const shouldBlock = threatFlags.some((flag) => [
    'sql_injection_probe',
    'xss_probe',
    'path_traversal_probe',
    'secret_file_probe',
    'wordpress_probe',
    'python_client',
  ].includes(flag));

  if (shouldBlock) {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    });
  }

  if (path === '/two-factor' && !hasUser) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(request, '/signin');
    return copyResponseCookies(supabaseResponse, NextResponse.redirect(url));
  }

  if (protectedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)) && !hasUser) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(request, '/signin');
    url.searchParams.set('next', request.nextUrl.pathname);
    return copyResponseCookies(supabaseResponse, NextResponse.redirect(url));
  }

  if (hasUser && protectedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role,is_banned,is_deleted,email_verified_at,kyc_status,two_factor_enabled,two_factor_required')
      .eq('id', user!.id)
      .single();

    if (!profile || profile.is_banned || profile.is_deleted) {
      const url = request.nextUrl.clone();
      url.pathname = localizedPath(request, '/signin');
      return copyResponseCookies(supabaseResponse, NextResponse.redirect(url));
    }

    if (!profile.email_verified_at) {
      const url = request.nextUrl.clone();
      url.pathname = localizedPath(request, '/verify-email');
      if (user?.email) url.searchParams.set('email', user.email);
      return copyResponseCookies(supabaseResponse, NextResponse.redirect(url));
    }

    const needsTwoFactor = Boolean(profile.two_factor_enabled || profile.two_factor_required);
    if (needsTwoFactor && path !== '/two-factor') {
      const verified = await verifyTwoFactorCookieValue(request.cookies.get('lf_2fa')?.value, user!.id);
      if (!verified) {
        const url = request.nextUrl.clone();
        url.pathname = localizedPath(request, '/two-factor');
        url.searchParams.set('next', request.nextUrl.pathname);
        return copyResponseCookies(supabaseResponse, NextResponse.redirect(url));
      }
    }

    if (path === '/admin' || path.startsWith('/admin/')) {
      if (profile.role !== 'admin' && profile.role !== 'super_admin') {
        const url = request.nextUrl.clone();
        url.pathname = localizedPath(request, '/dashboard');
        return copyResponseCookies(supabaseResponse, NextResponse.redirect(url));
      }
    }

    if (path === '/dashboard' || path.startsWith('/dashboard/')) {
      if (await isDeviceBlocked(user!.id, request.cookies.get('lf_device_id')?.value)) {
        const url = request.nextUrl.clone();
        url.pathname = localizedPath(request, '/signin');
        url.searchParams.set('blocked', 'device');
        return copyResponseCookies(supabaseResponse, NextResponse.redirect(url));
      }

      if (profile.kyc_status !== 'approved') {
        const url = request.nextUrl.clone();
        url.pathname = localizedPath(request, '/verification-status');
        return copyResponseCookies(supabaseResponse, NextResponse.redirect(url));
      }
    }
  }

  if (authRoutes.includes(path) && hasUser && path === '/signin') {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(request, '/select-dashboard');
    return copyResponseCookies(supabaseResponse, NextResponse.redirect(url));
  }

  return copyResponseCookies(supabaseResponse, intlMiddleware(request));
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
