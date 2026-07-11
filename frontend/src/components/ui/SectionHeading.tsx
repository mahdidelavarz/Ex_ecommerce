// src/components/ui/SectionHeading.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { MdiArrowRight } from "@/components/icons/Icons";

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  /** Small champagne kicker above the title, e.g. «پیشنهاد ویژه» */
  eyebrow?: string;
  /** "view all" link target; omit to hide the link */
  href?: string;
  linkLabel?: string;
  align?: "start" | "center";
  /** Extra controls rendered at the end side (e.g. carousel arrows) */
  actions?: ReactNode;
  /** Inverts text colors for dark/banded sections */
  onDark?: boolean;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  eyebrow,
  href,
  linkLabel = "مشاهده همه",
  align = "start",
  actions,
  onDark = false,
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";

  const heading = (
    <div className={centered ? "flex flex-col items-center text-center" : "flex flex-col gap-4"}>
      {eyebrow && (
        <p
          className={`mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.25em] ${
            onDark ? "text-secondary" : "text-secondary-hover"
          }`}
        >
          <span className="h-px w-8 bg-secondary" aria-hidden />
          {eyebrow}
          {centered && <span className="h-px w-8 bg-secondary" aria-hidden />}
        </p>
      )}
      <h2
        className={`text-2xl font-bold md:text-3xl text-nowrap ${
          onDark ? "text-white" : "text-text-primary"
        }`}
      >
        {title}
      </h2>
      {/* <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-l from-secondary to-primary" /> */}
      {subtitle && (
        <p
          className={`mt-3 text-sm leading-7 ${
            onDark ? "text-white/75" : "text-text-secondary"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  if (centered) {
    return <div className={`mb-10 ${className}`}>{heading}</div>;
  }

  return (
    <div className={`mb-8 flex items-start justify-between gap-4 ${className}`}>
      {heading}
      {(href || actions) && (
        <div className="flex shrink-0 items-center gap-2">
          {href && (
            <Link
              href={href}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                onDark
                  ? "text-secondary hover:text-white"
                  : "text-primary hover:text-primary-hover"
              }`}
            >
              <MdiArrowRight className="h-4 w-4" />
              {linkLabel}
            </Link>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}
