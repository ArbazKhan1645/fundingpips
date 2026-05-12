'use client';

import { FadeIn } from '@/components/animations/fade-in';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { User, Bell, Shield, CreditCard } from 'lucide-react';

const sections = [
  { icon: User, label: 'Profile' },
  { icon: Bell, label: 'Notifications' },
  { icon: Shield, label: 'Security' },
  { icon: CreditCard, label: 'Payment Methods' },
];

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-8">
      <FadeIn>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account preferences</p>
      </FadeIn>

      {/* Profile */}
      <FadeIn>
        <div className="glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center gap-3 mb-6">
            <User size={18} className="text-amber-400" />
            <h3 className="text-base font-bold text-white">Profile Information</h3>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-black font-black text-xl">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="font-bold text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
              <Button variant="outline" size="sm" className="mt-2">Change Photo</Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="First Name" defaultValue={user?.firstName || ''} />
            <Input label="Last Name" defaultValue={user?.lastName || ''} />
            <Input label="Email" type="email" defaultValue={user?.email || ''} />
            <Input label="Phone" defaultValue={user?.phone || ''} />
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="primary">Save Changes</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </div>
      </FadeIn>

      {/* Notifications */}
      <FadeIn>
        <div className="glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={18} className="text-amber-400" />
            <h3 className="text-base font-bold text-white">Notifications</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Payout notifications', description: 'Get notified when payouts are processed' },
              { label: 'Challenge updates', description: 'Alerts about your challenge progress' },
              { label: 'Drawdown warnings', description: 'Early warnings before hitting limits' },
              { label: 'Marketing emails', description: 'Promotions and platform updates' },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                </div>
                <div
                  className={`w-11 h-6 rounded-full cursor-pointer transition-all duration-300 relative ${i < 3 ? 'bg-amber-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${i < 3 ? 'left-6' : 'left-1'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Security */}
      <FadeIn>
        <div className="glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={18} className="text-amber-400" />
            <h3 className="text-base font-bold text-white">Security</h3>
          </div>
          <div className="space-y-4">
            <Input label="Current Password" type="password" placeholder="Enter current password" />
            <Input label="New Password" type="password" placeholder="Enter new password" />
            <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
            <Button variant="primary">Update Password</Button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
