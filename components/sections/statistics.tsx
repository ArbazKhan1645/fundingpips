'use client';

import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';
import { AnimatedCounter } from '@/components/animations/animated-counter';
import { Badge } from '@/components/ui/badge';

const stats = [
  { label: 'Total Payouts', value: '$2.4M+', description: 'Paid to funded traders worldwide' },
  { label: 'Funded Traders', value: '50,000+', description: 'Active funded accounts globally' },
  { label: 'Success Rate', value: '94%', description: 'Phase completion rate' },
  { label: 'Countries', value: '150+', description: 'Traders from around the world' },
  { label: 'Avg Payout', value: '$3,800', description: 'Average monthly trader payout' },
  { label: 'Instruments', value: '300+', description: 'Tradable currency pairs & assets' },
];

export function StatisticsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-amber-600/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <FadeIn className="text-center mb-16">
          <Badge variant="success" className="mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Statistics
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Trusted by Traders{' '}
            <span className="gradient-text">Globally</span>
          </h2>
          <p className="text-lg text-slate-400">Our numbers speak for themselves</p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <StaggerItem key={stat.label}>
              <div className="glass rounded-3xl p-8 text-center space-y-2 border border-white/5 hover:border-amber-500/20 transition-all duration-300 group hover:-translate-y-1">
                <div className="text-4xl sm:text-5xl font-black gradient-text group-hover:scale-110 transition-transform duration-300">
                  <AnimatedCounter value={stat.value} />
                </div>
                <p className="text-base font-semibold text-white">{stat.label}</p>
                <p className="text-sm text-slate-500">{stat.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
