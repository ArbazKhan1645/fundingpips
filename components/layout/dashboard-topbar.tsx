'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function DashboardTopbar() {
  const { toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { title: 'Payout Processed', desc: '$3,200 sent to your USDT wallet', time: '2 min ago', unread: true },
    { title: 'Phase 1 Passed!', desc: 'Congrats! You\'ve passed Phase 1 evaluation', time: '1 hour ago', unread: true },
    { title: 'New Feature', desc: 'Scaling plan now available for your account', time: '1 day ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 h-16 glass border-b border-white/5">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 px-3 h-9 glass rounded-xl border border-white/10 min-w-48">
          <Search size={14} className="text-slate-500" />
          <input
            placeholder="Search..."
            className="bg-transparent text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400 border border-[#050d1a]" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 glass-strong rounded-2xl border border-white/10 w-80 shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  <span className="text-xs text-sky-400">Mark all read</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((n, i) => (
                    <div
                      key={i}
                      className={`px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer ${n.unread ? 'bg-sky-500/3' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />}
                        <div className={n.unread ? '' : 'ml-3.5'}>
                          <p className="text-sm font-medium text-white">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
                          <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Funded Trader</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
