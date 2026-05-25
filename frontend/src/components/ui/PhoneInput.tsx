// src/components/ui/PhoneInput.tsx
'use client';

import { forwardRef } from 'react';
import { LucideSmartphone, MdiAlertCircle } from '../icons/Icons';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, error, disabled, autoFocus }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '').slice(0, 11);
      onChange(val);
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-secondary">
          شماره موبایل
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <LucideSmartphone
              className="w-5 h-5 text-text-muted"
            />
          </div>
          <input
            ref={ref}
            type="tel"
            inputMode="numeric"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            autoFocus={autoFocus}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            dir="ltr"
            className={`
              w-full pr-10 pl-4 py-3 bg-surface border rounded-input
              text-text-primary placeholder:text-text-muted
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-error focus:ring-error' : 'border-border'}
            `}
          />
        </div>
        {error && (
          <p className="text-sm text-error flex items-center gap-1">
            <MdiAlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;