// src/components/layout/ConditionalFooter.tsx
"use client";

import { usePathname } from "next/navigation";

export default function ConditionalFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide the footer on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <>{children}</>;
}
