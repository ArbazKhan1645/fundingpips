'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Check, Eye, EyeOff, FileCheck, Lock, Mail, MapPin, Phone, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { Link, useRouter } from '@/i18n/navigation';
import { COUNTRIES, TITLES } from '@/constants';
import { BrandLogo } from '@/components/brand/logo';
import { TurnstileWidget } from '@/components/security/turnstile-widget';

const personalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  firstName: z.string().min(2, 'First name must match your ID'),
  lastName: z.string().min(2, 'Last name must match your ID'),
  dob: z.string().min(1, 'Date of birth is required'),
  nationality: z.string().min(1, 'Nationality is required'),
});

const contactSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(7, 'Valid phone number required'),
  addressLine1: z.string().min(4, 'Residential address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/region is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  taxCountry: z.string().min(1, 'Tax country is required'),
});

const tradingSchema = z.object({
  preferredPlatform: z.string().min(1, 'Preferred platform is required'),
  tradingExperience: z.string().min(1, 'Trading experience is required'),
  referralSource: z.string().min(1, 'Referral source is required'),
});

const kycSchema = z.object({
  idDocumentType: z.string().min(1, 'ID document type is required'),
  idDocumentNumber: z.string().min(3, 'Document number is required'),
  proofOfAddressType: z.string().min(1, 'Proof of address type is required'),
});

const securitySchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Use one uppercase letter').regex(/[0-9]/, 'Use one number'),
  confirmPassword: z.string(),
  acceptedTerms: z.literal(true, { error: 'Terms are required' }),
  acceptedRisk: z.literal(true, { error: 'Risk disclosure is required' }),
  marketingOptIn: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const steps = [
  { label: 'Identity', icon: User, schema: personalSchema },
  { label: 'Address', icon: MapPin, schema: contactSchema },
  { label: 'Trading', icon: ShieldCheck, schema: tradingSchema },
  { label: 'KYC', icon: FileCheck, schema: kycSchema },
  { label: 'Security', icon: Lock, schema: securitySchema },
] as const;

type FormData = z.infer<typeof personalSchema> &
  z.infer<typeof contactSchema> &
  z.infer<typeof tradingSchema> &
  z.infer<typeof kycSchema> &
  z.infer<typeof securitySchema>;

const platforms = ['MT5', 'cTrader', 'Match-Trader', 'DXtrade'];
const experience = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
const referralSources = ['Google', 'Instagram', 'TikTok', 'YouTube', 'Affiliate', 'Friend', 'Other'];
const idTypes = ['Passport', 'National ID', 'Driver License', 'Residence Permit'];
const addressTypes = ['Utility Bill', 'Bank Statement', 'Government Letter', 'Tax Document', 'Residence Certificate'];

