// src/components/ui/Card.tsx
import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-card shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`px-5 py-4 border-b border-border ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardBody({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className = "", children, ...props }: CardProps) {
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
