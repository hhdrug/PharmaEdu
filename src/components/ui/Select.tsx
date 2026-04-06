'use client';

import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      errorText,
      options,
      placeholder,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(errorText);
    const selectId = id ?? label?.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
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

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-describedby={
              hasError
                ? `${selectId}-error`
                : helperText
                ? `${selectId}-helper`
                : undefined
            }
            aria-invalid={hasError}
            className={[
              'h-10 w-full px-3 py-2 pr-8',
              'bg-bg-surface',
              'text-sm text-text-primary',
              'rounded-lg',
              'border appearance-none',
              hasError
                ? 'border-error-500 ring-2 ring-error-500/20'
                : 'border-border-light focus:border-border-focus focus:ring-2 focus:ring-primary-500/20',
              'outline-none transition-all duration-150',
              disabled
                ? 'bg-bg-panel text-text-disabled cursor-not-allowed'
                : 'cursor-pointer',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {hasError && (
          <p id={`${selectId}-error`} className="text-xs text-error-500 mt-0.5">
            {errorText}
          </p>
        )}
        {!hasError && helperText && (
          <p id={`${selectId}-helper`} className="text-xs text-text-muted mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectOption };
