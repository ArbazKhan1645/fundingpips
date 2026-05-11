import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-emerald-400';
    case 'passed': return 'text-blue-400';
    case 'failed': return 'text-red-400';
    case 'pending': return 'text-yellow-400';
    case 'processing': return 'text-blue-400';
    case 'completed': return 'text-emerald-400';
    case 'rejected': return 'text-red-400';
    default: return 'text-slate-400';
  }
}
