import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = true, icon, className = '', ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full rounded-lg border px-4 py-2.5 text-base
              text-slate-900 placeholder-slate-500
              border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400
              transition-colors duration-200
              focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20
              dark:focus:border-primary-500 dark:focus:ring-primary-400/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
              ${icon ? 'pl-10' : ''}
              ${className}
            `}
            {...props}
          />
          {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        </div>
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  rows?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = true, rows = 4, className = '', ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`
            w-full rounded-lg border px-4 py-2.5 text-base
            text-slate-900 placeholder-slate-500
            border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400
            transition-colors duration-200
            focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20
            dark:focus:border-primary-500 dark:focus:ring-primary-400/20
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };
