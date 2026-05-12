'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AIChatbot } from '@/components/sections/ai-chatbot';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';
import { Badge } from '@/components/ui/badge';
import { mockFAQ } from '@/mock/faq';

const categories = ['All', 'General', 'Trading Rules', 'Payouts', 'Account', 'Support'];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = mockFAQ.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: '100px' }} className="pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="grid-bg absolute inset-0 opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-amber-600/8 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <FadeIn className="pt-10">
            <Badge variant="info" className="mb-4">Support</Badge>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">
              Frequently Asked{' '}
              <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8">
              Everything you need to know about Lordfunded
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 glass rounded-2xl border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 text-sm transition-all"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Categories */}
      <section className="py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                      : 'glass border border-white/10 text-slate-300 hover:text-white hover:border-amber-500/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Accordion */}
      <section className="py-12 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <FadeIn className="text-center py-16">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-slate-400">No results found. Try a different search term.</p>
            </FadeIn>
          ) : (
            <StaggerContainer className="space-y-3">
              {filtered.map((item) => (
                <StaggerItem key={item.id}>
                  <motion.div
                    className="glass rounded-2xl border border-white/8 overflow-hidden hover:border-amber-500/20 transition-all"
                    whileHover={{ scale: 1.002 }}
                  >
                    <button
                      onClick={() => setOpenId(openId === item.id ? null : item.id)}
                      className="w-full flex items-center justify-between gap-4 p-6 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <Badge variant="info" className="shrink-0 mt-0.5">{item.category}</Badge>
                        <span className="font-semibold text-white">{item.question}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: openId === item.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-slate-400 shrink-0"
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {openId === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 border-t border-white/5">
                            <p className="text-slate-300 leading-relaxed pt-4 text-sm">{item.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-12 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <div className="glass rounded-3xl p-8 border border-white/8">
              <p className="text-2xl mb-4">💬</p>
              <h3 className="text-xl font-black text-white mb-2">Still have questions?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Our support team is available 24/5. Use the chat button below or join our Discord community.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="#" className="px-6 py-3 glass rounded-xl border border-white/10 text-sm text-slate-300 hover:text-white hover:border-amber-500/30 transition-all">
                  Join Discord
                </a>
                <a href="mailto:support@lordfunded.com" className="px-6 py-3 bg-amber-500 rounded-xl text-sm text-black font-medium hover:bg-amber-400 transition-all">
                  Email Support
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
      <AIChatbot />
    </main>
  );
}
