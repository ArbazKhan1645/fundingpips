'use client';

import { Shield, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { BrandLogo } from '@/components/brand/logo';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from '@/i18n/navigation';

export default function SelectDashboardPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [checking, setChecking] = useState(!user);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    if (user) return;

    const loadProfile = async () => {
      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch {
        router.replace('/signin');
      } finally {
        setChecking(false);
      }
    };

    loadProfile();
  }, [router, setUser, user]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-sm text-slate-400">
        Checking workspace access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <BrandLogo className="h-11 w-11 mx-auto" textClassName="text-xl justify-center mt-3" />
          <h1 className="text-2xl font-black text-white mt-6">Choose your workspace</h1>
          <p className="text-sm text-slate-500 mt-1">Your account has trader access{isAdmin ? ' and admin operations access.' : '.'}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/dashboard" className="glass rounded-2xl border border-white/10 p-6 hover:bg-white/[0.04] transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-300">
              <UserRound size={22} />
            </div>
            <h2 className="text-lg font-bold text-white mt-5">Trader Dashboard</h2>
            <p className="text-sm text-slate-500 mt-2">Requires approved KYC. Accounts, payouts, objectives, support, affiliate, and profile settings.</p>
          </Link>

          <Link
            href={isAdmin ? '/admin' : '/dashboard'}
            className={`glass rounded-2xl border p-6 transition-all ${isAdmin ? 'border-amber-500/25 hover:bg-amber-500/[0.04]' : 'border-white/10 opacity-50 pointer-events-none'}`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-300">
              <Shield size={22} />
            </div>
            <h2 className="text-lg font-bold text-white mt-5">Admin Console</h2>
            <p className="text-sm text-slate-500 mt-2">Users, KYC, payouts, challenges, analytics, risk data, CMS, notifications, and audit logs.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
