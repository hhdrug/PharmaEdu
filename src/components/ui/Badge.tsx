'use client';

import type { HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-600',
  success: 'bg-success-100 text-success-500',
  warning: 'bg-warning-100 text-warning-500',
  error: 'bg-error-100 text-error-500',
  info: 'bg-info-100 text-info-500',
  neutral: 'bg-neutral-100 text-neutral-500',
};

function Badge({
  variant = 'neutral',
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center',
        'h-5 px-2',
        'rounded-full',
        'text-xs font-medium',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
