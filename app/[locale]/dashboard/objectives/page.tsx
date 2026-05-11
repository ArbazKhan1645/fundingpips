'use client';

import { motion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';
import { Badge } from '@/components/ui/badge';
import { mockAccounts } from '@/mock/dashboard';
import { formatCurrency } from '@/lib/utils';
import { Check, X, Clock } from 'lucide-react';

export default function ObjectivesPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-black text-white">Trading Objectives</h1>
          <p className="text-sm text-slate-400 mt-1">Track your challenge progress and objectives</p>
        </div>
      </FadeIn>

      <StaggerContainer className="space-y-6">
        {mockAccounts.map((account) => (
          <StaggerItem key={account.id}>
            <div className="glass rounded-2xl p-6 border border-white/8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm ${
                    account.phase === 'funded'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-br from-sky-500 to-violet-500'
                  }`}>
                    {account.phase === 'funded' ? 'FA' : account.phase === 'phase1' ? 'P1' : 'P2'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{account.accountNumber}</h3>
                    <p className="text-xs text-slate-400">{formatCurrency(account.startBalance)} Account</p>
                  </div>
                </div>
                <Badge variant={account.status === 'active' ? 'success' : account.status === 'passed' ? 'info' : 'danger'}>
                  {account.status}
                </Badge>
              </div>

              {/* Objective rules */}
              <div className="space-y-4">
                {[
                  {
                    label: 'Profit Target',
                    target: `${account.profitTarget}%`,
                    current: `${account.currentProfit.toFixed(1)}%`,
                    progress: (account.currentProfit / account.profitTarget) * 100,
                    passed: account.currentProfit >= account.profitTarget,
                    isLoss: false,
                  },
                  {
                    label: 'Max Daily Loss',
                    target: `${account.dailyDrawdown}%`,
                    current: '0.5%',
                    progress: (0.5 / account.dailyDrawdown) * 100,
                    passed: false,
                    isLoss: true,
                  },
                  {
                    label: 'Max Total Loss',
                    target: `${account.maxDrawdown}%`,
                    current: `${account.currentDrawdown.toFixed(1)}%`,
                    progress: (account.currentDrawdown / account.maxDrawdown) * 100,
                    passed: false,
                    isLoss: true,
                  },
                ].map((obj) => (
                  <div key={obj.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {obj.passed ? (
                          <Check size={14} className="text-emerald-400" />
                        ) : obj.progress >= 100 && obj.isLoss ? (
                          <X size={14} className="text-red-400" />
                        ) : (
                          <Clock size={14} className="text-slate-400" />
                        )}
                        <span className="text-slate-300">{obj.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={obj.isLoss ? 'text-red-400' : 'text-emerald-400'}>
                          {obj.current}
                        </span>
                        <span className="text-slate-500">/ {obj.target}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(obj.progress, 100)}%` }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        className={`h-full rounded-full ${
                          obj.isLoss
                            ? 'bg-gradient-to-r from-orange-500 to-red-500'
                            : 'bg-gradient-to-r from-sky-500 to-emerald-400'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
