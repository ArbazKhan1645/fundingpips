'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle, Mail, FileText, ExternalLink,
  ChevronDown, ChevronUp, Send, CheckCircle,
  BookOpen, Users, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const faqs = [
  { q: 'How long do I have to complete the challenge?', a: 'There are no time limits on any of our challenges. Take as long as you need to reach your profit targets while staying within the drawdown rules.' },
  { q: 'When and how are payouts processed?', a: 'Payouts are processed within 1–2 business days. We support USDT (TRC20/ERC20), bank transfer, Skrill, and Neteller. The minimum payout is $50.' },
  { q: 'Can I trade news events?', a: 'Yes, news trading is allowed. However, we recommend managing risk carefully around high-impact economic releases.' },
  { q: 'What happens if I breach a rule?', a: 'If you breach the daily drawdown (5%) or max drawdown (10%) limit, the account is automatically closed. You can repurchase a challenge at any time.' },
  { q: 'Is there a scaling plan available?', a: 'Yes! Funded accounts can scale from $10K up to $4M. Every 3 months of consistent profitability unlocks the next tier.' },
];

const channels = [
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Get instant answers from our support team — average response under 2 minutes.',
    action: 'Start Chat',
    color: 'from-amber-600 to-amber-400',
    shadow: 'shadow-amber-500/20',
    badge: 'Online',
    badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us a detailed message and we\'ll reply within 24 hours.',
    action: 'Send Email',
    color: 'from-amber-700 to-amber-500',
    shadow: 'shadow-amber-600/20',
    badge: '< 24h',
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
  {
    icon: Users,
    title: 'Discord Community',
    description: 'Join 20,000+ traders. Share strategies, get tips, and connect with the Lordfunded team.',
    action: 'Join Discord',
    color: 'from-yellow-600 to-amber-500',
    shadow: 'shadow-yellow-500/20',
    badge: '20K+ members',
    badgeColor: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  },
];

const resources = [
  { icon: BookOpen, title: 'Knowledge Base', desc: '100+ articles covering challenges, rules, and payouts', href: '#' },
  { icon: FileText, title: 'Trading Rules', desc: 'Full breakdown of objectives and account conditions', href: '#' },
  { icon: Zap, title: 'Video Tutorials', desc: 'Step-by-step guides for new and experienced traders', href: '#' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left p-5 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors leading-snug">
          {q}
        </span>
        {open
          ? <ChevronUp size={16} className="text-amber-400 shrink-0 mt-0.5" />
          : <ChevronDown size={16} className="text-slate-500 shrink-0 mt-0.5" />}
      </div>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-sm text-slate-400 mt-3 leading-relaxed"
        >
          {a}
        </motion.p>
      )}
    </button>
  );
}

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Support</h1>
        <p className="text-sm text-slate-400 mt-1">We're here to help — choose a channel or browse the FAQs below.</p>
      </div>

      {/* Contact channels */}
      <div className="grid sm:grid-cols-3 gap-4">
        {channels.map((ch) => (
          <motion.div
            key={ch.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border border-white/8 bg-white/3 p-5 flex flex-col gap-4 shadow-lg ${ch.shadow}`}
          >
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center shadow-lg`}>
                <ch.icon size={20} className="text-white" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ch.badgeColor}`}>
                {ch.badge}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{ch.title}</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ch.description}</p>
            </div>
            <button className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-sky-300 transition-colors">
              {ch.action} <ExternalLink size={12} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/8 bg-white/3 p-6"
        >
          <h2 className="text-base font-bold text-white mb-1">Send a message</h2>
          <p className="text-xs text-slate-400 mb-5">We'll reply to your registered email within 24 hours.</p>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <p className="text-base font-bold text-white">Message sent!</p>
              <p className="text-sm text-slate-400 max-w-xs">Our support team will get back to you within 24 hours.</p>
              <button
                onClick={() => { setSubmitted(false); setSubject(''); setMessage(''); }}
                className="text-xs text-amber-400 hover:text-sky-300 mt-2 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Subject"
                placeholder="e.g. Payout question"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Message</label>
                <textarea
                  rows={5}
                  placeholder="Describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 transition-all resize-none"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full gap-2"
                loading={sending}
              >
                <Send size={14} />
                Send Message
              </Button>
            </form>
          )}
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <div>
            <h2 className="text-base font-bold text-white mb-1">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400">Quick answers to common questions.</p>
          </div>
          <div className="space-y-2">
            {faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </motion.div>
      </div>

      {/* Resources */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/8 bg-white/3 p-6"
      >
        <h2 className="text-base font-bold text-white mb-4">Self-service resources</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {resources.map((r) => (
            <a
              key={r.title}
              href={r.href}
              className="flex items-start gap-3 p-4 rounded-xl border border-white/6 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-amber-500/15 transition-colors">
                <r.icon size={15} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{r.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">{r.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
