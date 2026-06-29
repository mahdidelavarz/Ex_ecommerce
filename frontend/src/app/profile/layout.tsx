// src/app/(profile)/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'پروفایل | نازی شاپ',
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}