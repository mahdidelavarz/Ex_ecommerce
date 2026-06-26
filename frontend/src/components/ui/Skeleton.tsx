// src/components/ui/Skeleton.tsx
// Loading placeholder. Wraps the repeated
// `bg-surface-raised rounded animate-pulse-soft` pattern.
// For table loading rows use <TableSkeleton> from "./Table" instead.
import { CSSProperties } from "react";

export interface SkeletonProps {
  className?: string;
  /** Convenience for inline width (e.g. "60%", 120). */
  width?: string | number;
  /** Convenience for inline height (e.g. "1rem", 16). */
  height?: string | number;
  /** Render as a circle (e.g. avatars). */
  circle?: boolean;
  style?: CSSProperties;
}

export default function Skeleton({
  className = "",
  width,
  height,
  circle = false,
  style,
}: SkeletonProps) {
  return (
    <div
      className={`bg-surface-raised animate-pulse-soft ${
        circle ? "rounded-full" : "rounded"
      } ${className}`}
      style={{ width, height, ...style }}
    />
  );
}
