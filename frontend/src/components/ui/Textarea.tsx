// src/components/ui/Textarea.tsx
"use client";

import { forwardRef, TextareaHTMLAttributes, useId } from "react";
import FieldShell from "./FieldShell";
import { fieldBase, fieldBorder } from "./styles";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** className for the outer wrapper (not the <textarea>). */
  wrapperClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, hint, id, className = "", wrapperClassName, rows = 4, ...props },
    ref,
  ) => {
    const autoId = useId();
    const textareaId = id ?? autoId;
    const describedById = `${textareaId}-desc`;

    return (
      <FieldShell
        id={textareaId}
        label={label}
        error={error}
        hint={hint}
        describedById={describedById}
        className={wrapperClassName}
      >
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? describedById : undefined}
          className={`
            ${fieldBase} ${fieldBorder(!!error)} resize-none
            ${className}
          `}
          {...props}
        />
      </FieldShell>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
