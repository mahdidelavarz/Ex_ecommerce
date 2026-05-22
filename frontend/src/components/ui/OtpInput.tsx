// src/components/ui/OtpInput.tsx
'use client';

import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function OtpInput({
  length = 4,
  value,
  onChange,
  error,
  disabled,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d?$/.test(digit)) return;

    const newValue = value.split('');
    newValue[index] = digit;
    const joined = newValue.join('').slice(0, length);
    onChange(joined);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    if (pasted.length < length) {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-secondary">
        کد تایید
      </label>
      <div className="flex gap-3 justify-center" dir="ltr">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            disabled={disabled}
            className={`
              w-14 h-16 text-center text-2xl font-bold
              bg-surface border rounded-input
              text-text-primary
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${focusedIndex === index ? 'ring-2 ring-primary border-transparent' : ''}
              ${error ? 'border-error' : 'border-border'}
            `}
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-error text-center">{error}</p>
      )}
    </div>
  );
}