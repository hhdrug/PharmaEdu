'use client';

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary-500 text-white font-medium',
    'hover:bg-primary-600 hover:shadow-sm',
    'active:bg-primary-700 active:scale-[0.98]',
    'disabled:bg-primary-100 disabled:text-text-muted disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  ].join(' '),

  secondary: [
    'bg-bg-surface text-text-primary font-medium border border-border-light',
    'hover:bg-neutral-50',
    'active:bg-neutral-100 active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  ].join(' '),

  ghost: [
    'bg-transparent text-primary-500 font-medium',
    'hover:bg-primary-50',
    'active:bg-primary-100 active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md min-h-[36px]',
  md: 'px-4 py-2.5 text-sm rounded-lg min-h-[44px]',
  lg: 'px-6 py-3 text-base rounded-lg min-h-[52px]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center gap-2',
          'transition-all duration-150',
          'outline-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading && (
          <svg
            className="w-4 h-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {loading ? '처리 중...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
