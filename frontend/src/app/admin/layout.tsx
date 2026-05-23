// src/app/(admin)/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "پنل مدیریت | نازی شاپ",
  description: "پنل مدیریت فروشگاه نازی شاپ",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
