'use client';

import { Marquee } from '@/components/animations/marquee';
import { FadeIn } from '@/components/animations/fade-in';

const brands = [
  { name: 'MetaTrader 4', logo: 'MT4' },
  { name: 'MetaTrader 5', logo: 'MT5' },
  { name: 'TradingView', logo: 'TV' },
  { name: 'cTrader', logo: 'cT' },
  { name: 'NinjaTrader', logo: 'NT' },
  { name: 'ThinkTrader', logo: 'TT' },
  { name: 'OANDA', logo: 'OA' },
  { name: 'IC Markets', logo: 'IC' },
];

const paymentBrands = [
  'Visa', 'Mastercard', 'USDT', 'Bitcoin', 'Bank Wire', 'Skrill', 'Neteller',
];

export function TrustedBySection() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <FadeIn>
          <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider mb-8">
            Trusted platforms & payment methods
          </p>
        </FadeIn>
      </div>

      {/* Platforms marquee */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <Marquee pauseOnHover>
          {brands.map(({ name, logo }) => (
            <div
              key={name}
              className="flex items-center gap-3 mx-6 px-6 py-4 glass rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all duration-300 min-w-40"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600/20 to-amber-500/20 border border-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-amber-400">{logo}</span>
              </div>
              <span className="text-sm font-medium text-slate-300 whitespace-nowrap">{name}</span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* Payment methods marquee */}
      <div className="relative mt-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <Marquee reverse pauseOnHover speed="fast">
          {paymentBrands.map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 mx-4 px-5 py-3 glass rounded-xl border border-white/5 hover:border-amber-600/30 transition-all duration-300"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm font-medium text-slate-400 whitespace-nowrap">{name}</span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
