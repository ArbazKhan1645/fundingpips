import type { User } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
  captchaToken?: string;
}

interface RegisterPayload {
  firstName: string;
  lastName: string;
  title: string;
  dob: string;
  country: string;
  nationality?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  taxCountry?: string;
  preferredPlatform?: string;
  tradingExperience?: string;
  referralSource?: string;
  idDocumentType?: string;
  idDocumentNumber?: string;
  proofOfAddressType?: string;
  acceptedTerms?: boolean;
  acceptedRisk?: boolean;
  marketingOptIn?: boolean;
  email: string;
  phone: string;
  password: string;
  captchaToken?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  requiresEmailVerification?: boolean;
  requiresTwoFactor?: boolean;
}

type ProfileRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  country: string | null;
  avatar_url: string | null;
  role: User['role'];
  email_verified_at: string | null;
  two_factor_enabled: boolean | null;
  kyc_status: User['kycStatus'];
  is_banned?: boolean | null;
  is_deleted?: boolean | null;
  address_line1?: string | null;
  city?: string | null;
  preferred_platform?: string | null;
  trading_experience?: string | null;
  created_at: string;
};

function mapProfile(profile: ProfileRow): User {
  return {
    id: profile.id,
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
    email: profile.email,
    phone: profile.phone ?? undefined,
    country: profile.country ?? undefined,
    avatar: profile.avatar_url ?? undefined,
    role: profile.role,
    emailVerified: Boolean(profile.email_verified_at),
    twoFactorEnabled: Boolean(profile.two_factor_enabled),
    kycStatus: profile.kyc_status,
    isBanned: Boolean(profile.is_banned),
    isDeleted: Boolean(profile.is_deleted),
    createdAt: profile.created_at,
  };
}

function writeAuthHint(user?: User | null) {
  if (typeof document === 'undefined') return;
  if (!user) {
    document.cookie = 'lf_auth_hint=; Max-Age=0; Path=/; SameSite=Lax';
    return;
  }
  document.cookie = `lf_auth_hint=1; Max-Age=${60 * 60 * 24 * 7}; Path=/; SameSite=Lax`;
}

