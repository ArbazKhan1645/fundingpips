'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockAccounts, mockPayouts, mockChartData } from '@/mock/dashboard';
import { formatCurrency, formatPercent, formatDate, getStatusColor } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const [chartData, setChartData] = useState<typeof mockChartData | null>(null);

  useEffect(() => {
    setChartData(mockChartData);
  }, []);

  const totalBalance = mockAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalProfit = mockAccounts.reduce((sum, a) => sum + (a.balance - a.startBalance), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Welcome */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Good morning, Alex 👋</h1>
            <p className="text-sm text-slate-400 mt-1">Here's your trading overview for today</p>
          </div>
          <Link href="/trading-objectives">
            <Button variant="primary" size="sm" className="hidden sm:flex gap-2">
              Start New Challenge
              <ArrowUpRight size={14} />
            </Button>
          </Link>
        </div>
      </FadeIn>

      {/* Stats cards */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Balance',
            value: formatCurrency(totalBalance),
            change: '+3.65%',
            positive: true,
            icon: DollarSign,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Total Profit',
            value: formatCurrency(totalProfit),
            change: 'This month',
            positive: true,
            icon: TrendingUp,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Active Accounts',
            value: mockAccounts.filter(a => a.status === 'active').length.toString(),
            change: '2 phases',
            positive: true,
            icon: Activity,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Total Payouts',
            value: formatCurrency(mockPayouts.reduce((s, p) => s + p.amount, 0)),
            change: '3 payouts',
            positive: true,
            icon: DollarSign,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
          },
        ].map((stat) => (
          <StaggerItem key={stat.label}>
            <motion.div
              whileHover={{ y: -2 }}
              className="glass rounded-2xl p-5 border border-white/8 hover:border-amber-500/20 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>
                <stat.icon size={18} />
              </div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              <p className={`text-xs mt-1 ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.change}
              </p>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <FadeIn>
          <div className="glass rounded-2xl p-6 border border-white/8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-white">Equity Curve</h3>
              <Badge variant="success">+3.65%</Badge>
            </div>
            {chartData && (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData.equity}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ background: '#1a1000', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', color: '#e2e8f0' }}
                    formatter={(v: unknown) => [formatCurrency(Number(v) || 0), 'Equity']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#C9A84C" strokeWidth={2} fill="url(#equityGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="glass rounded-2xl p-6 border border-white/8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-white">Trade P&L</h3>
              <Badge variant="info">Nov 2024</Badge>
            </div>
            {chartData && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData.trades}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1a1000', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', color: '#e2e8f0' }}
                    formatter={(v: unknown) => { const n = Number(v) || 0; return [formatCurrency(Math.abs(n)), n >= 0 ? 'Profit' : 'Loss']; }}
                  />
                  <Bar dataKey="profit" fill="#10b981" radius={[3,3,0,0]} />
                  <Bar dataKey="loss" fill="#ef4444" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </FadeIn>
      </div>

      {/* Accounts */}
      <FadeIn>
        <div className="glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-white">My Accounts</h3>
            <Link href="/dashboard/accounts">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {mockAccounts.map((account) => {
              const profitPct = ((account.balance - account.startBalance) / account.startBalance) * 100;
              return (
                <motion.div
                  key={account.id}
                  whileHover={{ scale: 1.005 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/3 rounded-xl border border-white/5 hover:border-amber-500/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
                      account.phase === 'funded' ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-amber-600 to-amber-800'
                    }`}>
                      {account.phase === 'funded' ? 'FA' : account.phase === 'phase1' ? 'P1' : 'P2'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{account.accountNumber}</p>
                      <p className="text-xs text-slate-400">{account.platform} • {account.leverage}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(account.balance)}</p>
                      <p className="text-xs text-slate-400">Balance</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${profitPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatPercent(profitPct)}
                      </p>
                      <p className="text-xs text-slate-400">Profit</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">-{account.currentDrawdown.toFixed(1)}%</p>
                      <p className="text-xs text-slate-400">Drawdown</p>
                    </div>
                    <Badge
                      variant={account.status === 'active' ? 'success' : account.status === 'passed' ? 'info' : 'danger'}
                    >
                      {account.status}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* Recent Payouts */}
      <FadeIn>
        <div className="glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-white">Recent Payouts</h3>
            <Link href="/dashboard/payouts">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-white/5">
                  <th className="text-left pb-3 font-medium">Amount</th>
                  <th className="text-left pb-3 font-medium">Method</th>
                  <th className="text-left pb-3 font-medium hidden sm:table-cell">Date</th>
                  <th className="text-right pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-3 text-sm font-bold text-emerald-400">
                      +{formatCurrency(payout.amount)}
                    </td>
                    <td className="py-3 text-sm text-slate-300">{payout.method}</td>
                    <td className="py-3 text-sm text-slate-400 hidden sm:table-cell">{formatDate(payout.date)}</td>
                    <td className="py-3 text-right">
                      <Badge
                        variant={
                          payout.status === 'completed' ? 'success' :
                          payout.status === 'processing' ? 'info' :
                          payout.status === 'pending' ? 'warning' : 'danger'
                        }
                      >
                        {payout.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>

      {/* Challenge progress */}
      <FadeIn>
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h3 className="text-base font-bold text-white mb-6">Challenge Progress</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {mockAccounts.filter(a => a.type === 'challenge').map((account) => (
              <div key={account.id} className="bg-white/3 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Profit Target</span>
                  <span className="text-white font-bold">{account.currentProfit.toFixed(1)}% / {account.profitTarget}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((account.currentProfit / account.profitTarget) * 100, 100)}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Max Drawdown Used</span>
                  <span className="text-red-400 font-bold">{account.currentDrawdown.toFixed(1)}% / {account.maxDrawdown}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((account.currentDrawdown / account.maxDrawdown) * 100, 100)}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.6 }}
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
