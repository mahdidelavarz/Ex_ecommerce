// src/components/ui/FormSection.tsx
// Titled section card for admin forms. Replaces the ad-hoc
// `<Card className="p-6"><h2>…</h2>…</Card>` pattern with a consistent header
// (optional icon + title + muted description) and a field grid.
//
// `columns={2}` lays fields out in a responsive 2-column grid; a field can span
// the full width with `md:col-span-2` (via the field's `wrapperClassName`).
import { ComponentType, ReactNode, SVGProps } from "react";
import Card from "./Card";

export interface FormSectionProps {
  title: string;
  description?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Field grid columns. 1 (default) = single column; 2 = responsive 2-col. */
  columns?: 1 | 2;
  className?: string;
  children: ReactNode;
}

export default function FormSection({
  title,
  description,
  icon: Icon,
  columns = 1,
  className = "",
  children,
}: FormSectionProps) {
  const grid =
    columns === 2
      ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
      : "grid grid-cols-1 gap-5";

  return (
    <Card className={className}>
      <div className="flex items-start gap-3 px-5 py-4 ">
        {Icon && (
          <span className="shrink-0 grid place-items-center w-9 h-9 rounded-button bg-primary-light text-primary">
            <Icon className="w-5 h-5" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-text-primary">{title}</h2>
          {description && (
            <p className="text-sm text-text-secondary mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className={grid}>{children}</div>
      </div>
    </Card>
  );
}
