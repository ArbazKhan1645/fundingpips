'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

function extractNumber(value: string): { prefix: string; number: number; suffix: string } {
  const match = value.match(/^([^0-9]*)([0-9,]+\.?[0-9]*)([^0-9]*)$/);
  if (!match) return { prefix: '', number: 0, suffix: value };
  return {
    prefix: match[1] || '',
    number: parseFloat(match[2].replace(/,/g, '')),
    suffix: match[3] || '',
  };
}

function formatNumber(num: number, original: string): string {
  if (original.includes(',')) {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  if (original.includes('.')) {
    return num.toFixed(1);
  }
  return Math.floor(num).toString();
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState('0');
  const { prefix, number, suffix } = extractNumber(value);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = number / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, number);
      setDisplayValue(formatNumber(current, value));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, number, value]);

  return (
    <span ref={ref} className={cn(className)}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
