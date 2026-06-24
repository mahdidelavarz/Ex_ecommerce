// src/components/ui/Select.tsx
"use client";

import { forwardRef, ReactNode, SelectHTMLAttributes, useId } from "react";
import { MdiChevronDown } from "../icons/Icons";
import FieldShell from "./FieldShell";
import { fieldBase, fieldBorder } from "./styles";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Convenience: render options from data. Falls back to `children` if omitted. */
  options?: SelectOption[];
  /** Optional leading placeholder rendered as a disabled-ish empty option. */
  placeholder?: string;
  children?: ReactNode;
  /** className for the outer wrapper (not the <select>). */
  wrapperClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      children,
      id,
      className = "",
      wrapperClassName,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const selectId = id ?? autoId;
    const describedById = `${selectId}-desc`;

    return (
      <FieldShell
        id={selectId}
        label={label}
        error={error}
        hint={hint}
        describedById={describedById}
        className={wrapperClassName}
      >
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || hint ? describedById : undefined}
            className={`
              ${fieldBase} ${fieldBorder(!!error)}
              appearance-none cursor-pointer pe-10
              ${className}
            `}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <span className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-text-muted">
            <MdiChevronDown className="w-5 h-5" />
          </span>
        </div>
      </FieldShell>
    );
  },
);

Select.displayName = "Select";

export default Select;
