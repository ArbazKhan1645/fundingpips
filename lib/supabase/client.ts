'use client';

import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from './config';

export const supabase = createBrowserClient(
  supabaseConfig.url || 'https://example.supabase.co',
  supabaseConfig.anonKey || 'missing-supabase-anon-key',
  {
    cookieOptions: {
      name: 'lordfunded.auth',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  }
);
