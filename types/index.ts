export type Locale = 'en' | 'ar' | 'ur';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  avatar?: string;
  role: 'trader' | 'admin';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface TradingAccount {
  id: string;
  accountNumber: string;
  type: 'challenge' | 'funded' | 'evaluation';
  phase: 'phase1' | 'phase2' | 'funded';
  balance: number;
  equity: number;
  startBalance: number;
  profitTarget: number;
  maxDrawdown: number;
  dailyDrawdown: number;
  currentProfit: number;
  currentDrawdown: number;
  status: 'active' | 'passed' | 'failed' | 'pending';
  startDate: string;
  endDate?: string;
  broker: string;
  leverage: string;
  platform: 'MT4' | 'MT5';
}

export interface Challenge {
  id: string;
  name: string;
  price: number;
  accountSize: number;
  phase1ProfitTarget: number;
  phase2ProfitTarget: number;
  maxDailyLoss: number;
  maxTotalLoss: number;
  minTradingDays: number;
  profitSplit: number;
  leverage: string;
  features: string[];
  popular?: boolean;
}

export interface Payout {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  date: string;
  method: string;
  accountId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface Testimonial {
  id: string;
  name: string;
  country: string;
  avatar: string;
  rating: number;
  comment: string;
  profit: string;
  accountSize: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Stat {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  description?: string;
}
