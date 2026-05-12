'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Rocket } from 'lucide-react';
import { FadeIn } from '@/components/animations/fade-in';
import { Button } from '@/components/ui/button';

export function CTABanner() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <motion.div
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 via-amber-500/20 to-yellow-600/20" />
            <div className="absolute inset-0 grid-bg opacity-20" />

            {/* Glow orbs */}
            <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-amber-600/20 blur-3xl" />

            {/* Border */}
            <div className="absolute inset-0 rounded-3xl border border-white/10" />

            {/* Content */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 p-10 md:p-16">
              <div className="text-center lg:text-left max-w-2xl">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Rocket size={18} className="text-black" />
                  </div>
                  <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                    Start Today
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                  Ready to Become a{' '}
                  <span className="gradient-text">Funded Trader?</span>
                </h2>
                <p className="text-lg text-slate-300">
                  Join 50,000+ traders who already trade with Lordfunded capital.
                  Start your challenge today — risk-free with our 14-day guarantee.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0">
                <Link href="/signup">
                  <Button variant="primary" size="lg" className="gap-2 shadow-2xl shadow-amber-500/30 whitespace-nowrap">
                    Get Funded Now
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link href="/trading-objectives">
                  <Button variant="secondary" size="lg" className="whitespace-nowrap">
                    View Objectives
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
