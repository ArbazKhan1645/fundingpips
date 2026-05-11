'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AIChatbot } from '@/components/sections/ai-chatbot';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockChallenges } from '@/mock/challenges';
import { formatCurrency } from '@/lib/utils';

const rules = [
  { rule: 'Minimum Trading Days', phase1: '5 days', phase2: '5 days', funded: 'No minimum' },
  { rule: 'Profit Target', phase1: '8%', phase2: '5%', funded: '—' },
  { rule: 'Maximum Daily Loss', phase1: '5%', phase2: '5%', funded: '5%' },
  { rule: 'Maximum Total Loss', phase1: '10%', phase2: '10%', funded: '10%' },
  { rule: 'Leverage', phase1: '1:100', phase2: '1:100', funded: '1:100' },
  { rule: 'Profit Split', phase1: '—', phase2: '—', funded: 'Up to 90%' },
  { rule: 'News Trading', phase1: '✓ Allowed', phase2: '✓ Allowed', funded: '✓ Allowed' },
  { rule: 'EA / Robots', phase1: '✓ Allowed', phase2: '✓ Allowed', funded: '✓ Allowed' },
  { rule: 'Weekend Holding', phase1: '✓ Allowed', phase2: '✓ Allowed', funded: '✓ Allowed' },
  { rule: 'Copy Trading', phase1: '✓ Allowed', phase2: '✓ Allowed', funded: '✓ Allowed' },
  { rule: 'Hedging', phase1: '✓ Allowed', phase2: '✓ Allowed', funded: '✓ Allowed' },
];

