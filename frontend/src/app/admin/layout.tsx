// src/app/admin/layout.tsx
import type { Metadata } from "next";
import AdminGuard from "./AdminGuard";

export const metadata: Metadata = {
  title: "پنل مدیریت | نازی شاپ",
  description: "پنل مدیریت فروشگاه نازی شاپ",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background">
      <AdminGuard>{children}</AdminGuard>
    </div>
  );
}
