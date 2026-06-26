// src/components/ui/PageHeader.tsx
// Canonical admin page header: title (+ optional subtitle/icon) on one side,
// an optional add/new action button (and/or arbitrary right-side nodes) on the
// other. Composes the shared Button.
import { ComponentType, ReactNode, SVGProps } from "react";
import Button from "./Button";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export interface PageHeaderAction {
  label: string;
  icon?: IconType;
  onClick: () => void;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: IconType;
  /** The primary add/new button. */
  action?: PageHeaderAction;
  /** Extra right-side content (badge, secondary action). */
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
}: PageHeaderProps) {
  return (
    <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-7 h-7 text-primary" />}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          {subtitle && <p className="text-text-secondary mt-1">{subtitle}</p>}
        </div>
      </div>

      {(action || children) && (
        <div className="flex items-center gap-3">
          {children}
          {action && (
            <Button onClick={action.onClick} icon={action.icon}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
