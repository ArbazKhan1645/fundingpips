'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { Link, useRouter } from '@/i18n/navigation';
import { BrandLogo } from '@/components/brand/logo';
import { TurnstileWidget } from '@/components/security/turnstile-widget';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SignInPage() {
  const t = useTranslations('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const handleCaptcha = useCallback((token: string) => setCaptchaToken(token), []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login({ ...data, captchaToken });
      login(res.user, res.token);
      if (!res.user.emailVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
      if (res.requiresTwoFactor) {
        router.push('/two-factor');
        return;
      }
      if (res.user.role === 'admin' || res.user.role === 'super_admin') {
        router.push('/select-dashboard');
        return;
      }
      router.push(res.user.kycStatus === 'approved' ? '/dashboard' : '/verification-status');
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Invalid credentials.';
      if (message.toLowerCase().includes('email not confirmed')) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await authService.googleLogin();
      login(res.user, res.token);
      router.push(res.user.role === 'admin' || res.user.role === 'super_admin' ? '/select-dashboard' : '/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-600/10 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2">
            <BrandLogo className="h-10 w-10" textClassName="text-xl" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-3xl p-8 border border-white/10 shadow-2xl shadow-black/50"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white">{t('signIn')}</h1>
            <p className="text-sm text-slate-400 mt-1">Lordfunded</p>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 h-12 glass rounded-xl border border-white/10 text-sm font-medium text-slate-300 hover:text-white hover:border-white/20 transition-all mb-6 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('google')}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500">{t('orContinueWith')}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t('email')}
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">{t('password')}</label>
                <Link href="/forgot-password" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                  {t('forgotPassword')}
                </Link>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                icon={<Lock size={16} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                className="w-4 h-4 rounded border-white/10 bg-white/5 accent-amber-500"
                {...register('rememberMe')}
              />
              <label htmlFor="rememberMe" className="text-sm text-slate-300 cursor-pointer">
                {t('rememberMe')}
              </label>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 text-center py-2 px-4 bg-red-500/10 rounded-xl border border-red-500/20"
              >
                {error}
              </motion.p>
            )}

            <TurnstileWidget action="signin" onVerify={handleCaptcha} />

            <Button
              type="submit"
              variant="primary"
              className="w-full gap-2 mt-2"
              size="lg"
              loading={isLoading}
              disabled={captchaEnabled && !captchaToken}
            >
              {t('signIn')}
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            {t('noAccount')}{' '}
            <Link href="/signup" className="text-amber-400 font-medium hover:text-amber-300 transition-colors">
              {t('signUp')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
