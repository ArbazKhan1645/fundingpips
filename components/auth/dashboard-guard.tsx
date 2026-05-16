'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const profile = user ?? await authService.getProfile();
        setUser(profile);

        if (!profile.emailVerified) {
          router.replace(`/verify-email?email=${encodeURIComponent(profile.email)}`);
          return;
        }

        if (profile.kycStatus !== 'approved') {
          router.replace('/verification-status');
          return;
        }
      } catch {
        router.replace('/signin');
        return;
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, [router, setUser, user]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-sm text-slate-400">
        Checking account verification...
      </div>
    );
  }

  return children;
}
