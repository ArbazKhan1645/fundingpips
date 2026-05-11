'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion, isMobileDevice } from '@/lib/use-reduced-motion';

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
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const shouldDisableAnimation = prefersReducedMotion || isMobile;

  return (
    <div className={cn('overflow-hidden', className)}>
      <div
        className={cn(
          'flex w-max',
          !shouldDisableAnimation && speedClasses[speed],
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
