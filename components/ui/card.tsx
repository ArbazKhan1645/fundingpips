import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'blue' | 'purple' | 'cyan' | 'none';
  hover?: boolean;
}

const glowClasses = {
  blue: 'hover:shadow-amber-500/20 hover:border-amber-500/30',
  purple: 'hover:shadow-amber-600/20 hover:border-amber-600/30',
  cyan: 'hover:shadow-amber-400/20 hover:border-amber-400/30',
  none: '',
};

export function Card({ children, className, glow = 'none', hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl transition-all duration-300',
        hover && 'hover:-translate-y-1 cursor-pointer',
        glow !== 'none' && [
          'hover:shadow-2xl',
          glowClasses[glow],
        ],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-6 pb-0', className)}>{children}</div>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-6', className)}>{children}</div>
  );
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-6 pt-0', className)}>{children}</div>
  );
}
