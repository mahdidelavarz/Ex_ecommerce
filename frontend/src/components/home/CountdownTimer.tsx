// src/components/home/CountdownTimer.tsx
"use client";

import { useEffect, useState } from "react";
import { toPersianDigits } from "@/utils/toPersianDigits";

interface CountdownTimerProps {
  /** ISO date string the countdown runs to; defaults to the rolling weekly deadline */
  target?: string;
  className?: string;
}

/**
 * Rolling weekly deal deadline: next Friday 23:59 local time. Purely a
 * presentation device until a real campaign model exists on the backend.
 */
function getNextDealDeadline(): string {
  const now = new Date();
  const deadline = new Date(now);
  const day = now.getDay(); // 0 Sun … 5 Fri, 6 Sat
  const daysUntilFriday = (5 - day + 7) % 7;
  deadline.setDate(now.getDate() + daysUntilFriday);
  deadline.setHours(23, 59, 59, 0);
  if (deadline <= now) deadline.setDate(deadline.getDate() + 7);
  return deadline.toISOString();
}

function diffParts(target: string) {
  const total = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1_000) % 60),
  };
}

const UNIT_LABELS = ["روز", "ساعت", "دقیقه", "ثانیه"] as const;

export default function CountdownTimer({ target, className = "" }: CountdownTimerProps) {
  // null until mounted → SSR and first client render match (no hydration mismatch)
  const [parts, setParts] = useState<ReturnType<typeof diffParts> | null>(null);

  useEffect(() => {
    const deadline = target ?? getNextDealDeadline();
    const update = () => setParts(diffParts(deadline));
    // First tick deferred to a frame so hydration completes with the SSR markup
    const raf = requestAnimationFrame(update);
    const id = setInterval(update, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, [target]);

  const values = parts
    ? [parts.days, parts.hours, parts.minutes, parts.seconds]
    : [null, null, null, null];

  return (
    <div className={`flex items-center gap-2 ${className}`} dir="rtl" role="timer" aria-label="زمان باقی‌مانده">
      {values.map((value, i) => (
        <div key={UNIT_LABELS[i]} className="flex flex-col items-center gap-1">
          <span
            suppressHydrationWarning
            className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-lg font-bold tabular-nums text-white backdrop-blur-sm md:h-13 md:w-13 md:text-xl"
          >
            {value === null ? "--" : toPersianDigits(String(value).padStart(2, "0"))}
          </span>
          <span className="text-[10px] text-white/70">{UNIT_LABELS[i]}</span>
        </div>
      ))}
    </div>
  );
}
