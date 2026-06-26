// src/components/ui/PageFilters.tsx
// The standard filters panel under the page header. Children supply the inner
// grid/row of Input/Select widgets (column counts vary per page).
import { HTMLAttributes } from "react";

export interface PageFiltersProps extends HTMLAttributes<HTMLDivElement> {}

export default function PageFilters({
  className = "",
  children,
  ...props
}: PageFiltersProps) {
  return (
    <div
      className={`shrink-0 bg-surface rounded-card shadow-card p-4 mb-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
