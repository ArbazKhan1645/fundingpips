'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/animations/fade-in';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Video, Camera } from 'lucide-react';

const footerLinks = {
  Platform: [
    { label: 'Trading Objectives', href: '/trading-objectives' },
    { label: 'Pricing', href: '/trading-objectives' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Payouts', href: '/dashboard' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Affiliate Program', href: '/affiliate' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Discord Community', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Trading Rules', href: '/trading-objectives' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Risk Disclosure', href: '#' },
    { label: 'Refund Policy', href: '#' },
  ],
};

const socials = [
  { icon: MessageSquare, href: '#', label: 'Twitter' },
  { icon: Camera, href: '#', label: 'Instagram' },
  { icon: Video, href: '#', label: 'YouTube' },
  { icon: Send, href: '#', label: 'Telegram' },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-sky-600/5 blur-3xl" />
        <div className="absolute -top-40 right-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl" />
      </div>

      {/* Gradient top line */}
      <div className="h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          {/* Brand column */}
          <FadeIn className="lg:col-span-2">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/30">
                  <span className="text-white font-black">FP</span>
                </div>
                <span className="font-bold text-white text-xl">
                  Funding<span className="gradient-text-blue">Pips</span>
                </span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                The world's leading prop trading firm. Get funded and trade with confidence. Over $2.4M+ paid out to traders worldwide.
              </p>

              {/* Social links */}
              <div className="flex items-center gap-3">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-xl glass border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all duration-200"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>

              {/* Newsletter */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Newsletter</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 transition-all"
                  />
                  <Button variant="primary" size="sm" className="px-3">
                    <Send size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links], i) => (
            <FadeIn key={category} delay={i * 0.05} className="lg:col-span-1">
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} FundingPips. All rights reserved.
          </p>
          <p className="text-xs text-slate-600 max-w-xl text-center">
            Risk Disclosure: Trading financial instruments involves substantial risk of loss. Past performance does not guarantee future results.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Trusted by</span>
            <span className="text-xs font-semibold gradient-text-blue">50,000+ traders</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
