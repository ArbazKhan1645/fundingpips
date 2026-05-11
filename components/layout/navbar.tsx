'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Trading Objectives', href: '/trading-objectives' },
  { label: 'About Us', href: '/about' },
  { label: 'Affiliate', href: '/affiliate' },
  { label: 'FAQ', href: '/faq' },
];

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', flag: '🇦🇪' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
];

// Announcement bar height = 36px, Navbar height = 64px → total = 100px
export const HEADER_HEIGHT = 100;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setLangOpen(false);
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* ── Announcement Bar ── */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          scrolled ? 'h-0 opacity-0' : 'h-9 opacity-100'
        )}
      >
        <div className="h-9 flex items-center bg-gradient-to-r from-sky-600/20 via-violet-600/20 to-cyan-600/20 border-b border-white/5 overflow-hidden">
          <div className="animate-marquee flex whitespace-nowrap">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="flex items-center gap-8 px-8 text-xs text-slate-300">
                <span>🎉 Over $2.4M+ paid out to funded traders</span>
                <span className="text-sky-400">★</span>
                <span>⚡ Instant account activation after payment</span>
                <span className="text-sky-400">★</span>
                <span>🏆 90% profit split — industry leading</span>
                <span className="text-sky-400">★</span>
                <span>🌍 150+ countries supported</span>
                <span className="text-sky-400">★</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <div
        className={cn(
          'h-16 transition-all duration-300',
          scrolled
            ? 'bg-[#050d1a]/95 backdrop-blur-xl border-b border-white/8 shadow-2xl shadow-black/40'
            : 'bg-[#050d1a]/70 backdrop-blur-md border-b border-white/5'
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/30 shrink-0">
              <span className="text-white font-black text-sm">LF</span>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              Lord<span className="gradient-text-blue">funded</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  pathname === link.href || pathname.endsWith(link.href)
                    ? 'text-sky-400 bg-sky-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Globe size={14} />
                <span>{currentLang.flag} {currentLang.code.toUpperCase()}</span>
                <ChevronDown
                  size={12}
                  className={cn('transition-transform duration-200', langOpen && 'rotate-180')}
                />
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
                        onClick={() => { setCurrentLang(lang); setLangOpen(false); }}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                          currentLang.code === lang.code
                            ? 'bg-sky-500/20 text-sky-400'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-[#0a1628]/98 backdrop-blur-xl border-b border-white/8 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    pathname === link.href || pathname.endsWith(link.href)
                      ? 'bg-sky-500/15 text-sky-400'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/8">
                <Link href="/signin" className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
