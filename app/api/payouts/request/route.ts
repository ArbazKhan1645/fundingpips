import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/backend/auth';
import { jsonError, jsonOk } from '@/lib/backend/security';

export const runtime = 'nodejs';

const schema = z.object({
  accountId: z.string().uuid(),
  grossAmount: z.number().positive(),
  method: z.string().min(2).max(80),
  destination: z.record(z.string(), z.unknown()).default({}),
});

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ('error' in auth) return jsonError(auth.error, auth.error === 'unauthorized' ? 401 : 403);

  const payload = schema.parse(await request.json());
  const { data, error } = await auth.admin.rpc('request_payout', {
    p_account_id: payload.accountId,
    p_gross_amount: payload.grossAmount,
    p_method: payload.method,
    p_destination: payload.destination,
  });

  if (error) return jsonError(error.message, 400);
  return jsonOk({ data }, { status: 201 });
}
