import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/backend/auth';
import { jsonError, jsonOk } from '@/lib/backend/security';

export const runtime = 'nodejs';

const challengeSchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  model: z.enum(['instant', 'one_step', 'two_step']).default('two_step'),
  account_size: z.number().positive(),
  price: z.number().nonnegative(),
  phase1_profit_target_pct: z.number().min(0).max(100).default(10),
  phase2_profit_target_pct: z.number().min(0).max(100).default(5),
  daily_drawdown_pct: z.number().min(0).max(100).default(5),
  max_drawdown_pct: z.number().min(0).max(100).default(10),
  min_trading_days: z.number().int().nonnegative().default(0),
  profit_split_pct: z.number().min(0).max(100).default(80),
  platform: z.array(z.string()).default(['MT5']),
  is_active: z.boolean().default(true),
});

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('challenge_tiers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return jsonError('Unable to load challenges.', 500);
  return jsonOk({ data });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return jsonError(auth.error, auth.error === 'unauthorized' ? 401 : 403);

  const payload = challengeSchema.parse(await request.json());
  const { data, error } = await auth.admin.from('challenge_tiers').insert(payload).select('*').single();
  if (error) return jsonError('Unable to create challenge.', 500);

  await auth.admin.from('audit_logs').insert({
    actor_id: auth.user.id,
    action: 'challenge.create',
    entity_table: 'challenge_tiers',
    entity_id: data.id,
    after: data,
  });

  return jsonOk({ data }, { status: 201 });
}
