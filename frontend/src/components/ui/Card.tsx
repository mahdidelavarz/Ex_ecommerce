// src/components/ui/Card.tsx
import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual treatment:
   * - "default": flat elevated card (shadow-card).
   * - "soft": tactile raised surface (shadow-soft) — a restrained,
   *   high-contrast take on neumorphism. Best for storefront display
   *   surfaces, not dense forms/tables.
   */
  variant?: "default" | "soft";
  children: ReactNode;
}

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const cardVariants = {
  default: "bg-surface shadow-card",
  soft: "bg-surface shadow-soft",
};

function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-card ${cardVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className = "", children, ...props }: CardSectionProps) {
  return (
    <div
      className={`px-5 py-4 border-b border-border ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardBody({ className = "", children, ...props }: CardSectionProps) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className = "", children, ...props }: CardSectionProps) {
  return (
    <h3
      className={`text-lg font-semibold text-text-primary ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Title = CardTitle;

export default Card;
