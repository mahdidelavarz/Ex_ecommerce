// src/components/layout/AccountMenu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/theme-provider";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  MdiAccountCircle,
  MdiChevronDown,
  MdiPackageVariantClosed,
  MdiHeartOutline,
  MdiMapMarker,
  MdiViewDashboard,
  MdiWeatherSunny,
  MdiWeatherNight,
  LucideLogOut,
} from "../icons/Icons";

const menuLinks = [
  { href: "/profile", label: "پروفایل", icon: MdiAccountCircle },
  { href: "/orders", label: "سفارش‌های من", icon: MdiPackageVariantClosed },
  { href: "/wishlist", label: "علاقه‌مندی‌ها", icon: MdiHeartOutline },
  { href: "/profile/addresses", label: "آدرس‌ها", icon: MdiMapMarker },
];

export default function AccountMenu() {
  const { user, isAdmin, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // The dropdown only renders after a click (never during SSR/hydration),
  // so reading resolvedTheme here is safe without a mounted guard.
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const firstName = user?.full_name?.split(" ")[0] ?? "حساب من";

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 h-10 rounded-button text-text-secondary
          hover:bg-surface-raised hover:text-text-primary transition-colors cursor-pointer"
      >
        <MdiAccountCircle className="w-6 h-6" />
        <span className="text-sm max-w-24 truncate hidden md:inline">
          {firstName}
        </span>
        <MdiChevronDown
          className={`w-4 h-4 transition-transform duration-200 hidden md:inline ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute inset-e-0 top-full mt-2 w-56 bg-surface rounded-card shadow-modal
            border border-border p-2 z-50 animate-fade-in"
        >
          {user?.full_name && (
            <div className="px-3 py-2 mb-1 border-b border-border">
              <p className="text-sm font-bold text-text-primary truncate">
                {user.full_name}
              </p>
              {user.phone_number && (
                <p className="text-xs text-text-muted truncate" dir="ltr">
                  {user.phone_number}
                </p>
              )}
            </div>
          )}

          {menuLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-button text-sm text-text-secondary
                hover:bg-surface-raised hover:text-text-primary transition-colors"
            >
              <item.icon className="w-5 h-5 text-text-muted" />
              {item.label}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-button text-sm text-text-secondary
                hover:bg-surface-raised hover:text-text-primary transition-colors"
            >
              <MdiViewDashboard className="w-5 h-5 text-text-muted" />
              پنل مدیریت
            </Link>
          )}

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            role="menuitem"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm text-text-secondary
              hover:bg-surface-raised hover:text-text-primary transition-colors cursor-pointer"
          >
            {isDark ? (
              <MdiWeatherSunny className="w-5 h-5 text-text-muted" />
            ) : (
              <MdiWeatherNight className="w-5 h-5 text-text-muted" />
            )}
            {isDark ? "حالت روشن" : "حالت تاریک"}
          </button>

          <div className="h-px bg-border my-1" />

          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            role="menuitem"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-sm text-error
              hover:bg-error-light transition-colors cursor-pointer"
          >
            <LucideLogOut className="w-5 h-5" />
            خروج از حساب
          </button>
        </div>
      )}
    </div>
  );
}
