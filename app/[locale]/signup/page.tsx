'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { COUNTRIES, TITLES } from '@/constants';

const step1Schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  title: z.string().min(1, 'Title is required'),
  dob: z.string().min(1, 'Date of birth is required'),
});

const step2Schema = z.object({
  country: z.string().min(1, 'Country is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Valid phone number required'),
});

const step3Schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const steps = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Contact' },
  { id: 3, label: 'Security' },
];

type FormData = {
  firstName: string; lastName: string; title: string; dob: string;
  country: string; email: string; phone: string;
  password: string; confirmPassword: string;
};

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const { login } = useAuthStore();
  const router = useRouter();

  const schema = step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema;

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const onNext = (data: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    if (step < 3) {
      setStep(step + 1);
      reset();
    }
  };

  const onFinalSubmit = async (data: Record<string, unknown>) => {
    const merged = { ...formData, ...data } as FormData;
    setIsLoading(true);
    try {
      const res = await authService.register(merged);
      login(res.user, res.token);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = step === 3 ? onFinalSubmit : onNext;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden p-4 py-12">
      <div className="absolute inset-0">
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-600/10 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <span className="text-black font-black">LF</span>
            </div>
            <span className="font-bold text-white text-xl">
              Lord<span className="gradient-text-blue">funded</span>
            </span>
          </Link>
        </motion.div>

        {/* Steps indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${
                s.id < step
                  ? 'bg-emerald-500 text-white'
                  : s.id === step
                  ? 'bg-amber-500 text-black ring-4 ring-amber-500/20'
                  : 'bg-white/5 text-slate-500 border border-white/10'
              }`}>
                {s.id < step ? <Check size={12} /> : s.id}
              </div>
              <span className={`text-xs hidden sm:block transition-colors ${s.id === step ? 'text-white font-medium' : 'text-slate-500'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px mx-1 transition-all ${s.id < step ? 'bg-emerald-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-3xl p-8 border border-white/10 shadow-2xl shadow-black/50"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white">Create your account</h1>
            <p className="text-sm text-slate-400 mt-1">
              Step {step} of {steps.length}: {steps[step - 1].label}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
              className="space-y-4"
            >
              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                      <select
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/60 transition-all"
                        {...register('title')}
                      >
                        <option value="" className="bg-[#0a0a0a]">Select</option>
                        {TITLES.map((t) => (
                          <option key={t} value={t} className="bg-[#0a0a0a]">{t}</option>
                        ))}
                      </select>
                      {(errors as Record<string, { message?: string }>).title && (
                        <p className="text-xs text-red-400 mt-1">{(errors as Record<string, { message?: string }>).title?.message}</p>
                      )}
                    </div>
                    <Input
                      label="Date of Birth"
                      type="date"
                      error={(errors as Record<string, { message?: string }>).dob?.message}
                      {...register('dob')}
                    />
                  </div>
                  <Input
                    label="First Name"
                    placeholder="John"
                    icon={<User size={16} />}
                    error={(errors as Record<string, { message?: string }>).firstName?.message}
                    {...register('firstName')}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    icon={<User size={16} />}
                    error={(errors as Record<string, { message?: string }>).lastName?.message}
                    {...register('lastName')}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Country</label>
                    <select
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/60 transition-all"
                      {...register('country')}
                    >
                      <option value="" className="bg-[#0a0a0a]">Select your country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>
                      ))}
                    </select>
                    {(errors as Record<string, { message?: string }>).country && (
                      <p className="text-xs text-red-400 mt-1">{(errors as Record<string, { message?: string }>).country?.message}</p>
                    )}
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    icon={<Mail size={16} />}
                    error={(errors as Record<string, { message?: string }>).email?.message}
                    {...register('email')}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    icon={<Phone size={16} />}
                    error={(errors as Record<string, { message?: string }>).phone?.message}
                    {...register('phone')}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    icon={<Lock size={16} />}
                    rightIcon={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                    error={(errors as Record<string, { message?: string }>).password?.message}
                    {...register('password')}
                  />
                  <Input
                    label="Confirm Password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    icon={<Lock size={16} />}
                    rightIcon={
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="hover:text-white transition-colors">
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                    error={(errors as Record<string, { message?: string }>).confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                  <p className="text-xs text-slate-500">
                    By creating an account, you agree to our{' '}
                    <Link href="#" className="text-amber-400 hover:text-amber-300">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="#" className="text-amber-400 hover:text-amber-300">Privacy Policy</Link>.
                  </p>
                </>
              )}

              <div className="flex gap-3 pt-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 gap-2"
                  loading={isLoading && step === 3}
                >
                  {step === 3 ? 'Create Account' : 'Continue'}
                  {step < 3 && <ChevronRight size={16} />}
                </Button>
              </div>
            </motion.form>
          </AnimatePresence>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link href="/signin" className="text-amber-400 font-medium hover:text-amber-300 transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
