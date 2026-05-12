'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AIChatbot } from '@/components/sections/ai-chatbot';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';
import { StatisticsSection } from '@/components/sections/statistics';
import { Badge } from '@/components/ui/badge';
import { Target, Heart, Globe, Zap } from 'lucide-react';

const timeline = [
  { year: '2020', title: 'Founded', description: 'Lordfunded was founded with a mission to democratize access to trading capital for traders worldwide.' },
  { year: '2021', title: 'First 1,000 Funded Traders', description: 'We reached our first milestone of 1,000 successfully funded traders across 50+ countries.' },
  { year: '2022', title: '$500K in Payouts', description: 'Crossed the $500,000 mark in total payouts, proving our commitment to trader success.' },
  { year: '2023', title: 'Global Expansion', description: 'Expanded to 100+ countries, launched MT5 support, and introduced our scaling program.' },
  { year: '2024', title: '$2.4M+ Payouts & 50K Traders', description: 'Became one of the world\'s leading prop trading firms with industry-leading profit splits.' },
  { year: '2025', title: 'The Future', description: 'Continuing to innovate with AI-powered trading tools and expanded funding up to $4M.' },
];

const values = [
  { icon: Target, title: 'Transparency', description: 'Clear rules, fair conditions, zero hidden fees. What you see is what you get.' },
  { icon: Heart, title: 'Trader-First', description: 'Every decision we make puts the trader\'s success and experience first.' },
  { icon: Globe, title: 'Global Access', description: 'We believe great traders exist everywhere. Our platform is built for the world.' },
  { icon: Zap, title: 'Speed & Reliability', description: 'Fast payouts, instant activation, and 99.9% platform uptime — always.' },
];

const team = [
  { name: 'Ahmad Al-Rashid', role: 'CEO & Co-Founder', bg: 'from-amber-600 to-amber-800' },
  { name: 'Sarah Mitchell', role: 'CTO & Co-Founder', bg: 'from-amber-500 to-amber-700' },
  { name: 'Omar Hassan', role: 'Head of Trading', bg: 'from-emerald-500 to-teal-600' },
  { name: 'Lisa Chen', role: 'Head of Operations', bg: 'from-pink-500 to-rose-600' },
  { name: 'James Rodriguez', role: 'Head of Growth', bg: 'from-amber-500 to-orange-600' },
  { name: 'Priya Sharma', role: 'Head of Support', bg: 'from-yellow-500 to-amber-600' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: '100px' }} className="pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="grid-bg absolute inset-0 opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-amber-600/8 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center relative">
          <FadeIn>
            <Badge variant="info" className="mb-6">Our Story</Badge>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6">
              We Exist to{' '}
              <span className="gradient-text">Fund Traders</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Lordfunded was born from a simple belief: great traders shouldn't be held back by a lack of capital.
              We built the platform we always wished existed.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left">
              <div className="space-y-6">
                <Badge variant="purple">Our Mission</Badge>
                <h2 className="text-4xl font-black text-white leading-tight">
                  Democratizing Access to <span className="gradient-text">Trading Capital</span>
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  Every great trader deserves the chance to grow their career with proper capital. Our mission is to identify skilled traders, fund them with real capital, and build a partnership based on mutual success.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  We've paid out over $2.4 million to traders worldwide and we're just getting started. When you win, we win — that's the Lordfunded promise.
                </p>
              </div>
            </FadeIn>
            <FadeIn direction="right">
              <div className="grid grid-cols-2 gap-4">
                {['$2.4M+ Paid Out', '50K+ Traders', '150+ Countries', '94% Success Rate'].map((stat, i) => (
                  <motion.div
                    key={stat}
                    whileHover={{ scale: 1.03 }}
                    className="glass rounded-2xl p-6 text-center border border-white/8 hover:border-amber-500/30 transition-all"
                  >
                    <p className="text-2xl font-black gradient-text">{stat.split(' ')[0]}</p>
                    <p className="text-sm text-slate-400 mt-1">{stat.split(' ').slice(1).join(' ')}</p>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">Our <span className="gradient-text">Core Values</span></h2>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="glass rounded-2xl p-6 border border-white/8 hover:border-amber-500/20 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
                    <value.icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{value.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">Our <span className="gradient-text">Journey</span></h2>
          </FadeIn>
          <div className="relative">
            {/* Line */}
            <div className="absolute left-[28px] sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/50 via-amber-600/50 to-transparent" />

            <div className="space-y-12">
              {timeline.map((item, i) => (
                <FadeIn key={item.year} delay={i * 0.1}>
                  <div className={`relative flex items-start gap-6 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                    {/* Dot */}
                    <div className="absolute left-[20px] sm:left-1/2 sm:-translate-x-1/2 w-4 h-4 rounded-full bg-amber-500 border-2 border-[#0a0a0a] shadow-lg shadow-amber-500/50 z-10 mt-1" />

                    {/* Content */}
                    <div className={`ml-14 sm:ml-0 sm:w-[calc(50%-2rem)] glass rounded-2xl p-5 border border-white/8 hover:border-amber-500/20 transition-all ${i % 2 === 0 ? 'sm:text-right' : 'sm:text-left'}`}>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{item.year}</span>
                      <h3 className="text-base font-bold text-white mt-1 mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">Meet the <span className="gradient-text">Team</span></h2>
            <p className="text-slate-400 mt-3">The passionate people behind Lordfunded</p>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {team.map((member) => (
              <StaggerItem key={member.name}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="glass rounded-2xl p-4 text-center border border-white/8 hover:border-amber-500/20 transition-all"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.bg} flex items-center justify-center mx-auto mb-3 text-white font-black text-xl shadow-lg`}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <p className="text-sm font-bold text-white">{member.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{member.role}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <StatisticsSection />
      <Footer />
      <AIChatbot />
    </main>
  );
}
