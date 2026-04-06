'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, errorText, id, className = '', disabled, ...props }, ref) => {
    const hasError = Boolean(errorText);
    const inputId = id ?? label?.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
            {props.required && (
              <span className="text-error-500 ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-describedby={
            hasError
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          aria-invalid={hasError}
          className={[
            'h-10 w-full px-3 py-2',
            'bg-bg-surface',
            'text-sm text-text-primary',
            'rounded-lg',
            'border',
            hasError
              ? 'border-error-500 ring-2 ring-error-500/20'
              : 'border-border-light focus:border-border-focus focus:ring-2 focus:ring-primary-500/20',
            'placeholder:text-text-muted',
            'outline-none transition-all duration-150',
            disabled
              ? 'bg-bg-panel text-text-disabled cursor-not-allowed'
              : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />

        {hasError && (
          <p id={`${inputId}-error`} className="text-xs text-error-500 mt-0.5">
            {errorText}
          </p>
        )}
        {!hasError && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-text-muted mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
