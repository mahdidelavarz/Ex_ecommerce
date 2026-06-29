import type { Metadata } from 'next';

// Private/user-specific route — keep out of search indexes.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
