import { type ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
  neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs font-medium rounded',
  md: 'px-3 py-1 text-sm font-medium rounded-md',
  lg: 'px-4 py-1.5 text-base font-medium rounded-lg',
};

function Badge({ variant = 'neutral', size = 'md', children, icon, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export { Badge };
