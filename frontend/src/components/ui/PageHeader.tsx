// src/components/ui/PageHeader.tsx
// Canonical admin page header: title (+ optional subtitle/icon) on one side,
// an optional add/new action button (and/or arbitrary right-side nodes) on the
// other. Composes the shared Button.
import { ComponentType, ReactNode, SVGProps } from "react";
import Button from "./Button";
import { MdiArrowRight } from "../icons/Icons";

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
  /** When set, renders a leading back-arrow button (for detail pages). */
  onBack?: () => void;
  /** The primary add/new button. */
  action?: PageHeaderAction;
  /** Extra right-side content (badge, secondary action). */
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  onBack,
  action,
  children,
}: PageHeaderProps) {
  return (
    <div className="shrink-0 flex flex-row items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="بازگشت"
            className="p-2 -mr-2 rounded-button text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors cursor-pointer shrink-0"
          >
            <MdiArrowRight className="w-5 h-5" />
          </button>
        )}
        {Icon && <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary shrink-0" />}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary truncate">{title}</h1>
          {subtitle && <p className="hidden sm:block text-text-secondary mt-1 truncate">{subtitle}</p>}
        </div>
      </div>

      {(action || children) && (
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
