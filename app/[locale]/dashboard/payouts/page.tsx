'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockPayouts } from '@/mock/dashboard';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Banknote, ArrowUpRight, Clock } from 'lucide-react';
import { AnimatedCounter } from '@/components/animations/animated-counter';

export default function PayoutsPage() {
  const [showRequest, setShowRequest] = useState(false);

  const total = mockPayouts.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const pending = mockPayouts.filter(p => p.status === 'processing' || p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Payouts</h1>
            <p className="text-sm text-slate-400 mt-1">Your earnings and withdrawal history</p>
          </div>
          <Button variant="primary" size="sm" className="gap-2" onClick={() => setShowRequest(true)}>
            Request Payout
            <ArrowUpRight size={14} />
          </Button>
        </div>
      </FadeIn>

      {/* Summary cards */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Earned', value: formatCurrency(total), icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Pending', value: formatCurrency(pending), icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Total Payouts', value: mockPayouts.length.toString(), icon: ArrowUpRight, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((card) => (
          <StaggerItem key={card.label}>
            <div className="glass rounded-2xl p-5 border border-white/8">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color} mb-3`}>
                <card.icon size={18} />
              </div>
              <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
              <p className="text-sm text-slate-400 mt-1">{card.label}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Payout request modal */}
      {showRequest && (
        <FadeIn>
          <div className="glass rounded-2xl p-6 border border-amber-500/30 bg-amber-500/5">
            <h3 className="text-base font-bold text-white mb-4">Request Payout</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Amount (USD)</label>
                <input type="number" placeholder="Enter amount..." className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Payment Method</label>
                <select className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50">
                  <option className="bg-[#0a0a0a]">USDT (TRC20)</option>
                  <option className="bg-[#0a0a0a]">Bank Transfer</option>
                  <option className="bg-[#0a0a0a]">Skrill</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" size="sm">Submit Request</Button>
              <Button variant="secondary" size="sm" onClick={() => setShowRequest(false)}>Cancel</Button>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Payout history */}
      <FadeIn>
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h3 className="text-base font-bold text-white mb-6">Payout History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-white/5">
                  <th className="text-left pb-3 font-medium">Amount</th>
                  <th className="text-left pb-3 font-medium hidden sm:table-cell">Method</th>
                  <th className="text-left pb-3 font-medium hidden md:table-cell">Date</th>
                  <th className="text-right pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockPayouts.map((payout, i) => (
                  <motion.tr
                    key={payout.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="hover:bg-white/2 transition-colors"
                  >
                    <td className="py-4">
                      <span className="text-lg font-black text-emerald-400">+{formatCurrency(payout.amount)}</span>
                    </td>
                    <td className="py-4 text-sm text-slate-300 hidden sm:table-cell">{payout.method}</td>
                    <td className="py-4 text-sm text-slate-400 hidden md:table-cell">{formatDate(payout.date)}</td>
                    <td className="py-4 text-right">
                      <Badge variant={payout.status === 'completed' ? 'success' : payout.status === 'processing' ? 'info' : payout.status === 'pending' ? 'warning' : 'danger'}>
                        {payout.status}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
