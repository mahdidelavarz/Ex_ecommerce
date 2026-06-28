// src/components/layout/TopBar.tsx
"use client";

import Link from "next/link";
import { MdiTruckFast, MdiPhone } from "../icons/Icons";

const quickLinks = [
  { href: "/orders", label: "پیگیری سفارش" },
  { href: "/returns", label: "مرجوعی‌ها" },
  { href: "/products", label: "راهنمای خرید" },
];

export default function TopBar() {
  return (
    <div className="hidden md:block border-b border-border bg-surface-raised/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-9 text-xs text-text-secondary">
          {/* Start: shipping / support message */}
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <MdiTruckFast className="w-4 h-4 text-secondary" />
              ارسال رایگان سفارش‌های بالای ۵۰۰ هزار تومان
            </span>
            <a
              href="tel:+982100000000"
              className="hidden lg:flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <MdiPhone className="w-4 h-4" />
              ۰۲۱-۰۰۰۰۰۰۰۰
            </a>
          </div>

          {/* End: quick links */}
          <nav className="flex items-center gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
