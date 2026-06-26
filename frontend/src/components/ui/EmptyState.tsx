// src/components/ui/EmptyState.tsx
// Generalized empty-state block (icon + title + message + optional action).
// Use outside tables — empty cart, empty orders list, empty admin lists, etc.
// For empty rows *inside* a <Table>, use <TableEmpty> from "./Table" instead.
import { ComponentType, ReactNode, SVGProps } from "react";

export interface EmptyStateProps {
  /** Optional illustrative icon, shown muted above the title. */
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  message?: string;
  /** Action area (e.g. a <Button> or <Link>), shown below the message. */
  children?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  message,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-4 py-16 ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-text-muted" />
        </div>
      )}
      <h2 className="text-xl font-bold text-text-primary mb-2">{title}</h2>
      {message && (
        <p className="text-text-secondary text-sm max-w-md">{message}</p>
      )}
      {children && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {children}
        </div>
      )}
    </div>
  );
}
