// src/components/ui/Toggle.tsx
"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  /** className for the outer wrapper label. */
  wrapperClassName?: string;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, id, className = "", wrapperClassName = "", disabled, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <label
        htmlFor={inputId}
        className={`
          inline-flex items-center gap-3 select-none
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${wrapperClassName}
        `}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          disabled={disabled}
          className={`sr-only peer ${className}`}
          {...props}
        />
        <span
          className="
            relative w-11 h-6 bg-border rounded-full
            transition-colors duration-200
            peer-checked:bg-success
            peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1
            after:content-[''] after:absolute after:top-0.5 after:start-[2px]
            after:bg-white after:rounded-full after:h-5 after:w-5
            after:transition-transform after:duration-200 motion-reduce:after:transition-none
            peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5
          "
        />
        {label && <span className="text-sm text-text-primary">{label}</span>}
      </label>
    );
  },
);

Toggle.displayName = "Toggle";

export default Toggle;
