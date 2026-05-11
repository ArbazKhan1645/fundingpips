'use client';

import { motion } from 'framer-motion';
import { Check, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockChallenges } from '@/mock/challenges';
import { formatCurrency } from '@/lib/utils';

export function ChallengeCardsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-sky-600/5 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-violet-600/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <Badge variant="info" className="mb-4">Funding Programs</Badge>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Choose Your{' '}
            <span className="gradient-text">Challenge</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Start your trading journey with our flexible evaluation programs and receive funded capital.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {mockChallenges.map((challenge, i) => (
            <StaggerItem key={challenge.id}>
              <motion.div
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ duration: 0.3, type: 'spring', damping: 20 }}
                className={`relative rounded-3xl p-6 h-full flex flex-col transition-all duration-300 ${
                  challenge.popular
                    ? 'bg-gradient-to-b from-sky-600/20 to-violet-600/10 border border-sky-500/30 shadow-2xl shadow-sky-500/10'
                    : 'glass border border-white/8 hover:border-sky-500/20'
                }`}
              >
                {challenge.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="info" className="shadow-lg shadow-sky-500/30">
                      <Star size={10} fill="currentColor" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{challenge.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black gradient-text-blue">
                      ${challenge.price}
                    </span>
                    <span className="text-sm text-slate-400">one-time</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {formatCurrency(challenge.accountSize)} Account
                  </p>
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'Phase 1', value: `${challenge.phase1ProfitTarget}%` },
                    { label: 'Phase 2', value: `${challenge.phase2ProfitTarget}%` },
                    { label: 'Max Loss', value: `${challenge.maxTotalLoss}%` },
                    { label: 'Split', value: `${challenge.profitSplit}%` },
                  ].map(({ label, value }) => (
                    <div key={label} className="glass rounded-xl p-3 text-center">
                      <p className="text-sm font-bold text-sky-400">{value}</p>
                      <p className="text-xs text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {challenge.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={10} className="text-sky-400" />
                      </div>
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="/signup">
                  <Button
                    variant={challenge.popular ? 'primary' : 'secondary'}
                    className="w-full gap-2"
                  >
                    Get Started
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn className="text-center mt-10">
          <p className="text-sm text-slate-500">
            All challenges include a{' '}
            <span className="text-sky-400 font-medium">14-day money-back guarantee</span>.
            No hidden fees.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
