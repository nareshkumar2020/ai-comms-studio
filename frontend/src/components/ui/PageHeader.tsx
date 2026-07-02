import { type ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

function PageHeader({ eyebrow, title, subtitle, actions, className = '' }: PageHeaderProps) {
  return (
    <header
      className={`
        rounded-2xl border border-slate-200 dark:border-slate-700
        bg-white dark:bg-slate-800
        p-8 shadow-sm dark:shadow-slate-900/30
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}

export { PageHeader };
