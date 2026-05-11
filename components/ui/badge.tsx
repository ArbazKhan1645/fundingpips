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
  info: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
  purple: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
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
