'use client';

import type { HTMLAttributes } from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  label?: string;
  overlay?: boolean;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-12 h-12',
};

function Spinner({
  size = 'md',
  label = '로딩 중...',
  overlay = false,
  className = '',
  ...props
}: SpinnerProps) {
  const spinner = (
    <svg
      className={['animate-spin text-primary-500', sizeClasses[size], className]
        .filter(Boolean)
        .join(' ')}
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
  );

  if (overlay) {
    return (
      <div
        role="status"
        aria-label={label}
        className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white/80"
        {...props}
      >
        {spinner}
        <p className="mt-3 text-sm text-text-secondary">{label}</p>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={label}
      className="inline-flex items-center gap-2"
      {...props}
    >
      {spinner}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export { Spinner };
export type { SpinnerProps, SpinnerSize };
