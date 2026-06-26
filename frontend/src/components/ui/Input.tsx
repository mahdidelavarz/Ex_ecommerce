// src/components/ui/Input.tsx
"use client";

import {
  ComponentType,
  forwardRef,
  InputHTMLAttributes,
  SVGProps,
  useId,
} from "react";
import FieldShell from "./FieldShell";
import { fieldBase, fieldBorder } from "./styles";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Leading icon (placed at the start of the field). */
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Trailing icon (placed at the end of the field). */
  trailingIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  /** className for the outer wrapper (not the <input>). */
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon: Icon,
      trailingIcon: TrailingIcon,
      id,
      className = "",
      wrapperClassName,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedById = `${inputId}-desc`;

    return (
      <FieldShell
        id={inputId}
        label={label}
        error={error}
        hint={hint}
        describedById={describedById}
        className={wrapperClassName}
      >
        <div className="relative" dir={props.dir}>
          {Icon && (
            <span className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-text-muted">
              <Icon className="w-5 h-5" />
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || hint ? describedById : undefined}
            className={`
              ${fieldBase} ${fieldBorder(!!error)}
              ${Icon ? "ps-10" : ""} ${TrailingIcon ? "pe-10" : ""}
              ${className}
            `}
            {...props}
          />
          {TrailingIcon && (
            <span className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-text-muted">
              <TrailingIcon className="w-5 h-5" />
            </span>
          )}
        </div>
      </FieldShell>
    );
  },
);

Input.displayName = "Input";

export default Input;
