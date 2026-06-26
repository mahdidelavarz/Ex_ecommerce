// src/components/ui/RowActions.tsx
// The edit/delete icon-button cluster repeated in every admin list page.
// Output is intentionally identical to the inline markup it replaces so
// existing pages look unchanged. Each button stops click propagation so it
// works inside clickable (`hover`) rows without triggering the row's onClick.
import { ComponentType, SVGProps } from "react";

export interface RowAction {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Tooltip + accessible label. */
  title: string;
  onClick: () => void;
  /** "primary" (default) = aubergine, "error" = red. */
  variant?: "primary" | "error";
  /** When true the action is not rendered (e.g. delete disabled for a row). */
  hidden?: boolean;
  /** Disable the button (e.g. while a mutation is in flight). */
  disabled?: boolean;
}

const variantClass: Record<NonNullable<RowAction["variant"]>, string> = {
  primary: "bg-primary-light/50 hover:bg-primary-light text-primary",
  error: "bg-error-light/50 hover:bg-error-light text-error",
};

export interface RowActionsProps {
  actions: RowAction[];
  className?: string;
}

export default function RowActions({ actions, className = "" }: RowActionsProps) {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {actions
        .filter((a) => !a.hidden)
        .map((a, i) => {
          const Icon = a.icon;
          return (
            <button
              key={i}
              type="button"
              disabled={a.disabled}
              onClick={(e) => {
                e.stopPropagation();
                a.onClick();
              }}
              className={`p-2 rounded-button cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClass[a.variant ?? "primary"]}`}
              title={a.title}
              aria-label={a.title}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
    </div>
  );
}
