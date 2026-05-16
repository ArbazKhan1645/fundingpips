'use client';

import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Database,
  FileClock,
  Globe2,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  Megaphone,
  MessageSquareText,
  Network,
  Receipt,
  ShieldCheck,
  Tags,
  TicketPercent,
  TrendingUp,
  Users,
  Wallet,
  Webhook,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { BrandLogo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/admins', label: 'Admins', icon: ShieldCheck },
  { href: '/admin/sessions', label: 'Sessions', icon: LockKeyhole },
  { href: '/admin/two-factor', label: '2FA', icon: ShieldCheck },
  { href: '/admin/accounts', label: 'Accounts', icon: CreditCard },
  { href: '/admin/equity', label: 'Equity', icon: TrendingUp },
  { href: '/admin/trades', label: 'Trades', icon: Database },
  { href: '/admin/challenges', label: 'Challenges', icon: ClipboardCheck },
  { href: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { href: '/admin/orders', label: 'Orders', icon: Receipt },
  { href: '/admin/payouts', label: 'Payouts', icon: Wallet },
  { href: '/admin/kyc', label: 'KYC', icon: ShieldCheck },
  { href: '/admin/kyc-documents', label: 'KYC Docs', icon: Tags },
  { href: '/admin/affiliates', label: 'Affiliates', icon: Network },
  { href: '/admin/affiliate-referrals', label: 'Referrals', icon: Network },
  { href: '/admin/tickets', label: 'Support', icon: LifeBuoy },
  { href: '/admin/support-messages', label: 'Replies', icon: MessageSquareText },
  { href: '/admin/blog', label: 'CMS', icon: BookOpen },
  { href: '/admin/notifications', label: 'Broadcasts', icon: Megaphone },
  { href: '/admin/ai-chat-sessions', label: 'AI Sessions', icon: MessageSquareText },
  { href: '/admin/ai-chat-messages', label: 'AI Messages', icon: MessageSquareText },
  { href: '/admin/webhooks', label: 'Webhooks', icon: Webhook },
  { href: '/admin/access-logs', label: 'Access Logs', icon: Globe2 },
  { href: '/admin/blocked-ips', label: 'Blocked IPs', icon: LockKeyhole },
  { href: '/admin/user-devices', label: 'Devices', icon: Network },
  { href: '/admin/security-events', label: 'Security Events', icon: ShieldCheck },
  { href: '/admin/audits', label: 'Audit Logs', icon: FileClock },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-white/5 min-h-screen bg-[#080808]/95">
      <div className="p-6 pb-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo className="h-9 w-9" textClassName="text-lg" />
        </Link>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-amber-400/80">Admin Console</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
