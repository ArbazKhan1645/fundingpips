export const APP_NAME = 'FundingPips';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const LOCALES = ['en', 'ar', 'ur'] as const;
export const DEFAULT_LOCALE = 'en';

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Trading Objectives', href: '/trading-objectives' },
  { label: 'About Us', href: '/about' },
  { label: 'Affiliate', href: '/affiliate' },
  { label: 'FAQ', href: '/faq' },
] as const;

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/fundingpips',
  instagram: 'https://instagram.com/fundingpips',
  discord: 'https://discord.gg/fundingpips',
  telegram: 'https://t.me/fundingpips',
  youtube: 'https://youtube.com/@fundingpips',
} as const;

export const CHALLENGE_PHASES = {
  PHASE1: 'Phase 1',
  PHASE2: 'Phase 2',
  FUNDED: 'Funded',
} as const;

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  PASSED: 'passed',
  FAILED: 'failed',
  PENDING: 'pending',
} as const;

export const COUNTRIES = [
  'United Arab Emirates', 'Saudi Arabia', 'Pakistan', 'India', 'United Kingdom',
  'United States', 'Germany', 'France', 'Turkey', 'Egypt', 'Jordan', 'Kuwait',
  'Qatar', 'Bahrain', 'Oman', 'Canada', 'Australia', 'Singapore', 'Malaysia',
  'Indonesia', 'Nigeria', 'Kenya', 'South Africa', 'Brazil', 'Mexico',
] as const;

export const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'] as const;

export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.8,
  verySlow: 1.2,
} as const;
