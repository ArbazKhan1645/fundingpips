import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/backend/auth';
import { isAdminIpAllowed, jsonError, jsonOk } from '@/lib/backend/security';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!isAdminIpAllowed(request)) return jsonError('admin_ip_not_allowed', 403);

  const auth = await requireAdmin(request);
  if ('error' in auth) return jsonError(auth.error, auth.error === 'unauthorized' ? 401 : 403);

  const [orders, users, accounts, payouts] = await Promise.all([
    auth.admin.from('challenge_orders').select('amount,status,created_at'),
    auth.admin.from('profiles').select('id,created_at,kyc_status'),
    auth.admin.from('trading_accounts').select('id,status,phase,created_at'),
    auth.admin.from('payout_requests').select('trader_amount,status,created_at'),
  ]);

  if (orders.error || users.error || accounts.error || payouts.error) {
    return jsonError('Unable to load analytics.', 500);
  }

  const paidOrders = orders.data.filter((order) => order.status === 'paid');
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.amount), 0);
  const passedAccounts = accounts.data.filter((account) => ['passed', 'funded'].includes(account.status)).length;

  return jsonOk({
    revenue,
    signups: users.data.length,
    paidOrders: paidOrders.length,
    passRate: accounts.data.length ? passedAccounts / accounts.data.length : 0,
    pendingKyc: users.data.filter((user) => user.kyc_status === 'pending').length,
    pendingPayouts: payouts.data.filter((payout) => payout.status === 'pending').length,
  });
}
