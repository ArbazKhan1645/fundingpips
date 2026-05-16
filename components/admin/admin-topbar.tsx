'use client';

import { Shield, UserRound } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAuthStore } from '@/store/auth.store';

export function AdminTopbar() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 h-16 glass border-b border-white/5">
      <div>
        <p className="text-sm font-semibold text-white">Admin Operations</p>
        <p className="text-xs text-slate-500">Live Supabase data with audited writes</p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all">
          <UserRound size={14} />
          Trader View
        </Link>
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-300">
            <Shield size={16} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-none">{user?.firstName || 'Admin'} {user?.lastName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.role ?? 'admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
