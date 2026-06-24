// src/components/ui/Checkbox.tsx
"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  error?: string;
  /** className for the outer wrapper label. */
  wrapperClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, id, className = "", wrapperClassName = "", disabled, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className={`
            inline-flex items-center gap-2 select-none
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            ${wrapperClassName}
          `}
        >
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            className={`
              w-5 h-5 rounded border-border text-primary
              accent-primary cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
              disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {label && (
            <span className="text-sm text-text-primary">{label}</span>
          )}
        </label>
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
