'use client';

import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
  reverse?: boolean;
  pauseOnHover?: boolean;
}

const speedClasses = {
  slow: 'animate-marquee',
  normal: 'animate-marquee',
  fast: 'animate-marquee-fast',
};

export function Marquee({
  children,
  className,
  speed = 'normal',
  reverse = false,
  pauseOnHover = false,
}: MarqueeProps) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <div
        className={cn(
          'flex w-max',
          speedClasses[speed],
          reverse && '[animation-direction:reverse]',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>{children}</div>
      </div>
    </div>
  );
}
