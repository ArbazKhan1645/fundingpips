'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { BrandLogo } from '@/components/brand/logo';

const navLinks = [
  { labelKey: 'objectives', href: '/trading-objectives' },
  { labelKey: 'about', href: '/about' },
  { labelKey: 'affiliate', href: '/affiliate' },
  { labelKey: 'faq', href: '/faq' },
] as const;

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'ur', label: 'اردو' },
] as const;

export const HEADER_HEIGHT = 100;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('nav');
  const announcement = useTranslations('announcement');
  const currentLang = languages.find((lang) => lang.code === locale) ?? languages[0];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLocale = (nextLocale: (typeof languages)[number]['code']) => {
    router.replace(pathname, { locale: nextLocale });
    setIsOpen(false);
    setLangOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      <div className={cn('overflow-hidden transition-all duration-300', scrolled ? 'h-0 opacity-0' : 'h-9 opacity-100')}>
        <div className="h-9 flex items-center bg-gradient-to-r from-amber-600/20 via-amber-500/20 to-yellow-600/20 border-b border-white/5 overflow-hidden">
          <div className="animate-marquee flex whitespace-nowrap">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="flex items-center gap-8 px-8 text-xs text-slate-300">
                <span>{announcement('payouts')}</span>
                <span className="text-amber-400">*</span>
                <span>{announcement('activation')}</span>
                <span className="text-amber-400">*</span>
                <span>{announcement('split')}</span>
                <span className="text-amber-400">*</span>
                <span>{announcement('countries')}</span>
                <span className="text-amber-400">*</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'h-16 transition-all duration-300',
          scrolled
            ? 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/8 shadow-2xl shadow-black/40'
            : 'bg-[#0a0a0a]/70 backdrop-blur-md border-b border-white/5'
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <BrandLogo className="h-9 w-9" textClassName="text-lg" />
          </Link>

          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  pathname === link.href
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Globe size={14} />
                <span>{currentLang.code.toUpperCase()}</span>
                <ChevronDown size={12} className={cn('transition-transform duration-200', langOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 glass-strong rounded-xl p-1 min-w-36 shadow-2xl border border-white/10 z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => switchLocale(lang.code)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                          locale === lang.code
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/signin">
              <Button variant="ghost" size="sm">{t('signIn')}</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">{t('getStarted')}</Button>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-[#0a0a0a]/98 backdrop-blur-xl border-b border-white/8 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    pathname === link.href
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/8">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => switchLocale(lang.code)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm transition-all',
                      locale === lang.code
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/8">
                <Link href="/signin" className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">{t('signIn')}</Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">{t('getStarted')}</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
