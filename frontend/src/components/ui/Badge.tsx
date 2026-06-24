// src/components/ui/Badge.tsx
import { ComponentType, HTMLAttributes, ReactNode, SVGProps } from "react";

type BadgeVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "primary"
  | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  success: "bg-success-light text-success",
  error: "bg-error-light text-error",
  warning: "bg-warning-light text-warning",
  info: "bg-info-light text-info",
  primary: "bg-primary-light text-primary",
  neutral: "bg-surface-raised text-text-secondary",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-2.5 py-1 text-sm gap-1.5",
};

export default function Badge({
  variant = "neutral",
  size = "md",
  icon: Icon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full whitespace-nowrap
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {Icon && <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />}
      {children}
    </span>
  );
}
