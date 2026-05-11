'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Users, DollarSign, TrendingUp, Copy, Check, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AIChatbot } from '@/components/sections/ai-chatbot';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/animations/animated-counter';

const commissionTiers = [
  { name: 'Starter', referrals: '1-10', commission: '10%', color: 'from-sky-500/20 to-sky-500/5', border: 'border-sky-500/30' },
  { name: 'Silver', referrals: '11-50', commission: '15%', color: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/30' },
  { name: 'Gold', referrals: '51-200', commission: '20%', color: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/30' },
  { name: 'Elite', referrals: '200+', commission: '25%', color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/30' },
];

const affiliateStats = [
  { label: 'Avg Monthly Earnings', value: '$1,200', icon: DollarSign },
  { label: 'Active Affiliates', value: '5,000+', icon: Users },
  { label: 'Total Commissions Paid', value: '$450K+', icon: TrendingUp },
];

const howItWorks = [
  { step: '01', title: 'Sign Up Free', description: 'Create your affiliate account in under 2 minutes. No investment required.' },
  { step: '02', title: 'Share Your Link', description: 'Get your unique referral link and share it on social media, YouTube, or your blog.' },
  { step: '03', title: 'Earn Commissions', description: 'Earn 10-25% commission on every challenge purchase made through your link.' },
  { step: '04', title: 'Get Paid', description: 'Withdraw your commissions weekly via crypto, bank transfer, or PayPal.' },
];

export default function AffiliatePage() {
  const [copied, setCopied] = useState(false);
  const mockLink = 'https://fundingpips.com/ref/YOURCODE';

  const handleCopy = () => {
    navigator.clipboard.writeText(mockLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#050d1a]">
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: '100px' }} className="pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="grid-bg absolute inset-0 opacity-25" />
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl animate-float" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-sky-600/10 blur-3xl animate-float-delayed" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center relative">
          <FadeIn>
            <Badge variant="purple" className="mb-6">Affiliate Program</Badge>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6">
              Earn Up to{' '}
              <span className="gradient-text">25%</span>
              <br />Per Referral
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Join our affiliate program and earn generous commissions for every trader you refer to FundingPips.
              No cap on earnings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button variant="primary" size="lg" className="gap-2">
                  Become an Affiliate
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {affiliateStats.map(({ label, value, icon: Icon }) => (
              <StaggerItem key={label}>
                <div className="glass rounded-3xl p-8 text-center border border-white/8 hover:border-violet-500/20 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4 text-violet-400">
                    <Icon size={22} />
                  </div>
                  <p className="text-4xl font-black gradient-text mb-1">
                    <AnimatedCounter value={value} />
                  </p>
                  <p className="text-sm text-slate-400">{label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">
              Commission <span className="gradient-text">Tiers</span>
            </h2>
            <p className="text-slate-400 mt-3">The more you refer, the more you earn</p>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {commissionTiers.map((tier, i) => (
              <StaggerItem key={tier.name}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`relative rounded-3xl p-6 border ${tier.border} overflow-hidden transition-all duration-300`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${tier.color}`} />
                  <div className="relative z-10 text-center">
                    <div className="text-4xl font-black mb-2">
                      {['🌱', '🥈', '🥇', '💎'][i]}
                    </div>
                    <h3 className="text-xl font-black text-white mb-1">{tier.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">{tier.referrals} referrals</p>
                    <div className="text-5xl font-black gradient-text mb-2">{tier.commission}</div>
                    <p className="text-sm text-slate-400">commission</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">
              How It <span className="gradient-text">Works</span>
            </h2>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step) => (
              <StaggerItem key={step.step}>
                <div className="glass rounded-2xl p-6 border border-white/8 hover:border-sky-500/20 transition-all relative">
                  <div className="text-6xl font-black text-white/5 absolute top-4 right-4">{step.step}</div>
                  <div className="relative z-10">
                    <div className="text-2xl font-black gradient-text-blue mb-3">{step.step}</div>
                    <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Mock Affiliate Dashboard Preview */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-10">
            <h2 className="text-3xl font-black text-white">
              Your <span className="gradient-text">Dashboard Preview</span>
            </h2>
          </FadeIn>
          <FadeIn>
            <div className="glass rounded-3xl p-6 border border-white/8 space-y-6">
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Referrals', value: '24' },
                  { label: 'Converted', value: '18' },
                  { label: 'Pending Earnings', value: '$340' },
                  { label: 'Total Earned', value: '$2,180' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/3 rounded-2xl p-4 text-center">
                    <p className="text-xl font-black text-sky-400">{value}</p>
                    <p className="text-xs text-slate-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Referral link */}
              <div>
                <p className="text-sm text-slate-400 mb-2">Your Referral Link</p>
                <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                  <Share2 size={15} className="text-slate-400 shrink-0" />
                  <p className="text-sm text-slate-300 flex-1 truncate">{mockLink}</p>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors shrink-0"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Recent referrals */}
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-3">Recent Referrals</p>
                <div className="space-y-2">
                  {[
                    { user: 'j***@gmail.com', plan: '$50K Challenge', commission: '$37.50', status: 'completed' },
                    { user: 'a***@outlook.com', plan: '$100K Challenge', commission: '$74.75', status: 'completed' },
                    { user: 'm***@yahoo.com', plan: '$10K Challenge', commission: '$14.85', status: 'pending' },
                  ].map((ref, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-3 text-sm">
                      <span className="text-slate-400">{ref.user}</span>
                      <span className="text-slate-300 hidden sm:block">{ref.plan}</span>
                      <span className="text-emerald-400 font-medium">{ref.commission}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${ref.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {ref.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
      <AIChatbot />
    </main>
  );
}