async function getProfile(userId: string, fallbackEmail?: string): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,first_name,last_name,phone,country,avatar_url,role,email_verified_at,two_factor_enabled,kyc_status,is_banned,is_deleted,address_line1,city,preferred_platform,trading_experience,created_at')
    .eq('id', userId)
    .single();

  if (!error && data) return mapProfile(data as ProfileRow);

  return {
    id: userId,
    firstName: '',
    lastName: '',
    email: fallbackEmail ?? '',
    role: 'trader',
    createdAt: new Date().toISOString(),
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    await verifyCaptcha(payload.captchaToken, 'signin');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error || !data.session || !data.user) throw new Error(error?.message ?? 'Invalid credentials');

    const user = await getProfile(data.user.id, data.user.email ?? payload.email);
    if (user.isDeleted) {
      await supabase.auth.signOut();
      writeAuthHint(null);
      throw new Error('Account not found.');
    }
    if (user.isBanned) {
      await supabase.auth.signOut();
      writeAuthHint(null);
      throw new Error('Account blocked. Contact support.');
    }
    writeAuthHint(user);
    await recordUserDevice('login');
    return {
      user,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      requiresTwoFactor: Boolean(user.twoFactorEnabled),
    };
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await verifyCaptcha(payload.captchaToken, 'signup');

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          title: payload.title,
          dob: payload.dob,
          country: payload.country,
          nationality: payload.nationality,
          addressLine1: payload.addressLine1,
          addressLine2: payload.addressLine2,
          city: payload.city,
          state: payload.state,
          postalCode: payload.postalCode,
          taxCountry: payload.taxCountry,
          preferredPlatform: payload.preferredPlatform,
          tradingExperience: payload.tradingExperience,
          referralSource: payload.referralSource,
          idDocumentType: payload.idDocumentType,
          idDocumentNumber: payload.idDocumentNumber,
          proofOfAddressType: payload.proofOfAddressType,
          acceptedTerms: payload.acceptedTerms,
          acceptedRisk: payload.acceptedRisk,
          marketingOptIn: payload.marketingOptIn,
          phone: payload.phone,
        },
      },
    });

    if (error || !data.user) throw new Error(error?.message ?? 'Unable to create account');

    const user = await getProfile(data.user.id, data.user.email ?? payload.email);
    if (data.session) {
      await createInitialKyc(data.user.id, payload);
      await recordUserDevice('signup');
    }

    return {
      user,
      token: data.session?.access_token ?? '',
      refreshToken: data.session?.refresh_token,
      requiresEmailVerification: !data.session,
    };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    writeAuthHint(null);
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) throw new Error(error?.message ?? 'Unable to refresh session');
    return { token: data.session.access_token };
  },

  async getProfile(): Promise<User> {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error(error?.message ?? 'Not authenticated');
    return getProfile(data.user.id, data.user.email ?? undefined);
  },

  async googleLogin(): Promise<AuthResponse> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw new Error(error.message);
    throw new Error('Redirecting to Google');
  },

  async resendVerification(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw new Error(error.message);
  },

  async verifyEmailOtp(email: string, token: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    if (error || !data.user || !data.session) throw new Error(error?.message ?? 'Invalid verification code');
    const user = await getProfile(data.user.id, data.user.email ?? email);
    writeAuthHint(user);
    await recordUserDevice('signup');
    return { user, token: data.session.access_token, refreshToken: data.session.refresh_token };
  },

  async forgotPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  },

  async getKycSubmission() {
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) throw new Error(authError?.message ?? 'Not authenticated');

    const { data, error } = await supabase
      .from('kyc_submissions')
      .select('*, kyc_documents(*)')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  },

  async submitKycDocuments(payload: {
    idDocumentType: string;
    idDocumentNumber: string;
    proofOfAddressType: string;
    idFile: File;
    addressFile: File;
  }): Promise<void> {
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) throw new Error(authError?.message ?? 'Not authenticated');

    const profile = await getProfile(auth.user.id, auth.user.email ?? undefined);
    const { data: existing } = await supabase
      .from('kyc_submissions')
      .select('id')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const submissionPayload = {
      user_id: auth.user.id,
      provider: 'manual',
      status: 'pending',
      legal_first_name: profile.firstName,
      legal_last_name: profile.lastName,
      id_document_type: payload.idDocumentType,
      id_document_number: payload.idDocumentNumber,
      proof_of_address_type: payload.proofOfAddressType,
    };

    const { data: submission, error: submissionError } = existing
      ? await supabase.from('kyc_submissions').update(submissionPayload).eq('id', existing.id).select('id').single()
      : await supabase.from('kyc_submissions').insert(submissionPayload).select('id').single();

    if (submissionError || !submission) throw new Error(submissionError?.message ?? 'Unable to create KYC case');

    const safeIdName = payload.idFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const safeAddressName = payload.addressFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const idPath = `${auth.user.id}/${submission.id}/identity-${Date.now()}-${safeIdName}`;
    const addressPath = `${auth.user.id}/${submission.id}/address-${Date.now()}-${safeAddressName}`;

    const idUpload = await supabase.storage.from('kyc-documents').upload(idPath, payload.idFile, { upsert: true });
    if (idUpload.error) throw new Error(idUpload.error.message);

    const addressUpload = await supabase.storage.from('kyc-documents').upload(addressPath, payload.addressFile, { upsert: true });
    if (addressUpload.error) throw new Error(addressUpload.error.message);

    const { error: docsError } = await supabase.from('kyc_documents').insert([
      { submission_id: submission.id, document_type: payload.idDocumentType, storage_path: idPath, status: 'pending' },
      { submission_id: submission.id, document_type: payload.proofOfAddressType, storage_path: addressPath, status: 'pending' },
    ]);

    if (docsError) throw new Error(docsError.message);
    await supabase.from('profiles').update({ kyc_status: 'pending' }).eq('id', auth.user.id);
  },

  async setupTwoFactor(): Promise<{ enabled: boolean; secret?: string; otpauthUri?: string; backupCodes?: string[] }> {
    const { data } = await supabase.auth.getSession();
    const response = await fetch('/api/auth/2fa/setup', {
      method: 'POST',
      headers: data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {},
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? 'Unable to start 2FA setup');
    return body;
  },

  async verifyTwoFactor(code: string): Promise<void> {
    const { data } = await supabase.auth.getSession();
    const response = await fetch('/api/auth/2fa/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
      },
      body: JSON.stringify({ code }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? 'Invalid verification code');
  },

  async disableTwoFactor(code: string): Promise<void> {
    const { data } = await supabase.auth.getSession();
    const response = await fetch('/api/auth/2fa/disable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
      },
      body: JSON.stringify({ code }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? 'Unable to disable 2FA');
  },
};

async function verifyCaptcha(token: string | undefined, action: string) {
  const response = await fetch('/api/security/captcha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, action }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? 'Captcha verification failed');
}

async function recordUserDevice(action: 'signup' | 'login') {
  if (typeof window === 'undefined') return;

  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) return;

    const device = getBrowserDeviceInfo();
    const fingerprint = await createDeviceFingerprint(device);
    await fetch('/api/security/device', {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify({ action, fingerprint, device }),
    });
  } catch {
    // Device logging is intentionally silent.
  }
}

function getBrowserDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
    },
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
    webdriver: navigator.webdriver,
  };
}

async function createDeviceFingerprint(device: Record<string, unknown>) {
  const value = JSON.stringify(device);
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function createInitialKyc(userId: string, payload: RegisterPayload) {
  if (!payload.idDocumentType && !payload.proofOfAddressType) return;

  const { data: existing } = await supabase
    .from('kyc_submissions')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return;

  await supabase.from('kyc_submissions').insert({
    user_id: userId,
    provider: 'manual',
    status: 'pending',
    legal_first_name: payload.firstName,
    legal_last_name: payload.lastName,
    date_of_birth: payload.dob,
    residential_address: {
      line1: payload.addressLine1,
      line2: payload.addressLine2,
      city: payload.city,
      state: payload.state,
      postalCode: payload.postalCode,
      country: payload.country,
    },
    id_document_type: payload.idDocumentType,
    id_document_number: payload.idDocumentNumber,
    proof_of_address_type: payload.proofOfAddressType,
  });
}
