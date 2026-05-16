'use client';

import { useEffect, useState } from 'react';
import { BarChart3, ClipboardCheck, ShieldAlert, Users, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';

type Analytics = {
  revenue: number;
  signups: number;
  paidOrders: number;
  passRate: number;
  pendingKyc: number;
  pendingPayouts: number;
};

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {};
}

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/admin/analytics', { headers: await authHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? 'Unable to load analytics');
        setAnalytics(data);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Unable to load analytics');
      }
    };
    load();
  }, []);

  const cards = [
    { label: 'Revenue', value: `$${(analytics?.revenue ?? 0).toLocaleString()}`, icon: BarChart3 },
    { label: 'Signups', value: (analytics?.signups ?? 0).toLocaleString(), icon: Users },
    { label: 'Paid Orders', value: (analytics?.paidOrders ?? 0).toLocaleString(), icon: ClipboardCheck },
    { label: 'Pending KYC', value: (analytics?.pendingKyc ?? 0).toLocaleString(), icon: ShieldAlert },
    { label: 'Pending Payouts', value: (analytics?.pendingPayouts ?? 0).toLocaleString(), icon: Wallet },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Manage users, accounts, rules, payouts, KYC, content, and risk operations.</p>
      </div>

      {error && <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border border-white/8">
            <CardContent className="p-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 mb-4">
                <Icon size={18} />
              </div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-2xl font-black text-white mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {[
          ['Users', '/admin/users'],
          ['Admin Accounts', '/admin/admins'],
          ['Sessions', '/admin/sessions'],
          ['Trading Accounts', '/admin/accounts'],
          ['Trades', '/admin/trades'],
          ['Equity Points', '/admin/equity'],
          ['Challenges', '/admin/challenges'],
          ['Coupons', '/admin/coupons'],
          ['Orders', '/admin/orders'],
          ['Payout Queue', '/admin/payouts'],
          ['KYC Review', '/admin/kyc'],
          ['KYC Documents', '/admin/kyc-documents'],
          ['Affiliates', '/admin/affiliates'],
          ['Affiliate Referrals', '/admin/affiliate-referrals'],
          ['Support Tickets', '/admin/tickets'],
          ['Support Messages', '/admin/support-messages'],
          ['CMS Posts', '/admin/blog'],
          ['Notifications', '/admin/notifications'],
          ['AI Chat Sessions', '/admin/ai-chat-sessions'],
          ['AI Chat Messages', '/admin/ai-chat-messages'],
          ['Webhook Events', '/admin/webhooks'],
          ['Audit Logs', '/admin/audits'],
        ].map(([label, href]) => (
          <Link key={href} href={href} className="glass rounded-2xl border border-white/8 p-5 hover:bg-white/[0.04] transition-all">
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-slate-500 mt-1">Open management screen</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
