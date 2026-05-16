'use client';

import { useTranslations } from 'next-intl';
import { Send, MessageSquare, Video, Camera } from 'lucide-react';
import { FadeIn } from '@/components/animations/fade-in';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { BrandLogo } from '@/components/brand/logo';

const footerLinks = {
  platform: [
    { labelKey: 'objectives', href: '/trading-objectives' },
    { labelKey: 'pricing', href: '/trading-objectives' },
    { labelKey: 'dashboard', href: '/dashboard' },
    { labelKey: 'payouts', href: '/dashboard' },
  ],
  company: [
    { labelKey: 'about', href: '/about' },
    { labelKey: 'affiliate', href: '/affiliate' },
    { labelKey: 'blog', href: '#' },
    { labelKey: 'careers', href: '#' },
  ],
  support: [
    { labelKey: 'faq', href: '/faq' },
    { labelKey: 'discord', href: '#' },
    { labelKey: 'contact', href: '#' },
    { labelKey: 'rules', href: '/trading-objectives' },
  ],
  legal: [
    { labelKey: 'privacy', href: '#' },
    { labelKey: 'terms', href: '#' },
    { labelKey: 'risk', href: '#' },
    { labelKey: 'refund', href: '#' },
  ],
} as const;

const socials = [
  { icon: MessageSquare, href: '#', label: 'Twitter' },
  { icon: Camera, href: '#', label: 'Instagram' },
  { icon: Video, href: '#', label: 'YouTube' },
  { icon: Send, href: '#', label: 'Telegram' },
];

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="relative border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-amber-600/5 blur-3xl" />
        <div className="absolute -top-40 right-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          <FadeIn className="lg:col-span-2">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <BrandLogo className="h-10 w-10" textClassName="text-xl" />
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">{t('description')}</p>

              <div className="flex items-center gap-3">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-xl glass border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-all duration-200"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('newsletter')}</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder={t('newsletterPlaceholder')}
                    className="flex-1 h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                  <Button variant="primary" size="sm" className="px-3" aria-label={t('subscribe')}>
                    <Send size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>

          {Object.entries(footerLinks).map(([category, links], i) => (
            <FadeIn key={category} delay={i * 0.05} className="lg:col-span-1">
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">{t(`sections.${category}.title`)}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.labelKey}>
                      <Link href={link.href} className="text-sm text-slate-400 hover:text-amber-400 transition-colors duration-200">
                        {t(`sections.${category}.links.${link.labelKey}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Lordfunded. {t('rights')}</p>
          <p className="text-xs text-slate-600 max-w-xl text-center">{t('risk')}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{t('trustedBy')}</span>
            <span className="text-xs font-semibold gradient-text-blue">{t('traders')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
