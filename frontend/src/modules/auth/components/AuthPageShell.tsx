"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { MdiArrowRight } from "@/components/icons/Icons";

interface AuthPageShellProps {
  children: ReactNode;
  backLabel: string;
  backHref?: string;
  onBack?: () => void;
}

function BackButton({
  label,
  href,
  onBack,
}: {
  label: string;
  href?: string;
  onBack?: () => void;
}) {
  const className =
    "inline-flex items-center gap-2 rounded-button border border-border bg-surface/80 px-4 py-2 text-sm font-medium text-text-secondary shadow-card backdrop-blur-md transition-colors hover:text-text-primary";

  if (onBack) {
    return (
      <button type="button" onClick={onBack} className={className}>
        <MdiArrowRight className="h-5 w-5" />
        {label}
      </button>
    );
  }

  return (
    <Link href={href ?? "/"} className={className}>
      <MdiArrowRight className="h-5 w-5" />
      {label}
    </Link>
  );
}

export default function AuthPageShell({
  children,
  backLabel,
  backHref = "/",
  onBack,
}: AuthPageShellProps) {
  return (
    <section className="relative h-dvh overflow-hidden bg-background">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-light/80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-secondary-light/80 blur-3xl" />

      <div className="absolute right-4 top-[calc(env(safe-area-inset-top)+1rem)] z-20 sm:right-6">
        <BackButton label={backLabel} href={backHref} onBack={onBack} />
      </div>

      <div className="relative mx-auto grid h-full max-w-6xl grid-rows-[minmax(0,1fr)] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+4.75rem)] sm:px-6 sm:pb-6 sm:pt-[calc(env(safe-area-inset-top)+5.25rem)] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] lg:items-center lg:gap-12">
        <div className="hidden max-h-full overflow-hidden lg:block">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-surface/55 p-10 shadow-card backdrop-blur-xl">
            <div className="absolute -left-16 -top-20 h-48 w-48 rounded-full bg-primary/10" />
            <div className="absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-secondary/15" />
            <div className="relative space-y-6">
              <div className="h-2 w-24 rounded-full bg-primary/30" />
              <div className="space-y-3">
                <div className="h-4 w-3/4 rounded-full bg-text-muted/20" />
                <div className="h-4 w-2/3 rounded-full bg-text-muted/20" />
                <div className="h-4 w-1/2 rounded-full bg-text-muted/20" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="h-28 rounded-2xl bg-white/45 shadow-soft" />
                <div className="h-28 rounded-2xl bg-primary-light/70 shadow-soft" />
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 w-full max-h-full max-w-md justify-self-center overflow-y-auto overscroll-contain rounded-[2rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>
    </section>
  );
}
