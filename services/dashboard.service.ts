import type { TradingAccount, Payout } from '@/types';
import { mockAccounts, mockPayouts, mockChartData, mockStats } from '@/mock/dashboard';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const dashboardService = {
  async getAccounts(): Promise<TradingAccount[]> {
    await delay(600);
    return mockAccounts;
  },

  async getAccount(id: string): Promise<TradingAccount | undefined> {
    await delay(400);
    return mockAccounts.find((a) => a.id === id);
  },

  async getPayouts(): Promise<Payout[]> {
    await delay(500);
    return mockPayouts;
  },

  async requestPayout(accountId: string, amount: number, method: string): Promise<Payout> {
    await delay(1200);
    return {
      id: Date.now().toString(),
      amount,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      method,
      accountId,
    };
  },

  async getChartData() {
    await delay(400);
    return mockChartData;
  },

  async getStats() {
    await delay(300);
    return mockStats;
  },
};
