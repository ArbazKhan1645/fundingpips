'use client';

import { motion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockAccounts } from '@/mock/dashboard';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ArrowUpRight, CreditCard } from 'lucide-react';

export default function AccountsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">My Accounts</h1>
            <p className="text-sm text-slate-400 mt-1">Manage all your trading accounts</p>
          </div>
          <Link href="/trading-objectives">
            <Button variant="primary" size="sm" className="gap-2">
              New Challenge
              <ArrowUpRight size={14} />
            </Button>
          </Link>
        </div>
      </FadeIn>

      <StaggerContainer className="grid gap-6">
        {mockAccounts.map((account) => {
          const profit = account.balance - account.startBalance;
          const profitPct = (profit / account.startBalance) * 100;

          return (
            <StaggerItem key={account.id}>
              <motion.div
                whileHover={{ y: -2 }}
                className="glass rounded-2xl p-6 border border-white/8 hover:border-sky-500/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ${
                      account.phase === 'funded'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/20'
                        : 'bg-gradient-to-br from-sky-500 to-violet-500 shadow-sky-500/20'
                    }`}>
                      {account.phase === 'funded' ? 'FA' : account.phase === 'phase1' ? 'P1' : 'P2'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{account.accountNumber}</h3>
                        <Badge variant={account.status === 'active' ? 'success' : account.status === 'passed' ? 'info' : 'danger'}>
                          {account.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5">{account.platform} · {account.broker} · {account.leverage}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Started {formatDate(account.startDate)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-black text-white">{formatCurrency(account.balance)}</p>
                      <p className="text-xs text-slate-500">Balance</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-lg font-black ${profitPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatPercent(profitPct)}
                      </p>
                      <p className="text-xs text-slate-500">Profit %</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-red-400">-{account.currentDrawdown.toFixed(1)}%</p>
                      <p className="text-xs text-slate-500">Drawdown</p>
                    </div>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Profit Progress</span>
                      <span>{account.currentProfit.toFixed(1)}% / {account.profitTarget}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((account.currentProfit / account.profitTarget) * 100, 100)}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Drawdown Used</span>
                      <span>{account.currentDrawdown.toFixed(1)}% / {account.maxDrawdown}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((account.currentDrawdown / account.maxDrawdown) * 100, 100)}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
