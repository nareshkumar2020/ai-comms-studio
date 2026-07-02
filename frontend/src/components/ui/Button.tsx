import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed',
  secondary:
    'bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed',
  tertiary:
    'bg-transparent text-primary-600 hover:bg-primary-50 active:bg-primary-100 dark:text-primary-400 dark:hover:bg-slate-800 border border-primary-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm font-medium rounded-md',
  md: 'px-4 py-2 text-base font-medium rounded-lg',
  lg: 'px-6 py-3 text-lg font-semibold rounded-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={`
          inline-flex items-center justify-center gap-2 
          font-medium transition-all duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500
          dark:focus-visible:ring-offset-slate-900
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${fullWidth ? 'w-full' : ''}
          ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading && <Spinner size={size} />}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

function Spinner({ size }: { size: ButtonSize }) {
  const spinnerSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  return (
    <svg
      className={`${spinnerSize} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export { Button };
