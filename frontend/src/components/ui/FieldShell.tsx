// src/components/ui/FieldShell.tsx
// Shared label + hint + error layout used by Input, Textarea and Select.
import { ReactNode } from "react";
import { MdiAlertCircle } from "../icons/Icons";
import { fieldLabel } from "./styles";

interface FieldShellProps {
  /** id of the control, used to wire the <label htmlFor>. */
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  /** id used for aria-describedby on the control. */
  describedById: string;
  /** className for the outer wrapper. */
  className?: string;
  children: ReactNode;
}

export default function FieldShell({
  id,
  label,
  error,
  hint,
  describedById,
  className = "",
  children,
}: FieldShellProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className={fieldLabel}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p
          id={describedById}
          className="text-sm text-error flex items-center gap-1"
        >
          <MdiAlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={describedById} className="text-sm text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
