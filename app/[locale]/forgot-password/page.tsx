'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrandLogo } from '@/components/brand/logo';
import { authService } from '@/services/auth.service';
import { Link } from '@/i18n/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await authService.forgotPassword(email);
      setMessage('Password reset link sent. Check your inbox.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-strong rounded-3xl p-8 border border-white/10">
        <BrandLogo className="h-10 w-10 mx-auto" textClassName="text-xl justify-center mt-3" />
        <h1 className="text-2xl font-black text-white text-center mt-8">Reset password</h1>
        <p className="text-sm text-slate-400 text-center mt-2">We will send a secure reset link to your email.</p>
        <div className="space-y-4 mt-7">
          <Input label="Email" type="email" icon={<Mail size={16} />} value={email} onChange={(event) => setEmail(event.target.value)} />
          {message && <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">{message}</p>}
          {error && <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}
          <Button type="button" className="w-full" onClick={submit} loading={loading} disabled={!email}>Send reset link</Button>
          <Link href="/signin" className="block text-center text-sm text-amber-400">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
