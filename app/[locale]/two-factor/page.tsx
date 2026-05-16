'use client';

import { Suspense, useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, Smartphone } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { BrandLogo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from '@/i18n/navigation';

type SetupState = {
  enabled: boolean;
  secret?: string;
  otpauthUri?: string;
  backupCodes?: string[];
};

function TwoFactorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, setUser } = useAuthStore();
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [profile, setupResponse] = await Promise.all([
          user ? Promise.resolve(user) : authService.getProfile(),
          authService.setupTwoFactor(),
        ]);
        setUser(profile);
        setSetup(setupResponse);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Unable to load 2FA.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [setUser, user]);

  const complete = async () => {
    setSaving(true);
    setError(null);
    try {
      await authService.verifyTwoFactor(code);
      const profile = await authService.getProfile();
      setUser(profile);
      const next = params.get('next');
      if (next) {
        router.replace(next);
        return;
      }
      if (profile.role === 'admin' || profile.role === 'super_admin') {
        router.replace('/select-dashboard');
        return;
      }
      router.replace(profile.kycStatus === 'approved' ? '/dashboard' : '/verification-status');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Invalid 2FA code.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <BrandLogo className="h-11 w-11 mx-auto" textClassName="text-xl justify-center mt-3" />
          <h1 className="text-2xl font-black text-white mt-6">Two-factor authentication</h1>
          <p className="text-sm text-slate-500 mt-1">Use Google Authenticator, Authy, 1Password, or any TOTP app.</p>
        </div>

        <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8">
          {loading ? (
            <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
          ) : (
            <div className="space-y-6">
              {!setup?.enabled && setup?.secret && (
                <div className="grid md:grid-cols-[180px_1fr] gap-5">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-center">
                    <div className="text-center">
                      <Smartphone className="mx-auto text-amber-300" size={34} />
                      <p className="text-xs text-slate-500 mt-3">Scan using your authenticator app</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Manual setup key</p>
                      <p className="mt-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-amber-200 break-all">{setup.secret}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Authenticator URI</p>
                      <p className="mt-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-slate-300 break-all">{setup.otpauthUri}</p>
                    </div>
                  </div>
                </div>
              )}

              {setup?.backupCodes?.length ? (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4">
                  <p className="text-sm font-semibold text-amber-200">Backup codes</p>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {setup.backupCodes.map((backupCode) => (
                      <code key={backupCode} className="rounded-lg bg-black/30 px-2 py-1.5 text-xs text-amber-100 text-center">{backupCode}</code>
                    ))}
                  </div>
                </div>
              ) : null}

              <label className="block">
                <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <KeyRound size={15} />
                  6-digit code
                </span>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.3em] text-white focus:outline-none focus:border-amber-500/50"
                />
              </label>

              {error && (
                <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
              )}

              <Button type="button" className="w-full" size="lg" onClick={complete} loading={saving} disabled={code.length < 6}>
                <ShieldCheck size={17} />
                Verify and continue
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-sm text-slate-400">
        Loading two-factor verification...
      </div>
    }>
      <TwoFactorContent />
    </Suspense>
  );
}
