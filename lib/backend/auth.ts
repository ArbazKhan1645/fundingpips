import { type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { supabaseConfig } from '@/lib/supabase/config';
import { verifyTwoFactorCookieValue } from './two-factor-cookie';

export async function requireUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const supabase = token
    ? createClient(supabaseConfig.url, supabaseConfig.anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
        cookieOptions: {
          name: 'lordfunded.auth',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        },
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Route handlers that need refreshed cookies should do so explicitly.
          },
        },
      });

  const { data, error } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();
  if (error || !data.user) return { error: 'unauthorized' as const };

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from('profiles')
    .select('id,role,is_banned,is_deleted,kyc_status,two_factor_enabled,two_factor_required')
    .eq('id', data.user.id)
    .single();

  if (!profile || profile.is_banned || profile.is_deleted) return { error: 'forbidden' as const };
  return { user: data.user, profile, admin };
}

export async function requireAdmin(request: NextRequest) {
  const result = await requireUser(request);
  if ('error' in result) return result;
  if (!['admin', 'super_admin'].includes(result.profile.role)) return { error: 'admin_required' as const };
  if ((result.profile.two_factor_enabled || result.profile.two_factor_required)
    && !(await verifyTwoFactorCookieValue(request.cookies.get('lf_2fa')?.value, result.user.id))) {
    return { error: 'two_factor_required' as const };
  }
  return result;
}
