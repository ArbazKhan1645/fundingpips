import type { TradingAccount, Payout } from '@/types';

export const mockUser = {
  id: '1',
  firstName: 'Alex',
  lastName: 'Thompson',
  email: 'alex.thompson@email.com',
  phone: '+971 50 123 4567',
  country: 'United Arab Emirates',
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
  role: 'trader' as const,
  createdAt: '2024-01-15',
};

export const mockAccounts: TradingAccount[] = [
  {
    id: '1',
    accountNumber: 'FP-100-001234',
    type: 'challenge',
    phase: 'phase1',
    balance: 51200,
    equity: 51450,
    startBalance: 50000,
    profitTarget: 8,
    maxDrawdown: 10,
    dailyDrawdown: 5,
    currentProfit: 2.4,
    currentDrawdown: 0.8,
    status: 'active',
    startDate: '2024-11-01',
    broker: 'FP Markets',
    leverage: '1:100',
    platform: 'MT5',
  },
  {
    id: '2',
    accountNumber: 'FP-200-005678',
    type: 'funded',
    phase: 'funded',
    balance: 205000,
    equity: 207300,
    startBalance: 200000,
    profitTarget: 10,
    maxDrawdown: 10,
    dailyDrawdown: 5,
    currentProfit: 3.65,
    currentDrawdown: 0.2,
    status: 'active',
    startDate: '2024-09-15',
    broker: 'FP Markets',
    leverage: '1:100',
    platform: 'MT5',
  },
];

export const mockPayouts: Payout[] = [
  {
    id: '1',
    amount: 3200,
    status: 'completed',
    date: '2024-11-28',
    method: 'USDT (TRC20)',
    accountId: '2',
  },
  {
    id: '2',
    amount: 1850,
    status: 'completed',
    date: '2024-10-30',
    method: 'Bank Transfer',
    accountId: '2',
  },
  {
    id: '3',
    amount: 4100,
    status: 'processing',
    date: '2024-12-01',
    method: 'USDT (TRC20)',
    accountId: '2',
  },
];

export const mockChartData = {
  equity: [
    { date: 'Nov 1', value: 200000 },
    { date: 'Nov 4', value: 201200 },
    { date: 'Nov 7', value: 199800 },
    { date: 'Nov 10', value: 202500 },
    { date: 'Nov 13', value: 203800 },
    { date: 'Nov 16', value: 201900 },
    { date: 'Nov 19', value: 204600 },
    { date: 'Nov 22', value: 205900 },
    { date: 'Nov 25', value: 204200 },
    { date: 'Nov 28', value: 207300 },
  ],
  trades: [
    { date: 'Nov 1', profit: 0, loss: 0 },
    { date: 'Nov 4', profit: 1200, loss: -300 },
    { date: 'Nov 7', profit: 800, loss: -1400 },
    { date: 'Nov 10', profit: 2700, loss: -500 },
    { date: 'Nov 13', profit: 1300, loss: -200 },
    { date: 'Nov 16', profit: 900, loss: -1900 },
    { date: 'Nov 19', profit: 2700, loss: -600 },
    { date: 'Nov 22', profit: 1300, loss: -100 },
    { date: 'Nov 25', profit: 600, loss: -1700 },
    { date: 'Nov 28', profit: 3100, loss: -800 },
  ],
};

export const mockStats = {
  totalPayouts: '$2.4M+',
  fundedTraders: '50,000+',
  successRate: '94%',
  countries: '150+',
  totalTrades: '1.2M+',
  avgPayout: '$3,800',
};
