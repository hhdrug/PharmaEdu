'use client';

import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'standard' | 'elevated' | 'outlined';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  standard: 'bg-bg-surface border border-border-light rounded-xl shadow-sm',
  elevated: [
    'bg-bg-surface border border-border-light rounded-xl',
    'shadow-md',
    'hover:shadow-lg hover:-translate-y-0.5',
    'transition-all duration-200',
  ].join(' '),
  outlined: 'bg-transparent border-2 border-border-medium rounded-xl',
};

function Card({ variant = 'standard', children, className = '', ...props }: CardProps) {
  return (
    <div
      className={[variantClasses[variant], 'p-6', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div
      className={[
        'pb-4 mb-4 border-b border-border-light',
        'text-lg font-semibold text-text-primary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

function CardBody({ children, className = '', ...props }: CardBodyProps) {
  return (
    <div className={['py-4', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div
      className={[
        'pt-4 mt-4 border-t border-border-light',
        'flex justify-end gap-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardBody, CardFooter };
export type { CardProps, CardVariant };