export default function SignUpPage() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const { login } = useAuthStore();
  const router = useRouter();
  const current = steps[step];
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const handleCaptcha = useCallback((token: string) => setCaptchaToken(token), []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Record<string, unknown>>({
    resolver: zodResolver(current.schema) as never,
    defaultValues: formData as Record<string, unknown>,
  });

  const next = (data: Record<string, unknown>) => {
    const merged = { ...formData, ...data };
    setFormData(merged);
    setError(null);
    if (step < steps.length - 1) {
      setStep((value) => value + 1);
      reset(merged);
    }
  };

  const submit = async (data: Record<string, unknown>) => {
    const merged = { ...formData, ...data } as FormData;
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.register({ ...merged, captchaToken });
      if (result.requiresEmailVerification || !result.token) {
        router.push(`/verify-email?email=${encodeURIComponent(merged.email)}`);
        return;
      }
      login(result.user, result.token);
      router.push('/kyc');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = step === steps.length - 1 ? submit : next;

  const errorFor = (field: string) => (errors as Record<string, { message?: string }>)[field]?.message;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden p-4 py-10">
      <div className="absolute inset-0">
        <div className="grid-bg absolute inset-0 opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2">
            <BrandLogo className="h-10 w-10" textClassName="text-xl" />
          </Link>
          <h1 className="text-2xl font-black text-white mt-6">Create trader account</h1>
          <p className="text-sm text-slate-500 mt-1">Complete identity, KYC, and security details before dashboard access.</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto">
          {steps.map(({ label, icon: Icon }, index) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                index < step ? 'bg-emerald-500 text-white' : index === step ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-500 border border-white/10'
              }`}>
                {index < step ? <Check size={14} /> : <Icon size={14} />}
              </div>
              <span className={`text-xs hidden sm:block ${index === step ? 'text-white' : 'text-slate-500'}`}>{label}</span>
              {index < steps.length - 1 && <div className={`w-7 h-px ${index < step ? 'bg-emerald-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <motion.div className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl shadow-black/50">
          <AnimatePresence mode="wait">
            <motion.form
              key={step}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
              className="space-y-4"
            >
              {step === 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldSelect label="Title" register={register('title')} options={TITLES as unknown as string[]} error={errorFor('title')} />
                  <Input label="Date of birth" type="date" error={errorFor('dob')} {...register('dob')} />
                  <Input label="First name" placeholder="Legal first name" icon={<User size={16} />} error={errorFor('firstName')} {...register('firstName')} />
                  <Input label="Last name" placeholder="Legal last name" icon={<User size={16} />} error={errorFor('lastName')} {...register('lastName')} />
                  <FieldSelect label="Nationality" register={register('nationality')} options={COUNTRIES as unknown as string[]} error={errorFor('nationality')} className="sm:col-span-2" />
                </div>
              )}

              {step === 1 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldSelect label="Country of residence" register={register('country')} options={COUNTRIES as unknown as string[]} error={errorFor('country')} />
                  <Input label="Phone" type="tel" placeholder="+1 234 567 8900" icon={<Phone size={16} />} error={errorFor('phone')} {...register('phone')} />
                  <Input label="Address line 1" placeholder="Street address" error={errorFor('addressLine1')} {...register('addressLine1')} />
                  <Input label="Address line 2" placeholder="Apartment, suite, optional" error={errorFor('addressLine2')} {...register('addressLine2')} />
                  <Input label="City" placeholder="City" error={errorFor('city')} {...register('city')} />
                  <Input label="State / region" placeholder="State or region" error={errorFor('state')} {...register('state')} />
                  <Input label="Postal code" placeholder="Postal code" error={errorFor('postalCode')} {...register('postalCode')} />
                  <FieldSelect label="Tax country" register={register('taxCountry')} options={COUNTRIES as unknown as string[]} error={errorFor('taxCountry')} />
                </div>
              )}

              {step === 2 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldSelect label="Preferred platform" register={register('preferredPlatform')} options={platforms} error={errorFor('preferredPlatform')} />
                  <FieldSelect label="Trading experience" register={register('tradingExperience')} options={experience} error={errorFor('tradingExperience')} />
                  <FieldSelect label="How did you find us?" register={register('referralSource')} options={referralSources} error={errorFor('referralSource')} className="sm:col-span-2" />
                </div>
              )}

              {step === 3 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldSelect label="Photo ID document" register={register('idDocumentType')} options={idTypes} error={errorFor('idDocumentType')} />
                  <Input label="ID document number" placeholder="Document number" error={errorFor('idDocumentNumber')} {...register('idDocumentNumber')} />
                  <FieldSelect label="Proof of address" register={register('proofOfAddressType')} options={addressTypes} error={errorFor('proofOfAddressType')} className="sm:col-span-2" />
                  <div className="sm:col-span-2 rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4 text-sm text-amber-100/80">
                    Uploads can be completed from the dashboard after email verification. Your profile and KYC case are prepared now so compliance can review it later.
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail size={16} />} error={errorFor('email')} {...register('email')} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 chars, uppercase, number"
                      icon={<Lock size={16} />}
                      rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
                      error={errorFor('password')}
                      {...register('password')}
                    />
                    <Input
                      label="Confirm password"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat password"
                      icon={<Lock size={16} />}
                      rightIcon={<button type="button" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
                      error={errorFor('confirmPassword')}
                      {...register('confirmPassword')}
                    />
                  </div>
                  <Checkbox label="I agree to Terms of Use and Privacy Policy." error={errorFor('acceptedTerms')} {...register('acceptedTerms')} />
                  <Checkbox label="I understand trading rules, drawdown limits, and payout/KYC requirements." error={errorFor('acceptedRisk')} {...register('acceptedRisk')} />
                  <Checkbox label="Send me product and account updates." {...register('marketingOptIn')} />
                  <TurnstileWidget action="signup" onVerify={handleCaptcha} />
                </div>
              )}

              {error && <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

              <div className="flex gap-3 pt-4">
                {step > 0 && <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep((value) => value - 1)}>Back</Button>}
                <Button type="submit" variant="primary" className="flex-1 gap-2" loading={isLoading} disabled={step === steps.length - 1 && captchaEnabled && !captchaToken}>
                  {step === steps.length - 1 ? 'Create account' : 'Continue'}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </motion.form>
          </AnimatePresence>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account? <Link href="/signin" className="text-amber-400 font-medium hover:text-amber-300">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function FieldSelect({ label, options, register, error, className }: { label: string; options: string[]; register: Record<string, unknown>; error?: string; className?: string }) {
  return (
    <label className={className}>
      <span className="block text-sm font-medium text-slate-300 mb-1.5">{label}</span>
      <select className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/60 transition-all" {...register}>
        <option value="" className="bg-[#0a0a0a]">Select</option>
        {options.map((option) => <option key={option} value={option} className="bg-[#0a0a0a]">{option}</option>)}
      </select>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </label>
  );
}

function Checkbox({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block">
      <span className="flex items-start gap-3 text-sm text-slate-300">
        <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-white/10 bg-white/5 accent-amber-500" {...props} />
        {label}
      </span>
      {error && <p className="text-xs text-red-400 mt-1 ml-7">{error}</p>}
    </label>
  );
}
