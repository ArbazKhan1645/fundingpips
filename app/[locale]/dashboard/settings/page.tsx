'use client';

import { FadeIn } from '@/components/animations/fade-in';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';
import { User, Bell, Shield, CreditCard, KeyRound } from 'lucide-react';

const sections = [
  { icon: User, label: 'Profile' },
  { icon: Bell, label: 'Notifications' },
  { icon: Shield, label: 'Security' },
  { icon: CreditCard, label: 'Payment Methods' },
];

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret?: string; otpauthUri?: string; backupCodes?: string[] } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorMessage, setTwoFactorMessage] = useState<string | null>(null);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  const startTwoFactorSetup = async () => {
    setTwoFactorLoading(true);
    setTwoFactorMessage(null);
    try {
      const setup = await authService.setupTwoFactor();
      if (setup.enabled) {
        setTwoFactorMessage('Two-factor authentication is already active.');
      } else {
        setTwoFactorSetup(setup);
      }
    } catch (reason) {
      setTwoFactorMessage(reason instanceof Error ? reason.message : 'Unable to start 2FA setup.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const confirmTwoFactor = async () => {
    setTwoFactorLoading(true);
    setTwoFactorMessage(null);
    try {
      await authService.verifyTwoFactor(twoFactorCode);
      const profile = await authService.getProfile();
      setUser(profile);
      setTwoFactorSetup(null);
      setTwoFactorCode('');
      setTwoFactorMessage('Two-factor authentication is now active.');
    } catch (reason) {
      setTwoFactorMessage(reason instanceof Error ? reason.message : 'Invalid 2FA code.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    setTwoFactorLoading(true);
    setTwoFactorMessage(null);
    try {
      await authService.disableTwoFactor(twoFactorCode);
      const profile = await authService.getProfile();
      setUser(profile);
      setTwoFactorCode('');
      setTwoFactorMessage('Two-factor authentication is disabled.');
    } catch (reason) {
      setTwoFactorMessage(reason instanceof Error ? reason.message : 'Unable to disable 2FA.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

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

      <FadeIn>
        <div className="glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center gap-3 mb-6">
            <KeyRound size={18} className="text-amber-400" />
            <h3 className="text-base font-bold text-white">Two-Factor Authentication</h3>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 mb-4">
            <p className="text-sm font-semibold text-white">{user?.twoFactorEnabled ? 'Enabled' : 'Not enabled'}</p>
            <p className="text-xs text-slate-500 mt-1">Protect sign-in with a 6-digit code from an authenticator app.</p>
          </div>

          {twoFactorSetup?.secret && (
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs text-slate-400">Manual setup key</p>
                <p className="mt-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-amber-200 break-all">{twoFactorSetup.secret}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Authenticator URI</p>
                <p className="mt-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-slate-300 break-all">{twoFactorSetup.otpauthUri}</p>
              </div>
              {twoFactorSetup.backupCodes?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {twoFactorSetup.backupCodes.map((backupCode) => (
                    <code key={backupCode} className="rounded-lg bg-black/30 px-2 py-1.5 text-xs text-amber-100 text-center">{backupCode}</code>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              label={user?.twoFactorEnabled ? 'Current 2FA Code' : 'Verification Code'}
              value={twoFactorCode}
              onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
            />
            <div className="flex items-end gap-2">
              {!user?.twoFactorEnabled && !twoFactorSetup && (
                <Button type="button" variant="primary" onClick={startTwoFactorSetup} loading={twoFactorLoading}>Start Setup</Button>
              )}
              {!user?.twoFactorEnabled && twoFactorSetup && (
                <Button type="button" variant="primary" onClick={confirmTwoFactor} loading={twoFactorLoading} disabled={twoFactorCode.length < 6}>Confirm</Button>
              )}
              {user?.twoFactorEnabled && (
                <Button type="button" variant="secondary" onClick={disableTwoFactor} loading={twoFactorLoading} disabled={twoFactorCode.length < 6}>Disable</Button>
              )}
            </div>
          </div>

          {twoFactorMessage && <p className="text-sm text-slate-300 mt-3">{twoFactorMessage}</p>}
        </div>
      </FadeIn>
    </div>
  );
}
