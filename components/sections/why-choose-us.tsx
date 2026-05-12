'use client';

import { motion } from 'framer-motion';
import {
  Zap, Shield, TrendingUp, Globe, Clock, Award,
  HeartHandshake, Banknote
} from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Zap,
    title: 'Instant Activation',
    description: 'Your challenge account is activated immediately after payment. No waiting, no delays.',
    color: 'from-amber-500/20 to-yellow-500/10',
    iconColor: 'text-amber-400',
    borderColor: 'hover:border-amber-500/30',
  },
  {
    icon: Banknote,
    title: 'Fast Payouts',
    description: 'Request withdrawals anytime and receive funds within 1-2 business days to your preferred method.',
    color: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-400',
    borderColor: 'hover:border-emerald-500/30',
  },
  {
    icon: Shield,
    title: 'Fair Risk Rules',
    description: 'Transparent drawdown limits with no tricky conditions. 5% daily, 10% max — that\'s it.',
    color: 'from-amber-600/20 to-amber-500/10',
    iconColor: 'text-amber-500',
    borderColor: 'hover:border-amber-600/30',
  },
  {
    icon: TrendingUp,
    title: '90% Profit Split',
    description: 'Industry-leading profit split. Keep up to 90% of everything you earn on your funded account.',
    color: 'from-yellow-500/20 to-amber-600/10',
    iconColor: 'text-yellow-400',
    borderColor: 'hover:border-yellow-500/30',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Available in 150+ countries. Trade Forex, indices, commodities, and crypto instruments.',
    color: 'from-amber-400/20 to-amber-500/10',
    iconColor: 'text-amber-300',
    borderColor: 'hover:border-amber-400/30',
  },
  {
    icon: Clock,
    title: 'No Time Limits',
    description: 'No rush — take your time to pass the evaluation. Trade at your own pace with no deadlines.',
    color: 'from-pink-500/20 to-rose-500/10',
    iconColor: 'text-pink-400',
    borderColor: 'hover:border-pink-500/30',
  },
  {
    icon: Award,
    title: 'Scaling Plan',
    description: 'Grow your funded account up to $4M through our performance-based scaling program.',
    color: 'from-amber-500/20 to-yellow-500/10',
    iconColor: 'text-amber-400',
    borderColor: 'hover:border-amber-500/30',
  },
  {
    icon: HeartHandshake,
    title: '24/5 Support',
    description: 'Our dedicated team is always ready to help via live chat, Discord, and email.',
    color: 'from-rose-500/20 to-pink-500/10',
    iconColor: 'text-rose-400',
    borderColor: 'hover:border-rose-500/30',
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <Badge variant="purple" className="mb-4">Why Lordfunded</Badge>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Why Thousands Choose{' '}
            <span className="gradient-text">Lordfunded</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Built for serious traders who demand the best tools, fairest rules, and fastest payouts.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                className={`group relative rounded-2xl p-6 glass border border-white/8 ${feature.borderColor} transition-all duration-300 h-full cursor-default`}
              >
                {/* Gradient bg */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${feature.iconColor}`}>
                    <feature.icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
