import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { assertSupabaseServerConfig, supabaseConfig } from './config';

export function getSupabaseAdmin() {
  assertSupabaseServerConfig();

  return createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