export default function TradingObjectivesPage() {
  const [selectedSize, setSelectedSize] = useState(mockChallenges[1]);

  return (
    <main className="min-h-screen bg-[#050d1a]">
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: '100px' }} className="pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="grid-bg absolute inset-0 opacity-25" />
          <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-sky-600/8 blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full bg-violet-600/8 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center relative">
          <FadeIn>
            <Badge variant="info" className="mb-4">Trading Rules</Badge>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-4">
              Trading <span className="gradient-text">Objectives</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              Clear, transparent rules designed for professional traders. No hidden tricks.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Account Size Selector */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-center text-sm text-slate-400 mb-5 font-medium uppercase tracking-wider">
              Select Account Size
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {mockChallenges.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedSize(c)}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200 border ${
                    selectedSize.id === c.id
                      ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/30'
                      : 'glass border-white/10 text-slate-300 hover:border-sky-500/40 hover:text-sky-400'
                  }`}
                >
                  {formatCurrency(c.accountSize)}
                </button>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Phase cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Phase 1', subtitle: 'Evaluation',
                borderColor: 'border-sky-500/30', gradientFrom: 'from-sky-600/15',
                items: [
                  { label: 'Account Size', value: formatCurrency(selectedSize.accountSize) },
                  { label: 'Profit Target', value: `${selectedSize.phase1ProfitTarget}%` },
                  { label: 'Daily Loss Limit', value: `${selectedSize.maxDailyLoss}%` },
                  { label: 'Max Loss', value: `${selectedSize.maxTotalLoss}%` },
                  { label: 'Min Trading Days', value: `${selectedSize.minTradingDays} days` },
                  { label: 'Challenge Fee', value: `$${selectedSize.price}` },
                ],
              },
              {
                title: 'Phase 2', subtitle: 'Verification',
                borderColor: 'border-violet-500/30', gradientFrom: 'from-violet-600/15',
                items: [
                  { label: 'Account Size', value: formatCurrency(selectedSize.accountSize) },
                  { label: 'Profit Target', value: `${selectedSize.phase2ProfitTarget}%` },
                  { label: 'Daily Loss Limit', value: `${selectedSize.maxDailyLoss}%` },
                  { label: 'Max Loss', value: `${selectedSize.maxTotalLoss}%` },
                  { label: 'Min Trading Days', value: `${selectedSize.minTradingDays} days` },
                  { label: 'Fee', value: 'Free' },
                ],
              },
              {
                title: 'Funded Account', subtitle: 'Real Capital',
                borderColor: 'border-emerald-500/30', gradientFrom: 'from-emerald-600/15',
                items: [
                  { label: 'Account Size', value: formatCurrency(selectedSize.accountSize) },
                  { label: 'Profit Split', value: `${selectedSize.profitSplit}%` },
                  { label: 'Daily Loss Limit', value: `${selectedSize.maxDailyLoss}%` },
                  { label: 'Max Loss', value: `${selectedSize.maxTotalLoss}%` },
                  { label: 'Payout Frequency', value: 'On-demand' },
                  { label: 'Scaling', value: 'Up to $4M' },
                ],
              },
            ].map((phase) => (
              <StaggerItem key={phase.title}>
                <div className={`glass rounded-3xl p-6 border ${phase.borderColor} relative overflow-hidden h-full`}>
                  <div className={`absolute inset-0 bg-gradient-to-b ${phase.gradientFrom} to-transparent`} />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-5">
                      <h3 className="text-lg font-black text-white">{phase.title}</h3>
                      <p className="text-sm text-slate-400 mt-0.5">{phase.subtitle}</p>
                    </div>
                    <ul className="space-y-3 flex-1">
                      {phase.items.map(({ label, value }) => (
                        <li key={label} className="flex items-center justify-between text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                          <span className="text-slate-400">{label}</span>
                          <span className="font-bold text-white">{value}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <Link href="/signup">
                        <Button variant="primary" className="w-full">Start Now</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Challenge comparison */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-10 text-center">
            <h2 className="text-3xl font-black text-white">
              All Plans <span className="gradient-text">Compared</span>
            </h2>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {mockChallenges.map((challenge) => (
              <StaggerItem key={challenge.id}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl p-5 border transition-all ${
                    challenge.popular
                      ? 'bg-gradient-to-b from-sky-600/20 to-transparent border-sky-500/40'
                      : 'glass border-white/8 hover:border-sky-500/20'
                  }`}
                >
                  {challenge.popular && (
                    <Badge variant="info" className="mb-3 text-xs">Most Popular</Badge>
                  )}
                  <h3 className="font-bold text-white mb-0.5">{challenge.name}</h3>
                  <p className="text-3xl font-black gradient-text-blue mb-1">${challenge.price}</p>
                  <p className="text-sm text-slate-400 mb-4">{formatCurrency(challenge.accountSize)} Account</p>
                  <ul className="space-y-2 mb-5">
                    {challenge.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check size={12} className="text-sky-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button variant={challenge.popular ? 'primary' : 'secondary'} className="w-full" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Rules Table */}
      <section className="py-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-10 text-center">
            <h2 className="text-3xl font-black text-white">
              Complete <span className="gradient-text">Rule Book</span>
            </h2>
          </FadeIn>
          <FadeIn>
            <div className="glass rounded-3xl overflow-hidden border border-white/8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/3">
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400 min-w-48">Rule</th>
                      <th className="text-center px-6 py-4 text-sm font-semibold text-sky-400 min-w-32">Phase 1</th>
                      <th className="text-center px-6 py-4 text-sm font-semibold text-violet-400 min-w-32">Phase 2</th>
                      <th className="text-center px-6 py-4 text-sm font-semibold text-emerald-400 min-w-32">Funded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((row, i) => (
                      <tr key={row.rule} className={`border-b border-white/5 hover:bg-white/2 transition-colors ${i % 2 === 1 ? 'bg-white/1' : ''}`}>
                        <td className="px-6 py-4 text-sm text-white font-medium">{row.rule}</td>
                        <td className="px-6 py-4 text-sm text-slate-300 text-center">{row.phase1}</td>
                        <td className="px-6 py-4 text-sm text-slate-300 text-center">{row.phase2}</td>
                        <td className="px-6 py-4 text-sm text-slate-300 text-center">{row.funded}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
