'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, FileUp, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand/logo';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { Link, useRouter } from '@/i18n/navigation';

export default function VerificationStatusPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [status, setStatus] = useState<'unverified' | 'pending' | 'approved' | 'rejected'>('unverified');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await authService.getProfile();
        setUser(profile);
        setStatus(profile.kycStatus ?? 'unverified');
        if (profile.kycStatus === 'approved') router.replace('/dashboard');
      } catch {
        router.replace('/signin');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, setUser]);

  const content = {
    unverified: {
      icon: FileUp,
      title: 'KYC documents required',
      body: 'Upload your government photo ID and proof of address before accessing the trader dashboard.',
      action: 'Upload documents',
      href: '/kyc',
    },
    pending: {
      icon: Clock,
      title: 'Verification pending',
      body: 'Your documents are submitted. Admin compliance must approve your account before dashboard access.',
      action: 'View upload page',
      href: '/kyc',
    },
    approved: {
      icon: CheckCircle2,
      title: 'Verified',
      body: 'Your account is verified. Redirecting to dashboard.',
      action: 'Open dashboard',
      href: '/dashboard',
    },
    rejected: {
      icon: AlertCircle,
      title: 'Verification rejected',
      body: 'Your KYC was rejected. Review the reason in your account or upload clearer documents.',
      action: 'Upload again',
      href: '/kyc',
    },
  }[status];

  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-strong rounded-3xl p-8 border border-white/10 text-center">
        <BrandLogo className="h-10 w-10 mx-auto" textClassName="text-xl justify-center mt-3" />
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-center justify-center mx-auto mt-8 mb-5">
          <Icon size={28} />
        </div>
        <h1 className="text-2xl font-black text-white">{loading ? 'Checking verification...' : content.title}</h1>
        <p className="text-sm text-slate-400 mt-2">{loading ? 'Please wait while we load your account status.' : content.body}</p>
        {!loading && (
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href={content.href}>
                <ShieldCheck size={16} />
                {content.action}
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/signin">Sign out / switch account</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
