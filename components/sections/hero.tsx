'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, Shield, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReducedMotion, isMobileDevice } from '@/lib/use-reduced-motion';

const metrics = [
  { label: 'Total Payouts', value: '$2.4M+', icon: TrendingUp, color: 'text-emerald-400', border: 'border-emerald-500/20' },
  { label: 'Funded Traders', value: '50K+', icon: Users, color: 'text-sky-400', border: 'border-sky-500/20' },
  { label: 'Success Rate', value: '94%', icon: Zap, color: 'text-violet-400', border: 'border-violet-500/20' },
  { label: 'Countries', value: '150+', icon: Shield, color: 'text-cyan-400', border: 'border-cyan-500/20' },
];

const floatingCards = [
  { label: 'Payout Sent', value: '+$3,200', sub: 'USDT • 1 min ago', color: 'text-emerald-400', icon: '💸', delay: 0.6 },
  { label: 'Challenge Passed', value: 'Phase 1 ✓', sub: '$100K Account', color: 'text-sky-400', icon: '🏆', delay: 0.85 },
  { label: 'Profit Split', value: '90%', sub: 'Your earnings', color: 'text-violet-400', icon: '📈', delay: 1.1 },
];

function HeroVisual() {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const shouldReduceAnimations = prefersReducedMotion || isMobile;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 460, height: 460 }}>
      {/* Outer decorative rings - disable on mobile */}
      {!shouldReduceAnimations && (
        <>
          <div className="absolute inset-0 rounded-full border border-sky-500/8 animate-spin-slow" />
          <div className="absolute inset-6 rounded-full border border-violet-500/8 animate-spin-reverse" />
        </>
      )}

      {/* Glow orbs */}
      <div className="absolute w-72 h-72 rounded-full bg-sky-600/8 blur-3xl" />
      <div className="absolute w-48 h-48 rounded-full bg-violet-600/8 blur-2xl translate-x-12 translate-y-8" />

      {/* Center card — main trading panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          shouldReduceAnimations
            ? { duration: 0.3 }
            : { duration: 0.7, delay: 0.3, type: 'spring', damping: 18 }
        }
        className="relative z-10 w-52 rounded-3xl overflow-hidden shadow-2xl shadow-black/60"
        style={{ background: 'linear-gradient(145deg, rgba(14,165,233,0.15) 0%, rgba(8,20,40,0.95) 100%)', border: '1px solid rgba(14,165,233,0.25)' }}
      >
        {/* Card header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <span className="text-white font-black text-xs">FP</span>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">● Live</span>
          </div>
          <p className="text-xs text-slate-400 mb-0.5">Funded Account</p>
          <p className="text-2xl font-black text-white">$100,000</p>
        </div>

        {/* Mini chart bars */}
        <div className="px-5 pb-3">
          <div className="flex items-end gap-1 h-10">
            {[40, 55, 35, 70, 50, 80, 60, 90, 75, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={
                  shouldReduceAnimations
                    ? { duration: 0.2, delay: 0 }
                    : { duration: 0.6, delay: 0.5 + i * 0.05 }
                }
                className="flex-1 rounded-sm"
                style={{ background: i >= 7 ? 'linear-gradient(180deg,#0ea5e9,#22d3ee)' : 'rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-px bg-white/5 border-t border-white/8">
          <div className="px-4 py-3">
            <p className="text-xs text-slate-400">Profit</p>
            <p className="text-sm font-bold text-emerald-400">+$4,200</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-slate-400">Split</p>
            <p className="text-sm font-bold text-sky-400">90%</p>
          </div>
        </div>
      </motion.div>

      {/* Floating notification cards */}
      {!shouldReduceAnimations && floatingCards.map((card, i) => {
        const positions = [
          { top: '8%', right: '-2%' },
          { bottom: '28%', right: '-8%' },
          { bottom: '8%', left: '2%' },
        ];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? 20 : -20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.5, delay: card.delay, type: 'spring', damping: 20 }}
            className="absolute flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-xl"
            style={{
              ...positions[i],
              background: 'rgba(10,22,45,0.92)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              minWidth: 150,
            }}
          >
            <span className="text-lg">{card.icon}</span>
            <div>
              <p className="text-xs text-slate-400 leading-none mb-0.5">{card.label}</p>
              <p className={`text-sm font-bold ${card.color} leading-none`}>{card.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{card.sub}</p>
            </div>
          </motion.div>
        );
      })}

      {/* Orbiting dots - disable on mobile */}
      {!shouldReduceAnimations && (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div
              className="w-3 h-3 rounded-full bg-sky-400 shadow-lg shadow-sky-400/60 absolute"
              style={{ top: '4%', left: '50%', marginLeft: -6 }}
            />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 13, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-8"
          >
            <div
              className="w-2 h-2 rounded-full bg-violet-400 shadow-lg shadow-violet-400/60 absolute"
              style={{ bottom: '0%', left: '50%', marginLeft: -4 }}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ paddingTop: '100px' }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full bg-sky-600/6 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/6 blur-3xl" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 xl:gap-16 items-center min-h-[calc(100vh-100px)] py-12">

          {/* ── Left: Copy ── */}
          <div className="space-y-8 lg:pr-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="info">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse inline-block shrink-0" />
                Trusted by 50,000+ Traders Worldwide
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[clamp(2.8rem,6vw,4.5rem)] font-black leading-[1.08] tracking-tight"
            >
              <span className="text-white block">Trade with</span>
              <span className="gradient-text block">Confidence.</span>
              <span className="text-white block">Get Funded</span>
              <span className="text-slate-400 block">Today.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-400 leading-relaxed max-w-md"
            >
              Pass our evaluation and access up to{' '}
              <span className="text-white font-semibold">$200,000</span> in funded capital.
              Keep up to <span className="text-sky-400 font-semibold">90%</span> of your profits.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/signup">
                <Button variant="primary" size="lg" className="gap-2 shadow-2xl shadow-sky-500/25">
                  Start Challenge
                  <ArrowRight size={17} />
                </Button>
              </Link>
              <Link href="/trading-objectives">
                <Button variant="secondary" size="lg">View Objectives</Button>
              </Link>
            </motion.div>

            {/* Metrics row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2"
            >
              {metrics.map(({ label, value, icon: Icon, color, border }) => (
                <div
                  key={label}
                  className={`rounded-2xl p-4 text-center border ${border} bg-white/3 space-y-1.5`}
                >
                  <Icon size={15} className={`${color} mx-auto`} />
                  <p className={`text-xl font-black ${color}`}>{value}</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Visual ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.25, type: 'spring', damping: 22 }}
            className="hidden lg:flex justify-center items-center"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#050d1a] to-transparent pointer-events-none" />
    </section>
  );
}
