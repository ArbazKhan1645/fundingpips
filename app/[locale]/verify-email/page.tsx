'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MailCheck, RefreshCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrandLogo } from '@/components/brand/logo';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { Link, useRouter } from '@/i18n/navigation';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-sm text-slate-400">Loading verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { login } = useAuthStore();
  const initialEmail = useMemo(() => params.get('email') ?? '', [params]);
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verify = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await authService.verifyEmailOtp(email, code);
      login(result.user, result.token);
      router.push(result.user.role === 'admin' || result.user.role === 'super_admin' ? '/select-dashboard' : '/kyc');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await authService.resendVerification(email);
      setMessage('A new verification code has been sent.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BrandLogo className="h-10 w-10 mx-auto" textClassName="text-xl justify-center mt-3" />
        </div>

        <div className="glass-strong rounded-3xl p-8 border border-white/10 shadow-2xl shadow-black/50">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-center justify-center mx-auto mb-5">
            <MailCheck size={24} />
          </div>
          <h1 className="text-2xl font-black text-white text-center">Verify your email</h1>
          <p className="text-sm text-slate-400 text-center mt-2">Enter the OTP sent by Supabase Auth to finish account activation.</p>

          <div className="space-y-4 mt-7">
            <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Input label="Verification code" value={code} onChange={(event) => setCode(event.target.value.replace(/\s/g, ''))} placeholder="6 digit code" icon={<ShieldCheck size={16} />} />

            {message && <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">{message}</p>}
            {error && <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

            <Button type="button" className="w-full" onClick={verify} loading={loading} disabled={!email || !code}>Verify and continue</Button>
            <Button type="button" className="w-full" variant="secondary" onClick={resend} disabled={!email || loading}>
              <RefreshCcw size={14} />
              Resend code
            </Button>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already verified? <Link href="/signin" className="text-amber-400">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
