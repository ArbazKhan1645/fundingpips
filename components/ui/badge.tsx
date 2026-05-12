import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  className?: string;
}

const variantClasses = {
  default: 'bg-white/5 border-white/10 text-slate-300',
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  danger: 'bg-red-500/10 border-red-500/30 text-red-400',
  info: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  purple: 'bg-amber-600/10 border-amber-600/30 text-amber-500',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
