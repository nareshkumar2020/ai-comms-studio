import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, bordered = true, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-xl p-6
          bg-white dark:bg-slate-800
          ${bordered ? 'border border-slate-200 dark:border-slate-700' : ''}
          ${hoverable ? 'transition-shadow duration-200 hover:shadow-lg dark:hover:shadow-slate-900/50' : 'shadow-md dark:shadow-slate-900/30'}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

const CardHeader = ({ title, subtitle, children, className = '', ...props }: CardHeaderProps) => (
  <div className={`mb-4 border-b border-slate-200 dark:border-slate-700 pb-4 ${className}`} {...props}>
    {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>}
    {subtitle && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
    {children}
  </div>
);

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardContent = ({ children, className = '', ...props }: CardContentProps) => (
  <div className={`text-slate-700 dark:text-slate-300 ${className}`} {...props}>
    {children}
  </div>
);

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardFooter = ({ children, className = '', ...props }: CardFooterProps) => (
  <div
    className={`mt-6 flex gap-3 border-t border-slate-200 dark:border-slate-700 pt-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export { Card, CardHeader, CardContent, CardFooter };
